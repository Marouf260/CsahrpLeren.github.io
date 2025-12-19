import os
import re

ROOT_DIR = '.'
HTML_EXT = '.html'

def inject_translation_keys(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    modified = False

    # Define the mapping for callout titles
    # From: <div class="callout-title">⚠️ Waarschuwing</div>
    # To: <div class="callout-title" data-i18n="callout_warning">⚠️ Waarschuwing</div>
    
    replacements = [
        (r'<div class="callout-title">⚠️ Waarschuwing</div>', '<div class="callout-title" data-i18n="callout_warning">⚠️ Waarschuwing</div>'),
        (r'<div class="callout-title">ℹ Info</div>', '<div class="callout-title" data-i18n="callout_info">ℹ Info</div>'),
        (r'<div class="callout-title">✅ Succes</div>', '<div class="callout-title" data-i18n="callout_success">✅ Succes</div>'),
        (r'<div class="callout-title">❌ Fout</div>', '<div class="callout-title" data-i18n="callout_error">❌ Fout</div>'),
        (r'<div class="callout-title">ℹ Informatie</div>', '<div class="callout-title" data-i18n="callout_info">ℹ Informatie</div>'),
    ]

    for old, new in replacements:
        if old in content:
            content = content.replace(old, new)
            modified = True
        elif re.search(old, content):
            content = re.sub(old, new, content)
            modified = True

    if modified:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Injected i18n keys into {file_path}")

def main():
    count = 0
    for root, dirs, files in os.walk(ROOT_DIR):
        for file in files:
            if file.endswith(HTML_EXT):
                path = os.path.join(root, file)
                inject_translation_keys(path)
                count += 1
    print(f"Scanned {count} files.")

if __name__ == '__main__':
    main()
