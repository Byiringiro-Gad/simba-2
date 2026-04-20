
const fs = require('fs');
const data = JSON.parse(fs.readFileSync('simba_products.json', 'utf8'));

const categories = {
  BAKERY: 'Bakery',
  GROCERIES: 'Groceries',
  COSMETICS: 'Cosmetics & Personal Care',
  BABY: 'Baby Products',
  HOUSEHOLD: 'Household & Kitchenware',
  ELECTRONICS: 'Electronics',
  SPORTS: 'Sports & Wellness',
  ALCOHOL: 'Alcoholic Beverages & Spirits'
};

const bakeryKeywords = ['baguette', 'bread', 'croissant', 'cake', 'pain', 'pie', 'buggette', 'campagne', 'muffin', 'pastry', 'donut', 'doughnut', 'toast', 'bun', 'cookies', 'pastries'];
const groceryKeywords = ['milk', 'yoghurt', 'cheese', 'oil', 'flour', 'sugar', 'salt', 'rice', 'meat', 'sausage', 'luncheon', 'beans', 'pasta', 'sauce', 'spices', 'water', 'juice', 'soda', 'tea', 'coffee', 'egg', 'avocado', 'tomato', 'potato', 'onion', 'garlic', 'ginger', 'honey', 'butter', 'margarine', 'jam', 'mayonnaise', 'ketchup', 'mustard', 'cereal', 'oats', 'nuts', 'chips', 'snacks', 'biscuits', 'chocolate', 'candy', 'fruit', 'vegetable', 'corned beef', 'sardine', 'tuna', 'mackerel', 'olive', 'sunflower', 'avocado oil', 'canola', 'vegetable oil', 'maize', 'flour', 'wheat', 'whole milk', 'low fat milk', 'flavored milk', 'coconut milk', 'coconut cream'];
const alcoholicKeywords = ['cognac', 'tequila', 'vermouth', 'campari', 'wine', 'whisky', 'beer', 'vodka', 'gin', 'rum', 'liqueur', 'spirit', 'cinzano', 'donjulio', 'abk6', 'hennessy', 'martell', 'remy martin', 'johnnie walker', 'jack daniel', 'chivas', 'jameson', 'baileys', 'smirnoff', 'absolute', 'heineken', 'stella', 'guinness', 'castle', 'mutzig', 'primus', 'skol', 'amstel'];
const electronicsKeywords = ['heater', 'kettle', 'iron', 'blender', 'mixer', 'phone', 'laptop', 'tv', 'speaker', 'battery', 'charger', 'electric pan', 'st-903', 'led', 'lcd', 'microwave', 'oven', 'fridge', 'refrigerator', 'washing machine', 'fan', 'air conditioner', 'vacuum', 'remote controlled', 'drone'];
const householdKeywords = ['scoop', 'shovel', 'pan', 'plate', 'bowl', 'cup', 'spoon', 'fork', 'knife', 'pot', 'container', 'cleaning', 'detergent', 'soap', 'tissue', 'paper', 'napkin', 'towel', 'foil', 'plastic', 'glass', 'ceramic', 'wood', 'bamboo', 'steel', 'iron', 'metal', 'bucket', 'broom', 'mop', 'sponge', 'scourer', 'gloves', 'trash', 'garbage', 'bin', 'bag', 'wrap', 'foil', 'scissors', 'tape', 'glue', 'hook', 'hanger', 'organizer', 'storage', 'shelf', 'rack', 'clock', 'mirror', 'lamp', 'bulb', 'torch', 'candle', 'lighter', 'match', 'toolbox', 'tool', 'drill', 'screw', 'nail', 'hammer', 'wrench', 'pliers', 'screwdriver', 'level', 'measure', 'tape', 'photocopying paper', 'copy paper', 'a4', 'pens', 'pencil', 'notebook', 'diary', 'folder', 'file', 'stapler', 'punch', 'calculator'];
const babyKeywords = ['doll', 'toy', 'blocks', 'baby', 'nappy', 'diaper', 'infant', 'lactogen', 'cerelac', 'nan', 'nestle', 'guigoz', 'similac', 'aptamil', 'pampers', 'huggies', 'molfix', 'bambino', 'johnson', 'sebamed', 'chicco', 'avent', 'pigeon', 'dr brown', 'tommee tippee', 'feeding bottle', 'pacifier', 'teether', 'stroller', 'walker', 'car seat', 'high chair', 'cot', 'crib', 'playpen', 'baby bath', 'baby lotion', 'baby oil', 'baby shampoo', 'baby powder', 'baby wipes', 'drawing board art', 'jump rope', 'play set', 'puzzle', 'remote control car', 'space shuttle', 'airplane', 'helicopter', 'train', 'robot', 'action figure'];
const sportsKeywords = ['roller', 'gym', 'fitness', 'sport', 'yoga', 'protein', 'dumbbell', 'treadmill', 'cycle', 'bike', 'bicycle', 'helmet', 'pad', 'glove', 'ball', 'bat', 'racket', 'club', 'stick', 'net', 'goal', 'hoop', 'swim', 'dive', 'mask', 'fin', 'snorkel', 'tent', 'backpack', 'hiking', 'camping', 'fishing', 'rod', 'reel', 'line', 'lure', 'hook', 'weight', 'bench', 'mat', 'massage roller'];
const cosmeticsKeywords = ['shampoo', 'lotion', 'cream', 'perfume', 'deodorant', 'makeup', 'skin', 'hair', 'face', 'body', 'hand', 'foot', 'nail', 'lipstick', 'mascara', 'eyeliner', 'eyeshadow', 'foundation', 'powder', 'blush', 'concealer', 'primer', 'setting spray', 'cleanser', 'toner', 'serum', 'mask', 'scrub', 'peel', 'oil', 'shaving', 'razor', 'blade', 'aftershave', 'dentifrice', 'toothpaste', 'toothbrush', 'mouthwash', 'floss', 'deodorant', 'antiperspirant', 'fragrance', 'cologne', 'eau de toilette', 'eau de parfum', 'river dog shampoo'];

