import {useEffect,useState,useRef}  from "react";
import {Link} from "react-router-dom";
import './styles/Slider.css';

const Slider = ({slides,autoPlay = 5000}) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const slideTimeRef = useRef(null);
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
        resetTimeout();
        slideTimeRef.current = setTimeout
        (
            () => goToNext(),
            autoPlay
        );
        return () =>{
            resetTimeout();
        };
    },[currentIndex,autoPlay]);
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