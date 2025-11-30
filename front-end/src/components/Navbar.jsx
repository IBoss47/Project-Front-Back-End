import React from "react";
import {Link, useNavigate} from "react-router-dom";
import {useState, useEffect} from "react";
import './styles/Navbar.css'
import {
  ShoppingCartIcon,
  UserCircleIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/outline"
import { useCart } from '../context/CartContext';
import { authAPI } from '../api/auth';

const Navbar = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [username, setUsername] = useState("");
    const [isAdmin, setIsAdmin] = useState(false);
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [loginModalMessage, setLoginModalMessage] = useState("");
    const { getTotalItems } = useCart();
    const cartCount = getTotalItems();
    const navigate = useNavigate();

    // เช็ค login status เมื่อโหลดหน้า
    useEffect(() => {
        const token = localStorage.getItem('access_token');
        const user = localStorage.getItem('user');
        if (token && user) {
            setIsLoggedIn(true);
            const userData = JSON.parse(user);
            setUsername(userData.username);
            // ตรวจสอบว่าเป็น admin หรือไม่
            if (userData.roles && userData.roles.includes('admin')) {
                setIsAdmin(true);
            }
        }
    }, []);

    // ฟังก์ชัน logout
    const handleLogout = async () => {
        try {
            await authAPI.logout();  // เรียก API logout และลบ tokens
            setIsLoggedIn(false);
            setUsername("");
            setIsAdmin(false);
            setIsOpen(false);
            navigate('/');  // redirect ไปหน้า homepage
            
        } catch (error) {
            console.error('Logout error:', error);
            // ถ้า API fail ก็ยังลบ localStorage ได้
            localStorage.clear();
            navigate('/');  // redirect ไปหน้า homepage
        }
    };

    // ฟังก์ชันเช็คและไปหน้าตะกร้า
    const handleCartClick = (e) => {
        e.preventDefault();
        if (!isLoggedIn) {
            setLoginModalMessage("คุณต้องเข้าสู่ระบบก่อนเข้าใช้งานตะกร้าสินค้า");
            setShowLoginModal(true);
        } else {
            navigate('/cart');
        }
    };

    // ฟังก์ชันเช็คและไปหน้าลงขาย
    const handleSellClick = (e) => {
        e.preventDefault();
        if (!isLoggedIn) {
            setLoginModalMessage("คุณต้องเข้าสู่ระบบก่อนเพื่อลงขายสรุปวิชา");
            setShowLoginModal(true);
        } else {
            navigate('/sell');
        }
    };
    
    return (
        <nav className={`navbar ${isMenuOpen ? "active" : ""}` }>
            <div className="navbar-top">
                <Link to = '/Help' className="navbar-top-link">
                    <h7>HELP</h7>
                </Link>
                <h7>TH</h7>
                <h7>|</h7>
                <h7>EN</h7>
            </div>
            <div className ="navbar-main-container">

                <div className="navbar-left">
                    <Link to = '/' className="navbar-logo">
                        <img className="navbar-logo" src="./Images/LOGO.png" alt=""/>
                    </Link>
                </div>

                <div className="navbar-right">
                    <a href="/cart" onClick={handleCartClick} className="navbar-icon_cart relative">
                       <ShoppingCartIcon className="h-6 w-6 text-gray-800"/>
                       {cartCount > 0 && (
                         <span className="absolute -top-2 -right-2 bg-red-500 text-white 
                           rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                           {cartCount}
                         </span>
                       )}
                    </a>
                    <div className="navbar-user-dropdown">
                         {isLoggedIn ? (
                         <button className={`navbar-user-toggle ${isOpen ? "active" : ""}`} onClick={() => setIsOpen(!isOpen)}
                            >
                            <UserCircleIcon className="h-6 w-6 text-gray-800"/>
                                <span className="navbar-username">{username}</span>
                                    <ChevronDownIcon className={`h-5 w-5 navbar-arrow ${isOpen ? "open" : ""}`} />
                         </button>
                         ) : (
                         <Link to="/login" className="navbar-user-toggle flex items-center justify-center">
                            <UserCircleIcon className="h-6 w-6 text-gray-800"/>
                                <span className="navbar-username">Login</span>
                         </Link>
                         )}
                            {isOpen && isLoggedIn && (
                                <ul className="navbar-dropdown-menu">
                                   <li> 
                                    <Link to = '/profile' state={{ tab: 'ข้อมูลส่วนตัว' }} className="navbar-dropdown-item">
                                    บัญชีของฉัน
                                    </Link>
                                   </li>
                                   <li> 
                                    <Link to = '/profile' state={{ tab: 'ประวัติการซื้อ' }} className="navbar-dropdown-item">
                                    การซื้อของฉัน
                                    </Link>
                                   </li>
                                   <li> 
                                    <Link to = '/store' className="navbar-dropdown-item">
                                    ร้านของฉัน
                                    </Link>
                                   </li>
                                   <li> 
                                    <Link to = '/' className="navbar-dropdown-item">
                                    ข้อความเเจ้งเตือน
                                    </Link>
                                   </li>
                                   <li> 
                                    <button onClick={handleLogout} className="navbar-dropdown-item w-full text-left">
                                        <h2 className="text-center text-red-600 w-25 h-15">ออกจากระบบ</h2>                                  
                                    </button>
                                   </li>
                                </ul>
                            )}
                    </div>
                    <div className="navbar-sell">
                        <Link to = '/SellListPage' 
                         className="navbar-sell-button"
                        >ซื้อสินค้า
                        </Link>    
                    </div>
                    <div className="navbar-sell">
                        <a href="/sell" onClick={handleSellClick} className="navbar-sell-button">
                            ลงขายสินค้า
                        </a>
                    </div>
                    {isAdmin && (
                    <div className="navbar-sell">
                        <Link to = '/admin' 
                         className="navbar-sell-button"
                        >Dashboard
                        </Link>    
                    </div>
                    )}
                </div>
            </div>

            {/* Login Required Modal */}
            {showLoginModal && (
                <div 
                    className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fade-in"
                    onClick={() => setShowLoginModal(false)}
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
                                {loginModalMessage}
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
                                    onClick={() => setShowLoginModal(false)}
                                    className="w-full py-3 px-4 text-gray-600 font-medium rounded-lg 
                                        hover:bg-gray-100 transition-colors"
                                >
                                    ปิด
                                </button>
                            </div>
                        </div>
                    </div>

                    <style jsx>{`
                        @keyframes fade-in {
                            from {
                                opacity: 0;
                            }
                            to {
                                opacity: 1;
                            }
                        }
                        
                        @keyframes scale-in {
                            from {
                                opacity: 0;
                                transform: scale(0.9);
                            }
                            to {
                                opacity: 1;
                                transform: scale(1);
                            }
                        }
                        
                        .animate-fade-in {
                            animation: fade-in 0.5s ease-out;
                        }

                        .animate-scale-in {
                            animation: scale-in 0.3s ease-out;
                        }
                    `}</style>
                </div>
            )}
        </nav>
    );
};
export default Navbar;