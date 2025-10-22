"use client"
import Link from "next/link"
import { useState } from "react"
import { deleteInvoice, updateInvoiceStatus } from "@/actions/invoiceController"
import { useRouter } from "next/navigation"

export default function InvoicePreview({ invoice }) {
    const router = useRouter()
    const [isDeleting, setIsDeleting] = useState(false)
    const [deleteError, setDeleteError] = useState("")
    const [updatingStatus, setUpdatingStatus] = useState(false)

    const handleDelete = async () => {
        if (!confirm(`Are you sure you want to delete ${invoice.invoiceNumber}? This action cannot be undone.`)) {
            return
        }

        setIsDeleting(true)
        setDeleteError("")

        const result = await deleteInvoice(invoice._id)

        if (result.success) {
            router.push("/invoices")
        } else {
            setDeleteError(result.error)
            setIsDeleting(false)
        }
    }

    const handleStatusChange = async (newStatus) => {
        setUpdatingStatus(true)
        const result = await updateInvoiceStatus(invoice._id, newStatus)
        
        if (result.success) {
            window.location.reload()
        } else {
            alert(result.error || "Failed to update status")
            setUpdatingStatus(false)
        }
    }

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-ZA', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })
    }

    const formatCurrency = (amount) => {
        return `R ${parseFloat(amount).toFixed(2)}`
    }

    const getStatusBadge = (status) => {
        const badges = {
            draft: { class: "badge-ghost", text: "Draft" },
            sent: { class: "badge-info", text: "Sent" },
            paid: { class: "badge-success", text: "Paid" },
            partial: { class: "badge-warning", text: "Partial Payment" },
            overdue: { class: "badge-error", text: "Overdue" },
            cancelled: { class: "badge-neutral", text: "Cancelled" }
        }
        return badges[status] || badges.draft
    }

    const statusBadge = getStatusBadge(invoice.status)

    // Check if invoice is overdue
    const isOverdue = new Date(invoice.dueDate) < new Date() && 
                      invoice.status !== "paid" && 
                      invoice.status !== "cancelled"

    // Calculate payment percentage
    const paymentPercentage = invoice.total > 0 
        ? ((invoice.amountPaid / invoice.total) * 100).toFixed(0)
        : 0

    return (
        <div className="space-y-6">
            {/* Error Alert */}
            {deleteError && (
                <div role="alert" className="alert alert-error rounded-xl">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 shrink-0 stroke-current" fill="none" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{deleteError}</span>
                </div>
            )}

            {/* Overdue Warning */}
            {isOverdue && (
                <div role="alert" className="alert alert-error rounded-xl">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 shrink-0 stroke-current" fill="none" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <span>This invoice is overdue! Payment was due on {formatDate(invoice.dueDate)}.</span>
                </div>
            )}

            {/* Payment Status Bar */}
            {invoice.amountPaid > 0 && invoice.status !== "paid" && (
                <div className="bg-base-200 p-4 rounded-xl">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">Payment Progress</span>
                        <span className="text-sm font-bold">{paymentPercentage}%</span>
                    </div>
                    <div className="w-full bg-base-300 rounded-full h-4 overflow-hidden">
                        <div 
                            className="bg-warning h-full rounded-full transition-all duration-300"
                            style={{ width: `${paymentPercentage}%` }}
                        />
                    </div>
                    <div className="flex justify-between items-center mt-2 text-sm">
                        <span className="text-gray-600 dark:text-gray-400">
                            Paid: {formatCurrency(invoice.amountPaid)}
                        </span>
                        <span className="text-gray-600 dark:text-gray-400">
                            Balance: {formatCurrency(invoice.balance)}
                        </span>
                    </div>
                </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center bg-base-200 p-4 rounded-xl">
                <div className="flex flex-wrap gap-2">
                    <Link href={`/invoices/${invoice._id}/edit`}>
                        <button className="btn btn-primary btn-sm rounded-lg">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Edit
                        </button>
                    </Link>
                    
                    {invoice.status !== "paid" && invoice.status !== "cancelled" && (
                        <Link href={`/invoices/${invoice._id}/payment`}>
                            <button className="btn btn-success btn-sm rounded-lg text-white">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                                Record Payment
                            </button>
                        </Link>
                    )}
                    
                    <button
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className="btn btn-outline btn-error btn-sm rounded-lg"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        {isDeleting ? "Deleting..." : "Delete"}
                    </button>
                </div>

                {/* Status Selector */}
                <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Status:</span>
                    <select
                        value={invoice.status}
                        onChange={(e) => handleStatusChange(e.target.value)}
                        disabled={updatingStatus}
                        className={`select select-sm ${statusBadge.class} border-0 rounded-lg font-semibold`}
                    >
                        <option value="draft">Draft</option>
                        <option value="sent">Sent</option>
                        <option value="paid">Paid</option>
                        <option value="partial">Partial</option>
                        <option value="overdue">Overdue</option>
                        <option value="cancelled">Cancelled</option>
                    </select>
                </div>
            </div>

            {/* Invoice Document */}
            <div className="bg-white dark:bg-base-200 rounded-2xl shadow-lg overflow-hidden">
                {/* Header Section */}
                <div className="bg-gradient-to-r from-success to-success/80 text-white p-8">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <h2 className="text-3xl font-bold mb-2">INVOICE</h2>
                            <p className="text-lg opacity-90">{invoice.invoiceNumber}</p>
                            {invoice.purchaseOrderNumber && (
                                <p className="text-sm opacity-80 mt-1">PO: {invoice.purchaseOrderNumber}</p>
                            )}
                        </div>
                        <div className={`badge ${statusBadge.class} badge-lg text-white px-4 py-3`}>
                            {statusBadge.text}
                        </div>
                    </div>
                </div>

                {/* Content Section */}
                <div className="p-8 space-y-8">
                    {/* Client and Date Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Client Info */}
                        <div>
                            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase mb-3">
                                Bill To
                            </h3>
                            <div className="space-y-1">
                                <p className="text-xl font-bold text-gray-800 dark:text-white">
                                    {invoice.client.name}
                                </p>
                                {invoice.client.companyName && (
                                    <p className="text-base text-gray-600 dark:text-gray-300">
                                        {invoice.client.companyName}
                                    </p>
                                )}
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    {invoice.client.email}
                                </p>
                                {invoice.client.phoneNumber && (
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        {invoice.client.phoneNumber}
                                    </p>
                                )}
                                {invoice.client.companyAddress && (
                                    <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-line mt-2">
                                        {invoice.client.companyAddress}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Date Info */}
                        <div className="md:text-right">
                            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase mb-3">
                                Invoice Details
                            </h3>
                            <div className="space-y-2">
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Invoice Date</p>
                                    <p className="text-base font-semibold text-gray-800 dark:text-white">
                                        {formatDate(invoice.date)}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Due Date</p>
                                    <p className={`text-base font-semibold ${isOverdue ? 'text-error' : 'text-gray-800 dark:text-white'}`}>
                                        {formatDate(invoice.dueDate)}
                                        {isOverdue && " (Overdue)"}
                                    </p>
                                </div>
                                {invoice.paymentDate && (
                                    <div>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">Payment Date</p>
                                        <p className="text-base font-semibold text-success">
                                            {formatDate(invoice.paymentDate)}
                                        </p>
                                    </div>
                                )}
                                {invoice.paymentMethod && (
                                    <div>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">Payment Method</p>
                                        <p className="text-base font-semibold text-gray-800 dark:text-white">
                                            {invoice.paymentMethod}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Line Items Table */}
                    <div>
                        <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase mb-4">
                            Items
                        </h3>
                        <div className="overflow-x-auto">
                            <table className="table w-full">
                                <thead>
                                    <tr className="border-b-2 border-gray-300 dark:border-gray-600">
                                        <th className="text-left text-gray-700 dark:text-gray-300">Description</th>
                                        <th className="text-right text-gray-700 dark:text-gray-300">Quantity</th>
                                        <th className="text-right text-gray-700 dark:text-gray-300">Unit Price</th>
                                        <th className="text-right text-gray-700 dark:text-gray-300">Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {invoice.items.map((item, index) => (
                                        <tr key={index} className="border-b border-gray-200 dark:border-gray-700">
                                            <td className="py-3 text-gray-800 dark:text-white">{item.description}</td>
                                            <td className="py-3 text-right text-gray-800 dark:text-white">{item.quantity}</td>
                                            <td className="py-3 text-right text-gray-800 dark:text-white">{formatCurrency(item.unitPrice)}</td>
                                            <td className="py-3 text-right font-semibold text-gray-800 dark:text-white">
                                                {formatCurrency(item.total)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Totals Section */}
                    <div className="flex justify-end">
                        <div className="w-full md:w-80 space-y-3">
                            <div className="flex justify-between text-base">
                                <span className="text-gray-600 dark:text-gray-400">Subtotal:</span>
                                <span className="font-semibold text-gray-800 dark:text-white">
                                    {formatCurrency(invoice.subtotal)}
                                </span>
                            </div>
                            <div className="flex justify-between text-base">
                                <span className="text-gray-600 dark:text-gray-400">Tax ({invoice.taxRate}%):</span>
                                <span className="font-semibold text-gray-800 dark:text-white">
                                    {formatCurrency(invoice.tax)}
                                </span>
                            </div>
                            <div className="flex justify-between text-xl border-t-2 border-gray-300 dark:border-gray-600 pt-3">
                                <span className="font-bold text-gray-800 dark:text-white">Total:</span>
                                <span className="font-bold text-success">
                                    {formatCurrency(invoice.total)}
                                </span>
                            </div>
                            
                            {/* Payment Info */}
                            {invoice.amountPaid > 0 && (
                                <>
                                    <div className="flex justify-between text-base border-t border-gray-200 dark:border-gray-700 pt-3">
                                        <span className="text-gray-600 dark:text-gray-400">Amount Paid:</span>
                                        <span className="font-semibold text-success">
                                            {formatCurrency(invoice.amountPaid)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-lg">
                                        <span className="font-bold text-gray-800 dark:text-white">Balance Due:</span>
                                        <span className={`font-bold ${invoice.balance > 0 ? 'text-warning' : 'text-success'}`}>
                                            {formatCurrency(invoice.balance)}
                                        </span>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Notes Section */}
                    {invoice.notes && (
                        <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase mb-3">
                                Notes
                            </h3>
                            <p className="text-base text-gray-700 dark:text-gray-300 whitespace-pre-line">
                                {invoice.notes}
                            </p>
                        </div>
                    )}

                    {/* Metadata */}
                    <div className="border-t border-gray-200 dark:border-gray-700 pt-6 text-sm text-gray-500 dark:text-gray-400">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <div>
                                <span className="font-medium">Created:</span> {formatDate(invoice.createdAt)}
                            </div>
                            <div className="sm:text-right">
                                <span className="font-medium">Last Updated:</span> {formatDate(invoice.updatedAt)}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}