"use server"
import { getCollection } from "../lib/db"
import { getUserFromCookie } from "../lib/getUser"
import { redirect } from "next/navigation"
import { ObjectId } from "mongodb"

// Helper function to generate quotation number from settings
async function generateQuotationNumber(userId) {
    const settingsCollection = await getCollection("settings")
    const quotationsCollection = await getCollection("quotations")
    
    // Get user settings
    let settings = await settingsCollection.findOne({
        userId: ObjectId.createFromHexString(userId)
    })
    
    // Create default settings if none exist
    if (!settings) {
        const defaultSettings = {
            userId: ObjectId.createFromHexString(userId),
            invoicePrefix: "INV",
            invoiceStartNumber: 1,
            invoiceCurrentNumber: 1,
            quotationPrefix: "QUO",
            quotationStartNumber: 1,
            quotationCurrentNumber: 1,
            defaultTaxRate: 15,
            defaultPaymentTerms: 30,
            businessName: "",
            businessAddress: "",
            businessPhone: "",
            businessEmail: "",
            createdAt: new Date(),
            updatedAt: new Date()
        }
        
        await settingsCollection.insertOne(defaultSettings)
        settings = defaultSettings
    }
    
    const year = new Date().getFullYear()
    const prefix = settings.quotationPrefix || "QUO"
    const currentNumber = settings.quotationCurrentNumber || settings.quotationStartNumber || 1
    
    // Generate the quotation number
    const quotationNumber = `${prefix}-${year}-${String(currentNumber).padStart(3, '0')}`
    
    // Check if this number already exists (shouldn't happen, but safety check)
    const existingQuotation = await quotationsCollection.findOne({
        userId: ObjectId.createFromHexString(userId),
        quotationNumber: quotationNumber
    })
    
    if (existingQuotation) {
        // If exists, increment and try again
        await settingsCollection.updateOne(
            { userId: ObjectId.createFromHexString(userId) },
            { 
                $set: { 
                    quotationCurrentNumber: currentNumber + 1,
                    updatedAt: new Date()
                }
            }
        )
        return generateQuotationNumber(userId) // Recursive call
    }
    
    // Increment the current number for next time
    await settingsCollection.updateOne(
        { userId: ObjectId.createFromHexString(userId) },
        { 
            $set: { 
                quotationCurrentNumber: currentNumber + 1,
                updatedAt: new Date()
            }
        }
    )
    
    return quotationNumber
}

// Get default settings values
async function getDefaultSettings(userId) {
    const settingsCollection = await getCollection("settings")
    const settings = await settingsCollection.findOne({
        userId: ObjectId.createFromHexString(userId)
    })
    
    return {
        defaultTaxRate: settings?.defaultTaxRate || 15,
        defaultPaymentTerms: settings?.defaultPaymentTerms || 30
    }
}

// Rest of your quotation functions remain the same, just update the create function:

// Get all quotations for the logged-in user
export async function getQuotations() {
    const user = await getUserFromCookie()
    
    if (!user) {
        redirect("/login")
    }
    
    try {
        const quotationsCollection = await getCollection("quotations")
        const quotations = await quotationsCollection
            .find({ userId: ObjectId.createFromHexString(user.userId) })
            .sort({ createdAt: -1 })
            .toArray()
        
        // Convert ObjectId to string for client-side use
        return quotations.map(quotation => ({
            ...quotation,
            _id: quotation._id.toString(),
            userId: quotation.userId.toString(),
            clientId: quotation.clientId.toString(),
        }))
    } catch (error) {
        console.error("Error fetching quotations:", error)
        return []
    }
}

// Get single quotation by ID
export async function getQuotationById(quotationId) {
    const user = await getUserFromCookie()
    
    if (!user) {
        redirect("/login")
    }
    
    try {
        const quotationsCollection = await getCollection("quotations")
        const quotation = await quotationsCollection.findOne({
            _id: ObjectId.createFromHexString(quotationId),
            userId: ObjectId.createFromHexString(user.userId)
        })
        
        if (!quotation) {
            return null
        }
        
        // Get client info
        const clientsCollection = await getCollection("clients")
        const client = await clientsCollection.findOne({
            _id: quotation.clientId
        })
        
        return {
            ...quotation,
            _id: quotation._id.toString(),
            userId: quotation.userId.toString(),
            clientId: quotation.clientId.toString(),
            client: client ? {
                ...client,
                _id: client._id.toString(),
                userId: client.userId.toString(),
            } : null
        }
    } catch (error) {
        console.error("Error fetching quotation:", error)
        return null
    }
}

