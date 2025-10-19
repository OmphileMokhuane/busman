"use client"
import Link from "next/link"
import { useState } from "react"
import { deleteClient } from "../../actions/clientsController"
import { useRouter } from "next/navigation"

export default function ClientCard({ client }) {
    const router = useRouter()
    const [isDeleting, setIsDeleting] = useState(false)
    const [deleteError, setDeleteError] = useState("")

    const handleDelete = async () => {
        if (!confirm(`Are you sure you want to delete ${client.name}? This action cannot be undone.`)) {
            return
        }

        setIsDeleting(true)
        setDeleteError("")

        const result = await deleteClient(client._id)

        if (result.success) {
            router.push("/clients")
        } else {
            setDeleteError(result.error)
            setIsDeleting(false)
        }
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
            {/* Error Alert */}
            {deleteError && (
                <div role="alert" className="alert alert-error rounded-xl">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 shrink-0 stroke-current" fill="none" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{deleteError}</span>
                </div>
            )}

            {/* Client Info Card */}
            <div className="bg-base-200 p-6 sm:p-8 rounded-2xl shadow-md">
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6">
                    <div>
                        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white mb-1">
                            {client.name}
                        </h2>
                        {client.companyName && (
                            <p className="text-lg text-gray-600 dark:text-gray-400">
                                {client.companyName}
                            </p>
                        )}
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto">
                        <Link href={`/clients/${client._id}/edit`} className="flex-1 sm:flex-none">
                            <button className="btn btn-primary btn-sm sm:btn-md rounded-lg w-full">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                                Edit
                            </button>
                        </Link>
                        <button
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="btn btn-outline btn-error btn-sm sm:btn-md rounded-lg flex-1 sm:flex-none"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            {isDeleting ? "Deleting..." : "Delete"}
                        </button>
                    </div>
                </div>

                <div className="divider"></div>

                {/* Contact Information */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3">
                        Contact Information
                    </h3>

                    {/* Email */}
                    <div className="flex items-start gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                            <a href={`mailto:${client.email}`} className="text-base font-medium text-gray-800 dark:text-white hover:text-primary transition">
                                {client.email}
                            </a>
                        </div>
                    </div>

                    {/* Phone */}
                    {client.phoneNumber && (
                        <div className="flex items-start gap-3">
                            <div className="p-2 bg-primary/10 rounded-lg">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Phone</p>
                                <a href={`tel:${client.phoneNumber}`} className="text-base font-medium text-gray-800 dark:text-white hover:text-primary transition">
                                    {client.phoneNumber}
                                </a>
                            </div>
                        </div>
                    )}

                    {/* Company Address */}
                    {client.companyAddress && (
                        <div className="flex items-start gap-3">
                            <div className="p-2 bg-primary/10 rounded-lg">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Company Address</p>
                                <p className="text-base font-medium text-gray-800 dark:text-white whitespace-pre-line">
                                    {client.companyAddress}
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                <div className="divider"></div>

                {/* Metadata */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Created</p>
                        <p className="text-base font-medium text-gray-800 dark:text-white">
                            {formatDate(client.createdAt)}
                        </p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Last Updated</p>
                        <p className="text-base font-medium text-gray-800 dark:text-white">
                            {formatDate(client.updatedAt)}
                        </p>
                    </div>
                </div>
            </div>

            {/* Activity Section (Quotations, Invoices, Pumps) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Quotations */}
                <div className="bg-base-200 p-6 rounded-2xl shadow-md">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 bg-blue-500/10 rounded-lg">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold text-gray-800 dark:text-white">0</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Quotations</p>
                        </div>
                    </div>
                    <Link href={`/quotations/new?clientId=${client._id}`}>
                        <button className="btn btn-sm btn-outline w-full rounded-lg">
                            Create Quotation
                        </button>
                    </Link>
                </div>

                {/* Invoices */}
                <div className="bg-base-200 p-6 rounded-2xl shadow-md">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 bg-green-500/10 rounded-lg">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold text-gray-800 dark:text-white">0</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Invoices</p>
                        </div>
                    </div>
                    <Link href={`/invoices/new?clientId=${client._id}`}>
                        <button className="btn btn-sm btn-outline w-full rounded-lg">
                            Create Invoice
                        </button>
                    </Link>
                </div>

                {/* Pumps */}
                <div className="bg-base-200 p-6 rounded-2xl shadow-md">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 bg-orange-500/10 rounded-lg">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold text-gray-800 dark:text-white">0</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Pumps</p>
                        </div>
                    </div>
                    <Link href={`/pumps/new?clientId=${client._id}`}>
                        <button className="btn btn-sm btn-outline w-full rounded-lg">
                            Add Pump
                        </button>
                    </Link>
                </div>
            </div>

            {/* Recent Activity Lists (will be populated later) */}
            <div className="space-y-4">
                {/* Recent Quotations */}
                <div className="bg-base-200 p-6 rounded-2xl shadow-md">
                    <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4">
                        Recent Quotations
                    </h3>
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                        No quotations yet
                    </div>
                </div>

                {/* Recent Invoices */}
                <div className="bg-base-200 p-6 rounded-2xl shadow-md">
                    <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4">
                        Recent Invoices
                    </h3>
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                        No invoices yet
                    </div>
                </div>

                {/* Pumps in Workshop */}
                <div className="bg-base-200 p-6 rounded-2xl shadow-md">
                    <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4">
                        Pumps in Workshop
                    </h3>
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                        No pumps in workshop
                    </div>
                </div>
            </div>
        </div>
    )
}