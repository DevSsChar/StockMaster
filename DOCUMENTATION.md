# StockMaster - Warehouse Management System

## Project Overview

StockMaster is a comprehensive warehouse management system built with Next.js 15, designed to streamline inventory operations, track stock movements, and manage delivery and receipt workflows. The system provides role-based access control with manager and staff roles, ensuring secure and organized warehouse operations.

## Technology Stack

- **Framework**: Next.js 15 (App Router)
- **Authentication**: NextAuth.js
- **Database**: MongoDB with Mongoose ODM
- **Styling**: Tailwind CSS
- **Language**: JavaScript/React

## Project Structure

```
StockMaster/
├── app/
│   ├── api/
│   │   ├── auth/[...nextauth]/     # Authentication endpoints
│   │   ├── deliveries/             # Delivery operations
│   │   ├── receipts/               # Receipt operations
│   │   ├── products/               # Product management
│   │   ├── signup/                 # User registration
│   │   ├── forgot-password/        # Password recovery
│   │   ├── reset-password/         # Password reset
│   │   └── verify-reset-code/      # Code verification
│   ├── dashboard/                  # Main dashboard
│   ├── delivery/                   # Delivery pages
│   ├── receipts/                   # Receipt pages
│   ├── stock/                      # Stock management
│   ├── login/                      # Login page
│   └── forgot-password/            # Password recovery page
├── components/
│   ├── delivery/                   # Delivery components
│   ├── receipts/                   # Receipt components
│   ├── stock/                      # Stock components
│   ├── ui/                         # UI components
│   ├── AuthProvider.jsx            # Auth context provider
│   └── SessionWrapper.js           # Session wrapper
├── models/
│   ├── Operation.js                # Operations model
│   ├── Product.js                  # Product model
│   └── user.js                     # User model
├── db/
│   └── connectDB.mjs               # Database connection
├── lib/
│   └── emailService.js             # Email functionality
└── backend/
    └── actions.js                  # Server actions
```

## Features

### 1. Authentication & Authorization
- User registration and login
- Password recovery with email verification
- Role-based access control (Manager, Staff)
- Session management with NextAuth.js

