import React, { useMemo, useState, useEffect } from "react";
import api from '../../api/auth';
import SaleList from '../SaleList';
import SearchBar from '../SearchBar';
import FilterSidebar from '../FilterSidebar';
import LoadingSpinner from '../LoadingSpinner';
import { ReviewList, ReviewStats } from './ReviewItem';
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

// --- คอมโพเนนต์หลัก StoreProductsPanel ---
export default function StoreProductsPanel({ userId }) {
  const [tab, setTab] = useState("listed"); // listed | reviews | sold
  const [q, setQ] = useState("");

  const [books, setBooks] = useState([]);
  const [notes, setNotes] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [reviewStats, setReviewStats] = useState(null);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [sortBy, setSortBy] = useState('newest');
  const [selectedSemester, setSelectedSemester] = useState('all');
  const [selectedYear, setSelectedYear] = useState('all');
  const [selectedCourseId, setSelectedCourseId] = useState('all');
  const [selectedCondition, setSelectedCondition] = useState('all');
  const [priceRange, setPriceRange] = useState({ min: 0, max: 1000 });
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState('grid'); // grid or list
  const [showFilters, setShowFilters] = useState(false);
  const booksPerPage = 12;

  useEffect(() => {
    // Load notes from API
    const fetchNotes = async () => {
      if (!userId) return;
      
      setLoading(true);
      try {
        const response = await api.get(`/users/${userId}/notes`);
        setNotes(response.data);
      } catch (error) {
        console.error("Error fetching notes:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotes();
  }, [userId]);

  // Load reviews when switching to reviews tab
  useEffect(() => {
    const fetchReviews = async () => {
      if (!userId || tab !== 'reviews') return;
      
      setLoadingReviews(true);
      try {
        const [reviewsRes, statsRes] = await Promise.all([
          api.get(`/sellers/${userId}/reviews`),
          api.get(`/sellers/${userId}/reviews/stats`)
        ]);
        setReviews(reviewsRes.data.reviews || []);
        setReviewStats(statsRes.data);
      } catch (error) {
        console.error("Error fetching reviews:", error);
        setReviews([]);
        setReviewStats(null);
      } finally {
        setLoadingReviews(false);
      }
    };

    fetchReviews();
  }, [userId, tab]);

  const indexOfLastBook = currentPage * booksPerPage;
  const indexOfFirstBook = indexOfLastBook - booksPerPage;
  const currentBooks = filteredBooks.slice(indexOfFirstBook, indexOfLastBook);
  const totalPages = Math.ceil(filteredBooks.length / booksPerPage);

  const listed = useMemo(() => notes, [notes]);

  const filtered = useMemo(() => {
    const kw = q.trim().toLowerCase();
    if (!kw) return listed;
    return listed.filter((n) =>
      [n.book_title, n.description, n.course?.name].join(" ").toLowerCase().includes(kw)
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
        {/* <button
          className={`pb-2 ${tab === "sold"
            ? "border-b-2 border-indigo-600 font-medium"
            : "text-gray-600 hover:text-gray-800"
            }`}
          onClick={() => setTab("sold")}
        >
          ขายแล้ว
        </button> */}
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

      {/* แสดงข้อมูล Notes */}
      {tab === "listed" && (
        loading ? (
          <div className="mt-4 text-center">
            <LoadingSpinner />
          </div>
        ) : filtered.length > 0 ? (
          <div className="mt-4 grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {filtered.map(note => (
              <SaleList key={note.id} book={note} />
            ))}
          </div>
        ) : (
          <EmptyState title="ยังไม่มีประกาศขายโน้ต" />
        )
      )}

      {tab === "reviews" && (
        loadingReviews ? (
          <div className="mt-4 text-center">
            <LoadingSpinner />
          </div>
        ) : (
          <div className="mt-4">
            {/* สถิติรีวิว */}
            <ReviewStats stats={reviewStats} />

            {/* รายการรีวิว */}
            <ReviewList 
              reviews={reviews} 
              loading={loadingReviews}
              showNoteName={true}
              emptyMessage="ยังไม่มีรีวิว"
            />
          </div>
        )
      )}

      {tab === "sold" && (
        <EmptyState title="ยังไม่มีสินค้าที่ขายแล้ว" />
      )}
    </section>
  );
}
