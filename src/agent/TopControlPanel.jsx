import React, { useState } from 'react';
import {
    Sparkles,
    ChevronDown,
    ChevronUp,
    Eye,
    Edit3,
    Copy,
    Save,
    Check
} from 'lucide-react';
import './client-view.css';
import { I18nTree } from '../i18n/I18n.jsx';

// 1. WhatsApp Logo (Սպիտակ պաշտոնական պատկերանշան)
export const WhatsAppLogo = () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#ffffff" style={{ display: 'block' }}>
        <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91C21.95 6.45 17.5 2 12.04 2zm0 18.15c-1.48 0-2.93-.39-4.19-1.14l-.3-.18-3.11.82.83-3.03-.2-.32c-.83-1.32-1.26-2.83-1.26-4.39 0-4.54 3.69-8.23 8.23-8.23 2.2 0 4.27.86 5.82 2.42 1.56 1.56 2.41 3.62 2.41 5.82 0 4.54-3.69 8.23-8.23 8.23zm4.52-6.16c-.25-.12-1.46-.72-1.69-.8-.22-.09-.39-.13-.56.12-.16.25-.64.82-.79.99-.14.16-.29.18-.54.06-.24-.12-1.03-.38-1.97-1.22-.73-.65-1.23-1.46-1.37-1.7-.15-.24-.02-.38.1-.5.11-.11.25-.28.37-.42.13-.15.17-.25.25-.42.08-.17.04-.31-.02-.44-.06-.12-.55-1.33-.76-1.82-.2-.49-.4-.42-.55-.43l-.48-.01c-.16 0-.43.06-.66.31-.22.24-.85.83-.85 2.04 0 1.21.88 2.37 1 2.53.13.17 1.73 2.64 4.19 3.7.59.25 1.04.4 1.4.52.6.19 1.14.16 1.57.1.48-.07 1.48-.6 1.69-1.18.21-.58.21-1.07.14-1.18-.06-.11-.23-.13-.48-.25z"/>
    </svg>
);

// 2. Viber Logo (Սպիտակ Viber հեռախոսափող + 3 ֆիրմային ալիքներ)
export const ViberLogo = () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#ffffff" style={{ display: 'block' }}>
        <path d="M19.78 15.65c-.53-.33-1.6-1.06-2.04-1.21-.44-.14-.76-.11-1.09.34-.34.45-.98 1.15-1.25 1.4-.27.24-.62.24-1.15-.07-.53-.3-2.22-.82-4.22-2.61-1.57-1.4-2.6-3.13-2.91-3.66-.31-.53-.03-.81.23-1.08.24-.23.53-.6.8-.9.27-.3.36-.51.54-.86.18-.35.09-.66-.04-.93-.13-.27-1.15-2.77-1.58-3.79-.42-.99-.85-.85-1.17-.87-.3-.02-.64-.02-.99-.02-.35 0-.92.13-1.4.66-.48.53-1.84 1.8-1.84 4.39 0 2.59 1.89 5.09 2.15 5.44.27.36 3.66 5.8 9 7.97 4.19 1.7 5.04 1.36 5.95 1.28.91-.09 2.94-1.2 3.36-2.36.42-1.16.42-2.15.29-2.36-.13-.21-.49-.33-1.02-.66z" />
        <path d="M14.7 7.5c.5.2.9.6 1.1 1.1.1.3.4.4.7.2.3-.1.4-.4.2-.7-.4-.8-.9-1.4-1.7-1.7-.3-.1-.6 0-.7.3-.1.3 0 .6.4.8z" />
        <path d="M16.3 5.3c1.2.6 2.1 1.5 2.7 2.7.1.3.4.4.7.3.3-.1.4-.4.3-.7-.7-1.5-1.8-2.6-3.3-3.3-.3-.1-.6 0-.7.3-.2.3 0 .6.3.7z" />
        <path d="M17.9 3.1c1.9 1 3.3 2.5 4.3 4.3.2.3.5.4.8.3.3-.2.4-.5.3-.8-1.1-2.1-2.7-3.8-4.8-4.9-.3-.2-.7-.1-.8.2-.2.3-.1.7.2.9z" />
    </svg>
);

// 3. Telegram Logo (Սպիտակ պաշտոնական թղթե ինքնաթիռ)
export const TelegramLogo = () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#ffffff" style={{ transform: 'translate(-0.5px, 0.5px)', display: 'block' }}>
        <path d="m20.665 3.717-17.73 6.837c-1.21.486-1.203 1.161-.222 1.462l4.552 1.42 10.532-6.645c.498-.303.953-.14.579.192l-8.533 7.701h-.002l-.002.001-.314 4.692c.46 0 .663-.211.921-.46l2.211-2.15 4.599 3.397c.848.467 1.457.227 1.668-.785l3.019-14.228c.309-1.239-.473-1.8-1.282-1.434z" />
    </svg>
);

