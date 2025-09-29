import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Fix untuk __dirname di ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve static files dari folder frontend
app.use(express.static(path.join(__dirname, "../frontend")));

// API endpoint
app.get("/cek-nilai", async (req, res) => {
  const { regu, niu } = req.query;
  if (!regu || !niu) {
    return res.status(400).json({ error: "Regu dan NIU harus diisi" });
  }

  try {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${process.env.SPREADSHEET_ID}/values/${regu}!B13:M?key=${process.env.API_KEY}`;
    const response = await fetch(url);
    const data = await response.json();

    if (!data.values) return res.json({ error: `Data tidak ditemukan di ${regu}` });

    const rows = data.values;
    const row = rows.find(r => r[0] === niu);

    if (!row) return res.json({ error: `NIU tidak ditemukan di ${regu}` });

    const nilai = Array.isArray(row.slice(2)) ? row.slice(2) : [];
    
    res.json({ 
      regu, 
      niu, 
      nama: row[1] || "(Tanpa Nama)", 
      nilai: nilai 
    });
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ error: "Gagal ambil data" });
  }
});

// Handle semua route lainnya untuk SPA
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/index.html"));
});

// Export app untuk Vercel
export default app;