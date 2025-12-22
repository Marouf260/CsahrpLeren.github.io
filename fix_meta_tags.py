import os

target_dir = r"c:/Users/marou/OneDrive - ROC Alfa-college/Bureaublad/BELANGRIJJK C#/"

# Based on user's screenshot
base_url = "https://marouf260.github.io/csahrpLerenLeren.github.io/"
image_url = base_url + "img/preview.png"

# New Meta Tags (Absolute URLs)
meta_tags_new = f"""
    <!-- SOCIAL MEDIA META TAGS -->
    <meta property="og:title" content="C# Masterclass | Zero to Hero">
    <meta property="og:description" content="Leer C# bouwen met premium tutorials en 30+ projecten. Van Console tot API's.">
    <meta property="og:image" content="{image_url}">
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
                
                # Check for existing meta tags block to replace
                if "<!-- SOCIAL MEDIA META TAGS -->" in content:
                    # We need to replace the old block (which might vary depending on previous run)
                    # Easier strategy: Regex or identifying start/end. 
                    # detailed replacement:
                    
                    # Read until </head> and replace the whole block if possible or Use string replacement if we know the distinct signature
                    # Since we generated it with specific comments, we can look for that.
                    
                    # Hacky but effective: remove old property og:image lines and re-inject or just overwrite the whole file content section if strictly generated.
                    # Better: Read file, remove lines between <!-- SOCIAL MEDIA META TAGS --> and the simplified end, or just use string replace on the known previous string.
                    
                    # Previous string had a relative path which varied per file.
                    # Making a robust replacer is hard.
                    # Alternative: We overwrite the previously injected tags.
                    
                    # Let's try to identify the block start
                    start_marker = "<!-- SOCIAL MEDIA META TAGS -->"
                    start_idx = content.find(start_marker)
                    
                    if start_idx != -1:
                        # Find the end of this block. It ends before </head> usually, but we injected a block of ~8 lines.
                        # We can look for the next </head> tag as it was injected right before it.
                        # Or look for <meta name="twitter:image" ... > which was the last tag.
                        
                        # Let's just strip the old tags using unique substrings because relative paths differed.
                        lines = content.splitlines()
                        new_lines = []
                        skip = False
                        for line in lines:
                            if "<!-- SOCIAL MEDIA META TAGS -->" in line:
                                skip = True
                                # Insert new tags here
                                new_lines.append(meta_tags_new.strip())
                            elif skip and "twitter:image" in line:
                                skip = False # End of block
                            elif skip:
                                continue # Skip lines inside the block
                            else:
                                new_lines.append(line)
                        
                        new_content = "\n".join(new_lines)
                        
                        with open(path, "w", encoding="utf-8") as f:
                            f.write(new_content)
                        print(f"Updated: {file}")
                        count += 1
                        
                else:
                    # If somehow missed, inject before </head>
                     if "</head>" in content:
                        new_content = content.replace("</head>", meta_tags_new + "\n</head>")
                        with open(path, "w", encoding="utf-8") as f:
                            f.write(new_content)
                        print(f"Injected (New): {file}")
                        count += 1

            except Exception as e:
                print(f"Error processing {file}: {e}")

print(f"Total files updated: {count}")
