const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const PORT = process.env.PORT || 8080;

// Página Inicial do seu Web Proxy
app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="pt-BR">
        <head>
            <meta charset="UTF-8">
            <title>Navegador Escolar Livre</title>
            <style>
                body { font-family: Arial, sans-serif; background: #1a1a1a; color: white; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; margin: 0; }
                h1 { color: #ff5722; font-size: 32px; margin-bottom: 20px; }
                .box { background: #2a2a2a; padding: 30px; border-radius: 8px; box-shadow: 0 4px 15px rgba(0,0,0,0.5); text-align: center; }
                input { width: 350px; padding: 12px; border: none; border-radius: 4px; font-size: 16px; margin-bottom: 15px; display: block; margin-left: auto; margin-right: auto; }
                button { padding: 12px 30px; background: #ff5722; border: none; color: white; border-radius: 4px; font-size: 16px; cursor: pointer; font-weight: bold; width: 100%; }
                button:hover { background: #e0481d; }
            </style>
        </head>
        <body>
            <div class="box">
                <h1>Proxy Escolar Unblocker</h1>
                <input type="text" id="url-input" placeholder="Exemplo: google.com" required>
                <button onclick="navegar()">Acessar Site</button>
            </div>
            <script>
                function navegar() {
                    let url = document.getElementById('url-input').value.trim();
                    if (!url) return;
                    // Limpa o protocolo digitado para evitar conflitos na URL do proxy
                    url = url.replace(/^https?:\\/\\//, '');
                    window.location.href = window.location.origin + '/go/' + url;
                }
                document.getElementById('url-input').addEventListener('keypress', function(e) {
                    if (e.key === 'Enter') navegar();
                });
            </script>
        </body>
        </html>
    `);
});

// CORRIGIDO: Captura de rota dinâmica usando o caractere curinga do Express de forma nativa
app.use('/go/*', (req, res, next) => {
    // Pega tudo o que vem depois de /go/ de forma bruta
    const targetPath = req.params[0];

    if (!targetPath) {
        return res.status(400).send('Por favor, digite um site valido na pagina inicial.');
    }

    const targetUrl = 'https://' + targetPath;

    createProxyMiddleware({
        target: targetUrl,
        changeOrigin: true,
        secure: false, // Ignora erros de SSL do site de destino
        pathRewrite: (path) => {
            // Remove o prefixo /go/ para o site alvo receber a requisição limpa
            return path.replace(/^\/go\/[^\/]+/, '');
        },
        onError: (err, req, res) => {
            console.error('Erro no proxy ao acessar:', targetUrl);
            if (!res.headersSent) {
                res.status(502).send('Nao foi possivel carregar o site. Tente digitar outro link.');
            }
        }
    })(req, res, next);
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor rodando e pronto na porta ${PORT}`);
});