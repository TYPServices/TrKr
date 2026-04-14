// Intercept Expo's __ExpoImportMetaRegistry getter before it tries to load
// expo/src/winter/runtime.native.ts (which uses ESM import() — unsupported in Jest CJS).
Object.defineProperty(global, '__ExpoImportMetaRegistry', {
  get: () => ({}),
  set: () => {},
  configurable: true,
});
