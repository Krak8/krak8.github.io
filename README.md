# krak8.github.io
Socials link tree — me.krak8.top. Plain static site (`index.html`, `style.css`, `app.js`); push to `main`.
Edit links/handles in `<nav class="grid">`. Tagline lines are the `.ln` spans. Scene layers are in `assets/`.

## Live Twitch badge + latest YouTube video
`.github/workflows/status.yml` runs every ~5 min, runs `scripts/update_status.py`, and commits `status.json`.
1. Create an app at the Twitch developer console (category "Other", redirect a localhost redirect).
2. Repo -> Settings -> Secrets and variables -> Actions -> New repository secret:
   `TWITCH_CLIENT_ID` and `TWITCH_CLIENT_SECRET`.
3. Actions tab -> "Update live status" -> Run workflow (enable workflows if prompted).
The secret stays in GitHub and is never in the website. YouTube needs no key.

The page below the fold shows the Twitch player, your 3 latest YouTube videos and top 6 Twitch clips, all from `status.json`.

## Short links
`/x /gh /yt /ig /tw /dc` redirect to each profile (plus `/twitter /github /youtube /instagram /twitch /live /discord`).
To add or change one, edit `LINKS` in `scripts/make_redirects.py` and run `python3 scripts/make_redirects.py`.
