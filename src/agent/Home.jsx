import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Header from './Header_agency.jsx';
import ImageCarousel from './ImageCarousel.jsx';
import AuthModal_agency from './AuthModal_agency.jsx';
import PricingModal from './PricingModal.jsx';
import ProfileModal from './ProfileModal_agency.jsx';
import Search from './Search.jsx';
import {
    clearAgencySession,
    consumeAgencySearch,
    getAgencySession,
    isListAmHouseUrl,
    loginWithFirstId,
    persistAgencyListing,
    refreshAgencySession,
    sendAgencyKeysToGmail,
} from './agencyAccount.js';
import { AGENCY_API_URL } from '../services/api.js';
import { fetchListAmListing } from './fetchListAm.js';
import { saveAgencyListing } from './agencyListings.js';
import { fetchAgencyCatalog } from './packages.js';
import './home.css';
import './pricing-modal.css';
import { I18nTree, t } from '../i18n/I18n.jsx';

const fadeInUp = {
    hidden: { opacity: 0, y: 15 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.35, ease: 'easeOut' }
    }
};

/**
 * ԲԱՂԱԴՐԻՉ 8։ ԳՈՐԾԱԿԱԼՈՒԹՅԱՆ ԳԼԽԱՎՈՐ ՎԱՀԱՆԱԿ (AGENCY HOME DASHBOARD)
 * Ֆայլի անվանումը՝ /src/agencyComponets/Home.jsx
 *
 * 1. Միավորում է Header, Search, ImageCarousel, AuthModal, ProfileModal, PricingModal
 * 2. Կառավարում է մնացորդի (credits), ավտորիզացիայի և բեռնման վիճակները
 * 3. Տրամադրում է «Главное меню» հետ վերադարձի կոճակ
 */
