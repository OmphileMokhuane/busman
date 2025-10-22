import { getUserFromCookie } from "@/lib/getUser"
import { redirect } from "next/navigation"
import { getQuotations } from "../../actions/quotationsController"
import { getClients } from "../../actions/clientsController"
import QuotationList from "@/components/quotations/QuotationList"

export default async function Page() {
    const user = await getUserFromCookie()
    
    if (!user) {
        redirect("/login")
    }
    
    const quotations = await getQuotations()
    const clients = await getClients()
    
    return (
        <div className="min-h-screen bg-base-100 p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
                {/* Page Header */}
                <div className="mb-8">
                    <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 dark:text-white mb-2">
                        Quotations
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Manage your quotations and proposals
                    </p>
                </div>
                
                {/* Quotation List Component */}
                <QuotationList quotations={quotations} clients={clients} />
            </div>
        </div>
    )
}