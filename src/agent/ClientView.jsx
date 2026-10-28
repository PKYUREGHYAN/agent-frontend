import React, { useState } from 'react';
import TopControlPanel from './TopControlPanel.jsx';
import { Save, Check, Trash2 } from 'lucide-react';
import { createShareLink } from './agencyAccount.js';
import ShareListingCard from './ShareListingCard.jsx';
import './client-view.css';
import { I18nTree } from '../i18n/I18n.jsx';

/**
 * ԲԱՂԱԴՐԻՉ 10։ ՀԱՃԱԽՈՐԴԻ ԼՈՒՍԱՆԿԱՐՆԵՐԻ ԱԼԲՈՄ (CLIENT VIEW PHOTOS)
 * Ֆայլի անվանումը՝ /src/agencyComponets/ClientView.jsx
 */
export default function ClientView({
                                       listingData,
                                       onUpdateListing,
                                       onBackToListing
                                   }) {
    // Ռեժիմ՝ 'edit' | 'preview'
    const [mode, setMode] = useState('edit');

    const [propertyTitle, setPropertyTitle] = useState(
        listingData?.title || '1-комн. кв. • 46 м² • 17/22 этаж'
    );

    const [photos, setPhotos] = useState(() => {
        return listingData?.photos || [
            { id: 1, src: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1200&q=80', title: 'Ванная комната' },
            { id: 2, src: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80', title: 'Гостиная зона' },
            { id: 3, src: 'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=1200&q=80', title: 'Кухня и столовая' },
        ];
    });

    const [isSaved, setIsSaved] = useState(false);
    const [saveMessage, setSaveMessage] = useState('');

    const handlePhotoTitleChange = (idx, newTitle) => {
        setPhotos(prev => prev.map((p, i) => i === idx ? { ...p, title: newTitle } : p));
        setIsSaved(false);
    };

    const handleDeletePhoto = (idx) => {
        setPhotos(prev => prev.filter((_, i) => i !== idx));
        setIsSaved(false);
    };

    const handleSave = () => {
        const updated = {
            ...(listingData || {}),
            title: propertyTitle,
            photos: photos
        };

        try {
            localStorage.setItem(`agency_photos_${listingData?.id || 'default'}`, JSON.stringify(updated));
        } catch (e) {
            console.error(e);
        }

        if (onUpdateListing) {
            onUpdateListing(updated);
        }

        setIsSaved(true);
        setSaveMessage('✓ Фотографии и подписи успешно сохранены!');
        setTimeout(() => setSaveMessage(''), 3500);
    };

    const handleShare = async (target) => {
        try {
            const listing = {
                ...(listingData || {}),
                title: propertyTitle,
                photos,
            };
            const share = await createShareLink('photos', listing);
            const houseLabel = share.houseId ? `Agent 1 • տուն #${share.houseId}` : 'Agent 1';
            const text = `${propertyTitle}\n${houseLabel}\n${share.url}`;

            if (target === 'copy') {
                await navigator.clipboard.writeText(share.url);
                alert(`✓ ${houseLabel}\nՀաճախորդի մոտ 3 օր է։`);
                return;
            }
            if (target === 'wa') {
                window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
            } else if (target === 'tg') {
                window.open(`https://t.me/share/url?url=${encodeURIComponent(share.url)}&text=${encodeURIComponent(houseLabel)}`, '_blank');
            } else if (target === 'vb') {
                window.open(`viber://forward?text=${encodeURIComponent(text)}`, '_blank');
            }
        } catch (error) {
            alert(error.message || 'Հղումը չհաջողվեց ստեղծել');
        }
    };

    return (
        <I18nTree>
        <div className="cv-page-container">
            {/* 1. TOP CONTROL PANEL */}
            <TopControlPanel
                type="photos"
                mode={mode}
                onModeChange={(newMode) => {
                    setMode(newMode);
                    if (newMode === 'preview' && !isSaved) {
                        handleSave();
                    }
                }}
                onSave={handleSave}
                isSaved={isSaved}
                onShare={handleShare}
                onBack={onBackToListing}
            />

            {/* 2. ԻՆՖՈՐՄԱՑԻՈՆ ԲԱՆՆԵՐ */}
            {mode === 'edit' ? (
                <div className="cv-mode-info-banner edit-mode">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span>✏️</span>
                        <span><b>Режим редактирования фото:</b> Изменяйте подписи к фото, удаляйте ненужные или добавляйте новые перед отправкой клиенту.</span>
                    </div>
                    <button
                        type="button"
                        onClick={handleSave}
                        className="cv-save-btn"
                        style={{ padding: '6px 14px', fontSize: '12px' }}
                    >
                        {isSaved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                        <span>{isSaved ? 'Сохранено' : 'Сохранить'}</span>
                    </button>
                </div>
            ) : (
                <div className="cv-mode-info-banner preview-mode">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span>👁️</span>
                        <span><b>Режим предпросмотра:</b> Именно так клиент увидит чистую галерею без лишних кнопок.</span>
                    </div>
                    <span style={{ fontSize: '12px', opacity: 0.9 }}>Готово к отправке ✓</span>
                </div>
            )}

            {/* 3. ԾԱՆՈՒՑՈՒՄ (SAVE TOAST) */}
            {saveMessage && (
                <div style={{
                    background: '#059669',
                    color: '#ffffff',
                    padding: '10px 18px',
                    borderRadius: '10px',
                    marginBottom: '16px',
                    fontSize: '13px',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    boxShadow: '0 4px 12px rgba(5, 150, 105, 0.4)'
                }}>
                    <Check className="w-4 h-4" />
                    <span>{saveMessage}</span>
                </div>
            )}

            {/* 4. ԷՋԻ ՎԵՐՆԱԳԻՐ */}
            <div style={{ marginBottom: '20px' }}>
                <h2 style={{ fontSize: '22px', fontWeight: 800, margin: '0 0 6px 0', color: '#fff' }}>
                    Чистые фотографии для клиента
                </h2>
                {mode === 'edit' ? (
                    <input
                        type="text"
                        className="cv-edit-input"
                        value={propertyTitle}
                        onChange={(e) => {
                            setPropertyTitle(e.target.value);
                            setIsSaved(false);
                        }}
                        style={{ maxWidth: '500px', fontSize: '13px', padding: '6px 12px' }}
                        placeholder="Название объекта..."
                    />
                ) : (
                    <p style={{ fontSize: '14px', color: '#8ea3bf', margin: 0 }}>
                        {propertyTitle}
                    </p>
                )}
            </div>

            {/* 5. ԼՈՒՍԱՆԿԱՐՆԵՐԻ ՑԱՆՑ (GRID) */}
            <div className="cv-grid">
                {photos.map((photo, idx) => (
                    <div key={photo.id || idx} className="cv-photo-card">
                        <div className="cv-photo-frame" style={{ position: 'relative' }}>
                            <img src={photo.src} alt={photo.title || `Фото ${idx + 1}`} loading="lazy" />

                            {mode === 'edit' && (
                                <button
                                    type="button"
                                    onClick={() => handleDeletePhoto(idx)}
                                    className="cv-photo-delete-btn"
                                    title="Удалить это фото"
                                >
                                    <Trash2 className="w-3 h-3" />
                                    <span>Удалить</span>
                                </button>
                            )}
                        </div>

                        <div className="cv-photo-meta">
                            {mode === 'edit' ? (
                                <input
                                    type="text"
                                    className="cv-edit-input"
                                    value={photo.title || ''}
                                    onChange={(e) => handlePhotoTitleChange(idx, e.target.value)}
                                    style={{ fontSize: '12px', padding: '4px 8px', background: '#050c17' }}
                                    placeholder="Подпись к фото..."
                                />
                            ) : (
                                <>
                                    <span>{photo.title || `Фото #${idx + 1}`}</span>
                                    <span style={{ color: '#38bdf8', fontWeight: 700 }}>✓ Чистый оригинал</span>
                                </>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
        </I18nTree>
    );
}