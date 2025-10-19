"use server"
import { getUserFromCookie} from "@/lib/getUser"
import { redirect } from "next/navigation"
import { getClients } from "../../actions/clientsController"
import ClientList from "@/components/clients/ClientList"

export default async function Page() {
    const user = await getUserFromCookie()

    if(!user) {
        return redirect("/")
    }

    const clients = await getClients()

    return (
        <>
            <div className="min-h-screen bg-base-100 p-4 sm:p-6 lg:p-8">
                <div className="max-w-7xl mx-auto">
                    {/* Page Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 dark:text-white mb-2">
                            Clients
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400">
                            Manage your clients database
                        </p>
                    </div>

                    {/* Client List Component */}
                    <ClientList clients={clients} />
                </div>
            </div>
        </>
    )
}