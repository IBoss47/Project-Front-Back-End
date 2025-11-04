import React from "react";
import './styles/SellItemCom.css'
import ImageUploader from "./ImageUploader";
const Name = () => (
    <input type="text" placeholder=""/>
);
const Detail = () => (
    <textarea  placeholder="พิมพ์ข้อความ..." className="large"></textarea>
);
const Field = () => (
    <select className="border rounded px-2 py-1">
        <option value="">เลือกสาชา</option>
      <option value="1">IT</option>
      <option value="2">CS</option>
    </select>
);
const Year = () => (
    <select className="border rounded px-2 py-1">
        <option value="">เลือกชั้นปี</option>
      <option value="1">1</option>
      <option value="2">2</option>
      <option value="3">3</option>
      <option value="4">4</option>
    </select>
    
);

const SellItemCom = () => {
    return (
        <div className="sell-item-com flex bg-orange-400 rounded-lg">
            <div className="flex-1 bg-red-100">
                <div class="flexx">
                <label>ชื่อสินค้า: </label><Name />
                </div>
                <div class="flexx">
                    <label>ข้อมูลสินค้า:</label> <Detail />
                </div>
                <div class="flexx">
                    <label>ชั้นปี:</label> <Year />
                </div>
                <div class="flexx">
                    <label>สาขา:</label> <Field />
                </div>
            </div>
            <div className="flex-1 ">
                <ImageUploader />
            </div>
            
        </div>
        
    );
}

export default SellItemCom;
