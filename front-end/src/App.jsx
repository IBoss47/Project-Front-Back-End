import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css'
import './index.css';
import SaleList from './components/SaleList';
import FilterSidebar from './components/FilterSidebar';
import Homepage from './pages/Homepage';
import React from 'react';
import SellListPage from './pages/SellListPage';
import Layout from './components/Layout';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Shopping_Cart from './pages/Shopping_Cart';
import AdminDashboard from './pages/AdminDashboard';
import { CartProvider } from './context/CartContext';

function App() {
  return (
    <CartProvider>
      <Router>
         {/* <Navbar /> */}
        <Routes>
          {/* หน้าเว็บที่ใช้ Navbar Footer */}
          <Route path="/" element={<Layout />}>
            <Route index element={<SellListPage />} />
          </Route>
          
          <Route path="/cart" element={<Layout><Shopping_Cart /></Layout>} />
        
          {/* <Route path="/" element={<Homepage />} /> */}
         
          {/* หน้าเว็บที่ไม่ใช้ Navbar Footer */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/admin" element={<AdminDashboard />} />
        </Routes>
        {/* <Footer /> */}
      </Router>
    </CartProvider>
  );
}

export default App;