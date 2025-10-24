import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import { WebSocketServer } from 'ws';
import http from 'http';

const PORT = process.env.PORT || 5000;

import invoicesRouter from "./routes/invoices.js";
import transactionsRouter from "./routes/transactions.js";
import withdrawRouter from "./routes/withdraw.js";
import merchantsRouter from "./routes/merchants.js";

dotenv.config();
const app = express();

app.use(cors());
app.use(bodyParser.json());

app.use("/api/invoices", invoicesRouter);
app.use("/api/transactions", transactionsRouter);
app.use("/api/withdraw", withdrawRouter);
app.use("/api/merchants", merchantsRouter);

// Create HTTP server
const server = http.createServer(app);

// Create WebSocket server
const wss = new WebSocketServer({ 
  server,
  path: '/ws' // Specify WebSocket path
});

// Store connected clients
const clients = new Set();

// Handle WebSocket connections
wss.on('connection', (ws) => {
  console.log('New WebSocket client connected');
  clients.add(ws);

  ws.on('close', () => {
    console.log('Client disconnected');
    clients.delete(ws);
  });

  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
  });

  // Send initial connection success message
  ws.send(JSON.stringify({ type: 'CONNECTION_SUCCESS' }));
});

// WebSocket connection handler
wss.on('connection', (ws) => {
  clients.add(ws);

  ws.on('close', () => {
    clients.delete(ws);
  });
});

// Function to broadcast updates to all connected clients
export const broadcastUpdate = (update) => {
  clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(update));
    }
  });
};

// Start the server
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
