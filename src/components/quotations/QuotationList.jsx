"use client"
import Link from "next/link"
import { useState } from "react"
import { deleteQuotation, updateQuotationStatus } from "../../actions/quotationsController"

export default function QuotationList({ quotations, clients }) {
    const [searchTerm, setSearchTerm] = useState("")
    const [statusFilter, setStatusFilter] = useState("all")
    const [deleteError, setDeleteError] = useState("")
    const [deletingId, setDeletingId] = useState(null)

    // Create a map of client IDs to client names for quick lookup
    const clientMap = clients.reduce((acc, client) => {
        acc[client._id] = client.name
        return acc
    }, {})

    // Filter quotations based on search and status
    const filteredQuotations = quotations.filter(quotation => {
        const clientName = clientMap[quotation.clientId] || "Unknown"
        const search = searchTerm.toLowerCase()
        
        const matchesSearch = 
            quotation.quotationNumber.toLowerCase().includes(search) ||
            clientName.toLowerCase().includes(search) ||
            quotation.total.toString().includes(search)
        
        const matchesStatus = statusFilter === "all" || quotation.status === statusFilter
        
        return matchesSearch && matchesStatus
    })

    const handleDelete = async (quotationId, quotationNumber) => {
        if (!confirm(`Are you sure you want to delete ${quotationNumber}? This action cannot be undone.`)) {
            return
        }

        setDeletingId(quotationId)
        setDeleteError("")

        const result = await deleteQuotation(quotationId)

        if (result.success) {
            window.location.reload()
        } else {
            setDeleteError(result.error)
            setDeletingId(null)
        }
    }

    const handleStatusChange = async (quotationId, newStatus) => {
        const result = await updateQuotationStatus(quotationId, newStatus)
        
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
            accepted: "badge badge-success",
            rejected: "badge badge-error",
            expired: "badge badge-warning"
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

    return (
        <div className="space-y-6">
            {/* Search and Filter Bar */}
            <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
                <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                    {/* Search */}
                    <div className="w-full sm:w-80">
                        <input
                            type="text"
                            placeholder="Search by number, client, or amount..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="input input-bordered w-full rounded-full"
                        />
                    </div>
                    
                    {/* Status Filter */}
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="select select-bordered rounded-full px-5"
                    >
                        <option value="all">All Status</option>
                        <option value="draft">Draft</option>
                        <option value="sent">Sent</option>
                        <option value="accepted">Accepted</option>
                        <option value="rejected">Rejected</option>
                        <option value="expired">Expired</option>
                    </select>
                </div>
                
                <Link href="/quotations/new">
                    <button className="btn btn-primary rounded-full px-6 whitespace-nowrap w-full sm:w-auto">
                        + New Quotation
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

            {/* Quotations Count */}
            <div className="text-sm text-gray-600 dark:text-gray-400">
                Showing {filteredQuotations.length} of {quotations.length} quotations
            </div>

            {/* Quotations Grid */}
            {filteredQuotations.length === 0 ? (
                <div className="bg-base-200 p-12 rounded-2xl text-center">
                    <p className="text-gray-500 dark:text-gray-400 text-lg">
                        {searchTerm || statusFilter !== "all" 
                            ? "No quotations found matching your filters." 
                            : "No quotations yet. Create your first quotation!"}
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
                                        <th>Quotation #</th>
                                        <th>Client</th>
                                        <th>Date</th>
                                        <th>Valid Until</th>
                                        <th>Amount</th>
                                        <th>Status</th>
                                        <th className="text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredQuotations.map((quotation) => (
                                        <tr key={quotation._id} className="hover">
                                            <td className="font-semibold text-primary">
                                                {quotation.quotationNumber}
                                            </td>
                                            <td>{clientMap[quotation.clientId] || "Unknown"}</td>
                                            <td>{formatDate(quotation.date)}</td>
                                            <td>{formatDate(quotation.validUntil)}</td>
                                            <td className="font-semibold">{formatCurrency(quotation.total)}</td>
                                            <td>
                                                <select
                                                    value={quotation.status}
                                                    onChange={(e) => handleStatusChange(quotation._id, e.target.value)}
                                                    className={`select select-xs ${getStatusBadge(quotation.status)} border-0`}
                                                >
                                                    <option value="draft">Draft</option>
                                                    <option value="sent">Sent</option>
                                                    <option value="accepted">Accepted</option>
                                                    <option value="rejected">Rejected</option>
                                                    <option value="expired">Expired</option>
                                                </select>
                                            </td>
                                            <td>
                                                <div className="flex gap-2 justify-end">
                                                    <Link href={`/quotations/${quotation._id}`}>
                                                        <button className="btn btn-sm btn-ghost">View</button>
                                                    </Link>
                                                    <Link href={`/quotations/${quotation._id}/edit`}>
                                                        <button className="btn btn-sm btn-ghost">Edit</button>
                                                    </Link>
                                                    <button
                                                        onClick={() => handleDelete(quotation._id, quotation.quotationNumber)}
                                                        disabled={deletingId === quotation._id}
                                                        className="btn btn-sm btn-ghost text-error hover:bg-error/10"
                                                    >
                                                        {deletingId === quotation._id ? "..." : "Delete"}
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
                        {filteredQuotations.map((quotation) => (
                            <div key={quotation._id} className="bg-base-200 p-4 rounded-xl shadow-md">
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <h3 className="font-bold text-lg text-primary">
                                            {quotation.quotationNumber}
                                        </h3>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            {clientMap[quotation.clientId] || "Unknown"}
                                        </p>
                                    </div>
                                    <select
                                        value={quotation.status}
                                        onChange={(e) => handleStatusChange(quotation._id, e.target.value)}
                                        className={`select select-xs ${getStatusBadge(quotation.status)} border-0`}
                                    >
                                        <option value="draft">Draft</option>
                                        <option value="sent">Sent</option>
                                        <option value="accepted">Accepted</option>
                                        <option value="rejected">Rejected</option>
                                        <option value="expired">Expired</option>
                                    </select>
                                </div>
                                
                                <div className="space-y-2 mb-4">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600 dark:text-gray-400">Date:</span>
                                        <span className="font-medium">{formatDate(quotation.date)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600 dark:text-gray-400">Valid Until:</span>
                                        <span className="font-medium">{formatDate(quotation.validUntil)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600 dark:text-gray-400">Amount:</span>
                                        <span className="font-bold text-lg">{formatCurrency(quotation.total)}</span>
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    <Link href={`/quotations/${quotation._id}`} className="flex-1">
                                        <button className="btn btn-sm btn-outline w-full">View</button>
                                    </Link>
                                    <Link href={`/quotations/${quotation._id}/edit`} className="flex-1">
                                        <button className="btn btn-sm btn-outline w-full">Edit</button>
                                    </Link>
                                    <button
                                        onClick={() => handleDelete(quotation._id, quotation.quotationNumber)}
                                        disabled={deletingId === quotation._id}
                                        className="btn btn-sm btn-outline btn-error"
                                    >
                                        {deletingId === quotation._id ? "..." : "Delete"}
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