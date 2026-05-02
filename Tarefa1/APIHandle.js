const ee = require('@google/earthengine');
const express = require('express');
const { GoogleAuth } = require('google-auth-library');
const path = require('path');
const os = require('os');

const port = process.env.PORT || 3000;
const app = express(); // Criamos o app separado
app.use(express.json()); // Middleware para parsear JSON, se necessário

const adcPath = path.join(os.homedir(), 'AppData', 'Roaming', 'gcloud', 'application_default_credentials.json');

function maskedcloudsImage(image) {
    var qa = image.select('QA60');
    var cloudBitMask = 1 << 10;
    var cirrusBitMask = 1 << 11;
    var mask = qa.bitwiseAnd(cloudBitMask).eq(0)
        .and(qa.bitwiseAnd(cirrusBitMask).eq(0));
    return image.updateMask(mask).divide(10000);
}

async function initializeEE() {
    console.log('Initialzing Earth Engine API...');
    try {
        const auth = new GoogleAuth({
            keyFilename: adcPath,
            scopes: ['https://googleapis.com']
        });

        const client = await auth.getClient();
        const tokens = await client.getAccessToken();

        ee.data.setAuthToken(null, 'Bearer', tokens.token, 3600, [], () => {
            ee.initialize(null, null, () => {
                console.log('Earth Engine initialized.');
                startServer();
            }, (err) => console.error('Initialization error:', err), null, '317376484133');
        }, false);
    } catch (err) {
        console.error('Erro ao carregar credenciais locais:', err.message);
        console.log('Dica: rode "gcloud auth application-default login" novamente.');
    }
}

function startServer() {
    // ROTA  NDVI 
    app.post('/ndvi', (req, res) => { 
        const plantationCords = req.body.plantationCords; // Esperamos receber as coordenadas no corpo da requisição
        const plantation = ee.Geometry.Polygon([plantationCords]);
        const s2 = ee.ImageCollection("COPERNICUS/S2_SR_HARMONIZED");
        const hoje = new Date().toISOString().split('T')[0]; // Data atual no formato YYYY-MM-DD
        const dataInicio = req.body.dataInicio || new Date(Date.now()-10*60*60*1000).toISOString().split('T')[0]; // Se dataInicio não for fornecida, usa a data atual
         
        // pega a imagem, aplica o filtro de nuvens, calcula o NDVI e depois a média do NDVI para a plantação
        const image = s2.filterBounds(plantation)
            .filterDate(dataInicio, hoje)
            .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 50))
            .map(maskedcloudsImage)
            .median()
            .clip(plantation);

        const ndvimap = image.normalizedDifference(['B8', 'B4']);

        const ndviMean = ndvimap.reduceRegion({
            reducer: ee.Reducer.mean(),
            geometry: plantation, // Importante adicionar a geometria aqui também
            scale: 10,
            maxPixels: 1e9
        });

        ndviMean.evaluate((result, error) => {
           if(error){ console.error('ERRO NO EARTH ENGINE:', error);
            return res.status(500).json({ 
            erro: "Falha no Earth Engine", 
            detalhes: error.message || error 
        });}

            const ndviFinal = result.nd; // Guardamos o valor aqui

            const visParams = { min: 0, max: 1, palette: ['red', 'yellow', 'green'] };

            ndvimap.getMapId(visParams, (mapObj,errorMap) => {

              if (errorMap) return res.status(500).send(errorMap);
                res.json({
                    mediaNdvi: ndviFinal,
                    urlMapa: mapObj.urlFormat,
                    mapid: mapObj.mapid
                });
            });
        });
    });

    // Só ligamos o servidor APÓS a rota ser definida
    app.listen(port, () => {
        console.log(`Server listening on port ${port}`);
    });
    
}

initializeEE();
