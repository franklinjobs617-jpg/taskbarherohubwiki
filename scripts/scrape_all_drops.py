"""Bulk scrape drop data for ALL 125 materials from taskbarhero.wiki."""
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
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    'Accept': 'text/html,application/xhtml+xml',
    'Accept-Language': 'en-US,en;q=0.9',
}

def fetch(url):
    req = urllib.request.Request(url, headers=HEADERS)
    try:
        return urllib.request.urlopen(req, timeout=15, context=ssl_context).read().decode('utf-8', errors='ignore')
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
    """Convert raw drop data to our structured format."""
    sources = []
    for entry in raw_drops:
        stages = []
        for s in entry['stages']:
            stages.append({
                'key': s['key'],
                'act': s['act'],
                'no': s['no'],
                'diff': s['diff'],
                'slug': s['slug'],
                'rate': s['rate']
            })

        pct = entry['pct']
        sources.append({
            'box_name': entry['box']['name']['en-US'],
            'box_type': entry['via'],
            'box_grade': entry['box']['grade'],
            'box_slug': entry['box']['slug'],
            'drop_chance': pct['base'],
            'drop_chance_hunter': pct.get('hunter', pct['base']),
            'drop_chance_slayer': pct.get('slayer', pct['base']),
            'drop_chance_both': pct.get('both', pct['base']),
            'stages': stages
        })
    return sources

# Load all items to get material slugs
with open('D:/Vir/tbh-fan-site/tbh_data/items.json', 'r', encoding='utf-8') as f:
    all_items = json.load(f)

materials = [i for i in all_items if i['type'] == 'MATERIAL']
print(f'Total materials to scrape: {len(materials)}')

OUT_DIR = 'D:/Vir/tbh-fan-site/data/external_scraped/drops'
os.makedirs(OUT_DIR, exist_ok=True)

all_drops = {}
success = 0
failed = 0
no_data = 0

for i, mat in enumerate(materials):
    slug = mat['slug']
    name = mat['name'].get('en-US', slug)
    out_file = os.path.join(OUT_DIR, f'{slug}_drops.json')

    # Skip if already scraped
    if os.path.exists(out_file):
        with open(out_file, 'r', encoding='utf-8') as f:
            existing = json.load(f)
        all_drops[slug] = existing
        success += 1
        continue

    url = f'https://taskbarhero.wiki/items/{slug}'
    print(f'[{i+1}/{len(materials)}] {name} ({slug})...', end=' ')

    content = fetch(url)
    if not content:
        print('FETCH FAILED')
        failed += 1
        continue

    raw_drops = extract_drop_data(content)
    if not raw_drops:
        print('no drop data')
        no_data += 1
        all_drops[slug] = []
        continue

    transformed = transform_drops(raw_drops)
    all_drops[slug] = transformed

    with open(out_file, 'w', encoding='utf-8') as f:
        json.dump(transformed, f, ensure_ascii=False, indent=2)

    n_boxes = len(transformed)
    n_stages = sum(len(s['stages']) for s in transformed)
    print(f'{n_boxes} boxes, {n_stages} stages')
    success += 1

    time.sleep(0.3)

# Save combined file
combined_path = os.path.join(OUT_DIR, '_all_drops.json')
with open(combined_path, 'w', encoding='utf-8') as f:
    json.dump(all_drops, f, ensure_ascii=False, indent=2)

# Also save as our integrated drops.json format
integrated_path = 'D:/Vir/tbh-fan-site/data/generated/drops.json'
os.makedirs('D:/Vir/tbh-fan-site/data/generated', exist_ok=True)
with open(integrated_path, 'w', encoding='utf-8') as f:
    json.dump(all_drops, f, ensure_ascii=False, indent=2)

print(f'\n{"="*50}')
print(f'DONE: {success} success, {failed} failed, {no_data} no data')
print(f'Total items with drops: {sum(1 for v in all_drops.values() if v)}')
print(f'Combined file: {combined_path}')
print(f'Integrated file: {integrated_path}')
print(f'Size: {os.path.getsize(integrated_path)/1024:.0f} KB')
