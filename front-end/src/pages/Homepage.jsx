import React,{useEffect, useState} from "react";
import {Link} from "react-router-dom";
import Slider from "../components/Slider";
import Bookcounsel from "../components/Bookcounsel";
import { ArrowRightIcon, BookOpenIcon, TruckIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';
const Homepage = () => {
    const [loading, setLoading] = useState(true);
    useEffect(()=>{
        setTimeout(()=>{
            setLoading(false);
        },2000)
    },[]);
     const slideData = [
    {
      image: '/Images/board/home_board.jpg',
      link: '/Help'
    },
    {
      image: '/Images/board/sell_board.jpg',
      link: '/SellListPage'
    }
  ];


    return (
     <div className="homepage w-full h-full">
       <Slider slides={slideData} />
       
      <section className="py-8 bg-gray-50">

        <div className="container mx-auto px-8">

            <h2 className="text-3xl font-bold text-center mb-12 mt-8">หนังสือแนะนำ</h2>
            <Bookcounsel />

            <h2 className="text-3xl font-bold text-center mb-12 mt-8">หนังสือใหม่</h2>
            <Bookcounsel />

            <h2 className="text-3xl font-bold text-center mb-12 mt-8 ">หนังสือขายดี</h2>
            <Bookcounsel />

          <div className="text-center mt-12">
              <div className="text-center mt-12">
                <Link to="/SellListPage" className="inline-flex items-center text-viridian-600 
                  hover:text-viridian-700 font-semibold text-lg group text-xl">
                    ดูหนังสือทั้งหมด
                  <ArrowRightIcon className="ml-2 h-5 w-5 group-hover:translate-x-2 
                    transition-transform" />
                </Link>
              </div>
          </div>

        </div>

      </section>
    </div>
  );
};

export default Homepage;