# ImpulseVidya

The ImpulseVidya landing page introduces academic, exam, skill-building, and career guidance for students. It is built with Next.js, TypeScript, Motion, and Lenis, with dark and light themes.

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000` in a browser. Use `npm run build` to create the static export and `npm run lint` to check the code.

## Project map

- `src/components/impulsevidya/` contains the landing-page sections, shared components, motion, and asset paths.
- `src/app/impulsevidya.css` and `src/app/impulsevidya-overrides.css` contain the site styles.
- `public/images/impulsevidya/` contains the page's maintained image assets; see `docs/site-assets.md` for details.
- `src/lib/site.ts` contains the site name, description, canonical URL, and social preview image.
