import React, { useState, useRef, useEffect } from 'react';
import {
    ArrowLeft,
    Building2,
    MapPin,
    ChevronDown,
    Search,
    Check,
    UploadCloud,
    Sparkles,
    Trash2,
    Eye,
    Save,
    Send
} from 'lucide-react';
import './HouseSaleForm.css';
import AiPhotoCleaner from "../ai-cleaner/AiPhotoCleaner.jsx";
import { filesToDataUrls, loadFormDraft, useFormDraftState, useSaveFormDraft } from "../services/uiSession.js";
import { I18nTree } from '../i18n/I18n.jsx';

// ՀՀ Մարզերի և քաղաքների/համայնքների ցուցակ
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
        cities: [
            'Աբովյան',
            'Հրազդան',
            'Ծաղկաձոր',
            'Չարենցավան',
            'Նոր Հաճն',
            'Բյուրեղավան',
            'Եղվարդ',
            'Գառնի',
            'Ձորաղբյուր',
            'Առինջ',
            'Քասախ'
        ]
    },
    {
        name: 'Արարատ',
        cities: [
            'Արտաշատ',
            'Մասիս',
            'Վեդի',
            'Արարատ',
            'Այնթապ',
            'Մարմարաշեն'
        ]
    },
    {
        name: 'Արմավիր',
        cities: [
            'Վաղարշապատ (Էջմիածին)',
            'Արմավիր',
            'Մեծամոր',
            'Փարաքար',
            'Թաիրով'
        ]
    },
    {
        name: 'Արագածոտն',
        cities: [
            'Աշտարակ',
            'Ապարան',
            'Թալին',
            'Օշական',
            'Բյուրական'
        ]
    },
    {
        name: 'Լոռի',
        cities: [
            'Վանաձոր',
            'Ստեփանավան',
            'Ալավերդի',
            'Սպիտակ',
            'Տաշիր'
        ]
    },
    {
        name: 'Շիրակ',
        cities: [
            'Գյումրի',
            'Արթիկ',
            'Մարալիկ'
        ]
    },
    {
        name: 'Սյունիք',
        cities: [
            'Կապան',
            'Գորիս',
            'Սիսիան',
            'Մեղրի',
            'Քաջարան'
        ]
    },
    {
        name: 'Գեղարքունիք',
        cities: [
            'Գավառ',
            'Սևան',
            'Մարտունի',
            'Վարդենիս',
            'Ճամբարակ'
        ]
    },
    {
        name: 'Տավուշ',
        cities: [
            'Իջևան',
            'Դիլիջան',
            'Բերդ',
            'Նոյեմբերյան'
        ]
    },
    {
        name: 'Վայոց Ձոր',
        cities: [
            'Եղեգնաձոր',
            'Ջերմուկ',
            'Վայք'
        ]
    }
];

