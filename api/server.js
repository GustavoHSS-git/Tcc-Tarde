const http = require('http');
const url = require('url');

const port = 3000;

// Simulação de banco de dados com array
let users = [];
let nextId = 1;

console.log('Banco de dados simulado conectado.');

// Criar servidor
const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  const method = req.method;

  res.setHeader('Content-Type', 'application/json');

  if (method === 'GET' && pathname === '/') {
    res.end(JSON.stringify({ message: 'Servidor funcionando!' }));
  } else if (method === 'GET' && pathname === '/users') {
    res.end(JSON.stringify({ users }));
  } else if (method === 'POST' && pathname === '/users') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        const { name, email } = JSON.parse(body);
        const user = { id: nextId++, name, email };
        users.push(user);
        res.end(JSON.stringify({ id: user.id }));
      } catch (err) {
        res.statusCode = 400;
        res.end(JSON.stringify({ error: err.message }));
      }
    });
  } else {
    res.statusCode = 404;
    res.end(JSON.stringify({ error: 'Rota não encontrada' }));
  }
});

server.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});