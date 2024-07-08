const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware untuk menyajikan file statis
app.use(express.static(path.join(__dirname, 'public')));

// Rute utama untuk menampilkan index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Menambahkan rute dari folder routes
const routes = ['ai', 'aipin', 'bard', 'edit', 'facebook', 'gd', 'globalgpt', 'instalk', 'pin', 'tikstalk', 'tiktok', 'tiktokdl', 'tinyurl', 'twitter', 'youtube'];
routes.forEach(route => {
    app.use(`/${route}`, require(`./routes/${route}`));
});

// Menangani rute yang tidak ditemukan
app.use((req, res, next) => {
    res.status(404).send('404 Not Found');
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
