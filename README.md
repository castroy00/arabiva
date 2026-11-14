# Arabiva — ad creatives

Image and video ads for Arabiva Fragrances (Kuwait and GCC), built from the store's own product photos.

## What is here

| Folder | Content |
|---|---|
| `creatives/images/` | 27 image ads in Google Ads asset sizes: 1200×1200, 1200×628, 960×1200 and 1080×1920. Arabic for all five concepts, English for three. |
| `creatives/video/` | A 15-second video in two sizes: 1080×1920 and 1920×1080. The audio track is silent, so add music before uploading. |
| `creatives/src/` | The source that builds them. |

## The one rule

Bottles, boxes and the logo come from the store's photos and are never redrawn. The only operations applied to a product photo are cropping and uniform scaling. Everything else is a text or background layer placed around it. The files in `creatives/src/img/` are lossless copies of the store's photos.

## Changing the text of a creative

```bash
cd creatives/src
npm install && npm run setup
# edit the copy in ads.js or video.js
npm run images
npm run video
```

Output goes to `creatives/src/out/`. The video step needs `ffmpeg`. Text that does not fit its panel is scaled down automatically, and the script prints `OVERFLOW` if it still does not fit. The build also stops with `ASPECT-DISTORTED` if a product photo would be stretched, and the video build stops with `OUT-OF-SYNC` if any frame would show one scene's text over another scene's photo.
