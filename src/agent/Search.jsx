import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './search.css';
import { I18nTree } from '../i18n/I18n.jsx';

/**
 * ԲԱՂԱԴՐԻՉ 5։ ՀՂՈՒՄԻ ՈՐՈՆՄԱՆ ԵՎ ՄՇԱԿՄԱՆ ՎԱՀԱՆԱԿ (SEARCH COMPONENT)
 * Ֆայլի անվանումը՝ /src/agencyComponets/Search.jsx
 *
 * 1. Ընդունում է List.am, Cian, Avito կամ ցանկացած անշարժ գույքի հղում
 * 2. Տրամադրում է արագ 1-Click Demo օրինակներ փորձարկման համար
 * 3. Ցուցադրում է անիմացված պրոգրես բար (Progress Bar) մշակման ժամանակ
 */
export default function Search({
                                   onStart,
                                   isLoading = false,
                                   progress = 0,
                                   initialUrl = '',
                                   isLoggedIn = false,
                                   onLoginClick,
                                   onLogoutClick,
                               }) {
    const [url, setUrl] = useState(initialUrl);

    // List.am դեմո արագ հղումների ցանկ
    const demoListAmLinks = [
        { label: '🏢 Նոր Նորք (4 սեն.)', url: 'https://www.list.am/item/24181304' },
        { label: '🏠 Արաբկիր (4 սեն.)', url: 'https://www.list.am/item/23470299' },
        { label: '🏢 Արաբկիր, Կոմիտաս (3 սեն.)', url: 'https://www.list.am/item/23645550' }
    ];

    const handleSubmit = (e) => {
        if (e) e.preventDefault();
        if (onStart) {
            onStart(url);
        }
    };

    const handleSelectDemo = (demoUrl) => {
        setUrl(demoUrl);
        if (onStart) {
            onStart(demoUrl);
        }
    };

    return (
        <div className="search-component-wrapper">
            {/* 1. INPUT FORM */}
            <form onSubmit={handleSubmit} className="search-bar-box">
                <label htmlFor="url-input" className="search-label">
                    ОБЪЯВЛЕНИЕ:
                </label>
                <input
                    type="text"
                    id="url-input"
                    className="search-input-field"
                    placeholder="вставьте ссылку дома с list.am"
                    value={url}
                    disabled={isLoading}
                    onChange={(e) => setUrl(e.target.value)}
                />
                <button
                    type="button"
                    className="btn-login-inline"
                    onClick={() => {
                        if (isLoggedIn && onLogoutClick) {
                            onLogoutClick();
                            return;
                        }
                        if (onLoginClick) {
                            onLoginClick();
                        }
                    }}
                >
                    {isLoggedIn ? 'ВЫЙТИ' : 'ВОЙТИ'}
                </button>
                <button
                    type="submit"
                    className="btn-start"
                    disabled={isLoading}
                >
                    {isLoading ? 'ОТКРЫВАЕМ...' : 'ПУСК!'}
                </button>
            </form>

            {/* 2. DEMO CHIPS (List.am արագ փորձարկում) */}
            <div className="search-demo-chips-row">
                <span className="demo-chips-label">
                    <span className="demo-dot" />
                    Փորձել List.am Demo օրինակներով՝
                </span>
                {demoListAmLinks.map((item, index) => (
                    <button
                        key={index}
                        type="button"
                        disabled={isLoading}
                        onClick={() => handleSelectDemo(item.url)}
                        className="demo-chip-btn"
                    >
                        {item.label}
                    </button>
                ))}
            </div>

            {/* 3. PROGRESS BAR */}
            <AnimatePresence>
                {isLoading && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="search-progress-panel"
                    >
                        <div className="search-progress-header">
                            <span>⚡ Объявление обрабатывается...</span>
                            <span>{progress}%</span>
                        </div>

                        <div className="search-progress-track">
                            <div
                                className="search-progress-fill"
                                style={{ width: `${progress}%` }}
                            />
                        </div>

                        <div className="search-progress-status-text">
                            Загрузка ➔ Сканирование артефактов ➔ Очистка в высоком разрешении...
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}