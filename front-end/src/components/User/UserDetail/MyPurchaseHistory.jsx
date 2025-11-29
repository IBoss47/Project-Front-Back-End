import { ShoppingBagIcon } from "@heroicons/react/24/solid";
import { useEffect, useState } from "react";
import api from "../../../api/auth";
import PurchasedNoteModal from "../../PurchasedNoteModal";

export default function MyPurchaseHistory() {
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPurchase, setSelectedPurchase] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchPurchases = async () => {
    setLoading(true);
    try {
      const response = await api.get("/my-purchases");
      setPurchases(response.data);
    } catch (error) {
      console.error("Error fetching purchases:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPurchases();
  }, []);

  const handlePurchaseClick = (purchase) => {
    setSelectedPurchase(purchase);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedPurchase(null);
  };

  const handleReviewSubmitted = () => {
    fetchPurchases(); // Refresh the list after review submission
  };

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm min-h-[300px]">
        <div className="flex justify-center items-center h-64">
          <p className="text-gray-500">กำลังโหลด...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm min-h-[300px]">
      {/* Tabs */}
      <div className="border-b pb-2 mb-6 flex items-center gap-6">
        <button className="text-blue-900 font-semibold border-b-2 border-blue-900 pb-2">
          ประวัติการซื้อ
        </button>
      </div>

      {purchases.length === 0 ? (
        /* Empty State */
        <div className="flex flex-col justify-center items-center mt-10">
          {/* Icon */}
          <div className="w-28 h-28 flex items-center justify-center rounded-full bg-gray-100 mb-4">
            <ShoppingBagIcon className="w-10 h-10 text-blue-700" />
          </div>

          {/* Text */}
          <p className="text-gray-600 text-lg">ยังไม่มีประวัติการซื้อ</p>
        </div>
      ) : (
        /* Purchase List - Row Style */
        <div className="space-y-4">
          {purchases.map((purchase) => (
            <div
              key={purchase.buyed_note_id}
              onClick={() => handlePurchaseClick(purchase)}
              className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="flex items-center gap-4">
                {/* Image */}
                <div className="w-20 h-20 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden">
                  {purchase.cover_image ? (
                    <img
                      src={`http://localhost:8080/${purchase.cover_image}`}
                      alt={purchase.book_title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-gray-400 text-xs">No Image</span>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 truncate mb-1">
                    {purchase.book_title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-1">
                    {purchase.course?.name || 'ไม่ระบุวิชา'}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span>{purchase.exam_term || 'ไม่ระบุภาคการศึกษา'}</span>
                    <span>•</span>
                    <span>ผู้ขาย: {purchase.seller?.fullname || 'ไม่ระบุ'}</span>
                  </div>
                </div>

                {/* Price & Status */}
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-lg font-bold text-blue-600">
                      ฿{purchase.price}
                    </p>
                    {purchase.review && purchase.is_liked !== null ? (
                      <span className="text-xs text-green-600 flex items-center gap-1">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        รีวิวแล้ว
                      </span>
                    ) : (
                      <span className="text-xs text-orange-600">รอรีวิว</span>
                    )}
                  </div>

                  {/* Arrow Icon */}
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {selectedPurchase && (
        <PurchasedNoteModal
          purchase={selectedPurchase}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onReviewSubmitted={handleReviewSubmitted}
        />
      )}
    </div>
  );
}
