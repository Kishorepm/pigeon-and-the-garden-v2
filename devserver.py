"""Local preview server that never lets the browser cache anything.

    python devserver.py [port]

`python -m http.server` answers If-Modified-Since with 304, so a browser holds on
to index.html and a rebuild appears to do nothing. That is a miserable way to work:
the change is on disk, the page is stale, and it looks like the edit failed.

This serves the same files and forbids caching outright, so a rebuild plus a
refresh always shows the current build. Local only. The deployed site is served by
Vercel and is not affected.
"""
import functools
import http.server
import pathlib
import socketserver
import sys

PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8123
# Serve the repo this script lives in, not whatever directory it was launched
# from. Otherwise running it from anywhere else quietly serves the wrong tree and
# the page looks broken for reasons that have nothing to do with the page.
ROOT = pathlib.Path(__file__).resolve().parent


class NoCache(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0")
        self.send_header("Pragma", "no-cache")
        self.send_header("Expires", "0")
        super().end_headers()

    def send_head(self):
        # Drop the conditional request so the parent never answers 304.
        for h in ("If-None-Match", "If-Modified-Since"):
            while h in self.headers:
                del self.headers[h]
        return super().send_head()

    def log_message(self, fmt, *args):
        pass  # the console is for build output, not a request log


# Threading matters: a browser opens several connections at once for one page,
# and a single-threaded server makes them queue behind each other until it looks
# like the page has hung.
class Server(socketserver.ThreadingTCPServer):
    allow_reuse_address = True
    daemon_threads = True


if __name__ == "__main__":
    handler = functools.partial(NoCache, directory=str(ROOT))
    with Server(("127.0.0.1", PORT), handler) as httpd:
        print(f"serving {ROOT} on http://localhost:{PORT}  (no-cache)")
        httpd.serve_forever()
