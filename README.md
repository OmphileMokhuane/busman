This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

# Business Management System (BMan) - File Structure

## Root Directory

```bash
busman/
├── .git/                          # Git repository (on main branch)
├── .next/                         # Next.js build output (auto-generated)
├── node_modules/                  # Dependencies (auto-generated)
├── public/                        # Static assets
│   ├── favicon.ico
│   └── images/
├── src/                          # Source code
│   ├── app/                      # Next.js App Router pages
│   │   ├── layout.tsx            # Root layout with Header
│   │   ├── page.tsx              # Dashboard (home page)
│   │   ├── globals.css           # Global styles
│   │   │
│   │   ├── login/                # Login page
│   │   │   └── page.jsx
│   │   │
│   │   ├── clients/              # Client management
│   │   │   ├── page.jsx          # List all clients
│   │   │   ├── new/
│   │   │   │   └── page.jsx      # Add new client form
│   │   │   └── [id]/
│   │   │       ├── page.jsx      # View client details
│   │   │       └── edit/
│   │   │           └── page.jsx  # Edit client form
│   │   │
│   │   ├── quotations/           # Quotation management
│   │   │   ├── page.jsx          # List all quotations
│   │   │   ├── new/
│   │   │   │   └── page.jsx      # Create new quotation
│   │   │   └── [id]/
│   │   │       ├── page.jsx      # View quotation
│   │   │       ├── edit/
│   │   │       │   └── page.jsx  # Edit quotation
│   │   │       └── convert/
│   │   │           └── page.jsx  # Convert to invoice
│   │   │
│   │   ├── invoices/             # Invoice management
│   │   │   ├── page.jsx          # List all invoices
│   │   │   ├── new/
│   │   │   │   └── page.jsx      # Create new invoice
│   │   │   └── [id]/
│   │   │       ├── page.jsx      # View invoice
│   │   │       ├── edit/
│   │   │       │   └── page.jsx  # Edit invoice
│   │   │       └── payment/
│   │   │           └── page.jsx  # Record payment
│   │   │
│   │   └── pumps/                # Pump management
│   │       ├── page.jsx          # List all pumps in workshop
│   │       ├── new/
│   │       │   └── page.jsx      # Add pump to workshop
│   │       └── [id]/
│   │           ├── page.jsx      # View pump details
│   │           ├── edit/
│   │           │   └── page.jsx  # Update pump status/notes
│   │           └── invoice/
│   │               └── page.jsx  # Generate invoice for repair
│   │
│   ├── components/               # Reusable components
│   │   ├── Header.jsx            # Main navigation (Server Component)
│   │   ├── MobileMenu.jsx        # Mobile menu (Client Component)
│   │   ├── Dashboard.jsx         # Dashboard content (Client Component)
│   │   ├── RegisterForm.jsx      # Registration form (Client Component)
│   │   │
│   │   ├── clients/              # Client-specific components
│   │   │   ├── ClientForm.jsx    # Add/Edit client form
│   │   │   ├── ClientList.jsx    # Client table/list
│   │   │   ├── ClientCard.jsx    # Client card display
│   │   │   └── ClientSelector.jsx # Dropdown to select client
│   │   │
│   │   ├── quotations/           # Quotation components
│   │   │   ├── QuotationForm.jsx
│   │   │   ├── QuotationList.jsx
│   │   │   ├── QuotationPreview.jsx
│   │   │   └── LineItemEditor.jsx # Add/edit line items
│   │   │
│   │   ├── invoices/             # Invoice components
│   │   │   ├── InvoiceForm.jsx
│   │   │   ├── InvoiceList.jsx
│   │   │   ├── InvoicePreview.jsx
│   │   │   └── PaymentForm.jsx
│   │   │
│   │   ├── pumps/                # Pump components
│   │   │   ├── PumpForm.jsx
│   │   │   ├── PumpList.jsx
│   │   │   ├── PumpCard.jsx
│   │   │   └── StatusTracker.jsx # Visual status tracker
│   │   │
│   │   └── ui/                   # Shared UI components
│   │       ├── Button.jsx
│   │       ├── Input.jsx
│   │       ├── Select.jsx
│   │       ├── Modal.jsx
│   │       ├── Alert.jsx
│   │       ├── Table.jsx
│   │       └── Card.jsx
│   │
│   ├── actions/                  # Server Actions
│   │   ├── userController.js     # Auth actions (login, register, logout)
│   │   ├── clientController.js      # Client CRUD operations
│   │   ├── quotationActions.js   # Quotation operations
│   │   ├── invoiceActions.js     # Invoice operations
│   │   └── pumpActions.js        # Pump operations
│   │
│   ├── lib/                      # Utility functions & configs
│   │   ├── db.js                 # MongoDB connection
│   │   ├── getUser.js            # Get user from cookie
│   │   ├── schema.js             # Database schema documentation
│   │   ├── validators.js         # Form validation functions
│   │   ├── formatters.js         # Date, currency formatters
│   │   └── generators.js         # Generate invoice/quotation numbers
│   │
│   └── utils/                    # Helper utilities
│       ├── constants.js          # App constants (statuses, etc.)
│       ├── calculations.js       # Tax, total calculations
│       └── pdf.js                # PDF generation (future)
│
├── .env.local                    # Environment variables (NOT in git)
├── .gitignore                    # Git ignore file
├── package.json                  # Dependencies
├── package-lock.json             # Lock file
├── next.config.js                # Next.js configuration
├── tailwind.config.js            # Tailwind CSS config
├── postcss.config.js             # PostCSS config
├── tsconfig.json                 # TypeScript config
├── PROJECT_STRUCTURE.md          # This file
└── README.md                     # Project documentation
```

