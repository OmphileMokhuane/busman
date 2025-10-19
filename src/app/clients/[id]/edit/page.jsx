import { getUserFromCookie } from "@/lib/getUser"
import { redirect } from "next/navigation"
import { getClientById } from "../../../../actions/clientsController"
import EditClientForm from "@/components/clients/EditClientForm"
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
            <div className="max-w-3xl mx-auto">
                {/* Breadcrumb */}
                <div className="text-sm breadcrumbs mb-6">
                    <ul>
                        <li><Link href="/clients" className="text-primary">Clients</Link></li>
                        <li><Link href={`/clients/${client._id}`} className="text-primary">{client.name}</Link></li>
                        <li>Edit</li>
                    </ul>
                </div>

                {/* Page Header */}
                <div className="mb-8">
                    <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 dark:text-white mb-2">
                        Edit Client
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Update {client.name}'s information
                    </p>
                </div>
                
                {/* Form Card */}
                <div className="bg-base-200 p-6 sm:p-8 rounded-2xl shadow-md">
                    <EditClientForm client={client} />
                </div>
            </div>
        </div>
    )
}