import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "app.teacherai.pwa",
  appName: "Teacher AI",
  // The static export of the app (npm run build, without a base path): it is packed into the APK
  webDir: "out",
  android: {
    allowMixedContent: false,
  },
};

export default config;
