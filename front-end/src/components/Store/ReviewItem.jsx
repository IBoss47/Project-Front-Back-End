import React from 'react';
import { HandThumbUpIcon, HandThumbDownIcon } from '@heroicons/react/24/solid';

const ReviewItem = ({ review, showNoteName = true }) => {
  const getAvatarUrl = () => {
    if (!review.buyer_avatar) return null;
    if (review.buyer_avatar.startsWith('http')) return review.buyer_avatar;
    return `http://localhost:8080${review.buyer_avatar}`;
  };

  return (
    <div className="border rounded-lg p-4 bg-white hover:shadow-md transition-shadow">
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div className="flex-shrink-0">
          {getAvatarUrl() ? (
            <img 
              src={getAvatarUrl()}
              alt={review.buyer_name}
              className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
              <span className="text-gray-600 font-medium">
                {review.buyer_name?.[0]?.toUpperCase() || 'U'}
              </span>
            </div>
          )}
        </div>

        {/* เนื้อหารีวิว */}
        <div className="flex-1">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h4 className="font-semibold text-gray-900">{review.buyer_name}</h4>
              <p className="text-sm text-gray-500">{review.created_at}</p>
            </div>
            
            {/* ไอคอนชอบ/ไม่ชอบ */}
            {review.is_liked !== null && (
              <div className={`flex items-center gap-1 px-3 py-1 rounded-full ${
                review.is_liked 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-red-100 text-red-700'
              }`}>
                {review.is_liked ? (
                  <>
                    <HandThumbUpIcon className="w-5 h-5" />
                    <span className="text-sm font-medium">ชอบ</span>
                  </>
                ) : (
                  <>
                    <HandThumbDownIcon className="w-5 h-5" />
                    <span className="text-sm font-medium">ไม่ชอบ</span>
                  </>
                )}
              </div>
            )}
          </div>

          {/* ชื่อสินค้า - แสดงเฉพาะเมื่อต้องการ */}
          {showNoteName && (
            <div className="mb-2">
              <span className="inline-block bg-blue-50 text-blue-700 text-xs font-medium px-2 py-1 rounded">
                {review.note_title}
              </span>
              {review.course_code && (
                <span className="ml-2 text-xs text-gray-500">
                  {review.course_code} - {review.course_name}
                </span>
              )}
            </div>
          )}

          {/* ข้อความรีวิว */}
          <p className="text-gray-700 leading-relaxed">{review.review}</p>
        </div>
      </div>
    </div>
  );
};

// Component สำหรับแสดงหลายรีวิว
const ReviewList = ({ reviews, loading, showNoteName = true, emptyMessage = "ยังไม่มีรีวิว" }) => {
  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
      </div>
    );
  }

  if (!reviews || reviews.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {reviews.map(review => (
        <ReviewItem key={review.id} review={review} showNoteName={showNoteName} />
      ))}
    </div>
  );
};

// Component สำหรับแสดงสถิติรีวิว
const ReviewStats = ({ stats, loading }) => {
  if (loading) {
    return (
      <div className="text-center py-4">
        <div className="inline-block h-6 w-6 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
      </div>
    );
  }

  if (!stats || stats.total_reviews === 0) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div className="bg-gray-50 rounded-lg p-4 text-center">
        <div className="text-2xl font-bold text-gray-900">{stats.total_reviews}</div>
        <div className="text-sm text-gray-600">รีวิวทั้งหมด</div>
      </div>
      <div className="bg-green-50 rounded-lg p-4 text-center">
        <div className="text-2xl font-bold text-green-600">{stats.liked_count || 0}</div>
        <div className="text-sm text-gray-600">ชอบ ({(stats.liked_percent || 0).toFixed(1)}%)</div>
      </div>
      <div className="bg-red-50 rounded-lg p-4 text-center">
        <div className="text-2xl font-bold text-red-600">{stats.disliked_count || 0}</div>
        <div className="text-sm text-gray-600">ไม่ชอบ ({(stats.disliked_percent || 0).toFixed(1)}%)</div>
      </div>
    </div>
  );
};

export { ReviewItem, ReviewList, ReviewStats };
export default ReviewItem;
