"""Tiny mock of the Supabase REST endpoint, used to test /api/contact locally."""
import json
from http.server import BaseHTTPRequestHandler, HTTPServer

LOG = r"C:\Users\Ojama\AppData\Local\Temp\mock_supabase.log"


class Handler(BaseHTTPRequestHandler):
    def do_POST(self):
        length = int(self.headers.get("Content-Length", 0))
        body = self.rfile.read(length).decode("utf-8", "replace")
        with open(LOG, "a", encoding="utf-8") as fh:
            fh.write(json.dumps({"path": self.path, "body": body}) + "\n")
        self.send_response(201)
        self.send_header("Content-Type", "application/json")
        self.end_headers()
        self.wfile.write(b"[]")

    def log_message(self, *args):
        pass


if __name__ == "__main__":
    HTTPServer(("127.0.0.1", 4399), Handler).serve_forever()
