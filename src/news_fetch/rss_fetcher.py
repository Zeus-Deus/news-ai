import hashlib
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

import feedparser


def fingerprint(source_url: str, title: str, summary: str) -> str:
	joined = f"{source_url}\n{title}\n{summary}".encode("utf-8")
	return hashlib.sha256(joined).hexdigest()


def to_iso8601(published_struct: Optional[Any]) -> Optional[str]:
	if not published_struct:
		return None
	try:
		# feedparser uses time.struct_time; convert to UTC ISO 8601
		published_dt = datetime(
			year=published_struct.tm_year,
			month=published_struct.tm_mon,
			day=published_struct.tm_mday,
			hour=published_struct.tm_hour,
			minute=published_struct.tm_min,
			second=published_struct.tm_sec,
			tzinfo=timezone.utc,
		)
		return published_dt.isoformat()
	except Exception:
		return None


def extract_body_html(entry: Any) -> str:
	# Prefer full HTML content if available, otherwise fall back to summary
	content = ""
	if hasattr(entry, "content") and entry.content:
		first = entry.content[0]
		content = getattr(first, "value", "") or first.get("value", "")
	if not content:
		content = getattr(entry, "summary", "") or entry.get("summary", "")
	return content or ""


def parse_rss_feed(feed_url: str) -> List[Dict[str, Optional[str]]]:
	parsed = feedparser.parse(feed_url)
	articles: List[Dict[str, Optional[str]]] = []

	for entry in parsed.entries:
		source_url = getattr(entry, "link", "") or entry.get("link", "") or ""
		title = getattr(entry, "title", "") or entry.get("title", "") or ""
		summary = getattr(entry, "summary", "") or entry.get("summary", "") or ""
		body_html = extract_body_html(entry)

		# published can be in different fields; prefer published_parsed then updated_parsed
		published_struct = getattr(entry, "published_parsed", None) or entry.get("published_parsed")
		if not published_struct:
			published_struct = getattr(entry, "updated_parsed", None) or entry.get("updated_parsed")
		published_at = to_iso8601(published_struct)

		article_fingerprint = fingerprint(source_url, title, summary)

		articles.append(
			{
				"fingerprint": article_fingerprint,
				"source_url": source_url,
				"title": title,
				"body_html": body_html,
				"published_at": published_at,
			}
		)

	return articles


def main() -> None:
	# Example RSS feed (NYT World)
	feed_url = "https://rss.nytimes.com/services/xml/rss/nyt/World.xml"
	articles = parse_rss_feed(feed_url)

	for idx, article in enumerate(articles[:20], start=1):
		print(f"Article {idx}:")
		print(f"  fingerprint : {article['fingerprint']}")
		print(f"  source_url  : {article['source_url']}")
		print(f"  title       : {article['title']}")
		print(f"  published_at: {article['published_at']}")
		# Print a shortened body to keep output readable
		body_preview = (article['body_html'] or "").strip().replace("\n", " ")
		if len(body_preview) > 200:
			body_preview = body_preview[:200] + "..."
		print(f"  body_html   : {body_preview}")
		print()


if __name__ == "__main__":
	main() 