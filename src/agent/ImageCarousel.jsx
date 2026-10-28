import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './carousel.css';
import { I18nTree } from '../i18n/I18n.jsx';

/**
 * ԲԱՂԱԴՐԻՉ 6։ ԿԱՐՈՒՍԵԼ / ՋՐԱՆՇԱՆՆԵՐԻ ՄԱՔՐՄԱՆ ԻՆՏԵՐԱԿՏԻՎ ՊԱՏԿԵՐԱՍՐԱՀ (IMAGE CAROUSEL)
 * Ֆայլի անվանումը՝ /src/agencyComponets/ImageCarousel.jsx
 *
 * 1. Ցուցադրում է լուսանկարները ինտերակտիվ անիմացիայով
 * 2. Իրականացնում է լազերային սկանավորման (Laser Scan) էֆեկտ
 * 3. Ջրանշանների հեռացման պրոցեսից (Watermark Removal) հետո ցույց է տալիս 100% մաքուր պատկերը
 */
const defaultSlides = [
    { id: 1, title: 'Ванная комната', cleanImg: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1000&q=80' },
    { id: 2, title: 'Фасад здания', cleanImg: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1000&q=80' },
    { id: 3, title: 'Гостиная', cleanImg: 'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=1000&q=80' }
];

export default function ImageCarousel({ customSlides }) {
    const slides = customSlides || defaultSlides;
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isScanning, setIsScanning] = useState(true);
    const [isClean, setIsClean] = useState(false);

    useEffect(() => {
        setIsScanning(true);
        setIsClean(false);

        const cleanTimer = setTimeout(() => {
            setIsClean(true);
            setIsScanning(false);
        }, 1800);

        const slideTimer = setTimeout(() => {
            setCurrentIndex((prev) => (prev + 1) % slides.length);
        }, 4000);

        return () => {
            clearTimeout(cleanTimer);
            clearTimeout(slideTimer);
        };
    }, [currentIndex, slides.length]);

    const currentSlide = slides[currentIndex];

    return (
        <I18nTree>
        <div className="carousel-container">
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentSlide.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.4 }}
                    className="relative w-full h-full"
                >
                    <img
                        src={currentSlide.cleanImg}
                        alt={currentSlide.title}
                        className="carousel-img"
                    />

                    {!isClean && (
                        <motion.div
                            initial={{ opacity: 0.6 }}
                            animate={{ opacity: 0 }}
                            transition={{ delay: 1.5, duration: 0.3 }}
                            className="watermark-overlay"
                        >
                            <span className="watermark-text">
                                ОБРАЗЕЦ / АНТИЗНАК
                            </span>
                        </motion.div>
                    )}

                    {isScanning && (
                        <motion.div
                            initial={{ left: '0%' }}
                            animate={{ left: '100%' }}
                            transition={{ duration: 1.8, ease: 'easeInOut' }}
                            className="laser-line"
                        />
                    )}

                    <div className="status-badge-wrapper">
                        <AnimatePresence mode="wait">
                            {!isClean ? (
                                <motion.div
                                    key="processing"
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    className="badge-processing"
                                >
                                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                                    <span>⚡ Удаление водяного знака...</span>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="cleaned"
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.8 }}
                                    className="badge-cleaned"
                                >
                                    <span>✓</span>
                                    <span>Фотография очищена!</span>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <div className="dots-wrapper">
                        {slides.map((_, idx) => (
                            <button
                                key={idx}
                                onClick={() => setCurrentIndex(idx)}
                                className={`dot-btn ${
                                    idx === currentIndex ? 'bg-white w-6' : 'bg-white/50 w-2'
                                }`}
                            />
                        ))}
                    </div>
                </motion.div>
            </AnimatePresence>
        </div>
        </I18nTree>
    );
}