"""Update public creator status while preserving last-known-good data on API failures.
Source timestamps advance only after that source has been fetched and validated.
"""
import json
import os
import re
import time
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET
from pathlib import Path

STATUS_PATH = Path("status.json")
TWITCH_LOGIN = os.environ.get("TWITCH_LOGIN", "krak8_")
YT_HANDLE = os.environ.get("YT_HANDLE", "Krak8")
UA = {"User-Agent": "Mozilla/5.0 (status-bot)"}


def get(url, headers=None, data=None, timeout=15):
    req = urllib.request.Request(url, headers=headers or UA, data=data)
    with urllib.request.urlopen(req, timeout=timeout) as response:
        return response.read().decode("utf-8")


def read_old():
    try:
        value = json.loads(STATUS_PATH.read_text(encoding="utf-8"))
        return value if isinstance(value, dict) else {}
    except (OSError, ValueError):
        return {}


def valid_video(video):
    return (isinstance(video, dict) and re.fullmatch(r"[\w-]{11}", str(video.get("id", "")))
            and isinstance(video.get("title"), str) and isinstance(video.get("published"), str))


def signature(data):
    """What counts as a real change: ignores timestamps and clip view counts."""
    clips = [{k: v for k, v in c.items() if k != "views"} for c in (data.get("clips") or []) if isinstance(c, dict)]
    return json.dumps([data.get("videos"), clips, data.get("channel_id"), data.get("twitch")], sort_keys=True)


def run():
    old = read_old()
    new = {key: old.get(key) for key in ("videos", "clips", "channel_id", "twitch_updated", "youtube_updated") if key in old}
    new["videos"] = old.get("videos", []) if isinstance(old.get("videos", []), list) else []
    new["clips"] = old.get("clips", []) if isinstance(old.get("clips", []), list) else []
    new["twitch"] = old.get("twitch") if isinstance(old.get("twitch"), dict) else {"live": False}
    now = int(time.time())
    twitch_ok = False
    youtube_ok = False

    cid, secret = os.environ.get("TWITCH_CLIENT_ID"), os.environ.get("TWITCH_CLIENT_SECRET")
    if cid and secret:
        try:
            token_data = json.loads(get("https://id.twitch.tv/oauth2/token", data=urllib.parse.urlencode(
                {"client_id": cid, "client_secret": secret, "grant_type": "client_credentials"}).encode()))
            token = token_data["access_token"]
            headers = {"Client-Id": cid, "Authorization": "Bearer " + token}
            login = urllib.parse.quote(TWITCH_LOGIN)
            streams = json.loads(get("https://api.twitch.tv/helix/streams?user_login=" + login, headers=headers))["data"]
            if not isinstance(streams, list):
                raise ValueError("Unexpected Twitch streams response")
            if streams:
                stream = streams[0]
                new["twitch"] = {"live": True, "title": str(stream.get("title", "")),
                                 "game": str(stream.get("game_name", "")), "viewers": int(stream.get("viewer_count", 0))}
            else:
                new["twitch"] = {"live": False}
            users = json.loads(get("https://api.twitch.tv/helix/users?login=" + login, headers=headers))["data"]
            if not users:
                raise ValueError("Twitch user lookup returned no user")
            user_id = users[0]["id"]
            clips = json.loads(get("https://api.twitch.tv/helix/clips?first=6&broadcaster_id=" + urllib.parse.quote(str(user_id)), headers=headers))["data"]
            if not isinstance(clips, list):
                raise ValueError("Unexpected Twitch clips response")
            new["clips"] = [{"id": c["id"], "url": c["url"], "title": c.get("title", "Clip"),
                              "views": int(c.get("view_count", 0)), "thumb": c.get("thumbnail_url", "")}
                             for c in clips if isinstance(c, dict) and c.get("id") and c.get("url")]
            new["twitch_updated"] = now
            twitch_ok = True
        except Exception as exc:  # retain the last known good state, but do not refresh its timestamp
            print("Twitch refresh failed; preserving previous data:", exc)

    try:
        channel_id = new.get("channel_id")
        if not channel_id:
            page = get("https://www.youtube.com/@" + urllib.parse.quote(YT_HANDLE))
            match = re.search(r"channel_id=(UC[\w-]{22})", page) or re.search(r'"channelId":"(UC[\w-]{22})"', page)
            channel_id = match.group(1) if match else None
        if channel_id:
            root = ET.fromstring(get("https://www.youtube.com/feeds/videos.xml?channel_id=" + urllib.parse.quote(channel_id)))
            ns = {"a": "http://www.w3.org/2005/Atom", "yt": "http://www.youtube.com/xml/schemas/2015"}
            videos = []
            for entry in root.findall("a:entry", ns)[:3]:
                video_id = entry.findtext("yt:videoId", default="", namespaces=ns)
                title = entry.findtext("a:title", default="", namespaces=ns)
                published = entry.findtext("a:published", default="", namespaces=ns)
                if not re.fullmatch(r"[\w-]{11}", video_id) or not title or not published:
                    continue
                videos.append({"id": video_id, "title": title, "published": published,
                               "url": "https://www.youtube.com/watch?v=" + video_id,
                               "thumb": "https://i.ytimg.com/vi/" + video_id + "/hqdefault.jpg"})
            if videos:
                new["videos"] = videos
                new["channel_id"] = channel_id
                new["youtube_updated"] = now
                youtube_ok = True
    except Exception as exc:
        print("YouTube refresh failed; preserving previous data:", exc)

    # Compatibility timestamp is only a general file update marker; frontend freshness
    # is based on source-specific timestamps, never this heartbeat.
    old_updated = old.get("updated", 0)
    age = now - (old_updated if isinstance(old_updated, (int, float)) else 0)
    first_stamp = (twitch_ok and "twitch_updated" not in old) or (youtube_ok and "youtube_updated" not in old)
    # Commit only on real changes, the first time the new timestamps appear, or as a ~25 min heartbeat
    if signature(old) != signature(new) or first_stamp or age > 1500:
        new["updated"] = now
        tmp = STATUS_PATH.with_suffix(".json.tmp")
        tmp.write_text(json.dumps(new, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
        tmp.replace(STATUS_PATH)
    print(f"Status complete: Twitch refreshed={twitch_ok}; YouTube refreshed={youtube_ok}")


if __name__ == "__main__":
    run()
