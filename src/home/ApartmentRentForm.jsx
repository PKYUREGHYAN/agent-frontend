import React, { useState, useRef, useEffect, useMemo } from 'react';
import './ApartmentRentForm.css';
import { I18nTree } from '../i18n/I18n.jsx';
import AiPhotoCleaner from '../ai-cleaner/AiPhotoCleaner.jsx';
import { loadFormDraft, useFormDraftState, useSaveFormDraft } from '../services/uiSession.js';

// Հայաստանի բոլոր քաղաքներն ու համայնքները՝ ըստ մարզերի
export const ARMENIA_CITIES_DATA = [
    {
        marz: 'Երևան',
        cities: [
            'Կենտրոն',
            'Արաբկիր',
            'Աջափնյակ',
            'Ավան',
            'Դավթաշեն',
            'Էրեբունի',
            'Քանաքեռ-Զեյթուն',
            'Մալաթիա-Սեբաստիա',
            'Նոր Նորք',
            'Նորք-Մարաշ',
            'Նուբարաշեն',
            'Շենգավիթ',
        ],
    },
    {
        marz: 'Կոտայք',
        cities: [
            'Աբովյան',
            'Հրազդան',
            'Ծաղկաձոր',
            'Եղվարդ',
            'Չարենցավան',
            'Բյուրեղավան',
            'Նոր Հաճն',
            'Գառնի',
            'Ձորաղբյուր',
            'Զովունի',
            'Քասախ',
            'Պռոշյան',
            'Առինջ',
        ],
    },
    {
        marz: 'Արարատ',
        cities: [
            'Մասիս',
            'Արտաշատ',
            'Արարատ (քաղաք)',
            'Վեդի',
            'Այնթապ',
            'Մարմարաշեն',
            'Նոր Խարբերդ',
            'Ոսկետափ',
        ],
    },
    {
        marz: 'Արմավիր',
        cities: [
            'Վաղարշապատ (Էջմիածին)',
            'Արմավիր (քաղաք)',
            'Մեծամոր',
            'Փարաքար',
            'Թաիրով',
            'Բաղրամյան',
        ],
    },
    {
        marz: 'Շիրակ',
        cities: [
            'Գյումրի',
            'Արթիկ',
            'Մարալիկ',
            'Ախուրյան',
            'Ամասիա',
            'Աշոցք',
        ],
    },
    {
        marz: 'Լոռի',
        cities: [
            'Վանաձոր',
            'Ստեփանավան',
            'Ալավերդի',
            'Սպիտակ',
            'Տաշիր',
            'Օձուն',
        ],
    },
    {
        marz: 'Գեղարքունիք',
        cities: [
            'Սևան',
            'Գավառ',
            'Մարտունի',
            'Վարդենիս',
            'Ճամբարակ',
        ],
    },
    {
        marz: 'Սյունիք',
        cities: [
            'Կապան',
            'Գորիս',
            'Սիսիան',
            'Մեղրի',
            'Քաջարան',
            'Ագարակ',
            'Տաթև',
        ],
    },
    {
        marz: 'Արագածոտն',
        cities: [
            'Աշտարակ',
            'Ապարան',
            'Թալին',
            'Օշական',
            'Բյուրական',
        ],
    },
    {
        marz: 'Տավուշ',
        cities: [
            'Իջևան',
            'Դիլիջան',
            'Բերդ',
            'Նոյեմբերյան',
            'Այրում',
        ],
    },
    {
        marz: 'Վայոց Ձոր',
        cities: [
            'Եղեգնաձոր',
            'Ջերմուկ',
            'Վայք',
            'Արենի',
        ],
    },
];

