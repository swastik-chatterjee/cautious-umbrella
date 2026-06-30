import { NativeScriptConfig } from '@nativescript/core';

export default {
  id: 'org.nativescript.weighttracker',
  appPath: 'app',
  appResourcesPath: 'app/App_Resources',
  android: {
    v8Flags: '--expose_gc',
    markingMode: 'none',
  },
  cli: {
    packageManager: 'npm',
    telemetryOptOut: true,
  },
} as NativeScriptConfig;
