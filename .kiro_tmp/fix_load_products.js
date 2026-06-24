const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'src', 'app', 'admin', 'page.tsx');
let content = fs.readFileSync(filePath, 'utf8');

const old = `    try {
      const res = await fetch('/api/admin/products');
      const data = await res.json();
      if (data.ok) setProducts(data.products);
    } catch { /* silent */ }
    setProdLoading(false);
  };`;

const updated = `    try {
      const res = await fetch('/api/admin/products');
      if (!res.ok) throw new Error('Server returned ' + res.status);
      const data = await res.json();
      if (data.ok) setProducts(data.products);
    } catch (e) {
      console.error('[admin] loadProducts:', e.message);
    }
    setProdLoading(false);
  };`;

if (!content.includes(old)) {
  console.error('Pattern not found');
  process.exit(1);
}

content = content.replace(old, updated);
fs.writeFileSync(filePath, content, 'utf8');
console.log('Done');
