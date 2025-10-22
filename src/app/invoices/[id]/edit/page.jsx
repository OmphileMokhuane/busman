import { getUserFromCookie } from "@/lib/getUser"
import { redirect } from "next/navigation"
import { getInvoiceById } from "@/actions/invoiceController"
import { getClients } from "@/actions/clientController"
import InvoiceForm from "@/components/invoices/InvoiceForm"
import Link from "next/link"

export default async function Page({ params }) {
    const user = await getUserFromCookie()
    
    if (!user) {
        redirect("/login")
    }
    
    const { id } = await params
    const invoice = await getInvoiceById(id)
    
    if (!invoice) {
        redirect("/invoices")
    }
    
    const clients = await getClients()
    
    return (
        <div className="min-h-screen bg-base-100 p-4 sm:p-6 lg:p-8">
            <div className="max-w-5xl mx-auto">
                {/* Breadcrumb */}
                <div className="text-sm breadcrumbs mb-6">
                    <ul>
                        <li><Link href="/invoices" className="text-primary">Invoices</Link></li>
                        <li><Link href={`/invoices/${invoice._id}`} className="text-primary">{invoice.invoiceNumber}</Link></li>
                        <li>Edit</li>
                    </ul>
                </div>

                {/* Page Header */}
                <div className="mb-8">
                    <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 dark:text-white mb-2">
                        Edit Invoice
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Update {invoice.invoiceNumber}
                    </p>
                </div>
                
                {/* Form - Pass invoice prop for edit mode */}
                <InvoiceForm clients={clients} invoice={invoice} />
            </div>
        </div>
    )
}