const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Configure resolver to handle TypeScript files properly
config.resolver.sourceExts = ['ts', 'tsx', ...config.resolver.sourceExts, 'mjs', 'cjs'];

// Ensure proper platform resolution
config.resolver.platforms = ['ios', 'android', 'native', 'web'];

// Configure transformer for better compatibility
config.transformer.minifierConfig = {
  keep_fnames: true,
  mangle: {
    keep_fnames: true,
  },
};

// Ensure proper asset resolution
config.resolver.assetExts.push('png', 'jpg', 'jpeg', 'gif', 'svg');

// Configure for better module resolution
config.resolver.nodeModulesPaths = [
  './node_modules',
];

// Ensure proper handling of platform-specific files
config.resolver.resolverMainFields = ['react-native', 'browser', 'main'];

module.exports = config;