# BMan - Business Management System

A comprehensive business management application built with Next.js, designed for managing clients, quotations, invoices, and pump repair services. The system provides a complete workflow from client onboarding to invoice generation and payment tracking.

## 🚀 Features

### Core Functionality

- **User Authentication**: Secure registration and login with JWT tokens and bcrypt password hashing
- **Dashboard**: Overview of business metrics with quick action buttons
- **Client Management**: Create, view, edit, and delete client records with validation
- **Quotation System**: Generate professional quotations with line items, tax calculations, and expiry dates
- **Invoice Management**: Convert quotations to invoices, track payments, and manage invoice status
- **Pump Repair Tracking**: Specialized module for pump service businesses (clients, repairs, parts, costs)
- **Settings**: Configurable business information, numbering prefixes, and default values

### Technical Features

- **Server-Side Rendering**: Built with Next.js 15 App Router for optimal performance
- **Database Integration**: MongoDB with structured collections and relationships
- **Responsive Design**: Mobile-first design using Tailwind CSS and DaisyUI components
- **Form Validation**: Comprehensive client and server-side validation
- **Real-time Updates**: Automatic calculation of totals, taxes, and balances
- **Security**: HTTP-only cookies, input sanitization, and secure authentication

## 🛠️ Tech Stack

### Frontend

- **Next.js 15**: React framework with App Router
- **React 19**: Latest React with concurrent features
- **TypeScript**: Type safety for better development experience
- **Tailwind CSS 4**: Utility-first CSS framework
- **DaisyUI**: Component library built on Tailwind

### Backend

- **Next.js API Routes**: Server-side API endpoints
- **Server Actions**: Form handling and data mutations
- **MongoDB**: NoSQL database for flexible data storage
- **Mongoose**: MongoDB object modeling (via native driver)

### Security & Authentication

- **JWT**: JSON Web Tokens for session management
- **bcrypt**: Password hashing and verification
- **HTTP-only Cookies**: Secure cookie storage

### Development Tools

- **Turbopack**: Fast bundler for development
- **ESLint**: Code linting and formatting
- **PostCSS**: CSS processing

## 📁 Project Structure

```bash
src/
├── app/                    # Next.js App Router pages
│   ├── clients/           # Client management pages
│   ├── invoices/          # Invoice management pages
│   ├── quotations/        # Quotation management pages
│   ├── settings/          # Settings page
│   ├── login/             # Authentication page
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home/dashboard page
│   └── globals.css        # Global styles
├── components/            # Reusable React components
│   ├── clients/           # Client-related components
│   ├── invoices/          # Invoice-related components
│   ├── quotations/        # Quotation-related components
│   ├── settings/          # Settings components
│   ├── Dashboard.jsx      # Main dashboard component
│   ├── Header.jsx         # Navigation header
│   ├── MobileMenu.jsx     # Mobile navigation
│   └── RegisterForm.jsx   # Registration form
├── lib/                   # Utility libraries
│   ├── db.js              # MongoDB connection
│   ├── getUser.js         # User authentication helper
│   ├── schema.js          # Database schema definitions
│   └── settingsSchema.js  # Settings schema
└── actions/               # Server actions for data operations
    ├── clientsController.js    # Client CRUD operations
    ├── invoiceController.js    # Invoice management
    ├── quotationsController.js # Quotation management
    ├── settingsController.js   # Settings management
    └── userController.js       # User authentication
```

## 🗄️ Database Schema

### Collections

#### Users Collection

```javascript
{
  _id: ObjectId,
  username: String (unique, 3-30 chars, alphanumeric),
  password: String (bcrypt hashed),
  createdAt: Date
}
```

#### Clients

```javascript
{
  _id: ObjectId,
  userId: ObjectId (reference to users),
  name: String (required),
  companyName: String (optional),
  email: String (required, unique per user),
  phoneNumber: String (optional),
  companyAddress: String (required if companyName exists),
  createdAt: Date,
  updatedAt: Date
}
```

#### Quotations Collection

