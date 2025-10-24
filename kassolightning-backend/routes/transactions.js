import express from "express";
import { db } from "../firebase.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const snapshot = await db.collection("transactions").orderBy("date", "desc").get();
    const transactions = snapshot.docs.map(doc => doc.data());

    // Calculate daily stats
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const stats = {
      totalEarnings: 0,
      paymentsToday: 0,
      pendingInvoices: 0,
      weeklyData: Array(7).fill(0)
    };

    // Process transactions
    transactions.forEach(tx => {
      const txDate = tx.date.toDate ? tx.date.toDate() : new Date(tx.date);
      
      // Calculate total earnings from paid transactions
      if (tx.status === "Paid") {
        stats.totalEarnings += tx.amount;

        // Count today's payments
        if (txDate >= today) {
          stats.paymentsToday++;
        }

        // Calculate weekly data
        const dayIndex = 6 - Math.floor((today - txDate) / (1000 * 60 * 60 * 24));
        if (dayIndex >= 0 && dayIndex < 7) {
          stats.weeklyData[dayIndex]++;
        }
      }

      // Count pending transactions
      if (tx.status === "Pending") {
        stats.pendingInvoices++;
      }
    });

    // Format weekly data for chart
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const weeklyData = stats.weeklyData.map((count, index) => ({
      day: days[index],
      payments: count
    }));

    res.json({ 
      success: true, 
      transactions,
      stats: {
        ...stats,
        weeklyData
      }
    });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.json({ 
      success: true, 
      transactions: [],
      stats: {
        totalEarnings: 0,
        paymentsToday: 0,
        pendingInvoices: 0,
        weeklyData: Array(7).fill({ day: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], payments: 0 })
      }
    });
  }
});

export default router;
