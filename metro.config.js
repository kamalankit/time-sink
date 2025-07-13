const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Enable TypeScript support
config.resolver.sourceExts.push('ts', 'tsx');

// Add support for .mjs files
config.resolver.sourceExts.push('mjs');

// Configure transformer for TypeScript
config.transformer.babelTransformerPath = require.resolve('metro-react-native-babel-transformer');

// Enable experimental features
config.transformer.unstable_allowRequireContext = true;

// Ensure proper module resolution
config.resolver.platforms = ['native', 'web', 'ios', 'android'];

// Add resolver for node modules
config.resolver.nodeModulesPaths = [
  './node_modules',
];

// Enable symlinks
config.resolver.unstable_enableSymlinks = true;

module.exports = config;