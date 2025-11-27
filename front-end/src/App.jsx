import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css'
import './index.css';
import SaleList from './components/SaleList';
import FilterSidebar from './components/FilterSidebar';
import Homepage from './pages/Homepage';
import React from 'react';
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
          <Route path="/cart" element={<Layout><Shopping_Cart /></Layout>} />
          <Route path="/SellListPage" element={<Layout><SellListPage /></Layout>} />
          <Route path= "/Help" element={<Layout><Help_page /></Layout>} />
          <Route path= "/sell" element={<Layout><SellItemPage /></Layout>} />
          {/* <Route path="/" element={<Homepage />} /> */}
         
          {/* หน้าเว็บที่ไม่ใช้ Navbar Footer */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/sell" element={<SellItemPage />} />

          <Route path="/profile" element={<Layout><UserProfilePage /></Layout>} />
          <Route path="/store" element={<Layout><UserStorePage /></Layout>} />
        </Routes>
        {/* <Footer /> */}
      </Router>
    </CartProvider>
  );
}

export default App;