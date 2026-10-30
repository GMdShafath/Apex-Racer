# Tech Stack

Apex Rider is a web game wrapped as a native Android app. The game is a single HTML file written in plain JavaScript, rendered with three.js, and packaged into an APK with Capacitor.

## Overview

| Layer | Technology | Version |
|---|---|---|
| Language | JavaScript (ES modules), HTML, CSS | — |
| 3D engine | three.js | 0.160.0 |
| Audio | Web Audio API (synthesized at runtime) | — |
| Native wrapper | Capacitor (`@capacitor/core`, `@capacitor/android`, `@capacitor/cli`) | 6.x |
| Android runtime | Android System WebView | min SDK 22, target SDK 34 |
| Android build | Gradle 8.2.1, Android Gradle Plugin 8.2.1, JDK 17 | — |
| Build script | Node.js (`scripts/build.mjs`) | Node 18+ |

There is no frontend framework, bundler or physics library. The game uses no image, model or sound files. All geometry, textures and audio are generated in code.

## Game (`game.html`)

All of the game lives in `game.html`: rendering, physics, AI riders, traffic, audio, HUD and menus.

### Rendering: three.js

three.js is loaded as ES modules through an import map. These add-ons are used:

- **`Sky`**: the atmospheric sky dome.
- **`EffectComposer`, `RenderPass`, `UnrealBloomPass`, `ShaderPass`, `OutputPass`**: post-processing for bloom, a custom shader pass and final color output.
- **`BufferGeometryUtils.mergeGeometries`**: merges static scenery into fewer meshes to reduce draw calls.

The rendering techniques are:

- **Materials.** Physically based rendering, using mostly `MeshStandardMaterial` plus a few `MeshPhysicalMaterial` surfaces.
- **Instancing.** `InstancedMesh` draws repeated objects such as trees and roadside props in a few draw calls.
- **Shadows.** `PCFSoftShadowMap` soft shadows. The shadow map size depends on the quality setting.
- **Color.** ACES Filmic tone mapping and sRGB output color space.
- **Custom shaders.** `ShaderMaterial` and a custom post-processing pass.
- **Procedural textures.** `CanvasTexture` textures drawn on a 2D canvas.
- **Scale.** Distance fog, and a render resolution scaled by `devicePixelRatio`.

The **High / Medium / Low** quality presets change MSAA, shadow map size, tree shadows, post effects and render resolution. Medium is the default on phones.

### Gameplay logic

The game loop, motorcycle physics, lean and steering, AI riders, traffic and collisions are custom code driven by `requestAnimationFrame`. No physics engine is used.

### Audio: Web Audio API

The engine sounds and effects are synthesized live. They use oscillators, buffer sources (noise), biquad filters, a wave shaper for distortion, and gain nodes. The app ships with no audio files.

### Input and device APIs

- **Touch and pointer events** for the on-screen lean, gas, brake and nitro buttons.
- **Keyboard** controls for desktop testing.
- **`DeviceOrientation`** for the optional tilt-to-steer mode.
- **`navigator.vibrate`** for haptic feedback.
- **Screen Wake Lock** keeps the screen on during a race.
- **Screen Orientation API** prefers landscape.
- **`localStorage`** saves settings and progress.

The HUD and menus are plain HTML and CSS overlaid on the WebGL canvas.

## Build pipeline

1. **`scripts/build.mjs`** (Node.js) wraps `game.html` in a full HTML document and writes it to `www/index.html`. It copies three.js from `node_modules` into `www/lib/` and rewrites the CDN URLs to local paths, so the app works offline. With `--cdn`, or when three.js isn't installed, the game loads three.js from jsDelivr instead.
2. **Capacitor** (`npx cap sync android`) copies `www/` into `android/app/src/main/assets/public` and updates the native project. `capacitor.config.json` sets the app ID (`com.apexrider.game`), the app name and the background color.
3. **Gradle** (`android/gradlew assembleDebug`) compiles the native shell and packages the APK.

## Android app (`android/`)

- A Capacitor-generated Gradle project with one `MainActivity`, which hosts the WebView.
- AndroidX dependencies: AppCompat, CoordinatorLayout, Core SplashScreen and WebKit.
- The activity is locked to `sensorLandscape` and uses a no-action-bar launch theme.
- The only permission is `INTERNET`, which Capacitor includes by default. The bundled build needs no network access.

## Toolchain without Android Studio

The APK builds without Android Studio, using standalone tools in `C:\Users\SHAFATH\android-tools`:

- **JDK:** Eclipse Temurin JDK 17.
- **Android SDK:** command-line tools, platform-tools (`adb`), the Android 34 platform and build-tools 34.0.0.

`android/local.properties` points Gradle at this SDK. To rebuild and install on a USB-connected phone:

```powershell
npm run android:sync
$env:JAVA_HOME="C:\Users\SHAFATH\android-tools\jdk17"
cd android; .\gradlew.bat assembleDebug
C:\Users\SHAFATH\android-tools\sdk\platform-tools\adb.exe install -r app\build\outputs\apk\debug\app-debug.apk
```
