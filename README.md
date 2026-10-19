# Zegery — Astrophotography Portfolio

A minimal static portfolio built with HTML, CSS, and JavaScript for GitHub Pages.

## Files
- `index.html` — page content and gallery entries
- `styles.css` — visual design and responsive layout
- `script.js` — image lightbox behavior
- `placeholder.svg` — temporary artwork; replace with your own photographs

## Publish on GitHub Pages
1. Create a public repository named `zegery.github.io`.
2. Upload the contents of this folder to the repository root (not the enclosing ZIP or folder).
3. In **Settings → Pages**, select **Deploy from a branch**, choose `main` and `/(root)`, then save.
4. Wait a few minutes and visit https://zegery.github.io/.

## Add your own astrophotographs
1. In the repository, upload your image to the repository root for the simplest setup.
2. Upload an image, for example `m31.jpg`.
3. In `index.html`, find the matching gallery card and change its `data-image` value and the `<img src="...">` inside the card to `m31.jpg`.
4. Replace the descriptive text and the `data-details` value with your actual target, equipment, exposure, filters, and processing notes.
5. To use your own photo in the large hero banner, edit `styles.css` and change the `.hero-art` background image URL to your image filename.
6. Commit the changes. GitHub Pages will publish the update.

Use short, web-friendly JPG or WebP copies for gallery display, and keep full-resolution originals backed up elsewhere. Only publish photos and personal details you're comfortable making public.

## Personalize
- Replace the About text in `index.html`.
- Replace `mailto:` in the contact link with your public contact email, or remove that link.
- Change the site name `zegery` if you want a different wordmark.
- The sample target names and capture details are examples; do not present them as your own images until you replace them.
