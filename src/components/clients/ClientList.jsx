"use client"
import Link from "next/link"
import { useState } from "react"
import { deleteClient } from "../../actions/clientsController"

export default function ClientList({ clients }) {
    const [searchTerm, setSearchTerm] = useState("")
    const [deleteError, setDeleteError] = useState("")
    const [deletingId, setDeletingId] = useState(null)

    // Filter clients based on search
    const filteredClients = clients.filter(client => {
        const search = searchTerm.toLowerCase()
        return (
            client.name.toLowerCase().includes(search) ||
            client.email.toLowerCase().includes(search) ||
            (client.companyName && client.companyName.toLowerCase().includes(search)) ||
            (client.phoneNumber && client.phoneNumber.includes(search))
        )
    })

    const handleDelete = async (clientId, clientName) => {
        if (!confirm(`Are you sure you want to delete ${clientName}? This action cannot be undone.`)) {
            return
        }

        setDeletingId(clientId)
        setDeleteError("")

        const result = await deleteClient(clientId)

        if (result.success) {
            // Refresh the page to show updated list
            window.location.reload()
        } else {
            setDeleteError(result.error)
            setDeletingId(null)
        }
    }

    return (
        <div className="space-y-6">
            {/* Search Bar */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div className="w-full sm:w-96">
                    <input
                        type="text"
                        placeholder="Search clients by name, email, or company..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="input input-bordered w-full rounded-full"
                    />
                </div>
                <Link href="/clients/new">
                    <button className="btn btn-primary rounded-full px-6 whitespace-nowrap">
                        + Add New Client
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

            {/* Clients Count */}
            <div className="text-sm text-gray-600 dark:text-gray-400">
                Showing {filteredClients.length} of {clients.length} clients
            </div>

            {/* Clients Grid - Desktop Table, Mobile Cards */}
            {filteredClients.length === 0 ? (
                <div className="bg-base-200 p-12 rounded-2xl text-center">
                    <p className="text-gray-500 dark:text-gray-400 text-lg">
                        {searchTerm ? "No clients found matching your search." : "No clients yet. Add your first client!"}
                    </p>
                </div>
            ) : (
                <>
                    {/* Desktop Table View */}
                    <div className="hidden md:block bg-base-200 rounded-2xl shadow-md overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="table table-zebra w-full">
                                <thead>
                                    <tr className="bg-base-300">
                                        <th>Name</th>
                                        <th>Email</th>
                                        <th>Company</th>
                                        <th>Phone</th>
                                        <th className="text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredClients.map((client) => (
                                        <tr key={client._id} className="hover">
                                            <td className="font-medium">{client.name}</td>
                                            <td>{client.email}</td>
                                            <td>{client.companyName || <span className="text-gray-400">—</span>}</td>
                                            <td>{client.phoneNumber || <span className="text-gray-400">—</span>}</td>
                                            <td>
                                                <div className="flex gap-2 justify-end">
                                                    <Link href={`/clients/${client._id}`}>
                                                        <button className="btn btn-sm btn-ghost">View</button>
                                                    </Link>
                                                    <Link href={`/clients/${client._id}/edit`}>
                                                        <button className="btn btn-sm btn-ghost">Edit</button>
                                                    </Link>
                                                    <button
                                                        onClick={() => handleDelete(client._id, client.name)}
                                                        disabled={deletingId === client._id}
                                                        className="btn btn-sm btn-ghost text-error hover:bg-error/10"
                                                    >
                                                        {deletingId === client._id ? "..." : "Delete"}
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
                    <div className="md:hidden space-y-4">
                        {filteredClients.map((client) => (
                            <div key={client._id} className="bg-base-200 p-4 rounded-xl shadow-md">
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <h3 className="font-bold text-lg">{client.name}</h3>
                                        {client.companyName && (
                                            <p className="text-sm text-gray-600 dark:text-gray-400">{client.companyName}</p>
                                        )}
                                    </div>
                                </div>
                                
                                <div className="space-y-2 mb-4">
                                    <div className="flex items-center gap-2 text-sm">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                        </svg>
                                        <span className="text-gray-700 dark:text-gray-300">{client.email}</span>
                                    </div>
                                    
                                    {client.phoneNumber && (
                                        <div className="flex items-center gap-2 text-sm">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                            </svg>
                                            <span className="text-gray-700 dark:text-gray-300">{client.phoneNumber}</span>
                                        </div>
                                    )}
                                </div>

                                <div className="flex gap-2">
                                    <Link href={`/clients/${client._id}`} className="flex-1">
                                        <button className="btn btn-sm btn-outline w-full">View</button>
                                    </Link>
                                    <Link href={`/clients/${client._id}/edit`} className="flex-1">
                                        <button className="btn btn-sm btn-outline w-full">Edit</button>
                                    </Link>
                                    <button
                                        onClick={() => handleDelete(client._id, client.name)}
                                        disabled={deletingId === client._id}
                                        className="btn btn-sm btn-outline btn-error"
                                    >
                                        {deletingId === client._id ? "..." : "Delete"}
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