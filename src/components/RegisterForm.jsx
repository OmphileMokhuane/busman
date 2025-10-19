"use client";
import { useActionState } from "react";
import { register } from "../actions/userController";
import Link from "next/link";

export default function RegisterForm() {
    const [formState, formAction] = useActionState(register, {})
    
    return (
        <>
            <form action={formAction} className="w-full flex flex-col gap-4">
                {/* Username */}
                <div className="form-control">
                    <label htmlFor="username" className="label">
                        <span className="label-text font-medium">Username</span>
                    </label>
                    <input
                        type="text"
                        autoComplete="off"
                        id="username"
                        name="username"
                        placeholder="Enter your username"
                        className="input input-bordered w-full focus:outline-none focus:ring-2 focus:ring-primary transition rounded-full"
                    />
                    {formState.errors?.username && (
                        <div role="alert" className="alert alert-warning mt-2 flex items-center gap-2 rounded-xl">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 shrink-0 stroke-current" fill="none" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            <span>{formState.errors?.username}</span>
                        </div>
                    )}
                </div>

                {/* Password */}
                <div className="form-control">
                    <label htmlFor="password" className="label">
                        <span className="label-text font-medium">Password</span>
                    </label>
                    <input
                        type="password"
                        autoComplete="off"
                        id="password"
                        name="password"
                        placeholder="Enter your password"
                        className="input input-bordered w-full focus:outline-none focus:ring-2 focus:ring-primary transition rounded-full"
                    />
                    {formState.errors?.password && (
                        <div role="alert" className="alert alert-warning mt-2 flex items-center gap-2 rounded-xl">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 shrink-0 stroke-current" fill="none" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            <span>{formState.errors?.password}</span>
                        </div>
                    )}
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    className="btn btn-primary w-full rounded-full mt-2 text-white font-semibold hover:shadow-lg transition-all duration-200"
                >
                    Register
                </button>
            </form>

            {/* Login Link */}
            <div className="text-center mt-6">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                    Already have an account?{" "}
                    <Link href="/login" className="text-primary font-semibold hover:underline">
                        Log in
                    </Link>
                </p>
            </div>
        </>
    )
}