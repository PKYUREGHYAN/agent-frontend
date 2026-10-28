import React, { useState, useEffect } from 'react';
import TopControlPanel from './TopControlPanel.jsx';
import {
    Save,
    Check,
    Trash2,
    MapPin,
    DollarSign,
    FileText,
    Home,
    Image as ImageIcon,
    Eye,
    Edit3
} from 'lucide-react';
import { createShareLink } from './agencyAccount.js';
import ShareListingCard from './ShareListingCard.jsx';
import './client-view.css';
import { I18nTree } from '../i18n/I18n.jsx';

/**
 * ԲԱՂԱԴՐԻՉ 7։ ԳՈՒՅՔԻ ՏՎՅԱԼՆԵՐԻ ՔԱՐՏ ԵՎ ՀԱՃԱԽՈՐԴԻ ՏԵՍՔ (PROPERTY CARD VIEW)
 * Ֆայլի հասցեն՝ src/agencyComponents/PropertyCardView.jsx
 */
export default function PropertyCardView({
                                             listingData,
                                             onUpdateListing,
                                             onBackToListing
                                         }) {
    // Ռեժիմ՝ 'edit' (խմբագրում) | 'preview' (հաճախորդի տեսք)
    const [mode, setMode] = useState('edit');

    // Լռելյայն տվյալներ
    const defaultData = {
        id: '331388161',
        title: '3 սենյականոց բնակարան • 85 մ² • 5/14 հարկ • Նորակառույց',
        price: '$145,000 (58,000,000 ֏)',
        address: 'Հայաստան, Երևան, Կենտրոն, Արամի փողոց, 82',
        description: 'Հայտարարության լուսանկարները Agent_1-ի կողմից մշակվել են: Հեռացված են List.am-ի բոլոր լոգոները, ջրանիշերը և հեռախոսահամարները: Լուսանկարները բարձր որակով պատրաստ են հաճախորդներին ուղարկելու կամ նոր հայտարարություն տեղադրելու համար:',
        photos: [
            { id: 1, src: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80', title: 'Շենքի ճակատ' },
            { id: 2, src: 'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=1200&q=80', title: 'Լողավազան և բակ' },
            { id: 3, src: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1200&q=80', title: 'Սանհանգույց' }
        ]
    };

    // Գույքի հիմնական state
    const [formData, setFormData] = useState(() => {
        try {
            const saved = localStorage.getItem('agency_card_saved_data');
            if (saved) return JSON.parse(saved);
        } catch (e) {
            console.error(e);
        }
        return listingData || defaultData;
    });

    useEffect(() => {
        if (listingData) {
            setFormData(listingData);
        }
    }, [listingData]);

    const [isSaved, setIsSaved] = useState(false);
    const [saveMessage, setSaveMessage] = useState('');

    // Գոյություն ունեցող լուսանկարի հեռացում (Պակասեցնել քարտից)
    const handleDeletePhoto = (photoId) => {
        setFormData(prev => {
            const updated = {
                ...prev,
                photos: prev.photos.filter((p, idx) => (p.id ? p.id !== photoId : idx !== photoId))
            };
            try {
                localStorage.setItem('agency_card_saved_data', JSON.stringify(updated));
            } catch (err) {
                console.error(err);
            }
            return updated;
        });
        setIsSaved(false);
        setSaveMessage('Фото удалено из карточки');
        setTimeout(() => setSaveMessage(''), 2500);
    };

    const handleChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
        setIsSaved(false);
    };

    // Պահպանել (Save)
    const handleSave = () => {
        try {
            localStorage.setItem('agency_card_saved_data', JSON.stringify(formData));
        } catch (e) {
            console.error(e);
        }

        if (onUpdateListing) {
            onUpdateListing(formData);
        }

        setIsSaved(true);
        setSaveMessage('✓ Все изменения успешно сохранены!');
        setTimeout(() => setSaveMessage(''), 3500);
    };

    const handleShare = async (target) => {
        try {
            const share = await createShareLink('card', formData);
            const houseLabel = share.houseId ? `Agent 1 • տուն #${share.houseId}` : 'Agent 1';
            const textToCopy = `${formData.title}\n${houseLabel}\n💰 ${formData.price}\n📍 ${formData.address}\n\n${formData.description}\n\n${share.url}`;

            if (target === 'copy') {
                await navigator.clipboard.writeText(share.url);
                alert(`✓ ${houseLabel}\nՀաճախորդի մոտ 3 օր է։ Ադմինում մնում է միշտ։`);
                return;
            }
            if (target === 'wa') {
                window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(textToCopy)}`, '_blank');
                return;
            }
            if (target === 'tg') {
                window.open(`https://t.me/share/url?url=${encodeURIComponent(share.url)}&text=${encodeURIComponent(formData.title + ' — ' + formData.price)}`, '_blank');
                return;
            }
            if (target === 'vb') {
                window.open(`viber://forward?text=${encodeURIComponent(textToCopy)}`, '_blank');
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
                type="card"
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

            {/* 2. ՌԵԺԻՄԻ ԾԱՆՈՒՑՄԱՆ ՇԵՐՏ */}
            <div className={`cv-mode-info-banner ${mode === 'edit' ? 'edit-mode' : 'preview-mode'}`}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {mode === 'edit' ? (
                        <>
                            <Edit3 className="w-5 h-5 text-blue-400" />
                            <div>
                                <span style={{ fontWeight: 800, color: '#93c5fd', fontSize: '14px' }}>
                                    Режим редактирования:
                                </span>
                                <p style={{ margin: 0, fontSize: '12px', color: '#cbd5e1' }}>
                                    Добавляйте сколько угодно фото, удаляйте ненужные или редактируйте данные объекта.
                                </p>
                            </div>
                        </>
                    ) : (
                        <>
                            <Eye className="w-5 h-5 text-emerald-400" />
                            <div>
                                <span style={{ fontWeight: 800, color: '#6ee7b7', fontSize: '14px' }}>
                                    Режим предпросмотра для клиента:
                                </span>
                                <p style={{ margin: 0, fontSize: '12px', color: '#cbd5e1' }}>
                                    Чистый презентационный вид для отправки в мессенджеры.
                                </p>
                            </div>
                        </>
                    )}
                </div>

                {mode === 'edit' && (
                    <button
                        type="button"
                        onClick={handleSave}
                        className="cv-save-btn"
                    >
                        {isSaved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                        <span>{isSaved ? 'Сохранено!' : 'Сохранить изменения'}</span>
                    </button>
                )}
            </div>

            {/* ՀԱՋՈՂ ՊԱՀՊԱՆՄԱՆ ԾԱՆՈՒՑՈՒՄ (TOAST) */}
            {saveMessage && (
                <div style={{
                    background: '#059669',
                    color: '#ffffff',
                    padding: '12px 18px',
                    borderRadius: '10px',
                    marginBottom: '18px',
                    fontSize: '14px',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    boxShadow: '0 4px 12px rgba(5, 150, 105, 0.4)',
                    animation: 'fadeIn 0.25s ease'
                }}>
                    <Check className="w-5 h-5" />
                    <span>{saveMessage}</span>
                </div>
            )}

            {mode === 'preview' ? (
                <ShareListingCard listing={formData} brand="Agent_1" />
            ) : (
            <div className="cv-main-property-card">
                {/* ՎԵՐՆԱԳԻՐ ԵՎ ԳԻՆ */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '14px', marginBottom: '18px' }}>
                    <div style={{ flex: 1, minWidth: '280px' }}>
                        <span style={{ fontSize: '11px', color: '#0284c7', background: 'rgba(2,132,199,0.15)', padding: '4px 10px', borderRadius: '6px', fontWeight: 800, letterSpacing: '0.5px' }}>
                            КАРТОЧКА ОБЪЕКТА
                        </span>

                        {mode === 'edit' ? (
                            <div style={{ marginTop: '8px' }}>
                                <label className="cv-edit-label">
                                    Заголовок объекта:
                                </label>
                                <input
                                    type="text"
                                    className="cv-edit-input"
                                    value={formData.title}
                                    onChange={(e) => handleChange('title', e.target.value)}
                                    style={{ fontSize: '18px', fontWeight: 800 }}
                                    placeholder="Заголовок объекта..."
                                />
                            </div>
                        ) : (
                            <h2 style={{ fontSize: '24px', fontWeight: 800, margin: '10px 0 0 0', color: '#ffffff', lineHeight: 1.3 }}>
                                {formData.title}
                            </h2>
                        )}
                    </div>

                    <div style={{ minWidth: '200px' }}>
                        {mode === 'edit' ? (
                            <div>
                                <label className="cv-edit-label" style={{ color: '#34d399' }}>
                                    Цена / Стоимость:
                                </label>
                                <input
                                    type="text"
                                    className="cv-edit-input"
                                    value={formData.price}
                                    onChange={(e) => handleChange('price', e.target.value)}
                                    style={{ color: '#34d399', fontSize: '18px', fontWeight: 900 }}
                                    placeholder="$145,000..."
                                />
                            </div>
                        ) : (
                            <div style={{ fontSize: '22px', fontWeight: 900, color: '#34d399', background: 'rgba(52, 211, 153, 0.1)', padding: '8px 16px', borderRadius: '10px', border: '1px solid rgba(52, 211, 153, 0.25)', textAlign: 'right' }}>
                                {formData.price}
                            </div>
                        )}
                    </div>
                </div>

                {/* ՀԱՍՑԵ */}
                <div style={{
                    background: '#0d1a2d',
                    padding: '12px 16px',
                    borderRadius: '10px',
                    border: '1px solid #1c3658',
                    marginBottom: '22px'
                }}>
                    {mode === 'edit' ? (
                        <div>
                            <label className="cv-edit-label">
                                Адрес объекта:
                            </label>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{ fontSize: '16px' }}>📍</span>
                                <input
                                    type="text"
                                    className="cv-edit-input"
                                    value={formData.address}
                                    onChange={(e) => handleChange('address', e.target.value)}
                                    placeholder="Город, улица, дом..."
                                />
                            </div>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#cbd5e1' }}>
                            <span style={{ fontSize: '16px' }}>📍</span>
                            <span>{formData.address}</span>
                        </div>
                    )}
                </div>

                {/* ՆԿԱՐԱԳՐՈՒԹՅՈՒՆ */}
                <div style={{ marginBottom: '26px' }}>
                    <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#94a3b8', marginBottom: '8px' }}>
                        Описание
                    </h3>
                    {mode === 'edit' ? (
                        <textarea
                            className="cv-edit-textarea"
                            value={formData.description}
                            onChange={(e) => handleChange('description', e.target.value)}
                            rows={4}
                            placeholder="Текст описания..."
                        />
                    ) : (
                        <p style={{ fontSize: '14px', lineHeight: 1.6, color: '#cbd5e1', margin: 0, whiteSpace: 'pre-line' }}>
                            {formData.description}
                        </p>
                    )}
                </div>

                {/* ԼՈՒՍԱՆԿԱՐՆԵՐԻ ՑԱՆՑ (GRID) */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                    <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#94a3b8', margin: 0 }}>
                        Оригинальные фотографии без логотипов ({formData.photos.length} шт.)
                    </h3>
                    {mode === 'edit' && (
                        <span style={{ fontSize: '12px', color: '#f87171', fontWeight: 600 }}>
                            Нажмите «Удалить» на любом фото, чтобы убрать его
                        </span>
                    )}
                </div>

                <div className="cv-grid">
                    {formData.photos.map((photo, i) => (
                        <div key={photo.id || i} className="cv-photo-card">
                            <div className="cv-photo-frame">
                                <img
                                    src={photo.src}
                                    alt={photo.title || `Объект ${i + 1}`}
                                />
                                {mode === 'edit' && (
                                    <button
                                        type="button"
                                        onClick={() => handleDeletePhoto(photo.id || i)}
                                        className="cv-photo-delete-btn"
                                        title="Удалить это фото из карточки"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                        <span>Удалить</span>
                                    </button>
                                )}
                            </div>

                            <div className="cv-photo-meta">
                                <span>{photo.title || `Фото #${i + 1}`}</span>
                                <span style={{ color: '#38bdf8', fontWeight: 700 }}>✓ Чистый оригинал</span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* ՊԱՀՊԱՆԵԼՈՒ ԵՎ ՌԵԺԻՄԻ ԿՈՃԱԿՆԵՐԸ */}
                {mode === 'edit' && (
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '28px', paddingTop: '18px', borderTop: '1px solid #1a3250' }}>
                        <button
                            type="button"
                            onClick={() => {
                                handleSave();
                                setMode('preview');
                            }}
                            style={{
                                background: '#112238',
                                color: '#94a3b8',
                                border: '1px solid #1f3d64',
                                padding: '10px 20px',
                                borderRadius: '10px',
                                fontWeight: 700,
                                fontSize: '13px',
                                cursor: 'pointer'
                            }}
                        >
                            👁️ Предпросмотр карточки
                        </button>

                        <button
                            type="button"
                            onClick={handleSave}
                            className="cv-save-btn"
                        >
                            <Save className="w-4 h-4" />
                            <span>Сохранить изменения</span>
                        </button>
                    </div>
                )}
            </div>
            )}
        </div>
        </I18nTree>
    );
}