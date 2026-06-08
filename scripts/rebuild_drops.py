"""Rebuild drops.json from scraped files, handling edge cases."""
import json, os, glob

drops_dir = 'D:/Vir/tbh-fan-site/data/external_scraped/drops'
all_drops = {}

for f in glob.glob(os.path.join(drops_dir, '*_drops.json')):
    slug = os.path.basename(f).replace('_drops.json', '')
    with open(f, 'r', encoding='utf-8') as fp:
        data = json.load(fp)

    if not data or not isinstance(data, list):
        all_drops[slug] = []
        continue

    sources = []
    for entry in data:
        if not isinstance(entry, dict):
            continue
        if 'box' not in entry or 'stages' not in entry:
            continue

        box = entry['box']
        pct = entry.get('pct', {})

        stages = []
        for s in entry.get('stages', []):
            stages.append({
                'key': s.get('key', 0),
                'act': s.get('act', 0),
                'no': s.get('no', 0),
                'diff': s.get('diff', ''),
                'slug': s.get('slug', ''),
                'rate': s.get('rate', 0)
            })

        sources.append({
            'box_name': box.get('name', {}).get('en-US', ''),
            'box_type': entry.get('via', ''),
            'box_grade': box.get('grade', ''),
            'box_slug': box.get('slug', ''),
            'drop_chance': pct.get('base', 0),
            'drop_chance_hunter': pct.get('hunter', pct.get('base', 0)),
            'drop_chance_slayer': pct.get('slayer', pct.get('base', 0)),
            'drop_chance_both': pct.get('both', pct.get('base', 0)),
            'stages': stages
        })

    all_drops[slug] = sources

# Save
out_path = 'D:/Vir/tbh-fan-site/data/generated/drops.json'
os.makedirs(os.path.dirname(out_path), exist_ok=True)
with open(out_path, 'w', encoding='utf-8') as f:
    json.dump(all_drops, f, ensure_ascii=False, indent=2)

items_with_data = sum(1 for v in all_drops.values() if v)
items_without = sum(1 for v in all_drops.values() if not v)
size_kb = os.path.getsize(out_path) / 1024

print(f'drops.json rebuilt successfully')
print(f'  Items with drop data: {items_with_data}')
print(f'  Items without drop data: {items_without}')
print(f'  File size: {size_kb:.0f} KB')
print(f'  Output: {out_path}')
