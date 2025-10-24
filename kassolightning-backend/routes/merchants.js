import express from "express";
import { db } from "../firebase.js";

const router = express.Router();

router.get("/count", async (req, res) => {
  try {
    // For demo purposes, return a mock count
    // In production, you would query your merchants collection
    res.json({ 
      success: true, 
      count: 35 // Demo number
    });
  } catch (error) {
    console.error('Error getting merchant count:', error);
    res.json({ 
      success: true, 
      count: 35 // Fallback to demo number
    });
  }
});

export default router;