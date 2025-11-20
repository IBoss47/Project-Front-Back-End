import React, { useMemo, useState, useEffect } from "react";
import BookCard from '../SaleList';
import SearchBar from '../SearchBar';
import FilterSidebar from '../FilterSidebar';
import LoadingSpinner from '../LoadingSpinner';
import { ChevronDownIcon, FunnelIcon, Squares2X2Icon, ListBulletIcon } from '@heroicons/react/24/outline';
import { getAllBooks, filterBooks } from '../../data/mockBooksData';

// --- EmptyState (mock ไว้ใช้เวลายังไม่มีสินค้า) ---
function EmptyState({ title }) {
  return (
    <div className="rounded-xl border bg-gray-50 p-6 text-center text-gray-600">
      {title}
    </div>
  );
}

// --- การ์ดสินค้าแบบง่าย (แทน ProductCard/SaleList) ---
function ProductCard({ book }) {
  return (
    <div className="bg-white rounded-xl shadow hover:shadow-lg transition overflow-hidden">
      <img
        src={book.coverImage || "/images/book-placeholder.jpg"}
        alt={book.title}
        className="h-40 w-full object-cover"
      />
      <div className="p-4">
        <h3 className="text-sm font-bold mb-1">{book.title}</h3>
        <p className="text-xs text-gray-600 mb-2">โดย {book.author}</p>
        <p className="text-indigo-600 font-semibold">฿{book.price}</p>
      </div>
    </div>
  );
}

// --- คอมโพเนนต์หลัก StoreProductsPanel ---
export default function StoreProductsPanel() {
  const [tab, setTab] = useState("listed"); // listed | reviews | sold
  const [q, setQ] = useState("");

  const [books, setBooks] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [sortBy, setSortBy] = useState('newest');
  const [selectedSemester, setSelectedSemester] = useState('all');
  const [selectedYear, setSelectedYear] = useState('all');
  const [selectedCourseId, setSelectedCourseId] = useState('all');
  const [selectedCondition, setSelectedCondition] = useState('all');
  const [priceRange, setPriceRange] = useState({ min: 0, max: 1000 });
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState('grid'); // grid or list
  const [showFilters, setShowFilters] = useState(false);
  const booksPerPage = 12;

  useEffect(() => {
    // Load books from data
    setLoading(true);
    setTimeout(() => {
      const booksData = getAllBooks();
      setBooks(booksData);
      setFilteredBooks(booksData);
      setLoading(false);
    }, 500);
  }, []);

  const indexOfLastBook = currentPage * booksPerPage;
  const indexOfFirstBook = indexOfLastBook - booksPerPage;
  const currentBooks = filteredBooks.slice(indexOfFirstBook, indexOfLastBook);
  const totalPages = Math.ceil(filteredBooks.length / booksPerPage);

  const listed = useMemo(() => books, [books]);

  const filtered = useMemo(() => {
    const kw = q.trim().toLowerCase();
    if (!kw) return listed;
    return listed.filter((b) =>
      [b.title, b.author, b.category].join(" ").toLowerCase().includes(kw)
    );
  }, [listed, q]);

  return (
    <section className="rounded-2xl border bg-white p-4 shadow-sm">
      {/* Tabs */}
      <div className="flex gap-6 border-b pb-2 text-sm">
        <button
          className={`pb-2 ${tab === "listed"
            ? "border-b-2 border-indigo-600 font-medium"
            : "text-gray-600 hover:text-gray-800"
            }`}
          onClick={() => setTab("listed")}
        >
          ประกาศ
        </button>
        <button
          className={`pb-2 ${tab === "reviews"
            ? "border-b-2 border-indigo-600 font-medium"
            : "text-gray-600 hover:text-gray-800"
            }`}
          onClick={() => setTab("reviews")}
        >
          รีวิว
        </button>
        <button
          className={`pb-2 ${tab === "sold"
            ? "border-b-2 border-indigo-600 font-medium"
            : "text-gray-600 hover:text-gray-800"
            }`}
          onClick={() => setTab("sold")}
        >
          ขายแล้ว
        </button>
      </div>

      {/* Search (เฉพาะแท็บประกาศ) */}
      {tab === "listed" && (
        <div className="mt-3">
          <div className="relative w-full max-w-md">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="ค้นหา"
              className="w-full rounded-xl border px-3 py-2 pr-9 outline-none focus:ring-2 focus:ring-indigo-200"
            />
            <svg
              viewBox="0 0 24 24"
              className="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="m21 21-3.5-3.5" />
            </svg>
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-4 gap-8">
        {books.map(book => (
          <BookCard key={book.id} book={book} />
        ))}
      </div>

      {tab === "reviews" && (
        <EmptyState title="ยังไม่มีรีวิว" />
      )}

      {tab === "sold" && (
        <EmptyState title="ยังไม่มีสินค้าที่ขายแล้ว" />
      )}
    </section>
  );
}
