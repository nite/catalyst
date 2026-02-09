import { useState } from "react";
import { FiBarChart2, FiMenu, FiX } from "react-icons/fi";
import { Link, useLocation } from "react-router-dom";
import { useHeader } from "./HeaderContext";

export default function Layout({ children }) {
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
	const location = useLocation();
	const { header } = useHeader();

	const isActive = (path) => location.pathname === path;

	return (
		<div className="min-h-screen flex flex-col">
			{/* Header */}
			<header className="bg-white/90 backdrop-blur sticky top-0 z-50 border-b border-gray-200">
				<nav className="w-full px-2 sm:px-3 lg:px-4">
					<div className="flex justify-between items-center h-10">
						{/* Logo */}
						<Link to="/" className="flex items-center space-x-2">
							<FiBarChart2 className="h-6 w-6 text-primary-600" />
							<span className="text-lg font-bold text-gray-900 font-display tracking-tight">
								Catalyst
							</span>
						</Link>

						{/* Desktop Navigation */}
						<div className="hidden md:flex items-center space-x-6 text-sm">
							<Link
								to="/"
								className={`${
									isActive("/") ? "text-primary-600" : "text-gray-700"
								} hover:text-primary-600 transition-colors font-medium`}
							>
								Home
							</Link>
							<Link
								to="/datasets"
								className={`${
									isActive("/datasets") ||
									location.pathname.startsWith("/datasets/")
										? "text-primary-600"
										: "text-gray-700"
								} hover:text-primary-600 transition-colors font-medium`}
							>
								Explore Datasets
							</Link>
						</div>

						{/* Mobile menu button */}
						<button
							type="button"
							onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
							className="md:hidden p-2 rounded-lg hover:bg-gray-100"
						>
							{mobileMenuOpen ? (
								<FiX className="h-6 w-6" />
							) : (
								<FiMenu className="h-6 w-6" />
							)}
						</button>
					</div>
				</nav>

				{/* Mobile Navigation */}
				{mobileMenuOpen && (
					<div className="md:hidden bg-white border-t border-gray-200">
						<div className="px-4 py-3 space-y-3">
							<Link
								to="/"
								onClick={() => setMobileMenuOpen(false)}
								className={`block py-2 ${
									isActive("/") ? "text-primary-600" : "text-gray-700"
								} hover:text-primary-600 font-medium`}
							>
								Home
							</Link>
							<Link
								to="/datasets"
								onClick={() => setMobileMenuOpen(false)}
								className={`block py-2 ${
									isActive("/datasets") ||
									location.pathname.startsWith("/datasets/")
										? "text-primary-600"
										: "text-gray-700"
								} hover:text-primary-600 font-medium`}
							>
								Explore Datasets
							</Link>
						</div>
					</div>
				)}

				{header && <div className="py-1">{header}</div>}
			</header>

			{/* Main Content */}
			<main className="flex-1 min-h-0 w-full px-2 sm:px-3 lg:px-4 py-2 overflow-hidden">
				{children}
			</main>
		</div>
	);
}
