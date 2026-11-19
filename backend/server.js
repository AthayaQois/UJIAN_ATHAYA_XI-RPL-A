const express = require("express");
const cors = require("cors");
const pool = require("./db");
const app = express();
const PORT = 4000;

app.use(cors());
app.use(express.json());

app.listen(PORT, () => {
    console.log(`Server test http://localhost${PORT}`);
});

// Membuat Rute (Routing) Default
app.get("/", (req, res) => {
    res.send("Backend TokoKita Berhasil Berjalan!");
});

// test query semua di coll alat
app.get("/api/alattest", async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM peminjaman");
        res.json(result.rows);
    } catch (err) {
        console.error("err.message");
        res.status(500).json({ error: "Terjadi kesalahan pada server" });
    }
});

// test query semua di coll alat ditambah nama kategori dari k dengan nama Kategori
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

app.get("/api/peminjaman", async (req, res) => {
    try {
        const query = 'SELECT * FROM kategori_alat';
        const result = await pool.query(query);
        res.json(result.rows);
    }
    catch (error) {
        console.error(error.message);
        res.status(500).json({ error: "Gagal menemukan server" })
    }
})

app.get("/api/kategori_alat", async (req, res) => {
    try {
        const query = 'SELECT * FROM kategori_alat';
        const result = await pool.query(query);
        res.json(result.rows);
    }
    catch (error) {
        console.error(error.message);
        res.status(500).json({ error: "Gagal menemukan server" })
    }
})

// app post 
app.post("/api/pinjam", async (req, res) => {
    try {
        const {
            id_alat,
            nama_peminjam,
            kelas,
            jumlah,
            tanggal_pinjam,
            tanggal_kembali
        } = req.body || {};

        if (!id_alat || !nama_peminjam || !kelas || !jumlah || !tanggal_pinjam || !tanggal_kembali) {
            return res.status(400).json({ error: 'Data tidak lengkap, pastikan semua input terisi! Data meliputi {  "id_alat": 1,  "nama_peminjam": "Athaya",  "kelas": "XI RPL A",  "jumlah": 1,  "tanggal_pinjam": "2026-11-18",  "tanggal_kembali": "2026-11-20"}'});
                }

        const query = `
            INSERT INTO peminjaman (id_alat, nama_peminjam, kelas, jumlah, tanggal_pinjam, tanggal_kembali)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *;
        `;

        const values = [id_alat, nama_peminjam, kelas, jumlah, tanggal_pinjam, tanggal_kembali];
        const result = await pool.query(query, values);

        res.status(201).json({
            message: "Peminjaman berhasil disimpan!",
            data: result.rows[0]
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: err.message || "Gagal memproses peminjaman" });
    }
});


app.post("/api/tmbhalat", async (req, res) => {
    try {
        const { id_kategori, nama_alat, kondisi, stok, lokasi } = req.body || {};

        if (!id_kategori || !nama_alat || !stok) {
            return res.status(400).json({ error: "id_kategori, nama_alat, dan stok wajib diisi!" });
        }

        const query = `
            INSERT INTO alat (id_kategori, nama_alat, kondisi, stok, lokasi)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *;
        `;
        const values = [id_kategori, nama_alat, kondisi || 'Baik', stok, lokasi || null];
        const result = await pool.query(query, values);

        res.status(201).json({
            message: "Data alat berhasil ditambahkan!",
            data: result.rows[0]
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: err.message || "Gagal menambah data" });
    }
});


app.post("/api/tmbhkategori_alat", async (req, res) => {
    try {
        const { nama_kategori, deskripsi } = req.body || {};

        if (!nama_kategori) {
            return res.status(400).json({ error: "nama_kategori wajib diisi!" });
        }

        const query = `
            INSERT INTO kategori_alat (nama_kategori, deskripsi)
            VALUES ($1, $2)
            RETURNING *;
        `;
        const values = [nama_kategori, deskripsi || null];
        const result = await pool.query(query, values);

        res.status(201).json({
            message: "Kategori alat berhasil ditambahkan!",
            data: result.rows[0]
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: err.message || "Gagal menambah data" });
    }
});

// app delete
app.delete("/api/peminjaman/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const k = `delete from peminjaman where id_peminjaman = $1 returning *  `;
        const result = await pool.query(k, [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: "data tidak ditemukan" });
        }
        res.status(201).json({
            message: "Penghapusan berhasil disimpan!",
            data: result.rows
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Kesalahan saat menghapus" });
    }
});


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

// slug(id misal /api/peminjaman/1 ambil semua di id 1)
app.get("/api/peminjaman/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const query = `
        SELECT 
        p.*
        from peminjaman p
        left join alat a on a.id_alat = p.id_alat
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

// slug(id misal /api/kategori_alat/1 ambil semua di id 1)
app.get("/api/kategori_alat/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const query = `
        SELECT 
        k.*
        from kategori_alat k
        left join kategori_alat a on k.id_kategori = a.id_kategori
        where k.id_kategori = $1
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

