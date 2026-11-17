# UI-Forge frontend creation showcase

A small, self-contained example of the **Create** workflow: a deliberately art-directed workspace dashboard with responsive layouts and working local interactions.

## Run it

No build step or framework is required. Open `index.html` directly, or serve this directory with any static file server:

```sh
npx serve examples/ui-create-demo
```

## Included behavior

- Switch between Overview and Projects views.
- Filter projects by status and search by name.
- Open a project dialog, validate its name, create a local project card, and show a confirmation message.
- Use the `/` keyboard shortcut to focus search and Escape to close the dialog.
- Responsive project cards, summary metrics, focus list, and reduced-motion support.

All data is local demo content. The form does not call an API or persist data. The sample is intended for visual and functional smoke testing, not as a production application.

## Browser verification

The Playwright integration test audits mobile and desktop viewports and exercises explicitly marked, side-effect-safe controls. The browser audit reports screenshot capture, accessibility smoke checks, runtime errors, and the configured interaction outcomes separately.
