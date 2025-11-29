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
                    <Link to = '/cart' className="navbar-icon_cart relative">
                       <ShoppingCartIcon className="h-6 w-6 text-gray-800"/>
                       {cartCount > 0 && (
                         <span className="absolute -top-2 -right-2 bg-red-500 text-white 
                           rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                           {cartCount}
                         </span>
                       )}
                    </Link>
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
                        {isLoggedIn ? (
                            <Link to = '/sell' 
                             className="navbar-sell-button"
                            >ลงขายสินค้า
                            </Link>
                        ) : (
                            <Link to = '/login' 
                             className="navbar-sell-button"
                            >ลงขายสินค้า
                            </Link>
                        )}    
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
        </nav>
    );
};
export default Navbar;