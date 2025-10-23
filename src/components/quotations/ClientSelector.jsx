"use client"

export default function ClientSelector({ clients, selectedClientId, onChange, error }) {
    return (
        <div className="form-control">
            <label htmlFor="clientId" className="label mb-1">
                <span className="label-text font-medium">
                    Select Client <span className="text-error">*</span>
                </span>
            </label>
            <select
                id="clientId"
                name="clientId"
                value={selectedClientId}
                onChange={(e) => onChange(e.target.value)}
                className="select select-bordered w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-primary px-2"
            >
                <option value="">-- Choose a client --</option>
                {clients.map((client) => (
                    <option key={client._id} value={client._id}>
                        {client.name} {client.companyName && `(${client.companyName})`}
                    </option>
                ))}
            </select>
            {error && (
                <div role="alert" className="alert alert-warning mt-2 flex items-center gap-2 rounded-xl">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 shrink-0 stroke-current" fill="none" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <span>{error}</span>
                </div>
            )}
        </div>
    )
}