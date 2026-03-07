// frontend-mobile/metro.config.js
const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
const path = require('path');

// 1. Locate the workspace root and the current project root.
const workspaceRoot = path.resolve(__dirname, '..');
const projectRoot = __dirname;

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('metro-config').MetroConfig}
 */
const config = {
  // 2. Watch the workspace root to resolve hoisted packages
  watchFolders: [workspaceRoot],
  resolver: {
    // 3. Force Metro to resolve modules starting from the project root,
    // then gracefully fall back to the workspace root.
    nodeModulesPaths: [
      path.resolve(projectRoot, 'node_modules'),
      path.resolve(workspaceRoot, 'node_modules'),
    ],
    // 4. Prevent module collision if the same package exists in multiple places
    disableHierarchicalLookup: true,
  },
};

module.exports = mergeConfig(getDefaultConfig(projectRoot), config);