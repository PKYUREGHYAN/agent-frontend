import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './listing.css';
import { I18nTree } from '../i18n/I18n.jsx';

// Բրաուզերային թեթև ZIP գեներատոր (առանց արտաքին npm գրադարանների)
const crcTable = (() => {
    let c;
    const table = new Uint32Array(256);
    for (let n = 0; n < 256; n++) {
        c = n;
        for (let k = 0; k < 8; k++) {
            c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
        }
        table[n] = c >>> 0;
    }
    return table;
})();

function computeCrc32(buf) {
    let crc = 0 ^ (-1);
    for (let i = 0; i < buf.length; i++) {
        crc = (crc >>> 8) ^ crcTable[(crc ^ buf[i]) & 0xFF];
    }
    return (crc ^ (-1)) >>> 0;
}

function buildZipBlob(files) {
    const localHeaders = [];
    const centralDirs = [];
    let offset = 0;

    for (const file of files) {
        const nameBytes = new TextEncoder().encode(file.name);
        const dataBytes = file.data;
        const crc = computeCrc32(dataBytes);
        const size = dataBytes.length;

        const local = new Uint8Array(30 + nameBytes.length);
        const lView = new DataView(local.buffer);
        lView.setUint32(0, 0x04034b50, true);
        lView.setUint16(4, 20, true);
        lView.setUint16(6, 0, true);
        lView.setUint16(8, 0, true);
        lView.setUint16(10, 0, true);
        lView.setUint16(12, 0, true);
        lView.setUint32(14, crc, true);
        lView.setUint32(18, size, true);
        lView.setUint32(22, size, true);
        lView.setUint16(26, nameBytes.length, true);
        lView.setUint16(28, 0, true);
        local.set(nameBytes, 30);
        localHeaders.push(local, dataBytes);

        const central = new Uint8Array(46 + nameBytes.length);
        const cView = new DataView(central.buffer);
        cView.setUint32(0, 0x02014b50, true);
        cView.setUint16(4, 20, true);
        cView.setUint16(6, 20, true);
        cView.setUint16(8, 0, true);
        cView.setUint16(10, 0, true);
        cView.setUint16(12, 0, true);
        cView.setUint16(14, 0, true);
        cView.setUint32(16, crc, true);
        cView.setUint32(20, size, true);
        cView.setUint32(24, size, true);
        cView.setUint16(28, nameBytes.length, true);
        cView.setUint16(30, 0, true);
        cView.setUint16(32, 0, true);
        cView.setUint16(34, 0, true);
        cView.setUint16(36, 0, true);
        cView.setUint32(38, 0, true);
        cView.setUint32(42, offset, true);
        central.set(nameBytes, 46);
        centralDirs.push(central);

        offset += local.length + dataBytes.length;
    }

    const centralDirOffset = offset;
    let centralDirSize = 0;
    for (const cd of centralDirs) {
        centralDirSize += cd.length;
    }

    const eocd = new Uint8Array(22);
    const eView = new DataView(eocd.buffer);
    eView.setUint32(0, 0x06054b50, true);
    eView.setUint16(4, 0, true);
    eView.setUint16(6, 0, true);
    eView.setUint16(8, files.length, true);
    eView.setUint16(10, files.length, true);
    eView.setUint32(12, centralDirSize, true);
    eView.setUint32(16, centralDirOffset, true);
    eView.setUint16(20, 0, true);

    return new Blob([...localHeaders, ...centralDirs, eocd], { type: 'application/zip' });
}

