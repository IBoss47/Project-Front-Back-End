

export default function DetailProfile() {

	return (
		<div className="bg-white p-6 rounded-lg shadow-sm">

			{/* Section: ข้อมูลส่วนตัว */}
			<div>
				<h2 className="text-lg font-semibold text-blue-900 mb-4">ข้อมูลส่วนตัว</h2>

				<div className="grid grid-cols-1 gap-6">

					{/* ชื่อผู้ใช้ */}
					<div className="flex flex-col gap-1">
						<label className="text-sm font-medium text-gray-700">
							ชื่อผู้ใช้ <span className="text-red-500">*</span>
						</label>
						<input
							type="text"
							defaultValue="Jom Terry"
							className="border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-400"
						/>
					</div>

					{/* ชื่อ */}
					<div className="flex flex-col gap-1">
						<label className="text-sm font-medium text-gray-700">
							ชื่อ <span className="text-red-500">*</span>
						</label>
						<input
							type="text"
							placeholder="ชื่อ"
							className="border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-400"
						/>
					</div>

					{/* นามสกุล */}
					<div className="flex flex-col gap-1">
						<label className="text-sm font-medium text-gray-700">
							นามสกุล <span className="text-red-500">*</span>
						</label>
						<input
							type="text"
							placeholder="นามสกุล"
							className="border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-400"
						/>

					</div>
				</div>
			</div>

			{/* Divider */}
			<div className="my-8 border-b"></div>

			{/* Section: ข้อมูลการติดต่อ */}
			<div>
				<h2 className="text-lg font-semibold text-blue-900 mb-4">ข้อมูลการติดต่อ</h2>

				<div className="flex flex-col gap-3">

					<div className="flex flex-col gap-1">
						<label className="text-sm font-medium text-gray-700">
							Email <span className="text-red-500">*</span>
						</label>
						<input
							type="text"
							placeholder="Email"
							className="border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-400"
						/>
					</div>

					<div className="flex flex-col gap-1">
						<label className="text-sm font-medium text-gray-700">
							Phone <span className="text-red-500">*</span>
						</label>
						<input
							type="text"
							placeholder="Phone"
							className="border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-400"
						/>
					</div>

				</div>
			</div>

			{/* Save Button */}
			<div className="mt-10 flex justify-center">
				<button className="px-10 py-3 bg-blue-200 text-white rounded-md cursor-pointer hover:bg-blue-300">
					บันทึก
				</button>
			</div>
		</div>
	);
}
