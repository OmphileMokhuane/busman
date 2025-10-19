"use server"
import Link from "next/link";
import { getUserFromCookie } from "@/lib/getUser";
import { logout } from "@/actions/userController";
import MobileMenu from "./MobileMenu";

export default async function Header() {
  const user = await getUserFromCookie();

  return (
    <header className="bg-base-100 shadow-sm sticky top-0 z-40 border-b border-base-200">
		<nav className="container mx-auto px-4 sm:px-6 lg:px-8">
			<div className="flex items-center justify-between h-16 md:h-20">
			{/* Brand Logo */}
			<div className="flex-shrink-0 min-w-0">
				<Link
				href="/"
				className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl font-bold text-primary hover:text-primary/80 transition-colors duration-200 truncate block"
				>
				Business Management
				</Link>
			</div>

			{/* Desktop Navigation - Hidden on mobile/tablet */}
			<div className="hidden lg:flex items-center space-x-1 xl:space-x-2">
				{user ? (
				<>
					<Link
					href="/"
					className="px-2 xl:px-3 py-2 rounded-lg text-sm xl:text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-primary/10 hover:text-primary transition-all duration-200 whitespace-nowrap"
					>
					Dashboard
					</Link>
					<Link
					href="/clients"
					className="px-2 xl:px-3 py-2 rounded-lg text-sm xl:text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-primary/10 hover:text-primary transition-all duration-200 whitespace-nowrap"
					>
					Clients
					</Link>
					<Link
					href="/quotations"
					className="px-2 xl:px-3 py-2 rounded-lg text-sm xl:text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-primary/10 hover:text-primary transition-all duration-200 whitespace-nowrap"
					>
					Quotations
					</Link>
					<Link
					href="/invoices"
					className="px-2 xl:px-3 py-2 rounded-lg text-sm xl:text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-primary/10 hover:text-primary transition-all duration-200 whitespace-nowrap"
					>
					Invoices
					</Link>
					<Link
					href="/pumps"
					className="px-2 xl:px-3 py-2 rounded-lg text-sm xl:text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-primary/10 hover:text-primary transition-all duration-200 whitespace-nowrap"
					>
					Pumps
					</Link>
					<form action={logout} className="ml-1 xl:ml-2">
					<button
						type="submit"
						className="btn btn-primary btn-sm xl:btn-md rounded-full px-3 xl:px-5 text-white font-medium hover:shadow-lg transition-all duration-200 whitespace-nowrap"
					>
						Log Out
					</button>
					</form>
				</>
				) : (
				<Link
					href="/login"
					className="btn btn-primary btn-sm xl:btn-md rounded-full px-3 xl:px-5 text-white font-medium hover:shadow-lg transition-all duration-200 whitespace-nowrap"
				>
					Log In
				</Link>
				)}
			</div>

			{/* Mobile Menu Component */}
			<MobileMenu user={user} />
			</div>
		</nav>
    </header>
  );
}