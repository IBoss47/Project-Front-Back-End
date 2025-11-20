import React, { useEffect, useState } from "react";

export default function UserProfile({ name, memberId, avatar }) {

	return (
		<div className="col-span-3 bg-white border p-6 rounded bg-gray-100 rounded-xl p-6 flex items-center gap-6">
			{/* Left: Profile Image */}
			<div className="relative">
				<img
					src={avatar}
					alt="User avatar"
					className="w-24 h-24 rounded-full border-2 border-gray-300 object-cover"
				/>

				{/* Edit Icon */}
				<button className="absolute bottom-1 right-1 bg-white shadow rounded-full p-1">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						className="w-4 h-4 text-blue-700"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M15.232 5.232l3.536 3.536M14 4l6 6-8 8H6v-6l8-8z"
						/>
					</svg>
				</button>
			</div>

			{/* Right: User Info */}
			<div className="flex flex-col gap-1">

				{/* ชื่อผู้ใช้ */}
				<div className="flex items-center gap-2">
					<span className="text-sm text-gray-500">ชื่อผู้ใช้:</span>
					<span className="text-lg font-semibold text-blue-900">{name}</span>
				</div>

				{/* หมายเลขสมาชิก */}
				<div className="flex items-center gap-2">
					<span className="text-sm text-gray-500">หมายเลขสมาชิก:</span>
					<span className="text-lg font-semibold text-blue-900">{memberId}</span>
				</div>

			</div>
		</div>
	);
}