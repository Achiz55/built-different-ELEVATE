# images/

Drop photos in here using these exact filenames and they'll get wired into the
site (ask Claude to wire them once they're in place):

- `before.jpg` — "My Story" before photo
- `now.jpg` — "My Story" now photo
- `hero.jpg` — static hero image (framed slot at the top of the page)

Any dropped photo gets resized to ~1000px on the long edge and compressed
before being wired in — originals are never upscaled. Until a given file
exists, its slot keeps the placeholder so nothing breaks.
