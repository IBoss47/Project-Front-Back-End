// src/pages/MyStorePage.jsx
import React, { useEffect, useState } from "react";

import StoreCover from "../components/StoreCover";                 // ส่วนที่ 1 (การ์ด)
import StoreOwnerBar from "../components/StoreOwnerBar";           // ส่วนที่ 2 (การ์ด)
import StoreProductsPanel from "../components/StoreProductsPanel"; // ส่วนที่ 3 (การ์ด)

import { getAllBooks } from "../data/booksData";

/* ----------------- MOCK เล็ก ๆ ในไฟล์นี้ เพื่อให้รันได้ทันที ----------------- */
// อัปโหลดภาพ cover (เดโม่)
const uploadImageMock = async (file) =>
  new Promise((res) => {
    const url = URL.createObjectURL(file);
    setTimeout(() => res(url), 400);
  });

// ดึงข้อมูลร้าน (เดโม่)
async function getMyStore() {
  return {
    id: "s_1",
    name: "My Store",
    handle: "mystore",
    coverUrl: "",
    paused: false,
    ownerName: "คุณนักสรุป",
    subtitle: "Silpakorn University · IT",
    avatarUrl: "",
  };
}
async function createMyStore(data) { return { id: "s_new", paused: false, ...data }; }
async function updateMyStore(patch) { return { ...patch }; }

// EmptyState แบบเบา ๆ เผื่อไม่มีร้าน
function EmptyState({ title, action }) {
  return (
    <div className="rounded-2xl border bg-white p-6 text-center shadow-sm">
      <p className="mb-3 text-gray-700">{title}</p>
      {action}
    </div>
  );
}
/* -------------------------------------------------------------------------- */

export default function MyStorePage() {
  const [store, setStore] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const s = await getMyStore().catch(() => null);
      setStore(s);
      setLoading(false);
    })();
  }, []);

  async function onCreateStore() {
    const s = await createMyStore({ name: "My Store", handle: "mystore" });
    setStore({
      ...s,
      ownerName: "คุณนักสรุป",
      subtitle: "Silpakorn University · IT",
      avatarUrl: "",
    });
  }

  async function handleSaveCover(file) {
    const url = await uploadImageMock(file);
    const updated = await updateMyStore({ coverUrl: url });
    setStore((prev) => ({ ...prev, ...updated }));
    return url;
  }

  if (loading) return <div className="pt-24 text-center">กำลังโหลด...</div>;

  if (!store) {
    return (
      <div className="min-h-screen bg-gray-50 pt-24 pb-16">
        <div className="mx-auto max-w-5xl px-4">
          <EmptyState
            title="คุณยังไม่มีร้าน เริ่มต้นสร้างร้านของคุณเลย"
            action={
              <button className="rounded-xl bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700" onClick={onCreateStore}>
                สร้างร้าน
              </button>
            }
          />
        </div>
      </div>
    );
  }

  // ใช้ booksData จริง แสดง 5 รายการสำหรับส่วนที่ 3
  const showcaseProducts = getAllBooks().slice(0, 5);

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-16">
      {/* คอนเทนต์กึ่งกลางจอตามไวร์เฟรม */}
      <div className="mx-auto max-w-5xl px-4 space-y-4">
        {/* 1) รูปหน้าร้าน (การ์ด) */}
        <StoreCover coverUrl={store.coverUrl} onSave={handleSaveCover} />

        {/* 2) แถบข้อมูลเจ้าของ (การ์ด) */}
        <StoreOwnerBar
          ownerName={store.ownerName}
          subtitle={store.subtitle}
          avatarUrl={store.avatarUrl}
          shareUrl={`${window.location.origin}/store/${store.handle}`}
          canEdit={true}
        />

        {/* 3) พาเนลสินค้า: แท็บ + ค้นหา + กริด (การ์ด) */}
        <StoreProductsPanel products={showcaseProducts} />
      </div>
    </div>
  );
}
