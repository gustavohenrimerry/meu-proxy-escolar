const http = require('http');
const httpProxy = require('http-proxy');

const proxy = httpProxy.createProxyServer({});

// A Render define a porta automaticamente na variável process.env.PORT
const PORT = process.env.PORT || 8080;

const server = http.createServer((req, res) => {
  proxy.web(req, res, { target: req.url });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Proxy rodando de graça na porta ${PORT}`);
});