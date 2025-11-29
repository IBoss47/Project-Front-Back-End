import React, { useEffect, useState, useRef } from "react";
import api from '../../api/auth';

export default function UserProfile({ name, memberId, avatar, onAvatarUpdate }) {
	const [isUploading, setIsUploading] = useState(false);
	const fileInputRef = useRef(null);

	const handleEditClick = () => {
		fileInputRef.current?.click();
	};

	const handleFileChange = async (e) => {
		const file = e.target.files?.[0];
		if (!file) return;

		// ตรวจสอบประเภทไฟล์
		if (!file.type.startsWith('image/')) {
			alert('โปรดเลือกไฟล์รูปภาพเท่านั้น');
			return;
		}

		// ตรวจสอบขนาดไฟล์ (ไม่เกิน 5MB)
		if (file.size > 5 * 1024 * 1024) {
			alert('ขนาดไฟล์ใหญ่เกินไป โปรดเลือกไฟล์ที่เล็กกว่า 5MB');
			return;
		}

		setIsUploading(true);
		try {
			const formData = new FormData();
			formData.append('avatar', file);

			const res = await api.post('/upload-avatar', formData, {
				headers: {
					'Content-Type': 'multipart/form-data',
				},
			});

			if (res.data.success && res.data.avatar_url) {
				// อัปเดต avatar ใน parent component
				if (onAvatarUpdate) {
					onAvatarUpdate(res.data.avatar_url);
				}
				alert('อัปโหลดรูปภาพสำเร็จ!');
			}
		} catch (err) {
			console.error('Error uploading avatar:', err);
			alert('เกิดข้อผิดพลาดใันการอัปโหลดรูปภาพ');
		} finally {
			setIsUploading(false);
			// ล้าง input เพื่อให้สามารถเลือกไฟล์เดิมได้อีก
			if (fileInputRef.current) {
				fileInputRef.current.value = '';
			}
		}
	};

	// สร้าง URL สำหรับรูปภาพ
	const getAvatarUrl = () => {
		if (!avatar) return null;
		if (avatar.startsWith('http')) return avatar;
		return `http://localhost:8080${avatar}`;
	};

	return (
		<div className="col-span-3 bg-white border p-6 rounded bg-gray-100 rounded-xl p-6 flex items-center gap-6">
			{/* Left: Profile Image */}
			<div className="relative">
				{getAvatarUrl() ? (
					<img
						src={getAvatarUrl()}
						alt="User avatar"
						className="w-24 h-24 rounded-full border-2 border-gray-300 object-cover"
					/>
				) : (
					<div className="w-24 h-24 rounded-full border-2 border-gray-300 bg-gray-200 flex items-center justify-center">
						<span className="text-2xl text-gray-500">{name?.[0]?.toUpperCase() || 'U'}</span>
					</div>
				)}

				{/* Edit Icon */}
				<button 
					onClick={handleEditClick}
					disabled={isUploading}
					className="absolute bottom-1 right-1 bg-white shadow rounded-full p-1 hover:bg-gray-50 disabled:opacity-50"
				>
					{isUploading ? (
						<div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
					) : (
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
					)}
				</button>

				{/* Hidden file input */}
				<input
					ref={fileInputRef}
					type="file"
					accept="image/*"
					className="hidden"
					onChange={handleFileChange}
				/>
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