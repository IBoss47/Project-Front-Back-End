import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import api from '../api/auth';

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
    course_id: '',
    year: '',
    exam_term: '',
    title: '',
    description: '',
    price: '',
  });

  const [images, setImages] = useState([]);
  const [files, setFiles] = useState([]);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [success, setSuccess] = useState(false);

  // ข้อมูลจาก API
  const [courses, setCourses] = useState([]);
  const [majors, setMajors] = useState([]);
  const [years, setYears] = useState([]);
  const [loadingData, setLoadingData] = useState(true);

  // ข้อมูลที่ถูก filter
  const [filteredCourses, setFilteredCourses] = useState([]);

  const examTerms = ['กลางภาค', 'ปลายภาค'];

  // Fetch ข้อมูล courses, majors, years จาก API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoadingData(true);
        const [coursesRes, majorsRes, yearsRes] = await Promise.all([
          api.get('/courses'),
          api.get('/courses/majors'),
          api.get('/courses/years'),
        ]);

        console.log('📚 Courses loaded:', coursesRes.data.data);
        console.log('🎓 Majors loaded:', majorsRes.data.data);
        console.log('📅 Years loaded:', yearsRes.data.data);

        setCourses(coursesRes.data.data || []);
        setMajors(majorsRes.data.data || []);
        setYears(yearsRes.data.data || []);
        setFilteredCourses(coursesRes.data.data || []);
      } catch (error) {
        console.error('❌ Error fetching data:', error);
        setApiError('ไม่สามารถโหลดข้อมูลได้ กรุณาลองใหม่อีกครั้ง');
      } finally {
        setLoadingData(false);
      }
    };

    fetchData();
  }, []);

  // Filter courses เมื่อเลือก major หรือ year
  useEffect(() => {
    let filtered = courses;

    if (formData.faculty) {
      filtered = filtered.filter(c => c.major === formData.faculty);
    }

    if (formData.year) {
      filtered = filtered.filter(c => c.year === formData.year);
    }

    setFilteredCourses(filtered);

    // ถ้า course ที่เลือกไว้ไม่อยู่ใน filter ใหม่ ให้ clear
    if (formData.course_id && !filtered.find(c => c.id.toString() === formData.course_id)) {
      setFormData(prev => ({ ...prev, course_id: '' }));
    }
  }, [formData.faculty, formData.year, courses]);

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
    const uploadedFiles = Array.from(e.target.files);
    const newImages = uploadedFiles.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));
    setImages((prev) => [...prev, ...newImages]);
    e.target.value = ''; // Reset input เพื่อให้เลือกไฟล์เดิมได้อีก
  };

  // Handle file upload
  const handleFileUpload = (e) => {
    const uploadedFiles = Array.from(e.target.files);
    const newFiles = uploadedFiles.map((file) => ({
      file,
      name: file.name,
      size: (file.size / 1024).toFixed(2), // KB
    }));
    setFiles((prev) => [...prev, ...newFiles]);
    e.target.value = ''; // Reset input เพื่อให้เลือกไฟล์เดิมได้อีก
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

  // Remove file
  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // Validate form
  const validate = () => {
    const newErrors = {};

    if (!formData.faculty) newErrors.faculty = 'กรุณาเลือกสาขา';
    if (!formData.course_id) newErrors.course_id = 'กรุณาเลือกวิชา';
    if (!formData.year) newErrors.year = 'กรุณาเลือกชั้นปี';
    if (!formData.exam_term) newErrors.exam_term = 'กรุณาเลือกภาคเรียน';
    if (!formData.title.trim()) newErrors.title = 'กรุณากรอกชื่อหนังสือ';
    if (!formData.description.trim()) newErrors.description = 'กรุณากรอกรายละเอียด';
    if (!formData.price || parseFloat(formData.price) <= 0) {
      newErrors.price = 'กรุณากรอกราคาที่ถูกต้อง';
    }
    if (images.length === 0) newErrors.images = 'กรุณาอัปโหลดรูปภาพอย่างน้อย 1 รูป';
    if (files.length === 0) newErrors.files = 'กรุณาอัปโหลดไฟล์ PDF อย่างน้อย 1 ไฟล์';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    setLoading(true);
    setApiError('');
    setSuccess(false);

    try {
      // สร้าง FormData สำหรับส่งรูปภาพและไฟล์
      const submitData = new FormData();
      submitData.append('course_id', formData.course_id);
      submitData.append('exam_term', formData.exam_term);
      submitData.append('title', formData.title);
      submitData.append('description', formData.description);
      submitData.append('price', formData.price);

      // เพิ่มรูปภาพทั้งหมดตามลำดับ
      images.forEach((image) => {
        submitData.append('images', image.file);
      });

      // เพิ่มไฟล์ PDF
      if (files.length > 0) {
        submitData.append('pdf', files[0].file);
      }

      console.log('📦 Submitting data:', {
        ...formData,
        images: images.length,
        pdf: files.length > 0 ? files[0].name : null,
      });

      // เรียก API
      const response = await api.post('/notes', submitData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      console.log('✅ Success:', response.data);
      setSuccess(true);
      
      // รอ 2 วินาทีแล้ว redirect
      setTimeout(() => {
        navigate('/');
      }, 2000);
    } catch (error) {
      console.error('❌ Error:', error);
      
      // แสดง error message ที่ชัดเจน
      let errorMessage = 'เกิดข้อผิดพลาดในการเพิ่มสินค้า';
      
      if (error.response) {
        if (error.response.status === 400) {
          errorMessage = error.response.data?.error || 'ข้อมูลที่กรอกไม่ถูกต้อง กรุณาตรวจสอบอีกครั้ง';
        } else if (error.response.status === 401) {
          errorMessage = 'กรุณาเข้าสู่ระบบก่อนลงขายสินค้า';
        } else if (error.response.status === 500) {
          errorMessage = 'เกิดข้อผิดพลาดที่เซิร์ฟเวอร์';
        } else if (error.response.data?.error) {
          errorMessage = error.response.data.error;
        }
      } else if (error.request) {
        errorMessage = 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้';
      }
      
      setApiError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DndProvider backend={HTML5Backend} >
      <div className="min-h-screen bg-gray-50 py-8 " >
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
            {/* Success Message */}
            {success && (
              <div className="rounded-md bg-green-50 p-4 border border-green-200">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-green-800">
                      เพิ่มสินค้าสำเร็จ! กำลังนำคุณไปหน้าหลัก...
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Error Message */}
            {apiError && (
              <div className="rounded-md bg-red-50 p-4 border border-red-200">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-red-800">{apiError}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Dropdowns Row */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* สาขา */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  สาขา <span className="text-red-500">*</span>
                </label>
                <select
                  name="faculty"
                  value={formData.faculty}
                  onChange={handleChange}
                  disabled={loadingData}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.faculty ? 'border-red-500' : 'border-gray-300'
                  } ${loadingData ? 'bg-gray-100' : ''}`}
                >
                  <option value="">{loadingData ? 'กำลังโหลด...' : 'เลือกสาขา'}</option>
                  {majors.map((major) => (
                    <option key={major} value={major}>
                      {major}
                    </option>
                  ))}
                </select>
                {errors.faculty && (
                  <p className="text-red-500 text-xs mt-1">{errors.faculty}</p>
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
                  disabled={loadingData}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.year ? 'border-red-500' : 'border-gray-300'
                  } ${loadingData ? 'bg-gray-100' : ''}`}
                >
                  <option value="">{loadingData ? 'กำลังโหลด...' : 'เลือกชั้นปี'}</option>
                  {years.map((year) => (
                    <option key={year} value={year}>
                      ปี {year}
                    </option>
                  ))}
                </select>
                {errors.year && (
                  <p className="text-red-500 text-xs mt-1">{errors.year}</p>
                )}
              </div>

              {/* ชื่อวิชา */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ชื่อวิชา <span className="text-red-500">*</span>
                </label>
                <select
                  name="course_id"
                  value={formData.course_id}
                  onChange={handleChange}
                  disabled={loadingData || filteredCourses.length === 0}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.course_id ? 'border-red-500' : 'border-gray-300'
                  } ${loadingData || filteredCourses.length === 0 ? 'bg-gray-100' : ''}`}
                >
                  <option value="">
                    {loadingData 
                      ? 'กำลังโหลด...' 
                      : filteredCourses.length === 0 
                        ? 'กรุณาเลือกสาขาและชั้นปีก่อน' 
                        : 'เลือกวิชา'
                    }
                  </option>
                  {filteredCourses.map((course) => (
                    <option key={course.id} value={course.id}>
                      {course.code} - {course.name}
                    </option>
                  ))}
                </select>
                {errors.course_id && (
                  <p className="text-red-500 text-xs mt-1">{errors.course_id}</p>
                )}
                {filteredCourses.length > 0 && (
                  <p className="text-gray-500 text-xs mt-1">
                    พบ {filteredCourses.length} วิชา
                  </p>
                )}
              </div>

              {/* ภาคเรียน */}
              <div className="md:col-span-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ภาคเรียน <span className="text-red-500">*</span>
                </label>
                <select
                  name="exam_term"
                  value={formData.exam_term}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.exam_term ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">เลือกภาคเรียน</option>
                  {examTerms.map((term) => (
                    <option key={term} value={term}>
                      {term}
                    </option>
                  ))}
                </select>
                {errors.exam_term && (
                  <p className="text-red-500 text-xs mt-1">{errors.exam_term}</p>
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
                onWheel={(e) => e.target.blur()}
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

            {/* อัปโหลดไฟล์เอกสาร */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ไฟล์เอกสาร (PDF) <span className="text-red-500">*</span>
              </label>
              <div className="mb-4">
                <label className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50 ${
                  errors.files ? 'border-red-500' : 'border-gray-300'
                }`}>
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
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    <p className="text-sm text-gray-500">คลิกเพื่ออัปโหลดไฟล์ PDF</p>
                    <p className="text-xs text-gray-400 mt-1">PDF (MAX. 10MB)</p>
                  </div>
                  <input
                    type="file"
                    accept=".pdf,application/pdf"
                    multiple
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>

              {/* File List */}
              {files.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm text-gray-600 mb-2">ไฟล์ที่แนบ ({files.length} ไฟล์)</p>
                  {files.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                    >
                      <div className="flex items-center space-x-3">
                        <svg
                          className="w-8 h-8 text-blue-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                          />
                        </svg>
                        <div>
                          <p className="text-sm font-medium text-gray-700">{file.name}</p>
                          <p className="text-xs text-gray-500">{file.size} KB</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        className="text-red-500 hover:text-red-700 transition-colors"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {errors.files && (
                <p className="text-red-500 text-xs mt-2">{errors.files}</p>
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
                disabled={loading || success}
                className={`flex-1 px-6 py-3 rounded-lg text-white transition-colors ${
                  loading || success
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
                ) : success ? (
                  'เพิ่มสินค้าสำเร็จ!'
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
