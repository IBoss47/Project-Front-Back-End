import React, { useState, useEffect } from 'react';
import BookCard from '../components/SaleList';
import SearchBar from '../components/SearchBar';
import FilterSidebar from '../components/FilterSidebar';
import LoadingSpinner from '../components/LoadingSpinner';
import { ChevronDownIcon, FunnelIcon, Squares2X2Icon, ListBulletIcon } from '@heroicons/react/24/outline';
import { getAllBooks, filterBooks } from '../data/mockBooksData';

const SellListPage = () => {
  const [books, setBooks] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [sortBy, setSortBy] = useState('newest');
  const [selectedSemester, setSelectedSemester] = useState('all');
  const [selectedYear, setSelectedYear] = useState('all');
  const [selectedCourseId, setSelectedCourseId] = useState('all');
  const [selectedCondition, setSelectedCondition] = useState('all');
  const [priceRange, setPriceRange] = useState({ min: 0, max: 1000 });
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState('grid'); // grid or list
  const [showFilters, setShowFilters] = useState(false);
  const booksPerPage = 12;

  const categories = [
    'all', 'fiction', 'non-fiction', 'science', 'history', 'art',
    'psychology', 'business', 'technology', 'cooking'
  ];

  useEffect(() => {
    // Load books from data
    setLoading(true);
    setTimeout(() => {
      const booksData = getAllBooks();
      setBooks(booksData);
      setFilteredBooks(booksData);
      setLoading(false);
    }, 500);
  }, []);

  // Apply all filters when any filter changes
  useEffect(() => {
    applyFilters();
  }, [selectedSemester, selectedYear, selectedCourseId, selectedCondition, priceRange, searchTerm, books]);

  const applyFilters = () => {
    const filtered = filterBooks({
      semester: selectedSemester,
      courseYear: selectedYear,
      courseId: selectedCourseId,
      condition: selectedCondition,
      priceMin: priceRange.min,
      priceMax: priceRange.max,
      status: 'available', // แสดงเฉพาะหนังสือที่ยังขายได้
      searchTerm: searchTerm
    });

    setFilteredBooks(filtered);
    setCurrentPage(1);
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
  };

  const handleSemesterFilter = (semester) => {
    setSelectedSemester(semester);
  };

  const handleYearFilter = (year) => {
    setSelectedYear(year);
  };

  const handleCourseFilter = (courseId) => {
    setSelectedCourseId(courseId);
  };

  const handleConditionFilter = (condition) => {
    setSelectedCondition(condition);
  };

  const handlePriceRangeChange = (min, max) => {
    setPriceRange({ min, max });
  };

  const handleSort = (sortValue) => {
    setSortBy(sortValue);
    const sorted = [...filteredBooks];
    switch (sortValue) {
      case 'price-low':
        sorted.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        sorted.sort((a, b) => b.price - a.price);
        break;
      case 'popular':
        sorted.sort((a, b) => b.reviews - a.reviews);
        break;
      case 'newest':
      default:
        sorted.sort((a, b) => b.id - a.id);
    }
    setFilteredBooks(sorted);
  };

  // Pagination logic
  const indexOfLastBook = currentPage * booksPerPage;
  const indexOfFirstBook = indexOfLastBook - booksPerPage;
  const currentBooks = filteredBooks.slice(indexOfFirstBook, indexOfLastBook);
  const totalPages = Math.ceil(filteredBooks.length / booksPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 pt-24">
      <div className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-800 mb-3 animate-fade-in">
            📚 ค้นหาหนังสือมือสอง
          </h1>
          <p className="text-gray-600 text-lg">
            ค้นพบหนังสือคุณภาพดีในราคาที่คุ้มค่า
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar - Desktop */}
          <div className="hidden lg:block lg:w-72">
            <div className="sticky top-24">
              <FilterSidebar
                onSemesterChange={handleSemesterFilter}
                onYearChange={handleYearFilter}
                onCourseChange={handleCourseFilter}
                onConditionChange={handleConditionFilter}
                onPriceRangeChange={handlePriceRangeChange}
                selectedSemester={selectedSemester}
                selectedYear={selectedYear}
                selectedCourseId={selectedCourseId}
                selectedCondition={selectedCondition}
              />
            </div>
          </div>

          {/* Mobile Filter Toggle */}
          <div className="lg:hidden">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="w-full mb-4 px-4 py-3 bg-white rounded-xl shadow-md 
                hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2
                border-2 border-viridian-500 text-viridian-700 font-semibold"
            >
              <FunnelIcon className="w-5 h-5" />
              {showFilters ? 'ซ่อนตัวกรอง' : 'แสดงตัวกรอง'}
            </button>
            {showFilters && (
              <div className="mb-4 animate-slide-down">
                <FilterSidebar
                  onSemesterChange={handleSemesterFilter}
                  onYearChange={handleYearFilter}
                  onCourseChange={handleCourseFilter}
                  onConditionChange={handleConditionFilter}
                  onPriceRangeChange={handlePriceRangeChange}
                  selectedSemester={selectedSemester}
                  selectedYear={selectedYear}
                  selectedCourseId={selectedCourseId}
                  selectedCondition={selectedCondition}
                />
              </div>
            )}
          </div>

          <div className="flex-1">
            {/* Search and Filter Controls */}
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-gray-100 
              hover:shadow-xl transition-shadow duration-300">
              <div className="flex flex-col lg:flex-row gap-4">
                {/* Search */}
                <div className="flex-1">
                  <SearchBar onSearch={handleSearch} />
                </div>

                {/* Category Filter */}
                <div className="relative">
                  <select
                    className="w-full lg:w-auto px-5 py-3 border-2 border-gray-200 rounded-xl 
                      focus:outline-none focus:ring-2 focus:ring-viridian-500 focus:border-transparent
                      cursor-pointer bg-white hover:border-viridian-300 transition-all duration-300
                      font-medium text-gray-700 appearance-none pr-10"
                    value={selectedSemester}
                    onChange={(e) => handleSemesterFilter(e.target.value)}
                  >
                    <option value="all">📚 ทั้งหมด</option>
                    <option value="Midterm">📝 Midterm</option>
                    <option value="Final">📖 Final</option>
                  </select>
                  <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                </div>

                {/* Sort */}
                <div className="relative">
                  <select
                    className="w-full lg:w-auto px-5 py-3 border-2 border-gray-200 rounded-xl 
                      focus:outline-none focus:ring-2 focus:ring-viridian-500 focus:border-transparent
                      cursor-pointer bg-white hover:border-viridian-300 transition-all duration-300
                      font-medium text-gray-700 appearance-none pr-10"
                    value={sortBy}
                    onChange={(e) => handleSort(e.target.value)}
                  >
                    <option value="newest">🆕 ใหม่ล่าสุด</option>
                    <option value="price-low">💰 ราคาต่ำ-สูง</option>
                    <option value="price-high">💎 ราคาสูง-ต่ำ</option>
                    <option value="popular">⭐ ยอดนิยม</option>
                  </select>
                  <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                </div>

                {/* View Mode Toggle */}
                <div className="flex gap-2 p-1 bg-gray-100 rounded-xl">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-lg transition-all duration-300 ${viewMode === 'grid'
                      ? 'bg-viridian-600 text-white shadow-md'
                      : 'text-gray-600 hover:bg-gray-200'
                      }`}
                    title="Grid View"
                  >
                    <Squares2X2Icon className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-lg transition-all duration-300 ${viewMode === 'list'
                      ? 'bg-viridian-600 text-white shadow-md'
                      : 'text-gray-600 hover:bg-gray-200'
                      }`}
                    title="List View"
                  >
                    <ListBulletIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Results count */}
            <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="h-1 w-12 bg-gradient-to-r from-viridian-500 to-blue-500 rounded-full"></div>
                <p className="text-lg font-semibold text-gray-700">
                  พบหนังสือ <span className="text-viridian-600">{filteredBooks.length}</span> เล่ม
                  <span className="flex flex-wrap gap-2 mt-2">
                    {selectedSemester !== 'all' && (
                      <span className="px-3 py-1 bg-viridian-100 text-viridian-700 rounded-full text-sm">
                        {selectedSemester}
                      </span>
                    )}
                    {selectedYear !== 'all' && (
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                        ชั้นปี {selectedYear}
                      </span>
                    )}
                    {selectedCondition !== 'all' && (
                      <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                        {selectedCondition}
                      </span>
                    )}
                  </span>
                </p>
              </div>
              <div className="text-sm text-gray-500">
                หน้า {currentPage} จาก {totalPages || 1}
              </div>
            </div>

            {/* Books Grid/List */}
            {currentBooks.length > 0 ? (
              <div className={`
                ${viewMode === 'grid'
                  ? 'grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 auto-rows-fr'
                  : 'flex flex-col gap-4'
                }
                animate-fade-in
              `}>
                {currentBooks.map((book, index) => (
                  <div
                    key={book.id}
                    className="transform transition-all duration-300 hover:scale-105 h-full"
                    style={{
                      animation: `fadeInUp 0.5s ease-out ${index * 0.05}s both`
                    }}
                  >
                    <BookCard book={book} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <div className="mb-4 text-6xl">📚</div>
                <p className="text-gray-500 text-xl font-medium mb-2">ไม่พบหนังสือที่ค้นหา</p>
                <p className="text-gray-400">ลองค้นหาด้วยคำอื่นหรือเปลี่ยนตัวกรอง</p>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-12 flex justify-center">
                <nav className="flex items-center gap-2 bg-white p-2 rounded-2xl shadow-lg border border-gray-100">
                  <button
                    onClick={() => paginate(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-5 py-2.5 rounded-xl font-medium transition-all duration-300
                      hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed
                      disabled:hover:bg-transparent text-gray-700"
                  >
                    ← ก่อนหน้า
                  </button>

                  <div className="flex gap-2">
                    {[...Array(Math.min(5, totalPages))].map((_, index) => {
                      let pageNumber = index + 1;
                      if (totalPages > 5) {
                        if (currentPage > 3) {
                          pageNumber = currentPage - 2 + index;
                        }
                        if (currentPage > totalPages - 3) {
                          pageNumber = totalPages - 4 + index;
                        }
                      }

                      if (pageNumber > 0 && pageNumber <= totalPages) {
                        return (
                          <button
                            key={pageNumber}
                            onClick={() => paginate(pageNumber)}
                            className={`min-w-[44px] px-4 py-2.5 rounded-xl font-semibold 
                              transition-all duration-300 transform hover:scale-110 ${currentPage === pageNumber
                                ? 'bg-gradient-to-r from-viridian-600 to-viridian-700 text-white shadow-lg shadow-viridian-200'
                                : 'hover:bg-gray-100 text-gray-700'
                              }`}
                          >
                            {pageNumber}
                          </button>
                        );
                      }
                      return null;
                    })}
                  </div>

                  <button
                    onClick={() => paginate(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-5 py-2.5 rounded-xl font-medium transition-all duration-300
                      hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed
                      disabled:hover:bg-transparent text-gray-700"
                  >
                    ถัดไป →
                  </button>
                </nav>
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        @keyframes slide-down {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }
        
        .animate-slide-down {
          animation: slide-down 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default SellListPage;