const url = "http://127.0.0.1:8000/classificar/";



function classificar(){
let imagem = document.getElementById('imagem');

let imagem_bytes = imagem.files[0];

const response = await fetch(url, {
    method: "POST",
    body: {
        "imagem": imagem_bytes
    }
});

const text_classificacao = document.getElementById("resultado_classificacao") 

text_classificacao.textContent = JSON.stringify(response.resultado);

}

