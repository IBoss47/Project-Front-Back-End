import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { XMarkIcon, PlusIcon, MinusIcon, TrashIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';
import api from '../api/auth';

const Shopping_Cart = () => {
  const { cartItems, removeFromCart, updateQuantity, clearCart, getTotalPrice } = useCart();
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [purchaseError, setPurchaseError] = useState('');

  const handlePurchase = async () => {
    setIsPurchasing(true);
    setPurchaseError('');

    try {
      // ดึง note_ids จาก cartItems
      const noteIds = cartItems.map(item => item.note_id);
      
      // เรียก API purchase
      const response = await api.post('/purchase', { note_ids: noteIds });

      console.log('Purchase successful:', response.data);
      
      // แสดง modal สำเร็จ
      setIsCheckoutModalOpen(true);
    } catch (error) {
      console.error('Purchase error:', error);
      
      if (error.response?.status === 401) {
        setPurchaseError('กรุณาเข้าสู่ระบบก่อนทำการชำระเงิน');
      } else if (error.response?.data?.error) {
        setPurchaseError(error.response.data.error);
      } else {
        setPurchaseError('ไม่สามารถทำการชำระเงินได้ กรุณาลองใหม่อีกครั้ง');
      }
    } finally {
      setIsPurchasing(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 pt-24">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center py-20">
            <div className="mb-6 text-7xl">📝</div>
            <h1 className="text-4xl font-bold text-gray-800 mb-4">ตะกร้าของคุณว่างเปล่า</h1>
            <p className="text-gray-600 text-lg mb-8">ไปค้นหาสรุปวิชาที่คุณต้องการสิ</p>
            <Link
              to="/"
              className="inline-block px-8 py-3 bg-gradient-to-r from-viridian-600 to-viridian-700 
                text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-300
                transform hover:scale-105"
            >
              ← กลับไปหน้าค้นหา
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 pt-24 pb-16">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">📝 ตะกร้าสรุปวิชา</h1>
          <p className="text-gray-600">คุณมีสรุปวิชา {cartItems.length} ชุดในตะกร้า</p>
        </div>        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="divide-y divide-gray-200">
                {cartItems.map((item, index) => (
                  <div
                    key={item.id}
                    className="p-6 hover:bg-gray-50 transition-colors duration-200
                      transform transition-all duration-300 animate-fade-in"
                    style={{
                      animation: `fadeInUp 0.5s ease-out ${index * 0.05}s both`
                    }}
                  >
                    <div className="flex flex-col sm:flex-row gap-6">
                      {/* Book Image */}
                      <div className="w-full sm:w-32 h-40 sm:h-32 flex-shrink-0 rounded-lg overflow-hidden shadow-md">
                        <img
                          src={item.book_cover || item.book_image || '/images/book-placeholder.jpg'}
                          alt={item.book_title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/300x400/6366f1/ffffff?text=' + encodeURIComponent(item.book_title);
                          }}
                        />
                      </div>

                      {/* Book Info */}
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h3 className="text-lg font-bold text-gray-900 mb-1">
                                {item.book_title}
                              </h3>
                              <p className="text-sm text-gray-600 mb-2">
                                <span className="font-medium">ผู้สร้าง:</span> {item.seller_name}
                              </p>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold
                              ${item.condition === 'สภาพดี'
                                ? 'bg-green-100 text-green-700'
                                : item.condition === 'สภาพปกติ'
                                  ? 'bg-yellow-100 text-yellow-700'
                                  : 'bg-orange-100 text-orange-700'
                              }`}
                            >
                              {item.condition}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 mb-3">
                            {item.semester} • ปีที่ {item.course_year || '-'}
                          </p>
                        </div>

                        {/* Price and Quantity */}
                        <div className="flex items-end justify-between">
                          <div>
                            <p className="text-3xl font-bold text-viridian-600">
                              ฿{item.price}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              รวม: ฿{(item.price * item.quantity).toLocaleString()}
                            </p>
                          </div>

                          <div className="flex items-center gap-3">
                            {/* Quantity Control */}
                            <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-2">
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                className="p-1 hover:bg-gray-200 rounded transition-colors"
                                title="ลดจำนวน"
                              >
                                <MinusIcon className="w-4 h-4 text-gray-700" />
                              </button>
                              <span className="min-w-[2rem] text-center font-semibold text-gray-900">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                className="p-1 hover:bg-gray-200 rounded transition-colors"
                                title="เพิ่มจำนวน"
                              >
                                <PlusIcon className="w-4 h-4 text-gray-700" />
                              </button>
                            </div>

                            {/* Delete Button */}
                            <button
                              onClick={() => removeFromCart(item.id)}
                              className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors"
                              title="ลบออกจากตะกร้า"
                            >
                              <TrashIcon className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Clear Cart Button */}
            <button
              onClick={clearCart}
              className="mt-4 w-full px-4 py-2 text-gray-600 hover:text-red-600 
                font-medium transition-colors border-2 border-gray-200 rounded-lg
                hover:border-red-300 hover:bg-red-50"
            >
              🗑️ ล้างตะกร้า
            </button>

            {/* Continue Shopping */}
            <Link
              to="/"
              className="mt-4 w-full inline-block text-center px-4 py-2 text-blue-600 
                hover:text-blue-700 font-medium transition-colors border-2 border-blue-200 
                rounded-lg hover:bg-blue-50"
            >
              ← ค้นหาสรุปวิชาเพิ่มเติม
            </Link>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-28 h-fit">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">📋 สรุปการสั่งซื้อ</h2>

              {/* Summary Details */}
              <div className="space-y-3 mb-6 pb-6 border-b-2 border-gray-100">
                <div className="flex justify-between text-gray-700">
                  <span>จำนวนชุด:</span>
                  <span className="font-semibold">{cartItems.length} ชุด</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>ไฟล์ทั้งหมด:</span>
                  <span className="font-semibold">
                    {cartItems.reduce((total, item) => total + item.quantity, 0)} ไฟล์
                  </span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>ค่าจัดส่ง:</span>
                  <span className="font-semibold text-green-600">ฟรี (ไฟล์ดิจิทัล) 📥</span>
                </div>
              </div>

              {/* Total */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-gray-700">ยอดรวม:</span>
                  <span className="text-3xl font-bold text-blue-600">
                    ฿{getTotalPrice().toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Checkout Button */}
              <button
                onClick={handlePurchase}
                disabled={isPurchasing}
                className={`w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-blue-700 
                  text-white font-bold rounded-xl hover:shadow-lg transition-all duration-300
                  transform hover:scale-105 text-lg flex items-center justify-center gap-2
                  ${isPurchasing ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {isPurchasing ? (
                  <>
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    กำลังดำเนินการ...
                  </>
                ) : (
                  <>
                    💳 ดำเนินการชำระเงิน
                  </>
                )}
              </button>

              {/* Error Message */}
              {purchaseError && (
                <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-xs text-red-700">{purchaseError}</p>
                </div>
              )}

              {/* Info */}
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-xs text-blue-700">
                  ⓘ ไฟล์จะถูกจัดส่งทางอีเมลหลังชำระเงิน
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Checkout Modal */}
        {isCheckoutModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 animate-scale-in">
              <div className="text-center mb-6">
                <div className="text-5xl mb-4">🎉</div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">สั่งซื้อสำเร็จ!</h3>
                <p className="text-gray-600">ยอดรวม: <span className="text-2xl font-bold text-blue-600">฿{getTotalPrice().toLocaleString()}</span></p>
              </div>

              <div className="space-y-3 mb-6">
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm text-blue-900">
                    ✓ ไฟล์สรุปวิชาจะส่งไปที่อีเมลของคุณ
                  </p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-sm text-green-900">
                    ✓ โปรดตรวจสอบ Spam folder หากไม่เห็นอีเมล
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  clearCart();
                  setIsCheckoutModalOpen(false);
                }}
                className="w-full py-2 px-4 bg-gradient-to-r from-blue-600 to-blue-700 
                  text-white font-semibold rounded-lg hover:shadow-lg transition-all duration-300"
              >
                ✓ ตกลง
              </button>

              <button
                onClick={() => setIsCheckoutModalOpen(false)}
                className="w-full mt-3 py-2 px-4 text-gray-600 font-medium rounded-lg 
                  hover:bg-gray-100 transition-colors"
              >
                ย้อนกลับ
              </button>
            </div>
          </div>
        )}
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
        
        @keyframes scale-in {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }

        .animate-scale-in {
          animation: scale-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default Shopping_Cart;
