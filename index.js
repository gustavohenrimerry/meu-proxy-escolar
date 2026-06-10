const http = require('http');
const httpProxy = require('http-proxy');

// Cria o servidor proxy
const proxy = httpProxy.createProxyServer({});

const PORT = process.env.PORT || 8080;

// CRUCIAL: Tratamento de erro para o proxy não travar e cair
proxy.on('error', (err, req, res) => {
  console.error('Erro no Proxy:', err.message);
  if (!res.headersSent) {
    res.writeHead(502, { 'Content-Type': 'text/plain' });
  }
  res.end('Erro ao conectar ao site de destino.');
});

const server = http.createServer((req, res) => {
  // Se a URL não começar com http (o que acontece em algumas requisições internas), evita o loop
  if (!req.url.startsWith('http')) {
    res.writeHead(400, { 'Content-Type': 'text/plain' });
    res.end('URL Invalida');
    return;
  }

  // Encaminha a requisição para o site que você quer acessar
  proxy.web(req, res, { 
    target: req.url,
    changeOrigin: true // Ajuda a camuflar o cabeçalho para o site de destino aceitar a conexão
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Proxy atualizado e rodando com sucesso na porta ${PORT}`);
});