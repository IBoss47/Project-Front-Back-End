import React, { useState } from "react";

const ImageUploader = () => {
  const [image, setImage] = useState(null); // เก็บแค่รูปเดียว

  const handleFileChange = (e) => {
    const file = e.target.files[0]; // เอาแค่รูปแรก
    if (file) {
      // ตรวจสอบว่าเป็นไฟล์รูปภาพ
      if (!file.type.startsWith('image/')) {
        alert('กรุณาเลือกไฟล์รูปภาพเท่านั้น');
        return;
      }
      
      // ตรวจสอบขนาดไฟล์ (ไม่เกิน 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('ขนาดไฟล์ต้องไม่เกิน 5MB');
        return;
      }

      setImage({
        id: URL.createObjectURL(file),
        file,
      });
    }
  };

  const handleDelete = () => {
    if (image) {
      URL.revokeObjectURL(image.id); // ล้าง memory
      setImage(null);
    }
  };

  return (
    <div className="p-4">
      {/* ปุ่มเลือกไฟล์ */}
      {!image ? (
        <>
          <input
            id="file-upload"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
          <label
            htmlFor="file-upload"
            className="cursor-pointer inline-flex items-center px-4 py-2 mb-4 bg-blue-500 text-white text-sm font-medium rounded-lg shadow hover:bg-blue-600 transition-colors"
          >
            📂 เลือกรูปปก
          </label>
          <p className="text-gray-500 text-xs mt-2">รองรับ JPG, PNG, GIF, WebP (ไม่เกิน 5MB)</p>
        </>
      ) : (
        // แสดงรูปที่เลือก
        <div className="relative inline-block">
          <img
            src={image.id}
            alt="รูปปก"
            className="w-48 h-64 object-cover rounded-lg border-2 border-blue-500 shadow-lg"
          />
          <button
            onClick={handleDelete}
            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-lg hover:bg-red-600 transition-colors shadow-lg"
            title="ลบรูป"
          >
            ×
          </button>
          {/* ปุ่มเปลี่ยนรูป */}
          <div className="mt-2">
            <input
              id="file-replace"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
            <label
              htmlFor="file-replace"
              className="cursor-pointer inline-flex items-center px-3 py-1 bg-gray-600 text-white text-xs font-medium rounded-lg hover:bg-gray-700 transition-colors"
            >
              🔄 เปลี่ยนรูป
            </label>
          </div>
        </div>
      )}
    </div>
  );
}

export default ImageUploader;
