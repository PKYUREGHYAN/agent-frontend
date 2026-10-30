import React, { useEffect, useState } from 'react'

import { PROPERTY_TYPE_KEY, readJson, writeJson } from '../services/uiSession.js'
import {
    Building2,
    Home,
    DoorOpen,
    Briefcase,
    Compass,
    Car,
    PartyPopper,
    Store,
    ArrowRight,
    Check,
    Sparkles,
    Layers,
    Tag,
    Clock,
    Calendar,
    Building,
    Globe,
    AlertCircle,
} from 'lucide-react'

import './PropertyType.css'
import { I18nTree } from '../i18n/I18n.jsx'

// =========================================================
// 1. ԳՈՐԾԱՐՔԻ ՏԵՍԱԿՆԵՐ
// =========================================================
const DEAL_TYPES = [
    {
        id: 'long-term',
        name: 'Երկարաժամկետ վարձակալություն',
        tag: 'Հիմնական',
        icon: Clock,
    },
    {
        id: 'daily',
        name: 'Օրավարձով',
        icon: Calendar,
    },
    {
        id: 'sale',
        name: 'Վաճառք',
        tag: 'Թոփ',
        icon: Tag,
    },
    {
        id: 'under-construction',
        name: 'Կառուցվող',
        icon: Building,
    },
    {
        id: 'abroad',
        name: 'Արտասահմանում',
        icon: Globe,
    },
]

// =========================================================
// 2. ԳՈՒՅՔԻ ՀԻՄՆԱԿԱՆ ԿԱՏԵԳՈՐԻԱՆԵՐ
// =========================================================
const PROPERTY_CATEGORIES = {
    daily: [
        {
            id: 'apartments',
            name: 'Բնակարաններ',
            icon: Building2,
        },
        {
            id: 'houses',
            name: 'Տներ',
            icon: Home,
        },
        {
            id: 'rooms',
            name: 'Սենյակներ',
            icon: DoorOpen,
        },
        {
            id: 'events',
            name: 'Միջոցառումների անցկացման վայրեր',
            icon: PartyPopper,
        },
        {
            id: 'commercial',
            name: 'Կոմերցիոն անշարժ գույք',
            icon: Briefcase,
        },
    ],

    'long-term': [
        {
            id: 'apartments',
            name: 'Բնակարաններ',
            icon: Building2,
        },
        {
            id: 'houses',
            name: 'Տներ',
            icon: Home,
        },
        {
            id: 'rooms',
            name: 'Սենյակներ',
            icon: DoorOpen,
        },
        {
            id: 'commercial',
            name: 'Կոմերցիոն անշարժ գույք',
            icon: Briefcase,
        },
        {
            id: 'garage',
            name: 'Ավտոտնակներ և կայանատեղի',
            icon: Car,
        },
        {
            id: 'kiosks',
            name: 'Տնակներ և կրպակներ',
            icon: Store,
        },
    ],

    sale: [
        {
            id: 'apartments',
            name: 'Բնակարաններ',
            icon: Building2,
        },
        {
            id: 'houses',
            name: 'Տներ',
            icon: Home,
        },
        {
            id: 'commercial',
            name: 'Կոմերցիոն անշարժ գույք',
            icon: Briefcase,
        },
        {
            id: 'land',
            name: 'Հողատարածք',
            icon: Compass,
        },
        {
            id: 'garage',
            name: 'Ավտոտնակներ և կայանատեղի',
            icon: Car,
        },
    ],

    'under-construction': [
        {
            id: 'apartments',
            name: 'Բնակարաններ',
            icon: Building2,
        },
        {
            id: 'houses',
            name: 'Տներ',
            icon: Home,
        },
        {
            id: 'commercial',
            name: 'Կոմերցիոն անշարժ գույք',
            icon: Briefcase,
        },
    ],

    abroad: [
        {
            id: 'apartments',
            name: 'Բնակարաններ',
            icon: Building2,
        },
        {
            id: 'houses',
            name: 'Տներ',
            icon: Home,
        },
        {
            id: 'commercial',
            name: 'Կոմերցիոն անշարժ գույք',
            icon: Briefcase,
        },
        {
            id: 'land',
            name: 'Հողատարածք',
            icon: Compass,
        },
    ],
}

// =========================================================
// 3. ԵՆԹԱՏԵՍԱԿՆԵՐ
// =========================================================
const SUB_TYPES = {
    houses: [
        {
            id: 'house',
            name: 'Տուն',
        },
        {
            id: 'townhouse',
            name: 'Թաունհաուզ',
        },
        {
            id: 'dacha',
            name: 'Ամառանոց',
        },
        {
            id: 'cottage',
            name: 'Քոթեջ',
        },
    ],
}

