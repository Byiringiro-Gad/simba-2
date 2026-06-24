const d = require('../simba_products.json');
const cats = {};
d.products.forEach(p => { cats[p.category] = (cats[p.category] || 0) + 1; });
console.log(JSON.stringify(cats, null, 2));

// Also show a sample of mismatched items
const samples = d.products.filter(p =>
  p.category === 'Cosmetics & Personal Care' &&
  (p.name.toLowerCase().includes('bread') || p.name.toLowerCase().includes('milk') ||
   p.name.toLowerCase().includes('baguette') || p.name.toLowerCase().includes('coffee'))
).slice(0, 10).map(p => ({ id: p.id, name: p.name, cat: p.category }));
console.log('\nMismatched cosmetics samples:', JSON.stringify(samples, null, 2));

const kitchenMismatch = d.products.filter(p =>
  p.category === 'Kitchenware & Electronics' &&
  (p.name.toLowerCase().includes('jam') || p.name.toLowerCase().includes('fruit') ||
   p.name.toLowerCase().includes('mango') || p.name.toLowerCase().includes('avocado'))
).slice(0, 10).map(p => ({ id: p.id, name: p.name, cat: p.category }));
console.log('\nMismatched kitchenware samples:', JSON.stringify(kitchenMismatch, null, 2));
