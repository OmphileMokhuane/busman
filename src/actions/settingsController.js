"use server"
import { getCollection } from "../lib/db"
import { getUserFromCookie } from "../lib/getUser"
import { redirect } from "next/navigation"
import { ObjectId } from "mongodb"

// Get user settings (create default if doesn't exist)
export async function getSettings() {
    const user = await getUserFromCookie()
    
    if (!user) {
        redirect("/login")
    }
    
    try {
        const settingsCollection = await getCollection("settings")
        let settings = await settingsCollection.findOne({
            userId: ObjectId.createFromHexString(user.userId)
        })
        
        // Create default settings if none exist
        if (!settings) {
            const defaultSettings = {
                userId: ObjectId.createFromHexString(user.userId),
                businessName: "",
                businessAddress: "",
                businessPhone: "",
                businessEmail: "",
                invoicePrefix: "INV",
                invoiceStartNumber: 1,
                invoiceCurrentNumber: 1,
                quotationPrefix: "QUO",
                quotationStartNumber: 1,
                quotationCurrentNumber: 1,
                defaultTaxRate: 15,
                defaultPaymentTerms: 30,
                createdAt: new Date(),
                updatedAt: new Date()
            }
            
            await settingsCollection.insertOne(defaultSettings)
            settings = defaultSettings
        }
        
        return {
            ...settings,
            _id: settings._id.toString(),
            userId: settings.userId.toString(),
        }
    } catch (error) {
        console.error("Error fetching settings:", error)
        // Return defaults if error
        return {
            businessName: "",
            businessAddress: "",
            businessPhone: "",
            businessEmail: "",
            invoicePrefix: "INV",
            invoiceStartNumber: 1,
            invoiceCurrentNumber: 1,
            quotationPrefix: "QUO",
            quotationStartNumber: 1,
            quotationCurrentNumber: 1,
            defaultTaxRate: 15,
            defaultPaymentTerms: 30,
        }
    }
}

// Update settings
export async function updateSettings(prevState, formData) {
    const user = await getUserFromCookie()
    
    if (!user) {
        redirect("/login")
    }
    
    const errors = {}
    
    // Get form data
    const businessName = formData.get("businessName")
    const businessAddress = formData.get("businessAddress")
    const businessPhone = formData.get("businessPhone")
    const businessEmail = formData.get("businessEmail")
    const invoicePrefix = formData.get("invoicePrefix")
    const invoiceStartNumber = formData.get("invoiceStartNumber")
    const quotationPrefix = formData.get("quotationPrefix")
    const quotationStartNumber = formData.get("quotationStartNumber")
    const defaultTaxRate = formData.get("defaultTaxRate")
    const defaultPaymentTerms = formData.get("defaultPaymentTerms")
    
    // Ensure all values are strings, not objects
    const settingsData = {
        businessName: (typeof businessName === "string" ? businessName : "").trim(),
        businessAddress: (typeof businessAddress === "string" ? businessAddress : "").trim(),
        businessPhone: (typeof businessPhone === "string" ? businessPhone : "").trim(),
        businessEmail: (typeof businessEmail === "string" ? businessEmail : "").trim(),
        invoicePrefix: (typeof invoicePrefix === "string" ? invoicePrefix : "INV").trim(),
        invoiceStartNumber: parseInt(invoiceStartNumber) || 1,
        quotationPrefix: (typeof quotationPrefix === "string" ? quotationPrefix : "QUO").trim(),
        quotationStartNumber: parseInt(quotationStartNumber) || 1,
        defaultTaxRate: parseFloat(defaultTaxRate) || 15,
        defaultPaymentTerms: parseInt(defaultPaymentTerms) || 30,
    }
    
    // Validation
    if (settingsData.invoicePrefix.length < 2 || settingsData.invoicePrefix.length > 10) {
        errors.invoicePrefix = "Invoice prefix must be between 2 and 10 characters"
    }
    
    if (settingsData.invoiceStartNumber < 1 || settingsData.invoiceStartNumber > 999999) {
        errors.invoiceStartNumber = "Invoice start number must be between 1 and 999999"
    }
    
    if (settingsData.quotationPrefix.length < 2 || settingsData.quotationPrefix.length > 10) {
        errors.quotationPrefix = "Quotation prefix must be between 2 and 10 characters"
    }
    
    if (settingsData.quotationStartNumber < 1 || settingsData.quotationStartNumber > 999999) {
        errors.quotationStartNumber = "Quotation start number must be between 1 and 999999"
    }
    
    if (settingsData.defaultTaxRate < 0 || settingsData.defaultTaxRate > 100) {
        errors.defaultTaxRate = "Tax rate must be between 0 and 100"
    }
    
    if (settingsData.defaultPaymentTerms < 1 || settingsData.defaultPaymentTerms > 365) {
        errors.defaultPaymentTerms = "Payment terms must be between 1 and 365 days"
    }
    
    if (settingsData.businessEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(settingsData.businessEmail)) {
        errors.businessEmail = "Please enter a valid email address"
    }
    
    if (Object.keys(errors).length > 0) {
        return {
            errors,
            success: false
        }
    }
    
    // Update settings
    try {
        const settingsCollection = await getCollection("settings")
        
        // Get current settings to preserve current numbers
        const currentSettings = await settingsCollection.findOne({
            userId: ObjectId.createFromHexString(user.userId)
        })
        
        const updateData = {
            ...settingsData,
            // Only update current numbers if they don't exist or if start number changed
            invoiceCurrentNumber: currentSettings?.invoiceCurrentNumber || settingsData.invoiceStartNumber,
            quotationCurrentNumber: currentSettings?.quotationCurrentNumber || settingsData.quotationStartNumber,
            updatedAt: new Date()
        }
        
        await settingsCollection.updateOne(
            { userId: ObjectId.createFromHexString(user.userId) },
            { $set: updateData },
            { upsert: true }
        )
        
        return {
            success: true,
            message: "Settings updated successfully"
        }
    } catch (error) {
        console.error("Error updating settings:", error)
        return {
            errors: { general: "Failed to update settings. Please try again." },
            success: false
        }
    }
}

// Reset numbering (use with caution)
export async function resetNumbering(type) {
    const user = await getUserFromCookie()
    
    if (!user) {
        redirect("/login")
    }
    
    try {
        const settingsCollection = await getCollection("settings")
        const settings = await settingsCollection.findOne({
            userId: ObjectId.createFromHexString(user.userId)
        })
        
        if (!settings) {
            return {
                success: false,
                error: "Settings not found"
            }
        }
        
        const updateField = type === "invoice" 
            ? { invoiceCurrentNumber: settings.invoiceStartNumber }
            : { quotationCurrentNumber: settings.quotationStartNumber }
        
        await settingsCollection.updateOne(
            { userId: ObjectId.createFromHexString(user.userId) },
            { 
                $set: {
                    ...updateField,
                    updatedAt: new Date()
                }
            }
        )
        
        return {
            success: true
        }
    } catch (error) {
        console.error("Error resetting numbering:", error)
        return {
            success: false,
            error: "Failed to reset numbering"
        }
    }
}