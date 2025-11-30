import React, { useState, useEffect } from "react";
import { ChevronDownIcon } from '@heroicons/react/24/solid';
import { getCourses, getCourseMajors, getCourseYears } from '../api/courses';

export default function FilterSidebar({
  onSemesterChange,
  onYearChange,
  onCourseChange,
  onConditionChange,
  onPriceRangeChange,
  onDepartmentChange,
  selectedSemester = 'all',
  selectedYear = 'all',
  selectedCourseId = 'all',
  selectedCondition = 'all',
  selectedDepartment = 'all'
}) {
  const [openSection, setOpenSection] = useState({
    semester: true,
    department: true,
    year: true,
    course: true,
    condition: true,
    price: true
  });
  const [priceMin, setPriceMin] = useState(0);
  const [priceMax, setPriceMax] = useState(200);
  const [availableCourses, setAvailableCourses] = useState([]);
  const [availableMajors, setAvailableMajors] = useState([]);
  const [availableYears, setAvailableYears] = useState([]);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // โหลดข้อมูลสาขาและชั้นปีเมื่อเริ่มต้น
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [majorsRes, yearsRes] = await Promise.all([
          getCourseMajors(),
          getCourseYears()
        ]);
        setAvailableMajors(majorsRes.data || []);
        setAvailableYears(yearsRes.data || []);
      } catch (error) {
        console.error('Error loading initial data:', error);
      }
    };
    fetchInitialData();
  }, []);

  // อัพเดทรายการวิชาเมื่อเลือกชั้นปีหรือสาขา
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await getCourses(selectedDepartment, selectedYear);
        setAvailableCourses(response.data || []);
      } catch (error) {
        console.error('Error loading courses:', error);
        setAvailableCourses([]);
      }
    };
    fetchCourses();
  }, [selectedYear, selectedDepartment]);

  // Toggle section แสดง/ซ่อน
  const toggleSection = (section) => {
    setOpenSection(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handlePriceChange = () => {
    // ตรวจสอบว่าราคาไม่ติดลบ
    const validMin = Math.max(0, priceMin);
    const validMax = Math.max(0, priceMax);
    
    // ตรวจสอบว่าราคาต่ำสุดไม่เกินราคาสูงสุด
    if (validMin > validMax) {
      setErrorMessage('ราคาต่ำสุดต้องไม่มากกว่าราคาสูงสุด');
      setShowError(true);
      setTimeout(() => setShowError(false), 3000);
      return;
    }
    
    // อัพเดทค่าที่ถูกต้อง
    setPriceMin(validMin);
    setPriceMax(validMax);
    
    if (onPriceRangeChange) {
      onPriceRangeChange(validMin, validMax);
    }
  };

  return (
    <aside className="bg-white shadow-lg rounded-2xl p-6 space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-gray-800">🔍 ตัวกรอง</h3>
      </div>

      {/* Department Filter */}
      <div className="border-b border-gray-200 pb-4">
        <button
          onClick={() => toggleSection('department')}
          className="w-full flex items-center justify-between py-2 text-left font-semibold text-gray-700 hover:text-viridian-600 transition-colors"
        >
          <span>🏛️ สาขา</span>
          <ChevronDownIcon
            className={`w-5 h-5 transition-transform ${openSection.department ? 'rotate-180' : ''}`}
          />
        </button>
        {openSection.department && (
          <div className="mt-3 space-y-2">
            <label className="flex items-center gap-2 cursor-pointer group">
              <input
                type="radio"
                name="department"
                value="all"
                checked={selectedDepartment === 'all'}
                onChange={(e) => onDepartmentChange && onDepartmentChange(e.target.value)}
                className="w-4 h-4 text-viridian-600 focus:ring-viridian-500"
              />
              <span className="text-gray-700 group-hover:text-viridian-600 transition-colors">
                ทุกสาขา
              </span>
            </label>
            {availableMajors.map(major => (
              <label key={major} className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="radio"
                  name="department"
                  value={major}
                  checked={selectedDepartment === major}
                  onChange={(e) => onDepartmentChange && onDepartmentChange(e.target.value)}
                  className="w-4 h-4 text-viridian-600 focus:ring-viridian-500"
                />
                <span className="text-gray-700 group-hover:text-viridian-600 transition-colors">
                  {major}
                </span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Semester Filter */}
      {/* <div className="border-b border-gray-200 pb-4">
        <button
          onClick={() => toggleSection('semester')}
          className="w-full flex items-center justify-between py-2 text-left font-semibold text-gray-700 hover:text-viridian-600 transition-colors"
        >
          <span>📚 ประเภทการสอบ</span>
          <ChevronDownIcon
            className={`w-5 h-5 transition-transform ${openSection.semester ? 'rotate-180' : ''}`}
          />
        </button>
        {openSection.semester && (
          <div className="mt-3 space-y-2">
            <label className="flex items-center gap-2 cursor-pointer group">
              <input
                type="radio"
                name="semester"
                value="all"
                checked={selectedSemester === 'all'}
                onChange={(e) => onSemesterChange && onSemesterChange(e.target.value)}
                className="w-4 h-4 text-viridian-600 focus:ring-viridian-500"
              />
              <span className="text-gray-700 group-hover:text-viridian-600 transition-colors">
                ทั้งหมด
              </span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer group">
              <input
                type="radio"
                name="semester"
                value="Midterm"
                checked={selectedSemester === 'Midterm'}
                onChange={(e) => onSemesterChange && onSemesterChange(e.target.value)}
                className="w-4 h-4 text-viridian-600 focus:ring-viridian-500"
              />
              <span className="text-gray-700 group-hover:text-viridian-600 transition-colors">
                Midterm
              </span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer group">
              <input
                type="radio"
                name="semester"
                value="Final"
                checked={selectedSemester === 'Final'}
                onChange={(e) => onSemesterChange && onSemesterChange(e.target.value)}
                className="w-4 h-4 text-viridian-600 focus:ring-viridian-500"
              />
              <span className="text-gray-700 group-hover:text-viridian-600 transition-colors">
                Final
              </span>
            </label>
          </div>
        )}
      </div> */}

      {/* Year Filter */}
      <div className="border-b border-gray-200 pb-4">
        <button
          onClick={() => toggleSection('year')}
          className="w-full flex items-center justify-between py-2 text-left font-semibold text-gray-700 hover:text-viridian-600 transition-colors"
        >
          <span>🎓 ชั้นปี</span>
          <ChevronDownIcon
            className={`w-5 h-5 transition-transform ${openSection.year ? 'rotate-180' : ''}`}
          />
        </button>
        {openSection.year && (
          <div className="mt-3 space-y-2">
            <label className="flex items-center gap-2 cursor-pointer group">
              <input
                type="radio"
                name="year"
                value="all"
                checked={selectedYear === 'all'}
                onChange={(e) => {
                  onYearChange && onYearChange(e.target.value);
                  onCourseChange && onCourseChange('all'); // รีเซ็ตการเลือกวิชาเมื่อเปลี่ยนปี
                }}
                className="w-4 h-4 text-viridian-600 focus:ring-viridian-500"
              />
              <span className="text-gray-700 group-hover:text-viridian-600 transition-colors">
                ทุกชั้นปี
              </span>
            </label>
            {availableYears.map(year => (
              <label key={year} className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="radio"
                  name="year"
                  value={year}
                  checked={selectedYear === year}
                  onChange={(e) => {
                    onYearChange && onYearChange(e.target.value);
                    onCourseChange && onCourseChange('all'); // รีเซ็ตการเลือกวิชาเมื่อเปลี่ยนปี
                  }}
                  className="w-4 h-4 text-viridian-600 focus:ring-viridian-500"
                />
                <span className="text-gray-700 group-hover:text-viridian-600 transition-colors">
                  ชั้นปี {year}
                </span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Course Filter - แสดงเสมอ แต่ disable เมื่อเลือก "ทุกชั้นปี" */}
      {availableCourses.length > 0 && (
        <div className={`border-b border-gray-200 pb-4 ${selectedYear === 'all' ? 'opacity-60' : ''}`}>
          <button
            onClick={() => selectedYear !== 'all' && toggleSection('course')}
            className={`w-full flex items-center justify-between py-2 text-left font-semibold transition-colors ${selectedYear === 'all'
              ? 'text-gray-400 cursor-not-allowed'
              : 'text-gray-700 hover:text-viridian-600'
              }`}
          >
            <span>📖 รายวิชา</span>
            <ChevronDownIcon
              className={`w-5 h-5 transition-transform ${openSection.course ? 'rotate-180' : ''} ${selectedYear === 'all' ? 'text-gray-400' : ''
                }`}
            />
          </button>
          {openSection.course && (
            <div className="mt-3 space-y-2 max-h-64 overflow-y-auto">
              {/* แสดงข้อความเตือนเมื่อเลือก "ทุกชั้นปี" และไม่แสดงรายการวิชา */}
              {selectedYear === 'all' ? (
                <div className="p-3 bg-gray-50 border border-gray-300 rounded-lg">
                  <p className="text-xs text-gray-500 text-center">
                    กรุณาเลือกชั้นปีก่อนเพื่อกรองตามวิชา
                  </p>
                </div>
              ) : (
                <>
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input
                      type="radio"
                      name="course"
                      value="all"
                      checked={selectedCourseId === 'all'}
                      onChange={(e) => onCourseChange && onCourseChange(e.target.value)}
                      className="w-4 h-4 text-viridian-600 focus:ring-viridian-500"
                    />
                    <span className="text-gray-700 group-hover:text-viridian-600 transition-colors">
                      ทุกวิชา
                    </span>
                  </label>
                  {availableCourses.map(course => (
                    <label
                      key={course.id}
                      className="flex items-start gap-2 cursor-pointer group"
                    >
                      <input
                        type="radio"
                        name="course"
                        value={course.id.toString()}
                        checked={selectedCourseId === course.id.toString()}
                        onChange={(e) => onCourseChange && onCourseChange(e.target.value)}
                        className="w-4 h-4 mt-1 text-viridian-600 focus:ring-viridian-500"
                      />
                      <span className="text-sm text-gray-700 group-hover:text-viridian-600 transition-colors">
                        {course.code} - {course.name}
                      </span>
                    </label>
                  ))}
                </>
              )}
            </div>
          )}
        </div>
      )}

      {/* Condition Filter */}
      {/* <div className="border-b border-gray-200 pb-4">
        <button
          onClick={() => toggleSection('condition')}
          className="w-full flex items-center justify-between py-2 text-left font-semibold text-gray-700 hover:text-viridian-600 transition-colors"
        >
          <span>⭐ สภาพหนังสือ</span>
          <ChevronDownIcon
            className={`w-5 h-5 transition-transform ${openSection.condition ? 'rotate-180' : ''}`}
          />
        </button>
        {openSection.condition && (
          <div className="mt-3 space-y-2">
            <label className="flex items-center gap-2 cursor-pointer group">
              <input
                type="radio"
                name="condition"
                value="all"
                checked={selectedCondition === 'all'}
                onChange={(e) => onConditionChange && onConditionChange(e.target.value)}
                className="w-4 h-4 text-viridian-600 focus:ring-viridian-500"
              />
              <span className="text-gray-700 group-hover:text-viridian-600 transition-colors">
                ทั้งหมด
              </span>
            </label>
            {['ดีมาก', 'ดี', 'พอใช้'].map(condition => (
              <label key={condition} className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="radio"
                  name="condition"
                  value={condition}
                  checked={selectedCondition === condition}
                  onChange={(e) => onConditionChange && onConditionChange(e.target.value)}
                  className="w-4 h-4 text-viridian-600 focus:ring-viridian-500"
                />
                <span className="text-gray-700 group-hover:text-viridian-600 transition-colors">
                  {condition}
                </span>
              </label>
            ))}
          </div>
        )}
      </div> */}

      {/* Price Range Filter */}
      <div className="pb-4">
        <button
          onClick={() => toggleSection('price')}
          className="w-full flex items-center justify-between py-2 text-left font-semibold text-gray-700 hover:text-viridian-600 transition-colors"
        >
          <span>💰 ช่วงราคา</span>
          <ChevronDownIcon
            className={`w-5 h-5 transition-transform ${openSection.price ? 'rotate-180' : ''}`}
          />
        </button>
        {openSection.price && (
          <div className="mt-3 space-y-4">
            <div className="flex gap-2 items-center">
              <input
                type="number"
                placeholder="Min"
                min="0"
                value={priceMin}
                onChange={(e) => setPriceMin(Math.max(0, Number(e.target.value)))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-viridian-500"
              />
              <span className="text-gray-500">-</span>
              <input
                type="number"
                placeholder="Max"
                min="0"
                value={priceMax}
                onChange={(e) => setPriceMax(Math.max(0, Number(e.target.value)))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-viridian-500"
              />
            </div>
            <button
              onClick={handlePriceChange}
              className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 active:bg-green-800 shadow-lg hover:shadow-xl transition-all duration-200 font-bold text-base"
            >
              ใช้ตัวกรอง
            </button>
            {showError && (
              <div className="text-sm text-red-600 font-semibold text-center bg-red-50 p-3 rounded-lg border border-red-200">
                ⚠️ {errorMessage}
              </div>
            )}
            <div className="text-sm text-gray-600 text-center">
              ฿{priceMin} - ฿{priceMax}
            </div>
          </div>
        )}
      </div>
    </aside >
  );
}