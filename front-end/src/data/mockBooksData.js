// Mock Users Data
const usersData = [
    {
        id: 1,
        username: 'boss47',
        email: 'boss@example.com',
        full_name: 'Boss Nattawut',
        phone: '0812345678'
    },
    {
        id: 2,
        username: 'student01',
        email: 'student01@example.com',
        full_name: 'นักศึกษา ชั้นปี 1',
        phone: '0823456789'
    },
    {
        id: 3,
        username: 'student02',
        email: 'student02@example.com',
        full_name: 'นักศึกษา ชั้นปี 2',
        phone: '0834567890'
    },
    {
        id: 4,
        username: 'student03',
        email: 'student03@example.com',
        full_name: 'จิรายุ สมชาย',
        phone: '0845678901'
    },
    {
        id: 5,
        username: 'student04',
        email: 'student04@example.com',
        full_name: 'สมหญิง ดีมาก',
        phone: '0856789012'
    }
];

// Mock Courses Data
const coursesData = [
    // ชั้นปี 1
    { id: 1, course_code: 'CS101', course_name: 'Introduction to Programming', course_year: 1, department: 'Computer Science' },
    { id: 2, course_code: 'MATH101', course_name: 'Calculus I', course_year: 1, department: 'Mathematics' },
    { id: 3, course_code: 'PHY101', course_name: 'General Physics I', course_year: 1, department: 'Physics' },
    { id: 4, course_code: 'STAT101', course_name: 'Introduction to Statistics', course_year: 1, department: 'Statistics' },
    { id: 5, course_code: 'MATH102', course_name: 'Discrete Mathematics', course_year: 1, department: 'Mathematics' },

    // ชั้นปี 2
    { id: 6, course_code: 'CS201', course_name: 'Data Structures and Algorithms', course_year: 2, department: 'Computer Science' },
    { id: 7, course_code: 'CS202', course_name: 'Web Development', course_year: 2, department: 'Computer Science' },
    { id: 8, course_code: 'CS203', course_name: 'Mobile Application Development', course_year: 2, department: 'Computer Science' },
    { id: 9, course_code: 'MATH201', course_name: 'Linear Algebra', course_year: 2, department: 'Mathematics' },

    // ชั้นปี 3
    { id: 10, course_code: 'CS301', course_name: 'Human-Computer Interaction', course_year: 3, department: 'Computer Science' },
    { id: 11, course_code: 'CS302', course_name: 'Database Management Systems', course_year: 3, department: 'Computer Science' },
    { id: 12, course_code: 'CS303', course_name: 'Operating Systems', course_year: 3, department: 'Computer Science' },
    { id: 13, course_code: 'CS304', course_name: 'Computer Networks', course_year: 3, department: 'Computer Science' },
    { id: 14, course_code: 'CS305', course_name: 'Algorithm Design and Analysis', course_year: 3, department: 'Computer Science' },
    { id: 15, course_code: 'CS306', course_name: 'Software Engineering', course_year: 3, department: 'Computer Science' },

    // ชั้นปี 4
    { id: 16, course_code: 'CS401', course_name: 'Artificial Intelligence', course_year: 4, department: 'Computer Science' },
    { id: 17, course_code: 'CS402', course_name: 'Machine Learning', course_year: 4, department: 'Computer Science' },
    { id: 18, course_code: 'CS403', course_name: 'Cloud Computing', course_year: 4, department: 'Computer Science' }
];

