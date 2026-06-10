const express = require('express');
const { createServer } = require('http');
const createBareServer = require('@tomphttp/bare-server-node');

const app = express();
const server = createServer();
const bareServer = createBareServer('/bare/');

const PORT = process.env.PORT || 8080;

// Página Inicial com um navegador embutido funcional (via iframe camuflado)
app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="pt-BR">
        <head>
            <meta charset="UTF-8">
            <title>Navegador Escolar</title>
            <style>
                html, body { margin: 0; padding: 0; width: 100%; height: 100%; background: #111; font-family: Arial, sans-serif; overflow: hidden; }
                .nav-bar { background: #222; padding: 10px; display: flex; gap: 10px; align-items: center; box-shadow: 0 2px 10px rgba(0,0,0,0.5); }
                input { flex: 1; padding: 10px; border: none; border-radius: 4px; background: #333; color: white; font-size: 14px; }
                button { padding: 10px 20px; background: #ff5722; color: white; border: none; border-radius: 4px; font-weight: bold; cursor: pointer; }
                button:hover { background: #e0481d; }
                iframe { width: 100%; height: calc(100% - 55px); border: none; background: white; }
            </style>
        </head>
        <body>
            <div class="nav-bar">
                <input type="text" id="url" placeholder="Digite o site (ex: tiktok.com ou google.com)" value="https://www.tiktok.com">
                <button onclick="carregar()">Navegar</button>
            </div>
            <iframe id="navegador" src="about:blank"></iframe>

            <script>
                function carregar() {
                    let url = document.getElementById('url').value.trim();
                    if (!url) return;
                    if (!url.startsWith('http://') && !url.startsWith('https://')) {
                        url = 'https://' + url;
                    }
                    // Usa um decodificador público de Ultraviolet/Bare para renderizar o site de forma limpa
                    document.getElementById('navegador').src = "https://nullproxy.com/proxy?url=" + encodeURIComponent(url);
                }
                // Carrega o TikTok automaticamente ao abrir
                window.onload = carregar;
            </script>
        </body>
        </html>
    `);
});

// Vincula o servidor Express e o Bare Server juntos
server.on('request', (req, res) => {
    if (bareServer.shouldRoute(req)) {
        bareServer.route(req, res);
    } else {
        app(req, res);
    }
});

server.on('upgrade', (req, socket, head) => {
    if (bareServer.shouldRoute(req)) {
        bareServer.routeUpgrade(req, socket, head);
    } else {
        socket.end();
    }
});

server.listen(PORT, '0.0.0.0', () => {
    console.log(`Proxy profissional rodando na porta ${PORT}`);
});