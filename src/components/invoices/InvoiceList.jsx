"use client"
import Link from "next/link"
import { useState } from "react"
import { deleteInvoice, updateInvoiceStatus } from "@/actions/invoiceController"

export default function InvoiceList({ invoices, clients }) {
    const [searchTerm, setSearchTerm] = useState("")
    const [statusFilter, setStatusFilter] = useState("all")
    const [deleteError, setDeleteError] = useState("")
    const [deletingId, setDeletingId] = useState(null)

    // Create a map of client IDs to client names for quick lookup
    const clientMap = clients.reduce((acc, client) => {
        acc[client._id] = client.name
        return acc
    }, {})

    // Filter invoices based on search and status
    const filteredInvoices = invoices.filter(invoice => {
        const clientName = clientMap[invoice.clientId] || "Unknown"
        const search = searchTerm.toLowerCase()
        
        const matchesSearch = 
            invoice.invoiceNumber.toLowerCase().includes(search) ||
            clientName.toLowerCase().includes(search) ||
            invoice.total.toString().includes(search) ||
            (invoice.purchaseOrderNumber && invoice.purchaseOrderNumber.toLowerCase().includes(search))
        
        const matchesStatus = statusFilter === "all" || invoice.status === statusFilter
        
        return matchesSearch && matchesStatus
    })

    const handleDelete = async (invoiceId, invoiceNumber) => {
        if (!confirm(`Are you sure you want to delete ${invoiceNumber}? This action cannot be undone.`)) {
            return
        }

        setDeletingId(invoiceId)
        setDeleteError("")

        const result = await deleteInvoice(invoiceId)

        if (result.success) {
            window.location.reload()
        } else {
            setDeleteError(result.error)
            setDeletingId(null)
        }
    }

    const handleStatusChange = async (invoiceId, newStatus) => {
        const result = await updateInvoiceStatus(invoiceId, newStatus)
        
        if (result.success) {
            window.location.reload()
        } else {
            alert(result.error || "Failed to update status")
        }
    }

    const getStatusBadge = (status) => {
        const badges = {
            draft: "badge badge-ghost",
            sent: "badge badge-info",
            paid: "badge badge-success",
            partial: "badge badge-warning",
            overdue: "badge badge-error",
            cancelled: "badge badge-neutral"
        }
        return badges[status] || "badge badge-ghost"
    }

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-ZA', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        })
    }

    const formatCurrency = (amount) => {
        return `R ${parseFloat(amount).toFixed(2)}`
    }

    // Check if invoice is overdue
    const isOverdue = (invoice) => {
        const today = new Date()
        const dueDate = new Date(invoice.dueDate)
        return dueDate < today && invoice.status !== "paid" && invoice.status !== "cancelled"
    }

    return (
        <div className="space-y-6">
            {/* Search and Filter Bar */}
            <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
                <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                    {/* Search */}
                    <div className="w-full sm:w-80">
                        <input
                            type="text"
                            placeholder="Search by number, client, PO, or amount..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="input input-bordered w-full rounded-full"
                        />
                    </div>
                    
                    {/* Status Filter */}
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="select select-bordered rounded-full px-4"
                    >
                        <option value="all">All Status</option>
                        <option value="draft">Draft</option>
                        <option value="sent">Sent</option>
                        <option value="paid">Paid</option>
                        <option value="partial">Partial</option>
                        <option value="overdue">Overdue</option>
                        <option value="cancelled">Cancelled</option>
                    </select>
                </div>
                
                <Link href="/invoices/new">
                    <button className="btn btn-primary rounded-full px-6 whitespace-nowrap w-full sm:w-auto">
                        + New Invoice
                    </button>
                </Link>
            </div>

            {/* Error Alert */}
            {deleteError && (
                <div role="alert" className="alert alert-error rounded-xl">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 shrink-0 stroke-current" fill="none" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{deleteError}</span>
                </div>
            )}

            {/* Invoices Count */}
            <div className="text-sm text-gray-600 dark:text-gray-400">
                Showing {filteredInvoices.length} of {invoices.length} invoices
            </div>

            {/* Invoices Grid */}
            {filteredInvoices.length === 0 ? (
                <div className="bg-base-200 p-12 rounded-2xl text-center">
                    <p className="text-gray-500 dark:text-gray-400 text-lg">
                        {searchTerm || statusFilter !== "all" 
                            ? "No invoices found matching your filters." 
                            : "No invoices yet. Create your first invoice!"}
                    </p>
                </div>
            ) : (
                <>
                    {/* Desktop Table View */}
                    <div className="hidden lg:block bg-base-200 rounded-2xl shadow-md overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="table table-zebra w-full">
                                <thead>
                                    <tr className="bg-base-300">
                                        <th>Invoice #</th>
                                        <th>Client</th>
                                        <th>Date</th>
                                        <th>Due Date</th>
                                        <th>Amount</th>
                                        <th>Balance</th>
                                        <th>Status</th>
                                        <th className="text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredInvoices.map((invoice) => (
                                        <tr key={invoice._id} className={`hover ${isOverdue(invoice) ? 'bg-error/5' : ''}`}>
                                            <td className="font-semibold text-primary">
                                                {invoice.invoiceNumber}
                                                {invoice.purchaseOrderNumber && (
                                                    <div className="text-xs text-gray-500">
                                                        PO: {invoice.purchaseOrderNumber}
                                                    </div>
                                                )}
                                            </td>
                                            <td>{clientMap[invoice.clientId] || "Unknown"}</td>
                                            <td>{formatDate(invoice.date)}</td>
                                            <td className={isOverdue(invoice) ? 'text-error font-semibold' : ''}>
                                                {formatDate(invoice.dueDate)}
                                                {isOverdue(invoice) && <span className="ml-1">⚠️</span>}
                                            </td>
                                            <td className="font-semibold">{formatCurrency(invoice.total)}</td>
                                            <td className={invoice.balance > 0 ? 'text-warning font-semibold' : 'text-success'}>
                                                {formatCurrency(invoice.balance)}
                                            </td>
                                            <td>
                                                <select
                                                    value={invoice.status}
                                                    onChange={(e) => handleStatusChange(invoice._id, e.target.value)}
                                                    className={`select select-xs ${getStatusBadge(invoice.status)} border-0`}
                                                >
                                                    <option value="draft">Draft</option>
                                                    <option value="sent">Sent</option>
                                                    <option value="paid">Paid</option>
                                                    <option value="partial">Partial</option>
                                                    <option value="overdue">Overdue</option>
                                                    <option value="cancelled">Cancelled</option>
                                                </select>
                                            </td>
                                            <td>
                                                <div className="flex gap-2 justify-end">
                                                    <Link href={`/invoices/${invoice._id}`}>
                                                        <button className="btn btn-sm btn-ghost">View</button>
                                                    </Link>
                                                    <Link href={`/invoices/${invoice._id}/edit`}>
                                                        <button className="btn btn-sm btn-ghost">Edit</button>
                                                    </Link>
                                                    <button
                                                        onClick={() => handleDelete(invoice._id, invoice.invoiceNumber)}
                                                        disabled={deletingId === invoice._id}
                                                        className="btn btn-sm btn-ghost text-error hover:bg-error/10"
                                                    >
                                                        {deletingId === invoice._id ? "..." : "Delete"}
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Mobile Card View */}
                    <div className="lg:hidden space-y-4">
                        {filteredInvoices.map((invoice) => (
                            <div key={invoice._id} className={`bg-base-200 p-4 rounded-xl shadow-md ${isOverdue(invoice) ? 'border-2 border-error' : ''}`}>
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <h3 className="font-bold text-lg text-primary">
                                            {invoice.invoiceNumber}
                                        </h3>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            {clientMap[invoice.clientId] || "Unknown"}
                                        </p>
                                        {invoice.purchaseOrderNumber && (
                                            <p className="text-xs text-gray-500">
                                                PO: {invoice.purchaseOrderNumber}
                                            </p>
                                        )}
                                    </div>
                                    <select
                                        value={invoice.status}
                                        onChange={(e) => handleStatusChange(invoice._id, e.target.value)}
                                        className={`select select-xs ${getStatusBadge(invoice.status)} border-0`}
                                    >
                                        <option value="draft">Draft</option>
                                        <option value="sent">Sent</option>
                                        <option value="paid">Paid</option>
                                        <option value="partial">Partial</option>
                                        <option value="overdue">Overdue</option>
                                        <option value="cancelled">Cancelled</option>
                                    </select>
                                </div>
                                
                                <div className="space-y-2 mb-4">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600 dark:text-gray-400">Date:</span>
                                        <span className="font-medium">{formatDate(invoice.date)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600 dark:text-gray-400">Due Date:</span>
                                        <span className={`font-medium ${isOverdue(invoice) ? 'text-error' : ''}`}>
                                            {formatDate(invoice.dueDate)}
                                            {isOverdue(invoice) && " ⚠️"}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600 dark:text-gray-400">Total:</span>
                                        <span className="font-bold text-lg">{formatCurrency(invoice.total)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600 dark:text-gray-400">Balance:</span>
                                        <span className={`font-semibold ${invoice.balance > 0 ? 'text-warning' : 'text-success'}`}>
                                            {formatCurrency(invoice.balance)}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    <Link href={`/invoices/${invoice._id}`} className="flex-1">
                                        <button className="btn btn-sm btn-outline w-full">View</button>
                                    </Link>
                                    <Link href={`/invoices/${invoice._id}/edit`} className="flex-1">
                                        <button className="btn btn-sm btn-outline w-full">Edit</button>
                                    </Link>
                                    <button
                                        onClick={() => handleDelete(invoice._id, invoice.invoiceNumber)}
                                        disabled={deletingId === invoice._id}
                                        className="btn btn-sm btn-outline btn-error"
                                    >
                                        {deletingId === invoice._id ? "..." : "Delete"}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    )
}