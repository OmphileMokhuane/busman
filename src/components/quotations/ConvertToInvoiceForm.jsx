"use client"

import { useActionState, useState } from "react"
import { convertQuotationToInvoice } from "../../actions/quotationsController"
import Link from "next/link"

export default function ConvertToInvoiceForm({ quotation }) {
    const [formState, formAction] = useActionState(
        convertQuotationToInvoice.bind(null, quotation._id),
        {}
    )

    const today = new Date().toISOString().split('T')[0]
    const [invoiceDate, setInvoiceDate] = useState(today)
    const [dueDate, setDueDate] = useState(() => {
        const date = new Date()
        date.setDate(date.getDate() + 30) // Default 30 days payment term
        return date.toISOString().split('T')[0]
    })
    const [purchaseOrderNumber, setPurchaseOrderNumber] = useState("")
    const [additionalNotes, setAdditionalNotes] = useState("")

    const formatCurrency = (amount) => {
        return `R ${parseFloat(amount).toFixed(2)}`
    }

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-ZA', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })
    }

    return (
        <div className="space-y-6">
            {/* Quotation Summary */}
            <div className="bg-base-200 p-6 rounded-xl">
                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4">
                    Quotation Summary
                </h3>
                <div className="space-y-3">
                    <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Quotation Number:</span>
                        <span className="font-semibold text-gray-800 dark:text-white">
                            {quotation.quotationNumber}
                        </span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Client:</span>
                        <span className="font-semibold text-gray-800 dark:text-white">
                            {quotation.client.name}
                        </span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Quotation Date:</span>
                        <span className="font-medium text-gray-800 dark:text-white">
                            {formatDate(quotation.date)}
                        </span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Items:</span>
                        <span className="font-medium text-gray-800 dark:text-white">
                            {quotation.items.length} item{quotation.items.length !== 1 ? 's' : ''}
                        </span>
                    </div>
                    <div className="flex justify-between text-xl border-t border-base-300 pt-3">
                        <span className="font-bold text-gray-800 dark:text-white">Total Amount:</span>
                        <span className="font-bold text-primary">
                            {formatCurrency(quotation.total)}
                        </span>
                    </div>
                </div>
            </div>

            {/* Info Alert */}
            <div role="alert" className="alert alert-info rounded-xl">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 shrink-0 stroke-current" fill="none" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                    <h3 className="font-bold">Converting to Invoice</h3>
                    <div className="text-sm">
                        All line items, amounts, and client details will be copied to the new invoice. 
                        The quotation status will be updated to "Accepted".
                    </div>
                </div>
            </div>

            {/* Conversion Form */}
            <form action={formAction} className="bg-base-300 p-6 rounded-xl space-y-6">
                {/* General Error */}
                {formState.errors?.general && (
                    <div role="alert" className="alert alert-error rounded-xl">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 shrink-0 stroke-current" fill="none" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>{formState.errors.general}</span>
                    </div>
                )}

                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                    Invoice Details
                </h3>

                {/* Invoice Date */}
                <div className="form-control">
                    <label htmlFor="invoiceDate" className="label">
                        <span className="label-text font-medium">
                            Invoice Date <span className="text-error">*</span>
                        </span>
                    </label>
                    <input
                        type="date"
                        id="invoiceDate"
                        name="invoiceDate"
                        value={invoiceDate}
                        onChange={(e) => setInvoiceDate(e.target.value)}
                        className="input input-bordered w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    {formState.errors?.invoiceDate && (
                        <div role="alert" className="alert alert-warning mt-2 flex items-center gap-2 rounded-xl">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 shrink-0 stroke-current" fill="none" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            <span>{formState.errors.invoiceDate}</span>
                        </div>
                    )}
                </div>

                {/* Due Date */}
                <div className="form-control">
                    <label htmlFor="dueDate" className="label">
                        <span className="label-text font-medium">
                            Payment Due Date <span className="text-error">*</span>
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
                    <label className="label">
                        <span className="label-text-alt text-gray-500">
                            Default: 30 days from invoice date
                        </span>
                    </label>
                </div>

                {/* Purchase Order Number */}
                <div className="form-control">
                    <label htmlFor="purchaseOrderNumber" className="label">
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

                {/* Additional Notes */}
                <div className="form-control">
                    <label htmlFor="additionalNotes" className="label">
                        <span className="label-text font-medium">Additional Invoice Notes</span>
                        <span className="label-text-alt text-gray-500">Optional</span>
                    </label>
                    <textarea
                        id="additionalNotes"
                        name="additionalNotes"
                        rows="4"
                        value={additionalNotes}
                        onChange={(e) => setAdditionalNotes(e.target.value)}
                        placeholder="Add payment terms, special instructions, or other notes..."
                        className="textarea textarea-bordered w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <label className="label">
                        <span className="label-text-alt text-gray-500">
                            These notes will be added to the notes from the quotation
                        </span>
                    </label>
                </div>

                {/* What Will Happen */}
                <div className="bg-base-200 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-3">
                        What will happen:
                    </h4>
                    <ul className="space-y-2 text-sm">
                        <li className="flex items-start gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-success flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>A new invoice will be created with a unique invoice number</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-success flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>All line items and amounts will be copied from the quotation</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-success flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>The quotation status will be updated to "Accepted"</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-success flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>The invoice will be linked to this quotation</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-info flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>The original quotation will remain unchanged and can still be viewed</span>
                        </li>
                    </ul>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                    <button
                        type="submit"
                        className="btn btn-success rounded-lg px-8 flex-1 sm:flex-none text-white"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Convert to Invoice
                    </button>
                    <Link
                        href={`/quotations/${quotation._id}`}
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
        </div>
    )
}