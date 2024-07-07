const express = require("express");
const fs = require("fs");
const path = require("path");
const bodyParser = require("body-parser");
const chalk = require("chalk");
const { execSync } = require("child_process");

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.static("public"));
app.use(bodyParser.json());

// Custom middleware
app.use((req, res, next) => {
  const start = Date.now();
  const ipAddress = req.socket.remoteAddress || req.connection.remoteAddress;
  const currentDate = new Date().toISOString();

  res.on("finish", () => {
    const duration = Date.now() - start;
    const statusColor = res.statusCode >= 200 && res.statusCode < 300 ? "green" : "red";

    console.log(
      chalk.bold(
        `Request on ${chalk.cyanBright(req.path)} took ${duration} ms - Status: ${chalk[statusColor](res.statusCode)} - IP: ${ipAddress} - Date: ${currentDate}`
      )
    );
  });

  next();
});

// Function to deploy routes
const deployRoute = (routeName, color) => {
  console.log(chalk.bold[color](`DEPLOYED ROUTE [${routeName}]`));
};

// Function to load a single route
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

// Function to load all routes in a directory
const loadRoutes = (directory) => {
  fs.readdirSync(directory).forEach((file) => {
    const filePath = path.join(directory, file);
    loadRoute(filePath);
  });
};

// Function to install missing modules
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

// Deploy routes
console.log(chalk.bold.cyan("Deploying routes..."));
loadRoutes(path.join(__dirname, "routes"));
console.log(chalk.bold.cyan("Routes deployment complete."));

// Install missing modules
console.log(chalk.bold.cyan("Checking and installing missing modules..."));
installMissingModules();
console.log(chalk.bold.cyan("Module installation complete."));

// Start the server
app.listen(port, () => {
  console.log(chalk.bold(`Server is running on http://localhost:${port}`));
});
