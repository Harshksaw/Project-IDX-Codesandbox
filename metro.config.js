const { getDefaultConfig } = require('expo/metro-config');
const { getSentryExpoConfig } = require("@sentry/react-native/metro");

// Get the default Expo config first
const defaultConfig = getDefaultConfig(__dirname);

// Then apply Sentry config on top of it
const config = getSentryExpoConfig(__dirname, defaultConfig);

module.exports = config;
