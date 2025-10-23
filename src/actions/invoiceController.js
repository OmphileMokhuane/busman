"use server"
import { getCollection } from "../lib/db"
import { getUserFromCookie } from "../lib/getUser"
import { redirect } from "next/navigation"
import { ObjectId } from "mongodb"

// Helper function to generate invoice number
async function generateInvoiceNumber(userId) {
    const invoicesCollection = await getCollection("invoices")
    const year = new Date().getFullYear()
    
    // Find the latest invoice number for this user in this year
    const latestInvoice = await invoicesCollection
        .find({ 
            userId: ObjectId.createFromHexString(userId),
            invoiceNumber: new RegExp(`^INV-${year}-`)
        })
        .sort({ createdAt: -1 })
        .limit(1)
        .toArray()
    
    let nextNumber = 1
    
    if (latestInvoice.length > 0) {
        const lastNumber = latestInvoice[0].invoiceNumber
        const match = lastNumber.match(/INV-\d{4}-(\d+)/)
        if (match) {
            nextNumber = parseInt(match[1]) + 1
        }
    }
    
    return `INV-${year}-${String(nextNumber).padStart(3, '0')}`
}

// Get all invoices for the logged-in user
export async function getInvoices() {
    const user = await getUserFromCookie()
    
    if (!user) {
        redirect("/login")
    }
    
    try {
        const invoicesCollection = await getCollection("invoices")
        const invoices = await invoicesCollection
            .find({ userId: ObjectId.createFromHexString(user.userId) })
            .sort({ createdAt: -1 })
            .toArray()
        
        // Convert ObjectId to string for client-side use
        return invoices.map(invoice => ({
            ...invoice,
            _id: invoice._id.toString(),
            userId: invoice.userId.toString(),
            clientId: invoice.clientId.toString(),
            quotationId: invoice.quotationId ? invoice.quotationId.toString() : null,
        }))
    } catch (error) {
        console.error("Error fetching invoices:", error)
        return []
    }
}

// Get single invoice by ID
export async function getInvoiceById(invoiceId) {
    const user = await getUserFromCookie()
    
    if (!user) {
        redirect("/login")
    }
    
    try {
        const invoicesCollection = await getCollection("invoices")
        const invoice = await invoicesCollection.findOne({
            _id: ObjectId.createFromHexString(invoiceId),
            userId: ObjectId.createFromHexString(user.userId)
        })
        
        if (!invoice) {
            return null
        }
        
        // Get client info
        const clientsCollection = await getCollection("clients")
        const client = await clientsCollection.findOne({
            _id: invoice.clientId
        })
        
        return {
            ...invoice,
            _id: invoice._id.toString(),
            userId: invoice.userId.toString(),
            clientId: invoice.clientId.toString(),
            quotationId: invoice.quotationId ? invoice.quotationId.toString() : null,
            client: client ? {
                ...client,
                _id: client._id.toString(),
                userId: client.userId.toString(),
            } : null
        }
    } catch (error) {
        console.error("Error fetching invoice:", error)
        return null
    }
}

// Get invoices for a specific client
export async function getInvoicesByClientId(clientId) {
    const user = await getUserFromCookie()
    
    if (!user) {
        redirect("/login")
    }
    
    try {
        const invoicesCollection = await getCollection("invoices")
        const invoices = await invoicesCollection
            .find({ 
                userId: ObjectId.createFromHexString(user.userId),
                clientId: ObjectId.createFromHexString(clientId)
            })
            .sort({ createdAt: -1 })
            .toArray()
        
        return invoices.map(invoice => ({
            ...invoice,
            _id: invoice._id.toString(),
            userId: invoice.userId.toString(),
            clientId: invoice.clientId.toString(),
            quotationId: invoice.quotationId ? invoice.quotationId.toString() : null,
        }))
    } catch (error) {
        console.error("Error fetching client invoices:", error)
        return []
    }
}