```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  clientId: ObjectId,
  quotationNumber: String (auto-generated: QUO-YYYY-NNN),
  date: Date,
  validUntil: Date,
  items: [{
    description: String,
    quantity: Number,
    unitPrice: Number,
    total: Number
  }],
  subtotal: Number,
  tax: Number,
  taxRate: Number,
  total: Number,
  status: String (draft|sent|accepted|rejected|expired),
  notes: String,
  createdAt: Date,
  updatedAt: Date
}
```

#### Invoices Collection

```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  clientId: ObjectId,
  quotationId: ObjectId (optional),
  invoiceNumber: String (auto-generated: INV-YYYY-NNN),
  date: Date,
  dueDate: Date,
  items: [/* same as quotations */],
  subtotal: Number,
  tax: Number,
  taxRate: Number,
  total: Number,
  amountPaid: Number,
  balance: Number,
  status: String (draft|sent|paid|partial|overdue|cancelled),
  paymentMethod: String,
  paymentDate: Date,
  notes: String,
  createdAt: Date,
  updatedAt: Date
}
```

#### Pumps Collection

```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  clientId: ObjectId,
  pumpModel: String,
  serialNumber: String (unique),
  brand: String,
  status: String (received|in-diagnosis|awaiting-parts|in-repair|repaired|ready-collection|delivered),
  dateReceived: Date,
  dateDelivered: Date,
  issueDescription: String,
  diagnosisNotes: String,
  repairNotes: String,
  partsUsed: [{
    partName: String,
    partNumber: String,
    quantity: Number,
    cost: Number
  }],
  estimatedCost: Number,
  actualCost: Number,
  laborCost: Number,
  totalCost: Number,
  invoiceId: ObjectId (optional),
  createdAt: Date,
  updatedAt: Date
}
```

#### Settings Collection

```javascript
{
  _id: ObjectId,
  userId: ObjectId (unique per user),
  businessName: String,
  businessAddress: String,
  businessPhone: String,
  businessEmail: String,
  invoicePrefix: String (default: "INV"),
  invoiceStartNumber: Number (default: 1),
  invoiceCurrentNumber: Number,
  quotationPrefix: String (default: "QUO"),
  quotationStartNumber: Number (default: 1),
  quotationCurrentNumber: Number,
  defaultTaxRate: Number (default: 15),
  defaultPaymentTerms: Number (default: 30),
  createdAt: Date,
  updatedAt: Date
}
```

## 🚀 Installation

1.**Clone the repository**

```bash
   git clone <repository-url>
   cd busman
   ```

2.**Install dependencies**

```bash
   npm install
   ```

3.**Environment Setup**
Create a `.env.local` file in the root directory:

   ```env
   CONNECTIONSTRING=mongodb://localhost:27017/busman
   JWT_SECRET=your-super-secret-jwt-key-here
   ```

4.**Start MongoDB**
   Make sure MongoDB is running on your system.

5.**Run the development server**

   ```bash
   npm run dev
   ```

6.**Open your browser**
   Navigate to `http://localhost:3000`

## 📖 Usage

### Getting Started

1. **Register**: Create a new account on the homepage
2. **Login**: Use your credentials to access the dashboard
3. **Configure Settings**: Set up your business information and preferences

### Managing Clients

- Navigate to `/clients` to view all clients
- Click "New Client" to add a client
- Edit or delete clients as needed

### Creating Quotations

- Go to `/quotations` and click "New Quotation"
- Select a client and add line items
- Set tax rate and validity period
- Save as draft or send to client

### Invoice Management

- Convert quotations to invoices from the quotation details page
- Track payments and update invoice status
- View payment history and outstanding balances

### Pump Repair Workflow

- Add pumps for existing clients
- Track repair status through the workflow
- Generate invoices for completed repairs

## 🔧 Development

### Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm start` - Start production server

### Code Style

- Uses ESLint for code linting
- TypeScript for type safety
- Consistent naming conventions
- Server actions for data mutations

### Key Patterns

- **Server Components**: Used for data fetching and initial rendering
- **Client Components**: Used for interactivity and forms
- **Server Actions**: Handle form submissions and data mutations
- **Middleware**: Authentication checks and redirects

## 📄 License

This project is private and proprietary.

## 📞 Support

For support or questions, please contact the development team.

---

**Built with ❤️ using Next.js, React, and MongoDB**
