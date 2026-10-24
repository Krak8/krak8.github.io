"""Writes status.json: Twitch live state + latest YouTube video.
Secrets come from GitHub Actions secrets (env vars) and never reach the website."""
import json, os, re, time, urllib.parse, urllib.request, xml.etree.ElementTree as ET

TWITCH_LOGIN = os.environ.get("TWITCH_LOGIN", "krak8_")
YT_HANDLE = os.environ.get("YT_HANDLE", "Krak8")
UA = {"User-Agent": "Mozilla/5.0 (status-bot)"}

def get(url, headers=None, data=None, timeout=15):
    req = urllib.request.Request(url, headers=headers or UA, data=data)
    with urllib.request.urlopen(req, timeout=timeout) as r:
        return r.read().decode()

try:
    old = json.load(open("status.json"))
except Exception:
    old = {}
new = {"twitch": old.get("twitch") or {"live": False}, "youtube": old.get("youtube"), "channel_id": old.get("channel_id")}

# Twitch
cid, sec = os.environ.get("TWITCH_CLIENT_ID"), os.environ.get("TWITCH_CLIENT_SECRET")
if cid and sec:
    try:
        tok = json.loads(get("https://id.twitch.tv/oauth2/token", data=urllib.parse.urlencode(
            {"client_id": cid, "client_secret": sec, "grant_type": "client_credentials"}).encode()))["access_token"]
        d = json.loads(get("https://api.twitch.tv/helix/streams?user_login=" + urllib.parse.quote(TWITCH_LOGIN),
                           headers={"Client-Id": cid, "Authorization": "Bearer " + tok}))["data"]
        new["twitch"] = ({"live": True, "title": d[0]["title"], "game": d[0]["game_name"], "viewers": d[0]["viewer_count"]}
                         if d else {"live": False})
    except Exception as e:
        print("twitch failed:", e)

# YouTube (public RSS feed, no key needed)
try:
    if not new["channel_id"]:
        page = get("https://www.youtube.com/@" + YT_HANDLE)
        m = re.search(r"channel_id=(UC[\w-]{22})", page) or re.search(r'"channelId":"(UC[\w-]{22})"', page)
        new["channel_id"] = m.group(1) if m else None
    if new["channel_id"]:
        root = ET.fromstring(get("https://www.youtube.com/feeds/videos.xml?channel_id=" + new["channel_id"]))
        ns = {"a": "http://www.w3.org/2005/Atom", "yt": "http://www.youtube.com/xml/schemas/2015"}
        e = root.find("a:entry", ns)
        if e is not None:
            new["youtube"] = {"id": e.find("yt:videoId", ns).text, "title": e.find("a:title", ns).text}
except Exception as e:
    print("youtube failed:", e)

# Only rewrite when something changed (or every ~30 min as a heartbeat) to keep commits quiet
same = all(old.get(k) == new[k] for k in new)
if not same or time.time() - old.get("updated", 0) > 1800:
    new["updated"] = int(time.time())
    json.dump(new, open("status.json", "w"), indent=1)
