/**
 * APK-Only Firebase Google Authentication Helper
 * Active strictly when isApkPlatform() is true.
 */

import { isApkPlatform } from "./platform.js";

const APK_USER_KEY = "aamar_pujo_apk_user_v1";

export function getApkUser() {
  if (!isApkPlatform()) return null;
  try {
    const raw = localStorage.getItem(APK_USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (err) {
    console.warn("Failed to get APK user:", err);
    return null;
  }
}

export const getStoredApkUser = getApkUser;

export function saveApkUser(user) {
  try {
    if (user) {
      localStorage.setItem(APK_USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(APK_USER_KEY);
    }
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("aamar-apk-auth-changed", { detail: { user } }));
    }
  } catch (err) {
    console.warn("Failed to save APK user:", err);
  }
}

export async function loginWithGoogleMock(email = "subhadeepadhikary30@gmail.com") {
  const user = {
    uid: `user_${Date.now()}`,
    displayName: "Subhadeep Adhikary",
    email,
    photoURL: "/favicon.png",
    authenticatedAt: new Date().toISOString()
  };
  saveApkUser(user);
  return user;
}

export function logoutApkUser() {
  saveApkUser(null);
}
