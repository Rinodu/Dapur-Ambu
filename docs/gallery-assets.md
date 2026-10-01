# Gallery cutouts

Five background removals were made with the built-in ImageGen tool in edit mode, with `transparent_background: true`. The input photographs remain available in `assets/gallery-{tier,brownies,3d,floral,purple}.webp`. The two-tier photograph is the first active cake and the homepage teaser.

Final assets are `assets/gallery-tier-cutout.webp`, `assets/gallery-brownies-cutout.webp`, `assets/gallery-3d-cutout.webp`, `assets/gallery-floral-cutout.webp`, and `assets/gallery-purple-cutout.webp`. They use WebP quality 92, preserve transparency, and total approximately 1.5 MB. Alpha was verified to include fully transparent and fully opaque pixels for every asset. Original PNG outputs remain in the local ImageGen output directory.

The same final prompt was used separately for each edit target:

> Use case: background-extraction. Edit target: the supplied real cake photograph. Remove ONLY the room, curtains, wall, table, and background completely to true transparent alpha. Preserve the entire exact cake, its original decoration, toppers, candles if present, lettering, and the cake board/serving base. Preserve the photographic identity, colors and perspective; do not redesign, invent, stylize, or change any decoration/text. Clean accurate edges, transparency in holes between toppers. Center the complete cutout with small even transparent margins; no cropping of cake or board. Output one isolated cake on fully transparent background, no checkerboard painted into image, no extra shadow.

Instagram source photos:

- Pink Lily: https://www.instagram.com/p/DY1G-DxJ9qx/
- Purple Birthday: https://www.instagram.com/p/DXTNSqMidmG/

## Interaction verification

- Cake selection moves the selected cake to the main position and returns the previous cake to the selected thumbnail slot; the copy and order theme follow the active cake.
- Rapid selection keeps the latest queued choice; clicking the main cake opens a preview, closed by Escape, the close button, or the backdrop.
- Cake selection retains left/right keyboard controls and reduced-motion handling. The bottom navigation, counter, instructions, and pause button were removed at the user's request.
- Desktop and 320-/390-pixel mobile layouts were checked in the browser. The mobile thumbnail rail leaves room for the floating WhatsApp button.
- Circle navigation covers the viewport above the WhatsApp button and uses the click/touch point, or link center for keyboard activation. On return to the homepage it skips the introductory curtain. Browser history restores without leaving the overlay in front.
