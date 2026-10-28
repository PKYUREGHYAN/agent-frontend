import React, { useState, useRef, useEffect } from 'react';
import './HouseRentForm.css';
import { I18nTree } from '../i18n/I18n.jsx';
import AiPhotoCleaner from "../ai-cleaner/AiPhotoCleaner.jsx";
import { loadFormDraft, useFormDraftState, useSaveFormDraft } from "../services/uiSession.js";

const ARMENIA_REGIONS = [
    {
        name: 'Երևան',
        cities: [
            'Աջափնյակ',
            'Ավան',
            'Արաբկիր',
            'Դավթաշեն',
            'Էրեբունի',
            'Կենտրոն',
            'Մալաթիա-Սեբաստիա',
            'Նոր Նորք',
            'Նորք-Մարաշ',
            'Նուբարաշեն',
            'Շենգավիթ',
            'Քանաքեռ-Զեյթուն'
        ]
    },
    {
        name: 'Կոտայք',
        cities: ['Աբովյան', 'Հրազդան', 'Ծաղկաձոր', 'Չարենցավան', 'Նոր Հաճն', 'Բյուրեղավան', 'Եղվարդ', 'Գառնի', 'Ձորաղբյուր', 'Առինջ', 'Քասախ']
    },
    {
        name: 'Արարատ',
        cities: ['Արտաշատ', 'Մասիս', 'Վեդի', 'Արարատ', 'Այնթապ', 'Մարմարաշեն']
    },
    {
        name: 'Արմավիր',
        cities: ['Վաղարշապատ (Էջմիածին)', 'Արմավիր', 'Մեծամոր', 'Փարաքար', 'Թաիրով']
    },
    {
        name: 'Արագածոտն',
        cities: ['Աշտարակ', 'Ապարան', 'Թալին', 'Օշական', 'Բյուրական']
    },
    {
        name: 'Լոռի',
        cities: ['Վանաձոր', 'Ստեփանավան', 'Ալավերդի', 'Սպիտակ', 'Տաշիր']
    },
    {
        name: 'Շիրակ',
        cities: ['Գյումրի', 'Արթիկ', 'Մարալիկ']
    },
    {
        name: 'Սյունիք',
        cities: ['Կապան', 'Գորիս', 'Սիսիան', 'Մեղրի', 'Քաջարան']
    },
    {
        name: 'Գեղարքունիք',
        cities: ['Գավառ', 'Սևան', 'Մարտունի', 'Վարդենիս', 'Ճամբարակ']
    },
    {
        name: 'Տավուշ',
        cities: ['Իջևան', 'Դիլիջան', 'Բերդ', 'Նոյեմբերյան']
    },
    {
        name: 'Վայոց Ձոր',
        cities: ['Եղեգնաձոր', 'Ջերմուկ', 'Վայք']
    }
];

