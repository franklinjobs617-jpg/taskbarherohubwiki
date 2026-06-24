"""Download monster/boss images from taskbarhero.wiki to fill our asset gaps."""
import urllib.request
import json
import os
import ssl
import time

ssl_context = ssl.create_default_context()
ssl_context.check_hostname = False
ssl_context.verify_mode = ssl.CERT_NONE

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
}

BASE_URL = 'https://taskbarhero.wiki'
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
ROOT_DIR = os.path.dirname(SCRIPT_DIR)
PUBLIC_DIR = os.path.join(ROOT_DIR, 'public', 'game', 'monsters')
os.makedirs(PUBLIC_DIR, exist_ok=True)

def download(url, dest):
    if os.path.exists(dest):
        return 'skipped'
    try:
        req = urllib.request.Request(url, headers=HEADERS)
        resp = urllib.request.urlopen(req, timeout=15, context=ssl_context)
        os.makedirs(os.path.dirname(dest), exist_ok=True)
        with open(dest, 'wb') as f:
            f.write(resp.read())
        return 'ok'
    except Exception as e:
        return f'error: {e}'

# 1. Load monster data to get portrait paths
with open(os.path.join(ROOT_DIR, 'tbh_data', 'monsters.json'), 'r', encoding='utf-8') as f:
    monsters = json.load(f)

print(f'=== DOWNLOADING MONSTER PORTRAITS ({len(monsters)} monsters) ===')
success = 0
for m in monsters:
    name = m.get('MonsterNameStringKey_i18n', {}).get('en-US', '?')
    portrait = m.get('portrait', '')
    if not portrait:
        continue

    # Clean path: /game/monsters/BasicSlime/BasicSlime_Idle_character_3.png
    clean_path = portrait.lstrip('/')
    dest = os.path.join(PUBLIC_DIR, os.path.basename(os.path.dirname(clean_path)),
                         os.path.basename(clean_path))
    url = f'{BASE_URL}/{clean_path}'

    result = download(url, dest)
    if result == 'ok':
        print(f'  [+] {name}: {os.path.basename(clean_path)}')
        success += 1
    elif result == 'skipped':
        success += 1
    else:
        print(f'  [-] {name}: {result}')
    time.sleep(0.1)

print(f'\nMonster portraits: {success}/{len(monsters)}')

# 2. Load stage data for boss portraits
with open(os.path.join(ROOT_DIR, 'tbh_data', 'stages.json'), 'r', encoding='utf-8') as f:
    stages = json.load(f)

print(f'\n=== DOWNLOADING BOSS PORTRAITS ({len(stages)} stages) ===')
boss_success = 0
for s in stages:
    boss = s.get('boss')
    if not boss:
        continue
    portrait = boss.get('portrait', '')
    if not portrait:
        continue

    clean_path = portrait.lstrip('/')
    dest = os.path.join(PUBLIC_DIR, os.path.basename(os.path.dirname(clean_path)),
                         os.path.basename(clean_path))
    url = f'{BASE_URL}/{clean_path}'

    result = download(url, dest)
    if result in ('ok', 'skipped'):
        boss_success += 1
    else:
        pass  # Silently skip boss download errors

print(f'Boss portraits: {boss_success}')

print(f'\nDone! Files in: {PUBLIC_DIR}')
