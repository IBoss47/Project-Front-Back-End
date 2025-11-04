import React,{useEffect, useState} from "react";
import {Link} from "react-router-dom";
import Slider from "../components/Slider";
import { ArrowRightIcon, BookOpenIcon, TruckIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';
import BookCard from '../components/BookCard';
const Homepage = () => {
    const [loading,setLoading] = useState(true);
    useEffect(()=>{
        setTimeout(()=>{
            setLoading(false);
        },2000)
    },[]);
     const slideData = [
    {
      image: 'https://preview.redd.it/nx5sjc8hhiw71.jpg?width=1080&crop=smart&auto=webp&s=01a1fa4064aeae0c954b8ed6e50202699aa3436f', 
      title: '4KING1',
      subtitle: 'เก็บขอมูลรูปลงในไหนวะ',
    },
    {
      image: 'https://thethaiger.com/th/wp-content/uploads/2023/12/4KINGS-2-%E0%B9%80%E0%B8%82%E0%B9%89%E0%B8%B2%E0%B8%89%E0%B8%B2%E0%B8%A2-6-%E0%B8%A7%E0%B8%B1%E0%B8%99-%E0%B8%81%E0%B8%A7%E0%B8%B2%E0%B8%94%E0%B8%A3%E0%B8%B2%E0%B8%A2%E0%B9%84%E0%B8%94%E0%B9%89%E0%B8%81%E0%B8%A7%E0%B9%88%E0%B8%B2-100-%E0%B8%A5%E0%B9%89%E0%B8%B2%E0%B8%99%E0%B8%9A%E0%B8%B2%E0%B8%97-%E0%B8%94%E0%B8%B5-%E0%B9%80%E0%B8%88%E0%B8%AD%E0%B8%A3%E0%B9%8C%E0%B8%A3%E0%B8%B2%E0%B8%94-%E0%B8%82%E0%B8%AD%E0%B8%9A%E0%B8%84%E0%B8%B8%E0%B8%93%E0%B9%81%E0%B8%9F%E0%B8%99%E0%B8%AB%E0%B8%99%E0%B8%B1%E0%B8%87.png', 
      title: '4KING2',
      subtitle: 'เก็บขอมูลรูปลงในไหนวะ',
    },
    {
      image: 'https://thethaiger.com/th/wp-content/uploads/2023/12/4KINGS-2-%E0%B9%80%E0%B8%82%E0%B9%89%E0%B8%B2%E0%B8%89%E0%B8%B2%E0%B8%A2-6-%E0%B8%A7%E0%B8%B1%E0%B8%99-%E0%B8%81%E0%B8%A7%E0%B8%B2%E0%B8%94%E0%B8%A3%E0%B8%B2%E0%B8%A2%E0%B9%84%E0%B8%94%E0%B9%89%E0%B8%81%E0%B8%A7%E0%B9%88%E0%B8%B2-100-%E0%B8%A5%E0%B9%89%E0%B8%B2%E0%B8%99%E0%B8%9A%E0%B8%B2%E0%B8%97-%E0%B8%94%E0%B8%B5-%E0%B9%80%E0%B8%88%E0%B8%AD%E0%B8%A3%E0%B9%8C%E0%B8%A3%E0%B8%B2%E0%B8%94-%E0%B8%82%E0%B8%AD%E0%B8%9A%E0%B8%84%E0%B8%B8%E0%B8%93%E0%B9%81%E0%B8%9F%E0%B8%99%E0%B8%AB%E0%B8%99%E0%B8%B1%E0%B8%87.png', 
      title: '4KING3',
      subtitle: 'เก็บขอมูลรูปลงในไหนวะ',
    },
    {
      image: 'https://thethaiger.com/th/wp-content/uploads/2023/12/4KINGS-2-%E0%B9%80%E0%B8%82%E0%B9%89%E0%B8%B2%E0%B8%89%E0%B8%B2%E0%B8%A2-6-%E0%B8%A7%E0%B8%B1%E0%B8%99-%E0%B8%81%E0%B8%A7%E0%B8%B2%E0%B8%94%E0%B8%A3%E0%B8%B2%E0%B8%A2%E0%B9%84%E0%B8%94%E0%B9%89%E0%B8%81%E0%B8%A7%E0%B9%88%E0%B8%B2-100-%E0%B8%A5%E0%B9%89%E0%B8%B2%E0%B8%99%E0%B8%9A%E0%B8%B2%E0%B8%97-%E0%B8%94%E0%B8%B5-%E0%B9%80%E0%B8%88%E0%B8%AD%E0%B8%A3%E0%B9%8C%E0%B8%A3%E0%B8%B2%E0%B8%94-%E0%B8%82%E0%B8%AD%E0%B8%9A%E0%B8%84%E0%B8%B8%E0%B8%93%E0%B9%81%E0%B8%9F%E0%B8%99%E0%B8%AB%E0%B8%99%E0%B8%B1%E0%B8%87.png', 
      title: '4KING4',
      subtitle: 'เก็บขอมูลรูปลงในไหนวะ',
    }
  ];
  const featuredBooks = [
    { 
      id: 1, 
      title: 'The Great Gatsby', 
      author: 'F. Scott Fitzgerald', 
      price: 299, 
      originalPrice: 399,
      coverImage: '/images/books/gatsby.jpg',
      category: 'Classic',
      rating: 4.5,
      reviews: 234,
      discount: 25
    },
    { 
      id: 2, 
      title: '1984', 
      author: 'George Orwell', 
      price: 350, 
      coverImage: '/images/books/1984.jpg',
      category: 'Fiction',
      rating: 4.8,
      reviews: 512,
      isNew: true
    },
    { 
      id: 3, 
      title: 'To Kill a Mockingbird', 
      author: 'Harper Lee', 
      price: 320, 
      coverImage: '/images/books/mockingbird.jpg',
      category: 'Classic',
      rating: 4.6,
      reviews: 189
    },
  ];
    return (
     <div className="homepage w-full h-full">
       <Slider slides={slideData} />
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">หนังสือแนะนำ</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredBooks.map(book => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>
          <div className="text-center mt-8">
            <Link to="/books" className="inline-flex items-center text-viridian-600 
              hover:text-viridian-700 font-semibold text-lg group">
              ดูหนังสือทั้งหมด
              <ArrowRightIcon className="ml-2 h-5 w-5 group-hover:translate-x-2 
                transition-transform" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Homepage;