"use client"
import Link from "next/link"
import { useActionState, useEffect, useState } from "react"
import { updateClient } from "../../actions/clientsController"

export default function EditClientForm({ client }) {
    const [formState, formAction] = useActionState(
        updateClient.bind(null, client._id),
        {}
    )
    const [showAddressField, setShowAddressField] = useState(!!client.companyName)

    const handleCompanyNameChange = (e) => {
        setShowAddressField(e.target.value.trim().length > 0)
    }

    return (
        <form action={formAction} className="space-y-6">
            {/* General Error */}
            {formState.errors?.general && (
                <div role="alert" className="alert alert-error rounded-xl">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 shrink-0 stroke-current" fill="none" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{formState.errors.general}</span>
                </div>
            )}

            {/* Name - Required */}
            <div className="form-control">
                <label htmlFor="name" className="label">
                    <span className="label-text font-medium">
                        Client Name <span className="text-error">*</span>
                    </span>
                </label>
                <input
                    type="text"
                    id="name"
                    name="name"
                    defaultValue={client.name}
                    placeholder="Enter client's full name"
                    className="input input-bordered w-full focus:outline-none focus:ring-2 focus:ring-primary transition rounded-lg"
                    autoFocus
                />
                {formState.errors?.name && (
                    <div role="alert" className="alert alert-warning mt-2 flex items-center gap-2 rounded-xl">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 shrink-0 stroke-current" fill="none" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <span>{formState.errors.name}</span>
                    </div>
                )}
            </div>

            {/* Email - Required */}
            <div className="form-control">
                <label htmlFor="email" className="label">
                    <span className="label-text font-medium">
                        Email Address <span className="text-error">*</span>
                    </span>
                </label>
                <input
                    type="email"
                    id="email"
                    name="email"
                    defaultValue={client.email}
                    placeholder="client@example.com"
                    className="input input-bordered w-full focus:outline-none focus:ring-2 focus:ring-primary transition rounded-lg"
                />
                {formState.errors?.email && (
                    <div role="alert" className="alert alert-warning mt-2 flex items-center gap-2 rounded-xl">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 shrink-0 stroke-current" fill="none" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <span>{formState.errors.email}</span>
                    </div>
                )}
            </div>

            {/* Phone Number - Optional */}
            <div className="form-control">
                <label htmlFor="phoneNumber" className="label">
                    <span className="label-text font-medium">Phone Number</span>
                    <span className="label-text-alt text-gray-500">Optional</span>
                </label>
                <input
                    type="tel"
                    id="phoneNumber"
                    name="phoneNumber"
                    defaultValue={client.phoneNumber || ""}
                    placeholder="e.g., 011 234 5678"
                    className="input input-bordered w-full focus:outline-none focus:ring-2 focus:ring-primary transition rounded-lg"
                />
                {formState.errors?.phoneNumber && (
                    <div role="alert" className="alert alert-warning mt-2 flex items-center gap-2 rounded-xl">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 shrink-0 stroke-current" fill="none" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <span>{formState.errors.phoneNumber}</span>
                    </div>
                )}
            </div>

            {/* Company Name - Optional */}
            <div className="form-control">
                <label htmlFor="companyName" className="label">
                    <span className="label-text font-medium">Company Name</span>
                    <span className="label-text-alt text-gray-500">Optional</span>
                </label>
                <input
                    type="text"
                    id="companyName"
                    name="companyName"
                    defaultValue={client.companyName || ""}
                    placeholder="Enter company name"
                    onChange={handleCompanyNameChange}
                    className="input input-bordered w-full focus:outline-none focus:ring-2 focus:ring-primary transition rounded-lg"
                />
                {formState.errors?.companyName && (
                    <div role="alert" className="alert alert-warning mt-2 flex items-center gap-2 rounded-xl">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 shrink-0 stroke-current" fill="none" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <span>{formState.errors.companyName}</span>
                    </div>
                )}
                {showAddressField && (
                    <label className="label">
                        <span className="label-text-alt text-info">
                            💡 Company address is required when company name is provided
                        </span>
                    </label>
                )}
            </div>

            {/* Company Address - Required if Company Name provided */}
            {showAddressField && (
                <div className="form-control">
                    <label htmlFor="companyAddress" className="label">
                        <span className="label-text font-medium">
                            Company Address <span className="text-error">*</span>
                        </span>
                    </label>
                    <textarea
                        id="companyAddress"
                        name="companyAddress"
                        rows="3"
                        defaultValue={client.companyAddress || ""}
                        placeholder="Enter full company address"
                        className="textarea textarea-bordered w-full focus:outline-none focus:ring-2 focus:ring-primary transition rounded-lg"
                    />
                    {formState.errors?.companyAddress && (
                        <div role="alert" className="alert alert-warning mt-2 flex items-center gap-2 rounded-xl">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 shrink-0 stroke-current" fill="none" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            <span>{formState.errors.companyAddress}</span>
                        </div>
                    )}
                </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <button
                    type="submit"
                    className="btn btn-primary rounded-lg px-8 flex-1 sm:flex-none"
                >
                    Save Changes
                </button>
                <Link
                    href={`/clients/${client._id}`}
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
    )
}