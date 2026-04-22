import { db, connection } from './index';
import { products } from './schema';
import productsData from '../../simba_products.json';

async function seed() {
  console.log('Seeding products...');
  
  const formattedProducts = productsData.products.map((p: any) => ({
    id: p.id,
    name: p.name,
    price: p.price.toString(),
    category: p.category,
    subcategoryId: p.subcategoryId,
    inStock: p.inStock,
    image: p.image,
    unit: p.unit,
    stockCount: Math.floor(Math.random() * 50) + 10,
    rating: (Math.random() * (5 - 4) + 4).toFixed(2),
    reviewCount: Math.floor(Math.random() * 100),
  }));

  try {
    await db.insert(products).values(formattedProducts);
    console.log('Seeding completed successfully!');
  } catch (error) {
    console.error('Seeding failed:', error);
  } finally {
    await connection.end();
  }
}

seed();
