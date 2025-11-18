import React,{useState,useEffect, use,} from "react";
import BookCard from '../components/SaleList';
import { getAllBooks, filterBooks } from '../data/mockBooksData';
import axios from "axios";
const Booknew = () => {
    const [loading,setLoading] = useState(true);
    const [books, setBooks] = useState([]);
    const [filteredBooks, setFilteredBooks] = useState([]);
    useEffect(() => {
         // Load books from data
         setLoading(true);
         setTimeout(() => {
           const booksData = getAllBooks();
           setBooks(booksData);
           setFilteredBooks(booksData);
           setLoading(false);
         }, 500);
       }, []);
       
// เตียม เชื่อมbackend 
    //   useEffect(() => {
    //     const loadBooks = async () =>{
    //       setLoading(true);
    //       try{
    //         const res = await axios.get("http://localhost:3000/api/books");
    //         setBooks(res.data);
    //       }catch (err) {
    //         console.error(err);
    //       }
    //       setLoading(false);
    //     }
    //   loadBooks();
    // }, []);
    return (
        
        <div className="grid md:grid-cols-2 lg:grid-cols-6 gap-8">
            {books.slice(0,6).map(book => (
                <BookCard key={book.id} book={book} />
             ))}
         </div>
    );
}

export default Booknew;