export function HouseRentForm({ onBack, onSave }) {
    const draft = loadFormDraft("house-rent");

    // 1. Ձեր կարգավիճակը
    const [userRole, setUserRole] = useState(draft.userRole || '');

    // Գտնվելու վայրը
    const [region, setRegion] = useState(draft.region || '');
    const [regionSearch, setRegionSearch] = useState('');
    const [regionDropdownOpen, setRegionDropdownOpen] = useState(false);
    const [expandedMarz, setExpandedMarz] = useState('Երևան');
    const [street, setStreet] = useState(draft.street || '');
    const [buildingNumber, setBuildingNumber] = useState(draft.buildingNumber || '');
    const [hideBuildingNumber, setHideBuildingNumber] = useState(Boolean(draft.hideBuildingNumber));

    // 2. Տան մասին
    const [rooms, setRooms] = useState(draft.rooms || '');
    const [roomsDropdownOpen, setRoomsDropdownOpen] = useState(false);
    const roomsOptions = ['1', '2', '3', '4', '5', '6', '7', '8+'];

    const [houseArea, setHouseArea] = useState(draft.houseArea || '');
    const [buildingType, setBuildingType] = useState(draft.buildingType || '');
    const [floorsCount, setFloorsCount] = useState(draft.floorsCount || '');
    const [bathroomsCount, setBathroomsCount] = useState(draft.bathroomsCount || '');

    const [renovation, setRenovation] = useState(draft.renovation || '');
    const [renovationDropdownOpen, setRenovationDropdownOpen] = useState(false);
    const renovationOptions = [
        'Չվերանորոգված',
        'Հին',
        'Մասնակի',
        'Կոսմետիկ',
        'Եվրո',
        'Դիզայներական',
        'Կապիտալ'
    ];

    const [garage, setGarage] = useState(draft.garage || '');

    // 3. Հարմարություններ, Կահույք & Կենցաղային տեխնիկա
    const [amenities, setAmenities] = useState(draft.amenities || []);
    const amenitiesList = [
        'Հեռուստացույց',
        'Ինտերնետ',
        'Օդորակիչ',
        'Լողավազան',
        'Սաունա',
        'Բուխարի',
        'Խորովածի վառարան',
        'Բիլիարդ',
        'Տաղավար',
        'Անվտանգության համակարգ',
    ];

    const [furniture, setFurniture] = useState(draft.furniture || '');

    const [appliances, setAppliances] = useState(draft.appliances || []);
    const appliancesList = [
        'Սառնարան',
        'Սալօջախ',
        'Միկրոալիքային վառարան',
        'Սրճեփ',
        'Սպասք լվացող մեքենա',
        'Լվացքի մեքենա',
        'Չորացնող մեքենա',
        'Ջրատաքացուցիչ',
        'Արդուկ',
        'Ֆեն',
    ];

    // 4. Տեղեկություններ հողատարածքի մասին
    const [landArea, setLandArea] = useState(draft.landArea || '');

    // 5. Բնակության կանոններ
    const [childrenRule, setChildrenRule] = useState(draft.childrenRule || '');
    const [petsRule, setPetsRule] = useState(draft.petsRule || '');

    // 6. Տեղեկություններ անշարժ գույքի վերաբերյալ
    const [availabilityStatus, setAvailabilityStatus] = useState(draft.availabilityStatus || '');
    const [availableDate, setAvailableDate] = useState(draft.availableDate || '');

    // 7. Գործարքի պայմաններ
    const [rentPrice, setRentPrice] = useState(draft.rentPrice || '');
    const [currency, setCurrency] = useState(draft.currency || '');
    const [paymentPeriod, setPaymentPeriod] = useState(draft.paymentPeriod || '');

    const [prepayment, setPrepayment] = useState(draft.prepayment || '');
    const [prepaymentDropdownOpen, setPrepaymentDropdownOpen] = useState(false);
    const prepaymentOptions = [
        'Առանց կանխավճարի',
        '1 ամիս',
        '2 ամիս',
        '3 ամիս',
        '4 ամիս',
        '5 ամիս',
        '6 ամիս',
        '1 տարի',
    ];

    const [utilities, setUtilities] = useState(draft.utilities || '');

    // 8. Լուսանկարներ
    const [uploadedPhotos, setUploadedPhotos] = useFormDraftState("house-rent", "uploadedPhotos", draft.uploadedPhotos || []);
    const fileInputRef = useRef(null);

    // Անվասայլակով հասանելիություն
    const [wheelchairAccessible, setWheelchairAccessible] = useState(draft.wheelchairAccessible || '');

    // 9. Կոնտակտային տվյալներ
    const [contactMode, setContactMode] = useState(draft.contactMode || '');
    const [primaryPhone] = useState('(077) 12-35-23');
    const [customPhone, setCustomPhone] = useState(draft.customPhone || '');

    useSaveFormDraft("house-rent", {
        userRole,
        region,
        street,
        buildingNumber,
        hideBuildingNumber,
        rooms,
        houseArea,
        buildingType,
        floorsCount,
        bathroomsCount,
        renovation,
        garage,
        amenities,
        furniture,
        appliances,
        landArea,
        childrenRule,
        petsRule,
        availabilityStatus,
        availableDate,
        rentPrice,
        currency,
        paymentPeriod,
        prepayment,
        utilities,
        uploadedPhotos,
        wheelchairAccessible,
        contactMode,
        customPhone,
    });

    const regionRef = useRef(null);
    const roomsRef = useRef(null);
    const renovationRef = useRef(null);
    const prepaymentRef = useRef(null);

    useEffect(() => {
        function handleClickOutside(e) {
            if (regionRef.current && !regionRef.current.contains(e.target)) {
                setRegionDropdownOpen(false);
            }
            if (roomsRef.current && !roomsRef.current.contains(e.target)) {
                setRoomsDropdownOpen(false);
            }
            if (renovationRef.current && !renovationRef.current.contains(e.target)) {
                setRenovationDropdownOpen(false);
            }
            if (prepaymentRef.current && !prepaymentRef.current.contains(e.target)) {
                setPrepaymentDropdownOpen(false);
            }
        }

        document.addEventListener('mousedown', handleClickOutside);

        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const toggleCheckbox = (list, setList, item) => {
        if (list.includes(item)) {
            setList(list.filter((x) => x !== item));
        } else {
            setList([...list, item]);
        }
    };

    const handlePhotoUpload = (e) => {
        const files = e.target.files;

        if (!files) return;

        Array.from(files).forEach((file) => {
            const reader = new FileReader();

            reader.onload = () => {
                if (typeof reader.result === 'string') {
                    setUploadedPhotos((prev) => [...prev, reader.result]);
                }
            };

            reader.readAsDataURL(file);
        });
    };

    const handleDeletePhoto = (idx) => {
        setUploadedPhotos((prev) => prev.filter((_, i) => i !== idx));
    };

    const filteredRegions = ARMENIA_REGIONS.map((marz) => {
        const matchesMarz = marz.name
            .toLowerCase()
            .includes(regionSearch.toLowerCase());

        const filteredCities = marz.cities.filter((city) =>
            city.toLowerCase().includes(regionSearch.toLowerCase())
        );

        if (matchesMarz) {
            return marz;
        }

        if (filteredCities.length > 0) {
            return { ...marz, cities: filteredCities };
        }

        return null;
    }).filter(Boolean);

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!region) {
            alert('Խնդրում ենք ընտրել տարածաշրջանը');
            setRegionDropdownOpen(true);
            return;
        }

        if (!street) {
            alert('Խնդրում ենք լրացնել փողոցը');
            return;
        }

        if (!rooms) {
            alert('Խնդրում ենք ընտրել սենյակների քանակը');
            return;
        }

        if (!houseArea) {
            alert('Խնդրում ենք նշել տան մակերեսը');
            return;
        }

        if (!landArea) {
            alert('Խնդրում ենք նշել հողատարածքի մակերեսը');
            return;
        }

        if (!wheelchairAccessible) {
            alert('Խնդրում ենք նշել՝ արդյոք հարմար է անվասայլակով մարդկանց համար');
            return;
        }

        if (!rentPrice) {
            alert('Խնդրում ենք նշել վարձավճարը');
            return;
        }

        const payload = {
            dealPath: 'Տեղադրել հայտարարություն › Տներ › Տուն',

            userRole,

            region,
            street,
            buildingNumber,
            hideBuildingNumber,

            rooms,
            houseArea,
            buildingType,
            floorsCount,
            bathroomsCount,
            renovation,
            garage,

            amenities,
            furniture,
            appliances,

            landArea,

            childrenRule,
            petsRule,

            availabilityStatus,
            availableDate,

            rentPrice,
            currency,
            paymentPeriod,
            prepayment,
            utilities,

            // Անվասայլակով հասանելիություն
            wheelchairAccessible,

            uploadedPhotos,

            contactPhone:
                contactMode === 'primary'
                    ? primaryPhone
                    : customPhone,
        };

        if (onSave) {
            onSave(payload);
        } else {
            alert(
                `✅ Տան վարձակալության հայտարարությունը պահպանվեց!\n\n` +
                `• Տարածաշրջան՝ ${region}\n` +
                `• Փողոց՝ ${street}\n` +
                `• Տան մակերես՝ ${houseArea} քմ\n` +
                `• Հողի մակերես՝ ${landArea} քմ\n` +
                `• Գին՝ ${rentPrice} ${currency} / ${paymentPeriod}`
);
}
};

return (
    <I18nTree>
    <div className="house-rent-page">
        <div className="house-rent-container">

            {/* Header_agency & Breadcrumb */}
            <div className="hr-header">
                {onBack && (
                    <button
                        type="button"
                        className="hr-back-btn"
                        onClick={onBack}
                        title="Հետ"
                    >
                        ←
                    </button>
                )}

                <h1 className="hr-page-title">
                    Տեղադրել հայտարարություն{' '}
                    <span className="sep">›</span>{' '}
                    Տներ{' '}
                    <span className="sep">›</span>{' '}
                    Տուն
                </h1>
            </div>

            <form onSubmit={handleSubmit} className="hr-form">

                {/* SECTION 1: ՁԵՐ ԿԱՐԳԱՎԻՃԱԿԸ & ԳՏՆՎԵԼՈՒ ՎԱՅՐԸ */}
                <div className="hr-section">
                    <h2 className="hr-section-title">
                        Ձեր կարգավիճակը{' '}
                        <span className="hr-star">*</span>
                    </h2>

                    <div className="hr-role-group">
                        <div
                            className={`hr-role-card ${
                                userRole === 'owner' ? 'active' : ''
                            }`}
                            onClick={() => setUserRole('owner')}
                        >
                            <div className="hr-radio-circle">
                                {userRole === 'owner' && (
                                    <div className="hr-radio-dot" />
                                )}
                            </div>

                            <div className="hr-role-content">
                                <div className="hr-role-title">
                                    Սեփականատեր
                                </div>

                                <div className="hr-role-desc">
                                    Եթե դուք վաճառում եք ձեր սեփական անշարժ
                                    գույքը՝ սեփականատեր
                                </div>
                            </div>
                        </div>

                        <div
                            className={`hr-role-card ${
                                userRole === 'agency' ? 'active' : ''
                            }`}
                            onClick={() => setUserRole('agency')}
                        >
                            <div className="hr-radio-circle">
                                {userRole === 'agency' && (
                                    <div className="hr-radio-dot" />
                                )}
                            </div>

                            <div className="hr-role-content">
                                <div className="hr-role-title">
                                    Գործակալություն
                                </div>

                                <div className="hr-role-desc">
                                    Եթե դուք միջնորդ եք, բրոքեր կամ անշարժ
                                    գույքի գործակալության ներկայացուցիչ
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Գտնվելու վայրը */}
                    <h2
                        className="hr-section-title"
                        style={{ marginTop: '14px' }}
                    >
                        Գտնվելու վայրը
                    </h2>

                    {/* Տարածաշրջան */}
                    <div className="hr-row" ref={regionRef}>
                        <label className="hr-label">
                            Տարածաշրջան{' '}
                            <span className="hr-star">*</span>
                        </label>

                        <div
                            style={{
                                position: 'relative',
                                width: '100%',
                            }}
                        >
                            <div
                                className={`hr-dropdown-trigger ${
                                    regionDropdownOpen ? 'open' : ''
                                }`}
                                onClick={() =>
                                    setRegionDropdownOpen(
                                        !regionDropdownOpen
                                    )
                                }
                            >
                                    <span
                                        className={
                                            region
                                                ? ''
                                                : 'hr-placeholder'
                                        }
                                    >
                                        {region || 'Ընտրեք տարածաշրջանը'}
                                    </span>

                                <span>
                                        {regionDropdownOpen ? '▲' : '▼'}
                                    </span>
                            </div>

                            {regionDropdownOpen && (
                                <div className="hr-region-popover">
                                    <input
                                        type="text"
                                        className="hr-region-search"
                                        placeholder="🔍 Որոնել քաղաք կամ համայնք..."
                                        value={regionSearch}
                                        onChange={(e) =>
                                            setRegionSearch(
                                                e.target.value
                                            )
                                        }
                                        onClick={(e) =>
                                            e.stopPropagation()
                                        }
                                        autoFocus
                                    />

                                    <div className="hr-region-list">
                                        {filteredRegions.map((marz) => {
                                            const isExpanded =
                                                regionSearch.trim()
                                                    .length > 0 ||
                                                expandedMarz ===
                                                marz.name;

                                            return (
                                                <div
                                                    key={marz.name}
                                                    className="hr-marz-item"
                                                >
                                                    <div
                                                        className="hr-marz-header"
                                                        onClick={(e) => {
                                                            e.stopPropagation();

                                                            setExpandedMarz(
                                                                isExpanded
                                                                    ? null
                                                                    : marz.name
                                                            );
                                                        }}
                                                    >
                                                            <span>
                                                                🏢 {marz.name}
                                                            </span>

                                                        <div className="hr-marz-actions">
                                                            <button
                                                                type="button"
                                                                className="hr-marz-select-btn"
                                                                onClick={(
                                                                    e
                                                                ) => {
                                                                    e.stopPropagation();

                                                                    setRegion(
                                                                        marz.name
                                                                    );

                                                                    setRegionDropdownOpen(
                                                                        false
                                                                    );
                                                                }}
                                                            >
                                                                Ընտրել
                                                            </button>

                                                            <span>
                                                                    {isExpanded
                                                                        ? '▾'
                                                                        : '›'}
                                                                </span>
                                                        </div>
                                                    </div>

                                                    {isExpanded && (
                                                        <div className="hr-cities-container">
                                                            <div className="hr-cities-grid">
                                                                {marz.cities.map(
                                                                    (
                                                                        city
                                                                    ) => (
                                                                        <button
                                                                            type="button"
                                                                            key={
                                                                                city
                                                                            }
                                                                            className={`hr-city-chip ${
                                                                                region ===
                                                                                `${marz.name}, ${city}`
                                                                                    ? 'active'
                                                                                    : ''
                                                                            }`}
                                                                            onClick={(
                                                                                e
                                                                            ) => {
                                                                                e.stopPropagation();

                                                                                setRegion(
                                                                                    `${marz.name}, ${city}`
                                                                                );

                                                                                setRegionDropdownOpen(
                                                                                    false
                                                                                );
                                                                            }}
                                                                        >
                                                                            {
                                                                                city
                                                                            }
                                                                        </button>
                                                                    )
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Փողոց */}
                    <div className="hr-row">
                        <label className="hr-label">
                            Փողոց{' '}
                            <span className="hr-star">*</span>
                        </label>

                        <input
                            type="text"
                            className="hr-input"
                            value={street}
                            onChange={(e) =>
                                setStreet(e.target.value)
                            }
                            placeholder=""
                            required
                        />
                    </div>

                    {/* Շենքի համար */}
                    <div className="hr-row">
                        <label className="hr-label">
                            Շենքի համար
                        </label>

                        <div>
                            <input
                                type="text"
                                className="hr-input"
                                value={buildingNumber}
                                onChange={(e) =>
                                    setBuildingNumber(
                                        e.target.value
                                    )
                                }
                                placeholder=""
                                disabled={hideBuildingNumber}
                            />

                            <label className="hr-checkbox-single">
                                <input
                                    type="checkbox"
                                    checked={hideBuildingNumber}
                                    onChange={(e) =>
                                        setHideBuildingNumber(
                                            e.target.checked
                                        )
                                    }
                                />

                                <span>
                                        Շենքի համարը չցուցադրել
                                        հայտարարության մեջ
                                    </span>
                            </label>
                        </div>
                    </div>
                </div>

                {/* SECTION 2: ՏԱՆ ՄԱՍԻՆ */}
                <div className="hr-section">
                    <h2 className="hr-section-title">
                        Տան մասին
                    </h2>

                    {/* Սենյակների քանակ */}
                    <div
                        className="hr-row"
                        ref={roomsRef}
                    >
                        <label className="hr-label">
                            Սենյակների քանակ{' '}
                            <span className="hr-star">*</span>
                        </label>

                        <div
                            style={{
                                position: 'relative',
                                width: '100%',
                            }}
                        >
                            <div
                                className={`hr-dropdown-trigger ${
                                    roomsDropdownOpen
                                        ? 'open'
                                        : ''
                                }`}
                                onClick={() =>
                                    setRoomsDropdownOpen(
                                        !roomsDropdownOpen
                                    )
                                }
                            >
                                    <span
                                        className={
                                            rooms
                                                ? ''
                                                : 'hr-placeholder'
                                        }
                                    >
                                        {rooms || 'Ընտրեք'}
                                    </span>

                                <span>
                                        {roomsDropdownOpen
                                            ? '▲'
                                            : '▼'}
                                    </span>
                            </div>

                            {roomsDropdownOpen && (
                                <div className="hr-dropdown-menu">
                                    {roomsOptions.map((opt) => (
                                        <div
                                            key={opt}
                                            className={`hr-dropdown-item ${
                                                rooms === opt
                                                    ? 'selected'
                                                    : ''
                                            }`}
                                            onClick={() => {
                                                setRooms(opt);
                                                setRoomsDropdownOpen(
                                                    false
                                                );
                                            }}
                                        >
                                            {opt}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Տան մակերես */}
                    <div className="hr-row">
                        <label className="hr-label">
                            Տան մակերես{' '}
                            <span className="hr-star">*</span>
                        </label>

                        <div className="hr-unit-wrap">
                            <input
                                type="number"
                                className="hr-input"
                                value={houseArea}
                                onChange={(e) =>
                                    setHouseArea(e.target.value)
                                }
                                placeholder=""
                                required
                            />

                            <span className="hr-unit-badge">
                                    քմ
                                </span>
                        </div>
                    </div>

                    {/* Շինության տիպ */}
                    <div className="hr-row">
                        <label className="hr-label">
                            Շինության տիպ{' '}
                            <span className="hr-star">*</span>
                        </label>

                        <div className="hr-pill-group">
                            {[
                                'Քարե',
                                'Պանելային',
                                'Մոնոլիտ',
                                'Աղյուսե',
                                'Կասետային',
                                'Փայտե',
                            ].map((t) => (
                                <button
                                    type="button"
                                    key={t}
                                    className={`hr-pill-btn ${
                                        buildingType === t
                                            ? 'active'
                                            : ''
                                    }`}
                                    onClick={() =>
                                        setBuildingType(t)
                                    }
                                >
                                    {t}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Հարկերի քանակ */}
                    <div className="hr-row">
                        <label className="hr-label">
                            Հարկերի քանակ{' '}
                            <span className="hr-star">*</span>
                        </label>

                        <div className="hr-pill-group">
                            {['1', '2', '3', '4+'].map((f) => (
                                <button
                                    type="button"
                                    key={f}
                                    className={`hr-pill-btn ${
                                        floorsCount === f
                                            ? 'active'
                                            : ''
                                    }`}
                                    onClick={() =>
                                        setFloorsCount(f)
                                    }
                                >
                                    {f}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Սանհանգույցների քանակ */}
                    <div className="hr-row">
                        <label className="hr-label">
                            Սանհանգույցների քանակ{' '}
                            <span className="hr-star">*</span>
                        </label>

                        <div className="hr-pill-group">
                            {['1', '2', '3+'].map((b) => (
                                <button
                                    type="button"
                                    key={b}
                                    className={`hr-pill-btn ${
                                        bathroomsCount === b
                                            ? 'active'
                                            : ''
                                    }`}
                                    onClick={() =>
                                        setBathroomsCount(b)
                                    }
                                >
                                    {b}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Վերանորոգում */}
                    <div
                        className="hr-row"
                        ref={renovationRef}
                    >
                        <label className="hr-label">
                            Վերանորոգում{' '}
                            <span className="hr-star">*</span>
                        </label>

                        <div
                            style={{
                                position: 'relative',
                                width: '100%',
                            }}
                        >
                            <div
                                className={`hr-dropdown-trigger ${
                                    renovationDropdownOpen
                                        ? 'open'
                                        : ''
                                }`}
                                onClick={() =>
                                    setRenovationDropdownOpen(
                                        !renovationDropdownOpen
                                    )
                                }
                            >
                                    <span
                                        className={
                                            renovation
                                                ? ''
                                                : 'hr-placeholder'
                                        }
                                    >
                                        {renovation || 'Ընտրեք'}
                                    </span>

                                <span>
                                        {renovationDropdownOpen
                                            ? '▲'
                                            : '▼'}
                                    </span>
                            </div>

                            {renovationDropdownOpen && (
                                <div className="hr-dropdown-menu">
                                    {renovationOptions.map(
                                        (opt) => (
                                            <div
                                                key={opt}
                                                className={`hr-dropdown-item ${
                                                    renovation ===
                                                    opt
                                                        ? 'selected'
                                                        : ''
                                                }`}
                                                onClick={() => {
                                                    setRenovation(
                                                        opt
                                                    );
                                                    setRenovationDropdownOpen(
                                                        false
                                                    );
                                                }}
                                            >
                                                {opt}
                                            </div>
                                        )
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Ավտոտնակ */}
                    <div className="hr-row">
                        <label className="hr-label">
                            Ավտոտնակ{' '}
                            <span className="hr-star">*</span>
                        </label>

                        <div className="hr-pill-group">
                            {[
                                'Առկա չէ',
                                '1 տեղ',
                                '2 տեղ',
                                '3 կամ ավելի տեղեր',
                            ].map((g) => (
                                <button
                                    type="button"
                                    key={g}
                                    className={`hr-pill-btn ${
                                        garage === g
                                            ? 'active'
                                            : ''
                                    }`}
                                    onClick={() =>
                                        setGarage(g)
                                    }
                                >
                                    {g}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Հարմարություններ */}
                    <div className="hr-row hr-row-top">
                        <label
                            className="hr-label"
                            style={{ marginTop: '4px' }}
                        >
                            Հարմարություններ
                        </label>

                        <div className="hr-checkbox-grid">
                            {amenitiesList.map((item) => (
                                <label
                                    key={item}
                                    className="hr-checkbox-item"
                                >
                                    <input
                                        type="checkbox"
                                        checked={amenities.includes(
                                            item
                                        )}
                                        onChange={() =>
                                            toggleCheckbox(
                                                amenities,
                                                setAmenities,
                                                item
                                            )
                                        }
                                    />

                                    <span>{item}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Կահույք */}
                    <div className="hr-row">
                        <label className="hr-label">
                            Կահույք{' '}
                            <span className="hr-star">*</span>
                        </label>

                        <div className="hr-pill-group">
                            {[
                                'Կահույքով',
                                'Առկա չէ',
                                'Մասնակի',
                                'Համաձայնությամբ',
                            ].map((f) => (
                                <button
                                    type="button"
                                    key={f}
                                    className={`hr-pill-btn ${
                                        furniture === f
                                            ? 'active'
                                            : ''
                                    }`}
                                    onClick={() =>
                                        setFurniture(f)
                                    }
                                >
                                    {f}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Կենցաղային տեխնիկա */}
                    <div className="hr-row hr-row-top">
                        <label
                            className="hr-label"
                            style={{ marginTop: '4px' }}
                        >
                            Կենցաղային տեխնիկա
                        </label>

                        <div className="hr-checkbox-grid">
                            {appliancesList.map((item) => (
                                <label
                                    key={item}
                                    className="hr-checkbox-item"
                                >
                                    <input
                                        type="checkbox"
                                        checked={appliances.includes(
                                            item
                                        )}
                                        onChange={() =>
                                            toggleCheckbox(
                                                appliances,
                                                setAppliances,
                                                item
                                            )
                                        }
                                    />

                                    <span>{item}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                </div>

                {/* SECTION 3: ՀՈՂԱՏԱՐԱԾՔ */}
                <div className="hr-section">
                    <h2 className="hr-section-title">
                        Տեղեկություններ հողատարածքի մասին
                    </h2>

                    <div className="hr-row">
                        <label className="hr-label">
                            Ընդհանուր հողատարածքի մակերես{' '}
                            <span className="hr-star">*</span>
                        </label>

                        <div className="hr-unit-wrap">
                            <input
                                type="number"
                                className="hr-input"
                                value={landArea}
                                onChange={(e) =>
                                    setLandArea(e.target.value)
                                }
                                placeholder=""
                                required
                            />

                            <span className="hr-unit-badge">
                                    քմ
                                </span>
                        </div>
                    </div>
                </div>

                {/* SECTION 4: ԲՆԱԿՈՒԹՅԱՆ ԿԱՆՈՆՆԵՐ */}
                <div className="hr-section">
                    <h2 className="hr-section-title">
                        Բնակության կանոններ
                    </h2>

                    <div className="hr-row">
                        <label className="hr-label">
                            Երեխաների հետ{' '}
                            <span className="hr-star">*</span>
                        </label>

                        <div className="hr-pill-group">
                            {[
                                'Այո',
                                'Ոչ',
                                'Համաձայնությամբ',
                            ].map((r) => (
                                <button
                                    type="button"
                                    key={r}
                                    className={`hr-pill-btn ${
                                        childrenRule === r
                                            ? 'active'
                                            : ''
                                    }`}
                                    onClick={() =>
                                        setChildrenRule(r)
                                    }
                                >
                                    {r}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="hr-row">
                        <label className="hr-label">
                            Թույլատրվում են կենդանիներ{' '}
                            <span className="hr-star">*</span>
                        </label>

                        <div className="hr-pill-group">
                            {[
                                'Այո',
                                'Ոչ',
                                'Համաձայնությամբ',
                            ].map((r) => (
                                <button
                                    type="button"
                                    key={r}
                                    className={`hr-pill-btn ${
                                        petsRule === r
                                            ? 'active'
                                            : ''
                                    }`}
                                    onClick={() =>
                                        setPetsRule(r)
                                    }
                                >
                                    {r}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* SECTION 5: ԱՆՇԱՐԺ ԳՈՒՅՔԻ ՏԵՂԵԿՈՒԹՅՈՒՆՆԵՐ */}
                <div className="hr-section">
                    <h2 className="hr-section-title">
                        Տեղեկություններ անշարժ գույքի վերաբերյալ
                    </h2>

                    <div className="hr-row">
                        <label className="hr-label">
                            Հասանելիության կարգավիճակ{' '}
                            <span className="hr-star">*</span>{' '}
                            <span
                                className="hr-info-icon"
                                title="Նշեք, երբ է գույքը ազատ"
                            >
                                    ⓘ
                                </span>
                        </label>

                        <div>
                            <div className="hr-pill-group">
                                {[
                                    'Հասանելի է հիմա',
                                    'Կոնկրետ ամսաթվից',
                                ].map((st) => (
                                    <button
                                        type="button"
                                        key={st}
                                        className={`hr-pill-btn ${
                                            availabilityStatus ===
                                            st
                                                ? 'active'
                                                : ''
                                        }`}
                                        onClick={() =>
                                            setAvailabilityStatus(
                                                st
                                            )
                                        }
                                    >
                                        {st}
                                    </button>
                                ))}
                            </div>

                            {availabilityStatus ===
                                'Կոնկրետ ամսաթվից' && (
                                    <div
                                        style={{
                                            marginTop: '10px',
                                        }}
                                    >
                                        <input
                                            type="date"
                                            className="hr-input"
                                            value={availableDate}
                                            onChange={(e) =>
                                                setAvailableDate(
                                                    e.target.value
                                                )
                                            }
                                            required
                                        />
                                    </div>
                                )}
                        </div>
                    </div>
                </div>

                {/* SECTION 6: ԳՈՐԾԱՐՔԻ ՊԱՅՄԱՆՆԵՐ */}
                <div className="hr-section">
                    <h2 className="hr-section-title">
                        Գործարքի պայմաններ
                    </h2>

                    {/* Վարձավճար */}
                    <div className="hr-row">
                        <label className="hr-label">
                            Վարձավճար{' '}
                            <span className="hr-star">*</span>
                        </label>

                        <div className="hr-price-row">
                            <input
                                type="number"
                                className="hr-input"
                                value={rentPrice}
                                onChange={(e) =>
                                    setRentPrice(e.target.value)
                                }
                                placeholder=""
                                required
                            />

                            <select
                                className="hr-select"
                                value={currency}
                                onChange={(e) =>
                                    setCurrency(e.target.value)
                                }
                            >
                                <option value="" disabled>
                                    Ընտրեք արժույթը
                                </option>

                                <option value="AMD">
                                    🇦🇲 ֏ (AMD)
                                </option>

                                <option value="USD">
                                    🇺🇸 $ (USD)
                                </option>

                                <option value="RUB">
                                    🇷🇺 ₽ (RUB)
                                </option>

                                <option value="EUR">
                                    🇪🇺 € (EUR)
                                </option>
                            </select>

                            <select
                                className="hr-select"
                                value={paymentPeriod}
                                onChange={(e) =>
                                    setPaymentPeriod(
                                        e.target.value
                                    )
                                }
                            >
                                <option value="" disabled>
                                    Ընտրեք ժամանակահատվածը
                                </option>

                                <option value="ամսական">
                                    ամսական
                                </option>

                                <option value="օրական">
                                    օրական
                                </option>
                            </select>
                        </div>
                    </div>

                    {/* Կանխավճար */}
                    <div
                        className="hr-row"
                        ref={prepaymentRef}
                    >
                        <label className="hr-label">
                            Կանխավճար{' '}
                            <span className="hr-star">*</span>
                        </label>

                        <div
                            style={{
                                position: 'relative',
                                width: '100%',
                            }}
                        >
                            <div
                                className={`hr-dropdown-trigger ${
                                    prepaymentDropdownOpen
                                        ? 'open'
                                        : ''
                                }`}
                                onClick={() =>
                                    setPrepaymentDropdownOpen(
                                        !prepaymentDropdownOpen
                                    )
                                }
                            >
                                    <span
                                        className={
                                            prepayment
                                                ? ''
                                                : 'hr-placeholder'
                                        }
                                    >
                                        {prepayment ||
                                            'Ընտրեք կանխավճարի չափը'}
                                    </span>

                                <span>
                                        {prepaymentDropdownOpen
                                            ? '▲'
                                            : '▼'}
                                    </span>
                            </div>

                            {prepaymentDropdownOpen && (
                                <div className="hr-dropdown-menu">
                                    {prepaymentOptions.map(
                                        (opt) => (
                                            <div
                                                key={opt}
                                                className={`hr-dropdown-item ${
                                                    prepayment ===
                                                    opt
                                                        ? 'selected'
                                                        : ''
                                                }`}
                                                onClick={() => {
                                                    setPrepayment(
                                                        opt
                                                    );

                                                    setPrepaymentDropdownOpen(
                                                        false
                                                    );
                                                }}
                                            >
                                                {opt}
                                            </div>
                                        )
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Կոմունալ վճարումներ */}
                    <div className="hr-row">
                        <label className="hr-label">
                            Կոմունալ վճարումներ{' '}
                            <span className="hr-star">*</span>
                        </label>

                        <div className="hr-pill-group">
                            {[
                                'Ներառված',
                                'Չներառված',
                                'Համաձայնությամբ',
                            ].map((u) => (
                                <button
                                    type="button"
                                    key={u}
                                    className={`hr-pill-btn ${
                                        utilities === u
                                            ? 'active'
                                            : ''
                                    }`}
                                    onClick={() =>
                                        setUtilities(u)
                                    }
                                >
                                    {u}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Հարմար է անվասայլակով մարդկանց համար */}
                    <div className="hr-row">
                        <label className="hr-label">
                            Հարմար է անվասայլակով մարդկանց համար{' '}
                            <span className="hr-star">*</span>
                        </label>

                        <div className="hr-pill-group">
                            {['Այո', 'Ոչ'].map((option) => (
                                <button
                                    type="button"
                                    key={option}
                                    className={`hr-pill-btn ${
                                        wheelchairAccessible ===
                                        option
                                            ? 'active'
                                            : ''
                                    }`}
                                    onClick={() =>
                                        setWheelchairAccessible(
                                            option
                                        )
                                    }
                                >
                                    {option}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* SECTION 7: ԼՈՒՍԱՆԿԱՐՆԵՐ */}
                <div className="hr-section">
                    <h2 className="hr-section-title">
                        Լուսանկարներ{' '}
                        <span className="hr-star">*</span>
                    </h2>

                    <div
                        style={{
                            fontSize: '12.5px',
                            color: '#7e94aa',
                            lineHeight: '1.6',
                        }}
                    >
                        Խնդրում ենք վերբեռնել լուսանկարները
                        հետևյալ հերթականությամբ՝ սենյակներ,
                        խոհանոց, սանհանգույց, պատշգամբ և ապա
                        նոր ոչ բնակելի տարածքների լուսանկարներ
                        (շենքի ճակատ, նկուղ, պատուհաններից
                        բացվող տեսարան, շենքի մուտք,
                        ավտոկայանատեղի և այլն)։ Նաև ցույց տվեք
                        շենքի ճակատը, պատուհաններից բացվող
                        տեսարանը, շենքի մուտքը և
                        ավտոկայանատեղին։ Կարող եք նաև ավելացնել
                        հատակագիծը։ Խնդրում ենք համոզվել, որ ձեր
                        լուսանկարն առնվազն 600 պիքսել լայնություն
                        և 500 պիքսել բարձրություն ունի։
                    </div>

                    <input
                        type="file"
                        ref={fileInputRef}
                        style={{ display: 'none' }}
                        multiple
                        accept="image/*"
                        onChange={handlePhotoUpload}
                    />

                    <div
                        className="hr-dropzone"
                        onClick={() =>
                            fileInputRef.current?.click()
                        }
                    >
                        <div className="hr-dropzone-icon">
                            🖼️
                        </div>

                        <div className="hr-dropzone-text">
                            Քաշեք ու թողեք ֆայլը կամ{' '}
                            <span className="hr-dropzone-link">
                                    Վերբեռնեք սարքից
                                </span>
                        </div>
                    </div>

                    {uploadedPhotos.length > 0 && (
                        <div className="hr-photos-grid">
                            {uploadedPhotos.map((src, idx) => (
                                <div
                                    key={idx}
                                    className="hr-photo-card"
                                >
                                    <img
                                        src={src}
                                        alt={`Uploaded ${
                                            idx + 1
                                        }`}
                                    />

                                    <button
                                        type="button"
                                        className="hr-photo-del"
                                        onClick={() =>
                                            handleDeletePhoto(
                                                idx
                                            )
                                        }
                                        title="Ջնջել"
                                    >
                                        ✕
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    <AiPhotoCleaner
                        onTransferToMainPhotos={(newPhotos) =>
                            setUploadedPhotos((prev) => [
                                ...prev,
                                ...newPhotos,
                            ])
                        }
                    />
                </div>

                {/* SECTION 8: ԿՈՆՏԱԿՏԱՅԻՆ ՏՎՅԱԼՆԵՐ */}
                <div className="hr-section">
                    <h2 className="hr-section-title">
                        Կոնտակտային տվյալներ
                    </h2>

                    <div className="hr-contact-group">
                        <label
                            className="hr-contact-card"
                            onClick={() =>
                                setContactMode('primary')
                            }
                        >
                            <input
                                type="radio"
                                name="contact"
                                checked={
                                    contactMode === 'primary'
                                }
                                onChange={() =>
                                    setContactMode(
                                        'primary'
                                    )
                                }
                            />

                            <span>
                                    📞 {primaryPhone}
                                </span>
                        </label>

                        <label
                            className="hr-contact-card"
                            onClick={() =>
                                setContactMode('custom')
                            }
                        >
                            <input
                                type="radio"
                                name="contact"
                                checked={
                                    contactMode === 'custom'
                                }
                                onChange={() =>
                                    setContactMode(
                                        'custom'
                                    )
                                }
                            />

                            <span>
                                    📞 Կցել հեռախոսահամար
                                </span>
                        </label>

                        {contactMode === 'custom' && (
                            <div
                                style={{
                                    marginTop: '8px',
                                }}
                            >
                                <input
                                    type="tel"
                                    className="hr-input"
                                    placeholder="+374 (__) __-__-__"
                                    value={customPhone}
                                    onChange={(e) =>
                                        setCustomPhone(
                                            e.target.value
                                        )
                                    }
                                    autoFocus
                                />
                            </div>
                        )}
                    </div>
                </div>

                {/* SECTION 9: ԳՈՐԾՈՂՈՒԹՅՈՒՆՆԵՐԻ ԿՈՃԱԿՆԵՐ */}
                <div className="hr-footer-actions">
                    <button
                        type="button"
                        className="hr-btn-cancel"
                        onClick={
                            onBack ||
                            (() =>
                                window.history.back())
                        }
                    >
                        Չեղարկել
                    </button>

                    <button
                        type="button"
                        className="hr-btn-draft"
                        onClick={() =>
                            alert(
                                '💾 Պահպանվեց որպես սևագիր'
                            )
                        }
                    >
                        Պահպանել որպես սևագիր
                    </button>

                    <button
                        type="submit"
                        className="hr-btn-submit"
                    >
                        Ուղարկել
                    </button>
                </div>
            </form>
        </div>
    </div>
    </I18nTree>
);
}

export default HouseRentForm;
