# 🚢 Sui Move Smart Contract Deployment Guide

Dokumen ini menjelaskan cara mengompilasi, menguji, dan mendeploy smart contract **Axis Predict** (`sc/defai_agent`) di jaringan **Sui Testnet** menggunakan **Sui CLI**.

---

## 🛠️ Prasyarat
Pastikan Anda sudah menginstal **Sui CLI** (versi aktif Anda: `1.61.2`) dan memiliki akun dompet aktif dengan saldo testnet SUI untuk biaya gas.

```bash
# Cek akun aktif Anda
sui client active-address

# Cek saldo gas SUI
sui client gas
```

---

## 📦 Kompilasi & Pengujian

Masuk ke direktori smart contract:
```bash
cd sc/defai_agent
```

### 1. Build Smart Contract
Jalankan kompilasi untuk memastikan kode terkompilasi dengan sempurna:
```bash
sui move build
```
*(Perintah ini akan mengunduh dependensi framework Sui secara otomatis dan melakukan kompilasi terhadap modul `predict`, `pusdc`, dan `axis_vault`)*.

### 2. Test Smart Contract (Opsional)
Jalankan unit testing jika Anda ingin memverifikasi kode:
```bash
sui move test
```

---

## 🚀 Pendeployan ke Sui Testnet

Jalankan perintah berikut untuk memublikasikan smart contract ke jaringan Sui Testnet:

```bash
sui client publish --gas-budget 50000000
```

### 📝 Membaca Output Deployment
Setelah deploy berhasil, simpan informasi penting dari log output di terminal:

1.  **Package ID:** Temukan baris `Published Objects` -> `Package ID`. Ini adalah alamat smart contract Anda (misalnya: `0xabcd1234...`).
2.  **AdminCap ID:** Temukan ID objek bertipe `<PACKAGE_ID>::axis_vault::AdminCap`. Objek ini dikirim ke alamat wallet pendeploy Anda dan diperlukan untuk inisialisasi vault & pengeluaran izin agen.

---

## ⚙️ Inisialisasi Vault & AgentCap

Setelah deploy, Anda harus menjalankan transaksi inisialisasi menggunakan objek `AdminCap` untuk membuat brankas utama dan mendaftarkan Agent backend Anda:

### 1. Buat Vault Utama
Gunakan perintah `sui client call` untuk memanggil fungsi `create_vault` dengan argumen `AdminCap` dan `TreasuryCap<PUSDC>` (dibuat secara otomatis saat publikasi):

```bash
sui client call \
  --package <PACKAGE_ID> \
  --module axis_vault \
  --function create_vault \
  --args <ADMIN_CAP_OBJECT_ID> <TREASURY_CAP_PUSDC_OBJECT_ID> \
  --type-args 0xf5ea2b3749c65d6e56507cc35388719aadb28f9cab873696a2f8687f5c785138::dusdc::DUSDC \
  --gas-budget 10000000
```
*(Argumen `--type-args` menetapkan koin jaminan Vault menggunakan **dUSDC Testnet** resmi milik Mysten Labs).*

Simpan **Vault Object ID** yang dihasilkan dari shared object di transaksi ini (tipe: `Vault<0xf5ea...::DUSDC>`).

### 2. Terbitkan AgentCap untuk Backend
Terbitkan objek `AgentCap` untuk dipegang oleh dompet AI Agent Backend Anda:

```bash
sui client call \
  --package <PACKAGE_ID> \
  --module axis_vault \
  --function issue_agent_cap \
  --args <ADMIN_CAP_OBJECT_ID> \
  --gas-budget 10000000
```
Kirimkan objek **AgentCap ID** hasil transaksi ini ke alamat wallet milik AI Agent backend Anda.

---

## 🔌 Konfigurasi Environment (.env)

Salin berkas `apps/backend/.env.example` ke `apps/backend/.env` dan lengkapi datanya berdasarkan ID objek yang Anda dapatkan di atas:

```env
# SUI Network Mode
SUI_NETWORK=testnet
SUI_RPC_URL=https://fullnode.testnet.sui.io:443

# AI Agent Credentials (Private Key dompet backend Anda)
AGENT_PRIVATE_KEY=suiprivkey123...

# OpenRouter API Key
OPENROUTER_API_KEY=sk-or-v1-...

# Deployed Sui Move Smart Contract Addresses
SUI_PACKAGE_ID=<PACKAGE_ID_HASIL_DEPLOY>
SUI_VAULT_ID=<VAULT_SHARED_OBJECT_ID>
SUI_AGENT_CAP_ID=<AGENT_CAP_OBJECT_ID>
```
