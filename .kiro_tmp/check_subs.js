const d = require('../simba_products.json');
const m = {};
d.products.forEach(p => {
  if (!m[p.subcategoryId]) m[p.subcategoryId] = { cat: p.category, samples: [] };
  if (m[p.subcategoryId].samples.length < 3) m[p.subcategoryId].samples.push(p.name);
});
Object.entries(m).sort((a, b) => a[0] - b[0]).forEach(([id, v]) => {
  console.log(id + ' | ' + v.cat + ' | ' + v.samples.join(' / '));
});
