import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css'
import './index.css';
import SaleList from './components/SaleList';
import FilterSidebar from './components/FilterSidebar';
import Homepage from './pages/Homepage';
import SellItem from './pages/SellItem';
import React from 'react';
import SellListPage from './pages/SellListPage';
import Layout from './components/Layout';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
function App() {
  return (
    <Router>
       {/* <Navbar /> */}
      <Routes>
        {/* หน้าเว็บที่ใช้ Navbar Footer */}
        <Route path="/" element={<Layout />}>
          <Route index element={<Homepage />} />
          {/* <Route path="/books" element={<SellListPage />} /> */}
          <Route path="/sellitem" element={<SellItem />} />
        </Route>
      
        {/* <Route path="/" element={<Homepage />} /> */}
       
        หน้าเว็บที่ไม่ใช้ Navbar Footer
        <Route path="/login" element={<SellItem />} />
      </Routes>
      {/* <Footer /> */}
    </Router>
    
  );
}

export default App;