export function ApartmentRentForm({
    dealType = 'Երկարաժամկետ վարձակալություն',
    propertyType = 'Բնակարաններ',
    onBack,
    onSave,
}) {
    const draft = loadFormDraft("apartment-rent");

    // 1. Կարգավիճակ
    const [userRole, setUserRole] = useState(draft.userRole || '');

    // 2. Գտնվելու վայրը
    const [selectedCity, setSelectedCity] = useState(draft.selectedCity || '');
    const [cityDropdownOpen, setCityDropdownOpen] = useState(false);
    const [citySearchTerm, setCitySearchTerm] = useState('');
    const [street, setStreet] = useState(draft.street || '');
    const [buildingNumber, setBuildingNumber] = useState(draft.buildingNumber || '');
    const [hideBuildingNumber, setHideBuildingNumber] = useState(Boolean(draft.hideBuildingNumber));

    // 3. Շենքի մասին
    const [buildingType, setBuildingType] = useState(draft.buildingType || '');
    const [newBuilding, setNewBuilding] = useState(draft.newBuilding || '');
    const [elevator, setElevator] = useState(draft.elevator || '');
    const [totalFloors, setTotalFloors] = useState(draft.totalFloors ?? null);
    const [buildingAmenities, setBuildingAmenities] = useState(draft.buildingAmenities || []);
    const [parking, setParking] = useState(draft.parking || '');

    // 4. Բնակարանի մասին
    const [totalArea, setTotalArea] = useState(draft.totalArea || '');
    const [rooms, setRooms] = useState(draft.rooms ?? null);
    const [bathrooms, setBathrooms] = useState(draft.bathrooms || '');
    const [ceilingHeight, setCeilingHeight] = useState(draft.ceilingHeight || '');
    const [floor, setFloor] = useState(draft.floor ?? null);
    const [balcony, setBalcony] = useState(draft.balcony || '');
    const [furniture, setFurniture] = useState(draft.furniture || '');
    const [renovation, setRenovation] = useState(draft.renovation || '');

    // Հարմարություններ
    const [conveniences, setConveniences] = useState(draft.conveniences || []);

    // Կենցաղային տեխնիկա
    const [appliances, setAppliances] = useState(draft.appliances || []);

    // Տեսարաններ պատուհաններից
    const [windowViews, setWindowViews] = useState(draft.windowViews || []);

    // Հարմար է անվասայլակով մարդկանց համար
    const [wheelchairAccessible, setWheelchairAccessible] = useState(draft.wheelchairAccessible || '');

    // 5. Բնակության կանոններ
    const [childrenRule, setChildrenRule] = useState(draft.childrenRule || '');
    const [petsRule, setPetsRule] = useState(draft.petsRule || '');

    // 6. Հասանելիության կարգավիճակ
    const [availabilityStatus, setAvailabilityStatus] = useState(draft.availabilityStatus || '');
    const [availableFromDate, setAvailableFromDate] = useState(draft.availableFromDate || '');

    // 7. Գործարքի պայմաններ
    const [rentAmount, setRentAmount] = useState(draft.rentAmount || '');
    const [currency, setCurrency] = useState(draft.currency || '');
    const [paymentPeriod, setPaymentPeriod] = useState(draft.paymentPeriod || '');
    const [utilities, setUtilities] = useState(draft.utilities || '');
    const [advancePayment, setAdvancePayment] = useState(draft.advancePayment || '');

    // 8. Լուսանկարներ & Կոնտակտ
    const [uploadedPhotos, setUploadedPhotos] = useFormDraftState("apartment-rent", "uploadedPhotos", draft.uploadedPhotos || []);
    const [contactPhone] = useState('(077) 12-35-23');
    const [useCustomPhone, setUseCustomPhone] = useState(draft.useCustomPhone ?? null);
    const [customPhoneNumber, setCustomPhoneNumber] = useState(draft.customPhoneNumber || '');

    useSaveFormDraft("apartment-rent", {
        userRole,
        selectedCity,
        street,
        buildingNumber,
        hideBuildingNumber,
        buildingType,
        newBuilding,
        elevator,
        totalFloors,
        buildingAmenities,
        parking,
        totalArea,
        rooms,
        bathrooms,
        ceilingHeight,
        floor,
        balcony,
        furniture,
        renovation,
        conveniences,
        appliances,
        windowViews,
        wheelchairAccessible,
        childrenRule,
        petsRule,
        availabilityStatus,
        availableFromDate,
        rentAmount,
        currency,
        paymentPeriod,
        utilities,
        advancePayment,
        uploadedPhotos,
        useCustomPhone,
        customPhoneNumber,
    });

    const cityDropdownRef = useRef(null);
    const fileInputRef = useRef(null);

    // Քաղաքների ֆիլտրացիա ըստ որոնման
    const filteredGroups = useMemo(() => {
        if (!citySearchTerm.trim()) return ARMENIA_CITIES_DATA;

        const term = citySearchTerm.toLowerCase();

        return ARMENIA_CITIES_DATA.map((group) => ({
            marz: group.marz,
            cities: group.cities.filter((c) =>
                c.toLowerCase().includes(term)
            ),
        })).filter((group) => group.cities.length > 0);
    }, [citySearchTerm]);

    // Փակել dropdown-ը դրսում սեղմելիս
    useEffect(() => {
        function handleClickOutside(event) {
            if (
                cityDropdownRef.current &&
                !cityDropdownRef.current.contains(event.target)
            ) {
                setCityDropdownOpen(false);
            }
        }

        document.addEventListener('mousedown', handleClickOutside);

        return () =>
            document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Multi-select դաշտերի համար
    const toggleArrayItem = (list, setList, item) => {
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
                    setUploadedPhotos((prev) => [
                        ...prev,
                        reader.result,
                    ]);
                }
            };

            reader.readAsDataURL(file);
        });
    };

    const handleSelectCity = (cityName) => {
        setSelectedCity(cityName);
        setCityDropdownOpen(false);
        setCitySearchTerm('');
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!selectedCity) {
            alert('Խնդրում ենք ընտրել քաղաքը');
            setCityDropdownOpen(true);
            return;
        }

        const payload = {
            dealType,
            propertyType,

            userRole,

            city: selectedCity,
            street,
            buildingNumber,
            hideBuildingNumber,

            buildingType,
            newBuilding,
            elevator,
            totalFloors,
            buildingAmenities,
            parking,

            totalArea,
            rooms,
            bathrooms,
            ceilingHeight,
            floor,
            balcony,
            furniture,
            renovation,

            conveniences,
            appliances,
            windowViews,

            wheelchairAccessible,

            childrenRule,
            petsRule,

            availabilityStatus,
            availableFromDate,

            rentAmount,
            currency,
            paymentPeriod,
            utilities,
            advancePayment,

            uploadedPhotos,
            uploadedPhotosCount: uploadedPhotos.length,

            contactPhone:
                useCustomPhone === true
                    ? customPhoneNumber
                    : contactPhone,
        };

        if (onSave) {
            onSave(payload);
        } else {
            alert(
                `✅ Հայտարարությունը պահպանվեց!\n\n` +
                `• Քաղաք՝ ${selectedCity}\n` +
                `• Շինության տիպ՝ ${buildingType || 'Չընտրված'}\n` +
                `• Հարկեր՝ ${totalFloors || 'Չընտրված'}\n` +
                `• Վերանորոգում՝ ${renovation || 'Չընտրված'}\n` +
                `• Գին՝ ${rentAmount || 'Չնշված'} ${currency || ''}`
            );
        }
    };

    return (
        <I18nTree>
        <div className="property-form-page">
            <div className="property-form-container">

                {/* Breadcrumb Header */}
                <div className="pf-top-header">

                    {onBack && (
                        <button
                            type="button"
                            className="pf-top-back-btn"
                            onClick={onBack}
                            title="Վերադառնալ"
                        >
                            ←
                        </button>
                    )}

                    <div className="pf-top-title-group">
                        <div className="pf-breadcrumbs">
                            <span>Տեղադրել հայտարարություն</span>

                            <span className="pf-bc-sep">›</span>

                            <span className="pf-bc-active">
                                {dealType}
                            </span>

                            <span className="pf-bc-sep">›</span>

                            <span className="pf-bc-active">
                                {propertyType}
                            </span>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="pf-main-form">

                    {/* 1. ՁԵՐ ԿԱՐԳԱՎԻՃԱԿԸ */}
                    <div className="pf-block">

                        <h3 className="pf-block-title">
                            Ձեր կարգավիճակը{' '}
                            <span className="pf-star">*</span>
                        </h3>

                        <div className="pf-role-options">

                            <label
                                className={`pf-role-card ${
    userRole === 'owner' ? 'active' : ''
}`}
                                onClick={() => setUserRole('owner')}
                            >
                                <div className="pf-radio-circle">
                                    {userRole === 'owner' && (
                                        <span className="pf-radio-dot" />
                                    )}
                                </div>

                                <div className="pf-role-text">

                                    <div className="pf-role-label">
                                        Սեփականատեր
                                    </div>

                                    <div className="pf-role-desc">
                                        Եթե դուք վաճառում եք ձեր սեփական անշարժ գույքը` սեփականատեր
</div>

</div>
</label>

<label
    className={`pf-role-card ${
        userRole === 'agency' ? 'active' : ''
    }`}
    onClick={() => setUserRole('agency')}
>
    <div className="pf-radio-circle">
        {userRole === 'agency' && (
            <span className="pf-radio-dot" />
        )}
    </div>

    <div className="pf-role-text">

        <div className="pf-role-label">
            Գործակալություն
        </div>

        <div className="pf-role-desc">
            Եթե դուք միջնորդ եք, բրոքեր կամ անշարժ գույքի գործակալության ներկայացուցիչ
        </div>

    </div>
</label>

</div>
</div>

{/* 2. ԳՏՆՎԵԼՈՒ ՎԱՅՐԸ */}
<div className="pf-block">

    <h3 className="pf-block-title">
        Գտնվելու վայրը
    </h3>

    {/* Քաղաքի ընտրություն */}
    <div
        className="pf-field-group"
        ref={cityDropdownRef}
    >

        <label className="pf-field-label">
            Քաղաք{' '}
            <span className="pf-star">*</span>
        </label>

        <div
            className={`pf-region-trigger ${
                cityDropdownOpen ? 'open' : ''
            }`}
            onClick={() =>
                setCityDropdownOpen(
                    !cityDropdownOpen
                )
            }
        >
                                <span
                                    className={
                                        selectedCity
                                            ? 'pf-selected-val'
                                            : 'pf-placeholder'
                                    }
                                >
                                    {selectedCity ||
                                        'Ընտրեք քաղաքը...'}
                                </span>

            <span className="pf-trigger-arrow">
                                    {cityDropdownOpen ? '▲' : '▼'}
                                </span>
        </div>

        {cityDropdownOpen && (
            <div className="pf-region-popover">

                <div className="pf-search-wrap">

                    <input
                        type="text"
                        className="pf-search-input"
                        placeholder="Որոնել քաղաքը..."
                        value={citySearchTerm}
                        onChange={(e) =>
                            setCitySearchTerm(
                                e.target.value
                            )
                        }
                        autoFocus
                        onClick={(e) =>
                            e.stopPropagation()
                        }
                    />

                </div>

                <div className="pf-cities-scroll-list">

                    {filteredGroups.length === 0 ? (
                        <div className="pf-no-results">
                            Քաղաք չի գտնվել
                        </div>
                    ) : (
                        filteredGroups.map(
                            (group) => (
                                <div
                                    key={group.marz}
                                    className="pf-group-section"
                                >

                                    <div className="pf-group-badge">
                                        {group.marz}
                                    </div>

                                    <div className="pf-city-chips-wrap">

                                        {group.cities.map(
                                            (city) => (
                                                <button
                                                    key={city}
                                                    type="button"
                                                    className={`pf-city-chip ${
                                                        selectedCity === city
                                                            ? 'active'
                                                            : ''
                                                    }`}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleSelectCity(
                                                            city
                                                        );
                                                    }}
                                                >
                                                    {city}
                                                </button>
                                            )
                                        )}

                                    </div>

                                </div>
                            )
                        )
                    )}

                </div>
            </div>
        )}
    </div>

    {/* Փողոց */}
    <div className="pf-field-group">

        <label className="pf-field-label">
            Փողոց{' '}
            <span className="pf-star">*</span>
        </label>

        <input
            type="text"
            className="pf-text-input"
            placeholder="օր․ Աբովյան փողոց"
            value={street}
            onChange={(e) =>
                setStreet(e.target.value)
            }
        />

    </div>

    {/* Շենքի համար */}
    <div className="pf-field-group">

        <label className="pf-field-label">
            Շենքի համար
        </label>

        <input
            type="text"
            className="pf-text-input"
            placeholder="օր․ 12/1"
            value={buildingNumber}
            onChange={(e) =>
                setBuildingNumber(
                    e.target.value
                )
            }
            disabled={hideBuildingNumber}
        />

        <label className="pf-checkbox-row">

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
                                    Շենքի համարը չցուցադրել հայտարարության մեջ
                                </span>

        </label>

    </div>
</div>

{/* 3. ՇԵՆՔԻ ՄԱՍԻՆ */}
<div className="pf-block">

    <h3 className="pf-block-title">
        Շենքի մասին
    </h3>

    {/* Շինության տիպ */}
    <div className="pf-field-group">

        <label className="pf-field-label">
            Շինության տիպ{' '}
            <span className="pf-star">*</span>
        </label>

        <div className="pf-pill-group">

            {[
                'Քարե',
                'Պանելային',
                'Մոնոլիտ',
                'Աղյուսե',
                'Կասետային',
                'Փայտե',
            ].map((type) => (
                <button
                    type="button"
                    key={type}
                    className={`pf-pill-btn ${
                        buildingType === type
                            ? 'active'
                            : ''
                    }`}
                    onClick={() =>
                        setBuildingType(type)
                    }
                >
                    {type}
                </button>
            ))}

        </div>
    </div>

    {/* Նորակառույց */}
    <div className="pf-field-group">

        <label className="pf-field-label">
            Նորակառույց{' '}
            <span className="pf-star">*</span>
        </label>

        <div className="pf-pill-group">

            {['Ոչ', 'Այո'].map((opt) => (
                <button
                    type="button"
                    key={opt}
                    className={`pf-pill-btn ${
                        newBuilding === opt
                            ? 'active'
                            : ''
                    }`}
                    onClick={() =>
                        setNewBuilding(opt)
                    }
                >
                    {opt}
                </button>
            ))}

        </div>
    </div>

    {/* Վերելակ */}
    <div className="pf-field-group">

        <label className="pf-field-label">
            Վերելակ{' '}
            <span className="pf-star">*</span>
        </label>

        <div className="pf-pill-group">

            {['Առկա է', 'Առկա չէ'].map(
                (opt) => (
                    <button
                        type="button"
                        key={opt}
                        className={`pf-pill-btn ${
                            elevator === opt
                                ? 'active'
                                : ''
                        }`}
                        onClick={() =>
                            setElevator(opt)
                        }
                    >
                        {opt}
                    </button>
                )
            )}

        </div>
    </div>

    {/* Հարկերի քանակ */}
    <div className="pf-field-group">

        <label className="pf-field-label">
            Հարկերի քանակ{' '}
            <span className="pf-star">*</span>
        </label>

        <div className="pf-number-row">

            {[1, 2, 3, 4, 5, 6, 7, 8, 9, '10+'].map(
                (num) => (
                    <button
                        type="button"
                        key={num}
                        className={`pf-number-btn ${
                            totalFloors === num
                                ? 'active'
                                : ''
                        }`}
                        onClick={() =>
                            setTotalFloors(num)
                        }
                    >
                        {num}
                    </button>
                )
            )}

        </div>
    </div>

    {/* Առկա են */}
    <div className="pf-field-group">

        <label className="pf-field-label">
            Առկա են
        </label>

        <div className="pf-pill-group">

            {[
                'Դոմոֆոն',
                'Դռնապահ',
                'Խաղահրապարակ',
            ].map((amenity) => {

                const isActive =
                    buildingAmenities.includes(
                        amenity
                    );

                return (
                    <button
                        type="button"
                        key={amenity}
                        className={`pf-pill-btn ${
                            isActive
                                ? 'active'
                                : ''
                        }`}
                        onClick={() =>
                            toggleArrayItem(
                                buildingAmenities,
                                setBuildingAmenities,
                                amenity
                            )
                        }
                    >
                        {amenity}
                    </button>
                );
            })}

        </div>
    </div>

    {/* Կայանատեղի */}
    <div className="pf-field-group">

        <label className="pf-field-label">
            Կայանատեղի
        </label>

        <div className="pf-pill-group">

            {[
                'Բացօթյա',
                'Ծածկապատ',
                'Ավտոտնակ',
            ].map((park) => (
                <button
                    type="button"
                    key={park}
                    className={`pf-pill-btn ${
                        parking === park
                            ? 'active'
                            : ''
                    }`}
                    onClick={() =>
                        setParking(park)
                    }
                >
                    {park}
                </button>
            ))}

        </div>
    </div>

</div>

{/* 4. ԲՆԱԿԱՐԱՆԻ ՄԱՍԻՆ */}
<div className="pf-block">

    <h3 className="pf-block-title">
        Բնակարանի մասին
    </h3>

    {/* Ընդհանուր մակերես */}
    <div className="pf-field-group">

        <label className="pf-field-label">
            Ընդհանուր մակերես{' '}
            <span className="pf-star">*</span>
        </label>

        <div className="pf-unit-input-wrap">

            <input
                type="number"
                className="pf-text-input"
                placeholder="օր․ 65"
                value={totalArea}
                onChange={(e) =>
                    setTotalArea(e.target.value)
                }
            />

            <span className="pf-input-unit">
                                    քմ
                                </span>

        </div>
    </div>

    {/* Սենյակների քանակ */}
    <div className="pf-field-group">

        <label className="pf-field-label">
            Սենյակների քանակ{' '}
            <span className="pf-star">*</span>
        </label>

        <div className="pf-number-row">

            {[1, 2, 3, 4, '5+'].map((r) => (
                <button
                    type="button"
                    key={r}
                    className={`pf-number-btn ${
                        rooms === r
                            ? 'active'
                            : ''
                    }`}
                    onClick={() =>
                        setRooms(r)
                    }
                >
                    {r}{' '}
                    {typeof r === 'number'
                        ? 'սենյակ'
                        : ''}
                </button>
            ))}

        </div>
    </div>

    {/* Սանհանգույցների քանակ */}
    <div className="pf-field-group">

        <label className="pf-field-label">
            Սանհանգույցների քանակ{' '}
            <span className="pf-star">*</span>
        </label>

        <div className="pf-number-row small">

            {['1', '2', '3+'].map((b) => (
                <button
                    type="button"
                    key={b}
                    className={`pf-number-btn ${
                        bathrooms === b
                            ? 'active'
                            : ''
                    }`}
                    onClick={() =>
                        setBathrooms(b)
                    }
                >
                    {b}
                </button>
            ))}

        </div>
    </div>

    {/* Առաստաղի բարձրություն */}
    <div className="pf-field-group">

        <label className="pf-field-label">
            Առաստաղի բարձրություն{' '}
            <span className="pf-star">*</span>
        </label>

        <div className="pf-pill-group">

            {[
                '2.5 մ',
                '2.7 մ',
                '2.8 մ',
                '3.0 մ',
                '3.2 մ',
                '3.5 մ+',
            ].map((h) => (
                <button
                    type="button"
                    key={h}
                    className={`pf-pill-btn ${
                        ceilingHeight === h
                            ? 'active'
                            : ''
                    }`}
                    onClick={() =>
                        setCeilingHeight(h)
                    }
                >
                    {h}
                </button>
            ))}

        </div>
    </div>

    {/* Հարկ */}
    <div className="pf-field-group">

        <label className="pf-field-label">
            Հարկ{' '}
            <span className="pf-star">*</span>
        </label>

        <div className="pf-number-row">

            {[1, 2, 3, 4, 5, 6, 7, 8, 9, '10+'].map(
                (f) => (
                    <button
                        type="button"
                        key={f}
                        className={`pf-number-btn ${
                            floor === f
                                ? 'active'
                                : ''
                        }`}
                        onClick={() =>
                            setFloor(f)
                        }
                    >
                        {f}
                    </button>
                )
            )}

        </div>
    </div>

    {/* Պատշգամբ */}
    <div className="pf-field-group">

        <label className="pf-field-label">
            Պատշգամբ{' '}
            <span className="pf-star">*</span>
        </label>

        <div className="pf-pill-group">

            {[
                'Առկա չէ',
                'Բաց',
                'Փակ',
            ].map((opt) => (
                <button
                    type="button"
                    key={opt}
                    className={`pf-pill-btn ${
                        balcony === opt
                            ? 'active'
                            : ''
                    }`}
                    onClick={() =>
                        setBalcony(opt)
                    }
                >
                    {opt}
                </button>
            ))}

        </div>
    </div>

    {/* Կահույք */}
    <div className="pf-field-group">

        <label className="pf-field-label">
            Կահույք{' '}
            <span className="pf-star">*</span>
        </label>

        <div className="pf-pill-group">

            {[
                'Կահույքով',
                'Առկա չէ',
                'Մասնակի',
                'Համաձայնությամբ',
            ].map((opt) => (
                <button
                    type="button"
                    key={opt}
                    className={`pf-pill-btn ${
                        furniture === opt
                            ? 'active'
                            : ''
                    }`}
                    onClick={() =>
                        setFurniture(opt)
                    }
                >
                    {opt}
                </button>
            ))}

        </div>
    </div>

    {/* Վերանորոգում */}
    <div className="pf-field-group">

        <label className="pf-field-label">
            Վերանորոգում{' '}
            <span className="pf-star">*</span>
        </label>

        <div className="pf-pill-group">

            {[
                'Չվերանորոգված',
                'Հին',
                'Մասնակի',
                'Կոսմետիկ',
                'Եվրո',
                'Դիզայներական',
                'Կապիտալ',
            ].map((opt) => (
                <button
                    type="button"
                    key={opt}
                    className={`pf-pill-btn ${
                        renovation === opt
                            ? 'active'
                            : ''
                    }`}
                    onClick={() =>
                        setRenovation(opt)
                    }
                >
                    {opt}
                </button>
            ))}

        </div>
    </div>

    {/* ՀԱՐՄԱՐՈՒԹՅՈՒՆՆԵՐ */}
    <div className="pf-field-group">

        <h4 className="pf-block-title">
            Հարմարություններ
        </h4>

        <div className="pf-pill-group">

            {[
                'Հեռուստացույց',
                'Օդորակիչ',
                'Ինտերնետ',
            ].map((item) => {

                const isActive =
                    conveniences.includes(item);

                return (
                    <button
                        type="button"
                        key={item}
                        className={`pf-pill-btn ${
                            isActive
                                ? 'active'
                                : ''
                        }`}
                        onClick={() =>
                            toggleArrayItem(
                                conveniences,
                                setConveniences,
                                item
                            )
                        }
                    >
                        {item}
                    </button>
                );
            })}

        </div>
    </div>

    {/* Կենցաղային տեխնիկա */}
    <div className="pf-field-group">

        <label className="pf-field-label">
            Կենցաղային տեխնիկա
        </label>

        <div className="pf-checkbox-list">

            {[
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
            ].map((item) => {

                const isChecked =
                    appliances.includes(item);

                return (
                    <label
                        key={item}
                        className="pf-checkbox-item"
                    >

                        <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() =>
                                toggleArrayItem(
                                    appliances,
                                    setAppliances,
                                    item
                                )
                            }
                        />

                        <span>
                                                {item}
                                            </span>

                    </label>
                );
            })}

        </div>
    </div>

    {/* Տեսարաններ պատուհաններից */}
    <div className="pf-field-group">

        <label className="pf-field-label">
            Տեսարաններ պատուհաններից
        </label>

        <div className="pf-pill-group">

            {[
                'Դեպի բակ',
                'Դեպի փողոց',
                'Դեպի քաղաք',
                'Դեպի այգի',
                'Դեպի Արարատ',
            ].map((view) => {

                const isActive =
                    windowViews.includes(view);

                return (
                    <button
                        type="button"
                        key={view}
                        className={`pf-pill-btn ${
                            isActive
                                ? 'active'
                                : ''
                        }`}
                        onClick={() =>
                            toggleArrayItem(
                                windowViews,
                                setWindowViews,
                                view
                            )
                        }
                    >
                        {view}
                    </button>
                );
            })}

        </div>
    </div>

    {/* Հարմար է անվասայլակով մարդկանց համար */}
    <div className="pf-field-group wheelchair-accessibility-row">

        <label className="pf-field-label">
            Հարմար է անվասայլակով մարդկանց համար
            <span className="pf-star">*</span>
        </label>

        <div className="pf-pill-group">

            {['Այո', 'Ոչ'].map((option) => (
                <button
                    type="button"
                    key={option}
                    className={`pf-pill-btn ${
                        wheelchairAccessible === option
                            ? 'active'
                            : ''
                    }`}
                    onClick={() =>
                        setWheelchairAccessible(option)
                    }
                >
                    {option}
                </button>
            ))}

        </div>
    </div>

</div>

{/* 5. ԲՆԱԿՈՒԹՅԱՆ ԿԱՆՈՆՆԵՐ */}
<div className="pf-block">

    <h3 className="pf-block-title">
        Բնակության կանոններ
    </h3>

    <div className="pf-field-group">

        <label className="pf-field-label">
            Երեխաների հետ{' '}
            <span className="pf-star">*</span>
        </label>

        <div className="pf-pill-group">

            {[
                'Այո',
                'Ոչ',
                'Համաձայնությամբ',
            ].map((opt) => (
                <button
                    type="button"
                    key={opt}
                    className={`pf-pill-btn ${
                        childrenRule === opt
                            ? 'active'
                            : ''
                    }`}
                    onClick={() =>
                        setChildrenRule(opt)
                    }
                >
                    {opt}
                </button>
            ))}

        </div>
    </div>

    <div className="pf-field-group">

        <label className="pf-field-label">
            Թույլատրվում են կենդանիներ{' '}
            <span className="pf-star">*</span>
        </label>

        <div className="pf-pill-group">

            {[
                'Այո',
                'Ոչ',
                'Համաձայնությամբ',
            ].map((opt) => (
                <button
                    type="button"
                    key={opt}
                    className={`pf-pill-btn ${
                        petsRule === opt
                            ? 'active'
                            : ''
                    }`}
                    onClick={() =>
                        setPetsRule(opt)
                    }
                >
                    {opt}
                </button>
            ))}

        </div>
    </div>

</div>

{/* 6. ՀԱՍԱՆԵԼԻՈՒԹՅԱՆ ԿԱՐԳԱՎԻՃԱԿ */}
<div className="pf-block">

    <h3 className="pf-block-title">
        Տեղեկություններ անշարժ գույքի վերաբերյալ
    </h3>

    <div className="pf-field-group">

        <label className="pf-field-label">
            Հասանելիության կարգավիճակ{' '}
            <span className="pf-star">*</span>
        </label>

        <div className="pf-pill-group">

            <button
                type="button"
                className={`pf-pill-btn ${
                    availabilityStatus === 'now'
                        ? 'active'
                        : ''
                }`}
                onClick={() =>
                    setAvailabilityStatus('now')
                }
            >
                Հասանելի է հիմա
            </button>

            <button
                type="button"
                className={`pf-pill-btn ${
                    availabilityStatus === 'date'
                        ? 'active'
                        : ''
                }`}
                onClick={() =>
                    setAvailabilityStatus('date')
                }
            >
                Կոնկրետ ամսաթվից
            </button>

        </div>

        {availabilityStatus === 'date' && (
            <div className="pf-mt-sm">

                <input
                    type="date"
                    className="pf-text-input"
                    value={availableFromDate}
                    onChange={(e) =>
                        setAvailableFromDate(
                            e.target.value
                        )
                    }
                />

            </div>
        )}

    </div>

</div>

{/* 7. ԳՈՐԾԱՐՔԻ ՊԱՅՄԱՆՆԵՐ */}
<div className="pf-block">

    <h3 className="pf-block-title">
        Գործարքի պայմաններ
    </h3>

    {/* Վարձավճար */}
    <div className="pf-field-group">

        <label className="pf-field-label">
            Վարձավճար{' '}
            <span className="pf-star">*</span>
        </label>

        <div className="pf-price-input-row">

            <input
                type="number"
                className="pf-text-input"
                placeholder="օր․ 350000"
                value={rentAmount}
                onChange={(e) =>
                    setRentAmount(e.target.value)
                }
            />

            <select
                className="pf-select-input"
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
            </select>

            <select
                className="pf-select-input"
                value={paymentPeriod}
                onChange={(e) =>
                    setPaymentPeriod(e.target.value)
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

                <option value="տարեկան">
                    տարեկան
                </option>
            </select>

        </div>
    </div>

    {/* Կոմունալ վճարումներ */}
    <div className="pf-field-group">

        <label className="pf-field-label">
            Կոմունալ վճարումներ{' '}
            <span className="pf-star">*</span>
        </label>

        <div className="pf-pill-group">

            {[
                'Ներառված',
                'Չներառված',
                'Համաձայնությամբ',
            ].map((opt) => (
                <button
                    type="button"
                    key={opt}
                    className={`pf-pill-btn ${
                        utilities === opt
                            ? 'active'
                            : ''
                    }`}
                    onClick={() =>
                        setUtilities(opt)
                    }
                >
                    {opt}
                </button>
            ))}

        </div>
    </div>

    {/* Կանխավճար */}
    <div className="pf-field-group">

        <label className="pf-field-label">
            Կանխավճար{' '}
            <span className="pf-star">*</span>
        </label>

        <div className="pf-pill-group">

            {[
                'Առանց կանխավճարի',
                'Համաձայնությամբ',
                '2 շաբաթ',
                '1 ամիս',
                '6 շաբաթ',
                '2 ամիս',
                '3 ամիս',
                '4 ամիս',
                '6 ամիս',
            ].map((opt) => (
                <button
                    type="button"
                    key={opt}
                    className={`pf-pill-btn ${
                        advancePayment === opt
                            ? 'active'
                            : ''
                    }`}
                    onClick={() =>
                        setAdvancePayment(opt)
                    }
                >
                    {opt}
                </button>
            ))}

        </div>
    </div>

</div>

{/* 8. ԼՈՒՍԱՆԿԱՐՆԵՐ & ԿՈՆՏԱԿՏ */}
<div className="pf-block">

    <h3 className="pf-block-title">
        Լուսանկարներ{' '}
        <span className="pf-star">*</span>
    </h3>

    <input
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }}
        multiple
        accept="image/*"
        onChange={handlePhotoUpload}
    />

    <div
        className="pf-dropzone"
        onClick={() =>
            fileInputRef.current?.click()
        }
    >

        <div className="pf-dropzone-icon">
            📷
        </div>

        <div className="pf-dropzone-text">
            Քաշեք ու թողեք ֆայլը կամ{' '}
            <span className="pf-dropzone-link">
                                    Վերբեռնեք սարքից
                                </span>
        </div>

    </div>

    {uploadedPhotos.length > 0 && (
        <div className="pf-photos-preview">

            {uploadedPhotos.map((src, i) => (
                <div
                    key={i}
                    className="pf-photo-thumb"
                >

                    <img
                        src={src}
                        alt={`Uploaded ${i + 1}`}
                    />

                    <button
                        type="button"
                        className="pf-photo-del"
                        onClick={() =>
                            setUploadedPhotos(
                                uploadedPhotos.filter(
                                    (_, idx) =>
                                        idx !== i
                                )
                            )
                        }
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

{/* 9. ԿՈՆՏԱԿՏԱՅԻՆ ՏՎՅԱԼՆԵՐ */}
<div className="pf-block">

    <h3 className="pf-block-title">
        Կոնտակտային տվյալներ
    </h3>

    <div className="pf-contact-options">

        <label
            className={`pf-contact-row ${
                useCustomPhone === false
                    ? 'active'
                    : ''
            }`}
            onClick={() =>
                setUseCustomPhone(false)
            }
        >

            <div className="pf-radio-circle">

                {useCustomPhone === false && (
                    <span className="pf-radio-dot" />
                )}

            </div>

            <span>
                                    📞 (077) 12-35-23
                                </span>

        </label>

        <label
            className={`pf-contact-row ${
                useCustomPhone === true
                    ? 'active'
                    : ''
            }`}
            onClick={() =>
                setUseCustomPhone(true)
            }
        >

            <div className="pf-radio-circle">

                {useCustomPhone === true && (
                    <span className="pf-radio-dot" />
                )}

            </div>

            <span>
                                    📞 Կցել հեռախոսահամար
                                </span>

        </label>

        {useCustomPhone === true && (
            <div className="pf-mt-sm">

                <input
                    type="tel"
                    className="pf-text-input"
                    placeholder="+374 (__) __-__-__"
                    value={customPhoneNumber}
                    onChange={(e) =>
                        setCustomPhoneNumber(
                            e.target.value
                        )
                    }
                />

            </div>
        )}

    </div>
</div>

{/* ԿՈՃԱԿՆԵՐ */}
<div className="pf-bottom-actions">

    {onBack && (
        <button
            type="button"
            className="pf-btn-secondary"
            onClick={onBack}
        >
            Չեղարկել
        </button>
    )}

    <button
        type="button"
        className="pf-btn-draft"
        onClick={() =>
            alert(
                'Սևագիրը հաջողությամբ պահպանվեց'
            )
        }
    >
        Պահպանել որպես սևագիր
    </button>

    <button
        type="submit"
        className="pf-btn-primary"
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

export default ApartmentRentForm;
