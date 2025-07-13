const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add any custom configuration here
config.resolver.alias = {
  // Add any aliases if needed
};

module.exports = config;