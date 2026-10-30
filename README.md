# Apex Rider

A 3D motorcycle racing game for Android, built with three.js and wrapped as a native app with Capacitor.

You race five AI riders over 7 km of mountain highway with live traffic. Passing cars closely refills your nitro.

## Files

- `game.html` is the whole game: rendering, physics, AI, audio and HUD.
- `scripts/build.mjs` wraps `game.html` into `www/index.html` and bundles three.js locally, so the APK works offline.
- `capacitor.config.json` holds the Android app settings (`com.apexrider.game`).

## Build the Android APK

You need Node 18+, plus Android Studio with an Android SDK installed.

```bash
cd C:\Users\SHAFATH\BikeRacer
npm install
npm run android:add      # builds www/ and creates the android/ project (first time only)
npm run android:open     # opens the project in Android Studio
```

In Android Studio, choose **Build > Build Bundle(s) / APK(s) > Build APK(s)**. To play on a phone, connect it with USB debugging on and press **Run**.

After you change `game.html`, run `npm run android:sync` to copy the new build into the Android project.

### Lock the app to landscape (recommended)

After `android:add`, open `android/app/src/main/AndroidManifest.xml`. Add these attributes to the `<activity>` tag:

```xml
android:screenOrientation="sensorLandscape"
android:theme="@style/AppTheme.NoActionBarLaunch"
```

### Quick test without Android Studio

Run `npm run build`, then `npm run serve`, and open `http://<your-PC-IP>:8080` in Chrome on a phone on the same Wi-Fi network.

## Controls

| Action | Touch | Keyboard |
|---|---|---|
| Lean | ◀ ▶ buttons, or tilt the phone (Tilt mode) | ← → / A D |
| Throttle | GAS (hold to accelerate; the bike does not speed up on its own) | ↑ / W |
| Brake | BRAKE | ↓ / S |
| Nitro | NITRO | Space / Shift |
| Camera | camera icon | C |
| Pause | pause icon | P / Esc |

## Graphics settings

- **High**: 4× MSAA, 2048 px soft shadows, tree shadows, bloom and post effects.
- **Medium**: the default on phones. 1024 px shadows, bloom and post effects.
- **Low**: no shadows or post effects, and a reduced render resolution for older phones.
