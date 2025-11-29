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
        const newIndex = isLastSlide ? 0 : currentIndex + 1;
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
            onMouseLeave={()=>{
                if (!isEditing) {
                    slideTimeRef.current = setTimeout(() => goToNext(), autoPlay);
                }
            }}>

            {/* Edit Mode Toggle */}
            {editable && (
                <button
                    onClick={() => setIsEditing(!isEditing)}
                    className={`absolute top-4 right-4 z-20 px-3 py-2 rounded-lg flex items-center gap-2 transition-all ${
                        isEditing 
                            ? 'bg-red-500 text-white hover:bg-red-600' 
                            : 'bg-white/90 text-gray-700 hover:bg-white'
                    }`}
                >
                    {isEditing ? (
                        <>
                            <XMarkIcon className="w-5 h-5" />
                            ปิดแก้ไข
                        </>
                    ) : (
                        <>
                            <PencilIcon className="w-5 h-5" />
                            แก้ไข Slider
                        </>
                    )}
                </button>
            )}

            {/* Arrow Navigation */}
            <div className="arrow left-arrow" onClick={goToPrevious}>&#10094;</div>
            <div className="arrow right-arrow" onClick={goToNext}>&#10095;</div>

            {/* Slide Content */}
            {currentSlide.link && !isEditing ? (
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

            {/* Edit Mode: Delete Button on Current Slide */}
            {isEditing && (
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center z-10">
                    <button
                        onClick={() => handleDeleteSlide(currentIndex)}
                        className="px-6 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 flex items-center gap-2 text-lg font-semibold shadow-lg transform hover:scale-105 transition-all"
                    >
                        <TrashIcon className="w-6 h-6" />
                        ลบรูปนี้
                    </button>
                </div>
            )}

            {/* Dot Navigation */}
            <div className="dot-container">
                {slides.map((slide, slideIndex) => (
                    <div 
                        key={slideIndex}
                        className={`dot ${currentIndex === slideIndex ? 'active' : ''}`}
                        onClick={() => goToSlide(slideIndex)}
                    />
                ))}
                
                {/* Add Slide Button */}
                {isEditing && (
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="ml-3 w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center hover:bg-green-600 transition-all"
                    >
                        <PlusIcon className="w-5 h-5" />
                    </button>
                )}
            </div>

            {/* Slide Counter */}
            {isEditing && (
                <div className="absolute top-4 left-4 bg-black/50 text-white px-3 py-1 rounded-lg text-sm">
                    รูปที่ {currentIndex + 1} / {slides.length}
                </div>
            )}

            {/* Add Slide Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl p-6 max-w-md w-full">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold text-gray-800">เพิ่มรูปภาพใหม่</h3>
                            <button 
                                onClick={() => setShowAddModal(false)}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <XMarkIcon className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Image Preview */}
                        {newSlide.image && (
                            <div className="mb-4 rounded-lg overflow-hidden">
                                <img 
                                    src={newSlide.image} 
                                    alt="Preview" 
                                    className="w-full h-40 object-cover"
                                />
                            </div>
                        )}

                        {/* File Upload */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                รูปภาพ <span className="text-red-500">*</span>
                            </label>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleFileUpload}
                                className="hidden"
                            />
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all"
                            >
                                {newSlide.image ? 'เปลี่ยนรูปภาพ' : 'เลือกรูปภาพ'}
                            </button>
                        </div>

                        {/* Link Input */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                ลิงก์ (ไม่บังคับ)
                            </label>
                            <input
                                type="text"
                                value={newSlide.link}
                                onChange={(e) => setNewSlide(prev => ({ ...prev, link: e.target.value }))}
                                placeholder="เช่น /SellListPage"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>

                        {/* Buttons */}
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowAddModal(false)}
                                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                            >
                                ยกเลิก
                            </button>
                            <button
                                onClick={handleAddSlide}
                                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                            >
                                เพิ่มรูปภาพ
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Slider;