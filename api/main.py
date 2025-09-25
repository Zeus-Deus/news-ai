import os
from typing import Dict, Any

import psycopg2
from fastapi import FastAPI, Query, HTTPException
from dotenv import load_dotenv

load_dotenv(dotenv_path="/usr/src/app/.env")


def conn_filtered():
    return psycopg2.connect(
        host=os.getenv("POSTGRES_HOST"),
        port=os.getenv("POSTGRES_PORT"),
        database="filtered_db",
        user="filtered_db",
        password=os.getenv("POSTGRES_DEFAULT_USER_PASSWORD"),
    )


def conn_raw():
    return psycopg2.connect(
        host=os.getenv("POSTGRES_HOST"),
        port=os.getenv("POSTGRES_PORT"),
        database="raw_db",
        user="raw_db",
        password=os.getenv("POSTGRES_DEFAULT_USER_PASSWORD"),
    )


app = FastAPI(title="News AI API", version="0.1.0")


@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/articles")
def list_articles(limit: int = Query(20, ge=1, le=100), offset: int = Query(0, ge=0)):
    with conn_filtered() as cf:
        with cf.cursor() as c:
            c.execute(
                """
                SELECT id, raw_article_id, title_translated, content_summary, processed_at, ai_model_used
                FROM filtered_articles
                ORDER BY processed_at DESC
                LIMIT %s OFFSET %s
                """,
                (limit, offset),
            )
            rows = c.fetchall()

    if not rows:
        return []

    raw_ids = [r[1] for r in rows if r[1] is not None]
    raw_map: Dict[int, Dict[str, Any]] = {}
    if raw_ids:
        with conn_raw() as cr:
            with cr.cursor() as c2:
                c2.execute(
                    """
                    SELECT id, source_url, published_at, title
                    FROM raw_articles
                    WHERE id = ANY(%s)
                    """,
                    (raw_ids,),
                )
                for rid, src, pub, title in c2.fetchall():
                    raw_map[rid] = {"source_url": src, "published_at": pub, "raw_title": title}

    result = []
    for id_, rid, title_tr, summary, processed_at, model in rows:
        raw_extra = raw_map.get(rid, {})
        result.append(
            {
                "id": id_,
                "raw_article_id": rid,
                "title": title_tr or raw_extra.get("raw_title"),
                "summary": summary,
                "processed_at": processed_at,
                "ai_model_used": model,
                "source_url": raw_extra.get("source_url"),
                "published_at": raw_extra.get("published_at"),
            }
        )
    return result


@app.get("/articles/{id}")
def get_article(id: int):
    with conn_filtered() as cf:
        with cf.cursor() as c:
            c.execute(
                """
                SELECT id, raw_article_id, title_translated, content_summary, processed_at, ai_model_used
                FROM filtered_articles WHERE id=%s
                """,
                (id,),
            )
            row = c.fetchone()
    if not row:
        raise HTTPException(status_code=404, detail="Not found")

    id_, rid, title_tr, summary, processed_at, model = row
    raw_extra = {}
    if rid:
        with conn_raw() as cr:
            with cr.cursor() as c2:
                c2.execute(
                    "SELECT source_url, published_at, title FROM raw_articles WHERE id=%s",
                    (rid,),
                )
                r2 = c2.fetchone()
                if r2:
                    raw_extra = {"source_url": r2[0], "published_at": r2[1], "raw_title": r2[2]}
    return {
        "id": id_,
        "raw_article_id": rid,
        "title": title_tr or raw_extra.get("raw_title"),
        "summary": summary,
        "processed_at": processed_at,
        "ai_model_used": model,
        "source_url": raw_extra.get("source_url"),
        "published_at": raw_extra.get("published_at"),
    }
