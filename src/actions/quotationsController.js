"use server"

import { redirect } from "next/navigation"
import { getUserFromCookie } from "../lib/getUser"
import { getCollection } from "../lib/db"
import { ObjectId } from "mongodb"

// Helper function to generate quotation number
async function generateQuotationsNumber(userId) {
    const quotationsCollection = await getCollection("quotations")
    const year = new Date().getFullYear()
    
    // Find the latest quotation number for this user in this year
    const latestQuotation = await quotationsCollection
        .find({ 
            userId: ObjectId.createFromHexString(userId),
            quotationNumber: new RegExp(`^QUO-${year}-`)
        })
        .sort({ createdAt: -1 })
        .limit(1)
        .toArray()
    
    let nextNumber = 1
    
    if (latestQuotation.length > 0) {
        const lastNumber = latestQuotation[0].quotationNumber
        const match = lastNumber.match(/QUO-\d{4}-(\d+)/)
        if (match) {
            nextNumber = parseInt(match[1]) + 1
        }
    }
    
    return `QUO-${year}-${String(nextNumber).padStart(3, '0')}`
}

// Get all quotations for the logged-in user
export async function getQuotations() {
    const user = await getUserFromCookie()

    if(!user) {
        return redirect("/login")
    }

    try {
        const quotationsCollection = await getCollection("quotations")
        const quotations = await quotationsCollection.find({
            userId: ObjectId.createFromHexString(user.userId)
        }).sort({
            createdAt: -1
        }).toArray()

        // Convert ObjectId to string for client-side use
        return quotations.map(quotation => ({
            ...quotation,
            _id: quotation._id.toString(),
            userId: quotation.userId.toString(),
            clientId: quotation.clientId.toString()
        }))
    } catch (error) {
        console.error("Error fetching quotations: ", error)
        return []
    }
}

export async function getQuotationById(quotationId) {
    const user = await getUserFromCookie()

    if (!user) {
        return redirect("/login")
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
            _id:quotation.clientId
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
        console.error("Error fetching quotation: ", error)
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
        return redirect("/login")
    }

    const errors = {}

    // Get basic form data

    const clientId = formData.get("clientId")
    const date = formData.get("date")
    const validUntil = formData.get("validUntil")
    const taxRate = formData.get("taxRate")
    const notes = formData.get("notes")

    // Get line items
    const itemsJson = formData.get("items")

    // Validation
    if(!clientId || typeof clientId !== "string" || clientId.trim() === "") {
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

        if (expiryDate < quotationDate ) {
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
                if(!item.description || item.description.trim() === "") errors[`item_${index}_description`] = "Description is required"
                if(!item.quantity || item.quantity <= 0) errors[`item_${index}_quantity`] = "Quantity must be greater than 0"
                if(!item.unitPrice || item.unitPrice <= 0) errors[`item_${index}_unitPrice`] = "UnitPrice must be greater than 0"
            })
        }
    } catch (error) {
        errors.items = "Invalid line items data"
    }

    const parsedTaxRate = parseFloat(taxRate) || 0

    if(parsedTaxRate < 0 || parsedTaxRate > 100) {
        errors.taxRate = "Tax Rate must be between 0 and 100"
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
        const quotationNumber = await generateQuotationsNumber(user.userId)

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
    } catch (error) {
        console.error("Error creating quotation: ", error)
        return {
            error: { general: "Failded to create quotation. Please try again."},
            success: false
        }
    }

    return redirect("/quotations")
}

// Update quotation
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
        
        
    } catch (error) {
        console.error("Error updating quotation:", error)
        return {
            errors: { general: "Failed to update quotation. Please try again." },
            success: false
        }
    }

    return redirect("/quotations")
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