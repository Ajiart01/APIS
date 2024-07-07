const express = require("express");
const fs = require("fs");
const path = require("path");
const bodyParser = require("body-parser");
const chalk = require("chalk");

const app = express();
const port = process.env.PORT || 3000;

app.use(express.static("public"));
app.use(bodyParser.json());

let userData = [];

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

    userData.push({
      path: req.path,
      duration: duration,
      status: res.statusCode,
      ip: ipAddress,
      date: currentDate,
    });

    fs.writeFileSync(
      "userData.json",
      JSON.stringify(userData, null, 2),
      "utf-8"
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

// Serve login.html at the path /login
app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "login.html"));
});

console.log(chalk.bold.cyan("Deploying routes..."));
loadRoutes(path.join(__dirname, "routes"));
console.log(chalk.bold.cyan("Routes deployment complete."));

app.listen(port, () => {
  console.log(chalk.bold(`Server is running on http://localhost:${port}`));
});
