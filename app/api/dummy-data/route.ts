import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Category from '@/models/Category';
import Product from '@/models/Product';

export async function POST(request: NextRequest) {
  try {
    await connectDB();

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

    // Create categories
    const categoryDocs: any = {};
    const categoryResults = { created: 0, existing: 0 };

    for (const cat of categories) {
      const existing = await Category.findOne({ name: cat.name });
      if (existing) {
        categoryDocs[cat.name] = existing;
        categoryResults.existing++;
      } else {
        const newCat = await Category.create(cat);
        categoryDocs[cat.name] = newCat;
        categoryResults.created++;
      }
    }

    // Create products
    const productResults = { created: 0, existing: 0 };

    for (const prod of products) {
      const existing = await Product.findOne({ name: prod.name });
      if (existing) {
        productResults.existing++;
      } else {
        const categoryId = categoryDocs[prod.category]._id;
        await Product.create({
          ...prod,
          category: categoryId,
        });
        productResults.created++;
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Dummy data added successfully!',
      data: {
        categories: categoryResults,
        products: productResults,
      },
    }, { status: 201 });

  } catch (error: any) {
    console.error('Error adding dummy data:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

