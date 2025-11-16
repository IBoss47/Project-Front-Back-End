import React, { useState } from "react";
import { BookOpenIcon } from "@heroicons/react/24/outline";
const Help_page = () => {
    const [isOpen, setIsOpen] = useState(false);
    
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
                        onClick={() => setIsOpen(!isOpen)}
                    >
                        <BookOpenIcon className="h-6 w-6 text-red-500 mr-3"/>
                        <h1>ลงขายกับ 4king ดีอย่างไร?</h1>
                    </button>
                    {isOpen && (
                        <div className="mt-4 ml-9 p-4 bg-gray-100 rounded-lg max-w-5xl">
                            <p className="text-gray-700">
                                4king เป็นแพลตฟอร์มที่ให้คุณสามารถลงขายชีทได้อย่างง่ายดาย 
                                มีระบบจัดการที่สะดวก ปลอดภัย และมีผู้ใช้งานจำนวนมาก 
                                ช่วยให้คุณเข้าถึงลูกค้าได้มากขึ้น
                            </p>
                        </div>
                    )}
                </div>

                <div className="border-b border-gray-300 pb-4">
                    <button 
                        className="flex items-center hover:text-red-600 transition-colors"
                        onClick={() => setIsOpen(!isOpen)}
                    >
                        <BookOpenIcon className="h-6 w-6 text-red-500 mr-3"/>
                        <h1>อยากลงขายชีทต้องทำอย่างไร?</h1>
                    </button>
                    {isOpen && (
                        <div className="mt-4 ml-9 p-4 bg-gray-100 rounded-lg max-w-5xl">
                            <p className="text-gray-700">
                                4king เป็นแพลตฟอร์มที่ให้คุณสามารถลงขายชีทได้อย่างง่ายดาย 
                                มีระบบจัดการที่สะดวก ปลอดภัย และมีผู้ใช้งานจำนวนมาก 
                                ช่วยให้คุณเข้าถึงลูกค้าได้มากขึ้น
                            </p>
                        </div>
                    )}
                </div>

                <div className="border-b border-gray-300 pb-4">
                    <button 
                        className="flex items-center hover:text-red-600 transition-colors"
                        onClick={() => setIsOpen(!isOpen)}
                    >
                        <BookOpenIcon className="h-6 w-6 text-red-500 mr-3"/>
                        <h1>การตั้งราคาชีทควรเป็นอย่างไร?</h1>
                    </button>
                    {isOpen && (
                        <div className="mt-4 ml-9 p-4 bg-gray-100 rounded-lg max-w-5xl">
                            <p className="text-gray-700">
                                4king เป็นแพลตฟอร์มที่ให้คุณสามารถลงขายชีทได้อย่างง่ายดาย 
                                มีระบบจัดการที่สะดวก ปลอดภัย และมีผู้ใช้งานจำนวนมาก 
                                ช่วยให้คุณเข้าถึงลูกค้าได้มากขึ้น
                            </p>
                        </div>
                    )}
                </div>

                <div className="border-b border-gray-300 pb-4">
                    <button 
                        className="flex items-center hover:text-red-600 transition-colors"
                        onClick={() => setIsOpen(!isOpen)}
                    >
                        <BookOpenIcon className="h-6 w-6 text-red-500 mr-3"/>
                        <h1>การตัดรอบรายได้เป็นอย่างไร?</h1>
                    </button>
                    {isOpen && (
                        <div className="mt-4 ml-9 p-4 bg-gray-100 rounded-lg max-w-5xl">
                            <p className="text-gray-700">
                                4king เป็นแพลตฟอร์มที่ให้คุณสามารถลงขายชีทได้อย่างง่ายดาย 
                                มีระบบจัดการที่สะดวก ปลอดภัย และมีผู้ใช้งานจำนวนมาก 
                                ช่วยให้คุณเข้าถึงลูกค้าได้มากขึ้น
                            </p>
                        </div>
                    )}
                </div>

                <div className="border-b border-gray-300 pd-4">
                    <button 
                        className="flex items-center hover:text-red-600 transition-colors"
                        onClick={() => setIsOpen(!isOpen)}
                    >
                        <BookOpenIcon className="h-6 w-6 text-red-500 mr-3"/>
                        <h1>ฉันจะโปรโมทชีทของฉันได้อย่างไร?</h1>
                    </button>
                    {isOpen && (
                        <div className="mt-4 ml-9 p-4 bg-gray-100 rounded-lg max-w-5xl">
                            <p className="text-gray-700">
                                4king เป็นแพลตฟอร์มที่ให้คุณสามารถลงขายชีทได้อย่างง่ายดาย 
                                มีระบบจัดการที่สะดวก ปลอดภัย และมีผู้ใช้งานจำนวนมาก 
                                ช่วยให้คุณเข้าถึงลูกค้าได้มากขึ้น
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
export default Help_page;
