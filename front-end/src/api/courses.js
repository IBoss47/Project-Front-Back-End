import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

// ดึงรายวิชาทั้งหมด พร้อมกรองตาม major และ year
export const getCourses = async (major = '', year = '') => {
  try {
    const params = {};
    if (major && major !== 'all') params.major = major;
    if (year && year !== 'all') params.year = year;
    
    const response = await axios.get(`${API_URL}/courses`, { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching courses:', error);
    throw error;
  }
};

// ดึงรายชื่อสาขาทั้งหมด
export const getCourseMajors = async () => {
  try {
    const response = await axios.get(`${API_URL}/courses/majors`);
    return response.data;
  } catch (error) {
    console.error('Error fetching majors:', error);
    throw error;
  }
};

// ดึงรายชื่อชั้นปีทั้งหมด
export const getCourseYears = async () => {
  try {
    const response = await axios.get(`${API_URL}/courses/years`);
    return response.data;
  } catch (error) {
    console.error('Error fetching years:', error);
    throw error;
  }
};
