# Sounds Directory

Place your audio files in this directory.

## How to Add Sounds

1. Copy your audio file (`.wav`, `.mp3`, `.ogg`) to this directory
2. Edit `sounds.json` in the root directory to add the sound configuration
3. Update the `file` path to match your audio file name

## Example Configuration

```json
{
  "sounds": [
    {
      "id": "creek",
      "name": "Creek Sound",
      "file": "sounds/creek.wav",
      "icon": "icons/water.svg",
      "color": "#3b82f6"
    },
    {
      "id": "rain",
      "name": "Rain",
      "file": "sounds/rain.mp3",
      "icon": "icons/water.svg",
      "color": "#60a5fa"
    }
  ]
}
```

## Sound Configuration Properties

- `id`: Unique identifier for the sound (required)
- `name`: Display name shown on the button (required)
- `file`: Path to the audio file (required)
- `icon`: Path to an SVG or PNG icon (optional - defaults to 🔊 emoji)
- `color`: Accent color for the button (optional - defaults to theme color)

## Supported Audio Formats

- WAV (`.wav`)
- MP3 (`.mp3`)
- OGG (`.ogg`)
- M4A (`.m4a`)

For best compatibility across all devices, use MP3 or WAV formats.