// Mock Books Data - ตามโครงสร้าง database books_for_sale
const booksForSaleData = [
    {
        id: 1,
        book_title: 'Final HCI',
        book_code: 'HCI-FINAL-2024',
        price: 89.00,
        seller_id: 1,
        seller_name: 'Boss Nattawut',
        course_id: 10, // CS301 - Human-Computer Interaction
        semester: 'Final',
        description: 'หนังสือสรุป Final สำหรับวิชา Human-Computer Interaction มีเนื้อหาครบถ้วน พร้อมข้อสอบเก่า',
        condition: 'ดีมาก',
        book_cover: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=400&h=600&fit=crop',
        book_image: '/Images/books/hci-final.jpg',
        status: 'available',
        created_at: '2024-11-01T10:00:00Z',
        reviews: 45
    },
    {
        id: 2,
        book_title: 'Midterm Data Structures',
        book_code: 'DS-MID-2024',
        price: 120.00,
        seller_id: 2,
        seller_name: 'นักศึกษา ชั้นปี 1',
        course_id: 6, // CS201 - Data Structures and Algorithms
        semester: 'Midterm',
        description: 'หนังสือ Data Structures และ Algorithms สรุปเนื้อหา Midterm พร้อมตัวอย่างโค้ด',
        condition: 'ดี',
        book_cover: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=600&fit=crop',
        book_image: '/Images/books/ds-mid.jpg',
        status: 'available',
        created_at: '2024-11-02T14:30:00Z',
        reviews: 38
    },
    {
        id: 3,
        book_title: 'Database Systems Final',
        book_code: 'DB-FINAL-2024',
        price: 150.00,
        seller_id: 1,
        seller_name: 'Boss Nattawut',
        course_id: 11, // CS302 - Database Management Systems
        semester: 'Final',
        description: 'หนังสือสรุป Database Systems ครอบคลุมทั้ง SQL, NoSQL และ Transaction Management',
        condition: 'ดี',
        book_cover: 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=400&h=600&fit=crop',
        book_image: '/Images/books/db-final.jpg',
        status: 'available',
        created_at: '2024-11-03T09:15:00Z',
        reviews: 52
    },
    {
        id: 4,
        book_title: 'Calculus I Midterm',
        book_code: 'MATH101-MID',
        price: 95.00,
        seller_id: 3,
        seller_name: 'นักศึกษา ชั้นปี 2',
        course_id: 2, // MATH101 - Calculus I
        semester: 'Midterm',
        description: 'หนังสือแคลคูลัส 1 สรุป Limit, Derivative พร้อมโจทย์แบบฝึกหัด',
        condition: 'พอใช้',
        book_cover: 'https://images.unsplash.com/photo-1509021436665-8f07dbf5bf1d?w=400&h=600&fit=crop',
        book_image: '/Images/books/calc-mid.jpg',
        status: 'available',
        created_at: '2024-11-04T16:20:00Z',
        reviews: 28
    },
    {
        id: 5,
        book_title: 'Programming Fundamentals',
        book_code: 'PROG-101-2024',
        price: 110.00,
        seller_id: 2,
        seller_name: 'นักศึกษา ชั้นปี 1',
        course_id: 1, // CS101 - Introduction to Programming
        semester: 'Final',
        description: 'หนังสือพื้นฐานการเขียนโปรแกรม ภาษา C++ และ Python',
        condition: 'ดีมาก',
        book_cover: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=400&h=600&fit=crop',
        book_image: '/Images/books/prog-final.jpg',
        status: 'sold',
        created_at: '2024-10-28T11:00:00Z',
        reviews: 65
    },
    {
        id: 6,
        book_title: 'Operating Systems Final',
        book_code: 'OS-FINAL-2024',
        price: 135.00,
        seller_id: 4,
        seller_name: 'จิรายุ สมชาย',
        course_id: 12, // CS303 - Operating Systems
        semester: 'Final',
        description: 'สรุปเนื้อหา OS ครอบคลุม Process, Thread, Memory Management',
        condition: 'ดี',
        book_cover: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&h=600&fit=crop',
        book_image: '/Images/books/os-final.jpg',
        status: 'available',
        created_at: '2024-11-05T13:45:00Z',
        reviews: 41
    },
    {
        id: 7,
        book_title: 'Linear Algebra Midterm',
        book_code: 'MATH201-MID',
        price: 105.00,
        seller_id: 3,
        seller_name: 'นักศึกษา ชั้นปี 2',
        course_id: 9, // MATH201 - Linear Algebra
        semester: 'Midterm',
        description: 'หนังสือ Linear Algebra สรุป Matrix, Vector Space',
        condition: 'ดีมาก',
        book_cover: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=400&h=600&fit=crop',
        book_image: '/Images/books/linear-mid.jpg',
        status: 'available',
        created_at: '2024-11-06T08:30:00Z',
        reviews: 33
    },
    {
        id: 8,
        book_title: 'Computer Networks Final',
        book_code: 'NET-FINAL-2024',
        price: 145.00,
        seller_id: 5,
        seller_name: 'สมหญิง ดีมาก',
        course_id: 13, // CS304 - Computer Networks
        semester: 'Final',
        description: 'สรุป Computer Networks ครอบคลุม TCP/IP, Routing, Security',
        condition: 'ดี',
        book_cover: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=400&h=600&fit=crop',
        book_image: '/Images/books/network-final.jpg',
        status: 'available',
        created_at: '2024-11-07T15:00:00Z',
        reviews: 48
    },
    {
        id: 9,
        book_title: 'Physics I Midterm',
        book_code: 'PHY101-MID',
        price: 85.00,
        seller_id: 2,
        seller_name: 'นักศึกษา ชั้นปี 1',
        course_id: 3, // PHY101 - General Physics I
        semester: 'Midterm',
        description: 'หนังสือฟิสิกส์ 1 สรุป Mechanics, Motion',
        condition: 'ดี',
        book_cover: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400&h=600&fit=crop',
        book_image: '/Images/books/physics-mid.jpg',
        status: 'reserved',
        created_at: '2024-11-01T12:00:00Z',
        reviews: 22
    },
    {
        id: 10,
        book_title: 'Web Development Final',
        book_code: 'WEB-FINAL-2024',
        price: 125.00,
        seller_id: 1,
        seller_name: 'Boss Nattawut',
        course_id: 7, // CS202 - Web Development
        semester: 'Final',
        description: 'สรุปเนื้อหา Web Development ครอบคลุม HTML, CSS, JavaScript, React',
        condition: 'ดีมาก',
        book_cover: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400&h=600&fit=crop',
        book_image: '/Images/books/web-final.jpg',
        status: 'available',
        created_at: '2024-11-08T10:00:00Z',
        reviews: 58
    },
    {
        id: 11,
        book_title: 'Algorithm Design Midterm',
        book_code: 'ALG-MID-2024',
        price: 130.00,
        seller_id: 4,
        seller_name: 'จิรายุ สมชาย',
        course_id: 14, // CS305 - Algorithm Design and Analysis
        semester: 'Midterm',
        description: 'หนังสือ Algorithm Design สรุป Greedy, Dynamic Programming',
        condition: 'ดี',
        book_cover: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=400&h=600&fit=crop',
        book_image: '/Images/books/algo-mid.jpg',
        status: 'available',
        created_at: '2024-11-02T11:30:00Z',
        reviews: 44
    },
    {
        id: 12,
        book_title: 'Statistics Midterm',
        book_code: 'STAT101-MID',
        price: 90.00,
        seller_id: 5,
        seller_name: 'สมหญิง ดีมาก',
        course_id: 4, // STAT101 - Introduction to Statistics
        semester: 'Midterm',
        description: 'หนังสือสถิติเบื้องต้น สรุปความน่าจะเป็น การแจกแจง',
        condition: 'ดี',
        book_cover: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=600&fit=crop',
        book_image: '/Images/books/stat-mid.jpg',
        status: 'available',
        created_at: '2024-11-03T14:00:00Z',
        reviews: 31
    },
    {
        id: 13,
        book_title: 'Software Engineering Final',
        book_code: 'SE-FINAL-2024',
        price: 160.00,
        seller_id: 1,
        seller_name: 'Boss Nattawut',
        course_id: 15, // CS306 - Software Engineering
        semester: 'Final',
        description: 'สรุป Software Engineering ครอบคลุม SDLC, Agile, Design Patterns',
        condition: 'ดีมาก',
        book_cover: 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=400&h=600&fit=crop',
        book_image: '/Images/books/se-final.jpg',
        status: 'available',
        created_at: '2024-11-07T09:00:00Z',
        reviews: 56
    },
    {
        id: 14,
        book_title: 'Discrete Mathematics Midterm',
        book_code: 'MATH102-MID',
        price: 100.00,
        seller_id: 3,
        seller_name: 'นักศึกษา ชั้นปี 2',
        course_id: 5, // MATH102 - Discrete Mathematics
        semester: 'Midterm',
        description: 'หนังสือคณิตศาสตร์ดิสครีต สรุป Logic, Set Theory, Graph',
        condition: 'ดี',
        book_cover: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=600&fit=crop',
        book_image: '/Images/books/discrete-mid.jpg',
        status: 'available',
        created_at: '2024-11-04T10:30:00Z',
        reviews: 37
    },
    {
        id: 15,
        book_title: 'Mobile App Development Final',
        book_code: 'MOBILE-FINAL-2024',
        price: 140.00,
        seller_id: 4,
        seller_name: 'จิรายุ สมชาย',
        course_id: 8, // CS203 - Mobile Application Development
        semester: 'Final',
        description: 'สรุป Mobile Development ครอบคลุม Android และ iOS',
        condition: 'ดีมาก',
        book_cover: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400&h=600&fit=crop',
        book_image: '/Images/books/mobile-final.jpg',
        status: 'available',
        created_at: '2024-11-06T16:00:00Z',
        reviews: 49
    }
];