const defaultMockListing = {
    id: '331388161',
    title: '1-комн. кв. • 46 м² • 17/22 этаж',
    price: '50 000 ₽ / мес.',
    address: 'Россия, Московская область, Мытищи, Юбилейная улица, 4',
    description: 'Сдается просторная, светлая 1-ком квартира в новом, современном микрорайоне с хорошо развитой инфраструктурой (школы, детские сады, поликлиники, магазины, ПВЗ, уютные кафе). Площадь комнаты 24 м². В квартире имеются кондиционер, стиральная машина, холодильник. Вид из окон в центр района. Двор без машин. Звоните, а лучше приезжайте смотреть, объект достойный. Без животных.',
    photos: [
        { id: 1, src: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1200&q=80', title: 'Ванная комната' },
        { id: 2, src: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80', title: 'Гостиная зона' },
        { id: 3, src: 'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=1200&q=80', title: 'Кухня и столовая' },
    ]
};

export default function ListingDemo({
                                        listingData,
                                        onReset,
                                        onBackToHome,
                                        onOpenPhotos,
                                        onOpenCard
                                    }) {
    const activeData = listingData || defaultMockListing;
    const [phase, setPhase] = useState('analyzing');
    const [cleanedPhotos, setCleanedPhotos] = useState({});
    const [isDownloadingZip, setIsDownloadingZip] = useState(false);
    const [isDownloadingAll, setIsDownloadingAll] = useState(false);

    const startAnalysis = () => {
        setPhase('analyzing');
        setCleanedPhotos({});

        activeData.photos.forEach((photo, index) => {
            setTimeout(() => {
                setCleanedPhotos((prev) => ({ ...prev, [photo.id]: true }));
            }, (index + 1) * 600);
        });

        const timer = setTimeout(() => {
            setPhase('done');
        }, activeData.photos.length * 600 + 200);

        return timer;
    };

    useEffect(() => {
        const timer = startAnalysis();
        return () => clearTimeout(timer);
    }, [activeData]);

    const handleReset = () => {
        if (onReset) {
            onReset();
        } else {
            startAnalysis();
        }
    };

    const handleGoBackToFirstPage = () => {
        if (onBackToHome) {
            onBackToHome();
        } else if (onReset) {
            onReset();
        }
    };

    const handlePhotosClick = () => {
        if (onOpenPhotos) {
            onOpenPhotos();
        }
    };

    const handleCardClick = () => {
        if (onOpenCard) {
            onOpenCard();
        }
    };

    // 1. Մեկ լուսանկարի ներբեռնում
    const downloadSinglePhoto = async (photoUrl, photoIndex) => {
        try {
            const response = await fetch(photoUrl);
            const blob = await response.blob();
            const blobUrl = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = blobUrl;
            link.download = `photo-${photoIndex + 1}.jpg`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(blobUrl);
        } catch (error) {
            const link = document.createElement('a');
            link.href = photoUrl;
            link.download = `photo-${photoIndex + 1}.jpg`;
            link.click();
        }
    };

    // 2. Բոլոր լուսանկարների հերթական ներբեռնում
    const downloadAllPhotos = async () => {
        setIsDownloadingAll(true);
        for (let i = 0; i < activeData.photos.length; i++) {
            await downloadSinglePhoto(activeData.photos[i].src, i);
            await new Promise((r) => setTimeout(r, 400));
        }
        setIsDownloadingAll(false);
    };

    // 3. ZIP արխիվի ստեղծում և ներբեռնում (առանց արտաքին գրադարանների)
    const downloadZipArchive = async () => {
        setIsDownloadingZip(true);
        try {
            const photoFiles = await Promise.all(
                activeData.photos.map(async (photo, idx) => {
                    const response = await fetch(photo.src);
                    const arrayBuffer = await response.arrayBuffer();
                    return {
                        name: `photo-${idx + 1}.jpg`,
                        data: new Uint8Array(arrayBuffer)
                    };
                })
            );

            const content = buildZipBlob(photoFiles);

            const blobUrl = window.URL.createObjectURL(content);
            const link = document.createElement('a');
            link.href = blobUrl;
            link.download = `listing-${activeData.id}-photos.zip`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(blobUrl);
        } catch (error) {
            console.error('Ошибка создания ZIP:', error);
            await downloadAllPhotos();
        } finally {
            setIsDownloadingZip(false);
        }
    };

    return (
        <I18nTree>
        <div className="listing-demo-container" style={{ position: 'relative' }}>
            {/* ՍՏԱՏՈՒՍ-ԲԱՐ */}
            <div className="status-bar-box">
                <div>
                    {phase === 'analyzing' ? (
                        <div className="badge-cleaning">
                            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#2563eb' }}></span>
                            <span>Анализ и очистка фото ({Object.keys(cleanedPhotos).length}/{activeData.photos.length} шт.)...</span>
                        </div>
                    ) : (
                        <div className="badge-done-ok">
                            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                            </svg>
                            <span>Все фотографии очищены!</span>
                        </div>
                    )}
                </div>

                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <button onClick={handleReset} className="btn-reset-action">
                        <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        <span>Перезапуск</span>
                    </button>

                    {onBackToHome && (
                        <button onClick={handleGoBackToFirstPage} className="btn-reset-action">
                            <span>← В панель</span>
                        </button>
                    )}
                </div>
            </div>

            <AnimatePresence mode="wait">
                {phase === 'analyzing' ? (
                    <motion.div
                        key="analyzing-view"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}
                    >
                        {activeData.photos.map((photo, index) => {
                            const isCleaned = cleanedPhotos[photo.id];
                            return (
                                <div
                                    key={photo.id}
                                    style={{
                                        position: 'relative',
                                        borderRadius: '18px',
                                        overflow: 'hidden',
                                        aspectRatio: '4/3',
                                        background: '#0f172a',
                                        border: '1px solid #1e3552',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}
                                >
                                    <img
                                        src={photo.src}
                                        alt={`Photo ${index + 1}`}
                                        style={{
                                            width: '100%',
                                            height: '100%',
                                            objectFit: 'cover',
                                            filter: !isCleaned ? 'brightness(0.5) blur(2px)' : 'none',
                                            transition: 'all 0.6s ease'
                                        }}
                                    />
                                    {!isCleaned ? (
                                        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <span style={{ background: 'rgba(15,23,42,0.9)', color: '#00f0ff', fontSize: '12px', padding: '6px 14px', borderRadius: '9999px', fontWeight: 'bold' }}>
                                                Очистка #{index + 1}...
                                            </span>
                                        </div>
                                    ) : (
                                        <div style={{ position: 'absolute', bottom: '12px', right: '12px', background: '#059669', color: '#fff', fontSize: '11px', fontWeight: 'bold', padding: '4px 10px', borderRadius: '6px' }}>
                                            ✓ Готово
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </motion.div>
                ) : (
                    /* ՀԻՄՆԱԿԱՆ ՏԵՍՔ */
                    <motion.div
                        key="done-view"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.35 }}
                        className="listing-two-columns"
                    >
                        {/* ՁԱԽ ՍՅՈՒՆՅԱԿ */}
                        <div className="left-info-column">
                            <div className="client-actions-card">
                                <span className="client-actions-title">
                                    Подготовить для клиента
                                </span>
                                <div className="action-buttons-row">
                                    <button onClick={handlePhotosClick} className="btn-client-blue">
                                        <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 002-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        <span>Фотографии</span>
                                    </button>
                                    <button onClick={handleCardClick} className="btn-client-dark">
                                        <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                        <span>Карточку</span>
                                    </button>
                                </div>
                            </div>

                            <div className="property-details-card">
                                <div className="property-header-info">
                                    <h3 className="property-title-text">
                                        {activeData.title}
                                    </h3>
                                    <div className="property-tags-row">
                                        <span className="price-tag-green">
                                            {activeData.price}
                                        </span>
                                        <span className="id-tag-gray">
                                            ID: {activeData.id}
                                        </span>
                                    </div>
                                </div>

                                <div className="address-box-panel">
                                    <svg width="18" height="18" fill="none" stroke="#2563eb" viewBox="0 0 24 24" style={{ flexShrink: 0, marginTop: '2px' }}>
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    <span>{activeData.address}</span>
                                </div>

                                <div className="description-section">
                                    <span className="desc-label-title">
                                        Описание объекта:
                                    </span>
                                    <div className="desc-text-container">
                                        {activeData.description}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* ԱՋ ՍՅՈՒՆՅԱԿ */}
                        <div className="right-gallery-column">
                            <div className="bulk-download-row">
                                <button
                                    onClick={downloadZipArchive}
                                    disabled={isDownloadingZip}
                                    className="btn-zip-download"
                                >
                                    <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 8h14M5 8a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v1a2 2 0 01-2 2M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                                    </svg>
                                    <span>{isDownloadingZip ? 'Создание ZIP...' : 'ZIP архив'}</span>
                                </button>

                                <button
                                    onClick={downloadAllPhotos}
                                    disabled={isDownloadingAll}
                                    className="btn-all-download"
                                >
                                    <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                    </svg>
                                    <span>{isDownloadingAll ? 'Скачивание...' : 'Все фото'}</span>
                                </button>
                            </div>

                            <div className="photos-cards-list">
                                {activeData.photos.map((photo, index) => (
                                    <div key={photo.id} className="single-photo-card">
                                        <div className="photo-image-frame">
                                            <img
                                                src={photo.src}
                                                alt={`Clean photo ${index + 1}`}
                                                loading="lazy"
                                            />
                                        </div>

                                        <div className="photo-bottom-toolbar">
                                            <span className="photo-number-pill">
                                                Фото #{index + 1}
                                            </span>

                                            <button
                                                onClick={() => downloadSinglePhoto(photo.src, index)}
                                                className="btn-single-download"
                                            >
                                                <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                                </svg>
                                                <span>Скачать</span>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* «НАЗАД В ПАНЕЛЬ» ԿՈՃԱԿ */}
            <button
                type="button"
                onClick={handleGoBackToFirstPage}
                style={{
                    position: 'fixed',
                    bottom: '24px',
                    left: '24px',
                    zIndex: 99,
                    backgroundColor: '#0f172a',
                    color: '#ffffff',
                    fontSize: '12px',
                    fontWeight: 800,
                    padding: '10px 18px',
                    borderRadius: '12px',
                    border: '1px solid #334155',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    cursor: 'pointer',
                    boxShadow: '0 10px 15px -3px rgba(0,0,0,0.4)',
                    transition: 'all 0.2s ease'
                }}
            >
                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span>Назад в панель</span>
            </button>
        </div>
        </I18nTree>
    );
}