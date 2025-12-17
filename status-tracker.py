import feedparser
import time
from datetime import datetime
import re

from config import FEED_URL, CHECK_INTERVAL_SECONDS


class FeedTracker:
    def __init__(self, feed_url, name="Status"):
        self.feed_url = feed_url
        self.name = name
        self.etag = None
        self.last_modified = None
        self.seen_ids = set()
        self.first_run = True
    
    def fetch(self):
        feed = feedparser.parse(
            self.feed_url,
            etag=self.etag,
            modified=self.last_modified
        )
        
        if feed.status == 304:
            return None
        
        self.etag = feed.get('etag', self.etag)
        self.last_modified = feed.get('modified', self.last_modified)
        
        if feed.bozo and feed.bozo_exception:
            print(f"[{self.name}] Feed warning: {feed.bozo_exception}")
        
        return feed
    
    def check_for_updates(self):
        feed = self.fetch()
        
        if feed is None:
            return []
        
        new_items = []
        
        for item in reversed(feed.entries):
            item_id = item.get('id') or item.get('link') or item.get('guid')
            
            if item_id not in self.seen_ids:
                self.seen_ids.add(item_id)
                if not self.first_run:
                    new_items.append(item)
        
        if self.first_run and feed.entries:
            print(f"\n[{self.name}] Latest incident at startup:")
            print_incident(feed.entries[0])
            self.first_run = False
        
        return new_items


def clean_html(raw_html):
    clean = re.sub(r'<[^>]+>', ' ', raw_html)
    clean = re.sub(r'\s+', ' ', clean)
    return clean.strip()


def extract_products(description):
    products = re.findall(r'<li>([^<]+)</li>', description)
    return [p.replace(' (Operational)', '').strip() for p in products]


def extract_status(description):
    match = re.search(r'<b>Status:\s*([^<]+)</b>', description)
    return match.group(1).strip() if match else "Unknown"


def format_time(published):
    if published:
        try:
            return datetime(*published[:6]).strftime("%Y-%m-%d %H:%M:%S")
        except:
            pass
    return datetime.now().strftime("%Y-%m-%d %H:%M:%S")


def print_incident(item):
    timestamp = format_time(item.get('published_parsed'))
    title = item.get('title', 'Unknown Incident')
    description = item.get('description', '')
    
    status = extract_status(description)
    products = extract_products(description)
    
    message = clean_html(description)
    if 'Affected components' in message:
        message = message.split('Affected components')[0]
    message = message.replace(f'Status: {status}', '').strip()
    
    print(f"\n[{timestamp}] Incident: {title}")
    print(f"Status: {status}")
    if message:
        print(f"Message: {message}")
    if products:
        print(f"Affected Products: {', '.join(products)}")
    print("-" * 60)


def main():
    print("=" * 60)
    print("OpenAI Status Tracker")
    print(f"Feed: {FEED_URL}")
    print(f"Interval: {CHECK_INTERVAL_SECONDS}s")
    print("=" * 60)
    
    tracker = FeedTracker(FEED_URL, "OpenAI")
    
    while True:
        try:
            for item in tracker.check_for_updates():
                print_incident(item)
        except Exception as e:
            print(f"Error: {e}")
        
        time.sleep(CHECK_INTERVAL_SECONDS)


if __name__ == "__main__":
    main()