export default function HouseSaleForm({ onBack, onSave }) {
    const draft = loadFormDraft("house-sale");

    // Դիտման ռեժիմ՝ 'form' կամ 'preview'
    const [viewMode, setViewMode] = useState(draft.viewMode || 'form');

    // 1. Ձեր կարգավիճակը
    const [userRole, setUserRole] = useState(draft.userRole || '');

    // 2. Գտնվելու վայրը
    const [regionDropdownOpen, setRegionDropdownOpen] = useState(false);
    const [regionSearch, setRegionSearch] = useState('');
    const [expandedMarz, setExpandedMarz] = useState(null);
    const [selectedRegion, setSelectedRegion] = useState(draft.selectedRegion || '');
    const [street, setStreet] = useState(draft.street || '');
    const [buildingNumber, setBuildingNumber] = useState(draft.buildingNumber || '');
    const [hideBuildingNumber, setHideBuildingNumber] = useState(Boolean(draft.hideBuildingNumber));
    const [mapZoom, setMapZoom] = useState(draft.mapZoom || 14);
    const regionDropdownRef = useRef(null);

    // 3. Շինության և տան պարամետրեր
    const [condition, setCondition] = useState(draft.condition || '');
    const [rooms, setRooms] = useState(draft.rooms || '');
    const [houseArea, setHouseArea] = useState(draft.houseArea || '');
    const [constructionType, setConstructionType] = useState(draft.constructionType || '');
    const [floorsCount, setFloorsCount] = useState(draft.floorsCount || '');
    const [bathroomsCount, setBathroomsCount] = useState(draft.bathroomsCount || '');
    const [garage, setGarage] = useState(draft.garage || '');
    const [renovation, setRenovation] = useState(draft.renovation || '');
    const [appliances, setAppliances] = useState(draft.appliances || []);
    const [serviceLines, setServiceLines] = useState(draft.serviceLines || []);
    const [facilities, setFacilities] = useState(draft.facilities || []);
    const [furniture, setFurniture] = useState(draft.furniture || '');

    // Հարմար է անվասայլակով մարդկանց համար
    const [wheelchairAccessible, setWheelchairAccessible] = useState(draft.wheelchairAccessible || '');

    // 4. Հողատարածքի պարամետրեր
    const [totalLandArea, setTotalLandArea] = useState(draft.totalLandArea || '');

    // 5. Գին
    const [price, setPrice] = useState(draft.price || '');
    const [currency, setCurrency] = useState(draft.currency || '');

    // 6. Մանրամասն տեղեկություն / Նկարագրություն
    const [description, setDescription] = useState(draft.description || '');

    // Լուսանկարներ
    const [photos, setPhotos] = useFormDraftState("house-sale", "photos", draft.photos || []);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef(null);

    // 7. Կոնտակտային տվյալներ
    const [contactPhoneOption, setContactPhoneOption] = useState(draft.contactPhoneOption || '');
    const [contactPhone] = useState('+374 98 12 34 56');

    // Սխալների օբյեկտ
    const [errors, setErrors] = useState({});

    // Toast ծանուցում
    const [toastMessage, setToastMessage] = useState('');

    useSaveFormDraft("house-sale", {
        viewMode,
        userRole,
        selectedRegion,
        street,
        buildingNumber,
        hideBuildingNumber,
        mapZoom,
        condition,
        rooms,
        houseArea,
        constructionType,
        floorsCount,
        bathroomsCount,
        garage,
        renovation,
        appliances,
        serviceLines,
        facilities,
        furniture,
        wheelchairAccessible,
        totalLandArea,
        price,
        currency,
        description,
        photos,
        contactPhoneOption,
    });

    const showToast = (msg) => {
        setToastMessage(msg);

        setTimeout(() => {
            setToastMessage('');
        }, 3200);
    };

    // Տարածաշրջանի Dropdown-ից դուրս սեղմելու դեպքում փակել
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                regionDropdownRef.current &&
                !regionDropdownRef.current.contains(event.target)
            ) {
                setRegionDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Տարածաշրջանների ֆիլտրում ըստ որոնման
    const filteredRegions = ARMENIA_REGIONS
        .map((marz) => {
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
                return {
                    ...marz,
                    cities: filteredCities
                };
            }

            return null;
        })
        .filter(Boolean);

    // Տարածաշրջան ընտրել
    const handleSelectMarzOnly = (marzName) => {
        setSelectedRegion(marzName);
        setRegionDropdownOpen(false);
        setRegionSearch('');

        if (errors.selectedRegion) {
            setErrors((prev) => ({
                ...prev,
                selectedRegion: null
            }));
        }
    };

    // Քաղաք ընտրել
    const handleSelectCity = (marzName, cityName) => {
        setSelectedRegion(`${marzName}, ${cityName}`);
        setRegionDropdownOpen(false);
        setRegionSearch('');

        if (errors.selectedRegion) {
            setErrors((prev) => ({
                ...prev,
                selectedRegion: null
            }));
        }
    };

    // Բազմակի ընտրության toggle
    const toggleMultiSelect = (item, currentList, setter) => {
        if (currentList.includes(item)) {
            setter(currentList.filter(i => i !== item));
        } else {
            setter([...currentList, item]);
        }
    };

    const handleAddPhotos = async (fileList) => {
        const filesArray = Array.from(fileList);

        const imageFiles = filesArray.filter(file =>
            file.type.startsWith('image/')
        );

        if (imageFiles.length === 0) {
            showToast('Խնդրում ենք վերբեռնել միայն նկարներ');
            return;
        }

        const remainingSlots = 15 - photos.length;

        if (remainingSlots <= 0) {
            showToast('Առավելագույնը 15 լուսանկար կարող եք վերբեռնել');
            return;
        }

        const filesToProcess = imageFiles.slice(0, remainingSlots);
        const newPhotoUrls = await filesToDataUrls(filesToProcess);

        setPhotos(prev => [...prev, ...newPhotoUrls]);

        if (errors.photos) {
            setErrors(prev => ({
                ...prev,
                photos: null
            }));
        }
    };

    const handleRemovePhoto = (index) => {
        setPhotos(prev =>
            prev.filter((_, i) => i !== index)
        );
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);

        if (
            e.dataTransfer.files &&
            e.dataTransfer.files.length > 0
        ) {
            handleAddPhotos(e.dataTransfer.files);
        }
    };

    // Ամբողջ ֆորման մաքրելու ֆունկցիա
    const handleClearAll = () => {
        setUserRole('');
        setSelectedRegion('');
        setStreet('');
        setBuildingNumber('');
        setHideBuildingNumber(false);

        setCondition('');
        setRooms('');
        setHouseArea('');
        setConstructionType('');
        setFloorsCount('');
        setBathroomsCount('');
        setGarage('');
        setRenovation('');
        setFurniture('');

        setAppliances([]);
        setServiceLines([]);
        setFacilities([]);

        setWheelchairAccessible('');

        setTotalLandArea('');

        setPrice('');
        setCurrency('');

        setDescription('');

        setPhotos([]);

        setContactPhoneOption('');

        setErrors({});

        showToast('Էջը մաքրվեց. ակտիվ դաշտեր չկան');
    };

    // Վալիդացիա
    const validateForm = () => {
        const newErrors = {};

        if (!userRole) {
            newErrors.userRole =
                'Խնդրում ենք նշել ձեր կարգավիճակը';
        }

        if (!selectedRegion) {
            newErrors.selectedRegion =
                'Խնդրում ենք նշել տարածաշրջանը';
        }

        if (!street.trim()) {
            newErrors.street =
                'Խնդրում ենք նշել փողոցը';
        }

        if (
            !houseArea.trim() ||
            isNaN(houseArea) ||
            Number(houseArea) <= 0
        ) {
            newErrors.houseArea =
                'Նշեք տան մակերեսը (քմ)';
        }

        if (
            !totalLandArea.trim() ||
            isNaN(totalLandArea) ||
            Number(totalLandArea) <= 0
        ) {
            newErrors.totalLandArea =
                'Նշեք հողատարածքի մակերեսը (քմ)';
        }

        if (
            !price.trim() ||
            isNaN(price) ||
            Number(price) <= 0
        ) {
            newErrors.price = 'Նշեք գինը';
        }

        if (!wheelchairAccessible) {
            newErrors.wheelchairAccessible =
                'Խնդրում ենք նշել՝ արդյոք հարմար է անվասայլակով մարդկանց համար';
        }

        if (photos.length < 4) {
            newErrors.photos =
                'Խնդրում ենք վերբեռնել առնվազն 4 լուսանկար:';
        }

        setErrors(newErrors);

        return Object.keys(newErrors).length === 0;
    };

    // Ուղարկել
    const handlePreviewClick = (e) => {
        e.preventDefault();

        if (validateForm()) {
            if (onSave) {
                onSave({
                    userRole,
                    selectedRegion,
                    street,
                    buildingNumber,
                    hideBuildingNumber,
                    condition,
                    rooms,
                    houseArea,
                    constructionType,
                    floorsCount,
                    bathroomsCount,
                    garage,
                    renovation,
                    appliances,
                    serviceLines,
                    facilities,
                    wheelchairAccessible,
                    furniture,
                    totalLandArea,
                    price,
                    currency,
                    description,
                    photos,
                    photosCount: photos.length,
                    contactPhone:
                        contactPhoneOption === 'phone'
                            ? contactPhone
                            : '',
                    isDraft: false
                });
            }
        } else {
            showToast('Խնդրում ենք լրացնել պարտադիր դաշտերը');
        }
    };

    // Պահպանել որպես սևագիր
    const handleSaveDraft = (e) => {
        e.preventDefault();

        showToast('Հայտարարությունը պահպանվեց որպես սևագիր');

        if (onSave) {
            onSave({
                userRole,
                selectedRegion,
                street,
                buildingNumber,
                hideBuildingNumber,

                condition,
                rooms,
                houseArea,
                constructionType,
                floorsCount,
                bathroomsCount,
                garage,
                renovation,

                appliances,
                serviceLines,
                facilities,

                wheelchairAccessible,

                furniture,

                totalLandArea,

                price,
                currency,

                description,

                photosCount: photos.length,

                contactPhone:
                    contactPhoneOption === 'phone'
                        ? contactPhone
                        : '',

                isDraft: true
            });
        }
    };

    // Հրապարակում
    const handlePublish = (e) => {
        e.preventDefault();

        showToast(
            'Շնորհավորում ենք։ Հայտարարությունը հաջողությամբ տեղադրվեց։'
        );

        if (onSave) {
            onSave({
                userRole,
                selectedRegion,
                street,
                buildingNumber,
                hideBuildingNumber,

                condition,
                rooms,
                houseArea,
                constructionType,
                floorsCount,
                bathroomsCount,
                garage,
                renovation,

                appliances,
                serviceLines,
                facilities,

                wheelchairAccessible,

                furniture,

                totalLandArea,

                price,
                currency,

                description,

                photos,
                photosCount: photos.length,

                contactPhone:
                    contactPhoneOption === 'phone'
                        ? contactPhone
                        : '',

                isDraft: false
            });
        }
    };

    return (
        <I18nTree>
        <div className="house-sale-page">

            {toastMessage && (
                <div className="toast-notification">
                    <span>{toastMessage}</span>
                </div>
            )}

            {/* Հետ վերադառնալու կոճակ */}
            <div className="return-header-container">
                <button
                    type="button"
                    className="btn-back-link"
                    onClick={onBack}
                >
                    <ArrowLeft size={18} />
                    <span>Վերադառնալ նախորդ էջ</span>
                </button>

            </div>

            {/* Էջի գլխավոր վերնագիր */}
            <div className="form-main-card">

                <div className="form-title-wrapper">
                    <h1 className="page-main-title">
                        Վաճառք • Առանձնատուն
                    </h1>

                    <p className="page-subtitle">
                        Լրացրեք անհրաժեշտ տեղեկատվությունը ձեր առանձնատան վերաբերյալ
                    </p>
                </div>

                {viewMode === 'preview' ? (

                    /* ------------------ PREVIEW MODE ------------------ */

                    <div className="preview-container">

                        <div className="preview-banner">
                            <Sparkles
                                size={18}
                                className="preview-sparkle-icon"
                            />

                            <span>
                                Հայտարարության նախնական դիտում
                                (Ստուգեք տվյալները նախքան հրապարակելը)
                            </span>
                        </div>

                        <div className="preview-details-grid">

                            <div className="preview-item">
                                <span className="preview-label">
                                    Կարգավիճակ
                                </span>

                                <span className="preview-value">
                                    {userRole === '0'
                                        ? 'Սեփականատեր'
                                        : userRole === '1'
                                            ? 'Գործակալություն'
                                            : 'Նշված չէ'}
                                </span>
                            </div>

                            <div className="preview-item">
                                <span className="preview-label">
                                    Տարածաշրջան
                                </span>

                                <span className="preview-value">
                                    {selectedRegion || 'Նշված չէ'}
                                </span>
                            </div>

                            <div className="preview-item">
                                <span className="preview-label">
                                    Հասցե
                                </span>

                                <span className="preview-value">
                                    {street
                                        ? `${street}${buildingNumber && !hideBuildingNumber
    ? `, շ․ ${buildingNumber}`
    : ''
}`
                                        : 'Նշված չէ'}

                                    {hideBuildingNumber &&
                                        ' (Շենքի համարը թաքցված է)'}
                                </span>
                            </div>

                            <div className="preview-item">
                                <span className="preview-label">
                                    Տան մակերես
                                </span>

                                <span className="preview-value">
                                    {houseArea
                                        ? `${houseArea} քմ`
                                        : 'Նշված չէ'}
                                </span>
                            </div>

                            <div className="preview-item">
                                <span className="preview-label">
                                    Հողատարածքի մակերես
                                </span>

                                <span className="preview-value">
                                    {totalLandArea
                                        ? `${totalLandArea} քմ`
                                        : 'Նշված չէ'}
                                </span>
                            </div>

                            <div className="preview-item">
                                <span className="preview-label">
                                    Սենյակներ
                                </span>

                                <span className="preview-value">
                                    {rooms
                                        ? `${rooms} սենյակ`
                                        : 'Նշված չէ'}
                                </span>
                            </div>

                            <div className="preview-item">
                                <span className="preview-label">
                                    Հարկերի քանակ
                                </span>

                                <span className="preview-value">
                                    {floorsCount
                                        ? `${floorsCount} հարկ`
                                        : 'Նշված չէ'}
                                </span>
                            </div>

                            <div className="preview-item">
                                <span className="preview-label">
                                    Սանհանգույցներ
                                </span>

                                <span className="preview-value">
                                    {bathroomsCount || 'Նշված չէ'}
                                </span>
                            </div>

                            <div className="preview-item">
                                <span className="preview-label">
                                    Շինության տիպ
                                </span>

                                <span className="preview-value">
                                    {constructionType || 'Նշված չէ'}
                                </span>
                            </div>

                            <div className="preview-item">
                                <span className="preview-label">
                                    Վիճակ
                                </span>

                                <span className="preview-value">
                                    {condition || 'Նշված չէ'}
                                </span>
                            </div>

                            <div className="preview-item">
                                <span className="preview-label">
                                    Վերանորոգում
                                </span>

                                <span className="preview-value">
                                    {renovation || 'Նշված չէ'}
                                </span>
                            </div>

                            <div className="preview-item">
                                <span className="preview-label">
                                    Ավտոտնակ
                                </span>

                                <span className="preview-value">
                                    {garage || 'Նշված չէ'}
                                </span>
                            </div>

                            <div className="preview-item">
                                <span className="preview-label">
                                    Կահույք
                                </span>

                                <span className="preview-value">
                                    {furniture || 'Նշված չէ'}
                                </span>
                            </div>

                            <div className="preview-item">
                                <span className="preview-label">
                                    Անվասայլակով մարդկանց համար
                                </span>

                                <span className="preview-value">
                                    {wheelchairAccessible || 'Նշված չէ'}
                                </span>
                            </div>

                            <div className="preview-item">
                                <span className="preview-label">
                                    Արժեք
                                </span>

                                <span className="preview-value highlight-price">
                                    {price || 'Նշված չէ'}
                                    {currency ? ` ${currency}` : ''}
                                </span>
                            </div>

                        </div>

                        {/* Կենցաղային տեխնիկա */}
                        {appliances.length > 0 && (
                            <div>
                                <div className="preview-group-title">
                                    Կենցաղային տեխնիկա
                                </div>

                                <div
                                    style={{
                                        display: 'flex',
                                        flexWrap: 'wrap',
                                        gap: 8,
                                        marginTop: 8
                                    }}
                                >
                                    {appliances.map(app => (
                                        <span
                                            key={app}
                                            className="badge-feature"
                                        >
                                            ✓ {app}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Կոմունիկացիաներ */}
                        {serviceLines.length > 0 && (
                            <div>
                                <div className="preview-group-title">
                                    Կոմունիկացիաներ
                                </div>

                                <div
                                    style={{
                                        display: 'flex',
                                        flexWrap: 'wrap',
                                        gap: 8,
                                        marginTop: 8
                                    }}
                                >
                                    {serviceLines.map(sl => (
                                        <span
                                            key={sl}
                                            className="badge-feature"
                                        >
                                            ✓ {sl}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Հարմարություններ */}
                        {facilities.length > 0 && (
                            <div>
                                <div className="preview-group-title">
                                    Հարմարություններ
                                </div>

                                <div
                                    style={{
                                        display: 'flex',
                                        flexWrap: 'wrap',
                                        gap: 8,
                                        marginTop: 8
                                    }}
                                >
                                    {facilities.map(fac => (
                                        <span
                                            key={fac}
                                            className="badge-feature"
                                        >
                                            ✓ {fac}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Լուսանկարներ */}
                        {photos.length > 0 && (
                            <div>
                                <div className="preview-group-title">
                                    Լուսանկարներ ({photos.length})
                                </div>

                                <div className="photos-preview-grid">
                                    {photos.map((src, idx) => (
                                        <div
                                            key={idx}
                                            className="photo-thumbnail-card"
                                        >
                                            <img
                                                src={src}
                                                alt={`Տուն ${idx + 1}`}
                                                className="photo-img"
                                            />

                                            {idx === 0 && (
                                                <span className="badge-main-photo">
                                                    Գլխավոր
                                                </span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Կոճակների գոտի */}
                        <div className="form-actions-bar">

                            <button
                                type="button"
                                className="btn-cancel"
                                onClick={() => setViewMode('form')}
                            >
                                Խմբագրել
                            </button>

                            <div
                                style={{
                                    display: 'flex',
                                    gap: 12
                                }}
                            >
                                <button
                                    type="button"
                                    className="btn-draft"
                                    onClick={handleSaveDraft}
                                >
                                    Պահպանել որպես սևագիր
                                </button>

                                <button
                                    type="button"
                                    className="btn-publish"
                                    onClick={handlePublish}
                                >
                                    <Send size={16} />
                                    <span>Ուղարկել</span>
                                </button>
                            </div>

                        </div>
                    </div>

                ) : (

                    /* ------------------ FORM EDIT MODE ------------------ */

                    <form
                        onSubmit={handlePreviewClick}
                        noValidate
                    >

                        {/* 1. Ձեր կարգավիճակը */}
                        <div className="form-section">

                            <h2 className="section-title">
                                Ձեր կարգավիճակը
                                <span className="required-star">*</span>
                            </h2>

                            <div className="radio-group-vertical">

                                <label
                                    className="custom-radio-row"
                                    onClick={() => {
                                        setUserRole(prev =>
                                            prev === '0' ? '' : '0'
                                        );

                                        if (errors.userRole) {
                                            setErrors(prev => ({
                                                ...prev,
                                                userRole: null
                                            }));
                                        }
                                    }}
                                >
                                    <div
                                        className={`custom-checkbox-box ${
    userRole === '0'
        ? 'checked'
        : ''
}`}
                                    >
                                        {userRole === '0' && '✓'}
                                    </div>

                                    <div>
                                        <div className="radio-text-title">
                                            Սեփականատեր
                                        </div>

                                        <div className="radio-text-desc">
                                            Եթե դուք վաճառում եք ձեր սեփական անշարժ գույքը` սեփականատեր
</div>
</div>
</label>

<label
    className="custom-radio-row"
    onClick={() => {
        setUserRole(prev =>
            prev === '1' ? '' : '1'
        );

        if (errors.userRole) {
            setErrors(prev => ({
                ...prev,
                userRole: null
            }));
        }
    }}
>
    <div
        className={`custom-checkbox-box ${
            userRole === '1'
                ? 'checked'
                : ''
        }`}
    >
        {userRole === '1' && '✓'}
    </div>

    <div>
        <div className="radio-text-title">
            Գործակալություն
        </div>

        <div className="radio-text-desc">
            Եթե դուք միջնորդ եք, բրոքեր կամ անշարժ գույքի գործակալության ներկայացուցիչ
        </div>
    </div>
</label>

</div>

{errors.userRole && (
    <div className="error-text">
        ⚠ {errors.userRole}
    </div>
)}

</div>

{/* 2. Գտնվելու վայրը */}
<div className="form-section">

    <h2 className="section-title">
        Գտնվելու վայրը
    </h2>

    {/* Տարածաշրջան */}
    <div className="hf-field-row-horizontal">

        <label className="hf-field-label">
            Տարածաշրջան
            <span className="required-star">*</span>
        </label>

        <div
            className="hf-select-wrapper"
            ref={regionDropdownRef}
        >
            <div
                className={`hf-select-trigger ${
                    regionDropdownOpen
                        ? 'open'
                        : ''
                } ${
                    errors.selectedRegion
                        ? 'has-error'
                        : ''
                }`}
                onClick={() =>
                    setRegionDropdownOpen(
                        !regionDropdownOpen
                    )
                }
            >
                <div className="hf-trigger-left">

                    <MapPin
                        size={16}
                        className={
                            selectedRegion
                                ? 'hf-pin-active'
                                : 'hf-pin-muted'
                        }
                    />

                    <span
                        className={
                            selectedRegion
                                ? 'hf-selected-text'
                                : 'hf-placeholder'
                        }
                    >
                                                {selectedRegion ||
                                                    'Ընտրեք տարածաշրջանը'}
                                            </span>

                </div>

                <ChevronDown
                    size={17}
                    className={`hf-chevron ${
                        regionDropdownOpen
                            ? 'open'
                            : ''
                    }`}
                />
            </div>

            {regionDropdownOpen && (
                <div className="hf-region-popover">

                    <div className="hf-search-wrapper">

                        <Search
                            size={15}
                            className="hf-search-icon"
                        />

                        <input
                            type="text"
                            className="hf-dropdown-search"
                            placeholder="Որոնել քաղաք կամ համայնք..."
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

                    </div>

                    <div className="hf-region-list">

                        {filteredRegions.map(
                            (marz) => {

                                const isExpanded =
                                    regionSearch
                                        .trim()
                                        .length > 0 ||
                                    expandedMarz ===
                                    marz.name;

                                const isMarzSelected =
                                    selectedRegion ===
                                    marz.name;

                                return (
                                    <div
                                        key={marz.name}
                                        className={`hf-marz-item ${
                                            isExpanded
                                                ? 'expanded'
                                                : ''
                                        }`}
                                    >

                                        <div
                                            className="hf-marz-header"
                                            onClick={(e) => {
                                                e.stopPropagation();

                                                setExpandedMarz(
                                                    isExpanded &&
                                                    !regionSearch
                                                        ? null
                                                        : marz.name
                                                );
                                            }}
                                        >

                                            <div className="hf-marz-title-group">

                                                <Building2
                                                    size={15}
                                                    className="hf-marz-icon"
                                                />

                                                <span className="hf-marz-name">
                                                                            {marz.name}
                                                                        </span>

                                                <span className="hf-marz-count">
                                                                            {marz.cities.length}
                                                                        </span>

                                            </div>

                                            <div className="hf-marz-actions">

                                                <button
                                                    type="button"
                                                    className={`hf-marz-select-btn ${
                                                        isMarzSelected
                                                            ? 'selected'
                                                            : ''
                                                    }`}
                                                    onClick={(e) => {
                                                        e.stopPropagation();

                                                        handleSelectMarzOnly(
                                                            marz.name
                                                        );
                                                    }}
                                                    title="Ընտրել ամբողջ մարզը"
                                                >
                                                    {isMarzSelected && (
                                                        <Check size={12} />
                                                    )}

                                                    Ընտրել
                                                </button>

                                                <ChevronDown
                                                    size={15}
                                                    className={`hf-marz-chevron ${
                                                        isExpanded
                                                            ? 'open'
                                                            : ''
                                                    }`}
                                                />

                                            </div>

                                        </div>

                                        {isExpanded && (
                                            <div className="hf-cities-container">

                                                <div className="hf-cities-grid">

                                                    {marz.cities.map(
                                                        (city) => {

                                                            const isCityActive =
                                                                selectedRegion ===
                                                                `${marz.name}, ${city}`;

                                                            return (
                                                                <button
                                                                    type="button"
                                                                    key={city}
                                                                    className={`hf-city-chip ${
                                                                        isCityActive
                                                                            ? 'active'
                                                                            : ''
                                                                    }`}
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();

                                                                        handleSelectCity(
                                                                            marz.name,
                                                                            city
                                                                        );
                                                                    }}
                                                                >
                                                                    {isCityActive && (
                                                                        <Check
                                                                            size={13}
                                                                            className="hf-city-check"
                                                                        />
                                                                    )}

                                                                    <span>
                                                                                                {city}
                                                                                            </span>
                                                                </button>
                                                            );
                                                        }
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

    {errors.selectedRegion && (
        <div
            className="error-text"
            style={{ marginLeft: 196 }}
        >
            ⚠ {errors.selectedRegion}
        </div>
    )}

    {/* Փողոց */}
    <div className="hf-field-row-horizontal">

        <label className="hf-field-label">
            Փողոց
            <span className="required-star">*</span>
        </label>

        <input
            type="text"
            className={`custom-input ${
                errors.street
                    ? 'has-error'
                    : ''
            }`}
            placeholder="Օր.՝ Բաղրամյան պող."
            value={street}
            onChange={(e) => {
                setStreet(e.target.value);

                if (errors.street) {
                    setErrors(prev => ({
                        ...prev,
                        street: null
                    }));
                }
            }}
        />

    </div>

    {errors.street && (
        <div
            className="error-text"
            style={{ marginLeft: 196 }}
        >
            ⚠ {errors.street}
        </div>
    )}

    {/* Շենքի համար */}
    <div className="hf-field-row-horizontal">

        <label className="hf-field-label">
            Շենքի համար
        </label>

        <input
            type="text"
            className="custom-input"
            placeholder="Օր.՝ 14"
            value={buildingNumber}
            onChange={(e) =>
                setBuildingNumber(
                    e.target.value
                )
            }
            disabled={hideBuildingNumber}
        />

    </div>

    {/* Շենքի համարը չցուցադրել */}
    <label
        className="custom-checkbox-row"
        onClick={() =>
            setHideBuildingNumber(
                !hideBuildingNumber
            )
        }
        style={{
            marginTop: 2,
            marginBottom: 8
        }}
    >
        <div
            className={`custom-checkbox-box ${
                hideBuildingNumber
                    ? 'checked'
                    : ''
            }`}
        >
            {hideBuildingNumber && '✓'}
        </div>

        <span className="checkbox-label-text">
                                    Շենքի համարը չցուցադրել հայտարարության մեջ
                                </span>
    </label>

    {/* Քարտեզ */}
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

            <g transform="translate(435, 145)">
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
                    setMapZoom(z =>
                        Math.min(z + 1, 18)
                    )
                }
            >
                +
            </button>

            <button
                type="button"
                className="hf-map-zoom-btn"
                onClick={() =>
                    setMapZoom(z =>
                        Math.max(z - 1, 10)
                    )
                }
            >
                −
            </button>

        </div>

        <div className="hf-map-label-badge">
            📍 {selectedRegion || 'Երևան, Կենտրոն'}
            {street ? ` • ${street}` : ''}
        </div>

    </div>
</div>

{/* 3. Շինության և տան պարամետրեր */}
<div className="form-section">

    <h2 className="section-title">
        Շինության և տան պարամետրեր
    </h2>

    {/* Վիճակ */}
    <div>

        <label className="field-label">
            Վիճակ
            <span className="required-star">*</span>
        </label>

        <div className="chips-flex-row">

            {['Կառուցված', 'Անավարտ'].map(opt => {

                const isChecked =
                    condition === opt;

                return (
                    <div
                        key={opt}
                        className={`chip-checkbox-btn ${
                            isChecked
                                ? 'selected'
                                : ''
                        }`}
                        onClick={() => {
                            setCondition(prev =>
                                prev === opt
                                    ? ''
                                    : opt
                            );

                            if (errors.condition) {
                                setErrors(prev => ({
                                    ...prev,
                                    condition: null
                                }));
                            }
                        }}
                    >
                        <div className="chip-box-indicator">
                            {isChecked ? '✓' : ''}
                        </div>

                        <span>{opt}</span>
                    </div>
                );
            })}

        </div>

        {errors.condition && (
            <div className="error-text">
                ⚠ {errors.condition}
            </div>
        )}

    </div>

    {/* Սենյակների քանակ */}
    <div>

        <label className="field-label">
            Սենյակների քանակ
            <span className="required-star">*</span>
        </label>

        <div className="chips-flex-row">

            {[
                '1',
                '2',
                '3',
                '4',
                '5',
                '6',
                '7',
                '8+'
            ].map(r => (
                <button
                    key={r}
                    type="button"
                    className={`chip-btn-square ${
                        rooms === r
                            ? 'selected'
                            : ''
                    }`}
                    onClick={() =>
                        setRooms(prev =>
                            prev === r
                                ? ''
                                : r
                        )
                    }
                >
                    {r}
                </button>
            ))}

        </div>

    </div>

    {/* Տան մակերես */}
    <div>

        <label className="field-label">
            Տան մակերես
            <span className="required-star">*</span>
        </label>

        <div className="input-max-width input-with-addon">

            <input
                type="number"
                className={`custom-input ${
                    errors.houseArea
                        ? 'has-error'
                        : ''
                }`}
                placeholder="Օր․՝ 150"
                value={houseArea}
                onChange={(e) => {
                    setHouseArea(
                        e.target.value
                    );

                    if (errors.houseArea) {
                        setErrors(prev => ({
                            ...prev,
                            houseArea: null
                        }));
                    }
                }}
            />

            <span className="input-addon-text">
                                        քմ
                                    </span>

        </div>

        {errors.houseArea && (
            <div className="error-text">
                ⚠ {errors.houseArea}
            </div>
        )}

    </div>

    {/* Շինության տիպ */}
    <div>

        <label className="field-label">
            Շինության տիպ
            <span className="required-star">*</span>
        </label>

        <div className="chips-flex-row">

            {[
                'Քարե',
                'Պանելային',
                'Մոնոլիտ',
                'Աղյուսե',
                'Կասետային',
                'Փայտե'
            ].map(opt => {

                const isChecked =
                    constructionType === opt;

                return (
                    <div
                        key={opt}
                        className={`chip-checkbox-btn ${
                            isChecked
                                ? 'selected'
                                : ''
                        }`}
                        onClick={() => {
                            setConstructionType(prev =>
                                prev === opt
                                    ? ''
                                    : opt
                            );

                            if (
                                errors.constructionType
                            ) {
                                setErrors(prev => ({
                                    ...prev,
                                    constructionType:
                                        null
                                }));
                            }
                        }}
                    >
                        <div className="chip-box-indicator">
                            {isChecked ? '✓' : ''}
                        </div>

                        <span>{opt}</span>
                    </div>
                );
            })}

        </div>

        {errors.constructionType && (
            <div className="error-text">
                ⚠ {errors.constructionType}
            </div>
        )}

    </div>

    {/* Հարկերի քանակ */}
    <div>

        <label className="field-label">
            Հարկերի քանակ
            <span className="required-star">*</span>
        </label>

        <div className="chips-flex-row">

            {['1', '2', '3', '4+'].map(fl => (
                <button
                    key={fl}
                    type="button"
                    className={`chip-btn-square ${
                        floorsCount === fl
                            ? 'selected'
                            : ''
                    }`}
                    onClick={() =>
                        setFloorsCount(prev =>
                            prev === fl
                                ? ''
                                : fl
                        )
                    }
                >
                    {fl}
                </button>
            ))}

        </div>

    </div>

    {/* Սանհանգույցների քանակ */}
    <div>

        <label className="field-label">
            Սանհանգույցների քանակ
            <span className="required-star">*</span>
        </label>

        <div className="chips-flex-row">

            {['1', '2', '3+'].map(b => (
                <button
                    key={b}
                    type="button"
                    className={`chip-btn-square ${
                        bathroomsCount === b
                            ? 'selected'
                            : ''
                    }`}
                    onClick={() =>
                        setBathroomsCount(prev =>
                            prev === b
                                ? ''
                                : b
                        )
                    }
                >
                    {b}
                </button>
            ))}

        </div>

    </div>

    {/* Ավտոտնակ */}
    <div>

        <label className="field-label">
            Ավտոտնակ
            <span className="required-star">*</span>
        </label>

        <div className="chips-flex-row">

            {[
                'Առկա չէ',
                '1 տեղ',
                '2 տեղ',
                '3 կամ ավելի տեղեր'
            ].map(opt => {

                const isChecked =
                    garage === opt;

                return (
                    <div
                        key={opt}
                        className={`chip-checkbox-btn ${
                            isChecked
                                ? 'selected'
                                : ''
                        }`}
                        onClick={() =>
                            setGarage(prev =>
                                prev === opt
                                    ? ''
                                    : opt
                            )
                        }
                    >
                        <div className="chip-box-indicator">
                            {isChecked ? '✓' : ''}
                        </div>

                        <span>{opt}</span>
                    </div>
                );
            })}

        </div>

    </div>

    {/* Վերանորոգում */}
    <div>

        <label className="field-label">
            Վերանորոգում
            <span className="required-star">*</span>
        </label>

        <div className="chips-flex-row">

            {[
                'Չվերանորոգված',
                'Հին',
                'Մասնակի',
                'Կոսմետիկ',
                'Եվրո',
                'Դիզայներական',
                'Կապիտալ'
            ].map(opt => {

                const isChecked =
                    renovation === opt;

                return (
                    <div
                        key={opt}
                        className={`chip-checkbox-btn ${
                            isChecked
                                ? 'selected'
                                : ''
                        }`}
                        onClick={() =>
                            setRenovation(prev =>
                                prev === opt
                                    ? ''
                                    : opt
                            )
                        }
                    >
                        <div className="chip-box-indicator">
                            {isChecked ? '✓' : ''}
                        </div>

                        <span>{opt}</span>
                    </div>
                );
            })}

        </div>

    </div>

    {/* Կենցաղային տեխնիկա */}
    <div>

        <label className="field-label">
            Կենցաղային տեխնիկա
        </label>

        <div className="chips-flex-row">

            {[
                'Օդորակիչ',
                'Սառնարան',
                'Սալօջախ',
                'Սպասք լվացող մեքենա',
                'Լվացքի մեքենա',
                'Չորացնող մեքենա'
            ].map(item => {

                const isChecked =
                    appliances.includes(item);

                return (
                    <div
                        key={item}
                        className={`chip-checkbox-btn ${
                            isChecked
                                ? 'selected'
                                : ''
                        }`}
                        onClick={() =>
                            toggleMultiSelect(
                                item,
                                appliances,
                                setAppliances
                            )
                        }
                    >
                        <div className="chip-box-indicator">
                            {isChecked ? '✓' : ''}
                        </div>

                        <span>{item}</span>
                    </div>
                );
            })}

        </div>

    </div>

    {/* Կոմունիկացիաներ */}
    <div>

        <label className="field-label">
            Կոմունիկացիաներ
        </label>

        <div className="chips-flex-row">

            {[
                'Էլեկտրականություն',
                'Ջրամատակարարում',
                'Գազ',
                'Կոյուղի'
            ].map(item => {

                const isChecked =
                    serviceLines.includes(item);

                return (
                    <div
                        key={item}
                        className={`chip-checkbox-btn ${
                            isChecked
                                ? 'selected'
                                : ''
                        }`}
                        onClick={() =>
                            toggleMultiSelect(
                                item,
                                serviceLines,
                                setServiceLines
                            )
                        }
                    >
                        <div className="chip-box-indicator">
                            {isChecked ? '✓' : ''}
                        </div>

                        <span>{item}</span>
                    </div>
                );
            })}

        </div>

    </div>

    {/* Հարմարություններ */}
    <div>

        <label className="field-label">
            Հարմարություններ
        </label>

        <div className="chips-flex-row">

            {[
                'Լողավազան',
                'Սաունա',
                'Բուխարի',
                'Խորովածի վառարան',
                'Տաղավար',
                'Անվտանգության համակարգ'
            ].map(item => {

                const isChecked =
                    facilities.includes(item);

                return (
                    <div
                        key={item}
                        className={`chip-checkbox-btn ${
                            isChecked
                                ? 'selected'
                                : ''
                        }`}
                        onClick={() =>
                            toggleMultiSelect(
                                item,
                                facilities,
                                setFacilities
                            )
                        }
                    >
                        <div className="chip-box-indicator">
                            {isChecked ? '✓' : ''}
                        </div>

                        <span>{item}</span>
                    </div>
                );
            })}

        </div>

    </div>

    {/* Հարմար է անվասայլակով մարդկանց համար */}
    <div>

        <label className="field-label">
            Հարմար է անվասայլակով մարդկանց համար
            <span className="required-star">*</span>
        </label>

        <div className="chips-flex-row">

            {['Այո', 'Ոչ'].map(option => {

                const isChecked =
                    wheelchairAccessible === option;

                return (
                    <div
                        key={option}
                        className={`chip-checkbox-btn ${
                            isChecked
                                ? 'selected'
                                : ''
                        }`}
                        onClick={() => {
                            setWheelchairAccessible(
                                prev =>
                                    prev === option
                                        ? ''
                                        : option
                            );

                            if (
                                errors.wheelchairAccessible
                            ) {
                                setErrors(prev => ({
                                    ...prev,
                                    wheelchairAccessible:
                                        null
                                }));
                            }
                        }}
                    >
                        <div className="chip-box-indicator">
                            {isChecked ? '✓' : ''}
                        </div>

                        <span>{option}</span>
                    </div>
                );
            })}

        </div>

        {errors.wheelchairAccessible && (
            <div className="error-text">
                ⚠ {errors.wheelchairAccessible}
            </div>
        )}

    </div>

    {/* Կահույք */}
    <div>

        <label className="field-label">
            Կահույք
            <span className="required-star">*</span>
        </label>

        <div className="chips-flex-row">

            {[
                'Կահույքով',
                'Առկա չէ',
                'Մասնակի',
                'Համաձայնությամբ'
            ].map(opt => {

                const isChecked =
                    furniture === opt;

                return (
                    <div
                        key={opt}
                        className={`chip-checkbox-btn ${
                            isChecked
                                ? 'selected'
                                : ''
                        }`}
                        onClick={() => {
                            setFurniture(prev =>
                                prev === opt
                                    ? ''
                                    : opt
                            );

                            if (errors.furniture) {
                                setErrors(prev => ({
                                    ...prev,
                                    furniture: null
                                }));
                            }
                        }}
                    >
                        <div className="chip-box-indicator">
                            {isChecked ? '✓' : ''}
                        </div>

                        <span>{opt}</span>
                    </div>
                );
            })}

        </div>

        {errors.furniture && (
            <div className="error-text">
                ⚠ {errors.furniture}
            </div>
        )}

    </div>

</div>

{/* 4. Հողատարածքի պարամետրեր */}
<div className="form-section">

    <h2 className="section-title">
        Հողատարածքի պարամետրեր
    </h2>

    <div>

        <label className="field-label">
            Հողատարածքի ընդհանուր մակերես
            <span className="required-star">*</span>
        </label>

        <div className="input-max-width input-with-addon">

            <input
                type="number"
                className={`custom-input ${
                    errors.totalLandArea
                        ? 'has-error'
                        : ''
                }`}
                placeholder="Օր․՝ 450"
                value={totalLandArea}
                onChange={(e) => {
                    setTotalLandArea(
                        e.target.value
                    );

                    if (errors.totalLandArea) {
                        setErrors(prev => ({
                            ...prev,
                            totalLandArea: null
                        }));
                    }
                }}
            />

            <span className="input-addon-text">
                                        քմ
                                    </span>

        </div>

        {errors.totalLandArea && (
            <div className="error-text">
                ⚠ {errors.totalLandArea}
            </div>
        )}

    </div>

</div>

{/* 5. Գին */}
<div className="form-section">

    <h2 className="section-title">
        Գին
        <span className="required-star">*</span>
    </h2>

    <div className="price-row-container">

        <div
            style={{
                flex: '1 1 240px',
                minWidth: 200
            }}
        >
            <input
                type="number"
                className={`custom-input ${
                    errors.price
                        ? 'has-error'
                        : ''
                }`}
                placeholder="Օր․՝ 150000"
                value={price}
                onChange={(e) => {
                    setPrice(e.target.value);

                    if (errors.price) {
                        setErrors(prev => ({
                            ...prev,
                            price: null
                        }));
                    }
                }}
            />
        </div>

        <div className="currency-chips-group">

            {[
                '֏ (AMD)',
                '$ (USD)',
                '€ (EUR)',
                '₽ (RUB)'
            ].map(curr => (
                <button
                    key={curr}
                    type="button"
                    className={`currency-chip-btn ${
                        currency === curr
                            ? 'selected'
                            : ''
                    }`}
                    onClick={() =>
                        setCurrency(curr)
                    }
                >
                    {curr}
                </button>
            ))}

        </div>

    </div>

    {errors.price && (
        <div className="error-text">
            ⚠ {errors.price}
        </div>
    )}

</div>

{/* 6. Մանրամասն տեղեկություն / Լուսանկարներ */}
<div className="form-section">

    <h2 className="section-title">
        Լուսանկարներ և նկարագրություն
    </h2>

    {/* Նկարագրություն */}
    <div style={{ marginBottom: 20 }}>

        <label className="field-label">
            Նկարագրություն
        </label>

        <textarea
            className="custom-textarea"
            rows={5}
            placeholder="Նկարագրեք առանձնատունը, առավելությունները, շրջակայքը, հարևանությունը..."
            value={description}
            onChange={(e) =>
                setDescription(
                    e.target.value
                )
            }
        />

    </div>

    {/* Լուսանկարների վերբեռնում */}
    <div>

        <label className="field-label">
            Լուսանկարներ
            <span className="required-star">*</span>
        </label>

        <p className="field-description">
            Վերբեռնեք առնվազն 4 լուսանկար
            (առավելագույնը 15 հատ)։
            Առաջին լուսանկարը կլինի գլխավորը։
        </p>

        <div
            className={`upload-dropzone ${
                isDragging
                    ? 'dragging'
                    : ''
            } ${
                errors.photos
                    ? 'has-error'
                    : ''
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() =>
                fileInputRef.current &&
                fileInputRef.current.click()
            }
        >

            <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                multiple
                accept="image/*"
                onChange={(e) => {
                    if (e.target.files) {
                        handleAddPhotos(
                            e.target.files
                        );
                    }
                }}
            />

            <div className="upload-icon-circle">
                <UploadCloud size={24} />
            </div>

            <div className="upload-main-text">
                Սեղմեք կամ քաշեք լուսանկարներն այստեղ
            </div>

            <div className="upload-sub-text">
                PNG, JPG, WEBP մինչև 10MB
                ({photos.length} / 15 վերբեռնված)
            </div>

        </div>

        {errors.photos && (
            <div className="error-text">
                ⚠ {errors.photos}
            </div>
        )}

        <AiPhotoCleaner
            onTransferToMainPhotos={(newPhotos) =>
                setPhotos((prev) => [
                    ...prev,
                    ...newPhotos,
                ])
            }
        />

    </div>

    {/* Վերբեռնված նկարների ցանց */}
    {photos.length > 0 && (
        <div className="photos-preview-grid">

            {photos.map((src, index) => (
                <div
                    key={index}
                    className="photo-thumbnail-card"
                >

                    <img
                        src={src}
                        alt={`Լուսանկար ${index + 1}`}
                        className="photo-img"
                    />

                    {index === 0 && (
                        <span className="badge-main-photo">
                                                    Գլխավոր
                                                </span>
                    )}

                    <button
                        type="button"
                        className="btn-remove-photo"
                        onClick={() =>
                            handleRemovePhoto(index)
                        }
                        title="Հեռացնել լուսանկարը"
                    >
                        ✕
                    </button>

                </div>
            ))}

        </div>
    )}

</div>

{/* 7. Կոնտակտային տվյալներ */}
<div className="form-section">

    <h2 className="section-title">
        Կոնտակտային տվյալներ
    </h2>

    <div className="radio-group-vertical">

        <label
            className="custom-radio-row"
            onClick={() =>
                setContactPhoneOption(prev =>
                    prev === 'phone'
                        ? ''
                        : 'phone'
                )
            }
        >
            <div
                className={`custom-checkbox-box ${
                    contactPhoneOption === 'phone'
                        ? 'checked'
                        : ''
                }`}
            >
                {contactPhoneOption === 'phone' &&
                    '✓'}
            </div>

            <div>
                <div className="radio-text-title">
                    {contactPhone}
                </div>
            </div>
        </label>

        <label
            className="custom-radio-row"
            onClick={() =>
                setContactPhoneOption(prev =>
                    prev === 'none'
                        ? ''
                        : 'none'
                )
            }
        >
            <div
                className={`custom-checkbox-box ${
                    contactPhoneOption === 'none'
                        ? 'checked'
                        : ''
                }`}
            >
                {contactPhoneOption === 'none' &&
                    '✓'}
            </div>

            <div>
                <div className="radio-text-title">
                    Չկցել հեռախոսահամար
                </div>
            </div>
        </label>

    </div>

</div>

{/* Կոճակների գոտի */}
<div className="form-actions-bar">

    <button
        type="button"
        className="btn-cancel"
        onClick={onBack}
    >
        Չեղարկել
    </button>

    <div
        style={{
            display: 'flex',
            gap: 12
        }}
    >

        <button
            type="button"
            className="btn-draft"
            onClick={handleSaveDraft}
        >
            <Save size={16} />
            <span>
                                        Պահպանել սևագիր
                                    </span>
        </button>

        <button
            type="submit"
            className="btn-preview"
        >
            <Eye size={16} />
            <span>
                                        Ուղարկել
                                    </span>
        </button>

    </div>

</div>

</form>
)}

</div>
</div>
</I18nTree>
);
}
