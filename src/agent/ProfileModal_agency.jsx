import React, { useState } from 'react';
import './profile-modal_agency.css';
import { I18nTree } from '../i18n/I18n.jsx';

/**
 * ԲԱՂԱԴՐԻՉ 3։ ՕԳՏԱՏԻՐՈՋ ԱՆՁՆԱԿԱՆ ԳԱՂՏՆԻ ՍԵՆՅԱԿ / ՊՐՈՖԻԼ (PROFILE MODAL)
 * Ֆայլի անվանումը՝ /src/agencyComponets/ProfileModal_agency.jsx
 *
 * Հասանելի է միայն Google-ով մուտք գործած կամ բանալիով ակտիվացված օգտատիրոջը:
 * Պարունակում է նրա User ID-ն, գաղտնի Activation Key-ը, մնացորդը և կարգավիճակը:
 */
export default function ProfileModal({
                                         isOpen,
                                         onClose,
                                         userData = {},
                                         remainingCount = 0,
                                         onOpenPricing
                                     }) {
    const [isKeyVisible, setIsKeyVisible] = useState(false);
    const [copiedField, setCopiedField] = useState(null);

    if (!isOpen) return null;

    const email = userData.email || '';
    const firstId = userData.firstId || '';
    const secondId = userData.secondId || '';
    const createdAt = userData.createdAt || '';

    // Պատճենահանման ֆունկցիա (Clipboard)
    const handleCopy = (text, fieldName) => {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text);
            setCopiedField(fieldName);
            setTimeout(() => setCopiedField(null), 2000);
        }
    };

    return (
        <I18nTree>
        <div className="az-modal-overlay" onClick={onClose}>
            <div className="az-profile-card" onClick={(e) => e.stopPropagation()}>
                {/* Փակման X կոճակ */}
                <button
                    type="button"
                    className="az-modal-close"
                    onClick={onClose}
                    aria-label="Закрыть"
                >
                    ✕
                </button>

                {/* Վերնագիր / Պաշտպանված պրոֆիլի ինդիկատոր */}
                <div className="az-profile-header">
                    <div className="az-profile-badge-secure">
                        🔐 Личный кабинет • Защищенный профиль
                    </div>
                    <h2 className="az-profile-title">Ваш закрытый профиль</h2>
                    <p className="az-profile-subtitle">
                        Эти данные привязаны к вашему Google аккаунту и доступны только вам
                    </p>
                </div>

                {/* Օգտատիրոջ անձնական տվյալների բաժին */}
                <div className="az-profile-content">
                    <div className="az-profile-field">
                        <span className="az-field-label">Электронная почта (Gmail):</span>
                        <div className="az-field-value-box">
                            <span className="az-field-value">
                                {email || '—'}
                            </span>
                            {email ? <span className="az-verified-tag">✓ Gmail</span> : null}
                        </div>
                    </div>

                    <div className="az-profile-field">
                        <span className="az-field-label">1-й ID (вход) — из Gmail:</span>
                        <div className="az-field-input-group">
                            <input
                                type="text"
                                readOnly
                                value={firstId}
                                className="az-field-readonly font-mono"
                            />
                            <button
                                type="button"
                                onClick={() => handleCopy(firstId, 'firstId')}
                                className="az-copy-btn"
                            >
                                {copiedField === 'firstId' ? '✓ Скопировано!' : 'Копировать'}
                            </button>
                        </div>
                    </div>

                    <div className="az-profile-field">
                        <span className="az-field-label">2-й ID (админ, пакет) — из Gmail:</span>
                        <div className="az-field-input-group">
                            <input
                                type={isKeyVisible ? 'text' : 'password'}
                                readOnly
                                value={secondId}
                                className="az-field-readonly font-mono"
                            />
                            <button
                                type="button"
                                onClick={() => setIsKeyVisible(!isKeyVisible)}
                                className="az-toggle-btn"
                                title={isKeyVisible ? 'Скрыть' : 'Показать'}
                            >
                                {isKeyVisible ? '👁️ Скрыть' : '👁️ Показать'}
                            </button>
                            <button
                                type="button"
                                onClick={() => handleCopy(secondId, 'secondId')}
                                className="az-copy-btn"
                            >
                                {copiedField === 'secondId' ? '✓ Скопировано!' : 'Копировать'}
                            </button>
                        </div>
                        <span className="az-field-hint">
                            * Коды приходят на ваш Gmail. 1-й — вход на сайте. 2-й — админу, чтобы активировать пакет.
                        </span>
                    </div>

                    {/* 4. Մնացորդ և Կարգավիճակ (2 քարտեր) */}
                    <div className="az-profile-stats-row">
                        <div className="az-stat-card">
                            <div className="az-stat-label">Доступно обработок</div>
                            <div className={`az-stat-val ${remainingCount === 0 ? 'empty' : ''}`}>
                                {remainingCount}
                            </div>
                            <div className="az-stat-sub">
                                {remainingCount === 0 ? '⚠️ Требуется пополнение' : '✓ Готов к работе'}
                            </div>
                        </div>

                        <div className="az-stat-card">
                            <div className="az-stat-label">Статус аккаунта</div>
                            <div className="az-stat-val status-active">
                                Активен
                            </div>
                            <div className="az-stat-sub">
                                Регистрация: {createdAt}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Ստորին կոճակներ */}
                <div className="az-profile-footer">
                    <button
                        type="button"
                        onClick={() => {
                            onClose();
                            if (onOpenPricing) onOpenPricing();
                        }}
                        className="az-profile-action-btn"
                    >
                        Пополнить пакет обработок
                    </button>
                    <button
                        type="button"
                        onClick={onClose}
                        className="az-profile-close-btn"
                    >
                        Закрыть
                    </button>
                </div>
            </div>
        </div>
        </I18nTree>
    );
}