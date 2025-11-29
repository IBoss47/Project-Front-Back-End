import React from "react";
import { BookOpenIcon, UserGroupIcon, AcademicCapIcon, LightBulbIcon, HeartIcon } from "@heroicons/react/24/outline";

const AboutPage = () => {
    return (
        <div className="about-page w-full min-h-screen bg-gradient-to-b from-white to-gray-50">
            {/* Hero Section */}
            <div className="pt-28 pb-16 px-6 text-center bg-gradient-to-r from-red-50 to-orange-50">
                <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
                    เกี่ยวกับเรา
                </h1>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                    พื้นที่รวมสรุปบทเรียนคุณภาพ เพื่อการเรียนรู้ที่ง่ายและรวดเร็วกว่าเดิม
                </p>
            </div>

            {/* Main Content */}
            <div className="max-w-4xl mx-auto px-6 py-12 space-y-12">
                
                {/* Section 1 */}
                <div className="flex flex-col md:flex-row items-start gap-6">
                    <div className="flex-shrink-0">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                            <BookOpenIcon className="h-8 w-8 text-red-500" />
                        </div>
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">ทำไมต้อง 4King Notes?</h2>
                        <p className="text-gray-600 leading-relaxed">
                            ในยุคที่การเรียนและข้อมูลต่าง ๆ เคลื่อนไหวรวดเร็ว การหาสรุปเนื้อหาที่เข้าใจง่ายและน่าเชื่อถือกลายเป็นสิ่งสำคัญสำหรับนักเรียน นักศึกษา และผู้ที่ต้องการพัฒนาตัวเอง <span className="font-semibold text-red-600">4King Notes</span> จึงถูกสร้างขึ้นเพื่อเป็นพื้นที่ที่รวม "สรุปบทเรียนคุณภาพ" ไว้ในที่เดียว ให้ทุกคนสามารถเข้าถึงความรู้ที่ชัดเจน กระชับ และผ่านการกลั่นกรองมาแล้วอย่างดี
                        </p>
                    </div>
                </div>

                {/* Section 2 */}
                <div className="flex flex-col md:flex-row items-start gap-6">
                    <div className="flex-shrink-0">
                        <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center">
                            <LightBulbIcon className="h-8 w-8 text-orange-500" />
                        </div>
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">พลังของสรุปที่ดี</h2>
                        <p className="text-gray-600 leading-relaxed">
                            เราเชื่อว่าการอ่านสรุปที่ดีสามารถเปลี่ยนผลการเรียน เปลี่ยนวิธีคิด และลดเวลาในการอ่านหนังสือได้อย่างมหาศาล 4King Notes จึงรวบรวมผู้จัดทำชีทที่มีความรู้ ความตั้งใจ และความสามารถในการอธิบายเนื้อหาให้ง่ายขึ้น พร้อมเปิดโอกาสให้ทุกคนสามารถส่งต่อความเข้าใจและประสบการณ์ของตัวเองให้ผู้อื่นได้เรียนรู้ต่อ
                        </p>
                    </div>
                </div>

                {/* Section 3 */}
                <div className="flex flex-col md:flex-row items-start gap-6">
                    <div className="flex-shrink-0">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                            <AcademicCapIcon className="h-8 w-8 text-green-500" />
                        </div>
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">คุณภาพที่มั่นใจได้</h2>
                        <p className="text-gray-600 leading-relaxed">
                            ไม่ว่าคุณจะกำลังเตรียมสอบกลางภาค ไฟนอล แก้เกรด หรือกำลังหาความรู้เสริม เรามุ่งมั่นที่จะให้คุณได้รับสรุปเนื้อหาที่ดีที่สุดในราคาที่เข้าถึงได้ ทุกชีทที่ถูกอัปโหลดผ่านการตรวจสอบด้านคุณภาพ ความอ่านง่าย และความถูกต้อง เพื่อให้ผู้เรียนมั่นใจว่าเนื้อหาที่ได้รับคือสิ่งที่ช่วยให้เข้าใจรวดเร็วและทบทวนได้ทันที
                        </p>
                    </div>
                </div>

                {/* Section 4 */}
                <div className="flex flex-col md:flex-row items-start gap-6">
                    <div className="flex-shrink-0">
                        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                            <UserGroupIcon className="h-8 w-8 text-blue-500" />
                        </div>
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">ชุมชนแห่งการเรียนรู้</h2>
                        <p className="text-gray-600 leading-relaxed">
                            นอกจากการเป็นตลาดสำหรับซื้อ–ขายสรุปแล้ว 4King Notes ยังเป็นชุมชนแห่งการเรียนรู้ ผู้ทำชีทสามารถสร้างรายได้จากความรู้ของตัวเอง ขณะที่ผู้เรียนก็สามารถค้นพบเนื้อหาที่ตอบโจทย์วิชาและระดับการเรียนของตัวเองได้อย่างรวดเร็ว เราเชื่อว่าความรู้ยิ่งแบ่งปันยิ่งเติบโต และเราตั้งใจเป็นสะพานเชื่อมให้เกิดการแลกเปลี่ยนความรู้ที่มีคุณภาพมากที่สุด
                        </p>
                    </div>
                </div>

                {/* Goals Section */}
                <div className="bg-gradient-to-r from-red-500 to-orange-500 rounded-2xl p-8 text-white">
                    <h2 className="text-2xl font-bold mb-6 text-center">เป้าหมายของเรา</h2>
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                            <p className="text-lg">สร้างพื้นที่ที่ทำให้การเรียนเป็นเรื่องง่ายขึ้นกว่าเดิม</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                            <p className="text-lg">ช่วยให้ผู้เรียน <span className="font-bold">"อ่านน้อยลง แต่เข้าใจมากขึ้น"</span></p>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                            <p className="text-lg">ช่วยให้ผู้ทำชีท <span className="font-bold">"สร้างคุณค่า พร้อมสร้างรายได้ไปพร้อมกัน"</span></p>
                        </div>
                    </div>
                </div>

                {/* Thank You Section */}
                <div className="text-center py-8">
                    <div className="w-20 h-20 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <HeartIcon className="h-10 w-10 text-pink-500" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">ขอบคุณที่ไว้วางใจ</h2>
                    <p className="text-gray-600 text-lg leading-relaxed max-w-2xl mx-auto">
                        ขอบคุณที่ให้เราเป็นส่วนหนึ่งในการเรียนรู้ของคุณ<br/>
                        และเราพร้อมจะเติบโตไปกับคุณในทุกบทเรียน
                    </p>
                    <div className="mt-8">
                        <span className="text-3xl font-bold text-red-500">4King Notes</span>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default AboutPage;
