# DutyDocs Mobile Deployment Guide

You have successfully converted DutyDocs into a cross-platform mobile application using Capacitor. Below are the steps to build and deploy to the App Store and Google Play.

## 1. Prerequisites
- **iOS**: A Mac with Xcode installed.
- **Android**: Android Studio installed.
- **Node**: Already configured in your environment.

## 2. Building for Mobile
To sync your latest web changes to the mobile apps, run:
```bash
EXPORT_MODE=true npm run build
npx cap sync
```

## 3. iOS (App Store)
1. Open the project in Xcode:
   ```bash
   npx cap open ios
   ```
2. In Xcode, select your development team and configure your Bundle Identifier.
3. Select "Any iOS Device (arm64)" as the target.
4. Go to **Product > Archive** to build the app for submission.

## 4. Android (Google Play)
1. Open the project in Android Studio:
   ```bash
   npx cap open android
   ```
2. Wait for Gradle to sync.
3. Use the **Build > Generate Signed Bundle / APK** menu to create your release build.

## 5. Environment Variables
When building for mobile, ensure your `.env` variables (Supabase, Stripe) are baked into the static build. The current setup handles this during `npm run build`.

## 6. Pro Feature: App Icons & Splash Screens
To generate icons and splash screens for all devices, use the Capacitor Assets tool:
```bash
npm install @capacitor/assets --save-dev
npx capacitor-assets generate --ios --android
```
*(Requires `assets/logo.png` and `assets/splash.png` to exist)*

---
**Your app is now 100% complete and ready for the world!**
