"""Scrape competitor sites to understand what data THEY have for items we're missing."""
import urllib.request
import re
import html as html_mod
import ssl
import json

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

def extract_text(content):
    """Extract visible text from HTML."""
    text = re.sub(r'<script[^>]*>.*?</script>', '', content, flags=re.DOTALL)
    text = re.sub(r'<style[^>]*>.*?</style>', '', text, flags=re.DOTALL)
    text = re.sub(r'<[^>]+>', '\n', text)
    text = re.sub(r'\n\s*\n', '\n', text)
    lines = [l.strip() for l in text.split('\n') if l.strip()]
    return lines

# Items we need data for (GSC-queried, missing data)
TARGET_ITEMS = [
    'copper-nugget',
    'silver-ingot',
    'bronze-ingot',
    'iron-ingot',
    'wood',
    'stardust-ingot',
]

# Competitor item page URLs to check
# We need to guess their URL patterns based on what we know
COMPETITOR_PATTERNS = {
    'wiki-lol': {
        'material_page': 'https://taskbarhero-wiki.lol/materials',
        'item_page': None,  # We'll find from materials page
    },
    'tbh.city': {
        'material_page': None,
        'item_page': None,
        'api_hint': 'https://tbh.city/items',  # They might have an API
    },
    'taskbarhero.wiki': {
        'material_page': 'https://taskbarhero.wiki/materials',
        'item_page': None,
    },
    'taskbarhero.org': {
        'material_page': 'https://taskbarhero.org/en/items/',
        'item_page': None,
    },
}

print("=" * 80)
print("COMPETITOR DATA SCRAPING — What data do they have for our missing items?")
print("=" * 80)

# 1. Scrape competitor materials pages
for name, patterns in COMPETITOR_PATTERNS.items():
    print(f"\n{'='*60}")
    print(f"COMPETITOR: {name}")
    print(f"{'='*60}")

    if patterns.get('material_page'):
        url = patterns['material_page']
        content = fetch(url)
        if content:
            lines = extract_text(content)
            print(f"  URL: {url}")
            print(f"  Page size: {len(content):,} bytes, {len(lines)} text lines")

            # Look for copper nugget mentions
            copper_lines = []
            for i, line in enumerate(lines):
                if 'copper' in line.lower() or '銅' in line:
                    copper_lines.append((i, line[:200]))

            if copper_lines:
                print(f"  Copper nugget mentions: {len(copper_lines)}")
                for idx, line in copper_lines[:5]:
                    print(f"    Line {idx}: {line}")
            else:
                print(f"  No copper nugget mentions found in text")
                # Show sample of what's on the page
                print(f"  Sample content (first 20 lines):")
                for line in lines[:20]:
                    print(f"    {line[:150]}")
        else:
            print(f"  ERROR: Could not fetch {url}")

# 2. Try to find individual item pages for copper nugget
print(f"\n{'='*60}")
print("SEARCHING FOR INDIVIDUAL ITEM PAGES")
print(f"{'='*60}")

# Try common URL patterns for copper nugget
item_urls = [
    'https://taskbarhero-wiki.lol/materials/copper-nugget',
    'https://taskbarhero-wiki.lol/items/copper-nugget',
    'https://taskbarhero.wiki/materials/copper-nugget',
    'https://taskbarhero.wiki/items/copper-nugget',
    'https://tbh.city/items/copper-nugget',
    'https://tbh.city/materials/copper-nugget',
    'https://taskbarhero.org/en/items/copper-nugget/',
    'https://taskbarhero.org/en/materials/copper-nugget/',
    'https://taskbarhero.app/items/copper-nugget',
]

for url in item_urls:
    content = fetch(url)
    if content:
        lines = extract_text(content)
        # Look for key data points
        has_drops = any('drop' in l.lower() and ('stage' in l.lower() or 'rate' in l.lower() or 'source' in l.lower()) for l in lines)
        has_effects = any('effect' in l.lower() or 'stat' in l.lower() for l in lines)
        has_recipe = any('craft' in l.lower() or 'recipe' in l.lower() or 'synthesis' in l.lower() for l in lines)
        has_price = any('price' in l.lower() or '$' in l or 'gold' in l.lower() for l in lines)

        print(f"\n  FOUND: {url}")
        print(f"    Lines: {len(lines)}, Has drops: {has_drops}, Has effects: {has_effects}, Has recipe: {has_recipe}, Has price: {has_price}")
        print(f"    First 30 lines:")
        for line in lines[:30]:
            print(f"      {line[:200]}")
        break  # Found one, stop searching
    else:
        pass  # 404, keep trying

# 3. Check if competitors expose any API endpoints
print(f"\n{'='*60}")
print("CHECKING FOR API ENDPOINTS")
print(f"{'='*60}")

api_checks = [
    'https://tbh.city/api/items/copper-nugget',
    'https://tbh.city/api/items/140004',
    'https://taskbarhero.wiki/api/items/copper-nugget',
    'https://taskbarhero-wiki.lol/api/items/copper-nugget',
]

for url in api_checks:
    try:
        req = urllib.request.Request(url, headers={**HEADERS, 'Accept': 'application/json'})
        resp = urllib.request.urlopen(req, timeout=10, context=ssl_context)
        data = resp.read().decode('utf-8', errors='ignore')
        if data and len(data) > 10:
            print(f"\n  API FOUND: {url}")
            print(f"    Response ({len(data)} bytes): {data[:500]}")
    except:
        pass

print("\nDONE")
