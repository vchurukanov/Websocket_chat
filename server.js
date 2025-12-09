import { WebSocketServer } from "ws";
import http from "http";
import fs from "fs";
import path from "path";

const server = http.createServer((req, res) => {
  let filePath = path.join(process.cwd(), req.url === "/" ? "index.html" : req.url);

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end("File not found");
    } else {
      let contentType = "text/html";
      if (filePath.endsWith(".js")) contentType = "application/javascript";
      if (filePath.endsWith(".css")) contentType = "text/css";

      res.writeHead(200, { "Content-Type": contentType });
      res.end(data);
    }
  });
});

const wss = new WebSocketServer({ server });

let userCounter = 1;

function getTime() {
  const d = new Date();
  return d.toLocaleTimeString();
}

wss.on("connection", (ws) => {
  const user = `user${userCounter++}`;
  console.log(`${user} connected`);

  ws.send(JSON.stringify({ type: "status", text: `You joined as ${user}` }));

  wss.clients.forEach((client) => {
    if (client !== ws && client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({ type: "status", text: `${user} connected` }));
    }
  });

  ws.on("message", (msg) => {
    const message = { type: "message", user, text: msg.toString(), time: getTime() };
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(message));
      }
    });
  });

  ws.on("close", () => {
    console.log(`${user} disconnected`);
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({ type: "status", text: `${user} disconnected` }));
      }
    });
  });
});

server.listen(3000, () => console.log("HTTP + WebSocket server running on http://localhost:3000"));
