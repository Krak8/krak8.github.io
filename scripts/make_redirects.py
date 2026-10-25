"""Generates short-link redirect pages (e.g. /dc -> Discord). Edit LINKS, run: python3 scripts/make_redirects.py"""
import os
LINKS = {
    "x":  ("twitter", "https://x.com/imkrak8", ["twitter"]),
    "gh": ("GitHub", "https://github.com/Krak8", ["github"]),
    "yt": ("YouTube", "https://www.youtube.com/@Krak8", ["youtube"]),
    "ig": ("Instagram", "https://www.instagram.com/imkrak8", ["instagram", "insta"]),
    "tw": ("Twitch", "https://www.twitch.tv/krak8_", ["twitch", "live"]),
    "dc": ("Discord", "https://discord.gg/ZGCmmgR", ["discord"]),
}
PAGE = """<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta http-equiv="refresh" content="0; url={url}">
  <link rel="canonical" href="{url}">
  <meta name="robots" content="noindex">
  <title>Krak8 on {name}</title>
  <style>body{{margin:0;min-height:100vh;display:grid;place-items:center;background:#1b1b3a;color:#fff;font-family:system-ui,sans-serif}}a{{color:#00bfff}}</style>
</head>
<body>
  <p>Taking you to {name}… <a href="{url}">Tap here if nothing happens.</a></p>
  <script>location.replace({url!r});</script>
</body>
</html>
"""
for slug, (name, url, aliases) in LINKS.items():
    for s in [slug] + aliases:
        os.makedirs(s, exist_ok=True)
        open(os.path.join(s, "index.html"), "w").write(PAGE.format(name=name, url=url))
print("done")