## **Component Hierarchy**

```bash
App
├── Layout (Server)
│   ├── Header (Server)
│   │   └── MobileMenu (Client)
│   └── Children (Pages)
│
├── Dashboard (Server → Client)
│   ├── Stats Cards
│   ├── Quick Actions
│   └── Recent Activity
│
├── Clients Pages
│   ├── List (Server)
│   │   └── ClientList (Client)
│   ├── New (Server)
│   │   └── ClientForm (Client)
│   └── Detail (Server)
│       └── ClientCard (Client)
│
├── Quotations Pages
│   ├── List (Server)
│   │   └── QuotationList (Client)
│   └── New (Server)
│       ├── ClientSelector (Client)
│       └── QuotationForm (Client)
│           └── LineItemEditor (Client)
│
├── Invoices Pages (similar structure)
└── Pumps Pages (similar structure)
```

## **Data Flow**

```bash
1. User Authentication
   Browser → Login Form → Server Action (login) → Set Cookie → Redirect

2. Fetching Data
   Page (Server) → getCollection() → MongoDB → Return Data → Pass to Client Component

3. Creating/Updating Data
   Form (Client) → Server Action → Validate → MongoDB → Redirect/Return

4. Client Selection Flow
   Create Quotation/Invoice/Pump → ClientSelector → Fetch Clients → Select → Save with clientId
```

## **Status Enums**

```javascript
// Quotation Statuses
['draft', 'sent', 'accepted', 'rejected', 'expired']

// Invoice Statuses
['draft', 'sent', 'paid', 'partial', 'overdue', 'cancelled']

// Pump Statuses
['received', 'in-diagnosis', 'awaiting-parts', 'in-repair', 'repaired', 'ready-collection', 'delivered']
```

## **Next Steps to Build**

1. ✅ Authentication (Done)
2. ✅ Dashboard (Done)
3. 🔄 Client Management (Next)
4. ⏳ Quotations
5. ⏳ Invoices
6. ⏳ Pumps
7. ⏳ PDF Generation
8. ⏳ Reports & Analytics
