import json
import os

input_file = r'C:\gad\simba-2\simba_products.json'
output_file = r'C:\gad\simba-2\simba_products_formatted.json'

with open(input_file, 'r', encoding='utf-8') as f:
    data = json.load(f)

store = data.get('store', {})
products = data.get('products', [])

# Format the output manually to ensure one product per line
with open(output_file, 'w', encoding='utf-8') as f:
    f.write('{\n')
    f.write('  "store": {\n')
    store_items = list(store.items())
    for i, (k, v) in enumerate(store_items):
        line = f'    "{k}": {json.dumps(v)}'
        if i < len(store_items) - 1:
            line += ','
        f.write(line + '\n')
    f.write('  },\n')
    f.write('  "products": [\n')
    for i, p in enumerate(products):
        line = '    ' + json.dumps(p)
        if i < len(products) - 1:
            line += ','
        f.write(line + '\n')
    f.write('  ]\n')
    f.write('}\n')

# Calculate statistics
categories = {}
for p in products:
    cat = p.get('category', 'Unknown')
    categories[cat] = categories.get(cat, 0) + 1

print("Unique Categories and Product Counts:")
for cat, count in sorted(categories.items()):
    print(f"{cat}: {count}")
