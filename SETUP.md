# Setup Instructions

## Prerequisites
- Node.js 18+ installed
- MongoDB running (local or cloud)

## Quick Start

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Set Up Environment Variables**
   Create a `.env` file in the root directory:
   ```env
   MONGODB_URI=mongodb://localhost:27017/cloudecom
   # OR for MongoDB Atlas:
   # MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/cloudecom
   
   JWT_SECRET=your-secret-key-change-in-production
   ```

3. **Generate Prisma Client**
   ```bash
   npx prisma generate
   ```

4. **Push Prisma Schema to Database** (Optional - if you want to use Prisma)
   ```bash
   npx prisma db push
   ```

5. **Start Development Server**
   ```bash
   npm run dev
   ```

6. **Open Browser**
   Navigate to `http://localhost:3000`

## MongoDB Setup

### Local MongoDB
1. Install MongoDB locally or use Docker:
   ```bash
   docker run -d -p 27017:27017 --name mongodb mongo:latest
   ```

2. Update `.env`:
   ```env
   MONGODB_URI=mongodb://localhost:27017/cloudecom
   ```

### MongoDB Atlas (Cloud)
1. Create account at https://www.mongodb.com/cloud/atlas
2. Create a cluster
3. Get connection string
4. Update `.env`:
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/cloudecom
   ```

## Prisma Commands

- `npx prisma generate` - Generate Prisma Client
- `npx prisma db push` - Push schema changes to database
- `npx prisma studio` - Open Prisma Studio (database GUI)
- `npx prisma migrate dev` - Create and apply migrations

## Current Setup

- ✅ Mongoose/MongoDB - Currently active
- ✅ Prisma - Set up and ready (can be used alongside or replace Mongoose)
- Both ORMs are configured and can work together

## Notes

- The application currently uses Mongoose for database operations
- Prisma schema is ready and can be integrated when needed
- Both can coexist - you can gradually migrate from Mongoose to Prisma

