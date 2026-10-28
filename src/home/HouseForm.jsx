import React, { useState, useRef, useEffect } from 'react';
import './HouseForm.css';
import { I18nTree } from '../i18n/I18n.jsx';
import AiPhotoCleaner from '../ai-cleaner/AiPhotoCleaner.jsx';
import { loadFormDraft, useFormDraftState, useSaveFormDraft } from '../services/uiSession.js';

export const ARMENIA_REGIONS = [
    {
        name: 'Երևան',
        cities: [
            'Կենտրոն', 'Արաբկիր', 'Աջափնյակ', 'Ավան', 'Դավթաշեն',
            'Էրեբունի', 'Քանաքեռ-Զեյթուն', 'Մալաթիա-Սեբաստիա', 'Նոր Նորք',
            'Նորք-Մարաշ', 'Նուբարաշեն', 'Շենգավիթ'
        ],
    },
    {
        name: 'Կոտայք',
        cities: ['Աբովյան', 'Հրազդան', 'Ծաղկաձոր', 'Եղվարդ', 'Չարենցավան', 'Բյուրեղավան', 'Նոր Հաճն', 'Գառնի', 'Ձորաղբյուր', 'Զովունի', 'Քասախ', 'Առինջ', 'Ջրվեժ'],
    },
    {
        name: 'Արմավիր',
        cities: ['Վաղարշապատ (Էջմիածին)', 'Արմավիր', 'Մեծամոր', 'Փարաքար', 'Թաիրով', 'Բաղրամյան', 'Մերձավան'],
    },
    {
        name: 'Արարատ',
        cities: ['Մասիս', 'Արտաշատ', 'Արարատ', 'Վեդի', 'Այնթապ', 'Մարմարաշեն', 'Ոսկետափ'],
    },
    {
        name: 'Շիրակ',
        cities: ['Գյումրի', 'Արթիկ', 'Մարալիկ', 'Ախուրյան', 'Ամասիա', 'Աշոցք'],
    },
    {
        name: 'Լոռի',
        cities: ['Վանաձոր', 'Ստեփանավան', 'Ալավերդի', 'Սպիտակ', 'Տաշիր', 'Օձուն'],
    },
    {
        name: 'Գեղարքունիք',
        cities: ['Սևան', 'Գավառ', 'Մարտունի', 'Վարդենիս', 'Ճամբարակ', 'Վերին Գետաշեն'],
    },
    {
        name: 'Սյունիք',
        cities: ['Կապան', 'Գորիս', 'Սիսիան', 'Մեղրի', 'Քաջարան', 'Ագարակ', 'Տաթև'],
    },
    {
        name: 'Արագածոտն',
        cities: ['Աշտարակ', 'Ապարան', 'Թալին', 'Օշական', 'Բյուրական', 'Սասունիկ'],
    },
    {
        name: 'Տավուշ',
        cities: ['Իջևան', 'Դիլիջան', 'Բերդ', 'Նոյեմբերյան', 'Այրում', 'Կողբ'],
    },
    {
        name: 'Վայոց Ձոր',
        cities: ['Եղեգնաձոր', 'Ջերմուկ', 'Վայք', 'Արենի', 'Շատին'],
    },
];

