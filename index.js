const { execSync } = require('child_process');
const fs = require('fs');
const http = require('http');

console.log("Iniciando instalacao do Web Proxy...");

// 1. Baixa o Rammerhead Proxy se ele nao existir
if (!fs.existsSync('./rammerhead')) {
    execSync('git clone https://github.com/rammerhead-proxy/rammerhead-js.git rammerhead');
    execSync('cd rammerhead && npm install');
}

// 2. Importa e roda o servidor do Rammerhead
const rammerhead = require('./rammerhead/src/server/index.js');

const PORT = process.env.PORT || 8080;

// Configura o proxy para rodar de forma publica na porta da Render
rammerhead.createAndStartServer({
    host: '0.0.0.0',
    port: PORT,
    ssl: false,
    crossDomain: true
});

console.log(`Web Proxy online com sucesso na porta ${PORT}!`);