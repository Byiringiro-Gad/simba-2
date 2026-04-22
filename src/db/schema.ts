import { mysqlTable, serial, varchar, decimal, boolean, int, timestamp, json, text } from 'drizzle-orm/mysql-core';
import { relations } from 'drizzle-orm';

export const products = mysqlTable('products', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  category: varchar('category', { length: 100 }).notNull(),
  subcategoryId: int('subcategory_id'),
  inStock: boolean('in_stock').default(true),
  image: varchar('image', { length: 500 }),
  unit: varchar('unit', { length: 50 }).default('pcs'),
  stockCount: int('stock_count').default(100),
  rating: decimal('rating', { precision: 3, scale: 2 }).default('5.00'),
  reviewCount: int('review_count').default(0),
});

export const orders = mysqlTable('orders', {
  id: varchar('id', { length: 50 }).primaryKey(), // Using custom IDs like #ORD-123
  userId: varchar('user_id', { length: 255 }),
  customerName: varchar('customer_name', { length: 255 }),
  customerPhone: varchar('customer_phone', { length: 20 }),
  customerAddress: text('customer_address'),
  total: decimal('total', { precision: 12, scale: 2 }).notNull(),
  status: varchar('status', { length: 20 }).notNull().default('processing'), // processing, delivered, cancelled
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
});

export const orderItems = mysqlTable('order_items', {
  id: serial('id').primaryKey(),
  orderId: varchar('order_id', { length: 50 }).notNull(),
  productId: int('product_id').notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  quantity: int('quantity').notNull(),
  image: varchar('image', { length: 500 }),
  unit: varchar('unit', { length: 50 }),
});

export const ordersRelations = relations(orders, ({ many }) => ({
  items: many(orderItems),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
}));
