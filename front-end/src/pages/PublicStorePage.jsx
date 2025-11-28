// src/pages/PublicStorePage.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

import StoreOwnerBar from "../components/Store/StoreOwnerBar";
import StoreProductsPanel from "../components/Store/StoreProductsPanel";

export default function PublicStorePage() {
  const { userId } = useParams();
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!userId) return;

      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem("access_token");
        const response = await axios.get(`http://localhost:8080/api/users/${userId}/profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setUserData(response.data);
      } catch (error) {
        console.error("Error fetching user data:", error);
        setError("ไม่สามารถโหลดข้อมูลร้านได้");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [userId]);

  if (loading) return <div className="pt-24 text-center">กำลังโหลด...</div>;

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 pt-24 pb-16">
        <div className="mx-auto max-w-2xl px-4 text-center">
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="min-h-screen bg-gray-50 pt-24 pb-16">
        <div className="mx-auto max-w-2xl px-4 text-center">
          <p className="text-gray-600">ไม่พบข้อมูลผู้ใช้</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen pt-6">
      {/* คอนเทนต์กึ่งกลางจอตามไวร์เฟรม */}
      <div className="flex justify-center px-6">
        <div className="w-full max-w-6xl px-20 space-y-4">
          {/* แถบข้อมูลเจ้าของ (การ์ด) - ไม่มีปุ่มแก้ไข */}
          <StoreOwnerBar
            ownerName={userData.fullname}
            subtitle={userData.email}
            memberId={userData.id}
            avatarUrl=""
            shareUrl={window.location.href}
            canEdit={false}
          />

          {/* พาเนลสินค้า: แท็บ + ค้นหา + กริด (การ์ด) */}
          <StoreProductsPanel userId={userData.id} />
        </div>
      </div>
    </div>
  );
}
