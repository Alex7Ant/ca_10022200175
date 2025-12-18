# Name: Alexandre Anthony
# 10022200175

# Cloud E-Commerce Platform

A comprehensive full-stack e-commerce platform built with Next.js, TypeScript, and MongoDB. This platform includes all the features needed for a modern e-commerce experience, from user authentication to order management.

## 🚀 Features

### User Features
- **User Authentication**: Sign up, login, and logout with JWT tokens
- **User Profiles**: Manage personal information, address, and phone
- **Shopping Cart**: Add, update, and remove items from cart
- **Wishlist**: Save favorite products for later
- **Order Management**: View and track order history
- **Product Reviews**: Rate and review products (1-5 stars)
- **Search & Filter**: Search products by name/description, filter by category, price range, and rating

### Admin Features
- **User Management**: Create, read, update, and delete users
- **Product Management**: Full CRUD operations for products
- **Category Management**: Organize products into categories
- **Order Management**: View all orders and update order status
- **Dashboard**: Admin panel accessible to admin users

### E-Commerce Features
- **Product Catalog**: Browse products with images, descriptions, prices, and stock
- **Category Filtering**: Filter products by category
- **Price Filtering**: Filter by price range
- **Rating System**: Products display average ratings and review counts
- **Stock Management**: Real-time stock tracking and validation
- **Checkout Process**: Convert cart to order with shipping address
- **Order Tracking**: Track order status (pending, processing, shipped, delivered, cancelled)

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Backend**: Next.js API Routes
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens) with bcryptjs
- **Styling**: CSS Modules with modern design

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd CloudEcom
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment Variables**
   Create a `.env` file in the root directory:
   ```env
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key_change_in_production
   ```

4. **Run Development Server**
   ```bash
   npm run dev
   ```

5. **Open Browser**
   Navigate to `http://localhost:3000`

## 📚 API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user

### Users
- `GET /api/users` - Get all users (Admin only)
- `POST /api/users` - Create a new user
- `GET /api/users/[userId]` - Get user by ID
- `PUT /api/users/[userId]` - Update user
- `DELETE /api/users/[userId]` - Delete user

### Products
- `GET /api/products` - Get all products (supports search, filtering, sorting)
  - Query params: `category`, `search`, `minPrice`, `maxPrice`, `minRating`, `sortBy`, `sortOrder`
- `GET /api/products/search` - Advanced search with pagination
- `POST /api/products` - Create a new product
- `GET /api/products/[productId]` - Get product by ID
- `PUT /api/products/[productId]` - Update product
- `DELETE /api/products/[productId]` - Delete product

### Categories
- `GET /api/categories` - Get all categories
- `POST /api/categories` - Create a new category
- `GET /api/categories/[categoryId]` - Get category by ID
- `PUT /api/categories/[categoryId]` - Update category
- `DELETE /api/categories/[categoryId]` - Delete category

### Orders
- `GET /api/orders` - Get all orders (optional: `?user=userId`)
- `POST /api/orders` - Create a new order
- `GET /api/orders/[orderId]` - Get order by ID
- `PUT /api/orders/[orderId]` - Update order status
- `DELETE /api/orders/[orderId]` - Delete order

### Cart
- `GET /api/cart` - Get user's cart (requires authentication)
- `POST /api/cart` - Add item to cart
- `PUT /api/cart` - Update item quantity
- `DELETE /api/cart?product=productId` - Remove item from cart

### Wishlist
- `GET /api/wishlist` - Get user's wishlist (requires authentication)
- `POST /api/wishlist` - Add product to wishlist
- `DELETE /api/wishlist?product=productId` - Remove product from wishlist

### Reviews
- `GET /api/reviews` - Get all reviews (optional: `?product=productId`)
- `POST /api/reviews` - Create a review (requires authentication)
- `GET /api/reviews/[reviewId]` - Get review by ID
- `PUT /api/reviews/[reviewId]` - Update review
- `DELETE /api/reviews/[reviewId]` - Delete review

