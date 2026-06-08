"""Resume scraping ONLY missing materials, then rebuild drops.json."""
import urllib.request
import re
import json
import ssl
import os
import time
import sys

ssl_context = ssl.create_default_context()
ssl_context.check_hostname = False
ssl_context.verify_mode = ssl.CERT_NONE

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    'Accept': 'text/html,application/xhtml+xml',
    'Accept-Language': 'en-US,en;q=0.9',
}

def fetch(url):
    req = urllib.request.Request(url, headers=HEADERS)
    try:
        return urllib.request.urlopen(req, timeout=20, context=ssl_context).read().decode('utf-8', errors='ignore')
    except Exception as e:
        return None

def extract_drop_data(html_content):
    json_scripts = re.findall(r'<script[^>]*type="application/json"[^>]*>(.*?)</script>', html_content, re.DOTALL)
    for js in json_scripts:
        try:
            data = json.loads(js)
            if isinstance(data, dict) and 'body' in data:
                body = json.loads(data['body']) if isinstance(data['body'], str) else data['body']
                if isinstance(body, list) and len(body) > 0:
                    if isinstance(body[0], dict) and 'via' in body[0] and 'box' in body[0]:
                        return body
        except:
            pass
    return None

def transform_drops(raw_drops):
    sources = []
    for entry in raw_drops:
        stages = []
        for s in entry.get('stages', []):
            stages.append({
                'key': s['key'], 'act': s['act'], 'no': s['no'],
                'diff': s['diff'], 'slug': s['slug'], 'rate': s['rate']
            })
        pct = entry.get('pct', {})
        sources.append({
            'box_name': entry['box']['name']['en-US'],
            'box_type': entry['via'],
            'box_grade': entry['box']['grade'],
            'box_slug': entry['box']['slug'],
            'drop_chance': pct.get('base', 0),
            'stages': stages
        })
    return sources

# Load existing drops.json
DROPS_PATH = 'D:/Vir/tbh-fan-site/data/generated/drops.json'
with open(DROPS_PATH, 'r', encoding='utf-8-sig') as f:
    existing_drops = json.load(f)

# Load all materials
with open('D:/Vir/tbh-fan-site/tbh_data/items.json', 'r', encoding='utf-8') as f:
    all_items = json.load(f)

materials = [i for i in all_items if i['type'] == 'MATERIAL']

# Find missing slugs
missing = []
for mat in materials:
    slug = mat['slug']
    if slug not in existing_drops or not existing_drops[slug]:
        missing.append(mat)

print(f'Total materials: {len(materials)}')
print(f'Already have: {len(existing_drops)}')
print(f'Missing: {len(missing)}')

if not missing:
    print('All data complete!')
    sys.exit(0)

# Scrape only missing ones
success = 0
failed = 0
for i, mat in enumerate(missing):
    slug = mat['slug']
    name = (mat.get('name') or {}).get('en-US', slug)
    url = f'https://taskbarhero.wiki/items/{slug}'

    print(f'[{i+1}/{len(missing)}] {name} ({slug})...', end=' ', flush=True)

    content = fetch(url)
    if not content:
        print('FETCH FAILED')
        failed += 1
        existing_drops[slug] = []
        continue

    raw = extract_drop_data(content)
    if not raw:
        print('no drop data')
        existing_drops[slug] = []
        continue

    transformed = transform_drops(raw)
    existing_drops[slug] = transformed
    n_boxes = len(transformed)
    n_stages = sum(len(s['stages']) for s in transformed)
    print(f'{n_boxes} boxes, {n_stages} stages')
    success += 1

    time.sleep(0.5)

# Save updated drops.json
with open(DROPS_PATH, 'w', encoding='utf-8', newline='') as f:
    json.dump(existing_drops, f, ensure_ascii=False, indent=2)

size_kb = os.path.getsize(DROPS_PATH) / 1024
print(f'\n{"="*50}')
print(f'DONE: {success} new, {failed} failed')
print(f'Total items: {len(existing_drops)}, Size: {size_kb:.0f} KB')
print(f'Saved: {DROPS_PATH}')
