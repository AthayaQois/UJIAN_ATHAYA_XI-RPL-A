const URL_API = "http://localhost:4000/api";

async function ambilAlat() {
    try {
        const res = await fetch(`${URL_API}/alat`);
        const data = await res.json();

        const select = document.getElementById("id_alat");
        select.innerHTML = '<option value="">-- Pilih Alat --</option>';
        data.forEach(a => {
            select.innerHTML += `<option value="${a.id_alat}">${a.nama_alat} (Stok: ${a.stok})</option>`;
        });

        const tabel = document.getElementById("tabelAlat");
        if (data.length === 0) {
            tabel.innerHTML = '<tr><td colspan="7" class="py-4 text-center text-slate-400">Belum ada data alat</td></tr>';
            return;
        }

        tabel.innerHTML = data.map(a => `
            <tr class="border-b border-slate-100">
                <td class="py-2.5 px-3 font-mono text-xs">${a.id_alat}</td>
                <td class="py-2.5 px-3 font-medium">${a.nama_alat}</td>
                <td class="py-2.5 px-3">${a.kategori || "-"}</td>
                <td class="py-2.5 px-3">${a.kondisi || "Baik"}</td>
                <td class="py-2.5 px-3">${a.lokasi || "-"}</td>
                <td class="py-2.5 px-3 text-center font-semibold">${a.stok}</td>
                <td class="py-2.5 px-3 text-center">
                    <button onclick="ubahAlat(${a.id_alat}, '${a.nama_alat}', '${a.kondisi || 'Baik'}', ${a.stok}, '${a.lokasi || ''}')" class="text-blue-600 hover:underline text-xs mr-2">Edit</button>
                    <button onclick="hapusAlat(${a.id_alat})" class="text-red-600 hover:underline text-xs">Hapus</button>
                </td>
            </tr>
        `).join("");
    } catch (err) {
        console.error("Gagal memuat alat:", err);
    }
}

async function ambilRiwayat() {
    try {
        const res = await fetch(`${URL_API}/peminjaman`);
        const data = await res.json();

        const tabel = document.getElementById("tabelRiwayat");
        if (data.length === 0) {
            tabel.innerHTML = '<tr><td colspan="7" class="py-4 text-center text-slate-400">Belum ada riwayat peminjaman</td></tr>';
            return;
        }

        tabel.innerHTML = data.map(p => {
            const tglPinjam = p.tanggal_pinjam ? p.tanggal_pinjam.split("T")[0] : "-";
            const tglKembali = p.tanggal_kembali ? p.tanggal_kembali.split("T")[0] : "-";

            return `
                <tr class="border-b border-slate-100">
                    <td class="py-2.5 px-3">
                        <div class="font-medium">${p.nama_peminjam}</div>
                    </td>
                    <td class="py-2.5 px-3">${p.nama_alat || p.id_alat}</td>
                    <td class="py-2.5 px-3">${p.jumlah}</td>
                    <td class="py-2.5 px-3 text-xs">${tglPinjam}</td>
                    <td class="py-2.5 px-3 text-xs">${tglKembali}</td>
                    <td class="py-2.5 px-3">${p.status || "Dipinjam"}</td>
                    <td class="py-2.5 px-3 text-center">
                        <button onclick="ubahPeminjaman(${p.id_peminjaman}, '${p.nama_peminjam}', '${p.kelas}', ${p.id_alat}, ${p.jumlah}, '${tglPinjam}', '${tglKembali}', '${p.status || 'Dipinjam'}')" class="text-blue-600 hover:underline text-xs mr-2">Edit</button>
                        <button onclick="hapusPeminjaman(${p.id_peminjaman})" class="text-red-600 hover:underline text-xs">Hapus</button>
                    </td>
                </tr>
            `;
        }).join("");
    } catch (err) {
        console.error("Gagal memuat riwayat:", err);
    }
}

