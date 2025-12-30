# Creek Soundboard PWA

A simple Progressive Web App (PWA) soundboard that can be installed on iOS devices without an Apple Developer account.

## Features

- 📱 Installable on iOS and other platforms
- 🎵 Play multiple sounds with visual feedback
- 💾 Works offline - all audio is cached
- 🎨 Customizable icons and colors for each sound
- 🌙 Dark mode support (auto-detects system preference)

## Quick Start

1. Add your audio files to the `sounds/` directory
2. Update `sounds.json` with your sound configurations
3. Host the files on any web server with HTTPS
4. Open in Safari and "Add to Home Screen"

## Project Structure

```
creek/
├── index.html          # Main HTML file
├── manifest.json       # PWA manifest
├── sw.js              # Service worker for offline caching
├── style.css          # Styles
├── app.js             # Application logic
├── sounds.json        # Sound configurations
├── sounds/            # Audio files directory
│   └── README.md
└── icons/             # Icon files
    ├── favicon.svg
    ├── app-icon-192.svg
    ├── app-icon-512.svg
    └── water.svg      # Example sound icon
```

## Adding Sounds

Edit `sounds.json` to add your sounds:

```json
{
  "sounds": [
    {
      "id": "unique-id",
      "name": "Sound Name",
      "file": "sounds/your-audio-file.wav",
      "icon": "icons/your-icon.svg",
      "color": "#3b82f6"
    }
  ]
}
```

### Properties

- `id` (required): Unique identifier
- `name` (required): Display name on button
- `file` (required): Path to audio file
- `icon` (optional): Path to icon (SVG or PNG)
- `color` (optional): Button accent color (hex)

## Deployment

### Self-Hosting Requirements

- Any static web server (nginx, Apache, Caddy, etc.)
- **HTTPS is required** for service workers to work
- Proper MIME types for `.json`, `.js`, and audio files

#### Example: Nginx Config

```nginx
server {
    listen 443 ssl http2;
    server_name your-domain.com;

    root /path/to/creek;
    index index.html;

    # SSL certificates
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    # MIME types
    types {
        application/manifest+json json;
        application/javascript js;
        audio/wav wav;
        audio/mpeg mp3;
    }

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

#### Example: Python Simple Server (for testing)

```bash
# Python 3
python3 -m http.server 8000

# Then use ngrok or similar for HTTPS
ngrok http 8000
```

### iOS Installation

1. Open Safari and navigate to your hosted URL
2. Wait for the page to fully load
3. Tap the Share button (box with arrow pointing up)
4. Scroll down and tap "Add to Home Screen"
5. Verify the app name and icon, then tap "Add"
6. The app icon will appear on your home screen
7. Launch the app - it opens in fullscreen without Safari UI

## Customization

### Changing the App Name

Edit the following files:
- `index.html` - Update `<title>` and `<h1>`
- `manifest.json` - Update `name` and `short_name`
- `index.html` meta tags - Update `apple-mobile-web-app-title`

### Creating Custom Icons

For best results, create PNG icons at:
- 192x192px - For standard displays
- 512x512px - For high-DPI displays

Place them in `icons/` directory and update `manifest.json`.

You can convert SVG icons to PNG using:
- Online tools (cloudconvert.com, convertio.co)
- Command line: `convert icon.svg icon.png` (ImageMagick)
- Design tools (Figma, Sketch, Adobe XD)

### Theming

Edit CSS variables in `style.css`:

```css
:root {
  --bg-primary: #1e293b;      /* Main background */
  --bg-secondary: #334155;    /* Button background */
  --text-primary: #f1f5f9;    /* Main text */
  --text-secondary: #94a3b8;  /* Secondary text */
  --accent: #3b82f6;          /* Accent color */
}
```

## Supported Audio Formats

- WAV (`.wav`)
- MP3 (`.mp3`)
- OGG (`.ogg`)
- M4A (`.m4a`)

MP3 is recommended for best compatibility and file size.

## Troubleshooting

### Sounds won't play offline
- Ensure service worker is registered (check browser console)
- Make sure all files are served over HTTPS
- Clear cache and reload the page
- Check that audio files are properly cached

### App won't install on iOS
- Verify HTTPS is working (not HTTP)
- Make sure manifest.json is accessible
- Check that icons are correct format and size
- Try closing and reopening Safari

### Audio not playing
- Check browser console for errors
- Verify audio file paths in sounds.json
- Ensure audio format is supported
- Test audio file plays in browser directly

## License

Free to use and modify.
