import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

// Component สำหรับรูปภาพที่ลากได้
const DraggableImage = ({ image, index, moveImage, removeImage }) => {
  const [{ isDragging }, drag] = useDrag({
    type: 'image',
    item: { index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [, drop] = useDrop({
    accept: 'image',
    hover: (draggedItem) => {
      if (draggedItem.index !== index) {
        moveImage(draggedItem.index, index);
        draggedItem.index = index;
      }
    },
  });

  return (
    <div
      ref={(node) => drag(drop(node))}
      className={`relative group ${isDragging ? 'opacity-50' : 'opacity-100'}`}
      style={{ cursor: 'move' }}
    >
      <img
        src={image.preview}
        alt={`Preview ${index + 1}`}
        className="w-full h-32 object-cover rounded-lg border-2 border-gray-300"
      />
      {/* ป้าย "หน้าปก" สำหรับรูปแรก */}
      {index === 0 && (
        <div className="absolute top-1 left-1 bg-blue-600 text-white text-xs px-2 py-1 rounded font-medium">
          📖 หน้าปก
        </div>
      )}
      {/* ปุ่มลบ */}
      <button
        type="button"
        onClick={() => removeImage(index)}
        className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
      >
        ×
      </button>
      {/* หมายเลขลำดับ */}
      <div className="absolute bottom-1 left-1 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
        {index + 1}
      </div>
    </div>
  );
};

const SellItemPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    faculty: '',
    subject: '',
    year: '',
    title: '',
    description: '',
    price: '',
  });

  const [images, setImages] = useState([]);
  const [errors, setErrors] = useState({});

  // ตัวเลือก Dropdown
  const faculties = [
    'วิทยาศาสตร์',
    'วิศวกรรมศาสตร์',
    'แพทยศาสตร์',
    'ศึกษาศาสตร์',
    'มนุษยศาสตร์และสังคมศาสตร์',
    'บริหารธุรกิจ',
    'นิติศาสตร์',
    'เทคโนโลยีสารสนเทศ',
  ];

  const subjects = [
    'คณิตศาสตร์',
    'ฟิสิกส์',
    'เคมี',
    'ชีววิทยา',
    'วิศวกรรมไฟฟ้า',
    'วิศวกรรมคอมพิวเตอร์',
    'วิศวกรรมโยธา',
    'การบัญชี',
    'การตลาด',
    'การจัดการ',
    'ภาษาอังกฤษ',
    'ภาษาไทย',
  ];

  const years = ['ปี 1', 'ปี 2', 'ปี 3', 'ปี 4', 'ปี 5', 'ปี 6'];

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user types
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  // Handle image upload
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const newImages = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));
    setImages((prev) => [...prev, ...newImages]);
  };

  // Move image (drag & drop)
  const moveImage = (fromIndex, toIndex) => {
    const updatedImages = [...images];
    const [movedImage] = updatedImages.splice(fromIndex, 1);
    updatedImages.splice(toIndex, 0, movedImage);
    setImages(updatedImages);
  };

  // Remove image
  const removeImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  // Validate form
  const validate = () => {
    const newErrors = {};

    if (!formData.faculty) newErrors.faculty = 'กรุณาเลือกสาขา';
    if (!formData.subject) newErrors.subject = 'กรุณาเลือกชื่อวิชา';
    if (!formData.year) newErrors.year = 'กรุณาเลือกชั้นปี';
    if (!formData.title.trim()) newErrors.title = 'กรุณากรอกชื่อหนังสือ';
    if (!formData.description.trim()) newErrors.description = 'กรุณากรอกรายละเอียด';
    if (!formData.price || parseFloat(formData.price) <= 0) {
      newErrors.price = 'กรุณากรอกราคาที่ถูกต้อง';
    }
    if (images.length === 0) newErrors.images = 'กรุณาอัปโหลดรูปภาพอย่างน้อย 1 รูป';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    setLoading(true);

    try {
      // สร้าง FormData สำหรับส่งรูปภาพ
      const submitData = new FormData();
      submitData.append('faculty', formData.faculty);
      submitData.append('subject', formData.subject);
      submitData.append('year', formData.year);
      submitData.append('title', formData.title);
      submitData.append('description', formData.description);
      submitData.append('price', formData.price);

      // เพิ่มรูปภาพทั้งหมด
      images.forEach((image, index) => {
        submitData.append('images', image.file);
        submitData.append(`image_order_${index}`, index);
      });

      console.log('📦 Submitting data:', {
        ...formData,
        images: images.length,
      });

      // TODO: เรียก API
      // const response = await api.post('/seller/products', submitData, {
      //   headers: { 'Content-Type': 'multipart/form-data' }
      // });

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      alert('เพิ่มสินค้าสำเร็จ!');
      navigate('/my-store');
    } catch (error) {
      console.error('Error:', error);
      alert('เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          {/* Header */}
          <div className="mb-6">
            <button
              onClick={() => navigate(-1)}
              className="text-blue-600 hover:text-blue-800 mb-4 flex items-center"
            >
              ← กลับ
            </button>
            <h1 className="text-3xl font-bold text-gray-800">ลงขายหนังสือ</h1>
            <p className="text-gray-600 mt-2">กรอกข้อมูลหนังสือที่ต้องการขาย</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 space-y-6">
            {/* Dropdowns Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* สาขา */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  สาขา <span className="text-red-500">*</span>
                </label>
                <select
                  name="faculty"
                  value={formData.faculty}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.faculty ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">เลือกสาขา</option>
                  {faculties.map((faculty) => (
                    <option key={faculty} value={faculty}>
                      {faculty}
                    </option>
                  ))}
                </select>
                {errors.faculty && (
                  <p className="text-red-500 text-xs mt-1">{errors.faculty}</p>
                )}
              </div>

              {/* ชื่อวิชา */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ชื่อวิชา <span className="text-red-500">*</span>
                </label>
                <select
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.subject ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">เลือกวิชา</option>
                  {subjects.map((subject) => (
                    <option key={subject} value={subject}>
                      {subject}
                    </option>
                  ))}
                </select>
                {errors.subject && (
                  <p className="text-red-500 text-xs mt-1">{errors.subject}</p>
                )}
              </div>

              {/* ชั้นปี */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ชั้นปี <span className="text-red-500">*</span>
                </label>
                <select
                  name="year"
                  value={formData.year}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.year ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">เลือกชั้นปี</option>
                  {years.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
                {errors.year && (
                  <p className="text-red-500 text-xs mt-1">{errors.year}</p>
                )}
              </div>
            </div>

            {/* ชื่อหนังสือ */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ชื่อหนังสือ <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="เช่น หนังสือคณิตศาสตร์ เล่ม 1"
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.title ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.title && (
                <p className="text-red-500 text-xs mt-1">{errors.title}</p>
              )}
            </div>

            {/* รายละเอียด */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                รายละเอียด <span className="text-red-500">*</span>
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="อธิบายสภาพหนังสือ ความเก่าใหม่ มีขีดเขียนหรือไม่ ฯลฯ"
                rows="4"
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.description ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.description && (
                <p className="text-red-500 text-xs mt-1">{errors.description}</p>
              )}
            </div>

            {/* ราคา */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ราคา (บาท) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                placeholder="0.00"
                min="0"
                step="0.01"
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.price ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.price && (
                <p className="text-red-500 text-xs mt-1">{errors.price}</p>
              )}
            </div>

            {/* อัปโหลดรูปภาพ */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                รูปภาพ <span className="text-red-500">*</span>
              </label>
              <div className="mb-4">
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <svg
                      className="w-10 h-10 text-gray-400 mb-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                    <p className="text-sm text-gray-500">คลิกเพื่ออัปโหลดรูปภาพ</p>
                    <p className="text-xs text-gray-400 mt-1">PNG, JPG, JPEG (MAX. 5MB)</p>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Image Preview Grid with Drag & Drop */}
              {images.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-gray-600">
                      ลากรูปภาพเพื่อเรียงลำดับ ({images.length} รูป)
                    </p>
                    <p className="text-xs text-blue-600 font-medium">
                      💡 รูปแรกจะเป็นหน้าปกด้วย
                    </p>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {images.map((image, index) => (
                      <DraggableImage
                        key={index}
                        image={image}
                        index={index}
                        moveImage={moveImage}
                        removeImage={removeImage}
                      />
                    ))}
                  </div>
                </div>
              )}

              {errors.images && (
                <p className="text-red-500 text-xs mt-2">{errors.images}</p>
              )}
            </div>

            {/* Buttons */}
            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={loading}
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                disabled={loading}
                className={`flex-1 px-6 py-3 rounded-lg text-white transition-colors ${
                  loading
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    กำลังบันทึก...
                  </span>
                ) : (
                  'ลงขาย'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </DndProvider>
  );
};

export default SellItemPage;
