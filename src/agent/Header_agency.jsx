import React from 'react';
import './header_agency.css';
import { I18nTree } from '../i18n/I18n.jsx';
import BrandLogo from '../brand/BrandLogo.jsx';

/**
 * ԲԱՂԱԴՐԻՉ 1։ HEADER (ԳԼԽԱՎՈՐ ՎԵՐՆԱԳԻՐ ԵՎ ՀԱՇՎԻՉ)
 */
export default function Header_agency({
                                          isLoggedIn = false,
                                          remainingCount = 2,
                                          userEmail = '',
                                          onCounterClick,
                                          onLoginClick,
                                          onLogoutClick,
                                          onTariffsClick,
                                          onProfileClick
                                      }) {
    return (
        <I18nTree>
        <header className="agent-header-box">
            {/* Ձախ կողմ՝ Լոգո և Անվանում */}
            <div className="agent-header-left">
                <div className="agent-logo-wrapper">
                    <BrandLogo className="agent-logo-img" />
                </div>

                <div className="agent-text-group">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <h1 className="agent-title-main">
                            LEVEL HOME
                        </h1>
                        <span className="agent-title-badge">Агент 1</span>
                    </div>
                    <p className="agent-subtitle">
                        TECHNOLOGY & SOLUTIONS • чистые фотографии из объявлений
                    </p>
                </div>
            </div>

            {/* Աջ կողմ՝ Կոճակները */}
            <div className="agent-header-right">
                {isLoggedIn ? (
                    <>
                        {/* 1. Հաշվիչ (մնացորդ) */}
                        <button
                            id="counter-btn"
                            type="button"
                            onClick={onCounterClick}
                            className={`agent-counter-btn ${remainingCount === 0 ? 'empty' : ''}`}
                            title="Нажмите для пополнения"
                        >
                            <span>
                                остаток: <b>{remainingCount}</b>{' '}
                                {remainingCount === 1
                                    ? 'обработка'
                                    : remainingCount < 5 && remainingCount > 1
                                        ? 'обработки'
                                        : 'обработок'}
                            </span>
                            {remainingCount === 0 && (
                                <span className="agent-buy-badge">+ Купить</span>
                            )}
                        </button>

                        {/* 2. Փակ պրոֆիլի կոճակ */}
                        <button
                            id="profile-btn"
                            type="button"
                            onClick={onProfileClick}
                            className="agent-profile-btn"
                            title="Ваш закрытый профиль с User ID и ключами"
                        >
                            👤 Профиль
                        </button>

                        {/* 3. Տարիֆների կոճակ */}
                        <button
                            type="button"
                            onClick={onTariffsClick}
                            className="agent-tariffs-btn"
                        >
                            Тарифы
                        </button>

                        {/* 4. Ելքի կոճակ */}
                        <button
                            id="logout-btn"
                            type="button"
                            onClick={onLogoutClick}
                            className="agent-logout-btn"
                            title={userEmail ? `Аккаунт: ${userEmail}` : 'Выйти'}
                        >
                            Выйти
                        </button>
                    </>
                ) : (
                    <button
                        id="login-btn"
                        type="button"
                        onClick={onLoginClick}
                        className="agent-login-btn"
                    >
                        ВОЙТИ
                    </button>
                )}
            </div>
        </header>
        </I18nTree>
    );
}