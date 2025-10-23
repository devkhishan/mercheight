import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import dotenv from "dotenv";

import invoicesRouter from "./routes/invoices.js";
import transactionsRouter from "./routes/transactions.js";
import withdrawRouter from "./routes/withdraw.js";

dotenv.config();
const app = express();

app.use(cors());
app.use(bodyParser.json());

app.use("/api/invoices", invoicesRouter);
app.use("/api/transactions", transactionsRouter);
app.use("/api/withdraw", withdrawRouter);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
