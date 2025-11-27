import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { XMarkIcon, ShoppingCartIcon, HeartIcon, StarIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon, StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';
import { useCart } from '../context/CartContext';

const BookDetailModal = ({ book, isOpen, onClose }) => {
    const [isFavorite, setIsFavorite] = useState(false);
    const [quantity, setQuantity] = useState(1);
    const { addToCart } = useCart();

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

    const course = book.course;

    const handleAddToCart = async () => {
        try {
            for (let i = 0; i < quantity; i++) {
                await addToCart(book);
            }
            alert(`เพิ่ม "${book.book_title}" จำนวน ${quantity} ชุด เข้าตะกร้าแล้ว!`);
            setQuantity(1);
        } catch (error) {
            if (error.response?.status === 401) {
                alert('กรุณาเข้าสู่ระบบก่อนเพิ่มสินค้าลงตะกร้า');
            } else {
                alert('เกิดข้อผิดพลาดในการเพิ่มสินค้าลงตะกร้า');
            }
        }
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
            className="fixed inset-0 z-50 bg-black bg-opacity-70 backdrop-blur-sm animate-fade-in flex items-center justify-center p-4"
            onClick={onClose}
        >
            <div
                className="bg-white w-full max-w-7xl h-[90vh] overflow-hidden flex flex-col animate-scale-up rounded-3xl shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-10 py-6 flex items-center justify-between shadow-lg">
                    <h2 className="text-4xl font-bold text-white">📋 รายละเอียดสรุปวิชา</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/20 rounded-full transition-all hover:rotate-90 duration-300"
                    >
                        <XMarkIcon className="w-8 h-8 text-white" />
                    </button>
                </div>

                {/* Content - Scrollable */}
                <div className="flex-1 overflow-y-auto bg-gradient-to-b from-gray-50 to-gray-100">
                    <div className="max-w-7xl mx-auto p-12">
                        <div className="grid lg:grid-cols-3 gap-16">
                            {/* Left: Study Notes Image */}
                            <div className="space-y-8">
                                <div className="relative aspect-[3/4] bg-gradient-to-br from-blue-50 to-indigo-100 rounded-3xl overflow-hidden shadow-2xl border-8 border-white">
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
                                        <div className="flex flex-col items-center justify-center h-full text-gray-400">
                                            <svg className="w-32 h-32 mb-4" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                                            </svg>
                                            <span className="text-xl">ไม่มีรูปภาพ</span>
                                        </div>
                                    )}

                                    {/* Status Badge */}
                                    <div className="absolute top-6 left-6">
                                        <span className={`${statusBadge.color} text-white px-5 py-2 rounded-full text-base font-bold shadow-lg`}>
                                            {statusBadge.text}
                                        </span>
                                    </div>

                                    {/* Semester Badge */}
                                    {book.exam_term && (
                                        <div className="absolute top-6 right-6">
                                            <span className="bg-blue-600 text-white px-5 py-2 rounded-full text-base font-bold shadow-lg flex items-center gap-2">
                                                📄 {book.exam_term}
                                            </span>
                                        </div>
                                    )}
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

                            {/* Right: Study Notes Details */}
                            <div className="lg:col-span-2 space-y-8">
                                {/* Course Info */}
                                <div>
                                    <p className="text-xl text-blue-600 font-bold uppercase tracking-wider mb-4">
                                        {course ? `${course.code} - ${course.name}` : 'ไม่ระบุวิชา'}
                                    </p>
                                    <div className="flex gap-4">
                                        <span className="inline-block bg-blue-100 text-blue-700 px-6 py-3 rounded-full text-lg font-bold">
                                            ชั้นปี {course?.year || '-'}
                                        </span>
                                    </div>
                                </div>

                                {/* Study Notes Title */}
                                <div>
                                    <h3 className="text-5xl font-bold text-gray-800 mb-4 leading-tight">
                                        {book.book_title}
                                    </h3>
                                    <p className="text-lg text-gray-500">รหัสสรุป: {book.book_code}</p>
                                </div>

                                {/* Price */}
                                <div className="bg-gradient-to-r from-blue-100 to-indigo-100 p-8 rounded-3xl shadow-lg border-2 border-blue-200">
                                    <p className="text-lg text-gray-700 mb-3 font-semibold">ราคา</p>
                                    <p className="text-6xl font-bold text-blue-600">
                                        ฿{book.price.toFixed(2)}
                                    </p>
                                </div>

                                {/* Reviews */}
                                <div className="flex items-center gap-4 bg-yellow-50 p-6 rounded-2xl">
                                    <div className="flex items-center gap-2">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <StarSolidIcon key={star} className="w-8 h-8 text-yellow-400" />
                                        ))}
                                    </div>
                                    <span className="text-2xl text-gray-700 font-bold">
                                        ({book.reviews || 0} คะแนน)
                                    </span>
                                </div>

                                {/* Type of Notes */}
                                <div>
                                    <p className="text-lg text-gray-600 mb-4 font-semibold">ประเภทสรุป</p>
                                    <span className={`inline-block px-8 py-4 rounded-2xl font-bold text-xl ${book.condition === 'ดีมาก' ? 'bg-green-100 text-green-700' :
                                        book.condition === 'ดี' ? 'bg-blue-100 text-blue-700' :
                                            'bg-purple-100 text-purple-700'
                                        }`}>
                                        📋 {book.condition || 'สรุปเต็มบท'}
                                    </span>
                                </div>

                                {/* Creator Info */}
                                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-8 rounded-3xl shadow-lg border-2 border-blue-100">
                                    <p className="text-lg text-gray-700 mb-4 font-semibold">👤 ผู้สร้างสรุป</p>
                                    <div className="flex items-center gap-6">
                                        <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-700 text-white rounded-full flex items-center justify-center font-bold text-3xl shadow-md">
                                            {book.seller?.fullname?.charAt(0) || 'U'}
                                        </div>
                                        <div>
                                            <p className="font-bold text-2xl text-gray-800">{book.seller?.fullname}</p>
                                            <p className="text-lg text-blue-600 font-semibold">✓ ผู้สร้างที่เชื่อถือได้</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Description */}
                                {book.description && (
                                    <div>
                                        <p className="text-lg text-gray-600 mb-4 font-semibold">📝 รายละเอียด</p>
                                        <p className="text-lg text-gray-700 leading-relaxed bg-white p-6 rounded-2xl border-l-4 border-blue-500">
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
                                        className="w-full flex items-center justify-center gap-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-5 rounded-2xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-xl hover:shadow-2xl font-bold text-xl transform hover:scale-105"
                                    >
                                        <ShoppingCartIcon className="w-7 h-7" />
                                        + เพิ่มลงตะกร้า
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
