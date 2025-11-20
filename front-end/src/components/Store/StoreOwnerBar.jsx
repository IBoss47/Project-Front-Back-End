// src/components/StoreOwnerBar.jsx
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";

export default function StoreOwnerBar({
  ownerName = "Myshop",
  subtitle = "1150",
  avatarUrl = "",
  shareUrl,           // ถ้าไม่ส่งมา จะใช้ window.location.href
  canEdit = true,     // ควบคุมการแสดงปุ่มแก้ไข
}) {
  const navigate = useNavigate();
  const initials = useMemo(() => {
    if (!ownerName) return "U";
    const parts = ownerName.trim().split(" ");
    const a = parts[0]?.[0] ?? "";
    const b = parts[1]?.[0] ?? "";
    return (a + b || a || "U").toUpperCase();
  }, [ownerName]);

  async function onShare() {
    const url = shareUrl || (typeof window !== "undefined" ? window.location.href : "");
    try {
      if (navigator.share) {
        await navigator.share({ title: ownerName, url });
      } else {
        await navigator.clipboard.writeText(url);
        alert("คัดลอกลิงก์หน้าร้านแล้ว");
      }
    } catch (e) {
      // กรณีผู้ใช้กดยกเลิก ไม่ต้องทำอะไร
    }
  }

  return (
    <section className="rounded-2xl border bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        {/* ซ้าย: avatar + ชื่อ + subtitle */}
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 overflow-hidden rounded-full border bg-gray-100">
            {avatarUrl ? (
              <img src={avatarUrl} alt="avatar" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-sm text-gray-500">
                {initials}
              </div>
            )}
          </div>
          <div>
            <h2 className="text-base font-semibold leading-5">{ownerName}</h2>
            <p className="text-sm text-gray-600">{subtitle}</p>
          </div>
        </div>

        {/* ขวา: ปุ่มแชร์ + แก้ไข */}
        <div className="flex items-center gap-2">
          <button
            onClick={onShare}
            className="inline-flex items-center gap-1 rounded-lg border bg-white px-3 py-1.5 text-sm hover:bg-gray-50"
            title="แชร์หน้าร้าน"
          >
            {/* ไอคอน share (SVG เล็ก ๆ) */}
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 8a3 3 0 1 0-3-3" />
              <path d="M15 5 6 9" />
              <circle cx="6" cy="12" r="3" />
              <circle cx="18" cy="18" r="3" />
              <path d="M8.5 13.5 16 17" />
            </svg>
            แชร์
          </button>

          {canEdit && (
            <button
              onClick={() => navigate("/profile")}
              className="rounded-lg bg-indigo-600 px-3 py-1.5 text-sm text-white hover:bg-indigo-700"
            >
              แก้ไข
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
