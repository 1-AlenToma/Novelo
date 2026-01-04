const { getDefaultConfig } = require('expo/metro-config');
const path = require("path");
const { startDevServer } = require("react-native-short-style-devtools");


if (process.env.NODE_ENV !== "production") {
  try {
    const root = path.resolve(
      __dirname,
      "./node_modules/react-native-short-style-devtools/dist"
    );

    startDevServer({ root });
    console.log("🌐 DevTools server started from Metro!");
  } catch (err) {
    console.error("Failed to start DevTools server:", err);
  }
}

const config = getDefaultConfig(__dirname);
module.exports = config;
