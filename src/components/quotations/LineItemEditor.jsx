"use client"
import { useState } from "react"

export default function LineItemEditor({ items, setItems }) {
    const addItem = () => {
        setItems([
            ...items,
            { description: "", quantity: 1, unitPrice: 0 }
        ])
    }

    const removeItem = (index) => {
        setItems(items.filter((_, i) => i !== index))
    }

    const updateItem = (index, field, value) => {
        const newItems = [...items]
        newItems[index] = {
            ...newItems[index],
            [field]: value
        }
        setItems(newItems)
    }

    const calculateItemTotal = (item) => {
        return (parseFloat(item.quantity) || 0) * (parseFloat(item.unitPrice) || 0)
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                    Line Items
                </h3>
                <button
                    type="button"
                    onClick={addItem}
                    className="btn btn-sm btn-primary rounded-lg"
                >
                    + Add Item
                </button>
            </div>

            {items.length === 0 ? (
                <div className="bg-base-300 p-8 rounded-xl text-center text-gray-500 dark:text-gray-400">
                    No items added. Click "Add Item" to start.
                </div>
            ) : (
                <div className="space-y-3">
                    {items.map((item, index) => (
                        <div key={index} className="bg-base-300 p-4 rounded-xl">
                            <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                                {/* Description */}
                                <div className="md:col-span-5">
                                    <label className="label">
                                        <span className="label-text text-xs">Description</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={item.description}
                                        onChange={(e) => updateItem(index, "description", e.target.value)}
                                        placeholder="Item description"
                                        className="input input-sm input-bordered w-full rounded-lg"
                                    />
                                </div>

                                {/* Quantity */}
                                <div className="md:col-span-2">
                                    <label className="label">
                                        <span className="label-text text-xs">Quantity</span>
                                    </label>
                                    <input
                                        type="number"
                                        value={item.quantity}
                                        onChange={(e) => updateItem(index, "quantity", e.target.value)}
                                        min="0"
                                        step="0.01"
                                        className="input input-sm input-bordered w-full rounded-lg"
                                    />
                                </div>

                                {/* Unit Price */}
                                <div className="md:col-span-2">
                                    <label className="label">
                                        <span className="label-text text-xs">Unit Price (R)</span>
                                    </label>
                                    <input
                                        type="number"
                                        value={item.unitPrice}
                                        onChange={(e) => updateItem(index, "unitPrice", e.target.value)}
                                        min="0"
                                        step="0.01"
                                        className="input input-sm input-bordered w-full rounded-lg"
                                    />
                                </div>

                                {/* Total */}
                                <div className="md:col-span-2">
                                    <label className="label">
                                        <span className="label-text text-xs">Total</span>
                                    </label>
                                    <div className="flex items-center h-8 px-3 bg-base-100 rounded-lg font-semibold">
                                        R {calculateItemTotal(item).toFixed(2)}
                                    </div>
                                </div>

                                {/* Remove Button */}
                                <div className="md:col-span-1 flex items-end">
                                    <button
                                        type="button"
                                        onClick={() => removeItem(index)}
                                        className="btn btn-sm btn-ghost btn-circle text-error hover:bg-error/10"
                                        title="Remove item"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}