// =========================================================
// COMPONENT
// =========================================================
function PropertyType({
                          onContinue,
                          noticeMessage,
                          onBackToMainMenu,
                      }) {
    // =========================================================
    // 1. ԳՈՐԾԱՐՔ (Սկզբնական դատարկ)
    // =========================================================
    const savedType = readJson(PROPERTY_TYPE_KEY, {}) || {}

    const [dealType, setDealType] = useState(savedType.dealType || '')
    const [dealTypeId, setDealTypeId] = useState(savedType.dealTypeId || '')

    // =========================================================
    // 2. ԳՈՒՅՔ (Սկզբնական դատարկ)
    // =========================================================
    const [category, setCategory] = useState(savedType.category || '')
    const [categoryId, setCategoryId] = useState(savedType.categoryId || '')

    // =========================================================
    // 3. ԵՆԹԱՏԵՍԱԿ (Սկզբնական դատարկ)
    // =========================================================
    const [subType, setSubType] = useState(savedType.subType || '')
    const [subTypeId, setSubTypeId] = useState(savedType.subTypeId || '')

    useEffect(() => {
        writeJson(PROPERTY_TYPE_KEY, {
            dealType,
            dealTypeId,
            category,
            categoryId,
            subType,
            subTypeId,
        })
    }, [dealType, dealTypeId, category, categoryId, subType, subTypeId])

    // =========================================================
    // CURRENT CATEGORIES
    // =========================================================
    const currentCategories =
        (dealTypeId && PROPERTY_CATEGORIES[dealTypeId]) ||
        PROPERTY_CATEGORIES.daily

    // =========================================================
    // HOUSE CHECK (3-րդ մենյուն բացվում է միայն Տների դեպքում)
    // =========================================================
    const isHousesCategory = categoryId === 'houses'

    const currentSubTypes =
        isHousesCategory ? SUB_TYPES[categoryId] || [] : []

    const hasSubTypes =
        isHousesCategory && currentSubTypes.length > 0

    // =========================================================
    // SELECT DEAL
    // =========================================================
    const handleSelectDeal = (item) => {
        setDealType(item.name)
        setDealTypeId(item.id)
    }

    // =========================================================
    // SELECT CATEGORY
    // =========================================================
    const handleSelectCategory = (item) => {
        setCategory(item.name)
        setCategoryId(item.id)
        setSubType('')
        setSubTypeId('')
    }

    // =========================================================
    // SELECT SUBTYPE
    // =========================================================
    const handleSelectSub = (item) => {
        setSubType(item.name)
        setSubTypeId(item.id)
    }

    // =========================================================
    // CONTINUE (Անցում միայն այս կոճակը սեղմելիս)
    // =========================================================
    const handleContinue = () => {
        if (!dealType || !category || (hasSubTypes && !subType)) {
            return
        }

        if (onContinue) {
            onContinue({
                dealType,
                dealTypeId,
                category,
                categoryId,
                subType,
                subTypeId,
                propertyType: subType || category,
            })
        }
    }

    // =========================================================
    // RENDER
    // =========================================================
    return (
        <I18nTree>
        <div className="property-type-page">

            <div
                className={`property-type-card ${
                    isHousesCategory
                        ? 'has-subtypes'
                        : ''
                }`}
            >

                {/* =================================================
                    HEADER
                ================================================= */}
                <div className="property-type-header">

                    <div className="property-type-badge">
                        <Sparkles size={14} />

                        <span>
                            Telegram AI Chat • Անշարժ Գույք
                        </span>
                    </div>

                    <h1>
                        Ստեղծեք նոր հայտարարություն
                    </h1>

                    <p>
                        {isHousesCategory
                            ? 'Ընտրեք գործարքի տեսակը, գույքի կատեգորիան և համապատասխան ենթատեսակը'
                            : 'Ընտրեք գործարքի տեսակը և գույքի կատեգորիան'}
                    </p>

                    {noticeMessage && (
                        <div className="property-type-notice">

                            <AlertCircle size={15} />

                            <span>
                                {noticeMessage}
                            </span>

                        </div>
                    )}

                </div>

                {/* =================================================
                    COLUMNS
                ================================================= */}
                <div
                    className={`property-type-selection ${
                        isHousesCategory
                            ? 'has-subtypes'
                            : ''
                    }`}
                >

                    {/* =================================================
                        COLUMN 1: ԳՈՐԾԱՐՔԻ ՏԵՍԱԿ
                    ================================================= */}
                    <div className="selection-column">

                        <h2>
                            <Layers size={15} />

                            <span>
                                Գործարքի տեսակ
                            </span>
                        </h2>

                        <div className="selection-list">

                            {DEAL_TYPES.map((item) => {

                                const isSelected =
                                    dealTypeId === item.id

                                return (
                                    <button
                                        key={item.id}
                                        type="button"
                                        className={`selection-item ${
                                            isSelected
                                                ? 'selected'
                                                : ''
                                        }`}
                                        onClick={() =>
                                            handleSelectDeal(
                                                item
                                            )
                                        }
                                    >

                                        <span className="selection-indicator">

                                            {isSelected && (
                                                <Check
                                                    size={12}
                                                    strokeWidth={3}
                                                />
                                            )}

                                        </span>

                                        <span className="selection-text">
                                            {item.name}
                                        </span>

                                        {item.tag && (
                                            <span className="selection-tag">
                                                {item.tag}
                                            </span>
                                        )}

                                    </button>
                                )
                            })}

                        </div>

                    </div>

                    {/* =================================================
                        COLUMN 2: ԳՈՒՅՔԻ ՏԵՍԱԿ
                    ================================================= */}
                    <div className="selection-column">

                        <h2>
                            <Building2 size={15} />

                            <span>
                                Գույքի տեսակ
                            </span>
                        </h2>

                        <div className="selection-list">

                            {currentCategories.map((item) => {

                                const isSelected =
                                    categoryId === item.id

                                const IconComponent =
                                    item.icon

                                return (
                                    <button
                                        key={item.id}
                                        type="button"
                                        className={`selection-item ${
                                            isSelected
                                                ? 'selected'
                                                : ''
                                        }`}
                                        onClick={() =>
                                            handleSelectCategory(
                                                item
                                            )
                                        }
                                    >

                                        <span className="selection-indicator">

                                            {isSelected ? (
                                                <Check
                                                    size={12}
                                                    strokeWidth={3}
                                                />
                                            ) : (
                                                <IconComponent
                                                    size={12}
                                                />
                                            )}

                                        </span>

                                        <span className="selection-text">
                                            {item.name}
                                        </span>

                                        {item.id !==
                                            'houses' && (
                                                <ArrowRight
                                                    size={13}
                                                    style={{
                                                        marginLeft:
                                                            'auto',
                                                        opacity: 0.4,
                                                    }}
                                                />
                                            )}

                                    </button>
                                )
                            })}

                        </div>

                    </div>

                    {/* =================================================
                        COLUMN 3: ԵՆԹԱՏԵՍԱԿ (Բացվում է միայն Տների դեպքում)
                    ================================================= */}
                    {isHousesCategory && (
                        <div className="selection-column selection-column-subtypes">

                            <h2>
                                <Home size={15} />

                                <span>
                                    Ենթատեսակ
                                </span>
                            </h2>

                            <div className="selection-list">

                                {currentSubTypes.map(
                                    (item) => {

                                        const isSelected =
                                            subTypeId ===
                                            item.id

                                        return (
                                            <button
                                                key={item.id}
                                                type="button"
                                                className={`selection-item ${
                                                    isSelected
                                                        ? 'selected'
                                                        : ''
                                                }`}
                                                onClick={() =>
                                                    handleSelectSub(
                                                        item
                                                    )
                                                }
                                            >

                                                <span className="selection-indicator">

                                                    {isSelected && (
                                                        <Check
                                                            size={12}
                                                            strokeWidth={
                                                                3
                                                            }
                                                        />
                                                    )}

                                                </span>

                                                <span className="selection-text">
                                                    {item.name}
                                                </span>

                                            </button>
                                        )
                                    }
                                )}

                            </div>

                        </div>
                    )}

                </div>

                {/* =================================================
                    FOOTER
                ================================================= */}
                <div className="property-type-footer">

                    <div className="selection-status">

                        <span
                            className={
                                dealType
                                    ? 'status-done'
                                    : ''
                            }
                        >
                            {dealType
                                ? `Գործարք: ${dealType}`
                                : 'Գործարք'}
                        </span>

                        {category && (
                            <>
                                <span>•</span>

                                <span className="status-done">
                                    Գույք: {category}
                                </span>
                            </>
                        )}

                        {isHousesCategory &&
                            subType && (
                                <>
                                    <span>•</span>

                                    <span className="status-done">
                                        Տեսակ: {subType}
                                    </span>
                                </>
                            )}

                    </div>

                    {/* =================================================
                        FOOTER BUTTONS
                    ================================================= */}
                    <div className="property-type-footer-buttons">

                        {/* ԳԼԽԱՎՈՐ ՄԵՆՅՈՒ */}
                        <button
                            type="button"
                            className="back-to-main-menu-button"
                            onClick={
                                onBackToMainMenu
                            }
                        >
                            <span>
                                ← Գլխավոր մենյու
                            </span>
                        </button>

                        {/* ՇԱՐՈՒՆԱԿԵԼ */}
                        <button
                            type="button"
                            className="continue-button"
                            disabled={
                                !dealType ||
                                !category ||
                                (hasSubTypes &&
                                    !subType)
                            }
                            onClick={
                                handleContinue
                            }
                        >
                            <span>
                                Շարունակել
                            </span>

                            <ArrowRight size={17} />

                        </button>

                    </div>

                </div>

            </div>

        </div>
        </I18nTree>
    )
}

export default PropertyType