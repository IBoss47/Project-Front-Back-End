import React,{useEffect, useState} from "react";
import {Link} from "react-router-dom";
import SellItemCom from "../components/SellItemCom";

const SellItem = () => {
    return (
        <div>
            <h1>Sell Item</h1>
            <SellItemCom />
        </div>
    );
}

export default SellItem;