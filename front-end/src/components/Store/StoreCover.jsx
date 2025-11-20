// src/components/StoreCover.jsx
import { useRef, useState } from "react";

export default function StoreCover({ coverUrl, onSave, canEdit = true }) {
  const [preview, setPreview] = useState(null);   // dataURL ชั่วคราว
  const [file, setFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [saving, setSaving] = useState(false);
  const inputRef = useRef(null);

  const pickFile = () => inputRef.current?.click();

  function onFileSelect(f) {
    if (!f) return;
    if (!f.type.startsWith("image/")) { alert("โปรดเลือกไฟล์รูปภาพ"); return; }
    setFile(f);
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result);
    reader.readAsDataURL(f);
  }

  async function save() {
    if (!file) return;
    setSaving(true);
    try {
      const url = await onSave(file);   // อัปโหลด -> คืน URL ใหม่
      // parent ควรอัปเดต state ของ coverUrl เองหลัง onSave สำเร็จ
      setPreview(null);
      setFile(null);
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="relative rounded-2xl border bg-white p-3 shadow-sm">
      <div
        className={`relative aspect-[2/1] w-full overflow-hidden rounded-xl border ${dragOver ? "ring-2 ring-indigo-400" : ""}`}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); onFileSelect(e.dataTransfer.files?.[0]); }}
      >
        {/* ภาพ (ลำดับ: preview > coverUrl > placeholder) */}
        {preview ? (
          <img src={preview} alt="store cover preview" className="h-full w-full object-cover" />
        ) : coverUrl ? (
          <img src={coverUrl} alt="store cover" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-gray-400">
            <div className="rounded-lg border border-dashed bg-gray-50 px-4 py-3 text-sm">
              วางรูปที่นี่ หรือกด “แก้ไข” เพื่อเลือกไฟล์
            </div>
          </div>
        )}

        {/* ปุ่มแก้ไข (มุมขวาล่าง) */}
        {canEdit && !preview && (
          <button
            onClick={pickFile}
            className="absolute bottom-3 right-3 rounded-lg border bg-white/90 px-3 py-1 text-sm hover:bg-white"
          >
            แก้ไข
          </button>
        )}

        {/* โหมดพรีวิว: ปุ่มบันทึก/ยกเลิก */}
        {preview && (
          <div className="absolute bottom-3 right-3 flex gap-2">
            <button
              onClick={() => { setPreview(null); setFile(null); }}
              className="rounded-lg border bg-white/90 px-3 py-1 text-sm hover:bg-white"
              disabled={saving}
            >
              ยกเลิก
            </button>
            <button
              onClick={save}
              className="rounded-lg bg-indigo-600 px-3 py-1 text-sm text-white hover:bg-indigo-700 disabled:opacity-50"
              disabled={saving}
            >
              {saving ? "กำลังบันทึก…" : "บันทึก"}
            </button>
          </div>
        )}
      </div>

      {/* file input (ซ่อน) */}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => onFileSelect(e.target.files?.[0])}
      />
    </section>
  );
}
