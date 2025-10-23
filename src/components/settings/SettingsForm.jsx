"use client"
import { useActionState, useState } from "react"
import { updateSettings } from "../../actions/settingsController"

export default function SettingsForm({ settings }) {
    const [formState, formAction] = useActionState(updateSettings, {})

    return (
        <form action={formAction} className="space-y-6">
            {/* Success Message */}
            {formState.success && (
                <div role="alert" className="alert alert-success rounded-xl">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 shrink-0 stroke-current" fill="none" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{formState.message || "Settings updated successfully!"}</span>
                </div>
            )}

            {/* General Error */}
            {formState.errors?.general && (
                <div role="alert" className="alert alert-error rounded-xl">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 shrink-0 stroke-current" fill="none" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{formState.errors.general}</span>
                </div>
            )}

            {/* Business Information */}
            <div className="bg-base-300 p-6 rounded-xl">
                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4">
                    Business Information
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    This information will appear on your invoices and quotations
                </p>

                <div className="space-y-4">
                    {/* Business Name */}
                    <div className="form-control">
                        <label htmlFor="businessName" className="label">
                            <span className="label-text font-medium">Business Name</span>
                            <span className="label-text-alt text-gray-500">Optional</span>
                        </label>
                        <input
                            type="text"
                            id="businessName"
                            name="businessName"
                            defaultValue={settings.businessName}
                            placeholder="Your Business Name"
                            className="input input-bordered w-full rounded-lg"
                        />
                    </div>

                    {/* Business Address */}
                    <div className="form-control">
                        <label htmlFor="businessAddress" className="label">
                            <span className="label-text font-medium">Business Address</span>
                            <span className="label-text-alt text-gray-500">Optional</span>
                        </label>
                        <textarea
                            id="businessAddress"
                            name="businessAddress"
                            rows="3"
                            defaultValue={settings.businessAddress}
                            placeholder="Your business address"
                            className="textarea textarea-bordered w-full rounded-lg"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Business Phone */}
                        <div className="form-control">
                            <label htmlFor="businessPhone" className="label">
                                <span className="label-text font-medium">Business Phone</span>
                                <span className="label-text-alt text-gray-500">Optional</span>
                            </label>
                            <input
                                type="tel"
                                id="businessPhone"
                                name="businessPhone"
                                defaultValue={settings.businessPhone}
                                placeholder="011 234 5678"
                                className="input input-bordered w-full rounded-lg"
                            />
                        </div>

                        {/* Business Email */}
                        <div className="form-control">
                            <label htmlFor="businessEmail" className="label">
                                <span className="label-text font-medium">Business Email</span>
                                <span className="label-text-alt text-gray-500">Optional</span>
                            </label>
                            <input
                                type="email"
                                id="businessEmail"
                                name="businessEmail"
                                defaultValue={settings.businessEmail}
                                placeholder="info@business.com"
                                className="input input-bordered w-full rounded-lg"
                            />
                            {formState.errors?.businessEmail && (
                                <label className="label">
                                    <span className="label-text-alt text-error">{formState.errors.businessEmail}</span>
                                </label>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Invoice Settings */}
            <div className="bg-base-300 p-6 rounded-xl">
                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4">
                    Invoice Numbering
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Configure how your invoice numbers are generated
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Invoice Prefix */}
                    <div className="form-control">
                        <label htmlFor="invoicePrefix" className="label">
                            <span className="label-text font-medium">Invoice Prefix</span>
                        </label>
                        <input
                            type="text"
                            id="invoicePrefix"
                            name="invoicePrefix"
                            defaultValue={settings.invoicePrefix}
                            placeholder="INV"
                            className="input input-bordered w-full rounded-lg uppercase"
                        />
                        {formState.errors?.invoicePrefix && (
                            <label className="label">
                                <span className="label-text-alt text-error">{formState.errors.invoicePrefix}</span>
                            </label>
                        )}
                        <label className="label">
                            <span className="label-text-alt text-gray-500">Example: {settings.invoicePrefix || "INV"}-2025-001</span>
                        </label>
                    </div>

                    {/* Invoice Start Number */}
                    <div className="form-control">
                        <label htmlFor="invoiceStartNumber" className="label">
                            <span className="label-text font-medium">Start From Number</span>
                        </label>
                        <input
                            type="number"
                            id="invoiceStartNumber"
                            name="invoiceStartNumber"
                            defaultValue={settings.invoiceStartNumber}
                            min="1"
                            max="999999"
                            className="input input-bordered w-full rounded-lg"
                        />
                        {formState.errors?.invoiceStartNumber && (
                            <label className="label">
                                <span className="label-text-alt text-error">{formState.errors.invoiceStartNumber}</span>
                            </label>
                        )}
                        <label className="label">
                            <span className="label-text-alt text-gray-500">
                                Current: {settings.invoiceCurrentNumber || settings.invoiceStartNumber}
                            </span>
                        </label>
                    </div>
                </div>
            </div>

            {/* Quotation Settings */}
            <div className="bg-base-300 p-6 rounded-xl">
                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4">
                    Quotation Numbering
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Configure how your quotation numbers are generated
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Quotation Prefix */}
                    <div className="form-control">
                        <label htmlFor="quotationPrefix" className="label">
                            <span className="label-text font-medium">Quotation Prefix</span>
                        </label>
                        <input
                            type="text"
                            id="quotationPrefix"
                            name="quotationPrefix"
                            defaultValue={settings.quotationPrefix}
                            placeholder="QUO"
                            className="input input-bordered w-full rounded-lg uppercase"
                        />
                        {formState.errors?.quotationPrefix && (
                            <label className="label">
                                <span className="label-text-alt text-error">{formState.errors.quotationPrefix}</span>
                            </label>
                        )}
                        <label className="label">
                            <span className="label-text-alt text-gray-500">Example: {settings.quotationPrefix || "QUO"}-2025-001</span>
                        </label>
                    </div>

                    {/* Quotation Start Number */}
                    <div className="form-control">
                        <label htmlFor="quotationStartNumber" className="label">
                            <span className="label-text font-medium">Start From Number</span>
                        </label>
                        <input
                            type="number"
                            id="quotationStartNumber"
                            name="quotationStartNumber"
                            defaultValue={settings.quotationStartNumber}
                            min="1"
                            max="999999"
                            className="input input-bordered w-full rounded-lg"
                        />
                        {formState.errors?.quotationStartNumber && (
                            <label className="label">
                                <span className="label-text-alt text-error">{formState.errors.quotationStartNumber}</span>
                            </label>
                        )}
                        <label className="label">
                            <span className="label-text-alt text-gray-500">
                                Current: {settings.quotationCurrentNumber || settings.quotationStartNumber}
                            </span>
                        </label>
                    </div>
                </div>
            </div>

            {/* Default Values */}
            <div className="bg-base-300 p-6 rounded-xl">
                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4">
                    Default Values
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Set default values for new invoices and quotations
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Default Tax Rate */}
                    <div className="form-control">
                        <label htmlFor="defaultTaxRate" className="label">
                            <span className="label-text font-medium">Default Tax Rate (%)</span>
                        </label>
                        <input
                            type="number"
                            id="defaultTaxRate"
                            name="defaultTaxRate"
                            defaultValue={settings.defaultTaxRate}
                            min="0"
                            max="100"
                            step="0.01"
                            className="input input-bordered w-full rounded-lg"
                        />
                        {formState.errors?.defaultTaxRate && (
                            <label className="label">
                                <span className="label-text-alt text-error">{formState.errors.defaultTaxRate}</span>
                            </label>
                        )}
                        <label className="label">
                            <span className="label-text-alt text-gray-500">VAT rate (e.g., 15 for 15%)</span>
                        </label>
                    </div>

                    {/* Default Payment Terms */}
                    <div className="form-control">
                        <label htmlFor="defaultPaymentTerms" className="label">
                            <span className="label-text font-medium">Default Payment Terms (Days)</span>
                        </label>
                        <input
                            type="number"
                            id="defaultPaymentTerms"
                            name="defaultPaymentTerms"
                            defaultValue={settings.defaultPaymentTerms}
                            min="1"
                            max="365"
                            className="input input-bordered w-full rounded-lg"
                        />
                        {formState.errors?.defaultPaymentTerms && (
                            <label className="label">
                                <span className="label-text-alt text-error">{formState.errors.defaultPaymentTerms}</span>
                            </label>
                        )}
                        <label className="label">
                            <span className="label-text-alt text-gray-500">Days until payment is due</span>
                        </label>
                    </div>
                </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end pt-4">
                <button
                    type="submit"
                    className="btn btn-primary rounded-lg px-8"
                >
                    Save Settings
                </button>
            </div>
        </form>
    )
}