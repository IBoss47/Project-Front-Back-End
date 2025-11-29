import React, { useState } from "react";
import { BookOpenIcon } from "@heroicons/react/24/outline";
const Help_page = () => {
    const [openIndex, setOpenIndex] = useState(null);
    
    const toggleQuestion = (index) => {
        setOpenIndex(openIndex === index ? null : index);
    };
    
    return (
        <div className="help-page w-full h-full py-20">
            <h1 className="text-4xl font-bold text-center mb-12">
                คำถามที่พบบ่อย</h1>
            <h3 className="text-2xl font-bold text-left ml-12 underline">
                สำหรับคนขายชีท</h3>
            < div className="ml-12 mt-4 max-w-5xl space-y-6">
                <div className="border-b border-gray-300 pb-4">
                    <button 
                        className="flex items-center hover:text-red-600 transition-colors"
                        onClick={() => toggleQuestion(0)}
                    >
                        <BookOpenIcon className="h-6 w-6 text-red-500 mr-3"/>
                        <h1>ลงขายกับ 4king ดีอย่างไร?</h1>
                    </button>
                    {openIndex === 0 && (
                        <div className="mt-4 ml-9 p-4 bg-gray-100 rounded-lg max-w-5xl">
                            <p className="text-gray-700">
                               4king ทำให้ขายชีทได้ง่าย คนเห็นเยอะ ระบบชำระเงินชัดเจน และช่วยเพิ่มโอกาสให้ลูกค้าซื้อได้มากขึ้น
                            </p>
                        </div>
                    )}
                </div>

                <div className="border-b border-gray-300 pb-4">
                    <button 
                        className="flex items-center hover:text-red-600 transition-colors"
                        onClick={() => toggleQuestion(1)}
                    >
                        <BookOpenIcon className="h-6 w-6 text-red-500 mr-3"/>
                        <h1>อยากลงขายชีทต้องทำอย่างไร?</h1>
                    </button>
                    {openIndex === 1 && (
                        <div className="mt-4 ml-9 p-4 bg-gray-100 rounded-lg max-w-5xl">
                            <p className="text-gray-700">
                                แค่สมัครบัญชี อัปโหลดไฟล์ ใส่ข้อมูลให้ครบ ก็สามารถเริ่มขายชีทของคุณได้ทันทีบน 4king
                            </p>
                        </div>
                    )}
                </div>

                <div className="border-b border-gray-300 pb-4">
                    <button 
                        className="flex items-center hover:text-red-600 transition-colors"
                        onClick={() => toggleQuestion(2)}
                    >
                        <BookOpenIcon className="h-6 w-6 text-red-500 mr-3"/>
                        <h1>การตั้งราคาชีทควรเป็นอย่างไร?</h1>
                    </button>
                    {openIndex === 2 && (
                        <div className="mt-4 ml-9 p-4 bg-gray-100 rounded-lg max-w-5xl">
                            <p className="text-gray-700">
                                ตั้งราคาให้เหมาะกับเนื้อหา ดูคู่แข่งประกอบ และกำหนดให้ลูกค้ารู้สึกคุ้มค่ากับสิ่งที่ได้รับ
                            </p>
                        </div>
                    )}
                </div>

                <div className="border-b border-gray-300 pb-4">
                    <button 
                        className="flex items-center hover:text-red-600 transition-colors"
                        onClick={() => toggleQuestion(3)}
                    >
                        <BookOpenIcon className="h-6 w-6 text-red-500 mr-3"/>
                        <h1>การตัดรอบรายได้เป็นอย่างไร?</h1>
                    </button>
                    {openIndex === 3 && (
                        <div className="mt-4 ml-9 p-4 bg-gray-100 rounded-lg max-w-5xl">
                            <p className="text-gray-700">
                                ระบบจะสรุปรายได้ให้ตามรอบที่กำหนด แจ้งยอดชัดเจน และสามารถถอนเงินเข้าบัญชีได้ง่าย
                            </p>
                        </div>
                    )}
                </div>

                <div className="border-b border-gray-300 pb-4">
                    <button 
                        className="flex items-center hover:text-red-600 transition-colors"
                        onClick={() => toggleQuestion(4)}
                    >
                        <BookOpenIcon className="h-6 w-6 text-red-500 mr-3"/>
                        <h1>ฉันจะโปรโมทชีทของฉันได้อย่างไร?</h1>
                    </button>
                    {openIndex === 4 && (
                        <div className="mt-4 ml-9 p-4 bg-gray-100 rounded-lg max-w-5xl">
                            <p className="text-gray-700">
                                สามารถแชร์ลิงก์ในโซเชียล ทำปกให้สวย หรือโปรโมทในกลุ่มเรียนเพื่อเพิ่มยอดขาย
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
export default Help_page;
