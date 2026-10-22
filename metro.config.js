const { getDefaultConfig } = require("expo/metro-config");
const { withNativewind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);
console.log("assetRegistryPath:", config.transformer.assetRegistryPath);

module.exports = withNativewind(config);
