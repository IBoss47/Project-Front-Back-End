import React, { useState, useEffect } from 'react';
import api from '../api/auth';
import Slider from '../components/Slider';
import {
  ChartBarIcon,
  UserGroupIcon,
  ShoppingBagIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  PencilSquareIcon,
  TrashIcon,
  EyeIcon,
  PhotoIcon,
} from '@heroicons/react/24/outline';

const AdminDashboard = () => {
  // โหลด active tab จาก localStorage ถ้ามี, ไม่เช่นนั้นใช้ 'overview'
  const [activeTab, setActiveTab] = useState(() => {
    return localStorage.getItem('adminActiveTab') || 'overview';
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State for data from API
  const [dashboardStats, setDashboardStats] = useState({
    totalUsers: 0,
    totalSellers: 0,
    totalSummaries: 0,
    totalRevenue: 0,
    monthlyRevenue: 0,
    activeOrders: 0,
    pendingApprovals: 0,
    reportedIssues: 0
  });

  const [sellers, setSellers] = useState([]);
  const [users, setUsers] = useState([]);
  const [notes, setNotes] = useState([]);
  const [pendingNotes, setPendingNotes] = useState([]); // Notes ที่รออนุมัติจริง

  // Slider data
  const [sliderData, setSliderData] = useState([]);
  const [sliderLoading, setSliderLoading] = useState(false);

  // Fetch slider data
  const fetchSliderData = async () => {
    try {
      const response = await api.get('/slider');
      if (response.data.success) {
        const slides = response.data.data.map(slide => ({
          ...slide,
          image: `http://localhost:8080/${slide.image}`
        }));
        setSliderData(slides);
      }
    } catch (err) {
      console.error('Error fetching slider data:', err);
    }
  };

  // Add slider image
  const handleAddSliderImage = async (file, link) => {
    setSliderLoading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('link', link || '');
      
      const response = await api.post('/admin/slider', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      if (response.data.success) {
        alert('เพิ่มรูปภาพสำเร็จ!');
        fetchSliderData();
      }
    } catch (err) {
      console.error('Error adding slider image:', err);
      alert('เกิดข้อผิดพลาด: ' + (err.response?.data?.error || err.message));
    } finally {
      setSliderLoading(false);
    }
  };

  // Delete slider image
  const handleDeleteSliderImage = async (slideId) => {
    if (!window.confirm('คุณแน่ใจหรือไม่ที่จะลบรูปภาพนี้?')) return;
    
    setSliderLoading(true);
    try {
      const response = await api.delete(`/admin/slider/${slideId}`);
      if (response.data.success) {
        alert('ลบรูปภาพสำเร็จ!');
        fetchSliderData();
      }
    } catch (err) {
      console.error('Error deleting slider image:', err);
      alert('เกิดข้อผิดพลาด: ' + (err.response?.data?.error || err.message));
    } finally {
      setSliderLoading(false);
    }
  };

  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch dashboard stats
        const statsResponse = await api.get('/admin/stats');
        if (statsResponse.data.success) {
          const stats = statsResponse.data.data;
          setDashboardStats(prev => ({
            ...prev,
            totalUsers: stats.total_users || 0,
            totalSellers: stats.total_sellers || 0,
            totalSummaries: stats.total_summaries || 0,
            totalRevenue: stats.total_revenue || 0,
            monthlyRevenue: stats.monthly_revenue || 0,
            totalOrders: stats.total_orders || 0,
            pendingApprovals: stats.pending_approvals || 0,
            reportedIssues: stats.reported_issues || 0
          }));
        }

        // Fetch sellers
        const sellersResponse = await api.get('/admin/sellers');
        if (sellersResponse.data.success) {
          setSellers(sellersResponse.data.data || []);
        }

        // Fetch all users
        const usersResponse = await api.get('/admin/users');
        if (usersResponse.data.success) {
          setUsers(usersResponse.data.data || []);
        }

        // Fetch all notes
        const notesResponse = await api.get('/admin/notes');
        if (notesResponse.data.success) {
          setNotes(notesResponse.data.data || []);
        }

        // Fetch pending notes (รออนุมัติ)
        const pendingResponse = await api.get('/admin/notes/pending');
        if (pendingResponse.data.success) {
          setPendingNotes(pendingResponse.data.data || []);
        }

        // Fetch slider data
        await fetchSliderData();
      } catch (err) {
        console.error('Error fetching admin data:', err);
        setError(err.response?.data?.message || 'Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    
    // ลบ saved tab หลังโหลดเสร็จ (ถ้ามี)
    return () => {
      localStorage.removeItem('adminActiveTab');
    };
  }, []);

  // Handle add seller role
  const handleAddSellerRole = async (userId) => {
    try {
      const response = await api.post('/admin/seller/add', { user_id: userId });
      if (response.data.success) {
        alert('เพิ่ม role seller สำเร็จ!');
        // Refresh data
        window.location.reload();
      }
    } catch (err) {
      console.error('Error adding seller role:', err);
      alert('เกิดข้อผิดพลาด: ' + (err.response?.data?.message || err.message));
    }
  };

  // Handle approve note
  const handleApproveNote = async (noteId) => {
    try {
      const response = await api.post(`/admin/notes/${noteId}/approve`);
      if (response.data.success) {
        alert('อนุมัติสรุปสำเร็จ!');
        // บันทึก active tab ก่อน reload
        localStorage.setItem('adminActiveTab', activeTab);
        window.location.reload();
      }
    } catch (err) {
      console.error('Error approving note:', err);
      alert('เกิดข้อผิดพลาด: ' + (err.response?.data?.message || err.message));
    }
  };

  // Handle reject note
  const handleRejectNote = async (noteId) => {
    const reason = prompt('กรุณาระบุเหตุผลในการปฏิเสธ (ถ้ามี):');
    try {
      const response = await api.post(`/admin/notes/${noteId}/reject`, { reason });
      if (response.data.success) {
        alert('ปฏิเสธสรุปสำเร็จ!');
        // บันทึก active tab ก่อน reload
        localStorage.setItem('adminActiveTab', activeTab);
        window.location.reload();
      }
    } catch (err) {
      console.error('Error rejecting note:', err);
      alert('เกิดข้อผิดพลาด: ' + (err.response?.data?.message || err.message));
    }
  };



  // Handle view PDF for admin (open in new tab)
  const handleViewPDF = async (noteId) => {
    try {
      const response = await api.get(`/admin/notes/${noteId}/download`, {
        responseType: 'blob'
      });

      // สร้าง URL สำหรับ blob และเปิดใน tab ใหม่
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      window.open(url, '_blank');
      
      // ล้าง URL หลังจาก 1 นาที
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
      }, 60000);
    } catch (error) {
      console.error('View PDF error:', error);
      alert('ไม่สามารถเปิด PDF ได้ กรุณาลองใหม่อีกครั้ง');
    }
  };

  // Handle remove seller role
  const handleRemoveSellerRole = async (userId) => {
    if (!window.confirm('คุณแน่ใจหรือไม่ที่จะลบ role seller ออกจากผู้ใช้นี้?')) {
      return;
    }
    try {
      const response = await api.post('/admin/seller/remove', { user_id: userId });
      if (response.data.success) {
        alert('ลบ role seller สำเร็จ!');
        // Refresh data
        window.location.reload();
      }
    } catch (err) {
      console.error('Error removing seller role:', err);
      alert('เกิดข้อผิดพลาด: ' + (err.response?.data?.message || err.message));
    }
  };

  // Mock Data for issues (can be replaced with API later)
  const [reportedIssues] = useState([
    {
      id: 1,
      type: 'inappropriate_content',
      title: 'สรุปมีเนื้อหาไม่เหมาะสม',
      reported_by: 'ผู้ใช้ ID: USER123',
      summary: 'Final HCI',
      status: 'pending',
      createdAt: '2567-11-16'
    },
    {
      id: 2,
      type: 'spam',
      title: 'ขอย้ายสินค้า - Spam',
      reported_by: 'ผู้ใช้ ID: USER456',
      summary: 'Test Summary',
      status: 'resolved',
      createdAt: '2567-11-15'
    }
  ]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900 pt-24 pb-16 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-white text-xl">กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900 pt-24 pb-16 flex items-center justify-center">
        <div className="text-center bg-red-500/20 rounded-xl p-8 border border-red-500">
          <ExclamationTriangleIcon className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <p className="text-white text-xl mb-2">เกิดข้อผิดพลาด</p>
          <p className="text-gray-400">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            ลองใหม่
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900 pt-24 pb-16">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">🔧 Admin Dashboard</h1>
          <p className="text-gray-400">จัดการ Website และดูแลระบบ</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl shadow-lg p-6 text-white border border-blue-500">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-blue-100 text-sm font-semibold mb-1">จำนวนผู้ใช้</p>
                <p className="text-4xl font-bold">{dashboardStats.totalUsers}</p>
              </div>
              <UserGroupIcon className="w-14 h-14 opacity-30" />
            </div>
            <p className="text-blue-100 text-sm">↑ 12% จากเดือนที่แล้ว</p>
          </div>

          <div className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-2xl shadow-lg p-6 text-white border border-purple-500">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-purple-100 text-sm font-semibold mb-1">จำนวน Seller</p>
                <p className="text-4xl font-bold">{dashboardStats.totalSellers}</p>
              </div>
              <ShoppingBagIcon className="w-14 h-14 opacity-30" />
            </div>
            <p className="text-purple-100 text-sm">↑ 5% จากเดือนที่แล้ว</p>
          </div>

          <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-2xl shadow-lg p-6 text-white border border-green-500">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-green-100 text-sm font-semibold mb-1">จำนวนสรุปทั้งหมด</p>
                <p className="text-4xl font-bold">{dashboardStats.totalSummaries}</p>
              </div>
              <DocumentTextIcon className="w-14 h-14 opacity-30" />
            </div>
            <p className="text-green-100 text-sm">↑ 8% จากเดือนที่แล้ว</p>
          </div>

          <div className="bg-gradient-to-br from-yellow-600 to-yellow-700 rounded-2xl shadow-lg p-6 text-white border border-yellow-500">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-yellow-100 text-sm font-semibold mb-1">รายได้ทั้งหมด</p>
                <p className="text-3xl font-bold">฿{dashboardStats.totalRevenue}</p>
              </div>
              <CurrencyDollarIcon className="w-14 h-14 opacity-30" />
            </div>
            <p className="text-yellow-100 text-sm">เดือนนี้: ฿{dashboardStats.monthlyRevenue}</p>
          </div>
        </div>

        {/* Alert Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-2xl shadow-lg p-6 text-white border border-red-400">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-100 text-sm font-semibold mb-2">⚠️ ปัญหาที่รายงาน</p>
                <p className="text-3xl font-bold">{dashboardStats.reportedIssues}</p>
              </div>
              <ExclamationTriangleIcon className="w-12 h-12 opacity-40" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl shadow-lg p-6 text-white border border-orange-400">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm font-semibold mb-2">⏳ รอการอนุมัติ</p>
                <p className="text-3xl font-bold">{dashboardStats.pendingApprovals}</p>
              </div>
              <CheckCircleIcon className="w-12 h-12 opacity-40" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-2xl shadow-lg p-6 text-white border border-cyan-400">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-cyan-100 text-sm font-semibold mb-2">📦 คำสั่งซื้อที่ใช้งานอยู่</p>
                <p className="text-3xl font-bold">{dashboardStats.activeOrders}</p>
              </div>
              <ShoppingBagIcon className="w-12 h-12 opacity-40" />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-gray-800 rounded-2xl shadow-lg overflow-hidden mb-8 border border-gray-700">
          <div className="flex border-b border-gray-700 overflow-x-auto">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-6 py-4 font-semibold transition-all duration-300 whitespace-nowrap ${activeTab === 'overview'
                ? 'bg-blue-600 text-white border-b-2 border-blue-400'
                : 'text-gray-400 hover:text-gray-200'
                }`}
            >
              📊 ภาพรวม
            </button>
            <button
              onClick={() => setActiveTab('summaries')}
              className={`px-6 py-4 font-semibold transition-all duration-300 whitespace-nowrap ${activeTab === 'summaries'
                ? 'bg-blue-600 text-white border-b-2 border-blue-400'
                : 'text-gray-400 hover:text-gray-200'
                }`}
            >
              📚 สรุปวิชา
            </button>
            <button
              onClick={() => setActiveTab('sellers')}
              className={`px-6 py-4 font-semibold transition-all duration-300 whitespace-nowrap ${activeTab === 'sellers'
                ? 'bg-blue-600 text-white border-b-2 border-blue-400'
                : 'text-gray-400 hover:text-gray-200'
                }`}
            >
              👥 Seller ({dashboardStats.totalSellers})
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`px-6 py-4 font-semibold transition-all duration-300 whitespace-nowrap ${activeTab === 'users'
                ? 'bg-blue-600 text-white border-b-2 border-blue-400'
                : 'text-gray-400 hover:text-gray-200'
                }`}
            >
              👤 ผู้ใช้ ({dashboardStats.totalUsers})
            </button>
            <button
              onClick={() => setActiveTab('approvals')}
              className={`px-6 py-4 font-semibold transition-all duration-300 whitespace-nowrap ${activeTab === 'approvals'
                ? 'bg-blue-600 text-white border-b-2 border-blue-400'
                : 'text-gray-400 hover:text-gray-200'
                }`}
            >
              ✓ อนุมัติ ({dashboardStats.pendingApprovals})
            </button>
            <button
              onClick={() => setActiveTab('reports')}
              className={`px-6 py-4 font-semibold transition-all duration-300 whitespace-nowrap ${activeTab === 'reports'
                ? 'bg-blue-600 text-white border-b-2 border-blue-400'
                : 'text-gray-400 hover:text-gray-200'
                }`}
            >
              ⚠️ รายงาน ({dashboardStats.reportedIssues})
            </button>
            <button
              onClick={() => setActiveTab('slider')}
              className={`px-6 py-4 font-semibold transition-all duration-300 whitespace-nowrap ${activeTab === 'slider'
                ? 'bg-blue-600 text-white border-b-2 border-blue-400'
                : 'text-gray-400 hover:text-gray-200'
                }`}
            >
              🖼️ Slider
            </button>
          </div>

          {/* Tab Content */}
          <div className="p-8">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-8">
                <h2 className="text-2xl font-bold text-white">📊 ภาพรวมระบบ</h2>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Recent Summaries */}
                  <div className="bg-gray-700 rounded-xl p-6 border border-gray-600">
                    <h3 className="text-xl font-bold text-white mb-4">📚 สรุปล่าสุด</h3>
                    <div className="space-y-3">
                      {notes.length === 0 ? (
                        <p className="text-gray-400 text-center py-4">ยังไม่มีสรุปในระบบ</p>
                      ) : (
                        notes.slice(0, 3).map((item) => (
                          <div key={item.id} className="bg-gray-600 rounded-lg p-4 hover:bg-gray-500 transition-colors">
                            <div className="flex items-center justify-between mb-2">
                              <p className="font-bold text-white">{item.title}</p>
                              <span className={`px-3 py-1 rounded-full text-xs font-bold ${item.status === 'available'
                                ? 'bg-green-500/30 text-green-300'
                                : 'bg-yellow-500/30 text-yellow-300'
                                }`}>
                                {item.status === 'available' ? '✓ พร้อมขาย' : item.status}
                              </span>
                            </div>
                            <div className="flex justify-between text-gray-300 text-sm">
                              <span>{item.seller_name}</span>
                              <span>฿{item.price} • {item.exam_term}</span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="bg-gray-700 rounded-xl p-6 border border-gray-600">
                    <h3 className="text-xl font-bold text-white mb-4">⚡ การดำเนินการด่วน</h3>
                    <div className="space-y-3">
                      <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-colors">
                        📊 ดูรายงานการขาย
                      </button>
                      <button className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-lg transition-colors">
                        👥 จัดการผู้ใช้
                      </button>
                      <button className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg transition-colors">
                        💰 ดูการเงิน
                      </button>
                      <button className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-lg transition-colors">
                        ⚠️ ดูรายงานปัญหา
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Summaries Tab */}
            {activeTab === 'summaries' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-white mb-6">📚 จัดการสรุปวิชา ({notes.length})</h2>

                {notes.length === 0 ? (
                  <div className="bg-gray-700 rounded-xl p-8 text-center border border-gray-600">
                    <DocumentTextIcon className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                    <p className="text-gray-400 text-lg">ยังไม่มีสรุปในระบบ</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-gray-300">
                      <thead>
                        <tr className="border-b border-gray-600">
                          <th className="px-4 py-3 text-left font-bold text-white">ID</th>
                          <th className="px-4 py-3 text-left font-bold text-white">ชื่อสรุป</th>
                          <th className="px-4 py-3 text-left font-bold text-white">Seller</th>
                          <th className="px-4 py-3 text-left font-bold text-white">ราคา</th>
                          <th className="px-4 py-3 text-left font-bold text-white">สถานะ</th>
                          <th className="px-4 py-3 text-left font-bold text-white">วันที่สร้าง</th>
                          <th className="px-4 py-3 text-left font-bold text-white">การดำเนินการ</th>
                        </tr>
                      </thead>
                      <tbody>
                        {notes.map((item) => (
                          <tr key={item.id} className="border-b border-gray-700 hover:bg-gray-700/50 transition-colors">
                            <td className="px-4 py-3">#{item.id}</td>
                            <td className="px-4 py-3">
                              <div>
                                <p className="font-semibold">{item.title}</p>
                                <p className="text-xs text-gray-500">{item.exam_term} • {item.course_name}</p>
                              </div>
                            </td>
                            <td className="px-4 py-3">{item.seller_name}</td>
                            <td className="px-4 py-3">฿{item.price}</td>
                            <td className="px-4 py-3">
                              <span className={`px-3 py-1 rounded-full text-xs font-bold ${item.status === 'available'
                                ? 'bg-green-500/30 text-green-300'
                                : item.status === 'sold'
                                  ? 'bg-blue-500/30 text-blue-300'
                                  : 'bg-yellow-500/30 text-yellow-300'
                                }`}>
                                {item.status === 'available' ? '✓ พร้อมขาย' : item.status === 'sold' ? '✓ ขายแล้ว' : item.status}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm">{item.created_at}</td>
                            <td className="px-4 py-3 flex gap-2">
                              <button className="p-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors" title="ดู">
                                <EyeIcon className="w-5 h-5 text-white" />
                              </button>
                              <button className="p-2 bg-yellow-600 hover:bg-yellow-700 rounded-lg transition-colors" title="แก้ไข">
                                <PencilSquareIcon className="w-5 h-5 text-white" />
                              </button>
                              <button className="p-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors" title="ลบ">
                                <TrashIcon className="w-5 h-5 text-white" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* Sellers Tab */}
            {activeTab === 'sellers' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-white mb-6">👥 จัดการ Seller ({sellers.length})</h2>

                {sellers.length === 0 ? (
                  <div className="bg-gray-700 rounded-xl p-8 text-center border border-gray-600">
                    <UserGroupIcon className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                    <p className="text-gray-400 text-lg">ยังไม่มี Seller ในระบบ</p>
                    <p className="text-gray-500 text-sm mt-2">เพิ่ม role seller ให้กับผู้ใช้ในแท็บ "ผู้ใช้ทั้งหมด"</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {sellers.map((seller) => (
                      <div key={seller.id} className="bg-gray-700 rounded-xl p-6 border border-gray-600 hover:border-blue-500 transition-colors">
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
                          <div>
                            <p className="text-gray-400 text-sm mb-1">ชื่อผู้ใช้</p>
                            <p className="font-bold text-white">{seller.fullname || seller.username}</p>
                            <p className="text-gray-500 text-xs">@{seller.username}</p>
                          </div>
                          <div>
                            <p className="text-gray-400 text-sm mb-1">อีเมล</p>
                            <p className="text-gray-300">{seller.email}</p>
                          </div>
                          <div>
                            <p className="text-gray-400 text-sm mb-1">จำนวนสรุป</p>
                            <p className="font-bold text-white text-lg">{seller.total_summaries || 0}</p>
                          </div>
                          <div>
                            <p className="text-gray-400 text-sm mb-1">ยอดขาย/รายได้</p>
                            <p className="font-bold text-white">{seller.total_sales || 0} / ฿{seller.revenue || 0}</p>
                          </div>
                          <div>
                            <p className="text-gray-400 text-sm mb-1">เข้าร่วมเมื่อ</p>
                            <p className="text-gray-300">{seller.join_date}</p>
                          </div>
                        </div>
                        <div className="flex gap-3">
                          <span className="px-4 py-2 bg-green-500/20 text-green-300 rounded-lg text-sm font-bold">
                            ✓ {seller.status === 'active' ? 'ใช้งาน' : 'ปิดใช้งาน'}
                          </span>
                          <button
                            onClick={() => handleRemoveSellerRole(seller.id)}
                            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-bold transition-colors"
                          >
                            ลบ role seller
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Users Tab */}
            {activeTab === 'users' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-white mb-6">👤 ผู้ใช้ทั้งหมด ({users.length})</h2>

                {users.length === 0 ? (
                  <div className="bg-gray-700 rounded-xl p-8 text-center border border-gray-600">
                    <UserGroupIcon className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                    <p className="text-gray-400 text-lg">ยังไม่มีผู้ใช้ในระบบ</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-gray-300">
                      <thead>
                        <tr className="border-b border-gray-600">
                          <th className="px-4 py-3 text-left font-bold text-white">ID</th>
                          <th className="px-4 py-3 text-left font-bold text-white">Username</th>
                          <th className="px-4 py-3 text-left font-bold text-white">ชื่อ-นามสกุล</th>
                          <th className="px-4 py-3 text-left font-bold text-white">อีเมล</th>
                          <th className="px-4 py-3 text-left font-bold text-white">Roles</th>
                          <th className="px-4 py-3 text-left font-bold text-white">เข้าร่วม</th>
                          <th className="px-4 py-3 text-left font-bold text-white">การดำเนินการ</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.map((user) => (
                          <tr key={user.id} className="border-b border-gray-700 hover:bg-gray-700/50 transition-colors">
                            <td className="px-4 py-3">#{user.id}</td>
                            <td className="px-4 py-3 font-semibold">{user.username}</td>
                            <td className="px-4 py-3">{user.fullname || '-'}</td>
                            <td className="px-4 py-3">{user.email}</td>
                            <td className="px-4 py-3">
                              <div className="flex gap-1 flex-wrap">
                                {user.roles?.map((role, idx) => (
                                  <span
                                    key={idx}
                                    className={`px-2 py-1 rounded-full text-xs font-bold ${role === 'admin'
                                      ? 'bg-red-500/30 text-red-300'
                                      : role === 'seller'
                                        ? 'bg-purple-500/30 text-purple-300'
                                        : 'bg-blue-500/30 text-blue-300'
                                      }`}
                                  >
                                    {role}
                                  </span>
                                ))}
                              </div>
                            </td>
                            <td className="px-4 py-3 text-sm">{user.join_date}</td>
                            <td className="px-4 py-3">
                              <div className="flex gap-2">
                                {!user.roles?.includes('seller') && (
                                  <button
                                    onClick={() => handleAddSellerRole(user.id)}
                                    className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-bold transition-colors"
                                  >
                                    + Seller
                                  </button>
                                )}
                                {user.roles?.includes('seller') && (
                                  <button
                                    onClick={() => handleRemoveSellerRole(user.id)}
                                    className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold transition-colors"
                                  >
                                    - Seller
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* Approvals Tab */}
            {activeTab === 'approvals' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-white mb-6">✓ รอการอนุมัติ ({pendingNotes.length})</h2>

                {pendingNotes.length === 0 ? (
                  <div className="bg-gray-700 rounded-xl p-8 text-center border border-gray-600">
                    <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto mb-4" />
                    <p className="text-gray-400 text-lg">ไม่มีรายการรออนุมัติ</p>
                    <p className="text-gray-500 text-sm mt-2">สรุปทั้งหมดได้รับการอนุมัติแล้ว</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {pendingNotes.map((item) => (
                      <div key={item.id} className="bg-gray-700 rounded-xl p-6 border border-yellow-600/50">
                        <div className="mb-4">
                          <div className="flex items-center justify-between mb-3">
                            <h3 className="text-xl font-bold text-white">{item.title}</h3>
                            <span className="px-3 py-1 bg-yellow-500/30 text-yellow-300 rounded-full text-sm font-bold">
                              ⏳ รอ
                            </span>
                          </div>
                          <p className="text-gray-400">
                            สรุปวิชา - ราคา: ฿{item.price}
                          </p>
                          <p className="text-gray-500 text-sm mt-2">
                            จาก: {item.seller_name} | เมื่อ: {item.created_at}
                          </p>
                          {item.exam_term && (
                            <p className="text-gray-500 text-sm">
                              เทอม: {item.exam_term} {item.course_name && `| วิชา: ${item.course_name}`}
                            </p>
                          )}
                          {item.description && (
                            <p className="text-gray-400 text-sm mt-2 bg-gray-600 p-3 rounded-lg">
                              📝 {item.description}
                            </p>
                          )}
                        </div>

                        <div className="flex gap-3">
                          <button
                            onClick={() => handleViewPDF(item.id)}
                            className="flex-1 px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg transition-colors"
                          >
                            👁️ ดู PDF
                          </button>
                          <button
                            onClick={() => handleApproveNote(item.id)}
                            className="flex-1 px-4 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg transition-colors"
                          >
                            ✓ อนุมัติ
                          </button>
                          <button
                            onClick={() => handleRejectNote(item.id)}
                            className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-colors"
                          >
                            ✕ ปฏิเสธ
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}          {/* Reports Tab */}
            {activeTab === 'reports' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-white mb-6">⚠️ รายงานปัญหา ({dashboardStats.reportedIssues})</h2>

                <div className="space-y-4">
                  {reportedIssues.map((issue) => (
                    <div key={issue.id} className={`rounded-xl p-6 border ${issue.status === 'pending'
                      ? 'bg-red-900/30 border-red-600/50'
                      : 'bg-green-900/30 border-green-600/50'
                      }`}>
                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="text-xl font-bold text-white">{issue.title}</h3>
                          <span className={`px-3 py-1 rounded-full text-sm font-bold ${issue.status === 'pending'
                            ? 'bg-red-500/30 text-red-300'
                            : 'bg-green-500/30 text-green-300'
                            }`}>
                            {issue.status === 'pending' ? '⚠️ รอดำเนินการ' : '✓ แก้ไขแล้ว'}
                          </span>
                        </div>
                        <p className="text-gray-400">
                          สรุป: {issue.summary}
                        </p>
                        <p className="text-gray-500 text-sm mt-2">
                          รายงานโดย: {issue.reported_by} | เมื่อ: {issue.createdAt}
                        </p>
                      </div>

                      {issue.status === 'pending' && (
                        <div className="flex gap-3">
                          <button className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-colors">
                            🗑️ ลบสรุป
                          </button>
                          <button className="flex-1 px-4 py-3 bg-yellow-600 hover:bg-yellow-700 text-white font-bold rounded-lg transition-colors">
                            📧 ติดต่อ Seller
                          </button>
                          <button className="flex-1 px-4 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg transition-colors">
                            ✓ แก้ไขแล้ว
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Slider Tab */}
            {activeTab === 'slider' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-white mb-6">🖼️ จัดการ Slider หน้าแรก ({sliderData.length} รูป)</h2>
                
                {sliderLoading && (
                  <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
                    <p className="text-gray-400 mt-2">กำลังดำเนินการ...</p>
                  </div>
                )}

                {sliderData.length > 0 ? (
                  <div className="bg-gray-700 rounded-xl p-6 border border-gray-600">
                    <h3 className="text-lg font-bold text-white mb-4">ตัวอย่าง Slider</h3>
                    <div className="rounded-xl overflow-hidden">
                      <Slider 
                        slides={sliderData} 
                        editable={false}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-700 rounded-xl p-8 text-center border border-gray-600">
                    <PhotoIcon className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                    <p className="text-gray-400">ยังไม่มีรูปภาพใน Slider</p>
                  </div>
                )}

                {/* Add Image Form */}
                <div className="bg-gray-700 rounded-xl p-6 border border-gray-600">
                  <h3 className="text-lg font-bold text-white mb-4">➕ เพิ่มรูปภาพใหม่</h3>
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    const formData = new FormData(e.target);
                    const file = formData.get('image');
                    const link = formData.get('link');
                    if (file && file.size > 0) {
                      handleAddSliderImage(file, link);
                      e.target.reset();
                      // Clear preview
                      const previewEl = document.getElementById('slider-preview');
                      if (previewEl) previewEl.src = '';
                      const previewContainer = document.getElementById('slider-preview-container');
                      if (previewContainer) previewContainer.classList.add('hidden');
                    } else {
                      alert('กรุณาเลือกรูปภาพ');
                    }
                  }} className="space-y-4">
                    <div>
                      <label className="block text-gray-300 text-sm mb-2">รูปภาพ *</label>
                      <input 
                        type="file" 
                        name="image"
                        accept="image/*"
                        className="w-full px-4 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          const previewEl = document.getElementById('slider-preview');
                          const previewContainer = document.getElementById('slider-preview-container');
                          if (file && previewEl && previewContainer) {
                            const reader = new FileReader();
                            reader.onload = (e) => {
                              previewEl.src = e.target.result;
                              previewContainer.classList.remove('hidden');
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                      {/* Preview รูปภาพที่เลือก */}
                      <div id="slider-preview-container" className="hidden mt-3">
                        <p className="text-gray-400 text-xs mb-2">ตัวอย่างรูปภาพ:</p>
                        <div className="relative inline-block">
                          <img 
                            id="slider-preview"
                            src="" 
                            alt="Preview" 
                            className="w-40 h-24 object-cover rounded-lg border-2 border-green-500"
                          />
                          <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">ใหม่</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="block text-gray-300 text-sm mb-2">ลิงก์ (ไม่บังคับ)</label>
                      <input 
                        type="text" 
                        name="link"
                        placeholder="เช่น /SellListPage"
                        className="w-full px-4 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white placeholder-gray-400"
                      />
                    </div>
                    <button 
                      type="submit"
                      disabled={sliderLoading}
                      className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg transition-colors disabled:opacity-50"
                    >
                      ➕ เพิ่มรูปภาพ
                    </button>
                  </form>
                </div>

                <div className="bg-gray-700 rounded-xl p-6 border border-gray-600">
                  <h3 className="text-lg font-bold text-white mb-4">📋 รายการรูปภาพใน Slider</h3>
                  <div className="space-y-3">
                    {sliderData.length === 0 ? (
                      <p className="text-gray-400 text-center py-4">ยังไม่มีรูปภาพ</p>
                    ) : (
                      sliderData.map((slide, index) => (
                        <div key={slide.id || index} className="flex items-center gap-4 bg-gray-600 rounded-lg p-4">
                          <div className="w-24 h-16 rounded-lg overflow-hidden bg-gray-500">
                            <img 
                              src={slide.image} 
                              alt={`Slide ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-white">รูปที่ {index + 1} {index === 0 && <span className="text-blue-400">(หน้าปก)</span>}</p>
                            <p className="text-gray-400 text-sm truncate">{slide.image}</p>
                            {slide.link && <p className="text-blue-400 text-sm">ลิงก์: {slide.link}</p>}
                          </div>
                          <button
                            onClick={() => handleDeleteSliderImage(slide.id)}
                            disabled={sliderLoading || sliderData.length <= 1}
                            className="p-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            title={sliderData.length <= 1 ? "ต้องมีอย่างน้อย 1 รูป" : "ลบรูปภาพ"}
                          >
                            <TrashIcon className="w-5 h-5 text-white" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="bg-yellow-900/30 border border-yellow-600/50 rounded-xl p-4">
                  <p className="text-yellow-300 text-sm">
                    💡 <strong>คำแนะนำ:</strong> รูปภาพจะถูกเก็บที่ back-end/uploads/slider/ และแสดงบนหน้าแรกอัตโนมัติ
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
