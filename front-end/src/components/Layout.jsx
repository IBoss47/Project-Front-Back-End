import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import './styles/Layout.css'

const Layout = ({ children }) => {
    return (
        <div className="layout-container">
            <Navbar />
            <main className="main-content">
                {children ? children : <Outlet />}
            </main>
            <Footer />
        </div>
    );
};
export default Layout;