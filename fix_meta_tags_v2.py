import os

target_dir = r"c:/Users/marou/OneDrive - ROC Alfa-college/Bureaublad/BELANGRIJJK C#/"

# Based on user's screenshot
base_url = "https://marouf260.github.io/csahrpLerenLeren.github.io/"
image_url = base_url + "img/preview.png?v=2" # Cache buster

# Robust Meta Tags
meta_tags_new = f"""
    <!-- SOCIAL MEDIA META TAGS -->
    <meta property="og:title" content="C# Masterclass | Zero to Hero">
    <meta property="og:description" content="Leer C# bouwen met premium tutorials en 30+ projecten. Van Console tot API's.">
    <meta property="og:image" content="{image_url}">
    <meta property="og:image:type" content="image/png">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    <meta property="og:url" content="{base_url}">
    <meta property="og:type" content="website">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="C# Masterclass">
    <meta name="twitter:description" content="Word een C# pro met interactieve lessen.">
    <meta name="twitter:image" content="{image_url}">
"""

count = 0

for root, dirs, files in os.walk(target_dir):
    for file in files:
        if file.endswith(".html"):
            path = os.path.join(root, file)
            
            try:
                with open(path, "r", encoding="utf-8") as f:
                    content = f.read()
                
                # Strip old block if exists using start marker
                if "<!-- SOCIAL MEDIA META TAGS -->" in content:
                    lines = content.splitlines()
                    new_lines = []
                    skip = False
                    for line in lines:
                        if "<!-- SOCIAL MEDIA META TAGS -->" in line:
                            skip = True
                            new_lines.append(meta_tags_new.strip())
                        elif skip and "twitter:image" in line:
                            skip = False
                        elif skip:
                            continue
                        else:
                            new_lines.append(line)
                    new_content = "\n".join(new_lines)
                else:
                    # Inject if missing
                    if "</head>" in content:
                        new_content = content.replace("</head>", meta_tags_new + "\n</head>")
                    else:
                        continue

                with open(path, "w", encoding="utf-8") as f:
                    f.write(new_content)
                    
                count += 1

            except Exception as e:
                print(f"Error processing {file}: {e}")

print(f"Total files updated: {count}")
