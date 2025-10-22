import { getUserFromCookie } from "@/lib/getUser"
import { redirect } from "next/navigation"
import { getQuotationById } from "../../../actions/quotationsController"
import QuotationPreview from "@/components/quotations/QuotationPreview"
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
    
    return (
        <div className="min-h-screen bg-base-100 p-4 sm:p-6 lg:p-8">
            <div className="max-w-5xl mx-auto">
                {/* Breadcrumb */}
                <div className="text-sm breadcrumbs mb-6">
                    <ul>
                        <li><Link href="/quotations" className="text-primary">Quotations</Link></li>
                        <li>{quotation.quotationNumber}</li>
                    </ul>
                </div>

                {/* Page Header */}
                <div className="mb-8">
                    <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 dark:text-white mb-2">
                        Quotation Details
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        View and manage quotation information
                    </p>
                </div>
                
                {/* Quotation Preview Component */}
                <QuotationPreview quotation={quotation} />
            </div>
        </div>
    )
}
