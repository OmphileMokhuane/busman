"use server"
import { getCollection } from "../lib/db"
import { getUserFromCookie } from "../lib/getUser"
import { redirect } from "next/navigation"
import { ObjectId } from "mongodb"

// Get all clients for the logged-in user
export async function getClients() {
    const user = await getUserFromCookie()
    
    if (!user) {
        redirect("/login")
    }
    
    try {
        const clientsCollection = await getCollection("clients")
        const clients = await clientsCollection
            .find({ userId: ObjectId.createFromHexString(user.userId) })
            .sort({ createdAt: -1 })
            .toArray()
        
        // Convert ObjectId to string for client-side use
        return clients.map(client => ({
            ...client,
            _id: client._id.toString(),
            userId: client.userId.toString(),
        }))
    } catch (error) {
        console.error("Error fetching clients:", error)
        return []
    }
}

// Get single client by ID
export async function getClientById(clientId) {
    const user = await getUserFromCookie()
    
    if (!user) {
        redirect("/login")
    }
    
    try {
        const clientsCollection = await getCollection("clients")
        const client = await clientsCollection.findOne({
            _id: ObjectId.createFromHexString(clientId),
            userId: ObjectId.createFromHexString(user.userId)
        })
        
        if (!client) {
            return null
        }
        
        return {
            ...client,
            _id: client._id.toString(),
            userId: client.userId.toString(),
        }
    } catch (error) {
        console.error("Error fetching client:", error)
        return null
    }
}

// Create new client
export async function createClient(prevState, formData) {
    const user = await getUserFromCookie()
    
    if (!user) {
        redirect("/login")
    }
    
    const errors = {}
    
    // Get form data with proper type checking
    const name = formData.get("name")
    const companyName = formData.get("companyName")
    const email = formData.get("email")
    const phoneNumber = formData.get("phoneNumber")
    const companyAddress = formData.get("companyAddress")
    
    // Ensure all values are strings, not objects
    const clientData = {
        name: (typeof name === "string" ? name : "").trim(),
        companyName: (typeof companyName === "string" ? companyName : "").trim(),
        email: (typeof email === "string" ? email : "").trim(),
        phoneNumber: (typeof phoneNumber === "string" ? phoneNumber : "").trim(),
        companyAddress: (typeof companyAddress === "string" ? companyAddress : "").trim(),
    }
    
    // Validation
    if (!clientData.name || clientData.name.length < 2) {
        errors.name = "Name must be at least 2 characters long"
    }
    
    if (!clientData.email) {
        errors.email = "Email is required"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clientData.email)) {
        errors.email = "Please enter a valid email address"
    }
    
    // If company name is provided, address is required
    if (clientData.companyName && !clientData.companyAddress) {
        errors.companyAddress = "Company address is required when company name is provided"
    }
    
    // Validate phone number format if provided
    if (clientData.phoneNumber) {
        // Remove spaces and check if it's a valid format (basic check)
        const phoneDigits = clientData.phoneNumber.replace(/\s+/g, '')
        if (phoneDigits.length < 10) {
            errors.phoneNumber = "Please enter a valid phone number"
        }
    }
    
    // Check for duplicate email for this user
    try {
        const clientsCollection = await getCollection("clients")
        const existingClient = await clientsCollection.findOne({
            userId: ObjectId.createFromHexString(user.userId),
            email: clientData.email
        })
        
        if (existingClient) {
            errors.email = "A client with this email already exists"
        }
    } catch (error) {
        console.error("Error checking for existing client:", error)
        errors.general = "An error occurred. Please try again."
    }
    
    if (Object.keys(errors).length > 0) {
        return {
            errors,
            success: false
        }
    }
    
    // Create client
    try {
        const clientsCollection = await getCollection("clients")
        const newClient = {
            name: clientData.name,
            companyName: clientData.companyName || null,
            email: clientData.email,
            phoneNumber: clientData.phoneNumber || null,
            companyAddress: clientData.companyAddress || null,
            userId: ObjectId.createFromHexString(user.userId),
            createdAt: new Date(),
            updatedAt: new Date()
        }
        
        await clientsCollection.insertOne(newClient)
    } catch (error) {
        console.error("Error creating client:", error)
        return {
            errors: { general: "Failed to create client. Please try again." },
            success: false
        }
    }

    return redirect("/clients")
}

