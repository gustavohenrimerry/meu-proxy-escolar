const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');

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
                    url = url.replace(/^https?:\\/\\//, '');
                    window.location.href = window.location.origin + '/go?url=' + encodeURIComponent('https://' + url);
                }
                document.getElementById('url-input').addEventListener('keypress', function(e) {
                    if (e.key === 'Enter') navegar();
                });
            </script>
        </body>
        </html>
    `);
});

// O Motor do Proxy com Reescrevedor de Links
app.get('/go', async (req, res) => {
    const targetUrl = req.query.url;
    
    if (!targetUrl) {
        return res.redirect('/');
    }

    try {
        // Faz a requisição ao site original fingindo ser um navegador comum
        const response = await axios.get(targetUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            },
            responseType: 'text'
        });

        const $ = cheerio.load(response.data);
        const urlObj = new URL(targetUrl);
        const baseUrl = urlObj.origin;

        // Função mágica: Modifica os links (href e src) para continuarem passando pela Render
        $('a, link, script, img, form').each((i, el) => {
            const href = $(el).attr('href');
            const src = $(el).attr('src');
            const action = $(el).attr('action');

            if (href && !href.startsWith('javascript:') && !href.startsWith('#')) {
                const absoluteUrl = href.startsWith('http') ? href : new URL(href, baseUrl).href;
                $(el).attr('href', `/go?url=${encodeURIComponent(absoluteUrl)}`);
            }
            if (src) {
                const absoluteSrc = src.startsWith('http') ? src : new URL(src, baseUrl).href;
                $(el).attr('src', `/go?url=${encodeURIComponent(absoluteSrc)}`);
            }
            if (action) {
                const absoluteAction = action.startsWith('http') ? action : new URL(action, baseUrl).href;
                $(el).attr('action', `/go?url=${encodeURIComponent(absoluteAction)}`);
            }
        });

        res.send($.html());
    } catch (err) {
        console.error('Erro ao processar a página:', err.message);
        res.status(502).send('Não foi possível carregar este site através do proxy. Alguns sites modernos (como o Google) possuem travas rígidas de segurança que bloqueiam proxies simples.');
    }
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});