const express = require('express');
const bodyParser = require('body-parser');
const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 3000;

// Middleware untuk memproses body permintaan sebagai JSON
app.use(bodyParser.json());

// **INI SANGAT PENTING: LOAD BOT TOKEN DARI ENVIRONMENT VARIABLE atau FILE TERPISAH!**
// JANGAN PERNAH HARDCODE BOT TOKEN DI SINI
const botToken = process.env.TELEGRAM_BOT_TOKEN || (() => {
  try {
    return fs.readFileSync('bot_token.txt', 'utf8').trim();
  } catch (err) {
    console.error("Error: Tidak dapat menemukan bot_token.txt atau variabel lingkungan TELEGRAM_BOT_TOKEN. Pastikan salah satunya sudah diatur.");
    process.exit(1); // Keluar dari aplikasi jika token tidak ditemukan
  }
})();

// Buat bot Telegram
const bot = new TelegramBot(botToken, {polling: false}); // Polling dinonaktifkan karena kita akan menggunakan webhook (lebih disarankan)

// Endpoint untuk menerima data login Telegram dari client
app.post('/api/telegram-login', (req, res) => {
    const user = req.body;
    console.log('Data login Telegram diterima:', user);

    // **Lakukan validasi data di sini!** Pastikan data sesuai dengan yang diharapkan

    // **SIMPAN DATA USER KE DATABASE!** Jangan hanya log ke konsol

    // **Kirim pesan selamat datang ke user (gunakan fungsi terpisah!)**
    sendWelcomeMessage(user.id, user.first_name, user.username);

    res.json({ message: 'Data berhasil diterima dan diproses.' });
});

// Endpoint untuk memulai interaksi dengan bot (contoh)
app.post('/api/start-bot-interaction', (req, res) => {
    const userId = req.body.userId;

    if (!userId) {
        return res.status(400).json({ error: "User ID tidak valid." });
    }

    // **Lakukan logika untuk memulai interaksi dengan bot di sini**
    // Misalnya, kirim pesan ke user untuk memulai percakapan
    bot.sendMessage(userId, "Halo! Selamat datang di bot Wanzofc. Ketik /help untuk melihat perintah yang tersedia.");

    res.json({ message: "Interaksi bot dimulai untuk user ID: " + userId });
});

// Endpoint untuk halaman pengaturan profil
app.get('/profile-settings', (req, res) => {
     res.send("Halaman pengaturan profil (akan diimplementasikan)");
});

// Fungsi untuk mengirim pesan selamat datang (KEAMANAN: Jangan simpan logika ini di client!)
function sendWelcomeMessage(chatId, firstName, username) {
    const message = `Selamat datang, ${firstName}! Terima kasih telah login melalui Telegram. Username Anda: @${username}`;
    bot.sendMessage(chatId, message)
        .then(() => console.log(`Pesan selamat datang terkirim ke chat ID: ${chatId}`))
        .catch(error => console.error("Gagal mengirim pesan selamat datang:", error));
}

// **PENTING: HANDLE ERROR DENGAN BAIK!**
bot.on('polling_error', (error) => {
    console.error("Error polling:", error);
});

// **PENTING: GUNAKAN WEBHOOK (DISARANKAN) BUKAN POLLING UNTUK APLIKASI PRODUKSI!**
// Untuk menggunakan webhook, Anda perlu:
// 1. Mendapatkan sertifikat SSL (misalnya dari Let's Encrypt)
// 2. Mengatur webhook URL ke server Anda (menggunakan bot.setWebhook)
// 3. Memproses pembaruan dari Telegram melalui endpoint webhook

// Secara statis menghidangkan file HTML
app.use(express.static(__dirname));

// Jalankan server
app.listen(port, () => {
    console.log(`Server berjalan di http://localhost:${port}`);

    // **HANYA UNTUK PENGEMBANGAN: SET WEBHOOK SECARA OTOMATIS (JANGAN LAKUKAN INI DI PRODUKSI!)**
    //  bot.setWebhook('https://example.com/webhook'); // Ganti dengan URL webhook Anda
    //  console.log("Webhook diatur (contoh pengembangan).");
});
