# UI-Forge Vanilla Demo

This tiny Node.js demo intentionally contains a few UI defects so you can verify the detector without connecting a real project.

## Run it

From the UI-Forge repository root:

```sh
node examples/vanilla-demo/server.mjs
```

In another terminal:

```sh
npx playwright install chromium
node ./bin/ui-forge.js detect --config ./examples/vanilla-demo/ui-forge.config.json
```

The report and screenshots are written to `examples/vanilla-demo/.ui-forge/`.

## Expected findings

Depending on the installed browser version, the audit should identify:
- horizontal overflow at the mobile viewport;
- a potentially clipped content region;
- an empty/unlabeled button;
- an infinite animation that continues under reduced-motion emulation.

The demo server binds to `127.0.0.1`, serves only the single sample HTML file, and accepts only GET/HEAD requests. Do not treat this demo as a production server.
