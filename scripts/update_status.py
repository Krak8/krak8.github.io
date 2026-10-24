"""Writes status.json: Twitch live state + top clips, and the 3 latest YouTube videos.
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
new = {k: old.get(k) for k in ("youtube", "videos", "clips", "channel_id")}
new["twitch"] = old.get("twitch") or {"live": False}

# Twitch: live state + top clips (most viewed)
cid, sec = os.environ.get("TWITCH_CLIENT_ID"), os.environ.get("TWITCH_CLIENT_SECRET")
if cid and sec:
    try:
        tok = json.loads(get("https://id.twitch.tv/oauth2/token", data=urllib.parse.urlencode(
            {"client_id": cid, "client_secret": sec, "grant_type": "client_credentials"}).encode()))["access_token"]
        H = {"Client-Id": cid, "Authorization": "Bearer " + tok}
        q = urllib.parse.quote(TWITCH_LOGIN)
        d = json.loads(get("https://api.twitch.tv/helix/streams?user_login=" + q, headers=H))["data"]
        new["twitch"] = ({"live": True, "title": d[0]["title"], "game": d[0]["game_name"], "viewers": d[0]["viewer_count"]}
                         if d else {"live": False})
        uid = json.loads(get("https://api.twitch.tv/helix/users?login=" + q, headers=H))["data"][0]["id"]
        cl = json.loads(get("https://api.twitch.tv/helix/clips?first=6&broadcaster_id=" + uid, headers=H))["data"]
        new["clips"] = [{"id": c["id"], "url": c["url"], "title": c["title"], "views": c["view_count"],
                         "thumb": c["thumbnail_url"]} for c in cl]
    except Exception as e:
        print("twitch failed:", e)

# YouTube: 3 latest videos from the public RSS feed (no key needed)
try:
    if not new["channel_id"]:
        page = get("https://www.youtube.com/@" + YT_HANDLE)
        m = re.search(r"channel_id=(UC[\w-]{22})", page) or re.search(r'"channelId":"(UC[\w-]{22})"', page)
        new["channel_id"] = m.group(1) if m else None
    if new["channel_id"]:
        root = ET.fromstring(get("https://www.youtube.com/feeds/videos.xml?channel_id=" + new["channel_id"]))
        ns = {"a": "http://www.w3.org/2005/Atom", "yt": "http://www.youtube.com/xml/schemas/2015"}
        vids = [{"id": e.find("yt:videoId", ns).text, "title": e.find("a:title", ns).text,
                 "published": e.find("a:published", ns).text} for e in root.findall("a:entry", ns)[:3]]
        if vids:
            new["videos"], new["youtube"] = vids, {k: vids[0][k] for k in ("id", "title")}
except Exception as e:
    print("youtube failed:", e)

# Rewrite only on real changes (view counts alone don't count) or as a ~30 min heartbeat
ids = lambda d: [c["id"] for c in (d.get("clips") or [])]
same = all(old.get(k) == new[k] for k in new if k != "clips") and ids(old) == ids(new)
if not same or time.time() - old.get("updated", 0) > 1800:
    new["updated"] = int(time.time())
    json.dump(new, open("status.json", "w"), indent=1)
