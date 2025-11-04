import React from "react";
import './styles/Footer.css'
import {Link} from "react-router-dom";
const Footer = () => {
    return (
        <div className="footer-container">
            <div className="footer-left">
                <h3>เกี่ยวกับ ร้าน4KING</h3>
                <Link to = '/' className="footer-about">
                    <h4>เกี่ยวกับเรา</h4>
                </Link>

                <h3>ติดตามเรา</h3>
                <div className="footer-social-icons">

                <Link to = '/' className="footer-social-icon">
                       <img src="./Images/facebook.png" alt="Facebook" />                
                </Link>
                
                <Link to = '/' className="footer-social-icon">
                   <img src="./Images/instagram.png" alt="Instagram" />
                </Link>

                <Link to = '/' className="footer-social-icon">
                   <img src="./Images/twitter.png" alt="Twitter" />
                </Link>

                <Link to = '/' className="footer-social-icon">
                   <img src="./Images/line.png" alt="Line" />
                </Link>

                </div>
            </div>
            <div className="footer-mid">
                <h3>ศูนย์ช่วยเหลือ</h3>
                <Link to = '/' className="footer-help">
                    <h4>คำถามที่พบบ่อย</h4>
                </Link>
                <Link to = '/' className="footer-help">
                    <h4>นโยบายความเป็นส่วนตัว</h4>
                </Link>
                <Link to = '/' className="footer-help">
                    <h4>วิธีการสั่งซื้อ</h4>
                </Link>
            </div>
            <div className="footer-right">
               <h3>ติดต่อ</h3>
                <h4>Email: info@bookstore.com</h4>
            </div>
        </div>
    );
};

export default Footer;