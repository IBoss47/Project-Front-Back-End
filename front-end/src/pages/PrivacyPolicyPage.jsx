import React from "react";
import { 
    ShieldCheckIcon, 
    UserIcon, 
    CreditCardIcon, 
    DocumentTextIcon, 
    GlobeAltIcon,
    LockClosedIcon,
    KeyIcon,
    CogIcon,
    EnvelopeIcon
} from "@heroicons/react/24/outline";

const PrivacyPolicyPage = () => {
    return (
        <div className="privacy-policy-page w-full min-h-screen bg-gradient-to-b from-white to-gray-50">
            {/* Hero Section */}
            <div className="pt-28 pb-16 px-6 text-center bg-gradient-to-r from-blue-50 to-indigo-50">
                <div className="flex justify-center mb-4">
                    <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
                        <ShieldCheckIcon className="h-10 w-10 text-blue-600" />
                    </div>
                </div>
                <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
                    นโยบายความเป็นส่วนตัว
                </h1>
                <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                    4King Notes ให้ความสำคัญกับความเป็นส่วนตัวของผู้ใช้ทุกคน ไม่ว่าจะเป็นผู้ซื้อหรือผู้ขายสรุปเนื้อหาเรียน 
                    เรามุ่งมั่นที่จะปกป้องข้อมูลของคุณอย่างปลอดภัย โปร่งใส และใช้อย่างมีความรับผิดชอบ
                </p>
            </div>

            {/* Main Content */}
            <div className="max-w-4xl mx-auto px-6 py-12 space-y-10">
                
                {/* Section 1 */}
                <section className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <DocumentTextIcon className="h-6 w-6 text-green-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800">1. ข้อมูลที่เราเก็บรวบรวม</h2>
                    </div>
                    <p className="text-gray-600 mb-6">เราเก็บข้อมูลเฉพาะที่จำเป็นสำหรับการให้บริการเท่านั้น ได้แก่:</p>
                    
                    <div className="space-y-6">
                        {/* 1.1 */}
                        <div className="bg-gray-50 rounded-xl p-5">
                            <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                                <UserIcon className="h-5 w-5 text-blue-500" />
                                1.1 ข้อมูลบัญชีผู้ใช้
                            </h3>
                            <ul className="list-disc list-inside text-gray-600 space-y-1 ml-7">
                                <li>ชื่อ – นามสกุล</li>
                                <li>อีเมล</li>
                                <li>รหัสผ่าน (ถูกเข้ารหัส)</li>
                                <li>เบอร์โทร (ถ้ามี)</li>
                            </ul>
                        </div>

                        {/* 1.2 */}
                        <div className="bg-gray-50 rounded-xl p-5">
                            <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                                <CreditCardIcon className="h-5 w-5 text-purple-500" />
                                1.2 ข้อมูลการทำธุรกรรม
                            </h3>
                            <ul className="list-disc list-inside text-gray-600 space-y-1 ml-7">
                                <li>ประวัติการซื้อชีท</li>
                                <li>รายได้ของผู้ขาย</li>
                                <li>รายการถอนเงิน</li>
                                <li>ข้อมูลใบเสร็จและการชำระเงิน (ไม่มีการเก็บข้อมูลบัตรโดยตรง)</li>
                            </ul>
                        </div>

                        {/* 1.3 */}
                        <div className="bg-gray-50 rounded-xl p-5">
                            <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                                <DocumentTextIcon className="h-5 w-5 text-orange-500" />
                                1.3 ข้อมูลที่ผู้ใช้ส่งขึ้นระบบ
                            </h3>
                            <ul className="list-disc list-inside text-gray-600 space-y-1 ml-7">
                                <li>ไฟล์ชีท (PDF/รูปภาพ)</li>
                                <li>คำอธิบายสินค้า</li>
                                <li>รูปปกสินค้า</li>
                            </ul>
                        </div>

                        {/* 1.4 */}
                        <div className="bg-gray-50 rounded-xl p-5">
                            <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                                <GlobeAltIcon className="h-5 w-5 text-teal-500" />
                                1.4 ข้อมูลการใช้งานเว็บ
                            </h3>
                            <ul className="list-disc list-inside text-gray-600 space-y-1 ml-7">
                                <li>IP Address</li>
                                <li>ประเภทอุปกรณ์ / เบราว์เซอร์</li>
                                <li>พฤติกรรมการใช้ เช่น หน้าไหนถูกเปิดบ่อย</li>
                                <li>Cookies สำหรับปรับปรุงประสบการณ์ใช้งาน</li>
                            </ul>
                        </div>
                    </div>
                </section>

                {/* Section 2 */}
                <section className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <CogIcon className="h-6 w-6 text-blue-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800">2. วัตถุประสงค์การใช้ข้อมูล</h2>
                    </div>
                    <p className="text-gray-600 mb-4">เรานำข้อมูลของคุณไปใช้เพื่อ:</p>
                    <ul className="space-y-3">
                        {[
                            "เปิดใช้งานบัญชีและยืนยันตัวตน",
                            "ให้บริการซื้อ–ขายชีทบนแพลตฟอร์ม",
                            "สรุปยอดรายได้และทำการโอนเงิน",
                            "ปรับปรุงประสบการณ์การใช้งานเว็บไซต์",
                            "แจ้งเตือนหรือส่งข้อมูลสำคัญเกี่ยวกับบัญชี",
                            "ป้องกันการโกง การใช้ผิดวัตถุประสงค์ และเพิ่มความปลอดภัย"
                        ].map((item, index) => (
                            <li key={index} className="flex items-start gap-3">
                                <span className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <span className="text-blue-600 text-sm font-semibold">✓</span>
                                </span>
                                <span className="text-gray-600">{item}</span>
                            </li>
                        ))}
                    </ul>
                    <div className="mt-6 p-4 bg-red-50 rounded-xl border border-red-100">
                        <p className="text-red-700 font-semibold text-center">
                            🚫 เราไม่ขายข้อมูลส่วนตัวของคุณให้บุคคลภายนอกเด็ดขาด
                        </p>
                    </div>
                </section>

                {/* Section 3 */}
                <section className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <UserIcon className="h-6 w-6 text-purple-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800">3. การแบ่งปันข้อมูล</h2>
                    </div>
                    <p className="text-gray-600 mb-4">อาจมีการเปิดเผยข้อมูลให้เฉพาะกรณีดังนี้:</p>
                    <ul className="space-y-3 mb-4">
                        {[
                            "ผู้ให้บริการชำระเงิน (Payment Gateway)",
                            "ระบบตรวจสอบความปลอดภัย",
                            "หน่วยงานภาครัฐ (เฉพาะเมื่อมีเหตุจำเป็นหรือมีคำสั่งทางกฎหมาย)"
                        ].map((item, index) => (
                            <li key={index} className="flex items-start gap-3">
                                <span className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></span>
                                <span className="text-gray-600">{item}</span>
                            </li>
                        ))}
                    </ul>
                    <p className="text-gray-600 italic">
                        ทุกฝ่ายที่รับข้อมูลจะถูกควบคุมให้ปกป้องข้อมูลตามมาตรฐานสูงสุด
                    </p>
                </section>

                {/* Section 4 */}
                <section className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <LockClosedIcon className="h-6 w-6 text-orange-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800">4. การเก็บรักษาข้อมูล</h2>
                    </div>
                    <ul className="space-y-3">
                        {[
                            "ข้อมูลทั้งหมดถูกเก็บในระบบที่มีการป้องกันหลายชั้น",
                            "รหัสผ่านถูกเข้ารหัส และไม่มีใครสามารถดูได้",
                            "ไฟล์ชีทที่อัปโหลดจะถูกจัดเก็บอย่างปลอดภัย",
                            "ข้อมูลจะถูกเก็บไว้เฉพาะตามความจำเป็นของบริการ",
                            "เมื่อผู้ใช้ร้องขอให้ลบบัญชี เราจะลบข้อมูลที่สามารถลบได้ทันที"
                        ].map((item, index) => (
                            <li key={index} className="flex items-start gap-3">
                                <span className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <span className="text-orange-600 text-sm">🔒</span>
                                </span>
                                <span className="text-gray-600">{item}</span>
                            </li>
                        ))}
                    </ul>
                </section>

                {/* Section 5 */}
                <section className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <KeyIcon className="h-6 w-6 text-teal-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800">5. สิทธิ์ของผู้ใช้</h2>
                    </div>
                    <p className="text-gray-600 mb-4">ผู้ใช้มีสิทธิ์ดังนี้:</p>
                    <div className="grid sm:grid-cols-2 gap-4">
                        {[
                            "ขอเข้าถึงข้อมูลของตัวเอง",
                            "ขอแก้ไขข้อมูลส่วนตัว",
                            "ขอให้ลบข้อมูลหรือลบบัญชี",
                            "ปิดกั้นการใช้ Cookies บางประเภท",
                            "ถอนความยินยอมในการรับข่าวสาร"
                        ].map((item, index) => (
                            <div key={index} className="flex items-center gap-3 p-3 bg-teal-50 rounded-lg">
                                <span className="text-teal-600">✓</span>
                                <span className="text-gray-700">{item}</span>
                            </div>
                        ))}
                    </div>
                    <p className="text-gray-600 mt-4 text-center italic">
                        สามารถติดต่อทีมงานเพื่อใช้สิทธิ์เหล่านี้ได้ทุกเมื่อ
                    </p>
                </section>

                {/* Section 6 */}
                <section className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-2xl">🍪</span>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800">6. Cookies และเทคโนโลยีติดตาม</h2>
                    </div>
                    <p className="text-gray-600 mb-4">เราใช้ Cookies เพื่อ:</p>
                    <ul className="space-y-3 mb-4">
                        {[
                            "จำค่าการเข้าสู่ระบบ",
                            "ปรับปรุงความเร็วของเว็บไซต์",
                            "วิเคราะห์พฤติกรรมการใช้งานเพื่อพัฒนาเว็บไซต์"
                        ].map((item, index) => (
                            <li key={index} className="flex items-start gap-3">
                                <span className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></span>
                                <span className="text-gray-600">{item}</span>
                            </li>
                        ))}
                    </ul>
                    <p className="text-gray-500 text-sm bg-yellow-50 p-3 rounded-lg">
                        💡 ผู้ใช้สามารถตั้งค่าปิด Cookies ได้จากเบราว์เซอร์
                    </p>
                </section>

                {/* Section 7 */}
                <section className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-lg p-8 text-white">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                            <ShieldCheckIcon className="h-6 w-6 text-white" />
                        </div>
                        <h2 className="text-2xl font-bold">7. ความปลอดภัยของข้อมูล</h2>
                    </div>
                    <p className="mb-4 text-blue-100">เรามีมาตรการป้องกัน เช่น:</p>
                    <div className="grid sm:grid-cols-2 gap-4">
                        {[
                            { icon: "🔐", text: "SSL (HTTPS) ในทุกหน้า" },
                            { icon: "🔑", text: "การเข้ารหัสข้อมูลสำคัญ" },
                            { icon: "👁️", text: "ระบบตรวจจับพฤติกรรมผิดปกติ" },
                            { icon: "🛡️", text: "จำกัดการเข้าถึงข้อมูลเฉพาะทีมงานที่เกี่ยวข้อง" }
                        ].map((item, index) => (
                            <div key={index} className="flex items-center gap-3 p-3 bg-white/10 rounded-lg">
                                <span className="text-xl">{item.icon}</span>
                                <span>{item.text}</span>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Section 8 */}
                <section className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <CogIcon className="h-6 w-6 text-gray-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800">8. การปรับปรุงนโยบาย</h2>
                    </div>
                    <p className="text-gray-600">
                        นโยบายนี้อาจปรับเปลี่ยนตามความเหมาะสม และจะแจ้งให้ผู้ใช้ทราบเมื่อมีการอัปเดต
                    </p>
                </section>

                {/* Section 9 - Contact */}
                <section className="bg-gradient-to-r from-red-500 to-orange-500 rounded-2xl shadow-lg p-8 text-white text-center">
                    <div className="flex justify-center mb-4">
                        <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                            <EnvelopeIcon className="h-8 w-8 text-white" />
                        </div>
                    </div>
                    <h2 className="text-2xl font-bold mb-4">9. ช่องทางติดต่อ</h2>
                    <p className="mb-6 text-red-100">หากมีข้อสงสัยเกี่ยวกับนโยบายความเป็นส่วนตัว สามารถติดต่อได้ที่:</p>
                    <div className="space-y-3">
                        <div className="flex items-center justify-center gap-2">
                            <span>📧</span>
                            <span className="font-semibold">อีเมล: support@4kingnotes.com</span>
                        </div>
                        <div className="flex items-center justify-center gap-2">
                            <span>📘</span>
                            <span className="font-semibold">Facebook Page: 4King Notes</span>
                        </div>
                    </div>
                </section>

            </div>
        </div>
    );
};

export default PrivacyPolicyPage;
