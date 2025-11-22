# 📦 StockMaster - Warehouse Management System

<div align="center">

![StockMaster](https://img.shields.io/badge/StockMaster-v2.0.0-purple?style=for-the-badge)
![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)
![MongoDB](https://img.shields.io/badge/MongoDB-Database-green?style=for-the-badge&logo=mongodb)
![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)

**A modern, full-featured warehouse management system built with Next.js 15**

[Features](#-key-features) • [Installation](#-installation) • [Documentation](#-documentation) • [Tech Stack](#-technology-stack) • [Contributing](#-contributing)

</div>

---

## 🌟 Overview

StockMaster is a comprehensive warehouse management system designed to streamline inventory operations, delivery management, and receipt tracking. Built with modern web technologies, it offers an intuitive interface for managing stock movements, tracking products, and maintaining real-time inventory accuracy.

### 🎯 Core Capabilities

- **📥 Receipt Management** - Track incoming stock from suppliers with automated warehouse allocation
- **📤 Delivery Operations** - Manage both external deliveries and internal warehouse transfers
- **📊 Real-time Inventory** - Monitor stock levels, product availability, and movement history
- **👥 Role-Based Access** - Separate permissions for managers and staff members
- **🔄 Status Workflows** - Clear operational states from draft to completion
- **📱 Responsive Design** - Modern, mobile-friendly interface with multiple view modes

---

## ✨ Key Features

### Inventory Management
- ✅ **Product Catalog** - Comprehensive product database with SKU tracking
- ✅ **Stock Tracking** - Real-time "On Hand" and "Free to Use" stock calculations
- ✅ **Minimum Stock Rules** - Automated low-stock alerts and warnings
- ✅ **Cost Management** - Per-unit cost tracking and valuation

### Receipt Operations
- 📦 **External Receipts** - Process incoming stock from suppliers/vendors
- 🏷️ **Automatic Reference** - Auto-generated WH/IN/#### reference numbers
- ✅ **Status Workflow** - Draft → Ready → Done progression
- 📝 **Product Lines** - Multi-product receipt handling with quantities

### Delivery Operations
- 🚚 **External Deliveries** - Ship products to customers with address tracking
- 🔄 **Internal Transfers** - Move stock between warehouse locations
- 🏷️ **Automatic Reference** - Auto-generated WH/OUT/#### reference numbers
- ⚡ **Stock Validation** - Real-time availability checking before delivery
- ✅ **Status Workflow** - Draft → Waiting → Ready → Done progression

### User Experience
- 🎨 **Modern UI** - Clean, purple-themed interface with consistent design
- 📋 **Dual View Modes** - Switch between List and Kanban board views
- 🔍 **Advanced Search** - Filter operations by reference, contact, or product
- 📊 **Operation History** - Complete audit trail of all inventory movements
- 🖨️ **Print Support** - Generate printable operation documents

### Security & Access Control
- 🔐 **Authentication** - Secure login with NextAuth.js
- 👤 **Role Management** - Manager and Staff role separation
- 🔒 **Permission System** - Operation-level access restrictions
- 📧 **Password Recovery** - Email-based password reset with verification codes

---

## 🏗️ Technology Stack

### Frontend
- **[Next.js 15](https://nextjs.org/)** - React framework with App Router
- **[React 19](https://react.dev/)** - UI component library
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first CSS framework
- **[NextAuth.js](https://next-auth.js.org/)** - Authentication solution

### Backend
- **[MongoDB](https://www.mongodb.com/)** - NoSQL database
- **[Mongoose](https://mongoosejs.com/)** - MongoDB ODM
- **Next.js API Routes** - Serverless API endpoints

### Development Tools
- **[ESLint](https://eslint.org/)** - Code linting and quality
- **[PostCSS](https://postcss.org/)** - CSS processing
- **JavaScript** - Primary programming language

---

## 🚀 Installation

### Prerequisites

- **Node.js** 18.0 or higher
- **npm** or **yarn** package manager
- **MongoDB** database (local or cloud)

### Step 1: Clone the Repository

```bash
git clone https://github.com/yourusername/stockmaster.git
cd stockmaster
```

### Step 2: Install Dependencies

```bash
npm install
# or
yarn install
```

### Step 3: Environment Configuration

Create a `.env.local` file in the root directory:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/stockmaster

# Authentication
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here

# Email Configuration (for password reset)
EMAIL_USER=your-email@example.com
EMAIL_PASS=your-email-password
```

### Step 4: Initialize Database

Run the warehouse initialization:

```bash
# Start the development server first
npm run dev

# Then make a POST request to initialize the warehouse
curl -X POST http://localhost:3000/api/warehouses/initialize
```

### Step 5: Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Step 6: Create Your First User

Navigate to the signup page and create a manager account to access all features.

---

## 📖 Documentation

### Project Structure

```
StockMaster/
├── app/
│   ├── api/              # API routes (serverless functions)
│   │   ├── auth/         # Authentication endpoints
│   │   ├── deliveries/   # Delivery operations API
│   │   ├── receipts/     # Receipt operations API
│   │   ├── products/     # Product management API
│   │   └── warehouses/   # Warehouse configuration API
│   ├── dashboard/        # Dashboard page
│   ├── delivery/         # Delivery pages
│   ├── receipts/         # Receipt pages
│   ├── stock/            # Stock management pages
│   └── login/            # Authentication pages
├── components/
│   ├── delivery/         # Delivery UI components
│   ├── receipts/         # Receipt UI components
│   ├── stock/            # Stock UI components
│   └── ui/               # Shared UI components
├── models/               # MongoDB schemas
│   ├── Operation.js      # Operations model
│   ├── Product.js        # Product model
│   ├── Warehouse.js      # Warehouse model
│   └── user.js           # User model
├── db/                   # Database connection
└── lib/                  # Utility functions
```

### API Endpoints

#### Products
- `GET /api/products` - List all products
- `POST /api/products` - Create new product
- `GET /api/products/[id]` - Get product details
- `PATCH /api/products/[id]` - Update product
- `DELETE /api/products/[id]` - Delete product

#### Deliveries
- `GET /api/deliveries` - List all deliveries
- `POST /api/deliveries` - Create delivery (Manager only)
- `GET /api/deliveries/[id]` - Get delivery details
- `PATCH /api/deliveries/[id]` - Update delivery (Manager only)

#### Receipts
- `GET /api/receipts` - List all receipts
- `POST /api/receipts` - Create receipt (Manager only)
- `GET /api/receipts/[id]` - Get receipt details
- `PATCH /api/receipts/[id]` - Update receipt (Manager only)

#### Warehouses
- `GET /api/warehouses` - Get main warehouse
- `POST /api/warehouses` - Create warehouse
- `POST /api/warehouses/initialize` - Initialize default warehouse

For detailed API documentation, see [DOCUMENTATION.md](./DOCUMENTATION.md).

---

## 🎨 Design Philosophy

### UI/UX Approach

StockMaster follows a **modern, minimalist design** philosophy with these core principles:

1. **Consistency** - Unified purple/gray color scheme across all pages
2. **Clarity** - Clear visual hierarchy with proper spacing and typography
3. **Efficiency** - Quick access to common operations and keyboard shortcuts
4. **Responsiveness** - Mobile-first design that scales to all devices
5. **Accessibility** - Semantic HTML and ARIA labels for screen readers

### Color Palette

```css
Primary Background: #f5f5f7 (Light Gray)
Primary Action:     #7c3aed (Purple 600)
Primary Hover:      #6d28d9 (Purple 700)
Borders:            #d1d5db (Gray 300)
Text Primary:       #111827 (Gray 900)
Text Secondary:     #6b7280 (Gray 600)
```

---

## 🔄 Operational Workflows

### Receipt Workflow

```
Draft → Ready → Done
```

1. **Draft** - Receipt created with product lines
2. **Ready** - Receipt confirmed and ready to receive
3. **Done** - Goods received, stock updated automatically

### Delivery Workflow

```
Draft → Waiting → Ready → Done
```

1. **Draft** - Delivery created with product selection
2. **Waiting** - Awaiting stock availability
3. **Ready** - Stock available, ready to ship
4. **Done** - Goods delivered, stock deducted

---

## 👥 User Roles

### Manager
- ✅ Create, edit, and delete operations
- ✅ Manage product catalog
- ✅ Access all system features
- ✅ View complete operation history

### Staff
- ✅ View operations and inventory
- ✅ Track stock levels
- ❌ Cannot create or modify operations
- ❌ Limited to read-only access

---

## 🔧 Development

### Available Scripts

```bash
# Development server with hot reload
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint
```

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `MONGODB_URI` | MongoDB connection string | Yes |
| `NEXTAUTH_URL` | Application URL | Yes |
| `NEXTAUTH_SECRET` | Authentication secret key | Yes |
| `EMAIL_USER` | Email for password reset | Optional |
| `EMAIL_PASS` | Email password | Optional |

---

## 📋 Roadmap

### Version 2.1 (Planned)
- [ ] Multi-warehouse support
- [ ] Barcode scanning integration
- [ ] Advanced reporting and analytics
- [ ] Export to Excel/PDF
- [ ] Mobile app development

### Version 2.2 (Future)
- [ ] Automated stock replenishment
- [ ] Integration with accounting systems
- [ ] Supplier management module
- [ ] Purchase order generation
- [ ] Inventory forecasting with AI

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Coding Standards

- Follow ESLint configuration
- Write meaningful commit messages
- Add comments for complex logic
- Update documentation for new features

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Authors

**DevSsChar** - *Initial work and maintenance*

---

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/) by Vercel
- UI components styled with [Tailwind CSS](https://tailwindcss.com/)
- Authentication powered by [NextAuth.js](https://next-auth.js.org/)
- Database by [MongoDB](https://www.mongodb.com/)

---

## 📞 Support

For support, email support@stockmaster.com or open an issue in the GitHub repository.

---

<div align="center">

**[⬆ Back to Top](#-stockmaster---warehouse-management-system)**

Made with ❤️ by the StockMaster Team

</div>
