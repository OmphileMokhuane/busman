"use client";
import { useState } from "react";
import Link from "next/link";
import { logout } from "@/actions/userController";

export default function MobileMenu({ user }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = () => setMenuOpen(false);

  return (
    <>
      {/* Mobile/Tablet Menu Button */}
      <div className="lg:hidden">
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="btn btn-ghost btn-sm btn-circle hover:bg-primary/10 transition-colors duration-200"
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 md:h-7 md:w-7"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            {menuOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile/Tablet Dropdown Menu - Portal style */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={closeMenu}
            aria-hidden="true"
          />

          {/* Menu Panel */}
          <div className="fixed top-0 right-0 bottom-0 w-64 sm:w-80 bg-base-100 shadow-2xl transform transition-transform duration-300 ease-out overflow-y-auto">
            {/* Close Button */}
            <div className="flex justify-end p-4 border-b border-base-200">
              <button
                onClick={closeMenu}
                className="btn btn-ghost btn-sm btn-circle"
                aria-label="Close menu"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Menu Content */}
            <div className="p-4 space-y-2">
              {user ? (
                <>
                  <Link
                    href="/"
                    onClick={closeMenu}
                    className="block px-4 py-3 rounded-lg text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-primary/10 hover:text-primary transition-all duration-200"
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/clients"
                    onClick={closeMenu}
                    className="block px-4 py-3 rounded-lg text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-primary/10 hover:text-primary transition-all duration-200"
                  >
                    Clients
                  </Link>
                  <Link
                    href="/quotations"
                    onClick={closeMenu}
                    className="block px-4 py-3 rounded-lg text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-primary/10 hover:text-primary transition-all duration-200"
                  >
                    Quotations
                  </Link>
                  <Link
                    href="/invoices"
                    onClick={closeMenu}
                    className="block px-4 py-3 rounded-lg text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-primary/10 hover:text-primary transition-all duration-200"
                  >
                    Invoices
                  </Link>
                  <Link
                    href="/pumps"
                    onClick={closeMenu}
                    className="block px-4 py-3 rounded-lg text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-primary/10 hover:text-primary transition-all duration-200"
                  >
                    Pumps
                  </Link>
                  <div className="pt-4 mt-4 border-t border-base-200">
                    <form action={logout}>
                      <button
                        type="submit"
                        onClick={closeMenu}
                        className="w-full btn btn-primary rounded-full text-white font-medium hover:shadow-lg transition-all duration-200"
                      >
                        Log Out
                      </button>
                    </form>
                  </div>
                </>
              ) : (
                <div className="pt-2">
                  <Link
                    href="/login"
                    onClick={closeMenu}
                    className="block w-full btn btn-primary rounded-full text-center text-white font-medium hover:shadow-lg transition-all duration-200"
                  >
                    Log In
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}