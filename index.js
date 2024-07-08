const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware untuk menyajikan file statis
app.use(express.static(path.join(__dirname, 'public')));

// Route utama untuk menampilkan index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Dynamically load and use routes from the 'routes' directory
const routesPath = path.join(__dirname, 'routes');
fs.readdirSync(routesPath).forEach(file => {
    const routePath = path.join(routesPath, file);
    if (fs.lstatSync(routePath).isFile() && file.endsWith('.js')) {
        const route = require(routePath);
        const routeName = file.replace('.js', '');
        app.use(`/${routeName}`, route);
    }
});

// Menangani rute yang tidak ditemukan
app.use((req, res) => {
    res.status(404).send('404 Not Found');
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
