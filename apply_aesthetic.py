import os
import re

ROOT_DIR = '.'
HTML_EXT = '.html'

def apply_aesthetic(file_path):
    # Skip non-html and specific files if needed
    if not file_path.endswith(HTML_EXT): return
    
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    modified = False

    # 1. Standardize Project/Tutorial Layout (.content-container wrapper)
    # Target: <main class="main-content"> ... content ... </main>
    # Result: <main class="main-content"><div class="content-container"> ... content ... </div></main>
    
    # Check if main-content already contains content-container
    if '<main class="main-content">' in content and '<div class="content-container">' not in content:
        # Avoid double wrapping or wrapping empty ones
        content = content.replace('<main class="main-content">', '<main class="main-content"><div class="content-container">')
        # We need to find the matching </main>
        content = content.replace('</main>', '</div></main>')
        modified = True

    # 2. Convert old Alerts to Callouts
    alert_pattern = r'<div class="alert alert-(\w+)"(.*?)>\s*(?:<strong>(.*?)</strong>)?\s*(.*?)\s*</div>'
    def alert_repl(match):
        atype = match.group(1)
        title = match.group(3)
        body = match.group(4)
        
        icon = "ℹ️"
        if atype == 'warning': icon = "⚠️"
        elif atype == 'success': icon = "✅"
        elif atype == 'danger': icon = "❌"
        
        if not title:
            title = atype.capitalize()
            
        # Clean title
        title = re.sub(r'(Waarschuwing|Warning|Info|Tip):\s*', '', title, flags=re.I)
        
        return f'<div class="callout callout-{atype}"><div class="callout-title">{icon} {title}</div>{body}</div>'

    if re.search(alert_pattern, content, re.DOTALL):
        content = re.sub(alert_pattern, alert_repl, content, flags=re.DOTALL)
        modified = True

    # 3. Clean up double emojis (safety from previous runs)
    double_emoji_pattern = r'<div class="callout-title">([⚠️ℹ️✅❌])\s*([⚠️ℹ️✅❌])\s*'
    if re.search(double_emoji_pattern, content):
        content = re.sub(double_emoji_pattern, r'<div class="callout-title">\1 ', content)
        modified = True

    # 4. Handle specific title-less callouts (Fixing "⚠️ ⚠️ ")
    if '<div class="callout-title">⚠️ Waarschuwing</div>' not in content and 'callout-warning' in content:
         content = content.replace('<div class="callout-title">⚠️  </div>', '<div class="callout-title">⚠️ Waarschuwing</div>')
         content = content.replace('<div class="callout-title">⚠️ </div>', '<div class="callout-title">⚠️ Waarschuwing</div>')

    if modified:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Standardized {file_path}")

def main():
    count = 0
    for root, dirs, files in os.walk(ROOT_DIR):
        for file in files:
            path = os.path.join(root, file)
            # Skip templates or already processed if needed
            if 'template' in file.lower(): continue
            apply_aesthetic(path)
            count += 1
    print(f"Processed {count} files.")

if __name__ == "__main__":
    main()