// Update client
export async function updateClient(clientId, prevState, formData) {
    const user = await getUserFromCookie()
    
    if (!user) {
        redirect("/login")
    }
    
    const errors = {}
    
    // Get form data with proper type checking
    const name = formData.get("name")
    const companyName = formData.get("companyName")
    const email = formData.get("email")
    const phoneNumber = formData.get("phoneNumber")
    const companyAddress = formData.get("companyAddress")
    
    // Ensure all values are strings, not objects
    const clientData = {
        name: (typeof name === "string" ? name : "").trim(),
        companyName: (typeof companyName === "string" ? companyName : "").trim(),
        email: (typeof email === "string" ? email : "").trim(),
        phoneNumber: (typeof phoneNumber === "string" ? phoneNumber : "").trim(),
        companyAddress: (typeof companyAddress === "string" ? companyAddress : "").trim(),
    }
    
    // Validation (same as create)
    if (!clientData.name || clientData.name.length < 2) {
        errors.name = "Name must be at least 2 characters long"
    }
    
    if (!clientData.email) {
        errors.email = "Email is required"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clientData.email)) {
        errors.email = "Please enter a valid email address"
    }
    
    if (clientData.companyName && !clientData.companyAddress) {
        errors.companyAddress = "Company address is required when company name is provided"
    }
    
    if (clientData.phoneNumber) {
        const phoneDigits = clientData.phoneNumber.replace(/\s+/g, '')
        if (phoneDigits.length < 10) {
            errors.phoneNumber = "Please enter a valid phone number"
        }
    }
    
    // Check for duplicate email (excluding current client)
    try {
        const clientsCollection = await getCollection("clients")
        const existingClient = await clientsCollection.findOne({
            userId: ObjectId.createFromHexString(user.userId),
            email: clientData.email,
            _id: { $ne: ObjectId.createFromHexString(clientId) }
        })
        
        if (existingClient) {
            errors.email = "A client with this email already exists"
        }
    } catch (error) {
        console.error("Error checking for existing client:", error)
        errors.general = "An error occurred. Please try again."
    }
    
    if (Object.keys(errors).length > 0) {
        return {
            errors,
            success: false
        }
    }
    
    // Update client
    try {
        const clientsCollection = await getCollection("clients")
        await clientsCollection.updateOne(
            {
                _id: ObjectId.createFromHexString(clientId),
                userId: ObjectId.createFromHexString(user.userId)
            },
            {
                $set: {
                    name: clientData.name,
                    companyName: clientData.companyName || null,
                    email: clientData.email,
                    phoneNumber: clientData.phoneNumber || null,
                    companyAddress: clientData.companyAddress || null,
                    updatedAt: new Date()
                }
            }
        )
    } catch (error) {
        console.error("Error updating client:", error)
        return {
            errors: { general: "Failed to update client. Please try again." },
            success: false
        }
    }

    return redirect("/clients")
}

// Delete client
export async function deleteClient(clientId) {
    const user = await getUserFromCookie()
    
    if (!user) {
        redirect("/login")
    }
    
    try {
        // Check if client has any quotations, invoices, or pumps
        const quotationsCollection = await getCollection("quotations")
        const invoicesCollection = await getCollection("invoices")
        const pumpsCollection = await getCollection("pumps")
        
        const hasQuotations = await quotationsCollection.findOne({
            clientId: ObjectId.createFromHexString(clientId)
        })
        
        const hasInvoices = await invoicesCollection.findOne({
            clientId: ObjectId.createFromHexString(clientId)
        })
        
        const hasPumps = await pumpsCollection.findOne({
            clientId: ObjectId.createFromHexString(clientId)
        })
        
        if (hasQuotations || hasInvoices || hasPumps) {
            return {
                success: false,
                error: "Cannot delete client with existing quotations, invoices, or pumps"
            }
        }
        
        // Delete client
        const clientsCollection = await getCollection("clients")
        const result = await clientsCollection.deleteOne({
            _id: ObjectId.createFromHexString(clientId),
            userId: ObjectId.createFromHexString(user.userId)
        })
        
        if (result.deletedCount === 0) {
            return {
                success: false,
                error: "Client not found or already deleted"
            }
        }
        
        return {
            success: true
        }
    } catch (error) {
        console.error("Error deleting client:", error)
        return {
            success: false,
            error: "Failed to delete client. Please try again."
        }
    }
}