### 2. Delivery Management
- Create new delivery operations
- Edit existing deliveries (Manager only)
- Track delivery status (pending, in-progress, completed, waiting)
- Unique delivery reference numbers (WH/OUT/####)
- Real-time stock availability checking
- Clickable delivery records in list and kanban views
- Delivery address tracking

### 3. Receipt Management
- Create new receipt operations
- Edit existing receipts (Manager only)
- Track receipt status
- Unique receipt reference numbers (WH/IN/####)
- Source tracking (receiveFrom field)
- Clickable receipt records in list and kanban views

### 4. Stock Management
- View all products with current stock levels
- Add new products with SKU validation
- Edit product details (inline editing)
- Delete products
- Track per unit cost
- Calculate "Free to Use" stock (total stock - min stock rule)
- Real-time stock updates

### 5. Product Management
- CRUD operations for products
- SKU-based inventory tracking
- Minimum stock rules
- Cost and price management
- Product status tracking

## Database Models

### User Model
```javascript
{
  name: String (required),
  email: String (required, unique),
  password: String (required, hashed),
  role: String (enum: ['manager', 'staff'], default: 'staff'),
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### Product Model
```javascript
{
  name: String (required),
  sku: String (required, unique, uppercase),
  category: String,
  cost: Number (default: 0),
  price: Number (default: 0),
  totalStock: Number (default: 0),
  minStockRule: Number (default: 0),
  status: String (enum: ['active', 'inactive', 'discontinued'], default: 'active'),
  createdAt: Date,
  updatedAt: Date
}
```

### Operation Model
```javascript
{
  reference: String (required, unique),
  type: String (enum: ['delivery', 'receipt'], required),
  status: String (enum: ['pending', 'in-progress', 'completed', 'cancelled', 'waiting'], required),
  lines: [{
    product: ObjectId (ref: 'Product', required),
    quantity: Number (required),
    _id: ObjectId
  }],
  responsible: String,
  deliveryAddress: String,
  receiveFrom: String,
  notes: String,
  createdAt: Date,
  updatedAt: Date
}
```

## API Endpoints

### Authentication Endpoints

#### POST `/api/auth/[...nextauth]`
NextAuth.js authentication endpoint for login/logout

#### POST `/api/signup`
Register a new user
```javascript
Request Body:
{
  name: String,
  email: String,
  password: String,
  role: String (optional, default: 'staff')
}

Response:
{
  success: Boolean,
  message: String,
  user: {
    name: String,
    email: String,
    role: String
  }
}
```

#### POST `/api/forgot-password`
Request password reset
```javascript
Request Body:
{
  email: String
}

Response:
{
  success: Boolean,
  message: String
}
```

#### POST `/api/verify-reset-code`
Verify reset code
```javascript
Request Body:
{
  email: String,
  code: String
}

Response:
{
  success: Boolean,
  message: String
}
```

#### POST `/api/reset-password`
Reset password with verified code
```javascript
Request Body:
{
  email: String,
  code: String,
  password: String
}

Response:
{
  success: Boolean,
  message: String
}
```

### Product Endpoints

#### GET `/api/products`
Get all products with optional search
```javascript
Query Parameters:
- search: String (optional)

Response:
{
  success: Boolean,
  data: Array<Product>,
  count: Number
}
```

#### POST `/api/products`
Create a new product
```javascript
Request Body:
{
  name: String (required),
  sku: String (required),
  category: String,
  cost: Number,
  price: Number,
  minStockRule: Number,
  totalStock: Number,
  status: String
}

Response:
{
  success: Boolean,
  message: String,
  data: Product
}
```

#### GET `/api/products/[id]`
Get a single product by ID
```javascript
Response:
{
  success: Boolean,
  data: Product
}
```

#### PATCH `/api/products/[id]`
Update a product
```javascript
Request Body:
{
  name: String,
  sku: String,
  category: String,
  cost: Number,
  price: Number,
  minStockRule: Number,
  totalStock: Number,
  status: String
}

Response:
{
  success: Boolean,
  message: String,
  data: Product
}
```

#### DELETE `/api/products/[id]`
Delete a product
```javascript
Response:
{
  success: Boolean,
  message: String,
  data: Product
}
```

### Delivery Endpoints

#### GET `/api/deliveries`
Get all delivery operations
```javascript
Response:
{
  success: Boolean,
  data: Array<Operation>
}
```

#### POST `/api/deliveries`
Create a new delivery
```javascript
Request Body:
{
  lines: [{
    product: String (Product ID),
    quantity: Number
  }],
  responsible: String,
  deliveryAddress: String,
  notes: String,
  status: String
}

Response:
{
  success: Boolean,
  message: String,
  data: Operation
}
```

#### GET `/api/deliveries/[id]`
Get a single delivery by ID
```javascript
Response:
{
  success: Boolean,
  data: Operation (with populated product details)
}
```

#### PATCH `/api/deliveries/[id]`
Update a delivery (Manager only)
```javascript
Request Body:
{
  status: String,
  lines: Array,
  responsible: String,
  deliveryAddress: String,
  notes: String
}

Response:
{
  success: Boolean,
  message: String,
  data: Operation
}
```

### Receipt Endpoints

#### GET `/api/receipts`
Get all receipt operations
```javascript
Response:
{
  success: Boolean,
  data: Array<Operation>
}
```

#### POST `/api/receipts`
Create a new receipt
```javascript
Request Body:
{
  lines: [{
    product: String (Product ID),
    quantity: Number
  }],
  responsible: String,
  receiveFrom: String,
  notes: String,
  status: String
}

Response:
{
  success: Boolean,
  message: String,
  data: Operation
}
```

#### GET `/api/receipts/[id]`
Get a single receipt by ID
```javascript
Response:
{
  success: Boolean,
  data: Operation (with populated product details)
}
```

#### PATCH `/api/receipts/[id]`
Update a receipt (Manager only)
```javascript
Request Body:
{
  status: String,
  lines: Array,
  responsible: String,
  receiveFrom: String,
  notes: String
}

Response:
{
  success: Boolean,
  message: String,
  data: Operation
}
```

## Key Features & Functionalities

### Role-Based Access Control

**Manager Role:**
- Can create, edit, and delete all operations
- Full access to stock management
- Can modify delivery and receipt records
- Access to all system features

**Staff Role:**
- Can create new operations
- Can view all operations
- Cannot edit or delete existing operations
- Limited administrative access

### Unique Reference Generation

**Deliveries:**
- Format: `WH/OUT/####`
- Auto-incremented based on existing delivery count
- Example: WH/OUT/0001, WH/OUT/0002

**Receipts:**
- Format: `WH/IN/####`
- Auto-incremented based on existing receipt count
- Example: WH/IN/0001, WH/IN/0002

### Stock Tracking

- **Total Stock**: Current quantity in warehouse
- **On Hand**: Available stock quantity
- **Free to Use**: Total stock minus minimum stock rule
- **Min Stock Rule**: Safety stock level to maintain

### Real-Time Stock Checking

When creating deliveries, the system:
1. Checks product availability in real-time
2. Displays current stock levels
3. Warns if requested quantity exceeds available stock
4. Prevents over-allocation of inventory

### Edit Functionality

**Access Control:**
- Only managers can edit existing operations
- Edit button navigates to `/delivery/edit/[id]` or `/receipts/edit/[id]`
- Session-based role validation
- Unauthorized access redirects to dashboard

**Edit Features:**
- Inline editing for product details
- Save changes button updates database
- Cancel button discards changes
- Real-time validation

### Navigation & UI

**Responsive Navigation Bar:**
- Dashboard
- Operations (Deliveries & Receipts)
- Stocks (Product Management)
- Move History
- Settings

**Interactive Elements:**
- Clickable operation cards in kanban view
- Clickable rows in list view
- Modal dialogs for forms
- Toast notifications for actions

## Environment Variables

Create a `.env.local` file in the root directory:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/stockmaster

# NextAuth
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=http://localhost:3000

# Email (for password recovery)
EMAIL_SERVICE=smtp
EMAIL_HOST=smtp.example.com
EMAIL_PORT=587
EMAIL_USER=your-email@example.com
EMAIL_PASSWORD=your-email-password
```

## Installation & Setup

1. **Clone the repository**
```bash
git clone <repository-url>
cd StockMaster
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
Create `.env.local` file with required variables

4. **Run the development server**
```bash
npm run dev
```

5. **Access the application**
Open [http://localhost:3000](http://localhost:3000)

## Usage Guide

### Creating a New Product

1. Navigate to **Stocks** page
2. Click **Add Product** button
3. Fill in required fields:
   - Product Name (required)
   - SKU (required, unique)
   - Cost
   - Initial Stock
   - Min Stock Rule
4. Click **Add Product** to save

### Creating a Delivery

1. Navigate to **Operations** → **Deliveries**
2. Click **New Delivery** button
3. Add products:
   - Select product from dropdown
   - Enter quantity
   - System shows available stock
4. Fill in details:
   - Responsible person
   - Delivery address
   - Notes (optional)
5. Choose to **Save as Draft** or **Confirm**

### Creating a Receipt

1. Navigate to **Operations** → **Receipts**
2. Click **New Receipt** button
3. Add products and quantities
4. Fill in details:
   - Responsible person
   - Receive from (source)
   - Notes (optional)
5. Choose to **Save as Draft** or **Confirm**

### Editing Operations (Manager Only)

1. Click on any operation card or row
2. System redirects to edit page
3. Modify fields as needed
4. Click **Save Changes** to update
5. Click **Cancel** to discard changes

### Managing Stock

1. Navigate to **Stocks** page
2. View all products with current levels
3. Click **Edit** to modify product details
4. Click **Delete** to remove product (with confirmation)
5. Changes are saved immediately

## Security Features

- Password hashing with bcrypt
- Session-based authentication
- Role-based route protection
- CSRF protection via NextAuth.js
- Environment variable protection
- Input validation and sanitization
- SKU uniqueness validation

## Error Handling

The system includes comprehensive error handling:
- Invalid credentials
- Duplicate SKU entries
- Insufficient stock warnings
- Network errors
- Database connection errors
- Unauthorized access attempts

## Future Enhancements

- Barcode scanning integration
- Advanced reporting and analytics
- Inventory forecasting
- Multi-warehouse support
- Mobile app version
- Export functionality (PDF, Excel)
- Email notifications for low stock
- Audit trail and activity logs

## Support & Contribution

For issues, feature requests, or contributions, please refer to the project repository.

## License

[Add your license information here]

---

**Version**: 1.0.0  
**Last Updated**: November 22, 2025
