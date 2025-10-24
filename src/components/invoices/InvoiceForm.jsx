"use client"
import { useActionState, useState } from "react"
import { createInvoice, updateInvoice } from "@/actions/invoiceController"
import { useSearchParams } from "next/navigation"
import ClientSelector from "../quotations/ClientSelector"
import LineItemEditor from "../quotations/LineItemEditor"
import Link from "next/link"
import { useEffect } from "react"

export default function InvoiceForm({ clients, invoice = null, defaultTaxRate = 15 }) {
    const searchParams = useSearchParams()
    const preSelectedClientId = searchParams.get("clientId")
    const isEditing = !!invoice
    
    // Choose the correct action based on mode
    const action = isEditing 
        ? updateInvoice.bind(null, invoice._id)
        : createInvoice
    
    const [formState, formAction] = useActionState(action, {})
    
    const [selectedClientId, setSelectedClientId] = useState(
        invoice?.clientId || preSelectedClientId || ""
    )
    const [items, setItems] = useState(
        invoice?.items || [{ description: "", quantity: 1, unitPrice: 0 }]
    )
    const [taxRate, setTaxRate] = useState(invoice?.taxRate || defaultTaxRate)
    

    // Calculate totals
    const subtotal = items.reduce((sum, item) => {
        return sum + ((parseFloat(item.quantity) || 0) * (parseFloat(item.unitPrice) || 0))
    }, 0)

    const tax = subtotal * (taxRate / 100)
    const total = subtotal + tax

    // Get today's date for min date validation
    const today = new Date().toISOString().split('T')[0]
    
    // Default dates
    const [invoiceDate, setInvoiceDate] = useState(
        invoice?.date ? new Date(invoice.date).toISOString().split('T')[0] : today
    )
    const [dueDate, setDueDate] = useState(() => {
        if (invoice?.dueDate) {
            return new Date(invoice.dueDate).toISOString().split('T')[0]
        }
        const date = new Date()
        date.setDate(date.getDate() + 30) // Default 30 days payment terms
        return date.toISOString().split('T')[0]
    })

    const [status, setStatus] = useState(invoice?.status || "draft")
    const [notes, setNotes] = useState(invoice?.notes || "")
    const [purchaseOrderNumber, setPurchaseOrderNumber] = useState(invoice?.purchaseOrderNumber || "")

    const handleSubmit = (formData) => {
        // Add items as JSON string to formData
        formData.set("items", JSON.stringify(items))
        formAction(formData)
    }

    return (
        <form action={handleSubmit} className="space-y-6">
            {/* General Error */}
            {formState.errors?.general && (
                <div role="alert" className="alert alert-error rounded-xl">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 shrink-0 stroke-current" fill="none" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{formState.errors.general}</span>
                </div>
            )}

            {/* Client Selection */}
            <div className="bg-base-300 p-6 rounded-xl">
                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4">
                    Client Information
                </h3>
                <ClientSelector
                    clients={clients}
                    selectedClientId={selectedClientId}
                    onChange={setSelectedClientId}
                    error={formState.errors?.clientId}
                />
                <input type="hidden" name="clientId" value={selectedClientId} />
            </div>

            {/* Invoice Details */}
            <div className="bg-base-300 p-6 rounded-xl">
                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4">
                    Invoice Details
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    {/* Invoice Date */}
                    <div className="form-control">
                        <label htmlFor="date" className="label mb-1">
                            <span className="label-text font-medium">
                                Invoice Date <span className="text-error">*</span>
                            </span>
                        </label>
                        <input
                            type="date"
                            id="date"
                            name="date"
                            value={invoiceDate}
                            onChange={(e) => setInvoiceDate(e.target.value)}
                            className="input input-bordered w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                        {formState.errors?.date && (
                            <div role="alert" className="alert alert-warning mt-2 flex items-center gap-2 rounded-xl">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 shrink-0 stroke-current" fill="none" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                                <span>{formState.errors.date}</span>
                            </div>
                        )}
                    </div>

                    {/* Due Date */}
                    <div className="form-control">
                        <label htmlFor="dueDate" className="label mb-1">
                            <span className="label-text font-medium">
                                Due Date <span className="text-error">*</span>
                            </span>
                        </label>
                        <input
                            type="date"
                            id="dueDate"
                            name="dueDate"
                            value={dueDate}
                            onChange={(e) => setDueDate(e.target.value)}
                            min={invoiceDate}
                            className="input input-bordered w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                        {formState.errors?.dueDate && (
                            <div role="alert" className="alert alert-warning mt-2 flex items-center gap-2 rounded-xl">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 shrink-0 stroke-current" fill="none" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                                <span>{formState.errors.dueDate}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Purchase Order Number */}
                <div className="form-control mb-4">
                    <label htmlFor="purchaseOrderNumber" className="label mb-1">
                        <span className="label-text font-medium">Purchase Order Number</span>
                        <span className="label-text-alt text-gray-500">Optional</span>
                    </label>
                    <input
                        type="text"
                        id="purchaseOrderNumber"
                        name="purchaseOrderNumber"
                        value={purchaseOrderNumber}
                        onChange={(e) => setPurchaseOrderNumber(e.target.value)}
                        placeholder="e.g., PO-2025-001"
                        className="input input-bordered w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <label className="label">
                        <span className="label-text-alt text-gray-500">
                            Client's purchase order reference number
                        </span>
                    </label>
                </div>

                {/* Status - Only show in edit mode */}
                {isEditing && (
                    <div className="form-control">
                        <label htmlFor="status" className="label">
                            <span className="label-text font-medium">Status</span>
                        </label>
                        <select
                            id="status"
                            name="status"
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            className="select select-bordered w-full md:w-64 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                            <option value="draft">Draft</option>
                            <option value="sent">Sent</option>
                            <option value="paid">Paid</option>
                            <option value="partial">Partial</option>
                            <option value="overdue">Overdue</option>
                            <option value="cancelled">Cancelled</option>
                        </select>
                    </div>
                )}
            </div>

            {/* Line Items */}
            <div className="bg-base-300 p-6 rounded-xl">
                <LineItemEditor items={items} setItems={setItems} />
                {formState.errors?.items && (
                    <div role="alert" className="alert alert-warning mt-4 flex items-center gap-2 rounded-xl">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 shrink-0 stroke-current" fill="none" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <span>{formState.errors.items}</span>
                    </div>
                )}
            </div>

            {/* Calculations */}
            <div className="bg-base-300 p-6 rounded-xl">
                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4">
                    Calculations
                </h3>
                
                {/* Tax Rate */}
                <div className="form-control mb-4">
                    <label htmlFor="taxRate" className="label mb-1">
                        <span className="label-text font-medium">Tax Rate (%)</span>
                    </label>
                    <input
                        type="number"
                        id="taxRate"
                        name="taxRate"
                        value={taxRate}
                        onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
                        min="0"
                        max="100"
                        step="0.01"
                        className="input input-bordered w-full md:w-48 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    {formState.errors?.taxRate && (
                        <div role="alert" className="alert alert-warning mt-2 flex items-center gap-2 rounded-xl">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 shrink-0 stroke-current" fill="none" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            <span>{formState.errors.taxRate}</span>
                        </div>
                    )}
                </div>

                {/* Totals Summary */}
                <div className="space-y-2 border-t border-base-100 pt-4">
                    <div className="flex justify-between text-base">
                        <span className="font-medium">Subtotal:</span>
                        <span className="font-semibold">R {subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-base">
                        <span className="font-medium">Tax ({taxRate}%):</span>
                        <span className="font-semibold">R {tax.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-xl border-t border-base-100 pt-2">
                        <span className="font-bold">Total:</span>
                        <span className="font-bold text-primary">R {total.toFixed(2)}</span>
                    </div>
                </div>
            </div>

            {/* Notes */}
            <div className="bg-base-300 p-6 rounded-xl">
                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4">
                    Additional Notes
                </h3>
                <div className="form-control">
                    <label htmlFor="notes" className="label mb-1">
                        <span className="label-text font-medium">Notes</span>
                        <span className="label-text-alt text-gray-500">Optional</span>
                    </label>
                    <textarea
                        id="notes"
                        name="notes"
                        rows="4"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Add payment terms, delivery instructions, or other notes..."
                        className="textarea textarea-bordered w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <button
                    type="submit"
                    className="btn btn-primary rounded-lg px-8 flex-1 sm:flex-none"
                >
                    {isEditing ? "Save Changes" : "Create Invoice"}
                </button>
                <Link
                    href={isEditing ? `/invoices/${invoice._id}` : "/invoices"}
                    className="btn btn-outline rounded-lg px-8 flex-1 sm:flex-none"
                >
                    Cancel
                </Link>
            </div>

            {/* Required Fields Note */}
            <div className="text-sm text-gray-500 dark:text-gray-400 pt-2">
                <span className="text-error">*</span> Required fields
            </div>
        </form>
    )
}