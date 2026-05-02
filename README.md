# Projete-2026

Aqui está o guia completo para quem vai receber e rodar os códigos presentes em Tarefa1:

---

## 1. Instalações Necessárias
A pessoa deve instalar o **Node.js** e o **Google Cloud CLI (gcloud)**. Após isso, no terminal, dentro da pasta do projeto, ela deve rodar o comando para instalar as bibliotecas:

```cmd
npm init -y
npm install 
```

## 2. Autenticação do Google Earth Engine
Como o `APIHandle.js` usa o Earth Engine, a pessoa precisa autorizar a máquina dela:

1.  No CMD, digite: `gcloud auth application-default login`
2.  Faça login com a conta Google que tem acesso ao Earth Engine.
3.  **Ajuste no Código:** A pessoa deve abrir o `APIHandle.js` e substituir o ID `'317376484133'` pelo ID do projeto Google Cloud dela.

---

## 3. Como chamar o `Clima.js`
Este arquivo exporta uma função assíncrona. Para usá-lo, o desenvolvedor deve importá-lo em outro arquivo (ex: `main.js`).

**Como deve ser feito:**
A chamada exige **Latitude**, **Longitude** e uma **Data de Início**. Como a função é assíncrona, deve-se usar `await`.

```javascript
// Exemplo de chamada no arquivo de quem vai usar seu código
import { obterDadosCafe } from './Clima.js';

async function testarClima() {
    try {
        const dados = await obterDadosCafe(-23.5489, -46.6388, '2026-04-01');
        console.log("Dados recebidos:", dados);
    } catch (erro) {
        console.error("Erro ao buscar clima:", erro);
    }
}

testarClima();
```

---

## 4. Como chamar o `APIHandle.js`
Diferente do Clima, o `APIHandle.js` inicia um **servidor Express**. A "chamada" aqui não é feita via importação de função, mas sim via requisição HTTP (API).

**Como deve ser feito:**
O desenvolvedor deve rodar o servidor e, de outro código ou ferramenta, fazer um disparo para a rota `/ndvi`.

1.  **Rodar o servidor:** No terminal, use `node APIHandle.js`.
2.  **Exemplo de chamada via código (usando fetch):**

```javascript
// Exemplo de como outro código "conversa" com o seu APIHandle
const resposta = await fetch('http://localhost:3000/ndvi', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        plantationCords: [
            [-48.5, -22.5], [-48.4, -22.5], [-48.4, -22.6], [-48.5, -22.6], [-48.5, -22.5]
        ],
        dataInicio: '2026-01-01'
    })
});

const resultado = await resposta.json();
console.log("URL do Mapa NDVI:", resultado.urlMapa);
```

---

## Resumo de execução para o usuário:
* **Clima.js:** É importado como função (`import { ... }`).
* **APIHandle.js:** É executado como um serviço (`node APIHandle.js`) e recebe dados via JSON através da porta 3000.

