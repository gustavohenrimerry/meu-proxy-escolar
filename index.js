const express = require('express');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 8080;

// Página Inicial do seu Proxy
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
                    // Remove protocolos digitados para evitar duplicação
                    url = url.replace(/^https?:\\/\\//, '');
                    // Envia para a rota de navegação
                    window.location.href = window.location.origin + '/browse/' + url;
                }
                document.getElementById('url').addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') navegar();
                });
            </script>
        </body>
        </html>
    `);
});

// Rota de Navegação Nativa: Carrega o site solicitado diretamente
app.get('/browse/:target*', async (req, res) => {
    const targetSite = req.params.target + (req.params[0] || '');
    
    if (!targetSite) {
        return res.redirect('/');
    }

    const targetUrl = 'https://' + targetSite;

    try {
        // Descarrega o site simulando um navegador comum para evitar bloqueios
        const response = await axios.get(targetUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            },
            responseType: 'text',
            validateStatus: () => true // Evita que erros 403/404 quebrem o servidor Node
        });

        // Altera o tipo de conteúdo para o navegador ler corretamente (HTML)
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.send(response.data);

    } catch (err) {
        console.error('Erro na ligação:', err.message);
        res.status(502).send('Não foi possível estabelecer ligação com o site através do proxy.');
    }
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor a rodar na porta ${PORT}`);
});