export function HouseForm({ onBack, onSave }) {
    const draft = loadFormDraft("daily-apartment");

    // 1. Ձեր կարգավիճակը
    // Սկզբում ոչ մի տարբերակ ընտրված չէ
    const [userRole, setUserRole] = useState(draft.userRole || '');

    // 2. Գտնվելու վայրը
    const [region, setRegion] = useState(draft.region || '');
    const [regionSearch, setRegionSearch] = useState('');
    const [regionDropdownOpen, setRegionDropdownOpen] = useState(false);
    const [expandedMarz, setExpandedMarz] = useState('Երևան');
    const [street, setStreet] = useState(draft.street || '');
    const [buildingNumber, setBuildingNumber] = useState(draft.buildingNumber || '');
    const [hideBuildingNumber, setHideBuildingNumber] = useState(Boolean(draft.hideBuildingNumber));
    const [mapZoom, setMapZoom] = useState(draft.mapZoom || 14);

    // 3. Շենքի մասին
    // Բոլոր ընտրությունները սկզբում դատարկ են
    const [buildingType, setBuildingType] = useState(draft.buildingType || '');
    const [isNewBuilding, setIsNewBuilding] = useState(draft.isNewBuilding || '');
    const [elevator, setElevator] = useState(draft.elevator || '');

    // Հարկերի քանակ
    const [buildingFloors, setBuildingFloors] = useState(draft.buildingFloors || '');
    const buildingFloorsOptions = ['1', '2', '3', '4', '5', '9', '12', '14', '16+'];

    // Բազմակի ընտրություն՝ սկզբում ոչինչ ընտրված չէ
    const [buildingFeatures, setBuildingFeatures] = useState(draft.buildingFeatures || []);
    const [parking, setParking] = useState(draft.parking || '');

    // 4. Բնակարանի մասին
    const [apartmentArea, setApartmentArea] = useState(draft.apartmentArea || '');

    // Սենյակների քանակ
    const [rooms, setRooms] = useState(draft.rooms || '');
    const roomsOptions = ['1', '2', '3', '4', '5', '6', '7', '8+'];

    // Սանհանգույցների քանակ
    const [bathroomsCount, setBathroomsCount] = useState(draft.bathroomsCount || '');

    // Առաստաղի բարձրություն
    const [ceilingHeight, setCeilingHeight] = useState(draft.ceilingHeight || '');
    const ceilingHeightOptions = [
        '2.5 մ',
        '2.7 մ',
        '2.8 մ',
        '3.0 մ',
        '3.2 մ',
        '3.5+ մ'
    ];

    // Հարկ
    const [apartmentFloor, setApartmentFloor] = useState(draft.apartmentFloor || '');
    const apartmentFloorOptions = [
        '1',
        '2',
        '3',
        '4',
        '5',
        '6',
        '7',
        '8',
        '9',
        '10+'
    ];

    // Պատշգամբ
    const [balcony, setBalcony] = useState(draft.balcony || '');

    // Վերանորոգում
    const [renovation, setRenovation] = useState(draft.renovation || '');
    const renovationOptions = [
        'Չվերանորոգված',
        'Հին',
        'Մասնակի',
        'Կոսմետիկ',
        'Եվրո',
        'Դիզայներական',
        'Կապիտալ'
    ];

    // Կոմֆորտ
    // Սկզբում ոչինչ ընտրված չէ
    const [comfortList, setComfortList] = useState(draft.comfortList || []);

    // Հարմարություններ
    // Սկզբում ոչինչ ընտրված չէ
    const [amenities, setAmenities] = useState(draft.amenities || []);

    // Կենցաղային տեխնիկա
    // Սկզբում ոչինչ ընտրված չէ
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

    // Տեսարաններ պատուհաններից
    // Սկզբում ոչինչ ընտրված չէ
    const [viewsFromWindows, setViewsFromWindows] = useState(draft.viewsFromWindows || []);

    // Անվասայլակով մարդկանց համար
    // Սկզբում ոչինչ ընտրված չէ
    const [wheelchairAccessible, setWheelchairAccessible] = useState(draft.wheelchairAccessible || '');

    // 5. Բնակության կանոններ
    const [maxGuests, setMaxGuests] = useState(draft.maxGuests || '');
    const [childrenRule, setChildrenRule] = useState(draft.childrenRule || '');
    const [petsRule, setPetsRule] = useState(draft.petsRule || '');

    // 6. Գործարքի պայմաններ
    const [rentAmount, setRentAmount] = useState(draft.rentAmount || '');
    const [currency, setCurrency] = useState(draft.currency || '');
    const [paymentPeriod, setPaymentPeriod] = useState(draft.paymentPeriod || '');

    // 7. Լուսանկարներ
    const [uploadedPhotos, setUploadedPhotos] = useFormDraftState("daily-apartment", "uploadedPhotos", draft.uploadedPhotos || []);
    const [mainPhotoIndex, setMainPhotoIndex] = useState(draft.mainPhotoIndex || 0);

    // 8. Կոնտակտային տվյալներ
    const [contactMode, setContactMode] = useState(draft.contactMode || '');
    const primaryPhone = '';
    const [customPhone, setCustomPhone] = useState(draft.customPhone || '');

    useSaveFormDraft("daily-apartment", {
        userRole,
        region,
        street,
        buildingNumber,
        hideBuildingNumber,
        mapZoom,
        buildingType,
        isNewBuilding,
        elevator,
        buildingFloors,
        buildingFeatures,
        parking,
        apartmentArea,
        rooms,
        bathroomsCount,
        ceilingHeight,
        apartmentFloor,
        balcony,
        renovation,
        comfortList,
        amenities,
        appliances,
        viewsFromWindows,
        wheelchairAccessible,
        maxGuests,
        childrenRule,
        petsRule,
        rentAmount,
        currency,
        paymentPeriod,
        uploadedPhotos,
        mainPhotoIndex,
        contactMode,
        customPhone,
    });

    const regionDropdownRef = useRef(null);
    const fileInputRef = useRef(null);

    useEffect(() => {
        function handleClickOutside(event) {
            if (
                regionDropdownRef.current &&
                !regionDropdownRef.current.contains(event.target)
            ) {
                setRegionDropdownOpen(false);
            }
        }

        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Բազմակի ընտրության helper
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
                        reader.result
                    ]);
                }
            };

            reader.readAsDataURL(file);
        });
    };

    const handleDeletePhoto = (index) => {
        setUploadedPhotos((prev) =>
            prev.filter((_, idx) => idx !== index)
        );

        if (mainPhotoIndex >= index && mainPhotoIndex > 0) {
            setMainPhotoIndex((prev) => prev - 1);
        }
    };

    const handleSelectCity = (marzName, cityName) => {
        setRegion(`${marzName}, ${cityName}`);
        setRegionDropdownOpen(false);
        setRegionSearch('');
    };

    const handleSelectMarzOnly = (marzName) => {
        setRegion(marzName);
        setRegionDropdownOpen(false);
        setRegionSearch('');
    };

    const filteredRegions = ARMENIA_REGIONS
        .map((marz) => {
            if (!regionSearch.trim()) return marz;

            const term = regionSearch.toLowerCase();

            const matchesMarz = marz.name
                .toLowerCase()
                .includes(term);

            const matchedCities = marz.cities.filter((c) =>
                c.toLowerCase().includes(term)
            );

            if (matchesMarz) return marz;

            if (matchedCities.length > 0) {
                return {
                    ...marz,
                    cities: matchedCities
                };
            }

            return null;
        })
        .filter(Boolean);

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!userRole) {
            alert('Խնդրում ենք ընտրել ձեր կարգավիճակը');
            return;
        }

        if (!region) {
            alert('Խնդրում ենք ընտրել տարածաշրջանը');
            setRegionDropdownOpen(true);
            return;
        }

        if (!street) {
            alert('Խնդրում ենք նշել փողոցը');
            return;
        }

        if (!buildingType) {
            alert('Խնդրում ենք ընտրել շինության տիպը');
            return;
        }

        if (!isNewBuilding) {
            alert('Խնդրում ենք նշել՝ արդյոք նորակառույց է');
            return;
        }

        if (!elevator) {
            alert('Խնդրում ենք նշել վերելակի առկայությունը');
            return;
        }

        if (!buildingFloors) {
            alert('Խնդրում ենք նշել հարկերի քանակը');
            return;
        }

        if (!apartmentArea) {
            alert('Խնդրում ենք նշել ընդհանուր մակերեսը');
            return;
        }

        if (!rooms) {
            alert('Խնդրում ենք ընտրել սենյակների քանակը');
            return;
        }

        if (!bathroomsCount) {
            alert('Խնդրում ենք նշել սանհանգույցների քանակը');
            return;
        }

        if (!ceilingHeight) {
            alert('Խնդրում ենք նշել առաստաղի բարձրությունը');
            return;
        }

        if (!apartmentFloor) {
            alert('Խնդրում ենք ընտրել հարկը');
            return;
        }

        if (!balcony) {
            alert('Խնդրում ենք ընտրել պատշգամբի տարբերակը');
            return;
        }

        if (!renovation) {
            alert('Խնդրում ենք ընտրել վերանորոգման վիճակը');
            return;
        }

        if (!wheelchairAccessible) {
            alert(
                'Խնդրում ենք նշել՝ արդյոք հարմար է անվասայլակով մարդկանց համար'
            );
            return;
        }

        if (!maxGuests) {
            alert('Խնդրում ենք նշել հյուրերի առավելագույն քանակը');
            return;
        }

        if (!childrenRule) {
            alert('Խնդրում ենք նշել երեխաների վերաբերյալ կանոնը');
            return;
        }

        if (!petsRule) {
            alert('Խնդրում ենք նշել կենդանիների վերաբերյալ կանոնը');
            return;
        }

        if (!rentAmount) {
            alert('Խնդրում ենք նշել վարձավճարը');
            return;
        }

        const data = {
            dealType: 'Օրավարձով › Բնակարաններ',

            userRole,

            region,
            street,
            buildingNumber,
            hideBuildingNumber,

            buildingType,
            isNewBuilding,
            elevator,
            buildingFloors,
            buildingFeatures,
            parking,

            apartmentArea,
            rooms,
            bathroomsCount,
            ceilingHeight,
            apartmentFloor,
            balcony,
            renovation,

            comfortList,
            amenities,
            appliances,
            viewsFromWindows,

            wheelchairAccessible,

            maxGuests,
            childrenRule,
            petsRule,

            rentAmount,
            currency,
            paymentPeriod,

            uploadedPhotos,
            mainPhotoIndex,

            contactPhone:
                contactMode === 'primary'
                    ? primaryPhone
                    : customPhone,
        };

        if (onSave) {
            onSave(data);
        } else {
            alert(
                `✅ Հայտարարությունը հաջողությամբ պահպանվեց!\n\n` +
                `• Տարածաշրջան՝ ${region}\n` +
                `• Փողոց՝ ${street}\n` +
                `• Մակերես՝ ${apartmentArea || '0'} քմ\n` +
                `• Գին՝ ${rentAmount || '0'} ${currency} / ${paymentPeriod}`
);
}
};