// Get quotations for a specific client
export async function getQuotationsByClientId(clientId) {
    const user = await getUserFromCookie()
    
    if (!user) {
        redirect("/login")
    }
    
    try {
        const quotationsCollection = await getCollection("quotations")
        const quotations = await quotationsCollection
            .find({ 
                userId: ObjectId.createFromHexString(user.userId),
                clientId: ObjectId.createFromHexString(clientId)
            })
            .sort({ createdAt: -1 })
            .toArray()
        
        return quotations.map(quotation => ({
            ...quotation,
            _id: quotation._id.toString(),
            userId: quotation.userId.toString(),
            clientId: quotation.clientId.toString(),
        }))
    } catch (error) {
        console.error("Error fetching client quotations:", error)
        return []
    }
}

// Create new quotation
export async function createQuotation(prevState, formData) {
    const user = await getUserFromCookie()
    
    if (!user) {
        redirect("/login")
    }
    
    const errors = {}
    
    // Get basic form data
    const clientId = formData.get("clientId")
    const date = formData.get("date")
    const validUntil = formData.get("validUntil")
    const taxRate = formData.get("taxRate")
    const notes = formData.get("notes")
    
    // Get line items (they come as JSON string)
    const itemsJson = formData.get("items")
    
    // Validation
    if (!clientId || typeof clientId !== "string" || clientId.trim() === "") {
        errors.clientId = "Please select a client"
    }
    
    if (!date || typeof date !== "string") {
        errors.date = "Quotation date is required"
    }
    
    if (!validUntil || typeof validUntil !== "string") {
        errors.validUntil = "Valid until date is required"
    }
    
    // Validate dates
    if (date && validUntil) {
        const quotationDate = new Date(date)
        const expiryDate = new Date(validUntil)
        
        if (expiryDate <= quotationDate) {
            errors.validUntil = "Expiry date must be after quotation date"
        }
    }
    
    let items = []
    try {
        items = JSON.parse(itemsJson || "[]")
        
        if (!Array.isArray(items) || items.length === 0) {
            errors.items = "Please add at least one line item"
        } else {
            // Validate each item
            items.forEach((item, index) => {
                if (!item.description || item.description.trim() === "") {
                    errors[`item_${index}_description`] = "Description is required"
                }
                if (!item.quantity || item.quantity <= 0) {
                    errors[`item_${index}_quantity`] = "Quantity must be greater than 0"
                }
                if (!item.unitPrice || item.unitPrice <= 0) {
                    errors[`item_${index}_unitPrice`] = "Unit price must be greater than 0"
                }
            })
        }
    } catch (e) {
        errors.items = "Invalid line items data"
    }
    
    const parsedTaxRate = parseFloat(taxRate) || 0
    
    if (parsedTaxRate < 0 || parsedTaxRate > 100) {
        errors.taxRate = "Tax rate must be between 0 and 100"
    }
    
    if (Object.keys(errors).length > 0) {
        return {
            errors,
            success: false
        }
    }
    
    // Calculate totals
    const subtotal = items.reduce((sum, item) => {
        return sum + (item.quantity * item.unitPrice)
    }, 0)
    
    const tax = subtotal * (parsedTaxRate / 100)
    const total = subtotal + tax
    
    // Create quotation
    try {
        const quotationsCollection = await getCollection("quotations")
        const quotationNumber = await generateQuotationNumber(user.userId)
        
        const newQuotation = {
            quotationNumber,
            userId: ObjectId.createFromHexString(user.userId),
            clientId: ObjectId.createFromHexString(clientId.trim()),
            date: new Date(date),
            validUntil: new Date(validUntil),
            items: items.map(item => ({
                description: item.description.trim(),
                quantity: parseFloat(item.quantity),
                unitPrice: parseFloat(item.unitPrice),
                total: parseFloat(item.quantity) * parseFloat(item.unitPrice)
            })),
            subtotal: parseFloat(subtotal.toFixed(2)),
            taxRate: parsedTaxRate,
            tax: parseFloat(tax.toFixed(2)),
            total: parseFloat(total.toFixed(2)),
            status: "draft",
            notes: typeof notes === "string" ? notes.trim() : "",
            createdAt: new Date(),
            updatedAt: new Date()
        }
        
        await quotationsCollection.insertOne(newQuotation)
        
        redirect("/quotations")
    } catch (error) {
        console.error("Error creating quotation:", error)
        return {
            errors: { general: "Failed to create quotation. Please try again." },
            success: false
        }
    }
}

