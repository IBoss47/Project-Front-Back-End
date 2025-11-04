import React, { useState } from "react";
import { ChevronDownIcon } from '@heroicons/react/24/solid';

// วิชาแต่ละปี ตัวอย่าง
const subjectOptions = {
  "ปี 1": [
    "511 110 : แคลคูลัสสําหรับการวิเคราะห์ข้อมูล 1", 
    "515 104 : สถิติสําหรับคอมพิวเตอร์ ", 
    "517 111 : การเขียนโปรแกรมคอมพิวเตอร์สําหรับนักวิทยาการข้อมูล",
    "511 111 : แคลคูลัสสําหรับการวิเคราะห์ข้อมูล 2",
    "515 271 : ความน่าจะเป็นสําหรับวิทยาการข้อมูล",
    "522 151 : พื้นฐานวิทยาการข้อมูล"
  ],
  "ปี 2": ["สถิติ", "เคมีพื้นฐาน", "ภาษาอังกฤษ"],
  "ปี 3": ["ชีววิทยา", "แคลคูลัส", "ประวัติศาสตร์"],
  "ปี 4": ["วิจัย", "การออกแบบระบบ", "สัมมนา"]
};

const yearList = ["ปี 1", "ปี 2", "ปี 3", "ปี 4"];

export default function FilterSidebar() {
  const [openSection, setOpenSection] = useState({ subject: true, course: true });
  const [selectedYear, setSelectedYear] = useState("ปี 1");
  const [selectedSubjects, setSelectedSubjects] = useState([]);

  // Toggle section แสดง/ซ่อน
  const toggleSection = (section) => {
    setOpenSection(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // อัปเดตปี และล้างรายวิชาเดิมเมื่อปีเปลี่ยน
  const handleYearChange = (year) => {
    setSelectedYear(year);
    setSelectedSubjects([]); // ล้างรายวิชาเดิม
  };

  // อัปเดตรายวิชาที่เลือก
  const handleSubjectChange = (subject) => {
    setSelectedSubjects(prev =>
      prev.includes(subject)
        ? prev.filter(s => s !== subject)
        : [...prev, subject]
    );
  };

  return (
    <aside className="w-64 bg-white shadow-lg rounded-2xl p-4 space-y-4">
      <h2 className="text-lg font-semibold text-gray-700 mb-2">Filter</h2>

      {/* Section ชั้นปี */}
      <div className="border rounded-lg overflow-hidden">
        <button
          onClick={() => toggleSection("subject")}
          className="w-full flex justify-between items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium"
        >
          ชั้นปี
          <ChevronDownIcon
            className={`h-5 w-5 transform transition-transform duration-300
              ${openSection.subject ? 'rotate-180' : ''}
            `}
          />
        </button>
        {openSection.subject && (
          <div className="p-3 space-y-2">
            {yearList.map((year) => (
              <label key={year} className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="year"
                  value={year}
                  checked={selectedYear === year}
                  onChange={() => handleYearChange(year)}
                  className="w-4 h-4 text-blue-500"
                />
                <span>{year}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Section รายวิชา */}
      <div className="border rounded-lg overflow-hidden">
        <button
          onClick={() => toggleSection("course")}
          className="w-full flex justify-between items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium"
        >
          รายวิชา
          <ChevronDownIcon
            className={`h-5 w-5 transform transition-transform duration-300
              ${openSection.course ? 'rotate-180' : ''}
            `}
          />
        </button>
        {openSection.course && (
          <div className="p-3 space-y-2">
            {(subjectOptions[selectedYear] || []).map((subject) => (
              <label key={subject} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={selectedSubjects.includes(subject)}
                  onChange={() => handleSubjectChange(subject)}
                  className="w-4 h-4 text-blue-500"
                />
                <span>{subject}</span>
              </label>
            ))}
          </div>
        )}
      </div>
    </aside>
  );
}