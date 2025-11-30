import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { XMarkIcon, ShoppingCartIcon, HeartIcon, StarIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon, StarIcon as StarSolidIcon, HandThumbUpIcon, HandThumbDownIcon } from '@heroicons/react/24/solid';
import { useCart } from '../context/CartContext';
import { ReviewList, ReviewStats } from './Store/ReviewItem';
import api from '../api/auth';

const BookDetailModal = ({ book, isOpen, onClose }) => {

    const [showSuccessPopup, setShowSuccessPopup] = useState(false);
    const [showErrorPopup, setShowErrorPopup] = useState(false);
    const [popupMessage, setPopupMessage] = useState('');
    const { addToCart, isInCart } = useCart();
    const navigate = useNavigate();
    
    // Check if item is already in cart
    const itemInCart = isInCart(book?.id);
    
    // Check ownership and purchase status
    const [isPurchased, setIsPurchased] = useState(false);
    const [isOwner, setIsOwner] = useState(false);
    const [checkingStatus, setCheckingStatus] = useState(true);
    
    // Review states
    const [reviews, setReviews] = useState([]);
    const [reviewStats, setReviewStats] = useState(null);
    const [loadingReviews, setLoadingReviews] = useState(false);

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

    // Check purchase status and ownership when modal opens
    useEffect(() => {
        if (isOpen && book?.id) {
            checkPurchaseAndOwnership();
        }
    }, [isOpen, book?.id]);

    const checkPurchaseAndOwnership = async () => {
        setCheckingStatus(true);
        try {
            const token = localStorage.getItem('access_token');
            if (token) {
                const user = JSON.parse(localStorage.getItem('user') || '{}');
                
                // Check if user is the owner
                if (book.seller?.id === user.id) {
                    setIsOwner(true);
                    setCheckingStatus(false);
                    return;
                }

                // Check if already purchased
                try {
                    const response = await api.get('/my-purchases');
                    const hasPurchased = response.data.some(purchase => purchase.note_id === book.id);
                    setIsPurchased(hasPurchased);
                } catch (error) {
                    console.error('Error checking purchase status:', error);
                }
            }
        } catch (error) {
            console.error('Error checking ownership:', error);
        } finally {
            setCheckingStatus(false);
        }
    };

    // Fetch reviews when modal opens
    useEffect(() => {
        if (isOpen && book?.id) {
            fetchReviews();
        }
    }, [isOpen, book?.id]);

    const fetchReviews = async () => {
        setLoadingReviews(true);
        try {
            const [reviewsRes, statsRes] = await Promise.all([
                api.get(`/notes/${book.id}/reviews`),
                api.get(`/notes/${book.id}/reviews/stats`)
            ]);

            setReviews(reviewsRes.data.reviews || []);
            setReviewStats(statsRes.data);
        } catch (error) {
            console.error('Error fetching reviews:', error);
        } finally {
            setLoadingReviews(false);
        }
    };

    if (!isOpen || !book) return null;

    const course = book.course;

    const handleAddToCart = async () => {
        try {
            await addToCart(book);
            setPopupMessage(`เพิ่ม "${book.book_title}" เข้าตะกร้าแล้ว!`);
            setShowSuccessPopup(true);
            setTimeout(() => setShowSuccessPopup(false), 3000);
        } catch (error) {
            if (error.response?.status === 401) {
                setPopupMessage('กรุณาเข้าสู่ระบบก่อนเพิ่มสินค้าลงตะกร้า');
            } else {
                setPopupMessage('เกิดข้อผิดพลาดในการเพิ่มสินค้าลงตะกร้า');
            }
            setShowErrorPopup(true);
            setTimeout(() => setShowErrorPopup(false), 3000);
        }
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
            className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-md animate-fade-in flex items-center justify-center p-4"
            onClick={onClose}
        >
            {/* Success Popup */}
            {showSuccessPopup && (
                <div className="fixed top-4 right-4 z-[60] animate-slide-in-right">
                    <div className="bg-green-500 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 min-w-[300px]">
                        <div className="flex-shrink-0">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <div className="flex-1">
                            <p className="font-semibold text-sm">{popupMessage}</p>
                        </div>
                        <button 
                            onClick={() => setShowSuccessPopup(false)}
                            className="flex-shrink-0 hover:bg-green-600 rounded-full p-1 transition-colors"
                        >
                            <XMarkIcon className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            )}

            {/* Error Popup */}
            {showErrorPopup && (
                <div className="fixed top-4 right-4 z-[60] animate-slide-in-right">
                    <div className="bg-red-500 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 min-w-[300px]">
                        <div className="flex-shrink-0">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </div>
                        <div className="flex-1">
                            <p className="font-semibold text-sm">{popupMessage}</p>
                        </div>
                        <button 
                            onClick={() => setShowErrorPopup(false)}
                            className="flex-shrink-0 hover:bg-red-600 rounded-full p-1 transition-colors"
                        >
                            <XMarkIcon className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            )}

            <div
                className="bg-white w-full max-w-4xl max-h-[85vh] overflow-hidden flex flex-col animate-bounce-in rounded-3xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.5)] ring-4 ring-white/20"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-3 flex items-center justify-between shadow-lg">
                    <h2 className="text-2xl font-bold text-white">📋 รายละเอียดสรุปวิชา</h2>
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-white/20 rounded-full transition-all hover:rotate-90 duration-300"
                    >
                        <XMarkIcon className="w-5 h-5 text-white" />
                    </button>
                </div>

                {/* Content - Scrollable */}
                <div className="flex-1 overflow-y-auto bg-gradient-to-b from-gray-50 to-gray-100">
                    <div className="max-w-4xl mx-auto p-6">
                        <div className="grid lg:grid-cols-3 gap-8">
                            {/* Left: Study Notes Image */}
                            <div className="space-y-4">
                                <div className="relative aspect-[3/4] bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl overflow-hidden shadow-xl border-4 border-white">
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
                                            <svg className="w-16 h-16 mb-2" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                                            </svg>
                                            <span className="text-sm">ไม่มีรูปภาพ</span>
                                        </div>
                                    )}

                                    {/* Status Badge */}
                                    <div className="absolute top-3 left-3">
                                        <span className={`${statusBadge.color} text-white px-3 py-1 rounded-full text-xs font-bold shadow-md`}>
                                            {statusBadge.text}
                                        </span>
                                    </div>

                                    {/* Semester Badge */}
                                    {book.exam_term && (
                                        <div className="absolute top-3 right-3">
                                            <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-md flex items-center gap-1">
                                                📄 {book.exam_term}
                                            </span>
                                        </div>
                                    )}
                                </div>



                            </div>

                            {/* Right: Study Notes Details */}
                            <div className="lg:col-span-2 space-y-4">
                                {/* Course Info */}
                                <div>
                                    <p className="text-sm text-blue-600 font-bold uppercase tracking-wider mb-2">
                                        {course ? `${course.code} - ${course.name}` : 'ไม่ระบุวิชา'}
                                    </p>
                                    <div className="flex gap-2">
                                        <span className="inline-block bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-bold">
                                            ชั้นปี {course?.year || '-'}
                                        </span>
                                    </div>
                                </div>

                                {/* Study Notes Title */}
                                <div>
                                    <h3 className="text-2xl font-bold text-gray-800 mb-2 leading-tight">
                                        {book.book_title}
                                    </h3>
               
                                </div>

                                {/* Price */}
                                <div className="bg-gradient-to-r from-blue-100 to-indigo-100 p-4 rounded-2xl shadow-md border border-blue-200">
                                    <p className="text-sm text-gray-700 mb-1 font-semibold">ราคา</p>
                                    <p className="text-3xl font-bold text-blue-600">
                                        ฿{book.price.toFixed(2)}
                                    </p>
                                </div>

                                {/* Reviews */}
                                <div className="flex items-center gap-3">
                                    {reviewStats && (
                                        <>
                                            <div className="flex items-center gap-2 bg-green-50 px-3 py-2 rounded-xl border border-green-200">
                                                <HandThumbUpIcon className="w-5 h-5 text-green-600" />
                                                <span className="text-sm text-green-700 font-bold">
                                                    {reviewStats.liked_count || 0} ชอบ
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2 bg-red-50 px-3 py-2 rounded-xl border border-red-200">
                                                <HandThumbDownIcon className="w-5 h-5 text-red-600" />
                                                <span className="text-sm text-red-700 font-bold">
                                                    {reviewStats.disliked_count || 0} ไม่ชอบ
                                                </span>
                                            </div>
                                        </>
                                    )}
                                </div>


                                {/* Creator Info */}
                                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-2xl shadow-md border border-blue-100">
                                    <p className="text-sm text-gray-700 mb-2 font-semibold">👤 ผู้สร้างสรุป</p>
                                    <button
                                        onClick={() => {
                                            navigate(`/store/${book.seller?.id}`);
                                            onClose();
                                        }}
                                        className="w-full flex items-center gap-3 hover:bg-blue-100 p-2 rounded-xl transition-all"
                                    >
                                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-700 text-white rounded-full flex items-center justify-center font-bold text-lg shadow-sm">
                                            {book.seller?.fullname?.charAt(0) || 'U'}
                                        </div>
                                        <div className="text-left flex-1">
                                            <p className="font-bold text-base text-gray-800">{book.seller?.fullname}</p>
                                            <p className="text-xs text-blue-600 font-semibold">✓ ผู้สร้างที่เชื่อถือได้</p>
                                        </div>
                                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </button>
                                </div>

                                {/* Description */}
                                {book.description && (
                                    <div>
                                        <p className="text-sm text-gray-600 mb-2 font-semibold">📝 รายละเอียด</p>
                                        <p className="text-sm text-gray-700 leading-relaxed bg-white p-3 rounded-xl border-l-2 border-blue-500">
                                            {book.description}
                                        </p>
                                    </div>
                                )}

                                {/* Reviews Section */}
                                <div>
                                    <p className="text-sm text-gray-600 mb-3 font-semibold">⭐ รีวิว</p>
                                    <div className="space-y-4">
                                        <ReviewStats stats={reviewStats} loading={loadingReviews} />
                                        <ReviewList 
                                            reviews={reviews} 
                                            loading={loadingReviews}
                                            showNoteName={false}
                                            emptyMessage="ยังไม่มีรีวิวสำหรับสรุปนี้"
                                        />
                                    </div>
                                </div>

                                {/* Add to Cart Button */}
                                {book.status === 'available' ? (
                                    checkingStatus ? (
                                        <div className="w-full bg-gray-100 text-gray-500 px-4 py-3 rounded-xl text-center font-bold text-sm flex items-center justify-center gap-2">
                                            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                            </svg>
                                            กำลังตรวจสอบ...
                                        </div>
                                    ) : isOwner ? (
                                        <div className="w-full bg-gradient-to-r from-gray-100 to-gray-200 border-2 border-gray-300 text-gray-600 px-4 py-3 rounded-xl text-center font-bold text-sm flex items-center justify-center gap-2">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                                            </svg>
                                            นี่คือสรุปของคุณ
                                        </div>
                                    ) : isPurchased ? (
                                        <div className="w-full bg-gradient-to-r from-blue-100 to-indigo-100 border-2 border-blue-300 text-blue-700 px-4 py-3 rounded-xl text-center font-bold text-sm flex items-center justify-center gap-2">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                            คุณซื้อสรุปนี้แล้ว
                                        </div>
                                    ) : itemInCart ? (
                                        <div className="w-full bg-gradient-to-r from-green-100 to-emerald-100 border-2 border-green-300 text-green-700 px-4 py-3 rounded-xl text-center font-bold text-sm flex items-center justify-center gap-2">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                            มีอยู่ในตะกร้าแล้ว
                                        </div>
                                    ) : (
                                        <button
                                            onClick={handleAddToCart}
                                            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl font-bold text-sm transform hover:scale-105"
                                        >
                                            <ShoppingCartIcon className="w-4 h-4" />
                                            + เพิ่มลงตะกร้า
                                        </button>
                                    )
                                ) : (
                                    <div className="w-full bg-gray-200 text-gray-600 px-4 py-2 rounded-xl text-center font-bold text-sm">
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
