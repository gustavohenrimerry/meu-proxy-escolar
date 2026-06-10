const express = require('express');
const http = require('http');
const Corrosion = require('corrosion');

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 8080;

// Inicializa o motor do proxy no caminho /search/
const proxy = new Corrosion({
    prefix: '/search/',
    codec: 'xor' // Camufla a URL para passar pelo filtro da escola
});

// Página Inicial do seu Servidor
app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="pt-BR">
        <head>
            <meta charset="UTF-8">
            <title>Navegador Livre Escolar</title>
            <style>
                body { font-family: Arial, sans-serif; background: #111; color: white; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; margin: 0; }
                .box { background: #222; padding: 40px; border-radius: 8px; box-shadow: 0 4px 15px rgba(0,0,0,0.5); text-align: center; }
                h1 { color: #ff5722; margin-bottom: 20px; font-size: 28px; }
                input { width: 320px; padding: 12px; border: none; border-radius: 4px; font-size: 16px; background: #333; color: white; margin-right: 10px; }
                button { padding: 12px 24px; background: #ff5722; border: none; color: white; border-radius: 4px; font-size: 16px; cursor: pointer; font-weight: bold; }
                button:hover { background: #e0481d; }
            </style>
        </head>
        <body>
            <div class="box">
                <h1>Proxy Escolar 100% Online</h1>
                <input type="text" id="url" placeholder="Digite o site (ex: tiktok.com)">
                <button onclick="navegar()">Entrar</button>
            </div>
            <script>
                function navegar() {
                    let url = document.getElementById('url').value.trim();
                    if (!url) return;
                    if (!url.startsWith('http://') && !url.startsWith('https://')) {
                        url = 'https://' + url;
                    }
                    // Transforma a URL em um link camuflado que o seu servidor entende
                    window.location.href = window.location.origin + '/search/' + btoa(url);
                }
                document.getElementById('url').addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') navegar();
                });
            </script>
        </body>
        </html>
    `);
});

// Faz o Express passar todas as requisições de sites para o motor do proxy
app.use((req, res) => {
    proxy.request(req, res);
});

// Ativa suporte a vídeos e recursos pesados (WebSockets)
server.on('upgrade', (req, socket, head) => {
    proxy.upgrade(req, socket, head);
});

server.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});