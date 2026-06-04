import os
from rembg import remove
from PIL import Image

input_dir = 'public/brand/products'
output_dir = 'public/brand/products'

print(f"Processing images in {input_dir}...")
for filename in os.listdir(input_dir):
    if filename.endswith('.jpg') or filename.endswith('.png'):
        # Skip already cut out files or logo
        if 'cutout' in filename or 'logo' in filename:
            continue
            
        input_path = os.path.join(input_dir, filename)
        output_filename = os.path.splitext(filename)[0] + '-cutout.png'
        output_path = os.path.join(output_dir, output_filename)
        
        # Check if already processed
        if os.path.exists(output_path):
            print(f"Skipping {filename}, already processed.")
            continue
            
        print(f"Processing {filename}...")
        try:
            input_image = Image.open(input_path)
            output_image = remove(input_image)
            output_image.save(output_path)
            print(f"Saved to {output_path}")
        except Exception as e:
            print(f"Error processing {filename}: {e}")

print("Done!")
