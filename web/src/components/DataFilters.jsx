import { useEffect, useState } from "react";
import { FiShuffle, FiSliders, FiX } from "react-icons/fi";

export default function DataFilters({ filters, currentFilters, onChange }) {
	const [localFilters, setLocalFilters] = useState(currentFilters);
	const [showMobileFilters, setShowMobileFilters] = useState(false);
	const [sortMode, setSortMode] = useState("default");

	useEffect(() => {
		setLocalFilters(currentFilters);
	}, [currentFilters]);

	const handleFilterChange = (column, value, applyNow = false) => {
		setLocalFilters((prev) => {
			const newFilters = { ...prev, [column]: value };
			if (applyNow) {
				onChange(newFilters);
			}
			return newFilters;
		});
	};

	const resetFilters = () => {
		setLocalFilters({});
		onChange({});
	};

	const removeFilter = (key) => {
		setLocalFilters((prev) => {
			const updated = { ...prev };
			delete updated[key];
			onChange(updated);
			return updated;
		});
	};

	const activeFilters = Object.entries(localFilters).filter(([, value]) => {
		if (value === null || value === undefined) return false;
		if (typeof value === "string") return value.trim() !== "";
		return true;
	});

	const renderFilter = (filter) => {
		const { column, filter_type, min, max, options, step } = filter;
		const labelText = column
			.replace(/_/g, " ")
			.replace(/\b\w/g, (letter) => letter.toUpperCase());
		const baseId = `filter-${column}`;

		if (filter_type === "date_range") {
			return (
				<fieldset key={column} className="space-y-2">
					<legend className="block text-sm font-medium text-gray-700">
						{labelText}
					</legend>
					<div className="space-y-2">
						<label htmlFor={`${baseId}-from`} className="sr-only">
							From
						</label>
						<input
							id={`${baseId}-from`}
							data-testid={`filter-${column}-from`}
							type="date"
							value={localFilters[`${column}_from`] || ""}
							onChange={(e) =>
								handleFilterChange(`${column}_from`, e.target.value)
							}
							onBlur={(e) =>
								handleFilterChange(`${column}_from`, e.target.value, true)
							}
							className="input-field text-sm"
							placeholder="From"
						/>
						<label htmlFor={`${baseId}-to`} className="sr-only">
							To
						</label>
						<input
							id={`${baseId}-to`}
							data-testid={`filter-${column}-to`}
							type="date"
							value={localFilters[`${column}_to`] || ""}
							onChange={(e) =>
								handleFilterChange(`${column}_to`, e.target.value)
							}
							onBlur={(e) =>
								handleFilterChange(`${column}_to`, e.target.value, true)
							}
							className="input-field text-sm"
							placeholder="To"
						/>
					</div>
				</fieldset>
			);
		}

		if (filter_type === "range") {
			return (
				<fieldset key={column} className="space-y-2">
					<legend className="block text-sm font-medium text-gray-700">
						{labelText}
					</legend>
					<div className="space-y-2">
						<label htmlFor={`${baseId}-min`} className="sr-only">
							Minimum
						</label>
						<input
							id={`${baseId}-min`}
							data-testid={`filter-${column}-min`}
							type="number"
							value={localFilters[`${column}_min`] || min || ""}
							onChange={(e) =>
								handleFilterChange(`${column}_min`, e.target.value)
							}
							onBlur={(e) =>
								handleFilterChange(`${column}_min`, e.target.value, true)
							}
							placeholder={`Min: ${min || ""}`}
							className="input-field text-sm"
							step={step || 1}
						/>
						<label htmlFor={`${baseId}-max`} className="sr-only">
							Maximum
						</label>
						<input
							id={`${baseId}-max`}
							data-testid={`filter-${column}-max`}
							type="number"
							value={localFilters[`${column}_max`] || max || ""}
							onChange={(e) =>
								handleFilterChange(`${column}_max`, e.target.value)
							}
							onBlur={(e) =>
								handleFilterChange(`${column}_max`, e.target.value, true)
							}
							placeholder={`Max: ${max || ""}`}
							className="input-field text-sm"
							step={step || 1}
						/>
					</div>
				</fieldset>
			);
		}

		if (filter_type === "multi_select" && options && options.length > 0) {
			return (
				<div key={column} className="space-y-2">
					<label
						htmlFor={`${baseId}-select`}
						className="block text-sm font-medium text-gray-700"
					>
						{labelText}
					</label>
					<select
						id={`${baseId}-select`}
						data-testid={`filter-${column}-select`}
						value={localFilters[column] || ""}
						onChange={(e) => handleFilterChange(column, e.target.value, true)}
						className="input-field text-sm"
					>
						<option value="">All</option>
						{options.slice(0, 20).map((option) => (
							<option key={option} value={option}>
								{option}
							</option>
						))}
					</select>
				</div>
			);
		}

		return null;
	};

	if (!filters || filters.length === 0) {
		return (
			<div className="border border-gray-200 p-2 text-xs text-gray-500">
				<p className="text-sm text-gray-600">No filters available</p>
			</div>
		);
	}

	const sortedFilters = [...filters].sort((a, b) => {
		if (sortMode === "asc") {
			return a.column.localeCompare(b.column);
		}
		if (sortMode === "desc") {
			return b.column.localeCompare(a.column);
		}
		return 0;
	});

	return (
		<>
			{/* Mobile Filter Button */}
			<button
				type="button"
				onClick={() => setShowMobileFilters(!showMobileFilters)}
				className="lg:hidden w-full btn-primary mb-4 flex items-center justify-center"
			>
				<FiSliders className="mr-2" />
				{showMobileFilters ? "Hide Filters" : "Show Filters"}
			</button>

			{showMobileFilters && (
				<button
					type="button"
					aria-label="Close filters overlay"
					className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
					onClick={() => setShowMobileFilters(false)}
				/>
			)}

			{/* Filter Panel */}
			<div
				data-testid="filters-panel"
				className={`border border-gray-200 p-2 ${
					showMobileFilters
						? "fixed z-50 left-2 right-2 top-20 max-h-[70vh] overflow-y-auto bg-white"
						: "hidden lg:block max-h-[calc(100vh-8rem)] overflow-y-auto"
				}`}
			>
				<div className="flex items-center justify-between mb-2">
					<h3 className="text-sm font-semibold text-gray-900 flex items-center">
						<FiSliders className="mr-2" />
						Filters
					</h3>
					{showMobileFilters && (
						<button
							type="button"
							onClick={() => setShowMobileFilters(false)}
							className="lg:hidden text-gray-500 hover:text-gray-700"
						>
							<FiX className="h-5 w-5" />
						</button>
					)}
				</div>

				<div className="flex items-center gap-2 mb-2 text-xs text-gray-500">
					<FiShuffle className="h-4 w-4" />
					<select
						value={sortMode}
						onChange={(e) => setSortMode(e.target.value)}
						className="input-field text-xs h-8 px-2"
					>
						<option value="default">Default</option>
						<option value="asc">A-Z</option>
						<option value="desc">Z-A</option>
					</select>
				</div>

				{activeFilters.length > 0 && (
					<div className="flex gap-2 overflow-x-auto whitespace-nowrap mb-2">
						{activeFilters.map(([key, value]) => (
							<button
								key={key}
								type="button"
								onClick={() => removeFilter(key)}
								className="text-xs px-2 py-1 border border-primary-200 text-primary-700 hover:bg-primary-50 transition"
							>
								{key.replace(/_/g, " ")}: {String(value)}
							</button>
						))}
					</div>
				)}

				<div className="space-y-3">
					{sortedFilters.map((filter) => renderFilter(filter))}
				</div>

				<div className="mt-4">
					<button
						type="button"
						onClick={resetFilters}
						className="w-full btn-secondary"
					>
						Reset
					</button>
				</div>
			</div>
		</>
	);
}
