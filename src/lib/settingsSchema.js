/**
 * SETTINGS COLLECTION SCHEMA
 * Stores user business settings and preferences
 */

const settingsSchema = {
  collection: "settings",
  fields: {
    _id: "ObjectId - Auto-generated",
    userId: "ObjectId - Reference to users collection (unique per user)",
    
    // Business Information
    businessName: "String - Optional - Business name",
    businessAddress: "String - Optional - Business address",
    businessPhone: "String - Optional - Business phone",
    businessEmail: "String - Optional - Business email",
    
    // Invoice Settings
    invoicePrefix: "String - Default 'INV' - Invoice number prefix",
    invoiceStartNumber: "Number - Default 1 - Starting invoice number",
    invoiceCurrentNumber: "Number - Tracks current invoice number",
    
    // Quotation Settings
    quotationPrefix: "String - Default 'QUO' - Quotation number prefix",
    quotationStartNumber: "Number - Default 1 - Starting quotation number",
    quotationCurrentNumber: "Number - Tracks current quotation number",
    
    // Default Values
    defaultTaxRate: "Number - Default 15 - Default tax rate percentage",
    defaultPaymentTerms: "Number - Default 30 - Default payment terms in days",
    
    // Timestamps
    createdAt: "Date - Auto-generated",
    updatedAt: "Date - Auto-updated"
  },
  indexes: [
    { userId: 1 } // Unique index - one settings doc per user
  ],
  notes: [
    "Each user has exactly one settings document",
    "Settings are created with defaults when user registers",
    "Invoice/Quotation numbers auto-increment from start number"
  ]
}

export default settingsSchema