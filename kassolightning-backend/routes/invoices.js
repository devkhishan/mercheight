import express from "express";
import { db } from "../firebase.js";
import crypto from 'crypto';

const router = express.Router();

// Get all invoices
router.get("/", async (req, res) => {
  try {
    const invoicesSnapshot = await db.collection('invoices').orderBy('createdAt', 'desc').get();
    const invoices = [];
    
    invoicesSnapshot.forEach(doc => {
      invoices.push(doc.data());
    });

    return res.status(200).json({
      success: true,
      invoices: invoices
    });
  } catch (error) {
    console.error('Error fetching invoices:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch invoices'
    });
  }
});

// Mock function to generate fake Lightning invoice
const generateMockInvoice = (amount, memo) => {
  const id = crypto.randomBytes(32).toString('hex');
  // Create a fake bolt11 invoice format for testing
  const bolt11 = `lntb${amount}n1${crypto.randomBytes(32).toString('hex')}`;
  
  return {
    id,
    request: bolt11,
    description: memo,
    tokens: amount
  };
};

// Create Lightning Invoice
router.post("/create", async (req, res) => {
  const { amount, memo } = req.body;
  
  // Validate input
  if (!amount || isNaN(amount) || amount <= 0) {
    return res.status(400).json({
      success: false,
      error: 'Invalid amount provided'
    });
  }

  try {
    console.log('Creating mock invoice with amount:', amount, 'memo:', memo);
    
    // Create mock Lightning invoice
    const invoice = generateMockInvoice(parseInt(amount), memo || "KassoLightning");
    
    console.log('Mock invoice created successfully:', invoice.id);

    // Prepare invoice data
    const invoiceData = {
      id: invoice.id,
      amount: parseInt(amount),
      memo: memo || "KassoLightning",
      bolt11: invoice.request,
      paid: false,
      createdAt: new Date().toISOString()
    };

    // Store invoice in Firebase
    await db.collection('invoices').doc(invoice.id).set(invoiceData);

    // Return the created invoice
    return res.status(200).json({
      success: true,
      invoice: invoiceData
    });

    // Save to Firebase
    try {
      await db.collection("invoices").doc(invoice.id).set(invoiceData);
      console.log('Invoice saved to Firebase:', invoice.id);
    } catch (dbErr) {
      console.error('Firebase error:', dbErr);
      // We'll return success even if Firebase fails, for testing purposes
    }

    res.json({ 
      success: true, 
      invoice: {
        ...invoiceData,
        request: invoice.request
      }
    });
  } catch (err) {
    console.error('Invoice creation error:', err);
    res.status(500).json({ 
      success: false, 
      error: err.message
    });
  }
});

// Get all invoices
router.get("/", async (req, res) => {
  try {
    const snapshot = await db.collection("invoices").orderBy("createdAt", "desc").get();
    const invoices = snapshot.docs.map(doc => doc.data());
    res.json({ success: true, invoices });
  } catch (err) {
    console.error('Error fetching invoices:', err);
    // Return empty array if Firebase fails, for testing purposes
    res.json({ success: true, invoices: [] });
  }
});

export default router;