// Create new invoice
export async function createInvoice(prevState, formData) {
    const user = await getUserFromCookie()
    
    if (!user) {
        redirect("/login")
    }
    
    const errors = {}
    
    // Get basic form data
    const clientId = formData.get("clientId")
    const date = formData.get("date")
    const dueDate = formData.get("dueDate")
    const taxRate = formData.get("taxRate")
    const notes = formData.get("notes")
    const purchaseOrderNumber = formData.get("purchaseOrderNumber")
    
    // Get line items (they come as JSON string)
    const itemsJson = formData.get("items")
    
    // Validation
    if (!clientId || typeof clientId !== "string" || clientId.trim() === "") {
        errors.clientId = "Please select a client"
    }
    
    if (!date || typeof date !== "string") {
        errors.date = "Invoice date is required"
    }
    
    if (!dueDate || typeof dueDate !== "string") {
        errors.dueDate = "Due date is required"
    }
    
    // Validate dates
    if (date && dueDate) {
        const invoiceDate = new Date(date)
        const dueDateObj = new Date(dueDate)
        
        if (dueDateObj < invoiceDate) {
            errors.dueDate = "Due date must be on or after invoice date"
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
    
    // Create invoice
    try {
        const invoicesCollection = await getCollection("invoices")
        const invoiceNumber = await generateInvoiceNumber(user.userId)
        
        const newInvoice = {
            invoiceNumber,
            userId: ObjectId.createFromHexString(user.userId),
            clientId: ObjectId.createFromHexString(clientId.trim()),
            quotationId: null, // Will be set when converting from quotation
            date: new Date(date),
            dueDate: new Date(dueDate),
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
            amountPaid: 0,
            balance: parseFloat(total.toFixed(2)),
            status: "draft",
            paymentMethod: null,
            paymentDate: null,
            purchaseOrderNumber: typeof purchaseOrderNumber === "string" ? purchaseOrderNumber.trim() : null,
            notes: typeof notes === "string" ? notes.trim() : "",
            createdAt: new Date(),
            updatedAt: new Date()
        }
        
        await invoicesCollection.insertOne(newInvoice)
        
        
    } catch (error) {
        console.error("Error creating invoice:", error)
        return {
            errors: { general: "Failed to create invoice. Please try again." },
            success: false
        }
    }

    return redirect("/invoices")
}

// Update invoice
export async function updateInvoice(invoiceId, prevState, formData) {
    const user = await getUserFromCookie()
    
    if (!user) {
        redirect("/login")
    }
    
    const errors = {}
    
    // Get basic form data
    const clientId = formData.get("clientId")
    const date = formData.get("date")
    const dueDate = formData.get("dueDate")
    const taxRate = formData.get("taxRate")
    const status = formData.get("status")
    const notes = formData.get("notes")
    const purchaseOrderNumber = formData.get("purchaseOrderNumber")
    
    // Get line items
    const itemsJson = formData.get("items")
    
    // Validation
    if (!clientId || typeof clientId !== "string" || clientId.trim() === "") {
        errors.clientId = "Please select a client"
    }
    
    if (!date || typeof date !== "string") {
        errors.date = "Invoice date is required"
    }
    
    if (!dueDate || typeof dueDate !== "string") {
        errors.dueDate = "Due date is required"
    }
    
    if (date && dueDate) {
        const invoiceDate = new Date(date)
        const dueDateObj = new Date(dueDate)
        
        if (dueDateObj < invoiceDate) {
            errors.dueDate = "Due date must be on or after invoice date"
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
    
    const validStatuses = ["draft", "sent", "paid", "partial", "overdue", "cancelled"]
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
    
    // Get current invoice to preserve payment info
    const invoicesCollection = await getCollection("invoices")
    const currentInvoice = await invoicesCollection.findOne({
        _id: ObjectId.createFromHexString(invoiceId),
        userId: ObjectId.createFromHexString(user.userId)
    })
    
    if (!currentInvoice) {
        return {
            errors: { general: "Invoice not found" },
            success: false
        }
    }
    
    const amountPaid = currentInvoice.amountPaid || 0
    const balance = total - amountPaid
    
    // Update invoice
    try {
        await invoicesCollection.updateOne(
            {
                _id: ObjectId.createFromHexString(invoiceId),
                userId: ObjectId.createFromHexString(user.userId)
            },
            {
                $set: {
                    clientId: ObjectId.createFromHexString(clientId.trim()),
                    date: new Date(date),
                    dueDate: new Date(dueDate),
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
                    balance: parseFloat(balance.toFixed(2)),
                    status: status,
                    purchaseOrderNumber: typeof purchaseOrderNumber === "string" ? purchaseOrderNumber.trim() : null,
                    notes: typeof notes === "string" ? notes.trim() : "",
                    updatedAt: new Date()
                }
            }
        )
        
        
    } catch (error) {
        console.error("Error updating invoice:", error)
        return {
            errors: { general: "Failed to update invoice. Please try again." },
            success: false
        }
    }

    return redirect("/invoices")
}

// Delete invoice
export async function deleteInvoice(invoiceId) {
    const user = await getUserFromCookie()
    
    if (!user) {
        redirect("/login")
    }
    
    try {
        // Delete invoice
        const invoicesCollection = await getCollection("invoices")
        const result = await invoicesCollection.deleteOne({
            _id: ObjectId.createFromHexString(invoiceId),
            userId: ObjectId.createFromHexString(user.userId)
        })
        
        if (result.deletedCount === 0) {
            return {
                success: false,
                error: "Invoice not found or already deleted"
            }
        }
        
        return {
            success: true
        }
    } catch (error) {
        console.error("Error deleting invoice:", error)
        return {
            success: false,
            error: "Failed to delete invoice. Please try again."
        }
    }
}

// Update invoice status
export async function updateInvoiceStatus(invoiceId, newStatus) {
    const user = await getUserFromCookie()
    
    if (!user) {
        redirect("/login")
    }
    
    const validStatuses = ["draft", "sent", "paid", "partial", "overdue", "cancelled"]
    if (!validStatuses.includes(newStatus)) {
        return {
            success: false,
            error: "Invalid status"
        }
    }
    
    try {
        const invoicesCollection = await getCollection("invoices")
        
        await invoicesCollection.updateOne(
            {
                _id: ObjectId.createFromHexString(invoiceId),
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
        console.error("Error updating invoice status:", error)
        return {
            success: false,
            error: "Failed to update status. Please try again."
        }
    }
}

// Record payment
export async function recordPayment(invoiceId, prevState, formData) {
    const user = await getUserFromCookie()
    
    if (!user) {
        redirect("/login")
    }
    
    const errors = {}
    
    const amount = formData.get("amount")
    const paymentMethod = formData.get("paymentMethod")
    const paymentDate = formData.get("paymentDate")
    
    const parsedAmount = parseFloat(amount)
    
    if (!amount || isNaN(parsedAmount) || parsedAmount <= 0) {
        errors.amount = "Please enter a valid payment amount"
    }
    
    if (!paymentMethod || typeof paymentMethod !== "string" || paymentMethod.trim() === "") {
        errors.paymentMethod = "Please select a payment method"
    }
    
    if (!paymentDate || typeof paymentDate !== "string") {
        errors.paymentDate = "Payment date is required"
    }
    
    if (Object.keys(errors).length > 0) {
        return {
            errors,
            success: false
        }
    }
    
    try {
        const invoicesCollection = await getCollection("invoices")
        const invoice = await invoicesCollection.findOne({
            _id: ObjectId.createFromHexString(invoiceId),
            userId: ObjectId.createFromHexString(user.userId)
        })
        
        if (!invoice) {
            return {
                errors: { general: "Invoice not found" },
                success: false
            }
        }
        
        const newAmountPaid = (invoice.amountPaid || 0) + parsedAmount
        const newBalance = invoice.total - newAmountPaid
        
        if (newAmountPaid > invoice.total) {
            return {
                errors: { amount: "Payment amount exceeds invoice total" },
                success: false
            }
        }
        
        // Determine new status
        let newStatus = "partial"
        if (newBalance === 0) {
            newStatus = "paid"
        } else if (newBalance > 0) {
            newStatus = "partial"
        }
        
        await invoicesCollection.updateOne(
            {
                _id: ObjectId.createFromHexString(invoiceId),
                userId: ObjectId.createFromHexString(user.userId)
            },
            {
                $set: {
                    amountPaid: parseFloat(newAmountPaid.toFixed(2)),
                    balance: parseFloat(newBalance.toFixed(2)),
                    status: newStatus,
                    paymentMethod: paymentMethod.trim(),
                    paymentDate: new Date(paymentDate),
                    updatedAt: new Date()
                }
            }
        )
        
        // Redirect to invoice detail page after successful payment
        
    } catch (error) {
        console.error("Error recording payment:", error)
        return {
            errors: { general: "Failed to record payment. Please try again." },
            success: false
        }
    }

    return redirect(`/invoices/${invoiceId}`)
}