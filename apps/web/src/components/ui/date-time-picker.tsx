"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";

interface DateTimePickerProps {
	date?: Date;
	onDateChange: (date: Date) => void;
	placeholder?: string;
}

export function DateTimePicker({
	date,
	onDateChange,
	placeholder = "Select date and time",
}: DateTimePickerProps) {
	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value;
		if (value) {
			// Convert datetime-local format to Date
			const [datePart, timePart] = value.split("T");
			const [year, month, day] = datePart.split("-");
			const [hours, minutes] = timePart.split(":");

			const newDate = new Date(
				parseInt(year),
				parseInt(month) - 1,
				parseInt(day),
				parseInt(hours),
				parseInt(minutes)
			);
			onDateChange(newDate);
		}
	};

	// Format Date to datetime-local input format (YYYY-MM-DDTHH:mm)
	const formatDateTimeLocal = (d: Date | undefined): string => {
		if (!d) return "";
		const year = d.getFullYear();
		const month = String(d.getMonth() + 1).padStart(2, "0");
		const day = String(d.getDate()).padStart(2, "0");
		const hours = String(d.getHours()).padStart(2, "0");
		const minutes = String(d.getMinutes()).padStart(2, "0");
		return `${year}-${month}-${day}T${hours}:${minutes}`;
	};

	return (
		<div className='w-full'>
			<input
				type='datetime-local'
				value={formatDateTimeLocal(date)}
				onChange={handleChange}
				className='w-full px-3 py-2 rounded-md border bg-white text-slate-800 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-800/30'
			/>
			{date && (
				<div className='mt-1 text-xs text-slate-500'>
					{date.toLocaleString("en-US", {
						weekday: "short",
						year: "numeric",
						month: "short",
						day: "numeric",
						hour: "2-digit",
						minute: "2-digit",
						second: "2-digit",
					})}
				</div>
			)}
		</div>
	);
}
