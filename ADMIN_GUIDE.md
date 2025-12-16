# CloudEcom Admin Guide

## Overview
This guide explains how to use the admin features of CloudEcom to manage products, categories, and other entities.

## Getting Started

### Prerequisites
- You must have an account with `role: "admin"` to access management features
- MongoDB connection must be configured in your `.env` file
- The application must be running

### Admin Access
Admin users can access management features through:
1. **Navigation Menu** - Links in the header (visible only to admins)
2. **Homepage Buttons** - "Manage Products" and "Manage Categories" buttons
3. **Direct URLs** - Navigate to `/ui/products` or `/ui/categories`

## Managing Categories

### Why Create Categories First?
Categories are required before creating products. Each product must belong to a category.

### Creating a Category
1. Navigate to `/ui/categories` or click "Categories" in the header
2. Click the "+ Add New Category" button
3. Fill in the form:
   - **Name** (required): e.g., "Electronics", "Fashion", "Food"
   - **Description** (optional): Brief description of the category
4. Click "Create Category"

### Viewing Categories
- All users can view categories at `/ui/categories`
- Categories appear as cards with their name and description
- Click on a category to view all products in that category

### Editing a Category
1. Go to `/ui/categories`
2. Find the category you want to edit
3. Click the "Edit" button
4. Update the details at `/ui/categories/[categoryId]`
5. Save changes

### Deleting a Category
1. Go to `/ui/categories`
2. Click the "Delete" button on the category card
3. Confirm the deletion
4. **Note**: You cannot delete a category that has products. Remove or reassign products first.

## Managing Products

### Creating a Product
1. Navigate to `/ui/products` or click "Manage Products" in the header
2. Click the "+ Add New Product" button
3. Fill in the form:
   - **Product Name** (required): Name of the product
   - **Description** (required): Detailed description
   - **Price** (required): Price in dollars (e.g., 29.99)
   - **Stock Quantity** (required): Number of items available
   - **Category** (required): Select from existing categories
   - **Image URL** (optional): URL to product image
4. Click "Create Product"

### Viewing Products
- All users can view products at:
  - `/shop` - Main shop page with filters
  - `/ui/products` - List view of all products
  - Homepage - Features popular products and new arrivals

### Product Display Features
Products automatically show on:
- **Homepage**: Popular products (sorted by rating) and new arrivals
- **Shop Page**: All products with filtering and sorting options
- **Category Pages**: Products filtered by category

### Editing a Product
1. Go to `/ui/products/[productId]`
2. Admin users will see an "Edit" button
3. Update product details
4. Save changes

### Deleting a Product
1. Go to `/ui/products`
2. Find the product you want to delete
3. Click the "Delete" button
4. Confirm the deletion

## Shop Features

### Customer View
All users (including non-authenticated) can:
- Browse products at `/shop`
- Filter by category, price range, ratings
- Sort by price, rating, or date
- Search for products
- View product details

### Filter Options
- **Category**: Filter by specific category
- **Price Range**: Set min and max price
- **Ratings**: Filter by minimum rating (1-5 stars)
- **Sort By**: 
  - Newest Arrivals
  - Lowest Price
  - Highest Price
  - Most Popular (by rating)

### Search
- Use the search bar in the header
- Searches product names and descriptions
- Results appear on the shop page

## API Endpoints

### Categories API
- `GET /api/categories` - Get all categories
- `POST /api/categories` - Create new category (admin)
- `GET /api/categories/[id]` - Get category by ID
- `PUT /api/categories/[id]` - Update category (admin)
- `DELETE /api/categories/[id]` - Delete category (admin)

### Products API
- `GET /api/products` - Get all products (with filters)
  - Query params: `category`, `minPrice`, `maxPrice`, `sortBy`, `sortOrder`, `search`, `minRating`
- `POST /api/products` - Create new product (admin)
- `GET /api/products/[id]` - Get product by ID
- `PUT /api/products/[id]` - Update product (admin)
- `DELETE /api/products/[id]` - Delete product (admin)

## Best Practices

### Setting Up Your Store
1. **Create categories first** - Define your product categories
2. **Add products** - Create products and assign them to categories
3. **Add images** - Use high-quality image URLs for better appearance
4. **Set accurate stock** - Keep inventory up to date
5. **Write good descriptions** - Help customers understand your products

### Managing Inventory
- Update stock quantities regularly
- Remove products that are discontinued
- Use the price field for special offers
- Update ratings as reviews come in

### Organizing Categories
- Use clear, descriptive category names
- Don't create too many categories (6-12 is ideal)
- Add descriptions to help customers understand what's in each category
- Review and consolidate categories periodically

## User Roles

### Admin
- Can create, edit, and delete products
- Can create, edit, and delete categories
- Can view all orders and users
- Has access to all management pages
- Sees management links in the navigation

### Customer (Default)
- Can browse products and categories
- Can add products to cart
- Can place orders
- Can write reviews
- Cannot access management features

## Troubleshooting

### "Category not found" error when creating product
- Make sure you have created at least one category first
- Refresh the page to load the latest categories

### Products not showing on shop page
- Check that the product has stock > 0
- Verify the category exists
- Check for filter settings that might be hiding products

### Cannot delete category
- Make sure there are no products in the category
- Reassign or delete products first, then delete the category

### Images not displaying
- Verify the image URL is correct and publicly accessible
- Use HTTPS URLs for security
- Consider using an image hosting service like Cloudinary or Imgur

## Additional Features

### Reviews and Ratings
- Customers can leave reviews on products
- Average ratings are calculated automatically
- Review count is displayed on product cards

### Cart and Checkout
- Authenticated users can add products to cart
- Cart persists across sessions
- Checkout process handles payment and order creation

### Wishlist
- Authenticated users can add products to wishlist
- Quick access from the header

## Support

For issues or questions:
- Check the main README.md
- Review STATUS.md for current feature status
- Check FEATURES.md for complete feature list

