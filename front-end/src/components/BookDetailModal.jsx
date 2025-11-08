import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { XMarkIcon, ShoppingCartIcon, HeartIcon, StarIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon, StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';
import { getCourseById } from '../data/mockBooksData';

const BookDetailModal = ({ book, isOpen, onClose }) => {
    const [isFavorite, setIsFavorite] = useState(false);
    const [quantity, setQuantity] = useState(1);

    // ป้องกัน scroll เมื่อเปิด modal
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!isOpen || !book) return null;

    // ดึงข้อมูล course จาก course_id
    const course = getCourseById(book.course_id);

    const handleAddToCart = () => {
        // Add to cart logic here
        alert(`เพิ่ม "${book.book_title}" จำนวน ${quantity} เล่ม เข้าตะกร้าแล้ว!`);
    };

    const handleToggleFavorite = () => {
        setIsFavorite(!isFavorite);
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

    const modalContent = (
        <div
            className="fixed inset-0 z-50 bg-black bg-opacity-80 backdrop-blur-md animate-fade-in flex items-center justify-center"
            onClick={onClose}
        >
            <div
                className="bg-white w-[60%] h-[60%] overflow-hidden flex flex-col animate-scale-up rounded-2xl shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="bg-gradient-to-r from-viridian-600 to-blue-600 px-8 py-4 flex items-center justify-between shadow-lg">
                    <h2 className="text-3xl font-bold text-white">รายละเอียดสินค้า</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/20 rounded-full transition-all hover:rotate-90 duration-300"
                    >
                        <XMarkIcon className="w-6 h-6 text-white" />
                    </button>
                </div>

                {/* Content - Scrollable */}
                <div className="flex-1 overflow-y-auto bg-gray-50">
                    <div className="max-w-7xl mx-auto p-10">
                        <div className="grid lg:grid-cols-2 gap-12">
                            {/* Left: Book Image */}
                            <div className="space-y-8">
                                <div className="relative aspect-[3/4] bg-gradient-to-br from-viridian-50 to-blue-100 rounded-2xl overflow-hidden shadow-2xl border-4 border-white">
                                    <img
                                        src={book.book_cover || book.book_image || '/images/book-placeholder.jpg'}
                                        alt={book.book_title}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            e.target.src = 'https://via.placeholder.com/400x600/6366f1/ffffff?text=' + encodeURIComponent(book.book_title);
                                        }}
                                    />

                                    {/* Status Badge */}
                                    <div className="absolute top-4 left-4">
                                        <span className={`${statusBadge.color} text-white px-3 py-1 rounded-full text-sm font-semibold shadow-md`}>
                                            {statusBadge.text}
                                        </span>
                                    </div>

                                    {/* Semester Badge */}
                                    <div className="absolute top-4 right-4">
                                        <span className="bg-viridian-600 text-white px-3 py-1 rounded-full text-sm font-semibold shadow-md">
                                            {book.semester}
                                        </span>
                                    </div>
                                </div>

                                {/* Favorite Button */}
                                <button
                                    onClick={handleToggleFavorite}
                                    className="w-full flex items-center justify-center gap-3 px-5 py-4 border-2 border-gray-300 rounded-xl hover:border-red-500 hover:bg-red-50 transition-all transform hover:scale-105 shadow-md"
                                >
                                    {isFavorite ? (
                                        <>
                                            <HeartSolidIcon className="w-6 h-6 text-red-500" />
                                            <span className="font-bold text-lg text-red-500">บันทึกแล้ว</span>
                                        </>
                                    ) : (
                                        <>
                                            <HeartIcon className="w-6 h-6 text-gray-600" />
                                            <span className="font-bold text-lg text-gray-600">บันทึกสินค้า</span>
                                        </>
                                    )}
                                </button>
                            </div>

                            {/* Right: Book Details */}
                            <div className="space-y-7">
                                {/* Course Info */}
                                <div>
                                    <p className="text-base text-viridian-600 font-bold uppercase tracking-wider mb-3">
                                        {course ? `${course.course_code} - ${course.course_name}` : 'ไม่ระบุวิชา'}
                                    </p>
                                    <span className="inline-block bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-base font-bold">
                                        ชั้นปี {course?.course_year || '-'}
                                    </span>
                                </div>

                                {/* Book Title */}
                                <div>
                                    <h3 className="text-4xl font-bold text-gray-800 mb-3 leading-tight">
                                        {book.book_title}
                                    </h3>
                                    <p className="text-base text-gray-500">รหัสหนังสือ: {book.book_code}</p>
                                </div>

                                {/* Price */}
                                <div className="bg-gradient-to-r from-viridian-50 to-blue-50 p-6 rounded-2xl shadow-md">
                                    <p className="text-base text-gray-600 mb-2">ราคา</p>
                                    <p className="text-5xl font-bold text-viridian-600">
                                        ฿{book.price.toFixed(2)}
                                    </p>
                                </div>

                                {/* Reviews */}
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center gap-1">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <StarSolidIcon key={star} className="w-6 h-6 text-yellow-400" />
                                        ))}
                                    </div>
                                    <span className="text-base text-gray-600 font-semibold">
                                        ({book.reviews || 0} รีวิว)
                                    </span>
                                </div>

                                {/* Condition */}
                                <div>
                                    <p className="text-base text-gray-600 mb-3 font-semibold">สภาพหนังสือ</p>
                                    <span className={`inline-block px-5 py-3 rounded-xl font-bold text-lg ${book.condition === 'ดีมาก' ? 'bg-green-100 text-green-700' :
                                        book.condition === 'ดี' ? 'bg-blue-100 text-blue-700' :
                                            'bg-yellow-100 text-yellow-700'
                                        }`}>
                                        {book.condition}
                                    </span>
                                </div>

                                {/* Seller Info */}
                                <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-5 rounded-2xl shadow-sm">
                                    <p className="text-base text-gray-600 mb-3 font-semibold">ผู้ขาย</p>
                                    <div className="flex items-center gap-4">
                                        <div className="w-14 h-14 bg-gradient-to-br from-viridian-500 to-viridian-700 text-white rounded-full flex items-center justify-center font-bold text-xl shadow-md">
                                            {book.seller_name?.charAt(0) || 'U'}
                                        </div>
                                        <div>
                                            <p className="font-bold text-lg text-gray-800">{book.seller_name}</p>
                                            <p className="text-sm text-gray-500">ผู้ขายที่เชื่อถือได้</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Description */}
                                {book.description && (
                                    <div>
                                        <p className="text-base text-gray-600 mb-3 font-semibold">รายละเอียด</p>
                                        <p className="text-gray-700 leading-relaxed text-base">
                                            {book.description}
                                        </p>
                                    </div>
                                )}

                                {/* Quantity Selector */}
                                {book.status === 'available' && (
                                    <div>
                                        <p className="text-base text-gray-600 mb-3 font-semibold">จำนวน</p>
                                        <div className="flex items-center gap-4">
                                            <button
                                                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                                className="w-12 h-12 border-2 border-gray-300 rounded-xl hover:bg-gray-100 font-bold text-xl text-gray-700 transition-all hover:scale-110"
                                            >
                                                -
                                            </button>
                                            <input
                                                type="number"
                                                value={quantity}
                                                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                                                className="w-24 h-12 border-2 border-gray-300 rounded-xl text-center font-bold text-xl"
                                                min="1"
                                            />
                                            <button
                                                onClick={() => setQuantity(quantity + 1)}
                                                className="w-12 h-12 border-2 border-gray-300 rounded-xl hover:bg-gray-100 font-bold text-xl text-gray-700 transition-all hover:scale-110"
                                            >
                                                +
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* Add to Cart Button */}
                                {book.status === 'available' ? (
                                    <button
                                        onClick={handleAddToCart}
                                        className="w-full flex items-center justify-center gap-4 bg-gradient-to-r from-viridian-600 to-viridian-700 text-white px-8 py-5 rounded-2xl hover:from-viridian-700 hover:to-viridian-800 transition-all duration-300 shadow-xl hover:shadow-2xl font-bold text-xl transform hover:scale-105"
                                    >
                                        <ShoppingCartIcon className="w-7 h-7" />
                                        เพิ่มลงตะกร้า
                                    </button>
                                ) : (
                                    <div className="w-full bg-gray-200 text-gray-600 px-8 py-5 rounded-2xl text-center font-bold text-xl">
                                        {book.status === 'sold' ? 'สินค้าขายแล้ว' : 'สินค้าถูกจองแล้ว'}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    // ใช้ React Portal เพื่อแสดง Modal ที่ระดับ root
    return ReactDOM.createPortal(
        modalContent,
        document.body
    );
};

export default BookDetailModal;