const formPinjam = document.getElementById("formPinjam");
formPinjam.addEventListener("submit", async (e) => {
    e.preventDefault();
    const id = document.getElementById("id_peminjaman").value;

    const dataInput = {
        nama_peminjam: document.getElementById("nama_peminjam").value,
        kelas: document.getElementById("kelas").value,
        id_alat: parseInt(document.getElementById("id_alat").value),
        jumlah: parseInt(document.getElementById("jumlah").value),
        tanggal_pinjam: document.getElementById("tanggal_pinjam").value,
        tanggal_kembali: document.getElementById("tanggal_kembali").value
    };

    try {
        if (id) {
            dataInput.status = document.getElementById("status").value;
            const res = await fetch(`${URL_API}/peminjaman/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(dataInput)
            });

            if (res.ok) {
                alert("Data peminjaman berhasil diperbarui!");
                batalUbah();
            } else {
                alert("Gagal memperbarui peminjaman");
            }
        } else {
            const res = await fetch(`${URL_API}/pinjam`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(dataInput)
            });

            if (res.ok) {
                alert("Peminjaman berhasil disimpan!");
                formPinjam.reset();
            } else {
                const hasil = await res.json();
                alert(hasil.error || "Gagal menyimpan peminjaman");
            }
        }

        ambilAlat();
        ambilRiwayat();
    } catch (err) {
        console.error(err);
        alert("Gagal terhubung ke server");
    }
});

function ubahPeminjaman(id, nama, kelas, idAlat, jumlah, tglPinjam, tglKembali, status) {
    document.getElementById("id_peminjaman").value = id;
    document.getElementById("nama_peminjam").value = nama;
    document.getElementById("kelas").value = kelas;
    document.getElementById("id_alat").value = idAlat;
    document.getElementById("jumlah").value = jumlah;
    document.getElementById("tanggal_pinjam").value = tglPinjam !== "-" ? tglPinjam : "";
    document.getElementById("tanggal_kembali").value = tglKembali !== "-" ? tglKembali : "";
    document.getElementById("status").value = status;

    document.getElementById("containerStatus").style.display = "block";
    document.getElementById("btnSubmit").textContent = "Simpan Perubahan";
    document.getElementById("btnBatal").style.display = "inline-block";
    formPinjam.scrollIntoView({ behavior: "smooth" });
}

function batalUbah() {
    document.getElementById("id_peminjaman").value = "";
    formPinjam.reset();
    document.getElementById("containerStatus").style.display = "none";
    document.getElementById("btnSubmit").textContent = "Proses Peminjaman";
    document.getElementById("btnBatal").style.display = "none";
}

async function hapusPeminjaman(id) {
    if (!confirm("Apakah Anda yakin ingin menghapus data peminjaman ini?")) return;

    try {
        const res = await fetch(`${URL_API}/peminjaman/${id}`, { method: "DELETE" });
        if (res.ok) {
            alert("Data peminjaman berhasil dihapus!");
            ambilAlat();
            ambilRiwayat();
        } else {
            alert("Gagal menghapus data");
        }
    } catch (err) {
        console.error(err);
        alert("Gagal terhubung ke server");
    }
}

function ubahAlat(id, nama, kondisi, stok, lokasi) {
    document.getElementById("edit_id_alat").value = id;
    document.getElementById("edit_nama_alat").value = nama;
    document.getElementById("edit_kondisi_alat").value = kondisi;
    document.getElementById("edit_stok_alat").value = stok;
    document.getElementById("edit_lokasi_alat").value = lokasi;

    const modal = document.getElementById("modalEditAlat");
    modal.classList.remove("hidden");
    modal.classList.add("flex");
}

function tutupModalAlat() {
    const modal = document.getElementById("modalEditAlat");
    modal.classList.add("hidden");
    modal.classList.remove("flex");
}

async function simpanUbahAlat() {
    const id = document.getElementById("edit_id_alat").value;
    const dataInput = {
        nama_alat: document.getElementById("edit_nama_alat").value,
        kondisi: document.getElementById("edit_kondisi_alat").value,
        stok: parseInt(document.getElementById("edit_stok_alat").value),
        lokasi: document.getElementById("edit_lokasi_alat").value
    };

    try {
        const res = await fetch(`${URL_API}/alat/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(dataInput)
        });

        if (res.ok) {
            alert("Data alat berhasil diubah!");
            tutupModalAlat();
            ambilAlat();
        } else {
            alert("Gagal mengubah data alat");
        }
    } catch (err) {
        console.error(err);
        alert("Gagal terhubung ke server");
    }
}

async function hapusAlat(id) {
    if (!confirm("Apakah Anda yakin ingin menghapus alat ini?")) return;

    try {
        const res = await fetch(`${URL_API}/alat/${id}`, { method: "DELETE" });
        if (res.ok) {
            alert("Data alat berhasil dihapus!");
            ambilAlat();
            ambilRiwayat();
        } else {
            alert("Gagal menghapus alat (sedang dipinjam)");
        }
    } catch (err) {
        console.error(err);
        alert("Gagal terhubung ke server");
    }
}


ambilAlat();
ambilRiwayat();
