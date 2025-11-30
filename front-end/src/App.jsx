import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import './App.css'
import './index.css';
import SaleList from './components/SaleList';
import FilterSidebar from './components/FilterSidebar';
import Homepage from './pages/Homepage';
import React, { useState, useEffect } from 'react';
import SellListPage from './pages/SellListPage';

import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Shopping_Cart from './pages/Shopping_Cart';
import AdminDashboard from './pages/AdminDashboard';
import { CartProvider } from './context/CartContext';
import Help_page from './pages/Help_page';
import SellItemPage from './pages/SellItemPage';
import UserStorePage from './pages/UserStorePage';
import UserProfilePage from './pages/UserProfilePage';
import PublicStorePage from './pages/PublicStorePage';
import AboutPage from './pages/AboutPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';

// Protected Route Wrapper Component
function ProtectedRouteWrapper({ children, pageName }) {
  const navigate = useNavigate();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const isAuthenticated = !!localStorage.getItem('access_token');

  useEffect(() => {
    if (!isAuthenticated) {
      setShowLoginModal(true);
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <>
        {showLoginModal && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fade-in"
            onClick={() => {
              setShowLoginModal(false);
              navigate('/');
            }}
          >
            <div 
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 animate-scale-in"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center">
                {/* Icon */}
                <div className="mb-6 flex justify-center">
                  <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
                    <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                </div>

                {/* Title */}
                <h2 className="text-2xl font-bold text-gray-800 mb-3">
                  กรุณาเข้าสู่ระบบ
                </h2>

                {/* Message */}
                <p className="text-gray-600 mb-8">
                  คุณต้องเข้าสู่ระบบก่อนเพื่อเข้าถึงหน้า{pageName}
                </p>

                {/* Buttons */}
                <div className="space-y-3">
                  <button
                    onClick={() => {
                      setShowLoginModal(false);
                      navigate('/login');
                    }}
                    className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-blue-700 
                      text-white font-semibold rounded-lg hover:shadow-lg transition-all duration-300
                      transform hover:scale-105"
                  >
                    เข้าสู่ระบบ
                  </button>

                  <button
                    onClick={() => {
                      setShowLoginModal(false);
                      navigate('/');
                    }}
                    className="w-full py-3 px-4 text-gray-600 font-medium rounded-lg 
                      hover:bg-gray-100 transition-colors"
                  >
                    กลับหน้าแรก
                  </button>
                </div>
              </div>
            </div>

            <style jsx>{`
              @keyframes fade-in {
                from { opacity: 0; }
                to { opacity: 1; }
              }
              @keyframes scale-in {
                from { transform: scale(0.9); opacity: 0; }
                to { transform: scale(1); opacity: 1; }
              }
              .animate-fade-in {
                animation: fade-in 0.2s ease-out;
              }
              .animate-scale-in {
                animation: scale-in 0.3s ease-out;
              }
            `}</style>
          </div>
        )}
      </>
    );
  }

  return children;
}

function App() {
  return (
    <CartProvider>
      <Router>
         {/* <Navbar /> */}
        <Routes>
          {/* หน้าเว็บที่ใช้ Navbar Footer */}
          <Route path="/" element={<Layout />}>
          <Route index element={<Homepage />} />
          </Route>
          
          {/* Protected Routes - ต้อง login */}
          <Route path="/cart" element={<ProtectedRouteWrapper pageName="ตะกร้าสินค้า"><Layout><Shopping_Cart /></Layout></ProtectedRouteWrapper>} />
          <Route path="/sell" element={<ProtectedRouteWrapper pageName="ขายสรุป"><Layout><SellItemPage /></Layout></ProtectedRouteWrapper>} />
          <Route path="/profile" element={<ProtectedRouteWrapper pageName="โปรไฟล์"><Layout><UserProfilePage /></Layout></ProtectedRouteWrapper>} />
          <Route path="/store" element={<ProtectedRouteWrapper pageName="ร้านค้าของฉัน"><Layout><UserStorePage /></Layout></ProtectedRouteWrapper>} />
          <Route path="/admin" element={<ProtectedRouteWrapper pageName="แอดมิน"><AdminDashboard /></ProtectedRouteWrapper>} />
          
          {/* Public Routes */}
          <Route path="/SellListPage" element={<Layout><SellListPage /></Layout>} />
          <Route path= "/Help" element={<Layout><Help_page /></Layout>} />
          <Route path= "/about" element={<Layout><AboutPage /></Layout>} />
          <Route path= "/privacy" element={<Layout><PrivacyPolicyPage /></Layout>} />
          <Route path="/store/:userId" element={<Layout><PublicStorePage /></Layout>} />
         
          {/* หน้าเว็บที่ไม่ใช้ Navbar Footer */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Routes>
        {/* <Footer /> */}
      </Router>
    </CartProvider>
  );
}

export default App;