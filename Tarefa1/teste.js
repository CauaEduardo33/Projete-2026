const axios = require('axios');

console.log('1. Script começou...');

const dataToSend = {
plantationCords: [
      [-45.74539479834294,-22.36486843537137],
 [-45.744858356539964,-22.365076793180002],
 [-45.74492272955632,-22.36555303842905],
 [-45.74464377981877,-22.365860612620057],
 [-45.742819877688646,-22.364957731613238],
 [-45.74329194647527,-22.363519062968283],
 [-45.74519095045781,-22.36317179589618],
 [-45.74539479834294,-22.36486843537137]// Ponto A (FECHA O POLÍGONO)
    ],
    dataInicio: "2024-05-01"
};

async function sendRequest() {
    console.log('2. Dentro da função...');
    try {
        const response = await axios.post('http://localhost:3000/ndvi', dataToSend);
        console.log('3. Resposta recebida:', response.data);
    } catch (error) {
        console.log('3. Erro detectado:', error.message);
    }
}

console.log('4. Chamando a função...');
sendRequest().then(() => console.log('5. Fim do fluxo.'));
