import http.server
import socketserver
import mimetypes

mimetypes.add_type("application/javascript", ".js")

Handler = http.server.SimpleHTTPRequestHandler

with socketserver.TCPServer(("", 8000), Handler) as httpd:
    print("Serving on http://localhost:8000")
    httpd.serve_forever()