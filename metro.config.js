const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Ensure compatibility with Expo SDK 52
config.resolver.platforms = ['ios', 'android', 'native', 'web'];

// Add support for additional file extensions
config.resolver.sourceExts.push('mjs', 'cjs');

// Configure transformer for better compatibility with Expo Go
config.transformer.minifierConfig = {
  keep_fnames: true,
  mangle: {
    keep_fnames: true,
  },
};

// Ensure proper asset resolution
config.resolver.assetExts.push('png', 'jpg', 'jpeg', 'gif', 'svg');

module.exports = config;