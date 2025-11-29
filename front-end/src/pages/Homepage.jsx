import React,{useEffect, useState} from "react";
import {Link} from "react-router-dom";
import Slider from "../components/Slider";
import SaleList from "../components/SaleList";
import { ArrowRightIcon} from '@heroicons/react/24/outline';
import api from '../api/auth';

const Homepage = () => {
    const [loading, setLoading] = useState(true);
    const [recommendedBooks, setRecommendedBooks] = useState([]);
    const [latestBooks, setLatestBooks] = useState([]);
    const [bestSellingBooks, setBestSellingBooks] = useState([]);
    const [slideData, setSlideData] = useState([]);
    
    useEffect(() => {
        const fetchBooks = async () => {
            setLoading(true);
            try {
                // Fetch all data in parallel
                const [recommended, latest, bestSelling, sliderRes] = await Promise.all([
                    api.get('/notes'),
                    api.get('/notes/latest'),
                    api.get('/notes/best-selling'),
                    api.get('/slider')
                ]);
                
                setRecommendedBooks(recommended.data.slice(0, 6));
                setLatestBooks(latest.data);
                setBestSellingBooks(bestSelling.data.slice(0, 6));
                
                // Set slider data from API
                if (sliderRes.data.success && sliderRes.data.data) {
                    const slides = sliderRes.data.data.map(slide => ({
                        ...slide,
                        image: `http://localhost:8080/${slide.image}`
                    }));
                    setSlideData(slides);
                }
            } catch (error) {
                console.error('Error fetching data:', error);
                // Fallback to default slides if API fails
                setSlideData([
                    { image: '/Images/board/home_board.jpg', link: '/Help' },
                    { image: '/Images/board/sell_board.jpg', link: '/SellListPage' }
                ]);
            } finally {
                setLoading(false);
            }
        };
        
        fetchBooks();
    }, []);


    return (
     <div className="homepage w-full h-full">
       <Slider useAPI={true} autoPlay={5000} slides={slideData} />
       
      <section className="py-8 bg-gray-50">

        <div className="container mx-auto px-8">

            <h2 className="text-3xl font-bold text-center mb-12 mt-8">หนังสือแนะนำ</h2>
            {loading ? (
              <div className="text-center py-8">กำลังโหลด...</div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-6 gap-8">
                {recommendedBooks.map(book => (
                  <SaleList key={book.id} book={book} />
                ))}
              </div>
            )}

            <h2 className="text-3xl font-bold text-center mb-12 mt-8">หนังสือใหม่</h2>
            {loading ? (
              <div className="text-center py-8">กำลังโหลด...</div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-6 gap-8">
                {latestBooks.map(book => (
                  <SaleList key={book.id} book={book} />
                ))}
              </div>
            )}

            <h2 className="text-3xl font-bold text-center mb-12 mt-8 ">หนังสือขายดี</h2>
            {loading ? (
              <div className="text-center py-8">กำลังโหลด...</div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-6 gap-8">
                {bestSellingBooks.map(book => (
                  <SaleList key={book.id} book={book} />
                ))}
              </div>
            )}

          <div className="text-center mt-12">
              <div className="text-center mt-12">
                <Link to="/SellListPage" className="inline-flex items-center text-viridian-600 
                  hover:text-viridian-700 font-semibold text-xl group">
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