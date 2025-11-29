import React, { useState } from 'react';
import { XMarkIcon, ArrowDownTrayIcon, HeartIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import api from '../api/auth';

const PurchasedNoteModal = ({ purchase, isOpen, onClose, onReviewSubmitted }) => {
  const [review, setReview] = useState(purchase.review || '');
  const [isLiked, setIsLiked] = useState(purchase.is_liked);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [hasSubmitted, setHasSubmitted] = useState(purchase.review !== '' || purchase.is_liked !== null);

  if (!isOpen) return null;

  const handleDownload = async () => {
    try {
      const response = await api.get(`/download/${purchase.note_id}`, {
        responseType: 'blob'
      });

      // สร้าง URL สำหรับ blob และเปิดใน tab ใหม่
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      window.open(url, '_blank');
      
      // ล้าง URL หลังจาก 1 นาที
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
      }, 60000);
    } catch (error) {
      console.error('Download error:', error);
      alert('ไม่สามารถเปิด PDF ได้ กรุณาลองใหม่อีกครั้ง');
    }
  };

  const handleSubmitReview = async () => {
    if (!review.trim()) {
      setError('กรุณาเขียนรีวิวก่อนยืนยัน');
      return;
    }

    if (isLiked === null) {
      setError('กรุณาเลือกว่าชอบหรือไม่ชอบ');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      await api.put(`/my-purchases/${purchase.buyed_note_id}`, {
        review: review,
        is_liked: isLiked
      });

      setHasSubmitted(true);
      alert('บันทึกรีวิวสำเร็จ!');
      
      if (onReviewSubmitted) {
        onReviewSubmitted();
      }
    } catch (err) {
      console.error('Error submitting review:', err);
      setError('ไม่สามารถบันทึกรีวิวได้ กรุณาลองใหม่อีกครั้ง');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800">รายละเอียดสรุปที่ซื้อ</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <XMarkIcon className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Book Info */}
          <div className="mb-6">
            <h3 className="text-xl font-bold text-gray-900 mb-2">{purchase.book_title}</h3>
            <div className="grid grid-cols-2 gap-3 text-sm text-gray-600">
              <div>
                <span className="font-medium">วิชา:</span> {purchase.course?.name || '-'}
              </div>
              <div>
                <span className="font-medium">ภาคการศึกษา:</span> {purchase.exam_term || '-'}
              </div>
              <div>
                <span className="font-medium">ราคา:</span> ฿{purchase.price}
              </div>
              <div>
                <span className="font-medium">ผู้ขาย:</span> {purchase.seller?.fullname || '-'}
              </div>
            </div>
          </div>

          {/* Download Button */}
          <div className="mb-6">
            <button
              onClick={handleDownload}
              className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-blue-700 
                text-white font-bold rounded-xl hover:shadow-lg transition-all duration-300
                transform hover:scale-105 flex items-center justify-center gap-2"
            >
              <ArrowDownTrayIcon className="w-5 h-5" />
              ดาวน์โหลด PDF
            </button>
          </div>

          {/* Review Section */}
          <div className="border-t pt-6">
            <h4 className="text-lg font-bold text-gray-800 mb-4">รีวิวและความคิดเห็น</h4>

            {/* Like/Dislike */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                คุณชอบสรุปนี้หรือไม่?
              </label>
              <div className="flex gap-4">
                <button
                  onClick={() => !hasSubmitted && setIsLiked(true)}
                  disabled={hasSubmitted}
                  className={`flex items-center gap-2 px-6 py-3 rounded-lg border-2 transition-all
                    ${isLiked === true 
                      ? 'border-red-500 bg-red-50 text-red-700' 
                      : 'border-gray-300 hover:border-red-300'}
                    ${hasSubmitted ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
                >
                  {isLiked === true ? (
                    <HeartSolidIcon className="w-6 h-6 text-red-500" />
                  ) : (
                    <HeartIcon className="w-6 h-6" />
                  )}
                  <span className="font-medium">ชอบ</span>
                </button>

                <button
                  onClick={() => !hasSubmitted && setIsLiked(false)}
                  disabled={hasSubmitted}
                  className={`flex items-center gap-2 px-6 py-3 rounded-lg border-2 transition-all
                    ${isLiked === false 
                      ? 'border-gray-500 bg-gray-50 text-gray-700' 
                      : 'border-gray-300 hover:border-gray-400'}
                    ${hasSubmitted ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
                >
                  <span className="font-medium">ไม่ชอบ</span>
                </button>
              </div>
            </div>

            {/* Review Text */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                เขียนรีวิว
              </label>
              <textarea
                value={review}
                onChange={(e) => !hasSubmitted && setReview(e.target.value)}
                disabled={hasSubmitted}
                placeholder="แบ่งปันความคิดเห็นของคุณเกี่ยวกับสรุปนี้..."
                rows="4"
                className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 
                  focus:ring-blue-500 focus:border-transparent resize-none
                  ${hasSubmitted ? 'bg-gray-50 cursor-not-allowed' : ''}`}
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            {!hasSubmitted ? (
              <button
                onClick={handleSubmitReview}
                disabled={isSubmitting}
                className={`w-full py-3 px-4 bg-gradient-to-r from-green-600 to-green-700 
                  text-white font-bold rounded-xl hover:shadow-lg transition-all duration-300
                  transform hover:scale-105 flex items-center justify-center gap-2
                  ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    กำลังบันทึก...
                  </>
                ) : (
                  <>
                    ✓ ยืนยันรีวิว
                  </>
                )}
              </button>
            ) : (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-700 text-center">
                  ✓ คุณได้ยืนยันรีวิวแล้ว (ไม่สามารถแก้ไขได้อีก)
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PurchasedNoteModal;