return (
    <I18nTree>
    <div className="house-form-page">
        <div className="house-form-container">

            {/* TOP HEADER */}
            <div className="hf-top-header">
                {onBack && (
                    <button
                        type="button"
                        className="hf-top-back-btn"
                        onClick={onBack}
                        title="Վերադառնալ"
                    >
                        ←
                    </button>
                )}

                <div className="hf-breadcrumbs">
                    <span>Տեղադրել հայտարարություն</span>
                    <span className="hf-bc-sep">›</span>
                    <span>Օրավարձով</span>
                    <span className="hf-bc-sep">›</span>
                    <span>Բնակարաններ</span>
                </div>
            </div>

            <form
                onSubmit={handleSubmit}
                className="hf-main-form"
            >

                {/* 1. ՁԵՐ ԿԱՐԳԱՎԻՃԱԿԸ */}
                <div className="hf-block">
                    <h3 className="hf-block-title">
                        Ձեր կարգավիճակը{' '}
                        <span className="hf-star">*</span>
                    </h3>

                    <div className="hf-role-options">

                        <label
                            className="hf-role-item"
                            onClick={() =>
                                setUserRole('owner')
                            }
                        >
                            <input
                                type="radio"
                                name="userRole"
                                className="hf-role-radio"
                                checked={
                                    userRole === 'owner'
                                }
                                onChange={() =>
                                    setUserRole('owner')
                                }
                            />

                            <div className="hf-role-text-box">
                                    <span className="hf-role-title">
                                        Սեփականատեր
                                    </span>

                                <span className="hf-role-desc">
                                        Եթե դուք վաճառում եք ձեր սեփական
                                        անշարժ գույքը՝ սեփականատեր
                                    </span>
                            </div>
                        </label>

                        <label
                            className="hf-role-item"
                            onClick={() =>
                                setUserRole('agency')
                            }
                        >
                            <input
                                type="radio"
                                name="userRole"
                                className="hf-role-radio"
                                checked={
                                    userRole === 'agency'
                                }
                                onChange={() =>
                                    setUserRole('agency')
                                }
                            />

                            <div className="hf-role-text-box">
                                    <span className="hf-role-title">
                                        Գործակալություն
                                    </span>

                                <span className="hf-role-desc">
                                        Եթե դուք միջնորդ եք, բրոքեր կամ
                                        անշարժ գույքի գործակալության ներկայացուցիչ
                                    </span>
                            </div>
                        </label>

                    </div>
                </div>

                {/* 2. ԳՏՆՎԵԼՈՒ ՎԱՅՐԸ */}
                <div className="hf-block">
                    <h3 className="hf-block-title">
                        Գտնվելու վայրը
                    </h3>

                    <div
                        className="hf-field-row-horizontal"
                        ref={regionDropdownRef}
                    >
                        <label className="hf-field-label">
                            Տարածաշրջան{' '}
                            <span className="hf-star">*</span>
                        </label>

                        <div
                            style={{
                                position: 'relative',
                                width: '100%'
                            }}
                        >
                            <div
                                className={`hf-select-trigger ${
                                    regionDropdownOpen
                                        ? 'open'
                                        : ''
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
                                                : 'hf-placeholder'
                                        }
                                    >
                                        {region ||
                                            'Ընտրեք տարածաշրջանը'}
                                    </span>

                                <span>
                                        {regionDropdownOpen
                                            ? '▲'
                                            : '▼'}
                                    </span>
                            </div>

                            {regionDropdownOpen && (
                                <div className="hf-region-popover">

                                    <input
                                        type="text"
                                        className="hf-dropdown-search"
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

                                    <div className="hf-region-list">
                                        {filteredRegions.map(
                                            (marz) => {
                                                const isExpanded =
                                                    regionSearch
                                                        .trim()
                                                        .length > 0 ||
                                                    expandedMarz ===
                                                    marz.name;

                                                return (
                                                    <div
                                                        key={
                                                            marz.name
                                                        }
                                                        className="hf-marz-item"
                                                    >

                                                        <div
                                                            className="hf-marz-header"
                                                            onClick={(
                                                                e
                                                            ) => {
                                                                e.stopPropagation();

                                                                setExpandedMarz(
                                                                    isExpanded
                                                                        ? null
                                                                        : marz.name
                                                                );
                                                            }}
                                                        >
                                                                <span>
                                                                    🏢{' '}
                                                                    {
                                                                        marz.name
                                                                    }
                                                                </span>

                                                            <div className="hf-marz-actions">

                                                                <button
                                                                    type="button"
                                                                    className="hf-marz-select-btn"
                                                                    onClick={(
                                                                        e
                                                                    ) => {
                                                                        e.stopPropagation();

                                                                        handleSelectMarzOnly(
                                                                            marz.name
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
                                                            <div className="hf-cities-container">
                                                                <div className="hf-cities-grid">

                                                                    {marz.cities.map(
                                                                        (
                                                                            city
                                                                        ) => (
                                                                            <button
                                                                                type="button"
                                                                                key={
                                                                                    city
                                                                                }
                                                                                className={`hf-city-chip ${
                                                                                    region ===
                                                                                    `${marz.name}, ${city}`
                                                                                        ? 'active'
                                                                                        : ''
                                                                                }`}
                                                                                onClick={(
                                                                                    e
                                                                                ) => {
                                                                                    e.stopPropagation();

                                                                                    handleSelectCity(
                                                                                        marz.name,
                                                                                        city
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
                                            }
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="hf-field-row-horizontal">
                        <label className="hf-field-label">
                            Փողոց{' '}
                            <span className="hf-star">*</span>
                        </label>

                        <input
                            type="text"
                            className="hf-text-input"
                            placeholder=""
                            value={street}
                            onChange={(e) =>
                                setStreet(e.target.value)
                            }
                            required
                        />
                    </div>

                    <div className="hf-field-row-horizontal">
                        <label className="hf-field-label">
                            Շենքի համար
                        </label>

                        <input
                            type="text"
                            className="hf-text-input"
                            placeholder=""
                            value={buildingNumber}
                            onChange={(e) =>
                                setBuildingNumber(
                                    e.target.value
                                )
                            }
                            disabled={
                                hideBuildingNumber
                            }
                        />
                    </div>

                    <label className="hf-checkbox-row">
                        <input
                            type="checkbox"
                            checked={
                                hideBuildingNumber
                            }
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

                    {/* INTERACTIVE MAP */}
                    <div className="hf-map-box">

                        <svg
                            className="hf-map-svg"
                            viewBox="0 0 700 230"
                            preserveAspectRatio="xMidYMid slice"
                        >
                            <rect
                                width="100%"
                                height="100%"
                                fill="#f4f3f0"
                            />

                            <path
                                d="M 0,20 Q 80,60 140,20 L 170,110 Q 90,140 20,80 Z"
                                fill="#d8ecd5"
                                opacity="0.8"
                            />

                            <path
                                d="M 360,10 Q 420,50 490,20 L 460,90 Q 400,100 340,50 Z"
                                fill="#d8ecd5"
                                opacity="0.8"
                            />

                            <path
                                d="M 520,130 Q 610,120 680,160 L 690,230 L 530,230 Z"
                                fill="#d8ecd5"
                                opacity="0.8"
                            />

                            <path
                                d="M 280,0 Q 290,60 260,110 T 290,230"
                                fill="none"
                                stroke="#a5d7f7"
                                strokeWidth="14"
                                strokeLinecap="round"
                            />

                            <line
                                x1="0"
                                y1="80"
                                x2="700"
                                y2="120"
                                stroke="#fcd68a"
                                strokeWidth="8"
                            />

                            <line
                                x1="120"
                                y1="0"
                                x2="480"
                                y2="230"
                                stroke="#fcd68a"
                                strokeWidth="9"
                            />

                            <line
                                x1="380"
                                y1="0"
                                x2="200"
                                y2="230"
                                stroke="#ffffff"
                                strokeWidth="6"
                            />

                            <line
                                x1="50"
                                y1="180"
                                x2="680"
                                y2="40"
                                stroke="#ffffff"
                                strokeWidth="5"
                            />

                            <text
                                x="380"
                                y="70"
                                fill="#6d7a86"
                                fontSize="11"
                                fontFamily="sans-serif"
                            >
                                Մարշալ Բաղրամյան
                            </text>

                            <text
                                x="510"
                                y="105"
                                fill="#6d7a86"
                                fontSize="11"
                                fontFamily="sans-serif"
                            >
                                Երիտասարդական
                            </text>

                            <text
                                x="320"
                                y="150"
                                fill="#6d7a86"
                                fontSize="11"
                                fontFamily="sans-serif"
                            >
                                Հրազդան
                            </text>

                            <text
                                x="580"
                                y="150"
                                fill="#6d7a86"
                                fontSize="11"
                                fontFamily="sans-serif"
                            >
                                Նորք-Մարաշ
                            </text>

                            <text
                                x="400"
                                y="200"
                                fill="#6d7a86"
                                fontSize="11"
                                fontFamily="sans-serif"
                            >
                                Հանրապետության հրապարակ
                            </text>

                            <circle
                                cx="360"
                                cy="85"
                                r="7"
                                fill="#8e44ad"
                            />

                            <text
                                x="360"
                                y="88"
                                fill="#fff"
                                fontSize="8"
                                textAnchor="middle"
                                fontWeight="bold"
                            >
                                M
                            </text>

                            <g
                                transform="translate(435, 145)"
                            >
                                <ellipse
                                    cx="0"
                                    cy="22"
                                    rx="7"
                                    ry="3"
                                    fill="rgba(0,0,0,0.25)"
                                />

                                <path
                                    d="M 0,0 C -8,-14 -12,-20 -12,-28 C -12,-37 -5,-44 0,-44 C 5,-44 12,-37 12,-28 C 12,-20 8,-14 0,0 Z"
                                    fill="#e74c3c"
                                    stroke="#c0392b"
                                    strokeWidth="1.5"
                                />

                                <circle
                                    cx="0"
                                    cy="-28"
                                    r="4.5"
                                    fill="#ffffff"
                                />
                            </g>
                        </svg>

                        <div className="hf-map-controls">
                            <button
                                type="button"
                                className="hf-map-zoom-btn"
                                onClick={() =>
                                    setMapZoom((z) =>
                                        Math.min(
                                            z + 1,
                                            18
                                        )
                                    )
                                }
                            >
                                +
                            </button>

                            <button
                                type="button"
                                className="hf-map-zoom-btn"
                                onClick={() =>
                                    setMapZoom((z) =>
                                        Math.max(
                                            z - 1,
                                            10
                                        )
                                    )
                                }
                            >
                                −
                            </button>
                        </div>

                        <div className="hf-map-label-badge">
                            📍{' '}
                            {region ||
                                'Երևան, Կենտրոն'}{' '}
                            {street
                                ? `• ${street}`
                                : ''}
                        </div>
                    </div>
                </div>

                {/* 3. ՇԵՆՔԻ ՄԱՍԻՆ */}
                <div className="hf-block">
                    <h3 className="hf-block-title">
                        Շենքի մասին
                    </h3>

                    {/* Շինության տիպ */}
                    <div className="hf-field-row-horizontal">
                        <label className="hf-field-label">
                            Շինության տիպ{' '}
                            <span className="hf-star">
                                    *
                                </span>
                        </label>

                        <div className="hf-pill-group">
                            {[
                                'Քարե',
                                'Պանելային',
                                'Մոնոլիտ',
                                'Աղյուսե',
                                'Կասետային',
                                'Փայտե'
                            ].map((type) => (
                                <button
                                    type="button"
                                    key={type}
                                    className={`hf-pill-btn ${
                                        buildingType ===
                                        type
                                            ? 'active'
                                            : ''
                                    }`}
                                    onClick={() =>
                                        setBuildingType(
                                            type
                                        )
                                    }
                                >
                                    {type}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Նորակառույց */}
                    <div className="hf-field-row-horizontal">
                        <label className="hf-field-label">
                            Նորակառույց{' '}
                            <span className="hf-star">
                                    *
                                </span>
                        </label>

                        <div className="hf-pill-group">
                            {['Ոչ', 'Այո'].map(
                                (opt) => (
                                    <button
                                        type="button"
                                        key={opt}
                                        className={`hf-pill-btn ${
                                            isNewBuilding ===
                                            opt
                                                ? 'active'
                                                : ''
                                        }`}
                                        onClick={() =>
                                            setIsNewBuilding(
                                                opt
                                            )
                                        }
                                    >
                                        {opt}
                                    </button>
                                )
                            )}
                        </div>
                    </div>

                    {/* Վերելակ */}
                    <div className="hf-field-row-horizontal">
                        <label className="hf-field-label">
                            Վերելակ{' '}
                            <span className="hf-star">
                                    *
                                </span>
                        </label>

                        <div className="hf-pill-group">
                            {[
                                'Առկա է',
                                'Առկա չէ'
                            ].map((opt) => (
                                <button
                                    type="button"
                                    key={opt}
                                    className={`hf-pill-btn ${
                                        elevator ===
                                        opt
                                            ? 'active'
                                            : ''
                                    }`}
                                    onClick={() =>
                                        setElevator(
                                            opt
                                        )
                                    }
                                >
                                    {opt}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Հարկերի քանակ */}
                    <div className="hf-field-row-horizontal">
                        <label className="hf-field-label">
                            Հարկերի քանակ{' '}
                            <span className="hf-star">
                                    *
                                </span>
                        </label>

                        <div className="hf-pill-group">
                            {buildingFloorsOptions.map(
                                (f) => (
                                    <button
                                        type="button"
                                        key={f}
                                        className={`hf-pill-btn ${
                                            buildingFloors ===
                                            f
                                                ? 'active'
                                                : ''
                                        }`}
                                        onClick={() =>
                                            setBuildingFloors(
                                                f
                                            )
                                        }
                                    >
                                        {f}
                                    </button>
                                )
                            )}
                        </div>
                    </div>

                    {/* Առկա են */}
                    <div className="hf-field-row-horizontal">
                        <label className="hf-field-label">
                            Առկա են
                        </label>

                        <div className="hf-pill-group">
                            {[
                                'Դոմոֆոն',
                                'Դռնապահ',
                                'Խաղահրապարակ'
                            ].map((item) => {
                                const isChecked =
                                    buildingFeatures.includes(
                                        item
                                    );

                                return (
                                    <button
                                        type="button"
                                        key={item}
                                        className={`hf-pill-btn ${
                                            isChecked
                                                ? 'active'
                                                : ''
                                        }`}
                                        onClick={() =>
                                            toggleArrayItem(
                                                buildingFeatures,
                                                setBuildingFeatures,
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

                    {/* Կայանատեղի */}
                    <div className="hf-field-row-horizontal">
                        <label className="hf-field-label">
                            Կայանատեղի
                        </label>

                        <div className="hf-pill-group">
                            {[
                                'Բացօթյա',
                                'Ծածկապատ',
                                'Ավտոտնակ'
                            ].map((p) => (
                                <button
                                    type="button"
                                    key={p}
                                    className={`hf-pill-btn ${
                                        parking === p
                                            ? 'active'
                                            : ''
                                    }`}
                                    onClick={() =>
                                        setParking(p)
                                    }
                                >
                                    {p}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* 4. ԲՆԱԿԱՐԱՆԻ ՄԱՍԻՆ */}
                <div className="hf-block">
                    <h3 className="hf-block-title">
                        Բնակարանի մասին
                    </h3>

                    {/* Ընդհանուր մակերես */}
                    <div className="hf-field-row-horizontal">
                        <label className="hf-field-label">
                            Ընդհանուր մակերես{' '}
                            <span className="hf-star">
                                    *
                                </span>
                        </label>

                        <div className="hf-unit-input-wrap">
                            <input
                                type="number"
                                className="hf-text-input"
                                placeholder=""
                                value={apartmentArea}
                                onChange={(e) =>
                                    setApartmentArea(
                                        e.target.value
                                    )
                                }
                                required
                            />

                            <span className="hf-input-unit">
                                    քմ
                                </span>
                        </div>
                    </div>

                    {/* Սենյակների քանակ */}
                    <div className="hf-field-row-horizontal">
                        <label className="hf-field-label">
                            Սենյակների քանակ{' '}
                            <span className="hf-star">
                                    *
                                </span>
                        </label>

                        <div className="hf-pill-group">
                            {roomsOptions.map(
                                (r) => (
                                    <button
                                        type="button"
                                        key={r}
                                        className={`hf-pill-btn ${
                                            rooms === r
                                                ? 'active'
                                                : ''
                                        }`}
                                        onClick={() =>
                                            setRooms(r)
                                        }
                                    >
                                        {r}
                                    </button>
                                )
                            )}
                        </div>
                    </div>

                    {/* Սանհանգույցների քանակ */}
                    <div className="hf-field-row-horizontal">
                        <label className="hf-field-label">
                            Սանհանգույցների քանակ{' '}
                            <span className="hf-star">
                                    *
                                </span>
                        </label>

                        <div className="hf-number-row">
                            {['1', '2', '3+'].map(
                                (num) => (
                                    <button
                                        type="button"
                                        key={num}
                                        className={`hf-number-btn ${
                                            bathroomsCount ===
                                            num
                                                ? 'active'
                                                : ''
                                        }`}
                                        onClick={() =>
                                            setBathroomsCount(
                                                num
                                            )
                                        }
                                    >
                                        {num}
                                    </button>
                                )
                            )}
                        </div>
                    </div>

                    {/* Առաստաղի բարձրություն */}
                    <div className="hf-field-row-horizontal">
                        <label className="hf-field-label">
                            Առաստաղի բարձրություն{' '}
                            <span className="hf-star">
                                    *
                                </span>
                        </label>

                        <div className="hf-pill-group">
                            {ceilingHeightOptions.map(
                                (h) => (
                                    <button
                                        type="button"
                                        key={h}
                                        className={`hf-pill-btn ${
                                            ceilingHeight ===
                                            h
                                                ? 'active'
                                                : ''
                                        }`}
                                        onClick={() =>
                                            setCeilingHeight(
                                                h
                                            )
                                        }
                                    >
                                        {h}
                                    </button>
                                )
                            )}
                        </div>
                    </div>

                    {/* Հարկ */}
                    <div className="hf-field-row-horizontal">
                        <label className="hf-field-label">
                            Հարկ{' '}
                            <span className="hf-star">
                                    *
                                </span>
                        </label>

                        <div className="hf-pill-group">
                            {apartmentFloorOptions.map(
                                (f) => (
                                    <button
                                        type="button"
                                        key={f}
                                        className={`hf-pill-btn ${
                                            apartmentFloor ===
                                            f
                                                ? 'active'
                                                : ''
                                        }`}
                                        onClick={() =>
                                            setApartmentFloor(
                                                f
                                            )
                                        }
                                    >
                                        {f}
                                    </button>
                                )
                            )}
                        </div>
                    </div>

                    {/* Պատշգամբ */}
                    <div className="hf-field-row-horizontal">
                        <label className="hf-field-label">
                            Պատշգամբ{' '}
                            <span className="hf-star">
                                    *
                                </span>
                        </label>

                        <div className="hf-pill-group">
                            {[
                                'Առկա չէ',
                                'Բաց',
                                'Փակ'
                            ].map((b) => (
                                <button
                                    type="button"
                                    key={b}
                                    className={`hf-pill-btn ${
                                        balcony === b
                                            ? 'active'
                                            : ''
                                    }`}
                                    onClick={() =>
                                        setBalcony(b)
                                    }
                                >
                                    {b}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Վերանորոգում */}
                    <div className="hf-field-row-horizontal">
                        <label className="hf-field-label">
                            Վերանորոգում{' '}
                            <span className="hf-star">
                                    *
                                </span>
                        </label>

                        <div className="hf-pill-group">
                            {renovationOptions.map(
                                (opt) => (
                                    <button
                                        type="button"
                                        key={opt}
                                        className={`hf-pill-btn ${
                                            renovation ===
                                            opt
                                                ? 'active'
                                                : ''
                                        }`}
                                        onClick={() =>
                                            setRenovation(
                                                opt
                                            )
                                        }
                                    >
                                        {opt}
                                    </button>
                                )
                            )}
                        </div>
                    </div>

                    {/* Կոմֆորտ */}
                    <div className="hf-field-row-horizontal">
                        <label className="hf-field-label">
                            Կոմֆորտ
                        </label>

                        <div className="hf-pill-group">
                            {[
                                'Սրբիչներ',
                                'Անկողնային պարագաներ',
                                'Հիգիենայի պարագաներ'
                            ].map((item) => {
                                const isChecked =
                                    comfortList.includes(
                                        item
                                    );

                                return (
                                    <button
                                        type="button"
                                        key={item}
                                        className={`hf-pill-btn ${
                                            isChecked
                                                ? 'active'
                                                : ''
                                        }`}
                                        onClick={() =>
                                            toggleArrayItem(
                                                comfortList,
                                                setComfortList,
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

                    {/* Հարմարություններ */}
                    <div className="hf-field-row-horizontal">
                        <label className="hf-field-label">
                            Հարմարություններ
                        </label>

                        <div className="hf-pill-group">
                            {[
                                'Հեռուստացույց',
                                'Օդորակիչ',
                                'Ինտերնետ'
                            ].map((item) => {
                                const isChecked =
                                    amenities.includes(
                                        item
                                    );

                                return (
                                    <button
                                        type="button"
                                        key={item}
                                        className={`hf-pill-btn ${
                                            isChecked
                                                ? 'active'
                                                : ''
                                        }`}
                                        onClick={() =>
                                            toggleArrayItem(
                                                amenities,
                                                setAmenities,
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
                    <div className="hf-field-row-horizontal hf-field-row-top">
                        <label
                            className="hf-field-label"
                            style={{
                                marginTop: '2px'
                            }}
                        >
                            Կենցաղային տեխնիկա
                        </label>

                        <div className="hf-vertical-checkboxes">
                            {appliancesList.map(
                                (item) => (
                                    <label
                                        key={item}
                                        className="hf-checkbox-row"
                                    >
                                        <input
                                            type="checkbox"
                                            checked={appliances.includes(
                                                item
                                            )}
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
                                )
                            )}
                        </div>
                    </div>

                    {/* Տեսարաններ պատուհաններից */}
                    <div className="hf-field-row-horizontal">
                        <label className="hf-field-label">
                            Տեսարաններ պատուհաններից
                        </label>

                        <div className="hf-pill-group">
                            {[
                                'Դեպի բակ',
                                'Դեպի փողոց',
                                'Դեպի քաղաք',
                                'Դեպի այգի',
                                'Դեպի Արարատ'
                            ].map((v) => {
                                const isChecked =
                                    viewsFromWindows.includes(
                                        v
                                    );

                                return (
                                    <button
                                        type="button"
                                        key={v}
                                        className={`hf-pill-btn ${
                                            isChecked
                                                ? 'active'
                                                : ''
                                        }`}
                                        onClick={() =>
                                            toggleArrayItem(
                                                viewsFromWindows,
                                                setViewsFromWindows,
                                                v
                                            )
                                        }
                                    >
                                        {v}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Հարմար է անվասայլակով մարդկանց համար */}
                    <div className="hf-field-row-horizontal">
                        <label className="hf-field-label">
                            Հարմար է անվասայլակով մարդկանց համար{' '}
                            <span className="hf-star">*</span>
                        </label>

                        <div className="hf-pill-group">
                            {['Այո', 'Ոչ'].map((opt) => (
                                <button
                                    type="button"
                                    key={opt}
                                    className={`hf-pill-btn ${
                                        wheelchairAccessible ===
                                        opt
                                            ? 'active'
                                            : ''
                                    }`}
                                    onClick={() =>
                                        setWheelchairAccessible(
                                            opt
                                        )
                                    }
                                >
                                    {opt}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* 5. ԲՆԱԿՈՒԹՅԱՆ ԿԱՆՈՆՆԵՐ */}
                <div className="hf-block">
                    <h3 className="hf-block-title">
                        Բնակության կանոններ
                    </h3>

                    <div className="hf-field-row-horizontal">
                        <label className="hf-field-label">
                            Հյուրերի առավելագույն քանակը{' '}
                            <span className="hf-star">
                                    *
                                </span>
                        </label>

                        <input
                            type="number"
                            className="hf-text-input"
                            placeholder=""
                            value={maxGuests}
                            onChange={(e) =>
                                setMaxGuests(
                                    e.target.value
                                )
                            }
                            required
                        />
                    </div>

                    <div className="hf-field-row-horizontal">
                        <label className="hf-field-label">
                            Երեխաների հետ{' '}
                            <span className="hf-star">
                                    *
                                </span>
                        </label>

                        <div className="hf-pill-group">
                            {[
                                'Այո',
                                'Ոչ',
                                'Համաձայնությամբ'
                            ].map((opt) => (
                                <button
                                    type="button"
                                    key={opt}
                                    className={`hf-pill-btn ${
                                        childrenRule ===
                                        opt
                                            ? 'active'
                                            : ''
                                    }`}
                                    onClick={() =>
                                        setChildrenRule(
                                            opt
                                        )
                                    }
                                >
                                    {opt}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="hf-field-row-horizontal">
                        <label className="hf-field-label">
                            Թույլատրվում են կենդանիներ{' '}
                            <span className="hf-star">
                                    *
                                </span>
                        </label>

                        <div className="hf-pill-group">
                            {[
                                'Այո',
                                'Ոչ',
                                'Համաձայնությամբ'
                            ].map((opt) => (
                                <button
                                    type="button"
                                    key={opt}
                                    className={`hf-pill-btn ${
                                        petsRule ===
                                        opt
                                            ? 'active'
                                            : ''
                                    }`}
                                    onClick={() =>
                                        setPetsRule(
                                            opt
                                        )
                                    }
                                >
                                    {opt}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* 6. ԳՈՐԾԱՐՔԻ ՊԱՅՄԱՆՆԵՐ */}
                <div className="hf-block">
                    <h3 className="hf-block-title">
                        Գործարքի պայմաններ
                    </h3>

                    <div className="hf-field-row-horizontal">
                        <label className="hf-field-label">
                            Վարձավճար{' '}
                            <span className="hf-star">
                                    *
                                </span>
                        </label>

                        <div className="hf-price-input-row">
                            <input
                                type="number"
                                className="hf-text-input"
                                placeholder=""
                                value={rentAmount}
                                onChange={(e) =>
                                    setRentAmount(
                                        e.target.value
                                    )
                                }
                                required
                            />

                            <select
                                className="hf-select-input"
                                value={currency}
                                onChange={(e) =>
                                    setCurrency(
                                        e.target.value
                                    )
                                }
                            >
                                <option value="">
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
                                className="hf-select-input"
                                value={paymentPeriod}
                                onChange={(e) =>
                                    setPaymentPeriod(
                                        e.target.value
                                    )
                                }
                            >
                                <option value="">
                                    Ընտրեք ժամանակահատվածը
                                </option>

                                <option value="օրական">
                                    օրական
                                </option>

                                <option value="ամսական">
                                    ամսական
                                </option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* 7. ԼՈՒՍԱՆԿԱՐՆԵՐ */}
                <div className="hf-block">
                    <h3 className="hf-block-title">
                        Լուսանկարներ{' '}
                        <span className="hf-star">
                                *
                            </span>
                    </h3>

                    <span className="hf-block-subtitle">
                            Խնդրում ենք վերբեռնել լուսանկարները
                            հետևյալ հերթականությամբ՝ սենյակներ,
                            խոհանոց, սանհանգույց, պատշգամբ և ապա
                            նոր ոչ բնակելի տարածքների լուսանկարներ
                            (շենքի ճակատ, նկուղ, պատուհաններից
                            բացվող տեսարան, շենքի մուտք,
                            ավտոկայանատեղի և այլն)։ Նաև ցույց
                            տվեք շենքի ճակատը, պատուհաններից
                            բացվող տեսարանը, շենքի մուտքը և
                            ավտոկայանատեղին։ Կարող եք նաև
                            ավելացնել հատակագիծը։ Խնդրում ենք
                            համոզվել, որ ձեր լուսանկարն առնվազն
                            600 պիքսել լայնություն և 500 պիքսել
                            բարձրություն ունի։
                        </span>

                    <input
                        type="file"
                        ref={fileInputRef}
                        style={{
                            display: 'none'
                        }}
                        multiple
                        accept="image/*"
                        onChange={handlePhotoUpload}
                    />

                    <div
                        className="hf-dropzone"
                        onClick={() =>
                            fileInputRef.current?.click()
                        }
                    >
                        <div className="hf-dropzone-icon-box">
                            <svg
                                className="hf-dropzone-icon-svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                />
                            </svg>
                        </div>

                        <div className="hf-dropzone-text">
                            Քաշեք ու թողեք ֆայլը կամ{' '}
                            <span className="hf-dropzone-link">
                                    Վերբեռնեք սարքից
                                </span>
                        </div>
                    </div>

                    {uploadedPhotos.length > 0 && (
                        <div className="hf-photos-preview">
                            {uploadedPhotos.map(
                                (src, idx) => (
                                    <div
                                        key={idx}
                                        className={`hf-photo-thumb ${
                                            mainPhotoIndex ===
                                            idx
                                                ? 'is-main'
                                                : ''
                                        }`}
                                        onClick={() =>
                                            setMainPhotoIndex(
                                                idx
                                            )
                                        }
                                        title="Սեղմեք գլխավոր դարձնելու համար"
                                    >
                                        <img
                                            src={src}
                                            alt={`Photo ${
                                                idx + 1
                                            }`}
                                        />

                                        <button
                                            type="button"
                                            className="hf-photo-del"
                                            onClick={(e) => {
                                                e.stopPropagation();

                                                handleDeletePhoto(
                                                    idx
                                                );
                                            }}
                                            title="Ջնջել"
                                        >
                                            ✕
                                        </button>

                                        <div className="hf-photo-status-badge">
                                            {mainPhotoIndex ===
                                            idx
                                                ? '⭐ Գլխավոր'
                                                : `#${
                                                    idx +
                                                    1
                                                }`}
                                        </div>
                                    </div>
                                )
                            )}
                        </div>
                    )}

                    {/* AI PHOTO CLEANER INTEGRATION */}
                    <div
                        style={{
                            marginTop: '16px'
                        }}
                    >
                        <AiPhotoCleaner
                            onTransferToMainPhotos={(
                                newPhotos
                            ) =>
                                setUploadedPhotos(
                                    (prev) => [
                                        ...prev,
                                        ...newPhotos
                                    ]
                                )
                            }
                        />
                    </div>
                </div>

                {/* 8. ԿՈՆՏԱԿՏԱՅԻՆ ՏՎՅԱԼՆԵՐ */}
                <div className="hf-block">
                    <h3 className="hf-block-title">
                        Կոնտակտային տվյալներ
                    </h3>

                    <div className="hf-contact-options">

                        <label
                            className="hf-contact-row"
                            onClick={() =>
                                setContactMode(
                                    'primary'
                                )
                            }
                        >
                            <input
                                type="radio"
                                name="contactPhoneRadio"
                                checked={
                                    contactMode ===
                                    'primary'
                                }
                                onChange={() =>
                                    setContactMode(
                                        'primary'
                                    )
                                }
                            />

                            <span>
                                    📞 {primaryPhone ||
                                'Օգտագործել հիմնական համարը'}
                                </span>
                        </label>

                        <label
                            className="hf-contact-row"
                            onClick={() =>
                                setContactMode(
                                    'custom'
                                )
                            }
                        >
                            <input
                                type="radio"
                                name="contactPhoneRadio"
                                checked={
                                    contactMode ===
                                    'custom'
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
                                    marginTop: '8px'
                                }}
                            >
                                <input
                                    type="tel"
                                    className="hf-text-input"
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

                {/* BOTTOM ACTION BAR */}
                <div className="hf-bottom-actions">

                    <button
                        type="button"
                        className="hf-btn-cancel"
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
                        className="hf-btn-draft"
                        onClick={() =>
                            alert(
                                '💾 Հայտարարությունը պահպանվեց որպես սևագիր'
                            )
                        }
                    >
                        Պահպանել որպես սևագիր
                    </button>

                    <button
                        type="submit"
                        className="hf-btn-primary"
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

export default HouseForm;
