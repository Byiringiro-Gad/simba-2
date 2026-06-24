const d = require('../simba_products.json');

// Get ALL mismatched products grouped by id-range + name pattern
const mismatches = [];
d.products.forEach(p => {
  const name = p.name.toLowerCase();
  const id = p.id;
  const cat = p.category;

  // Bread/bakery items in Cosmetics
  if (cat === 'Cosmetics & Personal Care' && (
    name.includes('bread') || name.includes('baguette') || name.includes('croissant') ||
    name.includes('campagne') || name.includes('pain') || name.includes('cake') ||
    name.includes('vanilla cake') || name.includes('sandwich')
  )) mismatches.push({ id, name, cat, correct: 'Food Products' });

  // Milk/dairy in Cosmetics
  if (cat === 'Cosmetics & Personal Care' && (
    name.includes('milk') && !name.includes('body milk') && !name.includes('coconut cream')
  )) mismatches.push({ id, name, cat, correct: 'Food Products' });

  // Coffee in Cosmetics
  if (cat === 'Cosmetics & Personal Care' && (
    name.includes('coffee') || name.includes('cafe') || name.includes('chicoree')
  )) mismatches.push({ id, name, cat, correct: 'Food Products' });

  // Candy/sweets in Cosmetics
  if (cat === 'Cosmetics & Personal Care' && (
    name.includes('candy') || name.includes('toffee') || name.includes('lollipop') ||
    name.includes('lollypop') || name.includes('chewing gum') || name.includes('chiwing') ||
    name.includes('chawing') || name.includes('bubble gum') || name.includes('mentos') ||
    name.includes('eclairs') || name.includes('fudge') || name.includes('wrestler')
  )) mismatches.push({ id, name, cat, correct: 'Food Products' });

  // Jams in Kitchenware
  if (cat === 'Kitchenware & Electronics' && (
    name.includes('jam') || name.includes('confiture')
  )) mismatches.push({ id, name, cat, correct: 'Food Products' });

  // Margarine/spread/cheese in Kitchenware
  if (cat === 'Kitchenware & Electronics' && (
    name.includes('margarine') || name.includes('blue band') || name.includes('cheese') ||
    name.includes('salim')
  )) mismatches.push({ id, name, cat, correct: 'Food Products' });

  // Fruits in Kitchenware
  if (cat === 'Kitchenware & Electronics' && (
    name.includes('avocado') || name.includes('lemon') || name.includes('orange') ||
    name.includes('pineapple') || name.includes('apple') || name.includes('grape fruit') ||
    name.includes('strawberry') && !name.includes('jam') || name.includes('jagro')
  )) mismatches.push({ id, name, cat, correct: 'Food Products' });

  // Dog food / pet food miscategorised  
  if (cat === 'Food Products' && (
    name.includes('dog food') || name.includes('cat food') || name.includes('cat&co') ||
    name.includes('dog & co') || name.includes('farmer') || name.includes('smokies') ||
    name.includes('sausage') || name.includes('viennas') || name.includes('nyamabite') ||
    name.includes('smookies') || name.includes('choma')
  )) mismatches.push({ id, name, cat, correct: 'Pet Care' });
});

// Print ID ranges for correction map
const corrections = {};
mismatches.forEach(m => { corrections[m.id] = m.correct; });
console.log('Total mismatches:', mismatches.length);
console.log('Sample corrections:', JSON.stringify(Object.keys(corrections).slice(0, 30)));

// Group IDs by correct category
const byCorrect = {};
mismatches.forEach(m => {
  if (!byCorrect[m.correct]) byCorrect[m.correct] = [];
  byCorrect[m.correct].push(m.id);
});
Object.entries(byCorrect).forEach(([cat, ids]) => {
  ids.sort((a,b) => a-b);
  console.log(`\n${cat} (${ids.length} items):`);
  // Show ranges
  let ranges = [], start = ids[0], prev = ids[0];
  for (let i = 1; i < ids.length; i++) {
    if (ids[i] !== prev + 1 && ids[i] !== prev) {
      ranges.push(start === prev ? `${start}` : `${start}-${prev}`);
      start = ids[i];
    }
    prev = ids[i];
  }
  ranges.push(start === prev ? `${start}` : `${start}-${prev}`);
  console.log('  Ranges:', ranges.join(', '));
  console.log('  All IDs:', JSON.stringify(ids));
});
