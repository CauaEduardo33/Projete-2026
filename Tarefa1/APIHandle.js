const ee = require('@google/earthengine');
const express = require('express');
const privateKey = require('./credentials.json');
const port = process.env.PORT || 3000;

const app = express(); // Criamos o app separado
app.use(express.json()); // Middleware para parsear JSON, se necessário



function maskedcloudsImage(image) {
    var qa = image.select('QA60');
    var cloudBitMask = 1 << 10;
    var cirrusBitMask = 1 << 11;
    var mask = qa.bitwiseAnd(cloudBitMask).eq(0)
        .and(qa.bitwiseAnd(cirrusBitMask).eq(0));
    return image.updateMask(mask).divide(10000);
}

console.log('Authenticating Earth Engine API...');

ee.data.authenticateViaPrivateKey(privateKey, () => {
    ee.initialize(null, null, () => {
        console.log('Earth Engine initialized.');

        

        // ROTA  NDVI 
        app.post('/ndvi', (req, res) => { 
            const plantationCords = req.body.plantationCords; // Esperamos receber as coordenadas no corpo da requisição
            const plantation = ee.Geometry.Polygon([plantationCords]);
            const s2 = ee.ImageCollection("COPERNICUS/S2_SR_HARMONIZED");

            const image = s2.filterBounds(plantation)
                .filterDate("2024-05-01", "2026-01-01")
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
                if (error) return res.status(500).send(error);

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

    }, (err) => console.error('Initialization error:', err));
}, (err) => console.error('Authentication error:', err));