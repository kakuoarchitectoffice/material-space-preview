# Design QA

## Source and capture

- Source target: `/Users/ma_eiji/Downloads/生成画像2 (1).png`
- Desktop implementation: `/Users/ma_eiji/Documents/平田タイル案件/qa/desktop-showroom-final.png`
- Mobile implementation: `/Users/ma_eiji/Documents/平田タイル案件/qa/mobile-showroom.png`
- Combined comparison: `/Users/ma_eiji/Documents/平田タイル案件/qa/design-comparison.png`
- Desktop viewport/state: 1440 × 1024, `showroom`, `ARRIVAL`, `ROOM`, `Limestone Grey`
- Mobile viewport/state: 390 × 844, same room and material

## Comparison history

### Pass 1

- P1 / Layout and behavior: malformed quote in the ROOM / MATERIAL / STORY class attribute caused material traces to become children of the mode control and cluster at the upper-right.
- P1 / Interaction: the full-screen trace layer intercepted clicks intended for the room path.
- P2 / Icon fidelity: unsupported text symbols were being used in place of a coherent icon library.
- P2 / Image tone: generated arrival image rendered darker than the supplied target.

Fixes:

- Corrected the mode control markup and verified three independent trace coordinates.
- Disabled pointer events on the trace layer and restored them only on each trace button.
- Replaced symbol substitutes with explicit text actions such as `SAVE`, `SEARCH`, `MENU`, and `閉じる`.
- Increased room image brightness while retaining the warm dark palette.

### Pass 2

- Layout: full-screen photographic stage, thin top navigation, left room path, central copy, material traces, and bottom glass material bar match the source hierarchy.
- Spacing: desktop controls remain inside the viewport; mobile room path sits above the bottom sheet without collision.
- Typography: restrained sans-serif navigation and lightweight Japanese display type preserve the target hierarchy.
- Color: warm stone, deep brown, warm white, translucent dark glass, and fine white lines map to the supplied palette.
- Image quality: all three room images are full-resolution generated assets with no UI, text, logos, watermarks, or people. Tile details use separate surface-image assets.
- Responsiveness: no horizontal overflow at 390 px; bottom sheet, room path, traces, and mobile menu remain usable.
- Accessibility: semantic buttons/links, visible labels, focusable traces, alt text, form labels, live status, and reduced-motion handling are present.
- Interactions: room switching, material selection, detail dialog, favorites, sample cart, public routes, search, mobile menu, demo admin login, and trace-position selection passed in the in-app browser with no console warnings or errors.

## Final result

final result: passed
