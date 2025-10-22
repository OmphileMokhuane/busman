import { getUserFromCookie } from "@/lib/getUser"
import { redirect } from "next/navigation"
import { getQuotationById } from "../../../../actions/quotationsController"
import { getClients } from "../../../../actions/clientsController"
import QuotationForm from "@/components/quotations/QuotationForm"
import Link from "next/link"

export default async function Page({ params }) {
    const user = await getUserFromCookie()
    
    if (!user) {
        redirect("/login")
    }
    
    const { id } = await params
    const quotation = await getQuotationById(id)
    
    if (!quotation) {
        redirect("/quotations")
    }
    
    const clients = await getClients()
    
    return (
        <div className="min-h-screen bg-base-100 p-4 sm:p-6 lg:p-8">
            <div className="max-w-5xl mx-auto">
                {/* Breadcrumb */}
                <div className="text-sm breadcrumbs mb-6">
                    <ul>
                        <li><Link href="/quotations" className="text-primary">Quotations</Link></li>
                        <li><Link href={`/quotations/${quotation._id}`} className="text-primary">{quotation.quotationNumber}</Link></li>
                        <li>Edit</li>
                    </ul>
                </div>

                {/* Page Header */}
                <div className="mb-8">
                    <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 dark:text-white mb-2">
                        Edit Quotation
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Update {quotation.quotationNumber}
                    </p>
                </div>
                
                {/* Form - Pass quotation prop for edit mode */}
                <QuotationForm clients={clients} quotation={quotation} />
            </div>
        </div>
    )
}