import React, { useState, useEffect } from "react";
import { ChevronDownIcon } from '@heroicons/react/24/solid';
import { getCoursesByYear, getAllCourses } from '../data/mockBooksData';

export default function FilterSidebar({
  onSemesterChange,
  onYearChange,
  onCourseChange,
  onConditionChange,
  onPriceRangeChange,
  selectedSemester = 'all',
  selectedYear = 'all',
  selectedCourseId = 'all',
  selectedCondition = 'all'
}) {
  const [openSection, setOpenSection] = useState({
    semester: true,
    year: true,
    course: true,
    condition: true,
    price: true
  });
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState(''); // ว่าง = ไม่จำกัด
  const [availableCourses, setAvailableCourses] = useState([]);

  // อัพเดทรายการวิชาเมื่อเลือกชั้นปี
  useEffect(() => {
    if (selectedYear === 'all') {
      // แสดงวิชาทั้งหมดแต่ disable ไว้
      const allCourses = getAllCourses();
      setAvailableCourses(allCourses);
    } else {
      const courses = getCoursesByYear(selectedYear);
      setAvailableCourses(courses);
    }
  }, [selectedYear]);

  // Toggle section แสดง/ซ่อน
  const toggleSection = (section) => {
    setOpenSection(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handlePriceChange = () => {
    if (onPriceRangeChange) {
      onPriceRangeChange(priceMin, priceMax);
    }
  };

  return (
    <aside className="bg-white shadow-lg rounded-2xl p-6 space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-gray-800">🔍 ตัวกรอง</h3>
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
            {[1, 2, 3, 4].map(year => (
              <label key={year} className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="radio"
                  name="year"
                  value={year.toString()}
                  checked={selectedYear === year.toString()}
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
                        {course.course_code} - {course.course_name}
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
                min="0"
                placeholder="ต่ำสุด"
                value={priceMin}
                onChange={(e) => {
                  let inputValue = e.target.value;
                  // ถ้าติดลบ เปลี่ยนเป็น 0 ทันที
                  if (Number(inputValue) < 0) {
                    inputValue = '0';
                  }
                  setPriceMin(inputValue);
                  // แปลงเป็นตัวเลขสำหรับ filter (ว่าง = 0)
                  const numValue = inputValue === '' ? 0 : Number(inputValue);
                  const maxValue = priceMax === '' ? Infinity : Math.max(0, Number(priceMax));
                  if (onPriceRangeChange) {
                    onPriceRangeChange(numValue, maxValue);
                  }
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-viridian-500"
              />
              <span className="text-gray-500">-</span>
              <input
                type="number"
                min="0"
                placeholder="สูงสุด"
                value={priceMax}
                onChange={(e) => {
                  let inputValue = e.target.value;
                  // ถ้าติดลบ เปลี่ยนเป็น 0 ทันที
                  if (Number(inputValue) < 0) {
                    inputValue = '0';
                  }
                  setPriceMax(inputValue);
                  // แปลงเป็นตัวเลขสำหรับ filter (ว่าง = ไม่จำกัด)
                  const minValue = priceMin === '' ? 0 : Math.max(0, Number(priceMin));
                  const numValue = inputValue === '' ? Infinity : Number(inputValue);
                  if (onPriceRangeChange) {
                    onPriceRangeChange(minValue, numValue);
                  }
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-viridian-500"
              />
            </div>
            <div className="text-sm text-gray-600 text-center">
              ฿{priceMin === '' ? 0 : priceMin} - {priceMax === '' ? 'ไม่จำกัด' : `฿${priceMax}`}
            </div>
          </div>
        )}
      </div>
    </aside >
  );
}