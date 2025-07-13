// metro.config.js - Alternative simpler configuration
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// This helps resolve the getDevServer error
config.resolver.platforms = ['ios', 'android', 'web'];

// Remove problematic SVG from asset extensions if present
config.resolver.assetExts = config.resolver.assetExts.filter(ext => ext !== 'svg');

// Add SVG to source extensions for proper handling
config.resolver.sourceExts = [...config.resolver.sourceExts, 'svg'];

// Reset transformer to default
config.transformer = {
  ...config.transformer,
  babelTransformerPath: require.resolve('metro-react-native-babel-transformer'),
};

module.exports = config;