import { getUserFromCookie } from "@/lib/getUser"
import { redirect } from "next/navigation"
import { getClientById } from "../../../actions/clientsController"
import ClientCard from "@/components/clients/ClientCard"
import Link from "next/link"

export default async function Page({ params }) {
    const user = await getUserFromCookie()
    
    if (!user) {
        redirect("/login")
    }
    
    const { id } = await params
    const client = await getClientById(id)
    
    if (!client) {
        redirect("/clients")
    }
    
    return (
        <div className="min-h-screen bg-base-100 p-4 sm:p-6 lg:p-8">
            <div className="max-w-5xl mx-auto">
                {/* Breadcrumb */}
                <div className="text-sm breadcrumbs mb-6">
                    <ul>
                        <li><Link href="/clients" className="text-primary">Clients</Link></li>
                        <li>{client.name}</li>
                    </ul>
                </div>

                {/* Page Header */}
                <div className="mb-8">
                    <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 dark:text-white mb-2">
                        Client Details
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        View and manage client information
                    </p>
                </div>
                
                {/* Client Card Component */}
                <ClientCard client={client} />
            </div>
        </div>
    )
}