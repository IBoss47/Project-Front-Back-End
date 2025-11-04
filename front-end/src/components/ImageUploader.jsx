import React, { useState } from "react";
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { arrayMove, SortableContext, horizontalListSortingStrategy } from "@dnd-kit/sortable";
import SortableItem from "./SortableItem";


const ImageUploader = () =>{
  const [images, setImages] = useState([]);
  const sensors = useSensors(useSensor(PointerSensor));

  const handleFilesChange = (e) => {
    const files = Array.from(e.target.files);
    const newImages = files.map((file) => ({
      id: URL.createObjectURL(file),
      file,
    }));
    setImages((prev) => [...prev, ...newImages]);
  };

  const handleDelete = (id) => {
    setImages((prev) => prev.filter((img) => img.id !== id));
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      const oldIndex = images.findIndex((img) => img.id === active.id);
      const newIndex = images.findIndex((img) => img.id === over.id);
      setImages(arrayMove(images, oldIndex, newIndex));
    }
  };

  return (
    <div className="p-4">
      {/* ปุ่มเลือกไฟล์แบบ custom */}
      <input
        id="file-upload"
        type="file"
        multiple
        onChange={handleFilesChange}
        className="hidden"
      />
      <label
        htmlFor="file-upload"
        className="cursor-pointer inline-flex items-center px-4 py-2 mb-4 bg-blue-500 text-white text-sm font-medium rounded-lg shadow hover:bg-blue-600"
      >
        📂 เลือกรูปภาพ
      </label>

      {/* แสดงภาพ + drag & drop */}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={images.map((img) => img.id)} strategy={horizontalListSortingStrategy}>
          <div className="flex gap-4 flex-wrap">
            {images.map((img) => (
              <SortableItem key={img.id} id={img.id}>
                <div className="relative w-24 h-24">
                  <img
                    src={img.id}
                    alt=""
                    className="w-full h-full object-cover rounded-lg border border-gray-300"
                  />
                  <button
                    onClick={() => handleDelete(img.id)}
                    className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600"
                  >
                    ×
                  </button>
                </div>
              </SortableItem>
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}

export default ImageUploader;
