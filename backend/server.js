const express = require("express");
const cors = require("cors");
const pool = require("./db");

const app = express();
app.use(cors());
app.use(express.json());

// Membuat Rute (Routing) Default
app.get("/", (req, res) => {
    res.send("Backend TokoKita Berhasil Berjalan!");
});

// test query semua di coll alat
app.get("/api/alattest", async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM alat");
        res.json(result.rows);
    } catch (err) {
        console.error("err.message");
        res.status(500).json({ error: "Terjadi kesalahan pada server" });
    }
});

app.get("/api/alat", async (req, res) => {
    try {
        const alatq = `
        SELECT
        a.id_alat,
        k.id_kategori,
        k.nama_kategori AS Kategori,
        a.nama_alat,
        a.kondisi,
        a.stok,
        a.lokasi

        from alat a
        left join kategori_alat k on a.id_kategori = k.id_kategori
        `;
        const result = await pool.query(alatq);
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Kesalahan memuat database" });
    }
});


app.post

// slug(id misal /api/alat/1 ambil semua di id 1)
app.get("/api/alat/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const query = `
        SELECT 
        a.*,
        k.nama_kategori AS Kategori
        from alat a
        left join kategori_alat k on a.id_kategori = k.id_kategori
        where a.id_alat = $1
        `;

        const result = await pool.query(query, [id]);
        // Jika data tidak ditemukan, kembalikan error 404
        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Produk tidak ditemukan" });
        }
        // Jika berhasil, kirim HANYA BARIS PERTAMA (Single Object), bukan Array!
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Server Error saat memuat detail produk" });
    }
});

const PORT = 4000;
app.listen(PORT, () => {
    console.log(`Server test http://localhost${PORT}`);
});
