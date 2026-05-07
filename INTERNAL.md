# Internal Development

This repo is public, but development is intended for internal use only.

# Local development

- Use the repo Node version
  `nvm use`
- Install dependencies
  `npm install`
- Start the dev server
  `npm run start`
- Open `http://localhost:8080/videojsadx.html`

# Docker (optional)

- Start the dev server
  `npm run start:docker`
- It should open `http://localhost:8080/videojsadx.html` automatically

# Package contents

Dev assets live in `test/` (including local sample media) and are excluded from npm publishes by the `files` allowlist in package.json.

# Publishing

- Update the version
  `npm version patch|minor|major`
- Install and build
  `npm install`
  `npm run build`
- Verify publish contents
  `npm pack --dry-run`
- Publish to npm
  `npm publish`
- Push commits and tags to GitHub
  `git push --follow-tags`
