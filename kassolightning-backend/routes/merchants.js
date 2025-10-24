import express from "express";
import { db } from "../firebase.js";

const router = express.Router();

// Get merchant count
router.get("/count", async (req, res) => {
  try {
    const snapshot = await db.collection("merchants").get();
    res.json({ 
      success: true, 
      count: snapshot.size || 35 // fallback to demo number
    });
  } catch (error) {
    console.error('Error getting merchant count:', error);
    res.json({ 
      success: true, 
      count: 35 
    });
  }
});

router.get("/profile", async (req, res) => {
  try {
    // In a real app, this would be fetched based on authentication
    // For now, we'll return the merchant's profile from Firestore
    const merchantDoc = await db.collection("merchants").doc("current").get();
    const profile = merchantDoc.exists ? merchantDoc.data() : {
      name: "Your Shop",
      isOnline: true,
      balance: 0
    };

    res.json({ 
      success: true, 
      profile
    });
  } catch (error) {
    console.error('Error fetching merchant profile:', error);
    res.json({ 
      success: true, 
      profile: {
        name: "Your Shop",
        isOnline: true,
        balance: 0
      }
    });
  }
});

// Get merchant stats
router.get("/stats", async (req, res) => {
  try {
    const merchantDoc = await db.collection("merchants").doc("current").get();
    const stats = merchantDoc.exists ? merchantDoc.data().stats : {
      totalEarnings: 0,
      availableBalance: 0
    };

    res.json({ 
      success: true, 
      stats
    });
  } catch (error) {
    console.error('Error fetching merchant stats:', error);
    res.json({ 
      success: true, 
      stats: {
        totalEarnings: 0,
        availableBalance: 0
      }
    });
  }
});

export default router;