// Update quotation (same as before, no changes needed)
export async function updateQuotation(quotationId, prevState, formData) {
    const user = await getUserFromCookie()
    
    if (!user) {
        redirect("/login")
    }
    
    const errors = {}
    
    // Get basic form data
    const clientId = formData.get("clientId")
    const date = formData.get("date")
    const validUntil = formData.get("validUntil")
    const taxRate = formData.get("taxRate")
    const status = formData.get("status")
    const notes = formData.get("notes")
    
    // Get line items
    const itemsJson = formData.get("items")
    
    // Validation
    if (!clientId || typeof clientId !== "string" || clientId.trim() === "") {
        errors.clientId = "Please select a client"
    }
    
    if (!date || typeof date !== "string") {
        errors.date = "Quotation date is required"
    }
    
    if (!validUntil || typeof validUntil !== "string") {
        errors.validUntil = "Valid until date is required"
    }
    
    if (date && validUntil) {
        const quotationDate = new Date(date)
        const expiryDate = new Date(validUntil)
        
        if (expiryDate <= quotationDate) {
            errors.validUntil = "Expiry date must be after quotation date"
        }
    }
    
    let items = []
    try {
        items = JSON.parse(itemsJson || "[]")
        
        if (!Array.isArray(items) || items.length === 0) {
            errors.items = "Please add at least one line item"
        } else {
            items.forEach((item, index) => {
                if (!item.description || item.description.trim() === "") {
                    errors[`item_${index}_description`] = "Description is required"
                }
                if (!item.quantity || item.quantity <= 0) {
                    errors[`item_${index}_quantity`] = "Quantity must be greater than 0"
                }
                if (!item.unitPrice || item.unitPrice <= 0) {
                    errors[`item_${index}_unitPrice`] = "Unit price must be greater than 0"
                }
            })
        }
    } catch (e) {
        errors.items = "Invalid line items data"
    }
    
    const parsedTaxRate = parseFloat(taxRate) || 0
    
    if (parsedTaxRate < 0 || parsedTaxRate > 100) {
        errors.taxRate = "Tax rate must be between 0 and 100"
    }
    
    const validStatuses = ["draft", "sent", "accepted", "rejected", "expired"]
    if (!status || !validStatuses.includes(status)) {
        errors.status = "Invalid status"
    }
    
    if (Object.keys(errors).length > 0) {
        return {
            errors,
            success: false
        }
    }
    
    // Calculate totals
    const subtotal = items.reduce((sum, item) => {
        return sum + (item.quantity * item.unitPrice)
    }, 0)
    
    const tax = subtotal * (parsedTaxRate / 100)
    const total = subtotal + tax
    
    // Update quotation
    try {
        const quotationsCollection = await getCollection("quotations")
        
        await quotationsCollection.updateOne(
            {
                _id: ObjectId.createFromHexString(quotationId),
                userId: ObjectId.createFromHexString(user.userId)
            },
            {
                $set: {
                    clientId: ObjectId.createFromHexString(clientId.trim()),
                    date: new Date(date),
                    validUntil: new Date(validUntil),
                    items: items.map(item => ({
                        description: item.description.trim(),
                        quantity: parseFloat(item.quantity),
                        unitPrice: parseFloat(item.unitPrice),
                        total: parseFloat(item.quantity) * parseFloat(item.unitPrice)
                    })),
                    subtotal: parseFloat(subtotal.toFixed(2)),
                    taxRate: parsedTaxRate,
                    tax: parseFloat(tax.toFixed(2)),
                    total: parseFloat(total.toFixed(2)),
                    status: status,
                    notes: typeof notes === "string" ? notes.trim() : "",
                    updatedAt: new Date()
                }
            }
        )
        
        redirect("/quotations")
    } catch (error) {
        console.error("Error updating quotation:", error)
        return {
            errors: { general: "Failed to update quotation. Please try again." },
            success: false
        }
    }
}

