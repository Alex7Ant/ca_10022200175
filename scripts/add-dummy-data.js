const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI || process.env.DATABASE_URL || '';

// Define schemas
const CategorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  description: String,
}, { timestamps: true });

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  stock: { type: Number, default: 0 },
  image: String,
  averageRating: { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 },
  seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

const Category = mongoose.models.Category || mongoose.model('Category', CategorySchema);
const Product = mongoose.models.Product || mongoose.model('Product', ProductSchema);

const categories = [
  { name: 'Fashion', description: 'Traditional and modern Ghanaian fashion' },
  { name: 'Food & Spices', description: 'Authentic Ghanaian ingredients and spices' },
  { name: 'Arts & Crafts', description: 'Handmade Ghanaian art and crafts' },
];

const products = [
  {
    name: 'Kente Cloth - Traditional Design',
    description: 'Authentic handwoven Kente cloth from the Ashanti region. Perfect for special occasions and ceremonies. This vibrant fabric features traditional patterns passed down through generations.',
    price: 89.99,
    stock: 15,
    category: 'Fashion',
    image: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=500&h=500&fit=crop',
  },
  {
    name: 'Shea Butter - 100% Pure',
    description: 'Premium quality raw shea butter from Northern Ghana. Rich in vitamins A and E, perfect for skincare and hair care. Moisturizes and nourishes naturally.',
    price: 24.50,
    stock: 50,
    category: 'Fashion',
    image: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=500&h=500&fit=crop',
  },
  {
    name: 'Waakye Leaves (Dried)',
    description: 'Traditional Waakye leaves used to prepare Ghana\'s beloved rice and beans dish. Gives the authentic red-brown color and unique flavor. Pack of 100g.',
    price: 8.99,
    stock: 100,
    category: 'Food & Spices',
    image: 'https://images.unsplash.com/photo-1596040033229-a0b55ee2d6c2?w=500&h=500&fit=crop',
  },
  {
    name: 'Grinded Pepper Mix',
    description: 'Freshly ground Ghanaian pepper blend with scotch bonnet, ginger, and garlic. Perfect for soups, stews, and jollof rice. Very hot! 250g jar.',
    price: 12.99,
    stock: 75,
    category: 'Food & Spices',
    image: 'https://images.unsplash.com/photo-1583623025817-d180a2221d0a?w=500&h=500&fit=crop',
  },
  {
    name: 'Adinkra Symbol Wall Art',
    description: 'Beautiful handcrafted wooden wall art featuring Gye Nyame (Except God) Adinkra symbol. Represents the supremacy of God. Hand-carved from sustainable wood. 12" x 12"',
    price: 45.00,
    stock: 20,
    category: 'Arts & Crafts',
    image: 'https://images.unsplash.com/photo-1582738411706-bfc8e691d1c2?w=500&h=500&fit=crop',
  },
  {
    name: 'Bolga Basket - Large',
    description: 'Handwoven elephant grass basket from Bolgatanga. Colorful, durable, and eco-friendly. Perfect for shopping, storage, or home decor. Each basket is unique.',
    price: 35.99,
    stock: 30,
    category: 'Arts & Crafts',
    image: 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=500&h=500&fit=crop',
  },
];

async function addDummyData() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Create categories
    console.log('Creating categories...');
    const categoryDocs = {};
    
    for (const cat of categories) {
      const existing = await Category.findOne({ name: cat.name });
      if (existing) {
        console.log(`  ⚠️  Category "${cat.name}" already exists`);
        categoryDocs[cat.name] = existing;
      } else {
        const newCat = await Category.create(cat);
        console.log(`  ✅ Created category: ${cat.name}`);
        categoryDocs[cat.name] = newCat;
      }
    }

    console.log('\nCreating products...');
    let created = 0;
    let skipped = 0;

    for (const prod of products) {
      const existing = await Product.findOne({ name: prod.name });
      if (existing) {
        console.log(`  ⚠️  Product "${prod.name}" already exists`);
        skipped++;
      } else {
        const categoryId = categoryDocs[prod.category]._id;
        await Product.create({
          ...prod,
          category: categoryId,
        });
        console.log(`  ✅ Created product: ${prod.name}`);
        created++;
      }
    }

    console.log('\n📊 Summary:');
    console.log(`  Categories: ${Object.keys(categoryDocs).length}`);
    console.log(`  Products created: ${created}`);
    console.log(`  Products skipped: ${skipped}`);
    console.log('\n🎉 Done! Your store is ready with Ghanaian products!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

addDummyData();