export default function Home({ onNavigateToListing, onBackToMainMenu }) {
    // 1. Ավտորիզացիայի և մնացորդի վիճակը LocalStorage-ով
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [remainingCount, setRemainingCount] = useState(0);
    const [userEmail, setUserEmail] = useState('');
    const [userData, setUserData] = useState({});

    const [isLoading, setIsLoading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [openAccordion, setOpenAccordion] = useState(null);

    // Մոդալ պատուհանների բաց/փակ վիճակները
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [isPricingModalOpen, setIsPricingModalOpen] = useState(false);
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    const [isPackageEmptyOpen, setIsPackageEmptyOpen] = useState(false);
    const [discountPercent, setDiscountPercent] = useState(0);
    const [catalogPackages, setCatalogPackages] = useState([]);
    const [agencyBotUrl, setAgencyBotUrl] = useState('');

    const applySession = (session) => {
        if (!session) {
            setIsLoggedIn(false);
            setRemainingCount(0);
            setUserEmail('');
            setUserData({});
            return;
        }

        setIsLoggedIn(true);
        setRemainingCount(Number(session.remainingListings || 0));
        setUserEmail(session.email || '');
        setUserData(session);
    };

    useEffect(() => {
        refreshAgencySession().then((session) => {
            applySession(session);
        });
        fetchAgencyCatalog().then((catalog) => {
            setDiscountPercent(Number(catalog.discountPercent || 0));
            setCatalogPackages(Array.isArray(catalog.packages) ? catalog.packages : []);
        });
        const runtimeUrl = AGENCY_API_URL.replace(/\/api\/agency$/, '/api/runtime');
        fetch(runtimeUrl)
            .then((response) => response.json())
            .then((data) => {
                setAgencyBotUrl(data.agencyBotUrl || '');
            })
            .catch(() => {});
    }, []);

    const botBaseUrl = () => String(agencyBotUrl || '').split('?')[0];

    const botLaunchUrl = () => {
        const base = botBaseUrl();
        if (!base) {
            return '';
        }
        if (userData?.firstId) {
            return `${base}?start=${encodeURIComponent(userData.firstId)}`;
        }
        return base;
    };

    // Empty package -> Agency bot first; from there user contacts director.
    const botPackageUrl = () => {
        const base = botBaseUrl();
        if (!base) {
            return '';
        }
        const payload = userData?.firstId ? `pkg_${userData.firstId}` : 'pkg';
        return `${base}?start=${encodeURIComponent(payload)}`;
    };

    const openAgencyBotForPackage = () => {
        const url = botPackageUrl() || botBaseUrl() || String(agencyBotUrl || '').trim();
        if (!url) {
            alert(t('Բոտը դեռ կարգավորված չէ։ Ավելացրեք TELEGRAM_AGENCY_BOT_TOKEN և TELEGRAM_AGENCY_BOT_USERNAME .env-ում։'));
            return;
        }
        window.open(url, '_blank', 'noopener,noreferrer');
    };

    const openPackageEnded = () => {
        setIsPackageEmptyOpen(true);
    };

    // Մնացորդը և փաթեթը գալիս են բազայից (agency_agents)
    const updateAuthState = (logged, count, email, session = null) => {
        setIsLoggedIn(logged);
        setRemainingCount(count);
        setUserEmail(email);

        if (session) {
            setUserData(session);
        }
    };

    const toggleAccordion = (id) => {
        setOpenAccordion(openAccordion === id ? null : id);
    };

    const handleStartProcess = async (targetUrl) => {
        const urlToProcess = String(targetUrl || '').trim();

        if (!urlToProcess) {
            alert(t('Вставьте ссылку дома с list.am'));
            return;
        }

        if (!isListAmHouseUrl(urlToProcess)) {
            alert(t('Можно вставлять только ссылку дома с list.am (например https://www.list.am/item/123456)'));
            return;
        }

        if (!isLoggedIn) {
            setIsAuthModalOpen(true);
            return;
        }

        const sessionBefore = getAgencySession();
        if (!sessionBefore || Number(sessionBefore.remainingListings || 0) <= 0) {
            openPackageEnded();
            return;
        }

        setIsLoading(true);
        setProgress(25);

        try {
            setProgress(55);
            const listing = await fetchListAmListing(urlToProcess);
            setProgress(90);

            const used = await consumeAgencySearch();
            const session = getAgencySession();
            setRemainingCount(Number(session?.remainingListings || 0));

            if (!used.ok) {
                openPackageEnded();
                setIsLoading(false);
                setProgress(0);
                return;
            }

            saveAgencyListing(listing);
            await persistAgencyListing(listing, session?.email);
            setProgress(100);
            setIsLoading(false);
            setProgress(0);

            if (Number(session?.remainingListings || 0) <= 0) {
                openPackageEnded();
            }

            if (onNavigateToListing) {
                onNavigateToListing({ url: listing.sourceUrl, data: listing });
            }
        } catch (err) {
            console.error(err);
            setIsLoading(false);
            setProgress(0);
            alert(err.message || t('List.am-ից տվյալները չհաջողվեց ստանալ'));
        }
    };

    // Դուրս գալ համակարգից
    const handleLogout = () => {
        clearAgencySession();
        updateAuthState(false, 0, '');
        setUserData({});
    };

    return (
        <I18nTree>
        <div className="home-page">
            <motion.div
                initial={{ opacity: 0, scale: 0.99 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
                className="home-container"
            >
                {/* 1. ՆԱՎԻԳԱՑԻԱՅԻ ԳՈՏԻ (ԳԼԽԱՎՈՐ ՄԵՆՅՈՒ ՎԵՐԱԴԱՌՆԱԼՈՒ ՀՆԱՐԱՎՈՐՈՒԹՅԱՄԲ) */}
                {onBackToMainMenu && (
                    <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'flex-start' }}>
                        <button
                            type="button"
                            onClick={onBackToMainMenu}
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '8px',
                                background: '#0b1626',
                                border: '1px solid #1c3656',
                                color: '#38bdf8',
                                padding: '8px 16px',
                                borderRadius: '10px',
                                fontSize: '13px',
                                fontWeight: 700,
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                        >
                            ← В главное меню (Выбор режима)
                        </button>
                    </div>
                )}

                {/* 2. HEADER */}
                <Header
                    isLoggedIn={isLoggedIn}
                    remainingCount={remainingCount}
                    userEmail={userEmail}
                    userData={userData}
                    onLoginClick={() => setIsAuthModalOpen(true)}
                    onProfileClick={async () => {
                        applySession((await refreshAgencySession()) || getAgencySession());
                        setIsProfileModalOpen(true);
                    }}
                    onCounterClick={() => {
                        if (Number(remainingCount || 0) <= 0) {
                            openPackageEnded();
                            return;
                        }
                        setIsPricingModalOpen(true);
                    }}
                    onTariffsClick={() => {
                        if (Number(remainingCount || 0) <= 0) {
                            openPackageEnded();
                            return;
                        }
                        setOpenAccordion('pricing');
                        setIsPricingModalOpen(true);
                    }}
                    onLogoutClick={handleLogout}
                />

                <main style={{ display: 'flex', flexDirection: 'column', gap: '24px', marginTop: '16px' }}>
                    {/* 3. HERO + SEARCH COMPONENT */}
                    <div className="hero-section">
                        <motion.div
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            variants={fadeInUp}
                        >
                            <h2 className="hero-heading">скачать оригиналы фото из объявлений</h2>
                            <p className="hero-desc">
                                Онлайн сервис "Agent_1" поможет вам скачать чистые фотографии без знаков, текста и логотипов, для безопасного показа вашим клиентам. Умные алгоритмы приведут фото в порядок и автоматически удалят с них всё лишнее.
                            </p>
                        </motion.div>

                        <div style={{ marginTop: '12px' }}>
                            <Search
                                onStart={handleStartProcess}
                                isLoading={isLoading}
                                progress={progress}
                                initialUrl=""
                                isLoggedIn={isLoggedIn}
                                onLoginClick={() => setIsAuthModalOpen(true)}
                                onLogoutClick={handleLogout}
                            />
                        </div>
                    </div>

                    {/* 4. MAIN LANDING CONTENT */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        {/* Բլոկ «Как это работает?» */}
                        <motion.div
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            variants={fadeInUp}
                            className="how-it-works-card"
                        >
                            <div className="section-title-bar">
                                <div className="title-pill"></div>
                                <h3 className="section-main-title">Как это работает?</h3>
                            </div>

                            <div className="two-col-grid">
                                {/* Ձախ կողմ՝ Կարուսել */}
                                <div className="carousel-holder">
                                    <ImageCarousel />
                                </div>

                                {/* Աջ կողմ՝ Ինստրուկցիա */}
                                <div className="instructions-column">
                                    <div className="instruction-blue-box">
                                        <div className="instruction-title">
                                            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#2563eb' }}></span>
                                            КАК СКАЧАТЬ ФОТО:
                                        </div>
                                        <ul className="instruction-list">
                                            <li className="instruction-item">
                                                <span className="step-num">1</span>
                                                <span>Скопируйте интересующую вас ссылку;</span>
                                            </li>
                                            <li className="instruction-item">
                                                <span className="step-num">2</span>
                                                <span>Вставьте скопированную ссылку в поле <b>"Ссылка"</b>;</span>
                                            </li>
                                            <li className="instruction-item">
                                                <span className="step-num">3</span>
                                                <span>Нажмите кнопку <b>"Пуск"</b>;</span>
                                            </li>
                                            <li className="instruction-item">
                                                <span className="step-num">4</span>
                                                <span>Результат мгновенно откроется на экране;</span>
                                            </li>
                                            <li className="instruction-item">
                                                <span className="step-num green">5</span>
                                                <span style={{ fontWeight: 800, color: '#38bdf8' }}>Готово! Скачивайте чистые фото.</span>
                                            </li>
                                        </ul>
                                    </div>

                                    <div className="green-promo-bar">
                                        ✨ Скачивайте чистые фотографии без водяных знаков и рекламы
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Ակորդեոններ */}
                        <div className="accordion-wrapper">
                            {/* 1. Кому это нужно? */}
                            <motion.div
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true }}
                                variants={fadeInUp}
                                className="accordion-card"
                            >
                                <button
                                    type="button"
                                    onClick={() => toggleAccordion('audience')}
                                    className="accordion-btn"
                                >
                                    <span>Кому это нужно?</span>
                                    <span
                                        className="accordion-arrow"
                                        style={{ transform: openAccordion === 'audience' ? 'rotate(90deg)' : 'rotate(0deg)' }}
                                    >
                                        ►
                                    </span>
                                </button>
                                <AnimatePresence>
                                    {openAccordion === 'audience' && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.25 }}
                                            className="accordion-inner-content"
                                        >
                                            <div className="three-cards-grid">
                                                <div className="simple-card">
                                                    <h4>🏠 Риелторам и Агентствам</h4>
                                                    <p>Загружайте чистые фотографии объектов без водяных знаков для баз и рекламы.</p>
                                                </div>
                                                <div className="simple-card">
                                                    <h4>📊 Маркетологам</h4>
                                                    <p>Используйте качественный визуал в презентациях и таргете.</p>
                                                </div>
                                                <div className="simple-card">
                                                    <h4>🎨 Дизайнерам</h4>
                                                    <p>Получайте оригиналы планировок и интерьеров без логотипов.</p>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>

                            {/* 2. Стоимость и тарифы */}
                            <motion.div
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true }}
                                variants={fadeInUp}
                                className="accordion-card"
                            >
                                <button
                                    type="button"
                                    onClick={() => toggleAccordion('pricing')}
                                    className="accordion-btn"
                                >
                                    <span>Стоимость и тарифы</span>
                                    <span
                                        className="accordion-arrow"
                                        style={{ transform: openAccordion === 'pricing' ? 'rotate(90deg)' : 'rotate(0deg)' }}
                                    >
                                        ►
                                    </span>
                                </button>
                                <AnimatePresence>
                                    {openAccordion === 'pricing' && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.25 }}
                                            className="accordion-inner-content"
                                        >
                                            <p className="pricing-intro">
                                                Три пакета. После выбора админ активирует его по 2-му ID — поиски пишутся в базу.
                                            </p>
                                            <div className="az-pricing-grid pricing-showcase">
                                                {catalogPackages.map((plan) => {
                                                    const finalPrice = discountPercent > 0
                                                        ? Math.round(plan.priceAMD * (1 - discountPercent / 100))
                                                        : (plan.finalPriceAMD || plan.priceAMD);
                                                    const hasDiscount = finalPrice !== plan.priceAMD;

                                                    return (
                                                        <div
                                                            key={plan.id}
                                                            className={`az-plan-card ${plan.popular ? 'popular' : ''}`}
                                                        >
                                                            <div className="az-plan-badge">{t(plan.badgeRu || plan.name)}</div>
                                                            <div>
                                                                <h3 className="az-plan-name">{t(plan.name)}</h3>
                                                                <div className="az-plan-price-box">
                                                                    <div className="az-plan-price">
                                                                        {hasDiscount ? (
                                                                            <>
                                                                                <span className="pricing-old">{plan.priceAMD.toLocaleString('hy-AM')} ֏</span>
                                                                                {' '}
                                                                                <span>{finalPrice.toLocaleString('hy-AM')} ֏</span>
                                                                            </>
                                                                        ) : (
                                                                            `${plan.priceAMD.toLocaleString('hy-AM')} ֏`
                                                                        )}
                                                                    </div>
                                                                    <div className="az-plan-per-item">{t(plan.unitPrice || plan.perItemRu)}</div>
                                                                </div>
                                                                <ul className="az-plan-features">
                                                                    {(plan.featuresRu || []).map((feat) => (
                                                                        <li key={feat} className="az-plan-feature-item">✓ {t(feat)}</li>
                                                                    ))}
                                                                </ul>
                                                            </div>
                                                            <button
                                                                type="button"
                                                                onClick={() => setIsPricingModalOpen(true)}
                                                                className={`az-plan-btn ${plan.popular ? 'popular' : ''}`}
                                                            >
                                                                Выбрать пакет
                                                            </button>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>

                            {/* 3. Telegram Бот */}
                            <motion.div
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true }}
                                variants={fadeInUp}
                                className="accordion-card"
                            >
                                <button
                                    type="button"
                                    onClick={() => toggleAccordion('telegram')}
                                    className="accordion-btn"
                                >
                                    <span>Telegram Бот</span>
                                    <span
                                        className="accordion-arrow"
                                        style={{ transform: openAccordion === 'telegram' ? 'rotate(90deg)' : 'rotate(0deg)' }}
                                    >
                                        ►
                                    </span>
                                </button>
                                <AnimatePresence>
                                    {openAccordion === 'telegram' && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.25 }}
                                            className="accordion-inner-content"
                                        >
                                            <div className="telegram-bar">
                                                <div>
                                                    <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 800, color: '#ffffff' }}>Бот Agent_1 в Telegram</h4>
                                                    <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#8ea4be' }}>
                                                        Ուղարկեք list.am հղումը բոտին։ Կվերադարձնի մաքուր նկարները և հրամանները։
                                                    </p>
                                                </div>
                                                {botLaunchUrl() ? (
                                                    <a href={botLaunchUrl()} target="_blank" rel="noreferrer" className="btn-tg">
                                                        Открыть бота ✈
                                                    </a>
                                                ) : (
                                                    <button
                                                        type="button"
                                                        className="btn-tg"
                                                        onClick={() => alert(t('Բոտը դեռ կարգավորված չէ։ Ավելացրեք TELEGRAM_AGENCY_BOT_TOKEN և TELEGRAM_AGENCY_BOT_USERNAME .env-ում։'))}
                                                    >
                                                        Открыть бота ✈
                                                    </button>
                                                )}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        </div>
                    </div>
                </main>

                {/* 5. FOOTER */}
                <footer className="app-footer">
                    <span>© 2026 Agent_1.ru</span>
                    <a href="#" onClick={(e) => e.preventDefault()}>политика конфиденциальности</a>
                    <a href="#" onClick={(e) => e.preventDefault()}>пользовательское соглашение</a>
                </footer>
            </motion.div>

            {/* 6. ՄՈԴԱԼ ՊԱՏՈՒՀԱՆ՝ ВВЕСТИ КЛЮЧ / ПОЛУЧИТЬ КЛЮЧ */}
            <AuthModal_agency
                isOpen={isAuthModalOpen}
                onClose={() => setIsAuthModalOpen(false)}
                onApplyKey={async (key) => {
                    const session = await loginWithFirstId(key);
                    if (!session) {
                        alert(t('1-й ID не найден. Запросите ключ через Gmail.'));
                        return;
                    }
                    applySession(session);
                    setIsAuthModalOpen(false);
                }}
                onRequestKey={(email) => sendAgencyKeysToGmail(email)}
            />

            {/* 7. ՄՈԴԱԼ ՊԱՏՈՒՀԱՆ՝ ՏԱՐԻՖՆԵՐ ԵՎ ՓԱԹԵԹՆԵՐ */}
            <PricingModal
                isOpen={isPricingModalOpen}
                remainingCount={remainingCount}
                discountPercent={discountPercent}
                packages={catalogPackages}
                onClose={() => setIsPricingModalOpen(false)}
                onSelectPlan={() => {
                    setIsPricingModalOpen(false);
                    if (Number(remainingCount || 0) <= 0) {
                        openPackageEnded();
                        return;
                    }
                    setOpenAccordion('pricing');
                    alert(t('Покажите админу 2-й ID. Он активирует этот пакет в базе.'));
                }}
            />

            {/* 8. ՊՐՈՖԻԼԻ ՄՈԴԱԼ ՊԱՏՈՒՀԱՆ */}
            <ProfileModal
                isOpen={isProfileModalOpen}
                onClose={() => setIsProfileModalOpen(false)}
                userData={userData}
                remainingCount={remainingCount}
                onOpenPricing={() => {
                    if (Number(remainingCount || 0) <= 0) {
                        openPackageEnded();
                        return;
                    }
                    setIsPricingModalOpen(true);
                }}
            />

            {isPackageEmptyOpen && (
                <div className="az-pricing-overlay" onClick={() => setIsPackageEmptyOpen(false)}>
                    <div className="package-ended-card" onClick={(event) => event.stopPropagation()}>
                        <button
                            type="button"
                            className="az-modal-close"
                            onClick={() => setIsPackageEmptyOpen(false)}
                        >
                            ✕
                        </button>
                        <h3>Փաթեթը վերջացել է։ Ակտիվացրեք փաթեթը։</h3>
                        <p>Բացեք գործակալության բոտը (@Agent1AgencyBot), ընտրեք փաթեթը, հետո այնտեղից կապվեք տնօրենի հետ։</p>
                        <button
                            type="button"
                            className="btn-tg package-ended-btn"
                            onClick={openAgencyBotForPackage}
                        >
                            📦 Բացել բոտը
                        </button>
                    </div>
                </div>
            )}
        </div>
        </I18nTree>
    );
}