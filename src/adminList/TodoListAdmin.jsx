import React, { useEffect, useState } from 'react';
import { authFetch } from '../services/sessionAuth.js';
import { AGENCY_API_URL, ADMIN_API_URL } from '../services/api.js';
import { publicShareUrl } from '../agent/agencyAccount.js';
import { PACKAGES, fetchAgencyCatalog } from '../agent/packages.js';
import {
    Search,
    CheckCircle2,
    XCircle,
    Mail,
    Tag,
    Copy,
    ArrowLeft,
    Plus,
    RefreshCw,
    X,
    Check,
    Percent,
    Sparkles
} from 'lucide-react';
import './TodoListAdmin.css';
import { I18nTree, LanguageSwitch } from '../i18n/I18n.jsx';
import BrandLogo from '../brand/BrandLogo.jsx';

export { PACKAGES };

// Սկզբնական դեմո մարդիկ
const INITIAL_DEMO_USERS = [
    {
        id: 'usr-1',
        name: 'Արմեն Ղազարյան',
        email: 'armen.realty@gmail.com',
        firstId: 'AG-1ST-8821',
        secondId: 'AG-2ND-8821',
        registeredDate: '2026-09-20',
        activePackageId: 'pkg_50',
        activePackageName: '50 հայտարարություն (4,200 դրամ)',
        remainingListings: 50,
        paidAmountAMD: 4200,
        pendingSelectedPackageId: 'pkg_50'
    },
    {
        id: 'usr-2',
        name: 'Աննա Պետրոսյան',
        email: 'anna.agent@gmail.com',
        firstId: 'AG-1ST-5510',
        secondId: 'AG-2ND-5510',
        registeredDate: '2026-09-21',
        activePackageId: 'pkg_10',
        activePackageName: '10 հայտարարություն (750 դրամ)',
        remainingListings: 10,
        paidAmountAMD: 750,
        pendingSelectedPackageId: 'pkg_10'
    },
    {
        id: 'usr-3',
        name: 'Դավիթ Սարգսյան',
        email: 'davit.broker@gmail.com',
        firstId: 'AG-1ST-9904',
        secondId: 'AG-2ND-9904',
        registeredDate: '2026-09-22',
        activePackageId: 'pkg_1',
        activePackageName: '1 հայտարարություն (99 դրամ)',
        remainingListings: 1,
        paidAmountAMD: 99,
        pendingSelectedPackageId: 'pkg_1'
    },
    {
        id: 'usr-4',
        name: 'Մարիամ Գրիգորյան',
        email: 'mariam.grigoryan@gmail.com',
        firstId: 'AG-1ST-3341',
        secondId: 'AG-2ND-3341',
        registeredDate: '2026-09-22',
        activePackageId: null,
        activePackageName: null,
        remainingListings: 0,
        paidAmountAMD: 0,
        pendingSelectedPackageId: null
    },
    {
        id: 'usr-5',
        name: 'Գոռ Հակոբյան',
        email: 'gor.hakobyan77@gmail.com',
        firstId: 'AG-1ST-1192',
        secondId: 'AG-2ND-1192',
        registeredDate: '2026-09-19',
        activePackageId: null,
        activePackageName: null,
        remainingListings: 0,
        paidAmountAMD: 0,
        pendingSelectedPackageId: null
    }
];

