const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Ensure compatibility with Expo SDK 53
config.resolver.platforms = ['ios', 'android', 'native', 'web'];

// Add support for additional file extensions
config.resolver.sourceExts.push('mjs', 'cjs');

// Configure transformer for better compatibility with Expo Go and SDK 53
config.transformer.minifierConfig = {
  keep_fnames: true,
  mangle: {
    keep_fnames: true,
  },
};

// Ensure proper asset resolution
config.resolver.assetExts.push('png', 'jpg', 'jpeg', 'gif', 'svg');

// Add resolver configuration for better module resolution
config.resolver.nodeModulesPaths = [
  './node_modules',
];

// Configure for better Expo Go compatibility
config.resolver.resolverMainFields = ['react-native', 'browser', 'main'];

// Ensure proper handling of platform-specific files
config.resolver.platforms = ['ios', 'android', 'native', 'web'];

module.exports = config;