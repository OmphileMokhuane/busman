"use client"
import { useActionState, useState } from "react"
import { recordPayment } from "@/actions/invoiceController"
import Link from "next/link"

export default function PaymentForm({ invoice }) {
    const [formState, formAction] = useActionState(
        recordPayment.bind(null, invoice._id),
        {}
    )

    const today = new Date().toISOString().split('T')[0]
    const [paymentDate, setPaymentDate] = useState(today)
    const [amount, setAmount] = useState(invoice.balance.toFixed(2))
    const [paymentMethod, setPaymentMethod] = useState("")

    const formatCurrency = (amount) => {
        return `R ${parseFloat(amount).toFixed(2)}`
    }

    const handleAmountChange = (e) => {
        const value = e.target.value
        // Allow empty or valid number
        if (value === "" || !isNaN(value)) {
            setAmount(value)
        }
    }

    const setFullBalance = () => {
        setAmount(invoice.balance.toFixed(2))
    }

    return (
        <div className="space-y-6">
            {/* Invoice Summary */}
            <div className="bg-base-200 p-6 rounded-xl">
                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4">
                    Invoice Summary
                </h3>
                <div className="space-y-3">
                    <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Invoice Number:</span>
                        <span className="font-semibold text-gray-800 dark:text-white">
                            {invoice.invoiceNumber}
                        </span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Client:</span>
                        <span className="font-semibold text-gray-800 dark:text-white">
                            {invoice.client.name}
                        </span>
                    </div>
                    <div className="flex justify-between text-lg border-t border-base-300 pt-3">
                        <span className="font-bold text-gray-800 dark:text-white">Total Invoice Amount:</span>
                        <span className="font-bold text-gray-800 dark:text-white">
                            {formatCurrency(invoice.total)}
                        </span>
                    </div>
                    {invoice.amountPaid > 0 && (
                        <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Amount Already Paid:</span>
                            <span className="font-semibold text-success">
                                {formatCurrency(invoice.amountPaid)}
                            </span>
                        </div>
                    )}
                    <div className="flex justify-between text-xl border-t border-base-300 pt-3">
                        <span className="font-bold text-gray-800 dark:text-white">Balance Due:</span>
                        <span className="font-bold text-warning">
                            {formatCurrency(invoice.balance)}
                        </span>
                    </div>
                </div>
            </div>

            {/* Payment Form */}
            <form action={formAction} className="bg-base-300 p-6 rounded-xl space-y-6">
                {/* General Error */}
                {formState.errors?.general && (
                    <div role="alert" className="alert alert-error rounded-xl">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 shrink-0 stroke-current" fill="none" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>{formState.errors.general}</span>
                    </div>
                )}

                {/* Success Message */}
                {formState.success && (
                    <div role="alert" className="alert alert-success rounded-xl">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 shrink-0 stroke-current" fill="none" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>Payment recorded successfully!</span>
                    </div>
                )}

                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                    Payment Details
                </h3>

                {/* Payment Amount */}
                <div className="form-control">
                    <label htmlFor="amount" className="label">
                        <span className="label-text font-medium">
                            Payment Amount <span className="text-error">*</span>
                        </span>
                    </label>
                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">
                                R
                            </span>
                            <input
                                type="number"
                                id="amount"
                                name="amount"
                                value={amount}
                                onChange={handleAmountChange}
                                min="0.01"
                                max={invoice.balance}
                                step="0.01"
                                placeholder="0.00"
                                className="input input-bordered w-full pl-8 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                        </div>
                        <button
                            type="button"
                            onClick={setFullBalance}
                            className="btn btn-outline rounded-lg whitespace-nowrap"
                        >
                            Full Balance
                        </button>
                    </div>
                    {formState.errors?.amount && (
                        <div role="alert" className="alert alert-warning mt-2 flex items-center gap-2 rounded-xl">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 shrink-0 stroke-current" fill="none" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            <span>{formState.errors.amount}</span>
                        </div>
                    )}
                    <label className="label">
                        <span className="label-text-alt text-gray-500">
                            Maximum: {formatCurrency(invoice.balance)}
                        </span>
                    </label>
                </div>

                {/* Payment Method */}
                <div className="form-control">
                    <label htmlFor="paymentMethod" className="label">
                        <span className="label-text font-medium">
                            Payment Method <span className="text-error">*</span>
                        </span>
                    </label>
                    <select
                        id="paymentMethod"
                        name="paymentMethod"
                        value={paymentMethod}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="select select-bordered w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                        <option value="">-- Select payment method --</option>
                        <option value="Cash">Cash</option>
                        <option value="EFT">EFT (Electronic Funds Transfer)</option>
                        <option value="Credit Card">Credit Card</option>
                        <option value="Debit Card">Debit Card</option>
                        <option value="Cheque">Cheque</option>
                        <option value="Mobile Payment">Mobile Payment</option>
                        <option value="Other">Other</option>
                    </select>
                    {formState.errors?.paymentMethod && (
                        <div role="alert" className="alert alert-warning mt-2 flex items-center gap-2 rounded-xl">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 shrink-0 stroke-current" fill="none" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            <span>{formState.errors.paymentMethod}</span>
                        </div>
                    )}
                </div>

                {/* Payment Date */}
                <div className="form-control">
                    <label htmlFor="paymentDate" className="label">
                        <span className="label-text font-medium">
                            Payment Date <span className="text-error">*</span>
                        </span>
                    </label>
                    <input
                        type="date"
                        id="paymentDate"
                        name="paymentDate"
                        value={paymentDate}
                        onChange={(e) => setPaymentDate(e.target.value)}
                        max={today}
                        className="input input-bordered w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    {formState.errors?.paymentDate && (
                        <div role="alert" className="alert alert-warning mt-2 flex items-center gap-2 rounded-xl">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 shrink-0 stroke-current" fill="none" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            <span>{formState.errors.paymentDate}</span>
                        </div>
                    )}
                </div>

                {/* Calculation Preview */}
                {amount && parseFloat(amount) > 0 && parseFloat(amount) <= invoice.balance && (
                    <div className="bg-base-200 p-4 rounded-lg border-2 border-success">
                        <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-3">
                            After Payment:
                        </h4>
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600 dark:text-gray-400">Current Balance:</span>
                                <span className="font-medium">{formatCurrency(invoice.balance)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600 dark:text-gray-400">Payment Amount:</span>
                                <span className="font-medium text-success">
                                    - {formatCurrency(parseFloat(amount) || 0)}
                                </span>
                            </div>
                            <div className="flex justify-between text-base border-t border-base-300 pt-2">
                                <span className="font-bold">New Balance:</span>
                                <span className={`font-bold ${
                                    (invoice.balance - parseFloat(amount)) === 0 
                                        ? 'text-success' 
                                        : 'text-warning'
                                }`}>
                                    {formatCurrency(invoice.balance - (parseFloat(amount) || 0))}
                                </span>
                            </div>
                            {(invoice.balance - parseFloat(amount)) === 0 && (
                                <div className="flex items-center gap-2 text-success text-sm mt-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span className="font-semibold">Invoice will be marked as PAID</span>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                    <button
                        type="submit"
                        className="btn btn-success rounded-lg px-8 flex-1 sm:flex-none text-white"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Record Payment
                    </button>
                    <Link
                        href={`/invoices/${invoice._id}`}
                        className="btn btn-outline rounded-lg px-8 flex-1 sm:flex-none"
                    >
                        Cancel
                    </Link>
                </div>

                {/* Required Fields Note */}
                <div className="text-sm text-gray-500 dark:text-gray-400 pt-2">
                    <span className="text-error">*</span> Required fields
                </div>
            </form>
        </div>
    )
}