export default function TodoListAdmin({ onBack, user = null, appLocked = false, onAppLockChange }) {
    const [users, setUsers] = useState([]);
    const [shareLinks, setShareLinks] = useState([]);
    const [canSeeShareLinks, setCanSeeShareLinks] = useState(false);
    const [adminTab, setAdminTab] = useState('users');

    const [searchQuery, setSearchQuery] = useState('');
    const [toastMessage, setToastMessage] = useState('');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    // 1. Ակտիվ հաստատված զեղչ (%-ով)
    const [discountPercent, setDiscountPercent] = useState(() => {
        try {
            const saved = localStorage.getItem('agent1_agency_discount_percent');
            if (saved) {
                const parsed = parseInt(saved, 10);
                if (!isNaN(parsed) && parsed >= 0) return parsed;
            }
        } catch (e) {
            // ignore
        }
        return 0;
    });

    // 2. Մուտքագրվող նախնական զեղչի դաշտ (մինչև «Հաստատել» սեղմելը)
    const [inputDiscount, setInputDiscount] = useState(() => {
        try {
            const saved = localStorage.getItem('agent1_agency_discount_percent');
            if (saved) {
                const parsed = parseInt(saved, 10);
                if (!isNaN(parsed) && parsed >= 0) return parsed;
            }
        } catch (e) {
            // ignore
        }
        return 0;
    });

    const isSuperAdmin = user?.role === 'super_admin';

    const handleToggleAppLock = async () => {
        if (!isSuperAdmin) {
            return;
        }

        const response = await authFetch(`${ADMIN_API_URL}/lock`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ locked: !appLocked }),
        });
        const data = await response.json().catch(() => ({}));
        if (response.ok) {
            onAppLockChange?.(Boolean(data.locked));
            setToastMessage(data.locked ? 'Ծրագիրը արգելափակված է' : 'Ծրագիրը բաց է');
            setTimeout(() => setToastMessage(''), 3500);
        }
    };

    const persistDiscount = async (num) => {
        const response = await authFetch(`${AGENCY_API_URL}/discount`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ percent: num }),
        });
        const data = await response.json().catch(() => ({}));
        const saved = Number(data.discountPercent ?? num);
        setDiscountPercent(saved);
        setInputDiscount(saved);
        try {
            localStorage.setItem('agent1_agency_discount_percent', saved.toString());
        } catch {
            // ignore
        }
        return response.ok;
    };

    const handleApplyDiscount = async () => {
        const num = Math.max(0, Math.min(90, parseInt(inputDiscount || 0, 10)));
        const ok = await persistDiscount(num);
        showToast(ok
            ? (num > 0 ? `✓ ՀԱՍՏԱՏՎԵՑ․ -${num}% զեղչը պահպանվեց բազայում` : '✓ Զեղչը հանվեց (0%)')
            : 'Զեղչը չհաջողվեց պահել բազայում');
    };

    const handleRemoveDiscount = async () => {
        const ok = await persistDiscount(0);
        showToast(ok ? '✓ Զեղչը չեղարկվեց (0% ստանդարտ գներ)' : 'Զեղչը չհաջողվեց պահել բազայում');
    };

    // Մոդալ հաստատման համար
    const [confirmModalData, setConfirmModalData] = useState(null);

    // Նոր մարդու ֆորմա
    const [newUserName, setNewUserName] = useState('');
    const [newUserEmail, setNewUserEmail] = useState('');
    const [newUserInitialPkg, setNewUserInitialPkg] = useState('none');

    const showToast = (msg) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(''), 3500);
    };

    const loadUsers = async () => {
        const response = await authFetch(`${AGENCY_API_URL}/agents`);
        const data = await response.json().catch(() => ({}));
        if (data.users) {
            setUsers(data.users);
        }
    };

    const loadShareLinks = async () => {
        const response = await authFetch(`${AGENCY_API_URL}/share-admin`);
        if (response.status === 403) {
            setCanSeeShareLinks(false);
            setShareLinks([]);
            return;
        }
        const data = await response.json().catch(() => ({}));
        if (data.links) {
            setCanSeeShareLinks(true);
            setShareLinks(data.links);
        }
    };

    useEffect(() => {
        loadUsers();
        loadShareLinks();
        fetchAgencyCatalog().then((catalog) => {
            setDiscountPercent(catalog.discountPercent || 0);
            setInputDiscount(catalog.discountPercent || 0);
        });
    }, []);

    // Ընտրել փաթեթը
    const handleSelectPackage = (userId, packageId) => {
        const updated = users.map(u => {
            if (u.id === userId) {
                return {
                    ...u,
                    pendingSelectedPackageId: packageId
                };
            }
            return u;
        });
        setUsers(updated);
    };

    // Բացել հաստատման մոդալը
    const handleOpenConfirmModal = (user, packageId) => {
        const pkg = PACKAGES.find(p => p.id === packageId);
        if (!pkg) return;
        setConfirmModalData({ user, packageType: pkg });
    };

    // Հաստատել & ակտիվացնել փաթեթը
    const executeConfirmActivation = async (userId, packageId) => {
        const pkg = PACKAGES.find(p => p.id === packageId);
        if (!pkg) return;

        const response = await authFetch(`${AGENCY_API_URL}/agents/activate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId,
                packageInfo: {
                    id: pkg.id,
                    name: `${pkg.listingsCount} հայտարարություն (${pkg.priceDisplay})`,
                    listingsCount: pkg.listingsCount,
                    priceAMD: pkg.priceAMD,
                },
            }),
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok || !data.user) {
            showToast(data.message || 'Փաթեթը չհաջողվեց պահել բազայում');
            return;
        }
        await loadUsers();
        setConfirmModalData(null);
        showToast(`✓ ՀԱՍՏԱՏՎԵՑ․ «${pkg.name}» (${pkg.priceDisplay}) պահվեց բազայում [${data.user?.secondId}]`);
    };

    const handleCancelPackage = async (userId) => {
        const targetUser = users.find(u => u.id === userId);
        await authFetch(`${AGENCY_API_URL}/agents/cancel`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId }),
        });
        await loadUsers();
        showToast(`✕ Փաթեթը չեղարկվեց [${targetUser?.secondId}]-ի համար`);
    };

    const handleAddUser = async (e) => {
        e.preventDefault();
        if (!newUserName.trim() || !newUserEmail.trim()) {
            alert('Լրացրեք անունը և Gmail-ը');
            return;
        }

        const selectedPkg = PACKAGES.find(p => p.id === newUserInitialPkg);
        const response = await authFetch(`${AGENCY_API_URL}/agents`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: newUserName.trim(),
                email: newUserEmail.trim(),
                packageInfo: selectedPkg
                    ? {
                        id: selectedPkg.id,
                        name: `${selectedPkg.listingsCount} հայտարարություն (${selectedPkg.priceDisplay})`,
                        listingsCount: selectedPkg.listingsCount,
                        priceAMD: selectedPkg.priceAMD,
                    }
                    : null,
            }),
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
            showToast(data.message || 'Չհաջողվեց ավելացնել');
            return;
        }
        await loadUsers();
        setIsAddModalOpen(false);
        setNewUserName('');
        setNewUserEmail('');
        setNewUserInitialPkg('none');
        showToast(`✓ Ավելացվեց նոր մարդ՝ ${data.user?.name} (1-ին ID՝ ${data.user?.firstId})`);
    };

    const handleCopy = async (text, message) => {
        try {
            await navigator.clipboard.writeText(text);
            showToast(message || `✓ Պատճենվեց՝ ${text}`);
        } catch {
            showToast('Չհաջողվեց պատճենել');
        }
    };

    // Վերականգնել դեմոն
    const handleResetDemo = () => {
        loadUsers();
        loadShareLinks();
        showToast('✓ Բազայից թարմացվեց');
    };

    const handleRenewShare = async (id) => {
        const response = await authFetch(`${AGENCY_API_URL}/share-admin/${id}/renew`, {
            method: 'POST',
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok || !data.share) {
            showToast(data.message || 'Չհաջողվեց թարմացնել');
            return;
        }
        await navigator.clipboard.writeText(data.share.url || publicShareUrl(data.share.token));
        await loadShareLinks();
        showToast('✓ 3 օր նորից բացվեց, հղումը պատճենվեց');
    };

    // Ֆիլտրացիա ըստ որոնման
    const filteredUsers = users.filter(u => {
        const q = searchQuery.toLowerCase().trim();
        if (!q) return true;
        return (
            u.name.toLowerCase().includes(q) ||
            u.email.toLowerCase().includes(q) ||
            u.secondId.toLowerCase().includes(q)
        );
    });

    return (
        <I18nTree>
        <div className="todo-container">
            <div className="todo-wrapper">
                {/* ՎԵՐԻՆ ԳԼԽԱՄԱՍ */}
                <div className="todo-header">
                    <div className="todo-header-left">
                        <button type="button" onClick={onBack} className="btn-back-home">
                            <ArrowLeft style={{ width: 16, height: 16 }} />
                            <span>Գլխավոր</span>
                        </button>
                        <BrandLogo className="todo-brand-logo" />

                        <div className="todo-title-group">
                            <h1>
                                ToDo List • Փաթեթների Ընտրություն & Հաստատում
                                <span className="badge-official">Official Rates</span>
                            </h1>
                            <p className="todo-subtitle">
                                Ընտրեք փաթեթը (99֏ / 750֏ / 4,200֏) և սեղմեք <strong>«Հաստատել»</strong> կոճակը ակտիվացման համար
                            </p>
                        </div>
                    </div>

                    <div className="todo-header-actions">
                        <LanguageSwitch compact />
                        {isSuperAdmin && (
                            <button
                                type="button"
                                onClick={handleToggleAppLock}
                                className="btn-add-user"
                                style={{
                                    background: appLocked ? '#b91c1c' : '#1e3a5f',
                                    borderColor: appLocked ? '#f87171' : '#64748b',
                                    color: '#fff',
                                }}
                            >
                                {appLocked ? 'Բացել ծրագիրը' : 'Արգելափակել ծրագիրը'}
                            </button>
                        )}
                        <button
                            type="button"
                            onClick={() => setAdminTab('users')}
                            className="btn-add-user"
                            style={{ opacity: adminTab === 'users' ? 1 : 0.6 }}
                        >
                            Մարդիկ
                        </button>
                        {canSeeShareLinks && (
                        <button
                            type="button"
                            onClick={() => {
                                setAdminTab('links');
                                loadShareLinks();
                            }}
                            className="btn-add-user"
                            style={{ opacity: adminTab === 'links' ? 1 : 0.6 }}
                        >
                            Հղումներ
                        </button>
                        )}
                        <button type="button" onClick={() => setIsAddModalOpen(true)} className="btn-add-user">
                            <Plus style={{ width: 16, height: 16 }} />
                            <span>+ Ավելացնել մարդ</span>
                        </button>

                        <button type="button" onClick={handleResetDemo} className="btn-reset-demo" title="Վերականգնել դեմոն">
                            <RefreshCw style={{ width: 16, height: 16 }} />
                        </button>
                    </div>
                </div>

                {/* ԾԱՆՈՒՑՈՒՄ (TOAST) */}
                {toastMessage && (
                    <div className="toast-notification">
                        <CheckCircle2 style={{ width: 20, height: 20 }} />
                        <span>{toastMessage}</span>
                    </div>
                )}

                {adminTab === 'users' && (
                <div className="search-wrapper">
                    <Search className="search-icon" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Որոնել ըստ Անվան, Gmail-ի կամ Գործակալի 2-րդ ID-ի (օր. AG-2ND)..."
                        className="search-input"
                    />
                    {searchQuery && (
                        <button type="button" onClick={() => setSearchQuery('')} className="btn-clear-search">
                            ✕
                        </button>
                    )}
                </div>
                )}

                {/* ԶԵՂՉԵՐԻ ԿԱՌԱՎԱՐՄԱՆ ԴԱՇՏ (ՀԱՍՏԱՏԵԼՈՒ ԵՎ ՉԵՂԱՐԿԵԼՈՒ ՀՆԱՐԱՎՈՐՈՒԹՅԱՄԲ) */}
                <div style={{
                    background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.12) 0%, rgba(220, 38, 38, 0.05) 100%)',
                    border: '1px solid rgba(239, 68, 68, 0.35)',
                    borderRadius: '16px',
                    padding: '16px 20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '16px',
                    flexWrap: 'wrap',
                    boxShadow: '0 4px 20px rgba(239, 68, 68, 0.15)'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                            width: '42px',
                            height: '42px',
                            borderRadius: '12px',
                            background: 'linear-gradient(135deg, #ef4444, #b91c1c)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#fff',
                            boxShadow: '0 4px 12px rgba(239, 68, 68, 0.4)',
                            flexShrink: 0
                        }}>
                            <Percent style={{ width: 22, height: 22 }} />
                        </div>
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                <span style={{ fontWeight: 800, color: '#ffffff', fontSize: '15px' }}>
                                    Համակարգային Զեղչ Փաթեթների Վրա
                                </span>
                                {discountPercent > 0 ? (
                                    <span style={{
                                        background: '#ef4444',
                                        color: '#fff',
                                        fontSize: '11px',
                                        fontWeight: 900,
                                        padding: '2px 9px',
                                        borderRadius: '12px',
                                        letterSpacing: '0.05em'
                                    }}>
                                        🔥 -{discountPercent}% ՀԱՍՏԱՏՎԱԾ Է
                                    </span>
                                ) : (
                                    <span style={{
                                        background: 'rgba(148, 163, 184, 0.2)',
                                        color: '#94a3b8',
                                        fontSize: '11px',
                                        fontWeight: 700,
                                        padding: '2px 8px',
                                        borderRadius: '12px'
                                    }}>
                                        Զեղչ ակտիվ չէ (0%)
                                    </span>
                                )}
                            </div>
                            <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#cbd5e1' }}>
                                Ընտրեք զեղչի տոկոսը (%) և սեղմեք <strong>«✓ Հաստատել զեղչը»</strong>։ Ավտոմատ կակտիվանա նաև Գործակալության (Agency) բաժնի բոլոր փաթեթներում։
                            </p>
                        </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                        {/* Տոկոսի դաշտ */}
                        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                            <input
                                type="number"
                                min="0"
                                max="90"
                                value={inputDiscount === 0 ? '' : inputDiscount}
                                onChange={(e) => setInputDiscount(e.target.value === '' ? 0 : Math.max(0, Math.min(90, parseInt(e.target.value, 10) || 0)))}
                                placeholder="0"
                                style={{
                                    width: '85px',
                                    padding: '8px 24px 8px 12px',
                                    background: '#091322',
                                    border: '1.5px solid #ef4444',
                                    borderRadius: '10px',
                                    color: '#ffffff',
                                    fontWeight: 'bold',
                                    fontSize: '15px',
                                    textAlign: 'center',
                                    outline: 'none'
                                }}
                            />
                            <span style={{ position: 'absolute', right: '10px', color: '#ef4444', fontWeight: 'bold' }}>%</span>
                        </div>

                        {/* Արագ ընտրության կոճակներ */}
                        <div style={{ display: 'flex', gap: '5px' }}>
                            {[10, 20, 30, 50].map((pct) => (
                                <button
                                    key={pct}
                                    type="button"
                                    onClick={() => setInputDiscount(pct)}
                                    style={{
                                        background: inputDiscount === pct ? '#ef4444' : 'rgba(239, 68, 68, 0.15)',
                                        color: inputDiscount === pct ? '#fff' : '#fca5a5',
                                        border: '1px solid rgba(239, 68, 68, 0.4)',
                                        padding: '7px 11px',
                                        borderRadius: '8px',
                                        fontSize: '11px',
                                        fontWeight: 800,
                                        cursor: 'pointer',
                                        transition: 'all 0.15s'
                                    }}
                                >
                                    -{pct}%
                                </button>
                            ))}
                        </div>

                        {/* ՀԱՍՏԱՏԵԼ ԶԵՂՉԸ ԿՈՃԱԿ */}
                        <button
                            type="button"
                            onClick={handleApplyDiscount}
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px',
                                background: 'linear-gradient(135deg, #10b981, #059669)',
                                color: '#ffffff',
                                border: 'none',
                                padding: '9px 16px',
                                borderRadius: '10px',
                                fontSize: '13px',
                                fontWeight: 800,
                                cursor: 'pointer',
                                boxShadow: '0 4px 14px rgba(16, 185, 129, 0.4)',
                                transition: 'all 0.15s'
                            }}
                        >
                            <Check style={{ width: 16, height: 16 }} />
                            <span>✓ Հաստատել զեղչը</span>
                        </button>

                        {/* ՉԵՂԱՐԿԵԼ / ՀԱՆԵԼ ԶԵՂՉԸ ԿՈՃԱԿ */}
                        {(discountPercent > 0 || inputDiscount > 0) && (
                            <button
                                type="button"
                                onClick={handleRemoveDiscount}
                                style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    background: 'rgba(239, 68, 68, 0.2)',
                                    border: '1.5px solid #ef4444',
                                    color: '#ff6b6b',
                                    padding: '9px 16px',
                                    borderRadius: '10px',
                                    fontSize: '13px',
                                    fontWeight: 800,
                                    cursor: 'pointer',
                                    boxShadow: '0 4px 14px rgba(239, 68, 68, 0.25)',
                                    transition: 'all 0.15s'
                                }}
                                title="Չեղարկել զեղչը և վերադարձնել ստանդարտ գները (0%)"
                            >
                                <X style={{ width: 16, height: 16 }} />
                                <span>✕ Չեղարկել զեղչը</span>
                            </button>
                        )}
                    </div>
                </div>

                {/* 3 ՓԱԹԵԹՆԵՐԻ ԳՆԱՑՈՒՑԱԿԸ */}
                <div className="rates-grid">
                    {/* 1 Объявление */}
                    <div className="rate-card rate-card-1">
                        <div>
                            <span className="badge-pkg-1">1 объявление</span>
                            <span className="rate-subtext">Մեկանգամյա հայտարարություն</span>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            {discountPercent > 0 ? (
                                <>
                                    <div style={{ textDecoration: 'line-through', fontSize: '0.75rem', color: '#94a3b8' }}>
                                        99 դրամ
                                    </div>
                                    <span className="rate-price-1" style={{ color: '#ef4444' }}>
                                        {Math.round(99 * (1 - discountPercent / 100))} դրամ
                                    </span>
                                </>
                            ) : (
                                <span className="rate-price-1">99 դրամ</span>
                            )}
                            <span className="rate-per-unit">
                                {discountPercent > 0 ? `${Math.round(99 * (1 - discountPercent / 100))} ֏ / հատ` : '99 ֏ / հատ'}
                            </span>
                        </div>
                    </div>

                    {/* 10 Объявление */}
                    <div className="rate-card rate-card-10">
                        <div>
                            <span className="badge-pkg-10">10 объявление</span>
                            <span className="rate-subtext">10 հատ մաքուր օբյեկտ</span>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            {discountPercent > 0 ? (
                                <>
                                    <div style={{ textDecoration: 'line-through', fontSize: '0.75rem', color: '#94a3b8' }}>
                                        750 դրամ
                                    </div>
                                    <span className="rate-price-10" style={{ color: '#ef4444' }}>
                                        {Math.round(750 * (1 - discountPercent / 100))} դրամ
                                    </span>
                                </>
                            ) : (
                                <span className="rate-price-10">750 դրամ</span>
                            )}
                            <span className="rate-per-unit">
                                {discountPercent > 0 ? `${Math.round(750 * (1 - discountPercent / 100) / 10)} ֏ / հատ` : '75 ֏ / հատ'}
                            </span>
                        </div>
                    </div>

                    {/* 50 Объявление */}
                    <div className="rate-card rate-card-50">
                        <div>
                            <span className="badge-pkg-50">50 объявление</span>
                            <span className="rate-subtext">50 հատ մաքուր օբյեկտ</span>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            {discountPercent > 0 ? (
                                <>
                                    <div style={{ textDecoration: 'line-through', fontSize: '0.75rem', color: '#94a3b8' }}>
                                        4,200 դրամ
                                    </div>
                                    <span className="rate-price-50" style={{ color: '#ef4444' }}>
                                        {Math.round(4200 * (1 - discountPercent / 100)).toLocaleString()} դրամ
                                    </span>
                                </>
                            ) : (
                                <span className="rate-price-50">4,200 դրամ</span>
                            )}
                            <span className="rate-per-unit">
                                {discountPercent > 0 ? `${Math.round(4200 * (1 - discountPercent / 100) / 50)} ֏ / հատ` : '84 ֏ / հատ'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* ԻՆՖՈ ԲԼՈԿ */}
                <div className="info-instruction-bar">
                    <span className="pulse-dot" />
                    <span>
                        💡 <strong>Քայլ 1․</strong> Ընտրեք 3 փաթեթներից մեկը (1, 10 կամ 50) ➔ <strong>Քայլ 2․</strong> Սեղմեք կանաչ <strong>«✓ Հաստատել»</strong> կոճակը։
                    </span>
                </div>

                {adminTab === 'links' && canSeeShareLinks && (
                    <div className="user-list">
                        {shareLinks.length === 0 ? (
                            <div className="empty-state">Դեռ հղում չկա։ Քարտից սեղմեք «Ссылка»։</div>
                        ) : (
                            shareLinks.map((link) => {
                                const webUrl = link.url || publicShareUrl(link.token);
                                const appUrl = link.appUrl || `agent1://house/${link.houseId || '0'}/${link.token}`;
                                return (
                                <div key={link.id} className="info-instruction-bar share-link-row">
                                    <strong>Agent_1 • տուն #{link.houseId || '—'}</strong>
                                    <span>{link.title || link.kind}</span>
                                    {link.address ? <span>{link.address}</span> : null}
                                    <span>Մեր Gmail-ներին՝ միշտ ակտիվ</span>
                                    <span>Մյուսներին՝ {link.expired ? '3 օրը լրացել է' : '3 օր ակտիվ'}</span>
                                    <a href={webUrl} target="_blank" rel="noreferrer">
                                        {webUrl}
                                    </a>
                                    <a href={appUrl}>{appUrl}</a>
                                    <button
                                        type="button"
                                        className="btn-add-user"
                                        onClick={() => handleCopy(webUrl, '✓ Հեռախոսի հղումը պատճենվեց')}
                                    >
                                        Պատճենել հղումը
                                    </button>
                                    <button
                                        type="button"
                                        className="btn-add-user"
                                        onClick={() => handleCopy(appUrl, '✓ Agent_1 ծրագրի հղումը պատճենվեց')}
                                    >
                                        Agent_1 ծրագրի հղում
                                    </button>
                                    <button type="button" className="btn-add-user" onClick={() => handleRenewShare(link.id)}>
                                        Նորից ուղարկել (3 օր)
                                    </button>
                                </div>
                                );
                            })
                        )}
                    </div>
                )}

                {adminTab === 'users' && (
                <div className="user-list">
                    {filteredUsers.length === 0 ? (
                        <div className="empty-state">
                            Գրանցված մարդ չի գտնվել որոնմանը համապատասխան:
                        </div>
                    ) : (
                        filteredUsers.map((user) => {
                            const remainingEmpty = Number(user.remainingListings || 0) <= 0;
                            const pendingId = user.pendingSelectedPackageId || null;
                            const confirmPkgId = pendingId
                                && (pendingId !== user.activePackageId || remainingEmpty)
                                ? pendingId
                                : (remainingEmpty && user.activePackageId ? user.activePackageId : null);
                            const isPendingChanged = Boolean(confirmPkgId);

                            return (
                                <div
                                    key={user.id}
                                    className={`user-card ${isPendingChanged ? 'has-pending' : ''}`}
                                >
                                    {/* ՁԱԽ ԿՈՂՄ՝ ՄԱՐԴՈՒ ԻՆՖՈ */}
                                    <div className="user-info-section">
                                        <div className="user-name-row">
                                            <span className="user-name">{user.name}</span>

                                            {/* ԳՈՐԾԱԿԱԼԻ 2-ՐԴ ID */}
                                            {user.firstId ? (
                                                <button
                                                    type="button"
                                                    onClick={() => handleCopy(user.firstId)}
                                                    className="second-id-badge"
                                                    title="1-ին ID՝ գրանցում"
                                                >
                                                    <span>{user.firstId}</span>
                                                    <Copy style={{ width: 12, height: 12, opacity: 0.7 }} />
                                                </button>
                                            ) : null}
                                            <button
                                                type="button"
                                                onClick={() => handleCopy(user.secondId)}
                                                className="second-id-badge"
                                                title="2-րդ ID՝ փաթեթի ակտիվացում"
                                            >
                                                <span>{user.secondId}</span>
                                                <Copy style={{ width: 12, height: 12, opacity: 0.7 }} />
                                            </button>
                                        </div>

                                        <div className="user-details-row">
                                            <span className="user-email">
                                                <Mail style={{ width: 12, height: 12 }} />
                                                {user.email}
                                            </span>
                                            <span>•</span>
                                            <span>Գրանցված՝ {user.registeredDate}</span>
                                        </div>

                                        {/* ԱԿՏԻՎ ՓԱԹԵԹԻ ԿԱՐԳԱՎԻՃԱԿ */}
                                        <div className="active-status-bar">
                                            {user.activePackageId ? (
                                                <div className="active-pkg-pill">
                                                    <span className="status-indicator active" />
                                                    <span className="active-pkg-text">
                                                        Ակտիվ փաթեթ՝ <strong>{user.activePackageName}</strong>
                                                    </span>
                                                    <span className="remaining-count-badge">
                                                        {remainingEmpty
                                                            ? 'Սպառված է — նորից հաստատել'
                                                            : <>Մնացել է՝ <strong>{user.remainingListings}</strong></>}
                                                    </span>
                                                </div>
                                            ) : (
                                                <div className="inactive-pkg-pill">
                                                    <span className="status-indicator inactive" />
                                                    <span>Փաթեթ ընտրված չէ (0 հայտարարություն)</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* ԱՋ ԿՈՂՄ՝ ՓԱԹԵԹՆԵՐԻ ԸՆՏՐՈՒԹՅՈՒՆ ԵՎ ՀԱՍՏԱՏՈՒՄ */}
                                    <div className="actions-section">
                                        <div className="select-pkg-group">
                                            <div className="select-pkg-label">
                                                <Tag style={{ width: 12, height: 12 }} />
                                                <span>Ընտրել փաթեթը՝</span>
                                            </div>

                                            {/* 3 ԿՈՃԱԿՆԵՐ */}
                                            <div className="package-buttons-row">
                                                {PACKAGES.map((pkg) => {
                                                    const isSelected = (pendingId || confirmPkgId) === pkg.id;
                                                    const isCurrentActive = user.activePackageId === pkg.id;

                                                    return (
                                                        <button
                                                            key={pkg.id}
                                                            type="button"
                                                            onClick={() => handleSelectPackage(user.id, pkg.id)}
                                                            className={`btn-pkg-choice ${pkg.id} ${isSelected ? pkg.activeBtnClass : ''}`}
                                                        >
                                                            <div className="pkg-name">{pkg.name}</div>
                                                            <div className="pkg-price">{pkg.priceDisplay}</div>
                                                            {isCurrentActive && (
                                                                <span className="current-active-tag">Ակտիվ է</span>
                                                            )}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>

                                        {/* ՀԱՍՏԱՏԵԼ / ՉԵՂԱՐԿԵԼ ԿՈՃԱԿՆԵՐ */}
                                        <div className="decision-buttons-row">
                                            {/* ՀԱՍՏԱՏԵԼ ԿՈՃԱԿ */}
                                            {confirmPkgId && isPendingChanged && (
                                                <button
                                                    type="button"
                                                    onClick={() => handleOpenConfirmModal(user, confirmPkgId)}
                                                    className="btn-confirm-action"
                                                >
                                                    <Check style={{ width: 14, height: 14 }} />
                                                    <span>Հաստատել փաթեթը</span>
                                                </button>
                                            )}

                                            {/* ՉԵՂԱՐԿԵԼ */}
                                            {user.activePackageId && (
                                                <button
                                                    type="button"
                                                    onClick={() => handleCancelPackage(user.id)}
                                                    className="btn-cancel-action"
                                                >
                                                    <XCircle style={{ width: 14, height: 14 }} />
                                                    <span>Չեղարկել</span>
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
                )}
            </div>

            {/* ՄՈԴԱԼ 1: ՀԱՍՏԱՏՄԱՆ ՊԱՏՈՒՀԱՆ */}
            {confirmModalData && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <div className="modal-title-group">
                                <div className="modal-icon-wrap">
                                    <Check style={{ width: 20, height: 20 }} />
                                </div>
                                <h3>Հաստատե՞լ Փաթեթի Ակտիվացումը</h3>
                            </div>
                            <button
                                type="button"
                                onClick={() => setConfirmModalData(null)}
                                className="modal-btn-close"
                            >
                                <X style={{ width: 18, height: 18 }} />
                            </button>
                        </div>

                        <div className="modal-body">
                            <p className="modal-text">
                                Դուք պատրաստվում եք ակտիվացնել հետևյալ փաթեթը գործակալի հաշվին՝
                            </p>

                            <div className="modal-user-summary">
                                <div>
                                    <div className="summary-name">{confirmModalData.user.name}</div>
                                    <div className="summary-email">{confirmModalData.user.email}</div>
                                </div>
                                <span className="second-id-badge">{confirmModalData.user.secondId}</span>
                            </div>

                            <div className="modal-package-summary">
                                <div>
                                    <div className="pkg-summary-title">{confirmModalData.packageType.name}</div>
                                    <div className="pkg-summary-count">
                                        {confirmModalData.packageType.listingsCount} լիարժեք հայտարարություն
                                    </div>
                                </div>
                                <div className="pkg-summary-price">
                                    {confirmModalData.packageType.priceDisplay}
                                </div>
                            </div>
                        </div>

                        <div className="modal-footer">
                            <button
                                type="button"
                                onClick={() => setConfirmModalData(null)}
                                className="modal-btn-secondary"
                            >
                                Չեղարկել
                            </button>
                            <button
                                type="button"
                                onClick={() => executeConfirmActivation(
                                    confirmModalData.user.id,
                                    confirmModalData.packageType.id
                                )}
                                className="modal-btn-primary"
                            >
                                Այո, Հաստատել & Ակտիվացնել
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ՄՈԴԱԼ 2: ԱՎԵԼԱՑՆԵԼ ՆՈՐ ՄԱՐԴ */}
            {isAddModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3>+ Ավելացնել Նոր Մարդ (Գործակալ)</h3>
                            <button
                                type="button"
                                onClick={() => setIsAddModalOpen(false)}
                                className="modal-btn-close"
                            >
                                <X style={{ width: 18, height: 18 }} />
                            </button>
                        </div>

                        <form onSubmit={handleAddUser}>
                            <div className="modal-body">
                                <div className="form-group">
                                    <label>Անուն Ազգանուն</label>
                                    <input
                                        type="text"
                                        required
                                        value={newUserName}
                                        onChange={(e) => setNewUserName(e.target.value)}
                                        placeholder="օր. Արամ Կարապետյան"
                                        className="form-input"
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Gmail / Էլ. փոստ</label>
                                    <input
                                        type="email"
                                        required
                                        value={newUserEmail}
                                        onChange={(e) => setNewUserEmail(e.target.value)}
                                        placeholder="օր. aram.agent@gmail.com"
                                        className="form-input"
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Նախնական Փաթեթ (ըստ ցանկության)</label>
                                    <select
                                        value={newUserInitialPkg}
                                        onChange={(e) => setNewUserInitialPkg(e.target.value)}
                                        className="form-input"
                                    >
                                        <option value="none">Առանց փաթեթի (0 հայտարարություն)</option>
                                        {PACKAGES.map(p => (
                                            <option key={p.id} value={p.id}>
                                                {p.name} — {p.priceDisplay}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="id-auto-note">
                                    ℹ️ Գործակալի <strong>2-րդ ID-ն</strong> (օր. AG-2ND-XXXX) կգեներացվի ավտոմատ։
                                </div>
                            </div>

                            <div className="modal-footer">
                                <button
                                    type="button"
                                    onClick={() => setIsAddModalOpen(false)}
                                    className="modal-btn-secondary"
                                >
                                    Փակել
                                </button>
                                <button
                                    type="submit"
                                    className="modal-btn-primary"
                                >
                                    Պահպանել & Ավելացնել
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
        </I18nTree>
    );
}