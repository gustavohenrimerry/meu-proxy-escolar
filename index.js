const http = require('http');
const httpProxy = require('http-proxy');
const net = require('net');
const { URL } = require('url');

const proxy = httpProxy.createProxyServer({});
const PORT = process.env.PORT || 8080;

// Evita que o servidor caia por erros bobos de conexão
proxy.on('error', (err, req, res) => {
  console.error('Erro no Proxy:', err.message);
  if (res && !res.headersSent && typeof res.writeHead === 'function') {
    res.writeHead(502, { 'Content-Type': 'text/plain' });
    res.end('Erro ao conectar ao destino.');
  }
});

const server = http.createServer((req, res) => {
  if (!req.url.startsWith('http')) {
    res.writeHead(400, { 'Content-Type': 'text/plain' });
    res.end('URL Invalida');
    return;
  }
  proxy.web(req, res, { target: req.url, changeOrigin: true });
});

// CRUCIAL: Este bloco lida com o método CONNECT (Essencial para sites HTTPS como TikTok/YouTube)
server.on('connect', (req, clientSocket, head) => {
  console.log(`Abrindo tunel HTTPS para: ${req.url}`);
  
  // Divide o endereço e a porta (ex: tiktok.com:443)
  const parts = req.url.split(':');
  const targetPort = parseInt(parts[1], 10) || 443;
  const targetHost = parts[0];

  // Cria uma conexão direta com o site final
  const serverSocket = net.connect(targetPort, targetHost, () => {
    clientSocket.write('HTTP/1.1 200 Connection Established\r\n\r\n');
    serverSocket.write(head);
    serverSocket.pipe(clientSocket);
    clientSocket.pipe(serverSocket);
  });

  serverSocket.on('error', (err) => {
    console.error('Erro no tunel:', err.message);
    clientSocket.end();
  });

  clientSocket.on('error', () => {
    serverSocket.end();
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor de VPN Escolar rodando na porta ${PORT}`);
});