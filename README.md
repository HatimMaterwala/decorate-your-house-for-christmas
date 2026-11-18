# Deck the House 🎄

Upload a photo of your house and decorate it: string lights, hanging decorations, Santa, a sleigh, reindeer, and more. Carols play and light snow falls while you work.

## Run it

```bash
python -m http.server 5173
# open http://localhost:5173
```

There's no build step. It's plain HTML, CSS and JavaScript, plus [Konva.js](https://konvajs.org) loaded from a CDN.

## Files

| File | What it does |
|---|---|
| `index.html` | Page layout: top bar, inventory sidebar, canvas, music player |
| `css/styles.css` | Styling |
| `js/app.js` | Canvas (Konva): photo upload, adding, moving and resizing decorations, light-string tool, saving the picture |
| `js/decorations.js` | Artwork for every decoration (built-in vector images) and the sample house |
| `js/snow.js` | Snowfall drawn on a see-through layer over the canvas |
| `js/music.js` | Music box that plays traditional carols, plus songs users add themselves |

## How it works

- **World coordinates.** Everything is positioned in the photo's own pixels, and the stage is scaled to fit the screen. Decorations stay in place when the window is resized, and the saved PNG is full resolution.
- **Light strings.** The user clicks points along the house. The app adds a natural sag between points, places bulbs evenly along the wire, and animates them (twinkle, chase or breathe).
- **Music.** The carols are public domain and the music box plays them from notes, so there are no audio files and no licensing. Modern recordings need a license, or a Spotify/YouTube embed.