// Helper Functions to work with courses
export const getAllCourses = () => {
    return coursesData;
};

export const getCourseById = (id) => {
    return coursesData.find(course => course.id === id);
};

export const getCoursesByYear = (year) => {
    if (year === 'all') return coursesData;
    return coursesData.filter(course => course.course_year === parseInt(year));
};

// Helper Functions for books
export const getAllBooks = () => {
    return booksForSaleData;
};

export const getBookById = (id) => {
    return booksForSaleData.find(book => book.id === id);
};

export const getBooksByCategory = (category) => {
    return booksForSaleData.filter(book => book.category === category);
};

export const getBooksBySemester = (semester) => {
    if (semester === 'all') return booksForSaleData;
    return booksForSaleData.filter(book => book.semester.toLowerCase() === semester.toLowerCase());
};

export const getBooksByCourseYear = (year) => {
    if (year === 'all') return booksForSaleData;
    // ค้นหาหนังสือผ่าน course_id
    const courseIds = coursesData
        .filter(course => course.course_year === parseInt(year))
        .map(course => course.id);
    return booksForSaleData.filter(book => courseIds.includes(book.course_id));
};

export const getBooksByCourseId = (courseId) => {
    if (courseId === 'all') return booksForSaleData;
    return booksForSaleData.filter(book => book.course_id === parseInt(courseId));
};

