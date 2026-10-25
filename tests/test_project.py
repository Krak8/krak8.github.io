import importlib.util
import json
import subprocess
import sys
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location("update_status", ROOT / "scripts" / "update_status.py")
status = importlib.util.module_from_spec(spec)
spec.loader.exec_module(status)

class StatusTests(unittest.TestCase):
    def test_valid_video_shape(self):
        self.assertTrue(status.valid_video({"id":"abcdefghijk", "title":"A title", "published":"2026-01-01T00:00:00Z"}))
        self.assertFalse(status.valid_video({"id":"bad", "title":"A title", "published":"date"}))
        self.assertFalse(status.valid_video(None))

    def test_read_old_handles_missing_or_invalid_json(self):
        original = status.STATUS_PATH
        try:
            status.STATUS_PATH = ROOT / "does-not-exist-status.json"
            self.assertEqual(status.read_old(), {})
            status.STATUS_PATH.write_text("not json", encoding="utf-8")
            self.assertEqual(status.read_old(), {})
        finally:
            status.STATUS_PATH.unlink(missing_ok=True)
            status.STATUS_PATH = original

    def test_frontend_uses_source_specific_twitch_freshness(self):
        js = (ROOT / "app.js").read_text(encoding="utf-8")
        self.assertIn("s.twitch_updated", js)
        self.assertNotIn("(s.updated||0)<5400", js)
        self.assertIn("document.hidden", js)
        self.assertIn("syncCanvas", js)

    def test_status_fixture_is_valid_json_and_source_timestamps_are_not_required(self):
        data = json.loads((ROOT / "status.json").read_text(encoding="utf-8"))
        self.assertIsInstance(data.get("videos", []), list)
        self.assertIsInstance(data.get("clips", []), list)

    def test_redirects_generate_expected_aliases_and_fallback(self):
        subprocess.run([sys.executable, "scripts/make_redirects.py"], cwd=ROOT, check=True, capture_output=True, text=True)
        for path in ("dc/index.html", "discord/index.html", "yt/index.html", "youtube/index.html", "tw/index.html"):
            page = (ROOT / path).read_text(encoding="utf-8")
            self.assertIn("http-equiv=\"refresh\"", page)
            self.assertIn("Tap here if nothing happens", page)
            self.assertNotIn("location.replace", page)

    def test_signature_ignores_clip_views_and_timestamps(self):
        a = {"videos": [], "clips": [{"id": "x", "views": 1}], "twitch": {"live": False}, "twitch_updated": 1}
        b = {"videos": [], "clips": [{"id": "x", "views": 99}], "twitch": {"live": False}, "twitch_updated": 2}
        self.assertEqual(status.signature(a), status.signature(b))
        b["clips"][0]["id"] = "y"
        self.assertNotEqual(status.signature(a), status.signature(b))

if __name__ == "__main__":
    unittest.main()
