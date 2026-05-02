const API_URL = "https://script.google.com/macros/s/AKfycbzlveisnEC3w_m10KV3W-rZqXH8etpOZFbj4I79TWFEl8Gu9D2a8DB1WxyNcI731do5/exec";

let dataSiswa = [];
let prosesLoadData = null;
let penembakConfetti = null;

function tampilkanLoading(isLoading) {
  document.getElementById("loading").style.display = isLoading ? "flex" : "none";
}

async function loadData() {
  if (dataSiswa.length > 0) {
    return dataSiswa;
  }

  if (!prosesLoadData) {
    prosesLoadData = fetch(API_URL)
      .then(response => response.json())
      .then(data => {
        dataSiswa = data;
        return dataSiswa;
      })
      .catch(error => {
        prosesLoadData = null;
        throw error;
      });
  }

  return prosesLoadData;
}

function cariSiswa(nisn) {
  return dataSiswa.find(siswa => String(siswa.NISN) === String(nisn));
}

function tampilkanHasil(siswa) {
  document.getElementById("nama").innerText = siswa.Nama;
  document.getElementById("kelas").innerText = siswa.Kelas ? `Kelas: ${siswa.Kelas}` : "";
  document.getElementById("status").innerText = siswa.Status ? `Status: ${siswa.Status}` : "";
  document.getElementById("pesan").innerText = siswa.Pesan;
  document.getElementById("modal").style.display = "block";
}

function ambilPenembakConfetti() {
  if (typeof confetti !== "function") {
    return null;
  }

  if (!penembakConfetti) {
    const canvas = document.getElementById("confetti-canvas");
    penembakConfetti = confetti.create(canvas, {
      resize: true,
      useWorker: true
    });
  }

  return penembakConfetti;
}

function tembakConfettiWow() {
  const penembak = ambilPenembakConfetti();

  if (!penembak) {
    return;
  }

  penembak({
    particleCount: 220,
    spread: 120,
    startVelocity: 45,
    origin: { y: 0.6 }
  });
}

function tembakConfetti() {
  const penembak = ambilPenembakConfetti();

  if (!penembak) {
    return;
  }

  const selesai = Date.now() + 2000;
  const pengaturan = {
    particleCount: 6,
    spread: 80,
    startVelocity: 35
  };

  function frame() {
    penembak({
      ...pengaturan,
      origin: { x: 0.25, y: 0.6 }
    });

    penembak({
      ...pengaturan,
      origin: { x: 0.75, y: 0.6 }
    });

    if (Date.now() < selesai) {
      requestAnimationFrame(frame);
    }
  }

  requestAnimationFrame(frame);
}

function rayakanKelulusan(status) {
  if (String(status).trim().toUpperCase() === "LULUS") {
    if (penembakConfetti && typeof penembakConfetti.reset === "function") {
      penembakConfetti.reset();
    }

    tembakConfettiWow();
    tembakConfetti();
  }
}

async function cekKelulusan() {
  const nisn = document.getElementById("nisn").value.trim();

  if (!nisn) {
    alert("Masukkan NISN terlebih dahulu");
    return;
  }

  try {
    tampilkanLoading(true);
    await loadData();

    const siswa = cariSiswa(nisn);

    if (!siswa) {
      alert("Data tidak ditemukan");
      return;
    }

    tampilkanHasil(siswa);
    requestAnimationFrame(() => rayakanKelulusan(siswa.Status));
  } catch (error) {
    alert("Gagal memuat data. Silakan coba lagi.");
    console.error(error);
  } finally {
    tampilkanLoading(false);
  }
}

function tutupModal() {
  document.getElementById("modal").style.display = "none";
}

loadData().catch(error => console.error(error));
