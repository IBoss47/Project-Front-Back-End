import React, { useState } from 'react';
import { StarIcon } from '@heroicons/react/24/outline';
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';
import BookDetailModal from './BookDetailModal';
import { useCart } from '../context/CartContext';

const SaleList = ({ book }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { addToCart, isInCart } = useCart();

  const course = book.course;

  const handleAddToCart = (e) => {
    e.stopPropagation();
    addToCart(book);
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
        {/* Study Notes Cover */}
        <div className="relative h-80 bg-gradient-to-br from-blue-100 to-indigo-100 flex-shrink-0 flex items-center justify-center">
          {book.cover_image ? (
            <img
              src={`http://localhost:8080/${book.cover_image}`}
              alt={book.book_title}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-gray-400">
              <svg className="w-20 h-20 mb-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
              </svg>
              <span className="text-sm">ไม่มีรูปภาพ</span>
            </div>
          )}
          
          {/* File Icon Overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/20"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8 4a3 3 0 00-3 3v4a5 5 0 0010 0V7a1 1 0 112 0v4a7 7 0 11-14 0V7a5 5 0 0110 0v4a3 3 0 11-6 0V7a1 1 0 012 0v4a1 1 0 102 0V7a3 3 0 00-3-3z" clipRule="evenodd" />
            </svg>
          </div>

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            <span className={`${statusBadge.color} text-white px-3 py-1 
              rounded-full text-xs font-semibold shadow-md`}>
              {statusBadge.text}
            </span>
            {book.exam_term && (
              <span className="bg-blue-600 text-white px-3 py-1 
                rounded-full text-xs font-semibold shadow-md flex items-center gap-1">
                📄 {book.exam_term}
              </span>
            )}
          </div>

          <div className="absolute top-3 right-3">
            <span className="bg-indigo-600 text-white px-3 py-1 
              rounded-full text-xs font-semibold shadow-md">
               {course?.year || '-'}
            </span>
          </div>

          {/* Quick Actions - Show on Hover */}
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 
            transition-all duration-300 flex items-center justify-center">
            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 
              flex gap-3">
              {/* Removed heart and cart icons */}
            </div>
          </div>
        </div>

        {/* Study Notes Details */}
        <div className="p-5 flex flex-col flex-grow">
          {/* Course Code */}
          <p className="text-xs text-blue-600 font-semibold uppercase tracking-wider mb-2 line-clamp-1">
            {course ? `${course.code} - ${course.name}` : 'ไม่ระบุวิชา'}
          </p>

          {/* Title */}
          <h3 className="text-lg font-bold text-gray-900 mb-1 line-clamp-2 min-h-[3.5rem]
            group-hover:text-blue-600 transition-colors">
            {book.book_title}
          </h3>

          {/* Seller */}
          <p className="text-sm text-gray-600 mb-2 line-clamp-1">
            <span className="text-gray-500">ผู้สร้าง:</span> {book.seller?.fullname || 'ไม่ระบุ'}
          </p>

          {/* Type & Rating */}
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full font-medium whitespace-nowrap">
              📋 {book.condition || 'สรุปเต็มบท'}
            </span>
            <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full font-medium whitespace-nowrap">
              ⭐ {book.reviews || 0} คะแนน
            </span>
          </div>

          {/* Price */}
          <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-100">
            <div>
              <span className="text-2xl font-bold text-blue-600">
                ฿{book.price}
              </span>
            </div>
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