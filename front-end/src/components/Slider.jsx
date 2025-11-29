import {useEffect,useState,useRef}  from "react";
import {Link} from "react-router-dom";
import api from '../api/auth';
import './styles/Slider.css';

const Slider = ({slides: propSlides, autoPlay = 5000, useAPI = false}) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [slides, setSlides] = useState(propSlides || []);
    const [loading, setLoading] = useState(useAPI);
    const slideTimeRef = useRef(null);

    // Fetch slides from API if useAPI is true
    useEffect(() => {
        if (useAPI) {
            const fetchSlides = async () => {
                try {
                    setLoading(true);
                    const response = await api.get('/slider');
                    if (response.data.success) {
                        const apiSlides = response.data.data.map(img => ({
                            image: `http://localhost:8080/${img.image_path}`,
                            title: '',
                            subtitle: '',
                            link: null
                        }));
                        setSlides(apiSlides.length > 0 ? apiSlides : propSlides || []);
                    }
                } catch (error) {
                    console.error('Error fetching slider images:', error);
                    // Fallback to propSlides if API fails
                    setSlides(propSlides || []);
                } finally {
                    setLoading(false);
                }
            };
            fetchSlides();
        } else {
            setSlides(propSlides || []);
        }
    }, [useAPI, propSlides]);

    const goToPrevious = () => {
        const isFirstSlide = currentIndex === 0;
            const newIndex = isFirstSlide ? slides.length - 1 : currentIndex - 1;
        setCurrentIndex(newIndex);
   };

   const goToNext = () => { 
        const isLastSlide = currentIndex === slides.length - 1;
            const newIndex = isLastSlide ? 0 :currentIndex + 1;
      setCurrentIndex(newIndex); 
   };

   const goToSlide = (slideIndex) => {
    setCurrentIndex(slideIndex);
   };
   function resetTimeout() {
        if(slideTimeRef.current){
            clearTimeout(slideTimeRef.current);
        }
    }
    useEffect(()=>{
        if (slides.length === 0) return; // Don't run if no slides
        resetTimeout();
        slideTimeRef.current = setTimeout
        (
            () => goToNext(),
            autoPlay
        );
        return () =>{
            resetTimeout();
        };
    },[currentIndex,autoPlay,slides.length]);

    if (loading) {
        return (
            <div className="slider-container" style={{height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f3f4f6'}}>
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p className="text-gray-600">กำลังโหลดรูปภาพ...</p>
                </div>
            </div>
        );
    }

    if (slides.length === 0) {
        return (
            <div className="slider-container" style={{height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f3f4f6'}}>
                <p className="text-gray-600">ไม่มีรูปภาพสไลด์</p>
            </div>
        );
    }

    const currentSlide = slides[currentIndex];
   return (
       <div className="slider-container"
            onMouseEnter={resetTimeout}
            onMouseLeave={()=>{slideTimeRef.current = setTimeout(() => goToNext(), autoPlay);}}>

           <div className="arrow left-arrow" onClick={goToPrevious}>&#10094;
               
           </div>

           <div className="arrow right-arrow" onClick={goToNext}>&#10095;
               
           </div>
            {currentSlide.link ? (
                <Link to={currentSlide.link} className="slide" style={{backgroundImage: `url(${currentSlide.image})`}}>
                    <div className="slide-content">
                        <h2>{currentSlide.title}</h2>
                        <p>{currentSlide.subtitle}</p>
                    </div>
                </Link>
            ) : (
                <div className="slide" style={{backgroundImage: `url(${currentSlide.image})`}}>
                    <div className="slide-content">
                        <h2>{currentSlide.title}</h2>
                        <p>{currentSlide.subtitle}</p>
                    </div>
                </div>
            )}

            <div className="dot-container">
                {slides.map((slide, slideIndex) => (
                    <div key={slideIndex}
                    className={`dot ${currentIndex === slideIndex ? 'active' : ''}`}
                    onClick={() => goToSlide(slideIndex)}
                    >    
                    
                    </div>
                ))}
            </div>
       </div>
   );
};

export default Slider;