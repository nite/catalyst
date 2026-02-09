import { useEffect, useMemo, useState } from "react";
import { FiCalendar, FiChevronDown, FiSliders, FiX } from "react-icons/fi";

export default function DataFilters({ filters, currentFilters, onChange }) {
	const [localFilters, setLocalFilters] = useState(currentFilters);
	const [showMobileFilters, setShowMobileFilters] = useState(false);
	const [openDateFilter, setOpenDateFilter] = useState(null);
	const [openDropdown, setOpenDropdown] = useState(null);

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

	const applyFilterUpdates = (updates) => {
		setLocalFilters((prev) => {
			const newFilters = { ...prev, ...updates };
			onChange(newFilters);
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

	const activeFilters = useMemo(() => {
		return Object.entries(localFilters).filter(([, value]) => {
			if (value === null || value === undefined) return false;
			if (Array.isArray(value)) return value.length > 0;
			if (typeof value === "string") return value.trim() !== "";
			return true;
		});
	}, [localFilters]);

	const formatDateRange = (fromValue, toValue) => {
		if (!fromValue && !toValue) return "Any time";
		const fromLabel = fromValue || "Any";
		const toLabel = toValue || "Any";
		return `${fromLabel} - ${toLabel}`;
	};

	const renderFilter = (filter) => {
		const { column, filter_type, min, max, options, step } = filter;
		const labelText = column
			.replace(/_/g, " ")
			.replace(/\b\w/g, (letter) => letter.toUpperCase());
		const baseId = `filter-${column}`;

		if (filter_type === "date_range") {
			const fromKey = `${column}_from`;
			const toKey = `${column}_to`;
			const fromValue = localFilters[fromKey] || "";
			const toValue = localFilters[toKey] || "";
			const isOpen = openDateFilter === column;

			const setQuickRange = (days) => {
				const end = new Date();
				const start = new Date();
				start.setDate(end.getDate() - days);
				applyFilterUpdates({
					[fromKey]: start.toISOString().slice(0, 10),
					[toKey]: end.toISOString().slice(0, 10),
				});
				setOpenDateFilter(null);
			};

			return (
				<div key={column} className="space-y-2">
					<div className="block text-sm font-medium text-gray-700">
						{labelText}
					</div>
					<div className="relative">
						<button
							type="button"
							data-testid={`filter-${column}-range-toggle`}
							onClick={() =>
								setOpenDateFilter((prev) => (prev === column ? null : column))
							}
							className="input-field text-sm flex items-center justify-between gap-2"
						>
							<span className="flex items-center gap-2 text-gray-600">
								<FiCalendar className="h-4 w-4" />
								{formatDateRange(fromValue, toValue)}
							</span>
							<FiChevronDown className="h-4 w-4 text-gray-400" />
						</button>
						{isOpen && (
							<div className="absolute left-0 right-0 mt-2 z-30 rounded-2xl border border-gray-200 bg-white p-3 shadow-lg">
								<div className="flex items-center justify-between text-xs uppercase tracking-[0.2em] text-gray-500">
									<span>Date range</span>
									<button
										type="button"
										onClick={() => setOpenDateFilter(null)}
										className="text-gray-400 hover:text-gray-600"
									>
										Close
									</button>
								</div>
								<div className="grid grid-cols-2 gap-2 mt-3">
									<div>
										<label
											htmlFor={`${baseId}-from`}
											className="block text-[10px] uppercase tracking-[0.2em] text-gray-500"
										>
											From
										</label>
										<input
											id={`${baseId}-from`}
											data-testid={`filter-${column}-from`}
											type="date"
											value={fromValue}
											onChange={(e) =>
												handleFilterChange(fromKey, e.target.value)
											}
											className="input-field text-sm mt-1"
										/>
									</div>
									<div>
										<label
											htmlFor={`${baseId}-to`}
											className="block text-[10px] uppercase tracking-[0.2em] text-gray-500"
										>
											To
										</label>
										<input
											id={`${baseId}-to`}
											data-testid={`filter-${column}-to`}
											type="date"
											value={toValue}
											onChange={(e) =>
												handleFilterChange(toKey, e.target.value)
											}
											className="input-field text-sm mt-1"
										/>
									</div>
								</div>
								<div className="flex flex-wrap gap-2 mt-3">
									{[7, 30, 90, 365].map((days) => (
										<button
											key={days}
											type="button"
											onClick={() => setQuickRange(days)}
											className="px-2 py-1 text-xs rounded-full border border-gray-200 hover:bg-gray-50"
										>
											Last {days} days
										</button>
									))}
								</div>
								<div className="flex items-center justify-between gap-2 mt-3">
									<button
										type="button"
										onClick={() => {
											applyFilterUpdates({
												[fromKey]: "",
												[toKey]: "",
											});
											setOpenDateFilter(null);
										}}
										className="text-xs text-gray-500 hover:text-gray-700"
									>
										Clear
									</button>
									<button
										type="button"
										onClick={() => {
											applyFilterUpdates({
												[fromKey]: fromValue,
												[toKey]: toValue,
											});
											setOpenDateFilter(null);
										}}
										className="btn-primary text-xs px-3 py-1"
									>
										Apply
									</button>
								</div>
							</div>
						)}
					</div>
				</div>
			);
		}

		if (filter_type === "range") {
			const minKey = `${column}_min`;
			const maxKey = `${column}_max`;
			const minBound = Number.isFinite(Number(min)) ? Number(min) : 0;
			const maxBound = Number.isFinite(Number(max))
				? Number(max)
				: minBound + 100;
			const minValueRaw = localFilters[minKey];
			const maxValueRaw = localFilters[maxKey];
			const minValue = Number.isFinite(Number(minValueRaw))
				? Number(minValueRaw)
				: minBound;
			const maxValue = Number.isFinite(Number(maxValueRaw))
				? Number(maxValueRaw)
				: maxBound;
			const stepValue = step || 1;

			const commitRange = () => {
				applyFilterUpdates({
					[minKey]: minValue,
					[maxKey]: maxValue,
				});
			};

			return (
				<fieldset key={column} className="space-y-2">
					<legend className="block text-sm font-medium text-gray-700">
						{labelText}
					</legend>
					<div className="space-y-2">
						<div className="grid grid-cols-2 gap-2">
							<input
								data-testid={`filter-${column}-min`}
								type="number"
								min={minBound}
								max={maxBound}
								step={stepValue}
								value={minValue}
								onChange={(e) => {
									const nextValue = Math.min(Number(e.target.value), maxValue);
									handleFilterChange(minKey, nextValue);
								}}
								onBlur={commitRange}
								placeholder="Min"
								className="input-field text-sm"
							/>
							<input
								data-testid={`filter-${column}-max`}
								type="number"
								min={minBound}
								max={maxBound}
								step={stepValue}
								value={maxValue}
								onChange={(e) => {
									const nextValue = Math.max(Number(e.target.value), minValue);
									handleFilterChange(maxKey, nextValue);
								}}
								onBlur={commitRange}
								placeholder="Max"
								className="input-field text-sm"
							/>
						</div>
						<div className="relative px-1">
							<input
								data-testid={`filter-${column}-min-range`}
								type="range"
								min={minBound}
								max={maxBound}
								step={stepValue}
								value={Math.min(minValue, maxValue)}
								onChange={(e) => {
									const nextValue = Math.min(Number(e.target.value), maxValue);
									handleFilterChange(minKey, nextValue);
								}}
								onMouseUp={commitRange}
								onTouchEnd={commitRange}
								className="absolute w-full pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-moz-range-thumb]:pointer-events-auto accent-primary-500 bg-transparent"
								style={{ zIndex: minValue > (minBound + maxBound) / 2 ? 4 : 3 }}
							/>
							<input
								data-testid={`filter-${column}-max-range`}
								type="range"
								min={minBound}
								max={maxBound}
								step={stepValue}
								value={Math.max(minValue, maxValue)}
								onChange={(e) => {
									const nextValue = Math.max(Number(e.target.value), minValue);
									handleFilterChange(maxKey, nextValue);
								}}
								onMouseUp={commitRange}
								onTouchEnd={commitRange}
								className="absolute w-full pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-moz-range-thumb]:pointer-events-auto accent-primary-500 bg-transparent"
								style={{ zIndex: 4 }}
							/>
							<div className="h-6" />
						</div>
						<div className="flex items-center justify-between text-[11px] text-gray-500">
							<span>{minBound}</span>
							<span>{maxBound}</span>
						</div>
					</div>
				</fieldset>
			);
		}

		if (filter_type === "multi_select" && options && options.length > 0) {
			const selectedValues = Array.isArray(localFilters[column])
				? localFilters[column]
				: [];

			const toggleOption = (option) => {
				const nextValues = selectedValues.includes(option)
					? selectedValues.filter((value) => value !== option)
					: [...selectedValues, option];
				handleFilterChange(column, nextValues, true);
			};

			const useDropdown = options.length > 4;
			const isOpen = openDropdown === column;

			if (useDropdown) {
				return (
					<div key={column} className="space-y-2">
						<div className="block text-sm font-medium text-gray-700">
							{labelText}
						</div>
						<div className="relative">
							<button
								type="button"
								data-testid={`filter-${column}-dropdown-toggle`}
								onClick={() => setOpenDropdown(isOpen ? null : column)}
								className="input-field text-sm flex items-center justify-between gap-2"
							>
								<span className="text-gray-600 truncate">
									{selectedValues.length === 0
										? "All"
										: selectedValues.length === 1
											? selectedValues[0]
											: `${selectedValues.length} selected`}
								</span>
								<FiChevronDown className="h-4 w-4 text-gray-400" />
							</button>
							{isOpen && (
								<div className="absolute left-0 right-0 mt-2 z-30 rounded-xl border border-gray-200 bg-white p-3 shadow-lg max-h-60 overflow-auto">
									<div className="space-y-2">
										{options.map((option) => (
											<label
												key={option}
												className="flex items-center gap-2 text-xs text-gray-700 cursor-pointer hover:bg-gray-50 p-1 rounded"
											>
												<input
													type="checkbox"
													data-testid={`filter-${column}-option`}
													checked={selectedValues.includes(option)}
													onChange={() => toggleOption(option)}
													className="h-3.5 w-3.5 rounded border-gray-300 text-primary-600 focus:ring-primary-400"
												/>
												<span className="truncate">{option}</span>
											</label>
										))}
									</div>
									<div className="flex items-center justify-between gap-2 mt-3 pt-2 border-t">
										<button
											type="button"
											onClick={() => {
												handleFilterChange(column, [], true);
												setOpenDropdown(null);
											}}
											className="text-xs text-gray-500 hover:text-gray-700"
										>
											Clear
										</button>
										<button
											type="button"
											onClick={() => setOpenDropdown(null)}
											className="btn-primary text-xs px-3 py-1"
										>
											Done
										</button>
									</div>
								</div>
							)}
						</div>
					</div>
				);
			}

			return (
				<div key={column} className="space-y-2">
					<div className="flex items-center justify-between">
						<span className="block text-sm font-medium text-gray-700">
							{labelText}
						</span>
						<button
							type="button"
							onClick={() => handleFilterChange(column, [], true)}
							className="text-xs text-gray-500 hover:text-gray-700"
						>
							Clear
						</button>
					</div>
					<div className="flex flex-wrap gap-2">
						{options.map((option) => {
							const isSelected = selectedValues.includes(option);
							return (
								<button
									key={option}
									type="button"
									data-testid={`filter-${column}-option`}
									onClick={() => toggleOption(option)}
									className={`px-2 py-1 text-xs rounded-full border transition ${
										isSelected
											? "border-primary-500 bg-primary-50 text-primary-700"
											: "border-gray-200 text-gray-600 hover:bg-gray-50"
									}`}
								>
									{option}
								</button>
							);
						})}
					</div>
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

				{activeFilters.length > 0 && (
					<div className="flex gap-2 overflow-x-auto whitespace-nowrap mb-2">
						{activeFilters.map(([key, value]) => (
							<button
								key={key}
								type="button"
								onClick={() => removeFilter(key)}
								className="text-xs px-2 py-1 border border-primary-200 text-primary-700 hover:bg-primary-50 transition"
							>
								{key.replace(/_/g, " ")}:{" "}
								{Array.isArray(value) ? value.join(", ") : String(value)}
							</button>
						))}
					</div>
				)}

				<div className="space-y-3">
					{filters.map((filter) => renderFilter(filter))}
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
