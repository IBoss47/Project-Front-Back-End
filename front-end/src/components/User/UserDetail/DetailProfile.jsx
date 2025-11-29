import { useState } from "react";
import api from '../../../api/auth';

export default function DetailProfile({ user }) {

	const [username, setUsername] = useState(user?.username || "");
	const [fullname, setFullname] = useState(user?.fullname || "");
	const [email, setEmail] = useState(user?.email || "");
	const [phone, setPhone] = useState(user?.phone || "");
	const [showConfirmModal, setShowConfirmModal] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);

	const handleSave = () => {
		// แสดง modal ยืนยัน
		setShowConfirmModal(true);
	};

	const handleConfirmSave = async () => {
		setIsSubmitting(true);
		try {
			const response = await api.put('/update-profile', {
				username,
				fullname,
				email,
				phone
			});

			if (response.data.success) {
				alert('บันทึกข้อมูลสำเร็จ!');
				setShowConfirmModal(false);
				
				// อัปเดต localStorage ด้วยข้อมูลใหม่
				const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
				const updatedUser = {
					...currentUser,
					username: response.data.data.username,
					fullname: response.data.data.fullname,
					email: response.data.data.email,
					phone: response.data.data.phone
				};
				localStorage.setItem('user', JSON.stringify(updatedUser));
				
				// Reload หน้าเพื่อแสดงข้อมูลใหม่
				window.location.reload();
			}
		} catch (error) {
			console.error('Error updating profile:', error);
			if (error.response?.data?.error === 'Username already taken') {
				alert('ชื่อผู้ใช้นี้ถูกใช้งานแล้ว');
			} else if (error.response?.data?.error === 'Email already taken') {
				alert('อีเมลนี้ถูกใช้งานแล้ว');
			} else {
				alert('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
			}
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleCancelSave = () => {
		setShowConfirmModal(false);
	};

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
							value={username}
							onChange={(e) => setUsername(e.target.value)}
							className="border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-400"
						/>
					</div>

					{/* ชื่อ-นามสกุล */}
					<div className="flex flex-col gap-1">
						<label className="text-sm font-medium text-gray-700">
							ชื่อ-นามสกุล <span className="text-red-500">*</span>
						</label>
						<input
							type="text"
							value={fullname}
							onChange={(e) => setFullname(e.target.value)}
							placeholder="ชื่อ-นามสกุล"
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
							type="email"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
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
							value={phone}
							onChange={(e) => setPhone(e.target.value)}
							placeholder="Phone"
							className="border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-400"
						/>
					</div>

				</div>
			</div>

			{/* Save Button */}
			<div className="mt-10 flex justify-center">
				<button 
					onClick={handleSave}
					disabled={isSubmitting}
					className="px-10 py-3 bg-blue-600 text-white rounded-md cursor-pointer hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
				>
					{isSubmitting ? 'กำลังบันทึก...' : 'บันทึก'}
				</button>
			</div>

			{/* Confirmation Modal */}
			{showConfirmModal && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
					<div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
						<h3 className="text-lg font-semibold text-gray-900 mb-4">
							ยืนยันการบันทึกข้อมูล
						</h3>
						<p className="text-gray-600 mb-6">
							คุณต้องการบันทึกการเปลี่ยนแปลงข้อมูลหรือไม่?
						</p>
						
						<div className="space-y-2 mb-6 text-sm">
							<p><span className="font-medium">ชื่อผู้ใช้:</span> {username}</p>
							<p><span className="font-medium">ชื่อ-นามสกุล:</span> {fullname}</p>
							<p><span className="font-medium">Email:</span> {email}</p>
							<p><span className="font-medium">เบอร์โทร:</span> {phone}</p>
						</div>

						<div className="flex gap-3 justify-end">
							<button
								onClick={handleCancelSave}
								disabled={isSubmitting}
								className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
							>
								ยกเลิก
							</button>
							<button
								onClick={handleConfirmSave}
								disabled={isSubmitting}
								className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
							>
								{isSubmitting ? 'กำลังบันทึก...' : 'ยืนยัน'}
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