data.products.forEach(p => {
  const name = p.name.toLowerCase();
  
  if (bakeryKeywords.some(k => name.includes(k)) || [61].includes(p.subcategoryId)) {
    p.category = categories.BAKERY;
  } else if (alcoholicKeywords.some(k => name.includes(k)) || [27].includes(p.subcategoryId)) {
    p.category = categories.ALCOHOL;
  } else if (babyKeywords.some(k => name.includes(k)) || [16, 58].includes(p.subcategoryId)) {
    p.category = categories.BABY;
  } else if (electronicsKeywords.some(k => name.includes(k)) || [13001].includes(p.id)) { // Lentz Radiant Heater 80036
    p.category = categories.ELECTRONICS;
  } else if (sportsKeywords.some(k => name.includes(k)) || [15].includes(p.subcategoryId)) {
    p.category = categories.SPORTS;
  } else if (householdKeywords.some(k => name.includes(k)) || [19, 22002, 22003].includes(p.id)) { // Copy Paper
    p.category = categories.HOUSEHOLD;
  } else if (cosmeticsKeywords.some(k => name.includes(k)) || [13, 29, 66].includes(p.subcategoryId)) {
      // subcategoryId 66 is Dairy but currently labeled Cosmetics. Need to differentiate.
      if (['milk', 'cream', 'yogurt', 'yoghurt'].some(k => name.includes(k))) {
          p.category = categories.GROCERIES;
      } else {
          p.category = categories.COSMETICS;
      }
  } else if (groceryKeywords.some(k => name.includes(k)) || [22, 62, 65, 67].includes(p.subcategoryId)) {
    p.category = categories.GROCERIES;
  } else {
    p.category = categories.GROCERIES;
  }
});

fs.writeFileSync('simba_products.json', JSON.stringify(data, null, 2));
console.log('Categories fixed successfully!');
const counts = {};
data.products.forEach(p => counts[p.category] = (counts[p.category] || 0) + 1);
console.log('Category distribution:', counts);
