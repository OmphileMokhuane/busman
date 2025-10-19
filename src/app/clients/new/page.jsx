import { getUserFromCookie } from "@/lib/getUser"
import { redirect } from "next/navigation"
import ClientForm from "@/components/clients/ClientForm"
import Link from "next/link"

export default async function Page() {
    const user = await getUserFromCookie()
    
    if (!user) {
        redirect("/login")
    }
    
    return (
        <div className="min-h-screen bg-base-100 p-4 sm:p-6 lg:p-8">
            <div className="max-w-3xl mx-auto">
                {/* Breadcrumb */}
                <div className="text-sm breadcrumbs mb-6">
                    <ul>
                        <li><Link href="/clients" className="text-primary">Clients</Link></li>
                        <li>Add New Client</li>
                    </ul>
                </div>

                {/* Page Header */}
                <div className="mb-8">
                    <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 dark:text-white mb-2">
                        Add New Client
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Enter the client's information below
                    </p>
                </div>
                
                {/* Form Card */}
                <div className="bg-base-200 p-6 sm:p-8 rounded-2xl shadow-md">
                    <ClientForm />
                </div>
            </div>
        </div>
    )
}