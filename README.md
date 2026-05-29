SNAPSYNC

Syncs clipboard and photos between your Windows PC and Android phone over local Wi-Fi. No internet, no cloud.

## Features
- Copy text on PC → instantly available on phone
- Send text from phone → sets PC clipboard
- Auto photo sync with batch upload of last 10 photos

## Requirements
- Node.js v18+
- Android phone on the same Wi-Fi as your PC

## Setup

**Server (PC)**
```bash
cd server
npm install
npm start
```

**Find your IP** run `ipconfig` and look for IPv4 Address under Wi-Fi (e.g. `192.168.1.x`)

**Mobile App**
```bash
cd client
npm install
eas build --profile development --platform android
```
Install the APK on your phone, open it, enter your PC's IP when prompted.

## Usage
1. Run `npm start` in the `server` folder
2. Open the app on your phone,it connects automatically
3. Copy text on PC → tap Copy in app to use it on phone
4. Paste text in app → tap Send to PC → paste anywhere on PC
5. Tap ▶ Start Sync to begin photo sync

## Notes
- Both devices must be on the same Wi-Fi
- If your PC's IP changes, use the Change IP button in the app
- Keep the app in recents for continuous photo sync
