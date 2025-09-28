// Lightweight worker health server (no external deps)
// Exposes /health and /status for docker-compose worker

const http = require('http');

const queues = {
  sync: { waiting: 0, active: 0, completed: 0, failed: 0 },
};

const server = http.createServer((req, res) => {
  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ worker: 'ok', time: new Date().toISOString() }));
    return;
  }
  if (req.url === '/status') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ worker: 'ok', queues }));
    return;
  }
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Not found' }));
});

const PORT = process.env.WORKER_PORT ? Number(process.env.WORKER_PORT) : 4000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Worker health server listening on :${PORT}`);
});