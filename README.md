# Fuel Tank Reading PWA

This is a Vite + React Progressive Web App for tank dip readings.

## What it does

- Select Tank 1, Tank 2, Tank 3, or Tank 4
- Enter dip reading in millimeters
- Converts millimeters to liters using calibration points
- Shows % full and ullage / available space
- Saves reading history permanently on the same device/browser using localStorage
- Includes PWA manifest and service worker setup via vite-plugin-pwa

## Install requirements

Install Node.js first: https://nodejs.org

## Run locally

```bash
npm install
npm run dev
```

Then open the local link shown in the terminal, usually:

```text
http://localhost:5173
```

## Build for hosting

```bash
npm run build
```

The production files will be created in:

```text
dist/
```

## Host it

Recommended hosting:

- Vercel
- Netlify
- Cloudflare Pages

After hosting on HTTPS, Chrome/Edge can show the install button. On iPhone, open the app in Safari, tap Share, then Add to Home Screen.

## Important note about saving

This version saves history locally on each device/browser. It does not yet sync between devices. For shared station-wide records, connect a cloud database later.
