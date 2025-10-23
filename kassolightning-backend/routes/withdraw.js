import express from "express";
import { db } from "../firebase.js";
import { pay } from "ln-service";
import { authenticatedLndGrpc } from "ln-service";

const router = express.Router();

const { lnd } = authenticatedLndGrpc({
  cert: process.env.LND_TLS_CERT,
  macaroon: process.env.LND_MACAROON,
  socket: process.env.LND_GRPC_HOST
});

router.post("/", async (req, res) => {
  const { bolt11 } = req.body;

  try {
    const payment = await pay({ lnd, request: bolt11 });
    
    // Save to Firebase
    await db.collection("transactions").add({
      id: payment.id,
      amount: payment.tokens,
      status: "Paid",
      date: new Date(),
      invoice: bolt11
    });

    res.json({ success: true, payment });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