// Delete quotation
export async function deleteQuotation(quotationId) {
    const user = await getUserFromCookie()
    
    if (!user) {
        redirect("/login")
    }
    
    try {
        // Check if quotation has been converted to an invoice
        const invoicesCollection = await getCollection("invoices")
        const hasInvoice = await invoicesCollection.findOne({
            quotationId: ObjectId.createFromHexString(quotationId)
        })
        
        if (hasInvoice) {
            return {
                success: false,
                error: "Cannot delete quotation that has been converted to an invoice"
            }
        }
        
        // Delete quotation
        const quotationsCollection = await getCollection("quotations")
        const result = await quotationsCollection.deleteOne({
            _id: ObjectId.createFromHexString(quotationId),
            userId: ObjectId.createFromHexString(user.userId)
        })
        
        if (result.deletedCount === 0) {
            return {
                success: false,
                error: "Quotation not found or already deleted"
            }
        }
        
        return {
            success: true
        }
    } catch (error) {
        console.error("Error deleting quotation:", error)
        return {
            success: false,
            error: "Failed to delete quotation. Please try again."
        }
    }
}

// Update quotation status
export async function updateQuotationStatus(quotationId, newStatus) {
    const user = await getUserFromCookie()
    
    if (!user) {
        redirect("/login")
    }
    
    const validStatuses = ["draft", "sent", "accepted", "rejected", "expired"]
    if (!validStatuses.includes(newStatus)) {
        return {
            success: false,
            error: "Invalid status"
        }
    }
    
    try {
        const quotationsCollection = await getCollection("quotations")
        
        await quotationsCollection.updateOne(
            {
                _id: ObjectId.createFromHexString(quotationId),
                userId: ObjectId.createFromHexString(user.userId)
            },
            {
                $set: {
                    status: newStatus,
                    updatedAt: new Date()
                }
            }
        )
        
        return {
            success: true
        }
    } catch (error) {
        console.error("Error updating quotation status:", error)
        return {
            success: false,
            error: "Failed to update status. Please try again."
        }
    }
}

// Helper function to generate invoice number (for conversion)
async function generateInvoiceNumberForConversion(userId) {
    const settingsCollection = await getCollection("settings")
    const invoicesCollection = await getCollection("invoices")
    
    // Get user settings
    let settings = await settingsCollection.findOne({
        userId: ObjectId.createFromHexString(userId)
    })
    
    // Create default settings if none exist
    if (!settings) {
        const defaultSettings = {
            userId: ObjectId.createFromHexString(userId),
            invoicePrefix: "INV",
            invoiceStartNumber: 1,
            invoiceCurrentNumber: 1,
            quotationPrefix: "QUO",
            quotationStartNumber: 1,
            quotationCurrentNumber: 1,
            defaultTaxRate: 15,
            defaultPaymentTerms: 30,
            businessName: "",
            businessAddress: "",
            businessPhone: "",
            businessEmail: "",
            createdAt: new Date(),
            updatedAt: new Date()
        }
        
        await settingsCollection.insertOne(defaultSettings)
        settings = defaultSettings
    }
    
    const year = new Date().getFullYear()
    const prefix = settings.invoicePrefix || "INV"
    const currentNumber = settings.invoiceCurrentNumber || settings.invoiceStartNumber || 1
    
    // Generate the invoice number
    const invoiceNumber = `${prefix}-${year}-${String(currentNumber).padStart(3, '0')}`
    
    // Check if this number already exists
    const existingInvoice = await invoicesCollection.findOne({
        userId: ObjectId.createFromHexString(userId),
        invoiceNumber: invoiceNumber
    })
    
    if (existingInvoice) {
        // If exists, increment and try again
        await settingsCollection.updateOne(
            { userId: ObjectId.createFromHexString(userId) },
            { 
                $set: { 
                    invoiceCurrentNumber: currentNumber + 1,
                    updatedAt: new Date()
                }
            }
        )
        return generateInvoiceNumberForConversion(userId)
    }
    
    // Increment the current number for next time
    await settingsCollection.updateOne(
        { userId: ObjectId.createFromHexString(userId) },
        { 
            $set: { 
                invoiceCurrentNumber: currentNumber + 1,
                updatedAt: new Date()
            }
        }
    )
    
    return invoiceNumber
}

