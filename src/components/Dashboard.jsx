import Link from "next/link";
import { getClients } from "../actions/clientsController"

async function getStats(id) {
    
}

export default async function Dashboard(props) {
    const stats = await getStats(props.user.userId)
    const client = await getClients()
    return (
        <div className="min-h-screen bg-base-100 p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
                {/* Dashboard Header */}
                <div className="mb-8">
                    <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 dark:text-white mb-2">
                        Dashboard
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Here's an overview of your business.
                    </p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
                    {/* Clients Card */}
                    <Link href="/clients">
                        <div className="bg-base-200 p-6 rounded-2xl shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105 cursor-pointer border-2 border-transparent hover:border-primary">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-3 bg-primary/10 rounded-lg">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                </div>
                            </div>
                            <h3 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white mb-1">
                                0
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">
                                Total Clients
                            </p>
                        </div>
                    </Link>

                    {/* Quotations Card */}
                    <Link href="/quotations">
                        <div className="bg-base-200 p-6 rounded-2xl shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105 cursor-pointer border-2 border-transparent hover:border-primary">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-3 bg-blue-500/10 rounded-lg">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                </div>
                            </div>
                            <h3 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white mb-1">
                                0
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">
                                Active Quotations
                            </p>
                        </div>
                    </Link>

                    {/* Invoices Card */}
                    <Link href="/invoices">
                        <div className="bg-base-200 p-6 rounded-2xl shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105 cursor-pointer border-2 border-transparent hover:border-primary">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-3 bg-green-500/10 rounded-lg">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" />
                                    </svg>
                                </div>
                            </div>
                            <h3 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white mb-1">
                                0
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">
                                Pending Invoices
                            </p>
                        </div>
                    </Link>

                    {/* Pumps Card */}
                    <Link href="/pumps">
                        <div className="bg-base-200 p-6 rounded-2xl shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105 cursor-pointer border-2 border-transparent hover:border-primary">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-3 bg-orange-500/10 rounded-lg">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                                    </svg>
                                </div>
                            </div>
                            <h3 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white mb-1">
                                0
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">
                                Pumps Inventory
                            </p>
                        </div>
                    </Link>
                </div>

                {/* Quick Actions */}
                <div className="bg-base-200 p-6 rounded-2xl shadow-md mb-8">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
                        Quick Actions
                    </h2>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                        <Link href="/clients">
                            <button className="btn btn-outline btn-primary w-full">
                                + New Client
                            </button>
                        </Link>
                        <Link href="/quotations">
                            <button className="btn btn-outline btn-primary w-full">
                                + New Quotation
                            </button>
                        </Link>
                        <Link href="/invoices">
                            <button className="btn btn-outline btn-primary w-full">
                                + New Invoice
                            </button>
                        </Link>
                        <Link href="/pumps">
                            <button className="btn btn-outline btn-primary w-full">
                                + Add Pump
                            </button>
                        </Link>
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Recent Quotations */}
                    <div className="bg-base-200 p-6 rounded-2xl shadow-md">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                                Recent Quotations
                            </h2>
                            <Link href="/quotations" className="text-primary text-sm font-medium hover:underline">
                                View All
                            </Link>
                        </div>
                        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                            No quotations yet. Create your first one!
                        </div>
                    </div>

                    {/* Recent Invoices */}
                    <div className="bg-base-200 p-6 rounded-2xl shadow-md">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                                Recent Invoices
                            </h2>
                            <Link href="/invoices" className="text-primary text-sm font-medium hover:underline">
                                View All
                            </Link>
                        </div>
                        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                            No invoices yet. Create your first one!
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}