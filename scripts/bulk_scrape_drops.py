"""Bulk scrape drop data for multiple materials from taskbarhero.wiki."""
import urllib.request
import re
import json
import ssl
import os
import time

ssl_context = ssl.create_default_context()
ssl_context.check_hostname = False
ssl_context.verify_mode = ssl.CERT_NONE

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml',
    'Accept-Language': 'en-US,en;q=0.9',
}

def fetch(url):
    req = urllib.request.Request(url, headers=HEADERS)
    try:
        return urllib.request.urlopen(req, timeout=15, context=ssl_context).read().decode('utf-8', errors='ignore')
    except Exception as e:
        return None

def extract_drop_data(html_content, item_name):
    """Extract drop data from a wiki item page."""
    json_scripts = re.findall(r'<script[^>]*type="application/json"[^>]*>(.*?)</script>', html_content, re.DOTALL)
    results = []
    for js in json_scripts:
        try:
            data = json.loads(js)
            if isinstance(data, dict) and 'body' in data:
                body = json.loads(data['body']) if isinstance(data['body'], str) else data['body']
                if isinstance(body, list) and len(body) > 0:
                    if isinstance(body[0], dict) and 'via' in body[0] and 'box' in body[0]:
                        results = body
                        break
        except:
            pass
    return results

OUT_DIR = 'D:/Vir/tbh-fan-site/data/external_scraped/drops'
os.makedirs(OUT_DIR, exist_ok=True)

# List of items to scrape (GSC-queried materials + more)
ITEMS_TO_SCRAPE = [
    # High-priority GSC materials
    'copper-nugget',
    'silver-ingot',
    'bronze-ingot',
    'iron-ingot',
    'wood',
    'stardust-ingot',
    # Other common materials
    'gold-ingot',
    'darksteel-ingot',
    'leather',
    'healing-herb',
    'poisonous-herb',
    'mandrake-root',
    'wyvern-claw',
    'skeleton-bone',
    'titan-marrow',
    'coral-piece',
    'obsidian-shard',
    'jade-stone',
    # Gems (minor)
    'minor-ruby',
    'minor-sapphire',
    'minor-topaz',
    'minor-emerald',
    'minor-amethyst',
    # Soul stones
    'soulstone-normal',
    'soulstone-torment',
    'soulstone-nightmare',
    'soulstone-hell',
    # Coins
    'kingdom-1st-anniversary-coin',
    'empire-1st-anniversary-coin',
]

all_drops = {}

for i, slug in enumerate(ITEMS_TO_SCRAPE):
    url = f'https://taskbarhero.wiki/items/{slug}'
    print(f'[{i+1}/{len(ITEMS_TO_SCRAPE)}] Fetching: {slug}...')

    content = fetch(url)
    if content:
        drops = extract_drop_data(content, slug)
        if drops:
            all_drops[slug] = drops
            total_sources = len(drops)
            total_stages = sum(len(d['stages']) for d in drops)
            print(f'  Found {total_sources} drop sources, {total_stages} total stages')
            # Save individual file
            with open(os.path.join(OUT_DIR, f'{slug}_drops.json'), 'w', encoding='utf-8') as f:
                json.dump(drops, f, ensure_ascii=False, indent=2)
        else:
            print(f'  No drop data found')
    else:
        print(f'  ERROR: Could not fetch')

    time.sleep(0.5)  # Be polite

# Save combined file
with open(os.path.join(OUT_DIR, '_all_drops.json'), 'w', encoding='utf-8') as f:
    json.dump(all_drops, f, ensure_ascii=False, indent=2)

print(f'\n=== SUMMARY ===')
print(f'Total items scraped: {len(ITEMS_TO_SCRAPE)}')
print(f'Items with drop data: {len(all_drops)}')
print(f'Items without drop data: {len(ITEMS_TO_SCRAPE) - len(all_drops)}')

# Show what we collected
for slug, drops in all_drops.items():
    total_stages = sum(len(d['stages']) for d in drops)
    print(f'  {slug}: {len(drops)} boxes, {total_stages} stages')

print(f'\nData saved to: {OUT_DIR}')
