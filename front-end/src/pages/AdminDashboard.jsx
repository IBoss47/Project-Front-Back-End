import React, { useState } from 'react';
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
} from '@heroicons/react/24/outline';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');

  // Mock Data
  const [dashboardStats] = useState({
    totalUsers: 1250,
    totalSellers: 85,
    totalSummaries: 342,
    totalRevenue: 125680,
    monthlyRevenue: 34520,
    activeOrders: 43,
    pendingApprovals: 12,
    reportedIssues: 5
  });

  const [recentSummaries] = useState([
    {
      id: 1,
      title: 'Final HCI',
      seller: 'นายสมชาย ใจดี',
      sellerId: 'SELLER001',
      price: 89,
      status: 'approved',
      createdAt: '2567-11-15',
      sales: 12,
      views: 234
    },
    {
      id: 2,
      title: 'Midterm Data Structures',
      seller: 'นางสาวสมหญิง ฉลาด',
      sellerId: 'SELLER002',
      price: 120,
      status: 'pending',
      createdAt: '2567-11-16',
      sales: 0,
      views: 0
    },
    {
      id: 3,
      title: 'Database Systems',
      seller: 'ดร.สมหมาย ทดสอบ',
      sellerId: 'SELLER003',
      price: 150,
      status: 'approved',
      createdAt: '2567-11-14',
      sales: 28,
      views: 456
    }
  ]);

  const [sellers] = useState([
    {
      id: 'SELLER001',
      name: 'นายสมชาย ใจดี',
      email: 'somchai@example.com',
      totalSummaries: 15,
      totalSales: 156,
      revenue: 18920,
      rating: 4.8,
      joinDate: '2567-09-01',
      status: 'active'
    },
    {
      id: 'SELLER002',
      name: 'นางสาวสมหญิง ฉลาด',
      email: 'somying@example.com',
      totalSummaries: 8,
      totalSales: 42,
      revenue: 4560,
      rating: 4.5,
      joinDate: '2567-10-15',
      status: 'active'
    },
    {
      id: 'SELLER003',
      name: 'ดร.สมหมาย ทดสอบ',
      email: 'sommai@example.com',
      totalSummaries: 22,
      totalSales: 234,
      revenue: 45680,
      rating: 4.9,
      joinDate: '2567-08-20',
      status: 'active'
    }
  ]);

  const [pendingApprovals] = useState([
    {
      id: 1,
      type: 'summary',
      title: 'Advanced Database Design',
      seller: 'นายประสิทธิ์ สมบูรณ์',
      price: 199,
      submittedAt: '2567-11-16 14:30',
      reason: 'รอการตรวจสอบ'
    },
    {
      id: 2,
      type: 'seller',
      title: 'ขอเป็น Seller',
      seller: 'นางสาวนารี บางกอก',
      email: 'nare@example.com',
      submittedAt: '2567-11-16 10:15',
      reason: 'รอการตรวจสอบเอกสาร'
    }
  ]);

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
              className={`px-6 py-4 font-semibold transition-all duration-300 whitespace-nowrap ${
                activeTab === 'overview'
                  ? 'bg-blue-600 text-white border-b-2 border-blue-400'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              📊 ภาพรวม
            </button>
            <button
              onClick={() => setActiveTab('summaries')}
              className={`px-6 py-4 font-semibold transition-all duration-300 whitespace-nowrap ${
                activeTab === 'summaries'
                  ? 'bg-blue-600 text-white border-b-2 border-blue-400'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              📚 สรุปวิชา
            </button>
            <button
              onClick={() => setActiveTab('sellers')}
              className={`px-6 py-4 font-semibold transition-all duration-300 whitespace-nowrap ${
                activeTab === 'sellers'
                  ? 'bg-blue-600 text-white border-b-2 border-blue-400'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              👥 Seller
            </button>
            <button
              onClick={() => setActiveTab('approvals')}
              className={`px-6 py-4 font-semibold transition-all duration-300 whitespace-nowrap ${
                activeTab === 'approvals'
                  ? 'bg-blue-600 text-white border-b-2 border-blue-400'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              ✓ อนุมัติ ({dashboardStats.pendingApprovals})
            </button>
            <button
              onClick={() => setActiveTab('reports')}
              className={`px-6 py-4 font-semibold transition-all duration-300 whitespace-nowrap ${
                activeTab === 'reports'
                  ? 'bg-blue-600 text-white border-b-2 border-blue-400'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              ⚠️ รายงาน ({dashboardStats.reportedIssues})
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
                      {recentSummaries.slice(0, 3).map((item) => (
                        <div key={item.id} className="bg-gray-600 rounded-lg p-4 hover:bg-gray-500 transition-colors">
                          <div className="flex items-center justify-between mb-2">
                            <p className="font-bold text-white">{item.title}</p>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                              item.status === 'approved'
                                ? 'bg-green-500/30 text-green-300'
                                : 'bg-yellow-500/30 text-yellow-300'
                            }`}>
                              {item.status === 'approved' ? '✓ อนุมัติ' : '⏳ รอ'}
                            </span>
                          </div>
                          <div className="flex justify-between text-gray-300 text-sm">
                            <span>{item.seller}</span>
                            <span>฿{item.price} • {item.sales} sales</span>
                          </div>
                        </div>
                      ))}
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
                <h2 className="text-2xl font-bold text-white mb-6">📚 จัดการสรุปวิชา</h2>

                <div className="overflow-x-auto">
                  <table className="w-full text-gray-300">
                    <thead>
                      <tr className="border-b border-gray-600">
                        <th className="px-4 py-3 text-left font-bold text-white">ชื่อสรุป</th>
                        <th className="px-4 py-3 text-left font-bold text-white">Seller</th>
                        <th className="px-4 py-3 text-left font-bold text-white">ราคา</th>
                        <th className="px-4 py-3 text-left font-bold text-white">สถานะ</th>
                        <th className="px-4 py-3 text-left font-bold text-white">ยอดขาย</th>
                        <th className="px-4 py-3 text-left font-bold text-white">การดำเนินการ</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentSummaries.map((item) => (
                        <tr key={item.id} className="border-b border-gray-700 hover:bg-gray-700/50 transition-colors">
                          <td className="px-4 py-3">{item.title}</td>
                          <td className="px-4 py-3">{item.seller}</td>
                          <td className="px-4 py-3">฿{item.price}</td>
                          <td className="px-4 py-3">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                              item.status === 'approved'
                                ? 'bg-green-500/30 text-green-300'
                                : 'bg-yellow-500/30 text-yellow-300'
                            }`}>
                              {item.status === 'approved' ? '✓ อนุมัติ' : '⏳ รอ'}
                            </span>
                          </td>
                          <td className="px-4 py-3">{item.sales}</td>
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
              </div>
            )}

            {/* Sellers Tab */}
            {activeTab === 'sellers' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-white mb-6">👥 จัดการ Seller</h2>

                <div className="space-y-4">
                  {sellers.map((seller) => (
                    <div key={seller.id} className="bg-gray-700 rounded-xl p-6 border border-gray-600 hover:border-blue-500 transition-colors">
                      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
                        <div>
                          <p className="text-gray-400 text-sm mb-1">ชื่อ</p>
                          <p className="font-bold text-white">{seller.name}</p>
                        </div>
                        <div>
                          <p className="text-gray-400 text-sm mb-1">อีเมล</p>
                          <p className="text-gray-300">{seller.email}</p>
                        </div>
                        <div>
                          <p className="text-gray-400 text-sm mb-1">จำนวนสรุป</p>
                          <p className="font-bold text-white text-lg">{seller.totalSummaries}</p>
                        </div>
                        <div>
                          <p className="text-gray-400 text-sm mb-1">ยอดขาย/รายได้</p>
                          <p className="font-bold text-white">{seller.totalSales} / ฿{seller.revenue}</p>
                        </div>
                        <div>
                          <p className="text-gray-400 text-sm mb-1">คะแนน</p>
                          <p className="font-bold text-yellow-400">⭐ {seller.rating}</p>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <span className="px-4 py-2 bg-green-500/20 text-green-300 rounded-lg text-sm font-bold">
                          ✓ {seller.status === 'active' ? 'ใช้งาน' : 'ปิดใช้งาน'}
                        </span>
                        <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-bold transition-colors">
                          ดูรายละเอียด
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Approvals Tab */}
            {activeTab === 'approvals' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-white mb-6">✓ รอการอนุมัติ ({dashboardStats.pendingApprovals})</h2>

                <div className="space-y-4">
                  {pendingApprovals.map((item) => (
                    <div key={item.id} className="bg-gray-700 rounded-xl p-6 border border-yellow-600/50">
                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="text-xl font-bold text-white">{item.title}</h3>
                          <span className="px-3 py-1 bg-yellow-500/30 text-yellow-300 rounded-full text-sm font-bold">
                            ⏳ รอ
                          </span>
                        </div>
                        <p className="text-gray-400">
                          {item.type === 'summary' ? `สรุปวิชา - ราคา: ฿${item.price}` : `ขอเป็น Seller - ${item.email}`}
                        </p>
                        <p className="text-gray-500 text-sm mt-2">
                          จาก: {item.seller} | เมื่อ: {item.submittedAt}
                        </p>
                      </div>

                      <div className="flex gap-3">
                        <button className="flex-1 px-4 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg transition-colors">
                          ✓ อนุมัติ
                        </button>
                        <button className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-colors">
                          ✕ ปฏิเสธ
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Reports Tab */}
            {activeTab === 'reports' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-white mb-6">⚠️ รายงานปัญหา ({dashboardStats.reportedIssues})</h2>

                <div className="space-y-4">
                  {reportedIssues.map((issue) => (
                    <div key={issue.id} className={`rounded-xl p-6 border ${
                      issue.status === 'pending'
                        ? 'bg-red-900/30 border-red-600/50'
                        : 'bg-green-900/30 border-green-600/50'
                    }`}>
                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="text-xl font-bold text-white">{issue.title}</h3>
                          <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                            issue.status === 'pending'
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
