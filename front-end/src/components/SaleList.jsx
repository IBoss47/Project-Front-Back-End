import React, { useState } from 'react';
import { HeartIcon, ShoppingCartIcon, StarIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon, StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';
import { getCourseById } from '../data/mockBooksData';
import BookDetailModal from './BookDetailModal';

const SaleList = ({ book }) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const [isInCart, setIsInCart] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // ดึงข้อมูล course จาก course_id
  const course = getCourseById(book.course_id);

  const handleAddToCart = (e) => {
    e.stopPropagation();
    setIsInCart(!isInCart);
    // Add cart logic here
  };

  const handleToggleFavorite = (e) => {
    e.stopPropagation();
    setIsFavorite(!isFavorite);
    // Add favorite logic here
  };

  const handleCardClick = () => {
    setIsModalOpen(true);
  };

  // แปลงสถานะเป็นภาษาไทย
  const getStatusBadge = (status) => {
    const statusConfig = {
      available: { text: 'พร้อมขาย', color: 'bg-green-500' },
      sold: { text: 'ขายแล้ว', color: 'bg-gray-500' },
      reserved: { text: 'จองแล้ว', color: 'bg-yellow-500' }
    };
    return statusConfig[status] || statusConfig.available;
  };

  const statusBadge = getStatusBadge(book.status);

  return (
    <>
      <div
        onClick={handleCardClick}
        className="bg-white rounded-xl shadow-lg overflow-hidden group 
          hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 h-full flex flex-col cursor-pointer"
      >
        {/* Book Cover */}
        <div className="relative h-80 bg-gradient-to-br from-viridian-50 to-blue-100 flex-shrink-0">
          <img
            src={book.book_cover || book.book_image || '/images/book-placeholder.jpg'}
            alt={book.book_title}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.src = 'https://via.placeholder.com/300x400/6366f1/ffffff?text=' + encodeURIComponent(book.book_title);
            }}
          />

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            <span className={`${statusBadge.color} text-white px-3 py-1 
              rounded-full text-xs font-semibold shadow-md`}>
              {statusBadge.text}
            </span>
            <span className="bg-viridian-600 text-white px-3 py-1 
              rounded-full text-xs font-semibold shadow-md">
              {book.semester}
            </span>
          </div>

          <div className="absolute top-3 right-3">
            <span className="bg-blue-600 text-white px-3 py-1 
              rounded-full text-xs font-semibold shadow-md">
              ปี {course?.course_year || '-'}
            </span>
          </div>

          {/* Quick Actions - Show on Hover */}
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 
            transition-all duration-300 flex items-center justify-center">
            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 
              flex gap-3">
              <button
                onClick={handleToggleFavorite}
                className="p-3 bg-white rounded-full hover:bg-red-50 transition-colors"
              >
                {isFavorite ? (
                  <HeartSolidIcon className="h-6 w-6 text-red-500" />
                ) : (
                  <HeartIcon className="h-6 w-6 text-gray-700" />
                )}
              </button>
              <button
                onClick={handleAddToCart}
                className="p-3 bg-white rounded-full hover:bg-viridian-50 transition-colors"
              >
                <ShoppingCartIcon className={`h-6 w-6 ${isInCart ? 'text-viridian-600' : 'text-gray-700'
                  }`} />
              </button>
            </div>
          </div>
        </div>

        {/* Book Details */}
        <div className="p-5 flex flex-col flex-grow">
          {/* Course Code */}
          <p className="text-xs text-viridian-600 font-semibold uppercase tracking-wider mb-2 line-clamp-1">
            {course ? `${course.course_code} - ${course.course_name}` : 'ไม่ระบุวิชา'}
          </p>

          {/* Title */}
          <h3 className="text-lg font-bold text-gray-900 mb-1 line-clamp-2 min-h-[3.5rem]
            group-hover:text-viridian-600 transition-colors">
            {book.book_title}
          </h3>

          {/* Seller */}
          <p className="text-sm text-gray-600 mb-2 line-clamp-1">
            <span className="text-gray-500">ผู้ขาย:</span> {book.seller_name}
          </p>

          {/* Condition */}
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded-full font-medium whitespace-nowrap">
              สภาพ: {book.condition}
            </span>
            <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded-full font-medium whitespace-nowrap">
              {book.reviews || 0} รีวิว
            </span>
          </div>

          {/* Price */}
          <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-100">
            <div>
              <span className="text-2xl font-bold text-viridian-600">
                ฿{book.price}
              </span>
            </div>

            <button
              onClick={handleAddToCart}
              className={`px-4 py-2 rounded-lg font-semibold transition-all duration-200 
                ${isInCart
                  ? 'bg-green-500 text-white hover:bg-green-600'
                  : 'bg-viridian-600 text-white hover:bg-viridian-700'
                }`}>
              {isInCart ? 'ในตะกร้า' : 'เพิ่มลงตะกร้า'}
            </button>
          </div>
        </div>
      </div>

      {/* Book Detail Modal */}
      <BookDetailModal
        book={book}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
};

export default SaleList;