### Checkout
- `POST /api/checkout` - Create order from cart (requires authentication)

### Profile
- `GET /api/profile` - Get user profile (requires authentication)
- `PUT /api/profile` - Update user profile (requires authentication)

## 🗂️ Project Structure

```
├── app/
│   ├── api/              # API routes
│   │   ├── auth/         # Authentication endpoints
│   │   ├── users/        # User management
│   │   ├── products/     # Product management
│   │   ├── categories/   # Category management
│   │   ├── orders/       # Order management
│   │   ├── cart/         # Shopping cart
│   │   ├── wishlist/     # Wishlist
│   │   ├── reviews/      # Product reviews
│   │   ├── checkout/     # Checkout process
│   │   └── profile/      # User profile
│   ├── auth/             # Authentication pages
│   │   ├── login/        # Login page
│   │   └── register/     # Registration page
│   ├── shop/             # Shop page
│   ├── layout.tsx        # Root layout
│   ├── page.tsx          # Home page
│   └── globals.css       # Global styles
├── ui/                   # UI pages
│   ├── users/            # User management pages
│   ├── products/         # Product management pages
│   ├── categories/       # Category management pages
│   ├── orders/           # Order management pages
│   ├── cart/             # Shopping cart page
│   └── profile/          # User profile page
├── lib/                  # Utility functions
│   ├── mongodb.ts        # MongoDB connection
│   ├── auth.ts           # Authentication utilities
│   └── context.tsx       # React context for auth
├── models/               # Mongoose models
│   ├── User.ts
│   ├── Product.ts
│   ├── Category.ts
│   ├── Order.ts
│   ├── Cart.ts
│   ├── Wishlist.ts
│   └── Review.ts
└── package.json
```

## 🔐 Authentication

The application uses JWT (JSON Web Tokens) for authentication. When a user logs in or registers, they receive a token that should be included in subsequent requests:

```
Authorization: Bearer <token>
```

Tokens are stored in localStorage on the client side and automatically included in API requests.

## 🗄️ Database Models

### User
- name, email, password (hashed), role, address, phone

### Product
- name, description, price, category, stock, image, averageRating, reviewCount

### Category
- name, description

### Order
- user, items (product, quantity, price), total, status, shippingAddress

### Cart
- user, items (product, quantity)

### Wishlist
- user, products (array)

### Review
- user, product, rating (1-5), comment

## 🎨 Features in Detail

### Product Reviews & Ratings
- Users can leave reviews with ratings (1-5 stars)
- Products automatically calculate average rating
- One review per user per product
- Reviews can be updated or deleted by the author or admin

### Shopping Cart
- Persistent cart per user
- Add/remove items
- Update quantities
- Stock validation before adding
- Convert cart to order during checkout

### Search & Filter
- Text search across product names and descriptions
- Filter by category
- Filter by price range
- Filter by minimum rating
- Sort by price, date, or rating

### Order Management
- Create orders from cart
- Track order status
- Update order status (admin)
- Automatic stock deduction on order creation

## 🚧 Future Enhancements

- Payment integration (Stripe/PayPal)
- Email notifications
- Product image upload
- Advanced analytics dashboard
- Coupon/discount system
- Shipping cost calculation
- Multi-currency support
- Product variants (size, color, etc.)

## 📝 Notes

- Make sure MongoDB is running and accessible
- The application uses MongoDB connection pooling for optimal performance
- All passwords are hashed using bcryptjs before storage
- Product stock is automatically decremented when orders are created
- Reviews automatically update product average ratings
- JWT tokens expire after 7 days

## 🔄 Prisma Integration

This project is currently using Mongoose/MongoDB. Prisma schema integration is planned. When you provide the Prisma schema, we can migrate or integrate it alongside the existing setup.

## 📄 License

This project is private and proprietary.
