import { getUserFromCookie } from "@/lib/getUser"
import { redirect } from "next/navigation"
import { getClients } from "../../../actions/clientsController"
import QuotationForm from "@/components/quotations/QuotationForm"
import Link from "next/link"

export default async function Page() {
    const user = await getUserFromCookie()
    
    if (!user) {
        redirect("/login")
    }
    
    const clients = await getClients()
    
    // Check if user has clients
    if (clients.length === 0) {
        return (
            <div className="min-h-screen bg-base-100 p-4 sm:p-6 lg:p-8">
                <div className="max-w-3xl mx-auto">
                    <div className="bg-base-200 p-8 rounded-2xl shadow-md text-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto mb-4 text-warning" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
                            No Clients Found
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                            You need to add at least one client before creating a quotation.
                        </p>
                        <div className="flex gap-3 justify-center">
                            <Link href="/clients/new">
                                <button className="btn btn-primary rounded-lg">
                                    Add Client
                                </button>
                            </Link>
                            <Link href="/quotations">
                                <button className="btn btn-outline rounded-lg">
                                    Back to Quotations
                                </button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
    
    return (
        <div className="min-h-screen bg-base-100 p-4 sm:p-6 lg:p-8">
            <div className="max-w-5xl mx-auto">
                {/* Breadcrumb */}
                <div className="text-sm breadcrumbs mb-6">
                    <ul>
                        <li><Link href="/quotations" className="text-primary">Quotations</Link></li>
                        <li>New Quotation</li>
                    </ul>
                </div>

                {/* Page Header */}
                <div className="mb-8">
                    <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 dark:text-white mb-2">
                        Create New Quotation
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Fill in the details below to create a quotation
                    </p>
                </div>
                
                {/* Form */}
                <QuotationForm clients={clients} />
            </div>
        </div>
    )
}