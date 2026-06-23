import sqlite3
import json
import os
from datetime import datetime

DB_PATH = os.getenv("DB_PATH", os.path.join(os.path.dirname(__file__), "financial_analyzer.db"))


def get_conn():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    conn = get_conn()
    conn.execute("""
        CREATE TABLE IF NOT EXISTS analyses (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            filename TEXT NOT NULL,
            data TEXT NOT NULL,
            created_at TEXT NOT NULL
        )
    """)
    conn.commit()
    conn.close()


def save_analysis(filename: str, data: dict) -> int:
    conn = get_conn()
    cur = conn.execute(
        "INSERT INTO analyses (filename, data, created_at) VALUES (?, ?, ?)",
        (filename, json.dumps(data), datetime.utcnow().isoformat()),
    )
    conn.commit()
    analysis_id = cur.lastrowid
    conn.close()
    return analysis_id


def get_analyses():
    conn = get_conn()
    rows = conn.execute(
        "SELECT id, filename, created_at FROM analyses ORDER BY created_at DESC LIMIT 50"
    ).fetchall()
    conn.close()
    return [dict(r) for r in rows]