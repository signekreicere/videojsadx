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

Release flow (from a clean branch):

1. Ensure your branch is up to date
   `git checkout master`
   `git pull --rebase`

2. Ensure working directory is clean (required by `npm version`)
   `git status`

- If dirty, commit or stash first:
  `git add -A`
  `git commit -m "chore: prepare release"`
  or
  `git stash push -u -m "release-temp"`

3. Install deps and run release checks
   `npm install`
   `npm test`
   `npm run build`

4. Bump version (creates a commit + git tag)
   `npm version patch|minor|major`

5. Verify package contents before publish
   `npm pack --dry-run`

6. Publish to npm
   `npm publish`

7. Push release commit and tags to GitHub
   `git push --follow-tags`

8. If you stashed changes in step 2, restore them
   `git stash list`
   `git stash pop`
