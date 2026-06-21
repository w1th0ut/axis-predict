# 🧭 DeepBook Predict: Integration & Developer Hub

Selamat datang di Hub Integrasi **DeepBook Predict**! Folder ini dirancang sebagai panduan komprehensif bagi pengembang yang ingin mempelajari, mengintegrasikan, atau membangun produk di atas protokol pasar prediksi berbasis volatilitas (*volatility-priced prediction market*) pertama di jaringan Sui.

Dokumentasi ini menargetkan branch [`predict-testnet-4-16`](https://github.com/MystenLabs/deepbookv3/tree/predict-testnet-4-16/packages/predict) pada repositori resmi `DeepBookV3`.

---

## 📂 Struktur Dokumentasi

Gunakan tautan di bawah ini untuk menavigasi dokumen-dokumen spesifikasi:

### 1. 🎯 [Problem Statement & Idea Bank](file:///C:/Users/bagas/Downloads/Dapp%20Project/sui-defai-project/docs/PROBLEM_STATEMENT.md)
Dokumen ini merangkum tantangan pasar prediksi tradisional dan peluang baru yang ditawarkan oleh DeepBook Predict.
*   **Isi Penting**: Penjelasan masalah likuiditas *Cold Start*, opsi biner on-chain, cara mengajukan faucet token **DUSDC Testnet**, serta **10 Ide Integrasi DeFi** (mulai dari *Range Ladder Vaults*, *PLP + Hedge*, hingga *Volatility Arbitrage Bots*).

### 2. 🏛️ [Design & Architecture](file:///C:/Users/bagas/Downloads/Dapp%20Project/sui-defai-project/docs/DESIGN_ARCHITECTURE.md)
Dokumen ini menjelaskan arsitektur internal protokol dan interaksi antar objek on-chain.
*   **Isi Penting**: Struktur objek bersama (`Predict`, `PredictManager`, `OracleSVI`, `Vault`), pemetaan posisi biner & rentang vertical, 4 status siklus hidup oracle (*Lifecycle*), serta model matematika penentuan harga (*Pricing*) & pembatas risiko.

### 3. 📑 [Contract & Integration Reference](file:///C:/Users/bagas/Downloads/Dapp%20Project/sui-defai-project/docs/CONTRACT_INFORMATION.md)
Dokumen referensi teknis yang berisi detail target deployment dan API untuk integrasi sistem.
*   **Isi Penting**: Alamat Package & Shared Object resmi di Testnet, daftar lengkap endpoint REST API dari Indexer Server, skema event streaming Sui, serta tautan langsung ke kode sumber Move terkait.

### 4. ❓ [Workshop FAQ](file:///C:/Users/bagas/Downloads/Dapp%20Project/sui-defai-project/docs/WORKSHOP_FAQ.md)
Dokumen tanya jawab yang dihimpun dari sesi workshop developer resmi yang diadakan oleh Mysten Labs.
*   **Isi Penting**: Jawaban atas 17 pertanyaan teknis umum mengenai perbedaan dari Polymarket, dukungan leverage, integrasi builder, dan struktur insentif biaya (*spread*).

---

## 🚀 Memulai Cepat (Quick Start)

Untuk berinteraksi dengan DeepBook Predict di Testnet, pastikan Anda memahami alur transaksi dasar berikut:

1.  **Membuat Account**: Buat objek `PredictManager` untuk mengelola saldo dan melacak posisi perdagangan Anda secara on-chain.
2.  **Mendapatkan Faucet**: Isi formulir permintaan token dUSDC Testnet untuk modal perdagangan (tersedia di [PROBLEM_STATEMENT.md](file:///C:/Users/bagas/Downloads/Dapp%20Project/sui-defai-project/docs/PROBLEM_STATEMENT.md#what-youll-build)).
3.  **Melakukan Simulasi**: Gunakan server publik `https://predict-server.testnet.mystenlabs.com` untuk memantau status oracle aktif, sebelum memanggil fungsi `mint` atau `redeem` di smart contract Anda.