export const getBooksByCondition = (condition) => {
    if (condition === 'all') return booksForSaleData;
    return booksForSaleData.filter(book => book.condition === condition);
};

export const getBooksByPriceRange = (min, max) => {
    return booksForSaleData.filter(book => book.price >= min && book.price <= max);
};

export const getBooksByStatus = (status) => {
    if (status === 'all') return booksForSaleData;
    return booksForSaleData.filter(book => book.status === status);
};

export const getUserById = (id) => {
    return usersData.find(user => user.id === id);
};

export const getAllUsers = () => {
    return usersData;
};

// Filter helper - รวม filter หลายแบบพร้อมกัน
export const filterBooks = ({ semester, courseYear, courseId, condition, priceMin, priceMax, status, searchTerm }) => {
    let filtered = [...booksForSaleData];

    // Filter by semester
    if (semester && semester !== 'all') {
        filtered = filtered.filter(book => book.semester.toLowerCase() === semester.toLowerCase());
    }

    // Filter by course year (ผ่าน course_id)
    if (courseYear && courseYear !== 'all') {
        const courseIds = coursesData
            .filter(course => course.course_year === parseInt(courseYear))
            .map(course => course.id);
        filtered = filtered.filter(book => courseIds.includes(book.course_id));
    }

    // Filter by specific course
    if (courseId && courseId !== 'all') {
        filtered = filtered.filter(book => book.course_id === parseInt(courseId));
    }

    // Filter by condition
    if (condition && condition !== 'all') {
        filtered = filtered.filter(book => book.condition === condition);
    }

    // Filter by price range
    if (priceMin !== undefined && priceMax !== undefined) {
        filtered = filtered.filter(book => book.price >= priceMin && book.price <= priceMax);
    }

    // Filter by status
    if (status && status !== 'all') {
        filtered = filtered.filter(book => book.status === status);
    }

    // Filter by search term
    if (searchTerm && searchTerm.trim() !== '') {
        const term = searchTerm.toLowerCase();
        filtered = filtered.filter(book => {
            const course = getCourseById(book.course_id);
            return (
                book.book_title.toLowerCase().includes(term) ||
                book.description.toLowerCase().includes(term) ||
                book.seller_name.toLowerCase().includes(term) ||
                (course && (
                    course.course_code.toLowerCase().includes(term) ||
                    course.course_name.toLowerCase().includes(term)
                ))
            );
        });
    }

    return filtered;
};
