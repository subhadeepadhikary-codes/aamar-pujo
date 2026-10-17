/**
 * Platform Detection Helper
 * Distinguishes native Android APK from public Website / PWA.
 */

export function isApkPlatform() {
  if (typeof window === "undefined") return false;

  // 1. Native Capacitor runtime check
  if (window.Capacitor && typeof window.Capacitor.isNativePlatform === "function") {
    if (window.Capacitor.isNativePlatform()) return true;
  }

  // 2. Custom injected APK flag
  if (window.isAamarPujoApk) return true;

  // 3. Query parameter for localhost & preview testing
  if (window.location && window.location.search.includes("platform=apk")) {
    return true;
  }

  return false;
}
