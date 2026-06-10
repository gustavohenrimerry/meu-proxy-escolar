const http = require('http');
const { createServer } = require('http');
const { join } = require('path');
const Corrosion = require('corrosion');

// Configura o Proxy Corrosion
const proxy = new Corrosion({
    prefix: '/search/', // O prefixo que vai aparecer na URL dos sites
    codec: 'xor',       // Criptografia básica para a escola não ver o link do site
    title: 'Navegador Escolar'
});

const PORT = process.env.PORT || 8080;

const server = createServer((req, res) => {
    // Se a pessoa tentar acessar a raiz, joga a página de busca do proxy
    if (req.url === '/' || req.url === '/index.html') {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(`
            <!DOCTYPE html>
            <html lang="pt-BR">
            <head>
                <meta charset="UTF-8">
                <title>Web Proxy Escolar</title>
                <style>
                    body { font-family: Arial, sans-serif; background: #121212; color: white; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; margin: 0; }
                    h1 { color: #00adb5; font-size: 32px; margin-bottom: 20px; }
                    input { width: 400px; padding: 12px; border: none; border-radius: 4px; font-size: 16px; margin-right: 10px; }
                    button { padding: 12px 24px; background: #00adb5; border: none; color: white; border-radius: 4px; font-size: 16px; cursor: pointer; font-weight: bold; }
                    button:hover { background: #007a80; }
                </style>
            </head>
            <body>
                <h1>Web Proxy Unblocker</h1>
                <form id="proxy-form">
                    <input type="text" id="url-input" placeholder="Digite o site (ex: tiktok.com ou google.com)" required>
                    <button type="submit">Navegar</button>
                </form>
                <script>
                    document.getElementById('proxy-form').addEventListener('submit', (e) => {
                        e.preventDefault();
                        let url = document.getElementById('url-input').value;
                        if (!url.startsWith('http://') && !url.startsWith('https://')) {
                            url = 'https://' + url;
                        }
                        window.location.href = window.location.origin + '/search/' + btoa(url);
                    });
                </script>
            </body>
            </html>
        `);
        return;
    }

    // Deixa o Corrosion processar todo o resto das requisições
    proxy.request(req, res);
});

// Configura o upgrade de protocolo para rodar WebSockets (importante para o TikTok/YouTube rodar vídeos)
server.on('upgrade', (req, socket, head) => {
    proxy.upgrade(req, socket, head);
});

server.listen(PORT, '0.0.0.0', () => {
    console.log(`Corrosion Proxy rodando perfeitamente na porta ${PORT}`);
});