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
  const [showSuccessModal, setShowSuccessModal] = useState(false);

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

  // Handle image upload - only one image allowed
  const handleImageUpload = (e) => {
    const uploadedFiles = Array.from(e.target.files);
    if (uploadedFiles.length > 0) {
      const file = uploadedFiles[0]; // Take only the first file
      const newImage = {
        file,
        preview: URL.createObjectURL(file),
      };
      setImages([newImage]); // Replace with single image
    }
    e.target.value = ''; // Reset input
  };

  // Handle file upload - only one PDF allowed
  const handleFileUpload = (e) => {
    const uploadedFiles = Array.from(e.target.files);
    if (uploadedFiles.length > 0) {
      const file = uploadedFiles[0]; // Take only the first file
      const newFile = {
        file,
        name: file.name,
        size: (file.size / 1024).toFixed(2), // KB
      };
      setFiles([newFile]); // Replace with single file
    }
    e.target.value = ''; // Reset input
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
    if (!formData.title.trim()) newErrors.title = 'กรุณากรอกชื่อสรุป';
    if (!formData.description.trim()) newErrors.description = 'กรุณากรอกรายละเอียด';
    if (!formData.price || parseFloat(formData.price) <= 0) {
      newErrors.price = 'กรุณากรอกราคาที่ถูกต้อง';
    }
    if (images.length === 0) newErrors.images = 'กรุณาอัปโหลดรูปภาพอย่างน้อย 1 รูป';
    if (files.length === 0) newErrors.files = 'กรุณาอัปโหลดไฟล์ PDF อย่างน้อย 1 ไฟล์';

    setErrors(newErrors);
    
    // ถ้ามี error ให้เลื่อนไปที่ error แรก
    if (Object.keys(newErrors).length > 0) {
      setTimeout(() => {
        const firstErrorField = Object.keys(newErrors)[0];
        const errorElement = document.querySelector(`[name="${firstErrorField}"]`) || 
                            document.querySelector(`[data-error="${firstErrorField}"]`);
        
        if (errorElement) {
          errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
          // Focus field if possible
          if (errorElement.focus && (errorElement.tagName === 'SELECT' || errorElement.tagName === 'INPUT' || errorElement.tagName === 'TEXTAREA')) {
            errorElement.focus();
          }
        }
      }, 100);
    }
    
    return Object.keys(newErrors).length === 0;
  };

  // Handle submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      // Scroll to top when validation fails
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

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

      // เพิ่มรูปภาพ (รูปเดียว)
      if (images.length > 0) {
        submitData.append('image_0', images[0].file);
      }

      // เพิ่มไฟล์ PDF (ไฟล์เดียว)
      if (files.length > 0) {
        submitData.append('pdf_file', files[0].file);
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
      
      // แสดง modal แทนการ redirect อัตโนมัติ
      setTimeout(() => {
        setShowSuccessModal(true);
      }, 1500);
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
      <div className="min-h-screen w-full bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 pt-32 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-2 px-4 py-2 mb-4 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-blue-600 hover:border-blue-300 transition-all duration-200 shadow-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              กลับ
            </button>
            <h1 className="text-3xl font-bold text-gray-800">📝 ลงขายหนังสือ</h1>
            <p className="text-gray-600 mt-2">กรอกข้อมูลหนังสือที่ต้องการขาย</p>
            <div className="mt-4 bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-blue-700 font-medium">
                    💡 หมายเหตุ: หลังจากอัปโหลดสรุปวิชาเรียบร้อยแล้ว จะต้องรอการอนุมัติจาก Admin ก่อนที่สรุปจะแสดงในหน้าร้าน
                  </p>
                </div>
              </div>
            </div>
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
                ชื่อสรุป <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="เช่น database จัดเต็ม"
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
                placeholder="อธิบายรายละเอียดเช่น เน้นเนื้อหาหลัก รูปภาพ ฯลฯ"
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
            <div data-error="images">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                📸 รูปภาพหน้าปก <span className="text-red-500">*</span>
              </label>
              
              {/* Image Preview - Single image only */}
              {images.length > 0 ? (
                <div className="relative group">
                  <div className="relative overflow-hidden rounded-2xl border-4 border-blue-200 shadow-lg transition-all duration-300 hover:shadow-2xl hover:border-blue-400 max-w-xs mx-auto">
                    <img
                      src={images[0].preview}
                      alt="Preview"
                      className="w-full h-56 object-contain bg-gray-50"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    
                    {/* Badge */}
                    <div className="absolute top-3 left-3">
                      <span className="bg-blue-600 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg flex items-center gap-1">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"/>
                        </svg>
                        หน้าปก
                      </span>
                    </div>
                    
                    {/* Delete Button */}
                    <button
                      type="button"
                      onClick={() => removeImage(0)}
                      className="absolute top-3 right-3 bg-red-500 hover:bg-red-600 text-white rounded-full w-10 h-10 flex items-center justify-center transition-all duration-300 shadow-lg hover:scale-110 transform"
                      title="ลบรูปภาพ"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                    
                    {/* Change Photo Button */}
                    <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <label className="bg-white hover:bg-gray-50 text-gray-800 px-4 py-2 rounded-full text-sm font-semibold shadow-lg cursor-pointer flex items-center gap-2 border-2 border-gray-200">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        เปลี่ยนรูปภาพ
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2 text-center">💡 รูปนี้จะแสดงเป็นหน้าปกของสรุปวิชา</p>
                </div>
              ) : (
                <label className="group flex flex-col items-center justify-center w-full h-64 border-3 border-dashed border-gray-300 rounded-2xl cursor-pointer hover:bg-gradient-to-br hover:from-blue-50 hover:to-indigo-50 transition-all duration-300 hover:border-blue-400 hover:shadow-lg">
                  <div className="flex flex-col items-center justify-center py-6 px-4">
                    <div className="mb-4 p-4 bg-blue-100 rounded-full group-hover:bg-blue-200 transition-colors duration-300">
                      <svg
                        className="w-12 h-12 text-blue-600 group-hover:scale-110 transition-transform duration-300"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                    <p className="text-base font-semibold text-gray-700 mb-1 group-hover:text-blue-600 transition-colors">
                      คลิกเพื่ออัปโหลดรูปภาพหน้าปก
                    </p>
                    <div className="flex items-center gap-2 text-xs text-gray-400 bg-gray-100 px-3 py-1.5 rounded-full">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                      PNG, JPG, JPEG (MAX. 5MB)
                    </div>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              )}

              {errors.images && (
                <p className="text-red-500 text-xs mt-2">{errors.images}</p>
              )}
            </div>

            {/* อัปโหลดไฟล์เอกสาร */}
            <div data-error="files">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                📄 ไฟล์เอกสาร (PDF) <span className="text-red-500">*</span>
              </label>

              {/* File Preview - Single file only */}
              {files.length > 0 ? (
                <div className="relative group">
                  <div className="relative overflow-hidden rounded-2xl border-4 border-green-200 shadow-lg transition-all duration-300 hover:shadow-2xl hover:border-green-400">
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-8">
                      <div className="flex flex-col items-center justify-center space-y-4">
                        {/* PDF Icon */}
                        <div className="p-6 bg-green-100 rounded-2xl group-hover:bg-green-200 transition-colors duration-300">
                          <svg
                            className="w-20 h-20 text-green-600 group-hover:scale-110 transition-transform duration-300"
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
                        </div>

                        {/* File Info */}
                        <div className="text-center">
                          <p className="text-base font-semibold text-gray-800 mb-1">{files[0].name}</p>
                          <p className="text-sm text-gray-500">{files[0].size} KB</p>
                        </div>
                      </div>
                    </div>

                    {/* Badge */}
                    <div className="absolute top-3 left-3">
                      <span className="bg-green-600 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg flex items-center gap-1">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                        </svg>
                        เอกสาร PDF
                      </span>
                    </div>

                    {/* Delete Button */}
                    <button
                      type="button"
                      onClick={() => removeFile(0)}
                      className="absolute top-3 right-3 bg-red-500 hover:bg-red-600 text-white rounded-full w-10 h-10 flex items-center justify-center transition-all duration-300 shadow-lg hover:scale-110 transform"
                      title="ลบไฟล์"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>

                    {/* Change File Button */}
                    <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <label className="bg-white hover:bg-gray-50 text-gray-800 px-4 py-2 rounded-full text-sm font-semibold shadow-lg cursor-pointer flex items-center gap-2 border-2 border-gray-200">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                        </svg>
                        เปลี่ยนไฟล์
                        <input
                          type="file"
                          accept=".pdf,application/pdf"
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2 text-center">💡 ไฟล์นี้จะถูกส่งให้ผู้ซื้อหลังจากชำระเงิน</p>
                </div>
              ) : (
                <label className={`group flex flex-col items-center justify-center w-full h-64 border-3 border-dashed rounded-2xl cursor-pointer hover:bg-gradient-to-br hover:from-green-50 hover:to-emerald-50 transition-all duration-300 hover:shadow-lg ${
                  errors.files ? 'border-red-500 hover:border-red-400' : 'border-gray-300 hover:border-green-400'
                }`}>
                  <div className="flex flex-col items-center justify-center py-6 px-4">
                    <div className="mb-4 p-4 bg-green-100 rounded-full group-hover:bg-green-200 transition-colors duration-300">
                      <svg
                        className="w-12 h-12 text-green-600 group-hover:scale-110 transition-transform duration-300"
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
                    </div>
                    <p className="text-base font-semibold text-gray-700 mb-1 group-hover:text-green-600 transition-colors">
                      คลิกเพื่ออัปโหลดไฟล์ PDF
                    </p>

                    <div className="flex items-center gap-2 text-xs text-gray-400 bg-gray-100 px-3 py-1.5 rounded-full">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                      PDF (MAX. 10MB)
                    </div>
                  </div>
                  <input
                    type="file"
                    accept=".pdf,application/pdf"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
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

        {/* Success Modal */}
        {showSuccessModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden animate-bounce-in">
              {/* Header */}
              <div className="bg-gradient-to-r from-green-500 to-emerald-500 px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="bg-white rounded-full p-2">
                    <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-white">อัปโหลดสำเร็จ!</h3>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 space-y-4">
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-yellow-700 font-medium">
                        สรุปของคุณกำลังรอการอนุมัติจาก Admin
                      </p>
                      <p className="text-xs text-yellow-600 mt-1">
                        เมื่อได้รับการอนุมัติแล้ว สรุปจะแสดงในหน้าร้านของคุณ
                      </p>
                    </div>
                  </div>
                </div>

                <p className="text-gray-600 text-center">คุณต้องการทำอะไรต่อ?</p>

                {/* Buttons */}
                <div className="space-y-3">
                  <button
                    onClick={() => {
                      const user = JSON.parse(localStorage.getItem('user') || '{}');
                      navigate(`/store/${user.id}`);
                    }}
                    className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl font-semibold transform hover:scale-105"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                    ไปที่ร้านของฉัน
                  </button>

                  <button
                    onClick={() => {
                      setShowSuccessModal(false);
                      setSuccess(false);
                      setFormData({
                        faculty: '',
                        course_id: '',
                        year: '',
                        exam_term: '',
                        title: '',
                        description: '',
                        price: '',
                      });
                      setImages([]);
                      setFiles([]);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="w-full flex items-center justify-center gap-2 bg-white text-blue-600 border-2 border-blue-600 px-6 py-3 rounded-xl hover:bg-blue-50 transition-all duration-300 font-semibold transform hover:scale-105"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    ขายสรุปเพิ่มเติม
                  </button>

                  <button
                    onClick={() => navigate('/')}
                    className="w-full text-gray-500 hover:text-gray-700 px-6 py-2 rounded-xl hover:bg-gray-100 transition-colors font-medium"
                  >
                    กลับหน้าหลัก
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DndProvider>
  );
};

export default SellItemPage;
