# 📦 Assets Needed

To complete your DareDrop app, you'll need to add the following image assets to this directory.

## Required Assets

### App Icons

#### `icon.png`
- **Size:** 1024x1024 pixels
- **Format:** PNG with transparency
- **Purpose:** Main app icon for iOS and Android
- **Design:** Should feature your DareDrop logo/branding
- **Suggested:** Fire/flame icon with "DD" or dare-related imagery

#### `adaptive-icon.png`
- **Size:** 1024x1024 pixels
- **Format:** PNG with transparency
- **Purpose:** Android adaptive icon (foreground layer)
- **Design:** Same as icon.png, but centered in safe zone (inner 512x512)
- **Background:** Set in app.json (currently: #ef4444)

### Splash Screen

#### `splash.png`
- **Size:** 1284x2778 pixels (or 1242x2688)
- **Format:** PNG
- **Purpose:** Loading screen while app initializes
- **Design:** Full screen with DareDrop branding
- **Background:** Should match app.json backgroundColor (#ef4444)
- **Suggested:** Centered logo with tagline

### Web Assets

#### `favicon.png`
- **Size:** 48x48 pixels (or larger)
- **Format:** PNG
- **Purpose:** Browser tab icon for web version
- **Design:** Simplified version of main icon

## Current Setup

The app is configured in `app.json` with these asset paths:
```json
{
  "icon": "./assets/icon.png",
  "splash": {
    "image": "./assets/splash.png",
    "backgroundColor": "#ef4444"
  },
  "adaptiveIcon": {
    "foregroundImage": "./assets/adaptive-icon.png",
    "backgroundColor": "#ef4444"
  },
  "favicon": "./assets/favicon.png"
}
```

## Design Guidelines

### Color Palette
Use colors from your theme:
- Primary: #6B7BB8 (purple-blue)
- Secondary: #D67B9B (pink)
- Background: #E8DDD3 (cream)
- Accent: #F48C42 (orange/fire)

### Typography
If including text in assets:
- Primary font: "Poor Story"
- Secondary font: "Outfit"

## Creating Assets

### Quick Options

1. **Figma/Design Tool**
   - Export your Figma designs at the required sizes
   - Use the artboard export feature

2. **Online Icon Generators**
   - [App Icon Generator](https://www.appicon.co/)
   - [Figma to App Icon](https://www.figmatoappicon.com/)

3. **Manual Creation**
   - Create in Adobe Illustrator, Sketch, or Figma
   - Export at exact dimensions
   - Ensure high resolution

### Tips
- Use vector graphics for crisp scaling
- Test icons on both light and dark backgrounds
- Keep designs simple for small sizes
- Ensure splash screen loads quickly (optimize file size)

## Temporary Solution

Until you add proper assets, the app will show:
- Default Expo icon
- Default splash screen
- Console warnings about missing assets

The app will still function normally, just without custom branding.

## Next Steps

1. Create or export your assets from Figma
2. Save them in this `assets/` directory with exact filenames
3. Run `npx expo start -c` to clear cache and reload assets
4. Test on multiple devices to ensure assets look good

---

Need help? Check out:
- [Expo App Icons Guide](https://docs.expo.dev/guides/app-icons/)
- [Expo Splash Screens Guide](https://docs.expo.dev/guides/splash-screens/)

