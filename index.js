/*const express = require('express');
const path = require('path');
const fs = require('fs');
const cheerio = require('cheerio');
const axios = require('axios').default; // Menggunakan axios sebagai pengganti got
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware untuk menyajikan file statis
app.use(express.static(path.join(__dirname, 'public')));

// Route utama untuk menampilkan index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Fungsi untuk memuat dan mendaftarkan rute dari direktori 'routes'
function loadRoutes(directory) {
    fs.readdirSync(directory).forEach(file => {
        const routePath = path.join(directory, file);
        if (fs.lstatSync(routePath).isFile() && file.endsWith('.js')) {
            const route = require(routePath);
            const routeName = file.replace('.js', '');
            app.use(`/${routeName}`, route);
        }
    });
}

// Memuat dan mendaftarkan rute dari direktori 'routes'
const routesPath = path.join(__dirname, 'routes');
loadRoutes(routesPath);

// Menangani rute yang tidak ditemukan
app.use((req, res) => {
    res.status(404).send('404 Not Found');
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});*/



const express = require("express");
const fs = require("fs");
const path = require("path");
const bodyParser = require("body-parser");
const chalk = require("chalk");
const { execSync } = require("child_process");

const app = express();
const port = process.env.PORT || 3000;

app.use(express.static("public"));
app.use(bodyParser.json());

// Middleware untuk logging setiap request
app.use((req, res, next) => {
  const start = Date.now();
  const ipAddress = req.ip || req.connection.remoteAddress;
  const currentDate = new Date().toISOString();

  res.on("finish", () => {
    const duration = Date.now() - start;
    const statusColor =
      res.statusCode >= 200 && res.statusCode < 300 ? "green" : "red";

    console.log(
      chalk.bold(
        `Request on ${chalk.cyanBright(req.path)} took ${duration} ms - Status: ${chalk[statusColor](res.statusCode)} - IP: ${ipAddress} - Date: ${currentDate}`
      )
    );
  });

  next();
});

const deployRoute = (routeName, color) => {
  console.log(chalk.bold[color](`DEPLOYED ROUTE [${routeName}]`));
};

const loadRoute = (filePath) => {
  try {
    const route = require(filePath);
    app.use("/api", route);
    deployRoute(path.basename(filePath, ".js"), "cyan");
  } catch (error) {
    console.error(
      chalk.bold.red(`Error loading route ${filePath}: ${error.message}`)
    );
  }
};

const loadRoutes = (directory) => {
  fs.readdirSync(directory).forEach((file) => {
    const filePath = path.join(directory, file);
    loadRoute(filePath);
  });
};

const installMissingModules = () => {
  const packageJsonPath = path.join(__dirname, "package.json");
  const packageLockPath = path.join(__dirname, "package-lock.json");

  if (!fs.existsSync(packageJsonPath) || !fs.existsSync(packageLockPath)) {
    console.error(chalk.bold.red("Error: No package.json or package-lock.json found."));
    process.exit(1);
  }

  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf-8"));
  const missingModules = [];

  for (const dependency in packageJson.dependencies) {
    try {
      require.resolve(dependency);
    } catch (error) {
      missingModules.push(dependency);
    }
  }

  if (missingModules.length > 0) {
    console.log(chalk.bold.green("Installing missing modules..."));
    deployRoute("npm modules", "green");
    execSync(`npm install ${missingModules.join(" ")}`);
    console.log(chalk.bold.green("Modules installed successfully."));
  } else {
    console.log(chalk.bold.green("No missing modules found."));
  }
};

// Memuat dan mendaftarkan rute dari direktori 'routes'
console.log(chalk.bold.cyan("Deploying routes..."));
loadRoutes(path.join(__dirname, "routes"));
console.log(chalk.bold.cyan("Routes deployment complete."));

// Memeriksa dan menginstal modul yang hilang saat server dimulai
console.log(chalk.bold.cyan("Checking and installing missing modules..."));
installMissingModules();
console.log(chalk.bold.cyan("Module installation complete."));

// Menjalankan server
app.listen(port, () => {
  console.log(chalk.bold(`Server is running on http://localhost:${port}`));
});
