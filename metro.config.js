const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Exclude non-component files from being treated as routes
config.resolver.platforms = ['ios', 'android', 'native', 'web'];

// Add file extensions and exclude patterns
config.resolver.sourceExts = [...config.resolver.sourceExts, 'mjs'];

// Configure the resolver to ignore certain files for routing
config.resolver.resolverMainFields = ['react-native', 'browser', 'main'];

// Exclude specific files from metro bundling that shouldn't be routes
config.resolver.blockList = [
  /app\/types\/.*\.d\.ts$/,
  /app\/utilities\/.*\.ts$/,
];

module.exports = config;
