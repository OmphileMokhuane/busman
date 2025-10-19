/**
 * DATABASE SCHEMA DESIGN
 * Business Management System (BMan)
 * 
 * MongoDB Collections Structure
 */

// ============================================
// USERS COLLECTION
// ============================================
const usersSchema = {
  collection: "users",
  fields: {
    _id: "ObjectId - Auto-generated",
    username: "String - Unique, 3-30 chars, alphanumeric",
    password: "String - Bcrypt hashed",
    createdAt: "Date - Auto-generated"
  },
  indexes: [
    { username: 1 }, // Unique index
  ]
}

// ============================================
// CLIENTS COLLECTION
// ============================================
const clientsSchema = {
  collection: "clients",
  fields: {
    _id: "ObjectId - Auto-generated",
    userId: "ObjectId - Reference to users collection (owner)",
    name: "String - Required - Client's full name",
    companyName: "String - Optional - Company name",
    email: "String - Required - Valid email format",
    phoneNumber: "String - Optional - Contact number",
    companyAddress: "String - Required if companyName exists",
    createdAt: "Date - Auto-generated",
    updatedAt: "Date - Auto-updated"
  },
  indexes: [
    { userId: 1 },
    { email: 1 },
  ],
  validation: {
    name: "Required, min 2 chars",
    email: "Required, valid email format",
    companyAddress: "Required if companyName is provided",
  }
}

// ============================================
// QUOTATIONS COLLECTION
// ============================================
const quotationsSchema = {
  collection: "quotations",
  fields: {
    _id: "ObjectId - Auto-generated",
    userId: "ObjectId - Reference to users collection",
    clientId: "ObjectId - Reference to clients collection",
    quotationNumber: "String - Auto-generated (e.g., QUO-2025-001)",
    date: "Date - Quotation date",
    validUntil: "Date - Expiry date",
    items: [
      {
        description: "String - Item/service description",
        quantity: "Number - Quantity",
        unitPrice: "Number - Price per unit",
        total: "Number - quantity * unitPrice"
      }
    ],
    subtotal: "Number - Sum of all item totals",
    tax: "Number - Tax amount (e.g., 15% VAT)",
    taxRate: "Number - Tax percentage (e.g., 15)",
    total: "Number - subtotal + tax",
    status: "String - Enum: ['draft', 'sent', 'accepted', 'rejected', 'expired']",
    notes: "String - Optional additional notes",
    createdAt: "Date - Auto-generated",
    updatedAt: "Date - Auto-updated"
  },
  indexes: [
    { userId: 1 },
    { clientId: 1 },
    { quotationNumber: 1 }, // Unique
    { status: 1 },
  ]
}

// ============================================
// INVOICES COLLECTION
// ============================================
const invoicesSchema = {
  collection: "invoices",
  fields: {
    _id: "ObjectId - Auto-generated",
    userId: "ObjectId - Reference to users collection",
    clientId: "ObjectId - Reference to clients collection",
    quotationId: "ObjectId - Optional - Reference if converted from quotation",
    invoiceNumber: "String - Auto-generated (e.g., INV-2025-001)",
    date: "Date - Invoice date",
    dueDate: "Date - Payment due date",
    items: [
      {
        description: "String - Item/service description",
        quantity: "Number - Quantity",
        unitPrice: "Number - Price per unit",
        total: "Number - quantity * unitPrice"
      }
    ],
    subtotal: "Number - Sum of all item totals",
    tax: "Number - Tax amount",
    taxRate: "Number - Tax percentage",
    total: "Number - subtotal + tax",
    amountPaid: "Number - Amount paid so far",
    balance: "Number - total - amountPaid",
    status: "String - Enum: ['draft', 'sent', 'paid', 'partial', 'overdue', 'cancelled']",
    paymentMethod: "String - Optional - e.g., 'Cash', 'EFT', 'Card'",
    paymentDate: "Date - Optional - When payment was received",
    notes: "String - Optional additional notes",
    createdAt: "Date - Auto-generated",
    updatedAt: "Date - Auto-updated"
  },
  indexes: [
    { userId: 1 },
    { clientId: 1 },
    { invoiceNumber: 1 }, // Unique
    { status: 1 },
    { dueDate: 1 },
  ]
}

// ============================================
// PUMPS COLLECTION
// ============================================
const pumpsSchema = {
  collection: "pumps",
  fields: {
    _id: "ObjectId - Auto-generated",
    userId: "ObjectId - Reference to users collection",
    clientId: "ObjectId - Reference to clients collection (owner)",
    pumpModel: "String - Model name/number",
    serialNumber: "String - Unique serial number",
    brand: "String - Manufacturer/brand",
    status: "String - Enum: ['received', 'in-diagnosis', 'awaiting-parts', 'in-repair', 'repaired', 'ready-collection', 'delivered']",
    dateReceived: "Date - When pump arrived at workshop",
    dateDelivered: "Date - Optional - When pump was returned to client",
    issueDescription: "String - Client's reported issue",
    diagnosisNotes: "String - Technician's findings",
    repairNotes: "String - Work performed",
    partsUsed: [
      {
        partName: "String - Part description",
        partNumber: "String - Part number",
        quantity: "Number",
        cost: "Number"
      }
    ],
    estimatedCost: "Number - Initial estimate",
    actualCost: "Number - Final cost",
    laborCost: "Number - Labor charges",
    totalCost: "Number - actualCost + laborCost",
    invoiceId: "ObjectId - Optional - Reference to invoice if created",
    createdAt: "Date - Auto-generated",
    updatedAt: "Date - Auto-updated"
  },
  indexes: [
    { userId: 1 },
    { clientId: 1 },
    { serialNumber: 1 },
    { status: 1 },
  ]
}

// ============================================
// RELATIONSHIPS
// ============================================
const relationships = {
  "users → clients": "One-to-Many (one user has many clients)",
  "users → quotations": "One-to-Many",
  "users → invoices": "One-to-Many",
  "users → pumps": "One-to-Many",
  "clients → quotations": "One-to-Many (one client has many quotations)",
  "clients → invoices": "One-to-Many",
  "clients → pumps": "One-to-Many",
  "quotations → invoices": "One-to-One (optional - quotation can be converted to invoice)",
  "pumps → invoices": "One-to-One (optional - pump repair can generate invoice)",
}

// ============================================
// BUSINESS RULES
// ============================================
const businessRules = {
  clients: [
    "Cannot delete client if they have active quotations/invoices/pumps",
    "Email must be unique per user",
    "If companyName provided, companyAddress is required",
  ],
  quotations: [
    "Auto-generate quotation number: QUO-YYYY-NNN",
    "Status automatically changes to 'expired' after validUntil date",
    "Can convert to invoice (copies all data)",
  ],
  invoices: [
    "Auto-generate invoice number: INV-YYYY-NNN",
    "Status changes to 'overdue' if unpaid after dueDate",
    "Balance = total - amountPaid",
    "Status 'partial' if 0 < amountPaid < total",
  ],
  pumps: [
    "Must have associated client (owner)",
    "Track status through repair workflow",
    "Can generate invoice for repair work",
  ]
}

export {
  usersSchema,
  clientsSchema,
  quotationsSchema,
  invoicesSchema,
  pumpsSchema,
  relationships,
  businessRules
}