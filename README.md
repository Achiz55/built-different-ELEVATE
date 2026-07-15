# Built Different: landing page

A lean, static, single-page site. No framework, no build step, plain HTML, CSS,
and vanilla JS. Deploys cleanly to Netlify.

## Files
- `index.html`: the page
- `styles.css`: all styling (theme variables live at the top)
- `main.js`: mobile nav, scroll reveals, form submit, results toggle
- `netlify.toml`: tells Netlify to serve the folder as-is

## Preview locally
Because it's static, you can just open `index.html`, but a tiny local server
is better (the form and fonts behave more like production):

```bash
cd built-different
python3 -m http.server 8000
# then open http://localhost:8000
```

Or with Node: `npx serve` from this folder.

## Deploy to Netlify
**Fastest:** drag this whole folder onto https://app.netlify.com/drop.

**Git-based (recommended for iterating):**
1. Put this folder in a Git repo and push to GitHub.
2. In Netlify: *Add new site → Import from Git*, pick the repo.
3. Build command: *(leave blank)*. Publish directory: `.`
4. Deploy. Point your Squarespace domain at Netlify when ready.

### The application form
It's wired for **Netlify Forms**, no backend needed. Once deployed, submissions
show up under *Forms* in your Netlify dashboard (and you can set email
notifications there). It won't submit on local preview; that's expected.

## Before you go live: swap these placeholders
Search the code for the brackets. Nothing here is invented, it's yours to fill:

- **Hero video**: replace the `.video-ph` block in `index.html` with your
  talking-head Reel/embed.
- **`[DEFINED RESULT]`**: the guarantee. Pick something honest and modest.
- **`[YOUR EMAIL]`**: in the form's error message.
- Optionally add real `#privacy` / `#terms` pages (footer links point to anchors
  for now).

## Turning on Results later
When founding clients finish and you have **real** before/afters and quotes:
1. In `main.js`, set `RESULTS_LIVE = true`.
2. In `index.html`, duplicate the `.result` template card per client and fill in
   real photos, numbers, and quotes. Never fake these.

## Reskinning
The whole look keys off two things at the top of `styles.css`:
`--accent` (the single accent color) and the font stacks. Change `--accent` and
the entire page re-themes.