/**
 * ԿԱՌԱՎԱՐՄԱՆ ՎԵՐԻՆ ՎԱՀԱՆԱԿ (TOP CONTROL PANEL)
 * Ֆայլի անվանումը՝ /src/agencyComponets/TopControlPanel.jsx
 */
export default function TopControlPanel({
                                            type = 'card',
                                            mode = 'edit',
                                            onModeChange,
                                            onSave,
                                            isSaved = false,
                                            onShare,
                                            onBack
                                        }) {
    const [isPanelOpen, setIsPanelOpen] = useState(true);

    const messengers = [
        { id: 'wa', name: 'WhatsApp', classKey: 'wa', Icon: WhatsAppLogo },
        { id: 'vb', name: 'Viber', classKey: 'vb', Icon: ViberLogo },
        { id: 'tg', name: 'Telegram', classKey: 'tg', Icon: TelegramLogo }
    ];

    return (
        <I18nTree>
        <div className="cv-top-panel-wrapper">
            {/* 1. Վերին բեյջ և տեքստ */}
            <div className="cv-badge-header-row">
                <div className="cv-black-pill-tag">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>Панель управления</span>
                </div>
                <p className="cv-panel-subtitle">
                    Эту панель видите <b>ТОЛЬКО ВЫ</b>. Клиенты откроют чистую страницу без лишних настроек и кнопок.
                </p>
                {onBack && (
                    <button
                        type="button"
                        onClick={onBack}
                        style={{
                            marginLeft: 'auto',
                            background: '#0f1e33',
                            border: '1px solid #1f3d64',
                            color: '#38bdf8',
                            padding: '6px 14px',
                            borderRadius: '8px',
                            fontSize: '12px',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px'
                        }}
                    >
                        ← Назад
                    </button>
                )}
            </div>

            {/* 2. Կառավարման կոճակներ */}
            {isPanelOpen && (
                <div className="cv-panel-controls-row">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                        <div className="cv-mode-toggle-group">
                            <button
                                type="button"
                                onClick={() => onModeChange && onModeChange('edit')}
                                className={`cv-btn-mode ${mode === 'edit' ? 'active-edit' : ''}`}
                            >
                                <Edit3 className="w-3.5 h-3.5" />
                                <span>Режим редактирования</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => onModeChange && onModeChange('preview')}
                                className={`cv-btn-mode ${mode === 'preview' ? 'active-preview' : ''}`}
                            >
                                <Eye className="w-3.5 h-3.5" />
                                <span>Предпросмотр</span>
                            </button>
                        </div>

                        {/* ՊԱՀՊԱՆԵԼՈՒ ԿՈՃԱԿ (ԵԹԵ ԽՄԲԱԳՐՄԱՆ ՌԵԺԻՄՈՒՄ ԵՆՔ) */}
                        {mode === 'edit' && onSave && (
                            <button
                                type="button"
                                onClick={onSave}
                                className="cv-save-btn"
                            >
                                {isSaved ? (
                                    <>
                                        <Check className="w-4 h-4" />
                                        <span>Сохранено!</span>
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-4 h-4" />
                                        <span>Сохранить</span>
                                    </>
                                )}
                            </button>
                        )}
                    </div>

                    {/* Մեսենջերներով ուղարկման կոճակներ */}
                    <div className="cv-share-messengers-group">
                        <span className="cv-share-label">
                            {type === 'card' ? 'Отправить карточку:' : 'Отправить фото:'}
                        </span>

                        <button
                            type="button"
                            onClick={() => onShare && onShare('copy')}
                            className="cv-btn-copy-link"
                        >
                            <Copy className="w-3.5 h-3.5" />
                            <span>Ссылка</span>
                        </button>

                        {messengers.map((item) => {
                            const Icon = item.Icon;
                            return (
                                <button
                                    key={item.id}
                                    type="button"
                                    onClick={() => onShare && onShare(item.id)}
                                    title={`Отправить через ${item.name}`}
                                    className={`cv-circle-icon-btn ${item.classKey}`}
                                >
                                    <Icon />
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* 3. Ծալելու / Բացելու կարմիր շերտ */}
            <button
                type="button"
                onClick={() => setIsPanelOpen(!isPanelOpen)}
                className="cv-red-toggle-bar"
            >
                <span>{isPanelOpen ? 'СВЕРНУТЬ ПАНЕЛЬ УПРАВЛЕНИЯ' : 'РАЗВЕРНУТЬ ПАНЕЛЬ УПРАВЛЕНИЯ'}</span>
                {isPanelOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
        </div>
        </I18nTree>
    );
}