// Convert quotation to invoice
export async function convertQuotationToInvoice(quotationId, prevState, formData) {
    const user = await getUserFromCookie()
    
    if (!user) {
        redirect("/login")
    }
    
    const errors = {}
    
    // Get form data
    const invoiceDate = formData.get("invoiceDate")
    const dueDate = formData.get("dueDate")
    const purchaseOrderNumber = formData.get("purchaseOrderNumber")
    const additionalNotes = formData.get("additionalNotes")
    
    // Validation
    if (!invoiceDate || typeof invoiceDate !== "string") {
        errors.invoiceDate = "Invoice date is required"
    }
    
    if (!dueDate || typeof dueDate !== "string") {
        errors.dueDate = "Due date is required"
    }
    
    if (invoiceDate && dueDate) {
        const invDate = new Date(invoiceDate)
        const dueDateObj = new Date(dueDate)
        
        if (dueDateObj < invDate) {
            errors.dueDate = "Due date must be on or after invoice date"
        }
    }
    
    if (Object.keys(errors).length > 0) {
        return {
            errors,
            success: false
        }
    }
    
    try {
        // Get the quotation
        const quotationsCollection = await getCollection("quotations")
        const quotation = await quotationsCollection.findOne({
            _id: ObjectId.createFromHexString(quotationId),
            userId: ObjectId.createFromHexString(user.userId)
        })
        
        if (!quotation) {
            return {
                errors: { general: "Quotation not found" },
                success: false
            }
        }
        
        // Check if quotation has already been converted
        const invoicesCollection = await getCollection("invoices")
        const existingInvoice = await invoicesCollection.findOne({
            quotationId: ObjectId.createFromHexString(quotationId)
        })
        
        if (existingInvoice) {
            return {
                errors: { general: "This quotation has already been converted to an invoice" },
                success: false
            }
        }
        
        // Generate invoice number using settings
        const invoiceNumber = await generateInvoiceNumberForConversion(user.userId)
        
        // Combine notes
        let combinedNotes = quotation.notes || ""
        const additionalNotesText = typeof additionalNotes === "string" ? additionalNotes.trim() : ""
        
        if (additionalNotesText) {
            combinedNotes = combinedNotes 
                ? `${combinedNotes}\n\n${additionalNotesText}`
                : additionalNotesText
        }
        
        // Create invoice from quotation
        const newInvoice = {
            invoiceNumber,
            userId: quotation.userId,
            clientId: quotation.clientId,
            quotationId: ObjectId.createFromHexString(quotationId),
            date: new Date(invoiceDate),
            dueDate: new Date(dueDate),
            items: quotation.items, // Copy line items
            subtotal: quotation.subtotal,
            taxRate: quotation.taxRate,
            tax: quotation.tax,
            total: quotation.total,
            amountPaid: 0,
            balance: quotation.total,
            status: "draft",
            paymentMethod: null,
            paymentDate: null,
            purchaseOrderNumber: typeof purchaseOrderNumber === "string" ? purchaseOrderNumber.trim() : null,
            notes: combinedNotes,
            createdAt: new Date(),
            updatedAt: new Date()
        }
        
        const result = await invoicesCollection.insertOne(newInvoice)
        const newInvoiceId = result.insertedId.toString()
        
        // Update quotation status to accepted (if not already)
        if (quotation.status !== "accepted") {
            await quotationsCollection.updateOne(
                {
                    _id: ObjectId.createFromHexString(quotationId),
                    userId: ObjectId.createFromHexString(user.userId)
                },
                {
                    $set: {
                        status: "accepted",
                        updatedAt: new Date()
                    }
                }
            )
        }
        
        // Redirect to the new invoice
        redirect(`/invoices/${newInvoiceId}`)
    } catch (error) {
        console.error("Error converting quotation to invoice:", error)
        return {
            errors: { general: "Failed to convert quotation. Please try again." },
            success: false
        }
    }
}