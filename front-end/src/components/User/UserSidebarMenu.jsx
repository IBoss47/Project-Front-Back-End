import { useState, useEffect } from "react";
import { ChevronRightIcon } from "@heroicons/react/24/outline";

export default function UserSidebarMenu({ active, onMenuClick }) {


	const menus = [
		{ label: "ข้อมูลส่วนตัว" },
		// { label: "ข้อความตอบกลับอัตโนมัติ" },
		{ label: "รีวิวของฉัน" },
		// { label: "จัดการโปรไฟล์" },
		// { label: "จัดการบัญชี" },
	];

	return (
		<div className="bg-white rounded-lg border shadow-sm w-full">

			{/* Normal Menus */}
			<div className="divide-y">
				{menus.map((item, i) => {

					const isActive = active === item.label;
					return (
						<button
							key={i}
							onClick={() => onMenuClick(item.label)}
							className={`
              w-full flex items-center justify-between px-4 py-3 
              text-left cursor-pointer 
              ${isActive ? "bg-blue-50 text-blue-800 font-semibold" : "hover:bg-gray-50 text-gray-700"}
            `}
						>
							<span>{item.label}</span>
							{isActive && <ChevronRightIcon className="w-4 h-4" />}
						</button>
					);
				})}
			</div>
		</div>
	);
}
