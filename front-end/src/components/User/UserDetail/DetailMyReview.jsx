import { ShoppingBagIcon } from "@heroicons/react/24/solid";
import { useEffect, useState } from "react";
import api from '../../../api/auth';
import SaleList from "../../SaleList";

export default function DetailMyReview() {
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPurchases = async () => {
      setLoading(true);
      try {
        const response = await api.get('/my-purchases');
        setPurchases(response.data);
      } catch (error) {
        console.error("Error fetching purchases:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPurchases();
  }, []);

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
        /* Purchase List using SaleList component */
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {purchases.map((purchase) => (
            <SaleList key={purchase.id} book={purchase} />
          ))}
        </div>
      )}
    </div>
  );
}
