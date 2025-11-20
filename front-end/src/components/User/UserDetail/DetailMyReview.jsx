import { StarIcon } from "@heroicons/react/24/solid";

export default function DetailMyReview() {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm min-h-[300px]">

      {/* Tabs */}
      <div className="border-b pb-2 mb-8 flex items-center gap-6">
        <button className="text-blue-900 font-semibold border-b-2 border-blue-900 pb-2">
          รีวิวทั้งหมด
        </button>
      </div>

      {/* Empty State */}
      <div className="flex flex-col justify-center items-center mt-10">

        {/* Icon */}
        <div className="w-28 h-28 flex items-center justify-center rounded-full bg-gray-100 mb-4">
          <StarIcon className="w-10 h-10 text-blue-700" />
        </div>

        {/* Text */}
        <p className="text-gray-600 text-lg">ยังไม่มีรายการรีวิว</p>
      </div>

    </div>
  );
}
