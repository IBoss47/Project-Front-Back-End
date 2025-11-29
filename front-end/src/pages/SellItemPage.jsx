import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/auth';

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

  const [image, setImage] = useState(null); // เก็บแค่รูปเดียว
  const [pdfFile, setPdfFile] = useState(null); // เก็บแค่ไฟล์ PDF เดียว
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

  // Handle image upload (แค่รูปเดียว)
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // ตรวจสอบว่าเป็นไฟล์รูปภาพ
      if (!file.type.startsWith('image/')) {
        setApiError('กรุณาเลือกไฟล์รูปภาพเท่านั้น');
        return;
      }
      
      // ตรวจสอบขนาดไฟล์ (ไม่เกิน 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setApiError('ขนาดไฟล์ต้องไม่เกิน 5MB');
        return;
      }

      // ลบรูปเก่าถ้ามี
      if (image) {
        URL.revokeObjectURL(image.preview);
      }

      setImage({
        file,
        preview: URL.createObjectURL(file),
      });
      
      // Clear error ถ้ามี
      if (errors.images) {
        setErrors(prev => ({ ...prev, images: '' }));
      }
    }
    e.target.value = ''; // Reset input
  };

  // Handle file upload (แค่ไฟล์เดียว)
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // ตรวจสอบว่าเป็นไฟล์ PDF
      if (file.type !== 'application/pdf') {
        setApiError('กรุณาเลือกไฟล์ PDF เท่านั้น');
        return;
      }
      
      // ตรวจสอบขนาดไฟล์ (ไม่เกิน 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setApiError('ขนาดไฟล์ต้องไม่เกิน 10MB');
        return;
      }

      setPdfFile({
        file,
        name: file.name,
        size: (file.size / 1024 / 1024).toFixed(2), // MB
      });
      
      // Clear error ถ้ามี
      if (errors.files) {
        setErrors(prev => ({ ...prev, files: '' }));
      }
    }
    e.target.value = ''; // Reset input
  };

  // Remove image
  const removeImage = () => {
    if (image) {
      URL.revokeObjectURL(image.preview);
      setImage(null);
    }
  };

  // Remove file
  const removeFile = () => {
    setPdfFile(null);
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
    if (!image) newErrors.images = 'กรุณาอัปโหลดรูปปก';
    if (!pdfFile) newErrors.files = 'กรุณาอัปโหลดไฟล์ PDF';

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

      // เพิ่มรูปปก
      if (image) {
        submitData.append('images', image.file);
      }

      // เพิ่มไฟล์ PDF
      if (pdfFile) {
        submitData.append('pdf', pdfFile.file);
      }

      console.log('📦 Submitting data:', {
        ...formData,
        image: image ? image.file.name : null,
        pdf: pdfFile ? pdfFile.name : null,
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
                รูปปก <span className="text-red-500">*</span>
              </label>
              
              {!image ? (
                <div className="mb-4">
                  <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <svg
                        className="w-12 h-12 text-gray-400 mb-3"
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
                      <p className="text-sm text-gray-500 font-medium">📂 คลิกเพื่ออัปโหลดรูปปก</p>
                      <p className="text-xs text-gray-400 mt-2">PNG, JPG, JPEG, WebP</p>
                      <p className="text-xs text-gray-400">(ขนาดไม่เกิน 5MB)</p>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              ) : (
                <div className="relative inline-block mb-4">
                  <img
                    src={image.preview}
                    alt="รูปปก"
                    className="w-64 h-80 object-cover rounded-lg border-2 border-blue-500 shadow-lg"
                  />
                  {/* ป้ายหน้าปก */}
                  <div className="absolute top-2 left-2 bg-blue-600 text-white text-xs px-3 py-1 rounded-lg font-bold shadow">
                    📖 หน้าปก
                  </div>
                  {/* ปุ่มลบ */}
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-lg hover:bg-red-600 transition-colors shadow-lg"
                    title="ลบรูป"
                  >
                    ×
                  </button>
                  {/* ปุ่มเปลี่ยนรูป */}
                  <div className="mt-3">
                    <label className="cursor-pointer inline-flex items-center px-4 py-2 bg-gray-600 text-white text-sm font-medium rounded-lg hover:bg-gray-700 transition-colors">
                      🔄 เปลี่ยนรูป
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
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
              
              {!pdfFile ? (
                <div className="mb-4">
                  <label className={`flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50 transition-colors ${
                    errors.files ? 'border-red-500' : 'border-gray-300'
                  }`}>
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <svg
                        className="w-12 h-12 text-gray-400 mb-3"
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
                      <p className="text-sm text-gray-500 font-medium">📄 คลิกเพื่ออัปโหลดไฟล์ PDF</p>
                      <p className="text-xs text-gray-400 mt-2">รองรับไฟล์ PDF เท่านั้น</p>
                      <p className="text-xs text-gray-400">(ขนาดไม่เกิน 10MB)</p>
                    </div>
                    <input
                      type="file"
                      accept=".pdf,application/pdf"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              ) : (
                <div className="mb-4">
                  <div className="relative inline-block w-full max-w-md p-6 bg-blue-50 border-2 border-blue-500 rounded-lg">
                    <div className="flex items-start gap-4">
                      {/* PDF Icon */}
                      <div className="flex-shrink-0">
                        <svg
                          className="w-16 h-16 text-blue-600"
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
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-blue-900 truncate" title={pdfFile.name}>
                              📄 {pdfFile.name}
                            </p>
                            <p className="text-xs text-blue-700 mt-1">
                              ขนาด: {pdfFile.size} MB
                            </p>
                          </div>
                          
                          {/* ปุ่มลบ */}
                          <button
                            type="button"
                            onClick={removeFile}
                            className="flex-shrink-0 bg-red-500 text-white rounded-full w-7 h-7 flex items-center justify-center text-lg hover:bg-red-600 transition-colors shadow-lg"
                            title="ลบไฟล์"
                          >
                            ×
                          </button>
                        </div>
                        
                        {/* ป้ายสถานะ */}
                        <div className="inline-flex items-center px-3 py-1 bg-green-100 text-green-800 text-xs font-bold rounded-full">
                          ✓ พร้อมอัปโหลด
                        </div>
                      </div>
                    </div>
                    
                    {/* ปุ่มเปลี่ยนไฟล์ */}
                    <div className="mt-4">
                      <label className="cursor-pointer inline-flex items-center px-4 py-2 bg-gray-600 text-white text-sm font-medium rounded-lg hover:bg-gray-700 transition-colors">
                        🔄 เปลี่ยนไฟล์
                        <input
                          type="file"
                          accept=".pdf,application/pdf"
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
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
  );
};

export default SellItemPage;
