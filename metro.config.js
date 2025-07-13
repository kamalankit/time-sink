const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

// Enable TypeScript support
config.resolver.sourceExts.push('ts', 'tsx');

// Add support for .mjs files
config.resolver.sourceExts.push('mjs');

// Configure transformer for TypeScript
config.transformer.babelTransformerPath = require.resolve('metro-react-native-babel-transformer');

// Enable experimental features for SDK 53
config.transformer.unstable_allowRequireContext = true;

// Ensure proper module resolution
config.resolver.platforms = ['native', 'web', 'ios', 'android'];

module.exports = config;