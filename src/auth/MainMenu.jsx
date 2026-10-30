
import { useEffect, useState } from 'react'
import { usePersistentState } from '../services/uiSession.js'
import {
    Home as HomeIcon,
    Briefcase,
    ArrowRight,
    Check,
    CheckCircle2,
    Zap
} from 'lucide-react'

import "./MainMenu.css"

// =========================================================
// HEADER
// =========================================================

import Header from "./Header.jsx"
import { I18nTree } from "../i18n/I18n.jsx"
import { ADMIN_API_URL } from "../services/api.js"
import { authFetch } from "../services/sessionAuth.js"

// =========================================================
// ADMIN PANEL
// =========================================================

import TodoListAdmin from "../adminList/TodoListAdmin.jsx"


// =========================================================================
// 🖼️ ՆԿԱՐՆԵՐ
// =========================================================================

const HOUSES_IMAGE_URL =
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=900&q=80'

const AGENCY_IMAGE_URL = '/images/level-home-logo.jpg'


// =========================================================================
// MAIN MENU
// =========================================================================

export default function MainMenu({
                                     user,
                                     appLocked = false,
                                     onAppLockChange,
                                     onSelectHouses,
                                     onSelectAgency,
                                     onSelectActivation,
                                     onLogout
                                 }) {

    const [selectedChoice, setSelectedChoice] = usePersistentState(
        'main-menu-choice',
        null
    )

    // =========================================================
    // ADMIN PANEL STATE
    // =========================================================

    const [showAdminPanel, setShowAdminPanel] = usePersistentState(
        'main-menu-admin',
        false
    )


    // =========================================================
    // ADMIN / SUPER ADMIN CHECK
    // =========================================================

    const isAdmin =
        user?.role === "admin" ||
        user?.role === "super_admin"

    const [lockAllowed, setLockAllowed] = useState(user?.role === "super_admin")
    const isSuperAdmin = user?.role === "super_admin" || lockAllowed

    useEffect(() => {
        if (!user) {
            setLockAllowed(false)
            return
        }

        authFetch(`${ADMIN_API_URL}/lock`)
            .then((response) => {
                if (!response.ok) {
                    setLockAllowed(false)
                    return null
                }
                return response.json()
            })
            .then((data) => {
                if (data) {
                    setLockAllowed(true)
                    onAppLockChange?.(Boolean(data.locked))
                }
            })
            .catch(() => setLockAllowed(false))
    }, [user])

    const handleToggleAppLock = async () => {
        if (!isSuperAdmin) {
            return
        }

        const next = !appLocked
        const response = await authFetch(`${ADMIN_API_URL}/lock`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ locked: next }),
        })
        const data = await response.json().catch(() => ({}))
        if (response.ok) {
            onAppLockChange?.(Boolean(data.locked))
        }
    }


    // =========================================================================
    // TEXT
    // =========================================================================

    const t = {
        heading: 'Ընտրեք Բաժինը',
        subheading: 'Ուղիղ ընտրություն՝ Տներ կամ Գործակալություն',

        // ---------------------------------------------------------------------
        // ՏՆԵՐ
        // ---------------------------------------------------------------------

        housesBadge: '1-ին Բաժին',

        housesTitle: 'Տներ',

        housesSubtitle:
            'Բնակարաններ և Առանձնատներ',

        housesDesc:
            'Հարյուրավոր թարմ առաջարկներ՝ վաճառք, երկարաժամկետ և օրավարձով բնակարաններ ու տներ։',

        housesPoint1:
            'Վաճառք և վարձակալություն Երևանում ու մարզերում',

        housesPoint2:
            'Մանրամասն պարամետրեր, գներ և որակյալ նկարներ',

        housesPoint3:
            'Ուղիղ կապ և հարմար որոնում ըստ թաղամասերի',

        housesAction:
            'Ընտրել Տների Բաժինը',

        housesSelected:
            'Ընտրված է՝ Տների Բաժին',


        // ---------------------------------------------------------------------
        // ԳՈՐԾԱԿԱԼՈՒԹՅՈՒՆ
        // ---------------------------------------------------------------------

        agencyBadge: '2-րդ Բաժին',

        agencyTitle:
            'Գործակալություն',

        agencySubtitle:
            'Անշարժ Գույքի Ծառայություններ',

        agencyDesc:
            'Հանձնեք Ձեր գույքը վաճառքի կամ վարձակալության, ստացեք գնահատում և փաստաթղթային աջակցություն։',

        agencyPoint1:
            'Հանձնեք Ձեր գույքը մեր պրոֆեսիոնալ բազա',

        agencyPoint2:
            'Անվճար շուկայական գնահատում և խորհրդատվություն',

        agencyPoint3:
            'Լիարժեք իրավաբանական և նոտարական ապահովում',

        agencyAction:
            'Ընտրել Գործակալության Բաժինը',

        agencySelected:
            'Ընտրված է՝ Գործակալության Բաժին',


        // ---------------------------------------------------------------------
        // SELECTION
        // ---------------------------------------------------------------------

        activeChoiceBanner:
            'Ձեր ընթացիկ ընտրությունը',

        changeChoice:
            'Փոխել ընտրությունը'
    }


    // =========================================================================
    // ՏՆԵՐ → PROPERTY TYPE
    // =========================================================================

    const handleHousesClick = () => {

        setSelectedChoice('houses')

        if (onSelectHouses) {
            onSelectHouses()
        }
    }


    // =========================================================================
    // ԳՈՐԾԱԿԱԼՈՒԹՅՈՒՆ → HOME
    // =========================================================================

    const handleAgencyClick = () => {

        setSelectedChoice('agency')

        if (onSelectAgency) {
            onSelectAgency()
        }
    }


    // =========================================================================
    // ADMIN PANEL
    // =========================================================================

    const handleAdminPanelClick = () => {

        // Անվտանգության առաջին frontend ստուգում
        if (!isAdmin) {
            return
        }

        if (onSelectActivation) {
            onSelectActivation()
            return
        }

        setShowAdminPanel(true)
    }


    // =========================================================================
    // ADMIN PANEL → MAIN MENU
    // =========================================================================

    const handleBackFromAdmin = () => {

        setShowAdminPanel(false)
    }


    // =========================================================================
    // ADMIN PANEL
    // =========================================================================

    if (showAdminPanel) {

        return (
            <TodoListAdmin
                onBack={handleBackFromAdmin}
            />
        )
    }


    // =========================================================================
    // RENDER MAIN MENU
    // =========================================================================

    return (
        <I18nTree>
        <>
            {/* =========================================================
                HEADER — ՑՈՒՑԱԴՐՎՈՒՄ Է ՄԻԱՅՆ ՀԻՄՆԱԿԱՆ ՄԵՆՅՈՒՈՒՄ
            ========================================================= */}

            <Header
                user={user}
                onLogout={onLogout}
            />


            <div className="main-menu-wrapper">

                {/* ---------------------------------------------------------------
                    BACKGROUND GLOW
                --------------------------------------------------------------- */}

                <div className="bg-glow top-glow" />

                <div className="bg-glow bottom-glow" />


                <div className="main-menu-container">


                    {/* =========================================================
                        TOP ROW
                    ========================================================= */}

                    {(isAdmin || isSuperAdmin) && (
                    <div
                        className="menu-top-row"
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'flex-end',
                            gap: '10px',
                            flexWrap: 'wrap'
                        }}
                    >

                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                marginLeft: 'auto'
                            }}
                        >


                            {/* =========================================================
                                ⚡ ADMIN / SUPER ADMIN
                            ========================================================= */}

                            {isSuperAdmin && (
                                <button
                                    type="button"
                                    onClick={handleToggleAppLock}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                        background: appLocked
                                            ? 'linear-gradient(135deg, #b91c1c 0%, #dc2626 100%)'
                                            : 'linear-gradient(135deg, #1e3a5f 0%, #334155 100%)',
                                        color: '#ffffff',
                                        border: appLocked ? '1px solid #f87171' : '1px solid #64748b',
                                        padding: '6px 14px',
                                        borderRadius: '10px',
                                        fontSize: '12px',
                                        fontWeight: '800',
                                        cursor: 'pointer',
                                        letterSpacing: '0.02em'
                                    }}
                                    title="Միայն Super Admin"
                                >
                                    {appLocked ? 'Բացել ծրագիրը' : 'Արգելափակել ծրագիրը'}
                                </button>
                            )}

                            {isAdmin && (

                                <button
                                    type="button"
                                    onClick={handleAdminPanelClick}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                        background:
                                            'linear-gradient(135deg, #059669 0%, #0d9488 100%)',
                                        color: '#ffffff',
                                        border: '1px solid #10b981',
                                        padding: '6px 14px',
                                        borderRadius: '10px',
                                        fontSize: '12px',
                                        fontWeight: '800',
                                        cursor: 'pointer',
                                        boxShadow:
                                            '0 4px 12px rgba(16, 185, 129, 0.3)',
                                        transition: 'all 0.2s ease',
                                        letterSpacing: '0.02em'
                                    }}
                                    title="Գործակալների 2-րդ ID-ների և Փաթեթների Ակտիվացում"
                                >

                                    <Zap
                                        style={{
                                            width: 14,
                                            height: 14,
                                            color: '#fef08a'
                                        }}
                                    />

                                    <span>
                                        Ակտիվացում
                                    </span>

                                    <span
                                        style={{
                                            fontSize: '10px',
                                            background: 'rgba(0,0,0,0.25)',
                                            padding: '1px 6px',
                                            borderRadius: '4px',
                                            border: '1px solid rgba(255,255,255,0.2)'
                                        }}
                                    >
                                        Admin
                                    </span>

                                </button>

                            )}

                        </div>

                    </div>
                    )}


                    {/* =========================================================
                        HEADING
                    ========================================================= */}

                    <div className="menu-heading-area">

                        <h1 className="menu-title">
                            {t.heading}
                        </h1>

                        <p className="menu-subtitle">
                            {t.subheading}
                        </p>

                    </div>


                    {/* =========================================================
                        SELECTED BANNER
                    ========================================================= */}

                    {selectedChoice && (

                        <div className="active-selection-banner">

                            <div className="banner-content">

                                <CheckCircle2 className="banner-icon" />

                                <span>

                                    {t.activeChoiceBanner}:{' '}

                                    <strong className="accent-highlight">

                                        {selectedChoice === 'houses'
                                            ? t.housesTitle
                                            : t.agencyTitle
                                        }

                                    </strong>

                                </span>

                            </div>


                            <button
                                type="button"
                                onClick={() =>
                                    setSelectedChoice(null)
                                }
                                className="banner-reset-btn"
                            >
                                {t.changeChoice}
                            </button>

                        </div>

                    )}


                    {/* =========================================================
                        CHOICES GRID
                    ========================================================= */}

                    <div className="choices-grid">


                        {/* =====================================================
                            1. ՏՆԵՐ
                        ===================================================== */}

                        <div
                            onClick={handleHousesClick}
                            className={`choice-card ${
                                selectedChoice === 'houses'
                                    ? 'selected'
                                    : ''
                            }`}
                        >

                            <div className="choice-card-content">

                                <div className="badge-row">

                                    <div className="pill-badge">

                                        <span className="dot-cyan" />

                                        <span>
                                            {t.housesBadge}
                                        </span>

                                    </div>


                                    {selectedChoice === 'houses' && (

                                        <span className="status-selected-pill">

                                            <Check className="check-mini-icon" />

                                            <span>
                                                Ընտրված է
                                            </span>

                                        </span>

                                    )}

                                </div>


                                <div className="image-preview-box">

                                    {HOUSES_IMAGE_URL ? (

                                        <img
                                            src={HOUSES_IMAGE_URL}
                                            alt="Houses & Apartments"
                                            className="preview-img"
                                            referrerPolicy="no-referrer"
                                        />

                                    ) : (

                                        <div className="placeholder-icon-box">

                                            <HomeIcon className="placeholder-icon" />

                                        </div>

                                    )}

                                    <div className="img-overlay-gradient" />

                                    <div className="img-bottom-tag">

                                        <HomeIcon className="tag-icon" />

                                        <span>
                                            {t.housesSubtitle}
                                        </span>

                                    </div>

                                </div>


                                <h2 className="choice-title">
                                    {t.housesTitle}
                                </h2>


                                <p className="choice-desc">
                                    {t.housesDesc}
                                </p>


                                <div className="points-list">

                                    <div className="point-item">

                                        <div className="checkbox-icon-box">

                                            <Check className="check-svg" />

                                        </div>

                                        <span>
                                            {t.housesPoint1}
                                        </span>

                                    </div>


                                    <div className="point-item">

                                        <div className="checkbox-icon-box">

                                            <Check className="check-svg" />

                                        </div>

                                        <span>
                                            {t.housesPoint2}
                                        </span>

                                    </div>


                                    <div className="point-item">

                                        <div className="checkbox-icon-box">

                                            <Check className="check-svg" />

                                        </div>

                                        <span>
                                            {t.housesPoint3}
                                        </span>

                                    </div>

                                </div>

                            </div>


                            <button
                                type="button"
                                onClick={(e) => {

                                    e.stopPropagation()

                                    handleHousesClick()

                                }}
                                className={`choice-btn ${
                                    selectedChoice === 'houses'
                                        ? 'active-btn'
                                        : 'houses-btn'
                                }`}
                            >

                                <HomeIcon className="btn-icon" />

                                <span>

                                    {selectedChoice === 'houses'
                                        ? t.housesSelected
                                        : t.housesAction
                                    }

                                </span>

                                <ArrowRight className="btn-arrow" />

                            </button>

                        </div>


                        {/* =====================================================
                            2. ԳՈՐԾԱԿԱԼՈՒԹՅՈՒՆ
                        ===================================================== */}

                        <div
                            onClick={handleAgencyClick}
                            className={`choice-card ${
                                selectedChoice === 'agency'
                                    ? 'selected'
                                    : ''
                            }`}
                        >

                            <div className="choice-card-content">

                                <div className="badge-row">

                                    <div className="pill-badge">

                                        <span className="dot-cyan" />

                                        <span>
                                            {t.agencyBadge}
                                        </span>

                                    </div>


                                    {selectedChoice === 'agency' && (

                                        <span className="status-selected-pill">

                                            <Check className="check-mini-icon" />

                                            <span>
                                                Ընտրված է
                                            </span>

                                        </span>

                                    )}

                                </div>


                                <div className="image-preview-box">

                                    {AGENCY_IMAGE_URL ? (

                                        <img
                                            src={AGENCY_IMAGE_URL}
                                            alt="Agent 1"
                                            className="preview-img preview-logo"
                                        />

                                    ) : (

                                        <div className="placeholder-icon-box">

                                            <Briefcase className="placeholder-icon" />

                                        </div>

                                    )}

                                    <div className="img-overlay-gradient" />

                                    <div className="img-bottom-tag">

                                        <Briefcase className="tag-icon" />

                                        <span>
                                            {t.agencySubtitle}
                                        </span>

                                    </div>

                                </div>


                                <h2 className="choice-title">
                                    {t.agencyTitle}
                                </h2>


                                <p className="choice-desc">
                                    {t.agencyDesc}
                                </p>


                                <div className="points-list">

                                    <div className="point-item">

                                        <div className="checkbox-icon-box">

                                            <Check className="check-svg" />

                                        </div>

                                        <span>
                                            {t.agencyPoint1}
                                        </span>

                                    </div>


                                    <div className="point-item">

                                        <div className="checkbox-icon-box">

                                            <Check className="check-svg" />

                                        </div>

                                        <span>
                                            {t.agencyPoint2}
                                        </span>

                                    </div>


                                    <div className="point-item">

                                        <div className="checkbox-icon-box">

                                            <Check className="check-svg" />

                                        </div>

                                        <span>
                                            {t.agencyPoint3}
                                        </span>

                                    </div>

                                </div>

                            </div>


                            <button
                                type="button"
                                onClick={(e) => {

                                    e.stopPropagation()

                                    handleAgencyClick()

                                }}
                                className="choice-btn agency-btn"
                            >

                                <Briefcase className="btn-icon" />

                                <span>

                                    {selectedChoice === 'agency'
                                        ? t.agencySelected
                                        : t.agencyAction
                                    }

                                </span>

                                <ArrowRight className="btn-arrow" />

                            </button>

                        </div>

                    </div>

                </div>

            </div>
        </>
        </I18nTree>
    )
}