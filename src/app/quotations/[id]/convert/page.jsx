import { getUserFromCookie } from "@/lib/getUser"
import { redirect } from "next/navigation"
import { getQuotationById } from "../../../../actions/quotationsController"
import ConvertToInvoiceForm from "@/components/quotations/ConvertToInvoiceForm"
import Link from "next/link"
import { getCollection } from "@/lib/db"
import { ObjectId } from "mongodb"

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
    
    // Check if quotation has already been converted
    const invoicesCollection = await getCollection("invoices")
    const existingInvoice = await invoicesCollection.findOne({
        quotationId: ObjectId.createFromHexString(id)
    })
    
    if (existingInvoice) {
        // Already converted, redirect to the invoice
        redirect(`/invoices/${existingInvoice._id.toString()}`)
    }
    
    return (
        <div className="min-h-screen bg-base-100 p-4 sm:p-6 lg:p-8">
            <div className="max-w-3xl mx-auto">
                {/* Breadcrumb */}
                <div className="text-sm breadcrumbs mb-6">
                    <ul>
                        <li><Link href="/quotations" className="text-primary">Quotations</Link></li>
                        <li><Link href={`/quotations/${quotation._id}`} className="text-primary">{quotation.quotationNumber}</Link></li>
                        <li>Convert to Invoice</li>
                    </ul>
                </div>

                {/* Page Header */}
                <div className="mb-8">
                    <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 dark:text-white mb-2">
                        Convert to Invoice
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Convert {quotation.quotationNumber} to an invoice
                    </p>
                </div>
                
                {/* Convert Form Component */}
                <ConvertToInvoiceForm quotation={quotation} />
            </div>
        </div>
    )
}