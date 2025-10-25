from flask import Flask, render_template_string, request, jsonify
from datetime import datetime
from markupsafe import escape

app = Flask(__name__)

# super-lightweight in-memory "storage" for the demo
MESSAGES = []  # each item: {"id": int, "text": str, "ts": iso-string}

PAGE = None

with open("./homepage.html", "r", encoding="utf-8") as file:
    PAGE = file.read()


@app.route("/", methods=["GET", "POST"])
def index():
    return render_template_string(PAGE)


# gotta add this i guess
@app.route("/chart.js")
def get_chartjs():
    with open("./chart.js", "r", encoding="utf-8") as file:
        return file.read()


@app.route("/frontend.js")
def get_frontendjs():
    with open("./frontend.js", "r", encoding="utf-8") as file:
        return file.read()


@app.get("/api/messages")
def get_messages():
    # return newest first
    return jsonify(list(reversed(MESSAGES)))


@app.post("/api/messages")
def create_message():
    data = request.get_json(silent=True) or {}
    text = (data.get("text") or "").strip()

    if not text:
        return jsonify({"error": "Text is required."}), 400
    if len(text) > 5000:
        return jsonify({"error": "Text too long (max 5000 chars)."}), 413

    # Escape on the server as belt + suspenders (client also uses textContent)
    safe_text = escape(text)
    msg = {
        "id": len(MESSAGES) + 1,
        "text": str(safe_text),
        "ts": datetime.utcnow().isoformat() + "Z",
    }
    MESSAGES.append(msg)
    return jsonify(msg), 201
