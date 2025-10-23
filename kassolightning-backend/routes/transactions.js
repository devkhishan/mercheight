import express from "express";
import { db } from "../firebase.js";

const router = express.Router();

router.get("/", async (req, res) => {
  const snapshot = await db.collection("transactions").orderBy("date", "desc").get();
  const transactions = snapshot.docs.map(doc => doc.data());
  res.json({ success: true, transactions });
});

export default router;
