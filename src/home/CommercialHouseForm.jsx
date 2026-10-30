import React, { useState, useRef } from 'react';
import {
    Check,
    X,
    Image as ImageIcon,
    AlertCircle,
    BookmarkCheck,
    ArrowLeft,
    Sparkles,
    MapPin,
    Home,
    Sliders,
    DollarSign,
    Phone
} from 'lucide-react';
import './CommercialHouseForm.css';
import AiPhotoCleaner from "../ai-cleaner/AiPhotoCleaner.jsx";
import { filesToPhotoCards, loadFormDraft, useFormDraftState, useSaveFormDraft } from "../services/uiSession.js";
import { I18nTree } from '../i18n/I18n.jsx';

export function CommercialHouseForm({ onBack, onSave }) {
    const draft = loadFormDraft("daily-house");

    // Stepper state (1: Բաժին, 2: Հայտարարություն, 3: Ուղարկել)
    const [currentStep, setCurrentStep] = useState(draft.currentStep || 2);
    const [showDraftToast, setShowDraftToast] = useState(false);
    const [errors, setErrors] = useState({});

    // 1. Ձեր կարգավիճակը
    // Սկզբում ոչ մի տարբերակ ակտիվ չէ
    const [status, setStatus] = useState(draft.status || '');

    // 2. Գտնվելու վայրը
    const [region, setRegion] = useState(draft.region || '');
    const [cityOrDistrict, setCityOrDistrict] = useState(draft.cityOrDistrict || '');
    const [street, setStreet] = useState(draft.street || '');
    const [buildingNumber, setBuildingNumber] = useState(draft.buildingNumber || '');
    const [hideBuildingNumber, setHideBuildingNumber] = useState(Boolean(draft.hideBuildingNumber));

    // 3. Տան մասին
    const [roomsCount, setRoomsCount] = useState(draft.roomsCount || '');
    const [houseArea, setHouseArea] = useState(draft.houseArea || '');
    const [buildingType, setBuildingType] = useState(draft.buildingType || '');
    const [floorsCount, setFloorsCount] = useState(draft.floorsCount || '');
    const [bathroomsCount, setBathroomsCount] = useState(draft.bathroomsCount || '');
    const [renovation, setRenovation] = useState(draft.renovation || '');
    const [garage, setGarage] = useState(draft.garage || '');

    // 4. Հարմարություններ (Checkboxes)
    const [amenities, setAmenities] = useState(draft.amenities || {
        tv: false,
        internet: false,
        airConditioner: false,
        pool: false,
        sauna: false,
        fireplace: false,
        bbq: false,
        billiards: false,
        gazebo: false,
        security: false,
    });

    // 5. Կենցաղային տեխնիկա (Checkboxes)
    const [appliances, setAppliances] = useState(draft.appliances || {
        fridge: false,
        stove: false,
        microwave: false,
        coffeeMaker: false,
        dishwasher: false,
        washingMachine: false,
        dryer: false,
        waterHeater: false,
        iron: false,
        hairDryer: false,
    });

    // 6. Հարմար է անվասայլակով մարդկանց համար
    // Սկզբում ոչ «Այո», ոչ «Ոչ» ակտիվ չէ
    const [wheelchairAccessible, setWheelchairAccessible] = useState(draft.wheelchairAccessible || '');

    // 7. Կոմֆորտ
    const [comfort, setComfort] = useState(draft.comfort || []);

    // 8. Տեղեկություններ հողատարածքի մասին
    const [landArea, setLandArea] = useState(draft.landArea || '');

    // 9. Բնակության կանոններ
    const [withChildren, setWithChildren] = useState(draft.withChildren || '');
    const [petsAllowed, setPetsAllowed] = useState(draft.petsAllowed || '');
    const [maxGuests, setMaxGuests] = useState(draft.maxGuests || '');
    const [overnightAllowed, setOvernightAllowed] = useState(draft.overnightAllowed || '');

    // 10. Գործարքի պայմաններ
    // Սկզբում ոչ մի արժույթ և պարբերականություն ակտիվ չէ
    const [price, setPrice] = useState(draft.price || '');
    const [currency, setCurrency] = useState(draft.currency || '');
    const [period, setPeriod] = useState(draft.period || '');

    // 11. Լուսանկարներ
    const [photos, setPhotos] = useFormDraftState("daily-house", "photos", draft.photos || []);
    const fileInputRef = useRef(null);

    // 12. Կոնտակտային տվյալներ
    // Սկզբում ոչ մի կոնտակտային տարբերակ ակտիվ չէ
    const [contactType, setContactType] = useState(draft.contactType || '');
    const [phoneNumber, setPhoneNumber] = useState(draft.phoneNumber || '');

    useSaveFormDraft("daily-house", {
        currentStep,
        status,
        region,
        cityOrDistrict,
        street,
        buildingNumber,
        hideBuildingNumber,
        roomsCount,
        houseArea,
        buildingType,
        floorsCount,
        bathroomsCount,
        renovation,
        garage,
        amenities,
        appliances,
        wheelchairAccessible,
        comfort,
        landArea,
        withChildren,
        petsAllowed,
        maxGuests,
        overnightAllowed,
        price,
        currency,
        period,
        photos,
        contactType,
        phoneNumber,
    });

    // ՀՀ մարզեր
    const regionsList = [
        'Երևան', 'Արմավիր', 'Արարատ', 'Կոտայք', 'Շիրակ',
        'Լոռի', 'Գեղարքունիք', 'Սյունիք', 'Արագածոտն', 'Տավուշ', 'Վայոց Ձոր'
    ];

    // Մարզերի քաղաքներ և խոշոր համայնքներ
    const regionSubdivisions = {
        'Երևան': {
            label: 'Երևանի վարչական շրջաններ / համայնքներ',
            items: [
                'Կենտրոն', 'Արաբկիր', 'Քանաքեռ-Զեյթուն', 'Նոր Նորք',
                'Ավան', 'Էրեբունի', 'Շենգավիթ', 'Դավթաշեն',
                'Աջափնյակ', 'Մալաթիա-Սեբաստիա', 'Նորք-Մարաշ', 'Նուբարաշեն'
            ]
        },
        'Արարատ': {
            label: 'Արարատի մարզի քաղաքներ և համայնքներ',
            items: [
                'Արտաշատ', 'Մասիս', 'Վեդի', 'Արարատ (քաղաք)',
                'Այնթապ', 'Մարմարաշեն', 'Նոր Խարբերդ', 'Ավշար', 'Ոսկետափ', 'Արարատ (գյուղ)'
            ]
        },
        'Արմավիր': {
            label: 'Արմավիրի մարզի քաղաքներ և համայնքներ',
            items: [
                'Վաղարշապատ (Էջմիածին)', 'Արմավիր (քաղաք)', 'Մեծամոր',
                'Փարաքար', 'Բաղրամյան', 'Մարգարա', 'Սարդարապատ', 'Մյասնիկյան'
            ]
        },
        'Կոտայք': {
            label: 'Կոտայքի մարզի քաղաքներ և համայնքներ',
            items: [
                'Աբովյան', 'Հրազդան', 'Ծաղկաձոր', 'Չարենցավան',
                'Եղվարդ', 'Նոր Հաճն', 'Բյուրեղավան', 'Գառնի',
                'Ձորաղբյուր', 'Քասախ', 'Առինջ', 'Պռոշյան', 'Բջնի'
            ]
        },
        'Շիրակ': {
            label: 'Շիրակի մարզի քաղաքներ և համայնքներ',
            items: [
                'Գյումրի', 'Արթիկ', 'Մարալիկ', 'Ախուրյան', 'Աշոցք', 'Ամասիա'
            ]
        },
        'Լոռի': {
            label: 'Լոռու մարզի քաղաքներ և համայնքներ',
            items: [
                'Վանաձոր', 'Ստեփանավան', 'Սպիտակ', 'Ալավերդի',
                'Տաշիր', 'Թումանյան', 'Շամլուղ', 'Օձուն', 'Դսեղ'
            ]
        },
        'Գեղարքունիք': {
            label: 'Գեղարքունիքի մարզի քաղաքներ և համայնքներ',
            items: [
                'Սևան', 'Գավառ', 'Մարտունի', 'Վարդենիս',
                'Ճամբարակ', 'Ծովագյուղ', 'Լճաշեն', 'Շողակաթ'
            ]
        },
        'Սյունիք': {
            label: 'Սյունիքի մարզի քաղաքներ և համայնքներ',
            items: [
                'Կապան', 'Գորիս', 'Սիսիան', 'Մեղրի',
                'Քաջարան', 'Ագարակ', 'Տաթև', 'Խնձորեսկ'
            ]
        },
        'Արագածոտն': {
            label: 'Արագածոտնի մարզի քաղաքներ և համայնքներ',
            items: [
                'Աշտարակ', 'Ապարան', 'Թալին', 'Օշական',
                'Բյուրական', 'Սասունիկ', 'Արագած'
            ]
        },
        'Տավուշ': {
            label: 'Տավուշի մարզի քաղաքներ և համայնքներ',
            items: [
                'Իջևան', 'Դիլիջան', 'Բերդ', 'Նոյեմբերյան',
                'Այրում', 'Կողբ', 'Աչաջուր', 'Հաղարծին'
            ]
        },
        'Վայոց Ձոր': {
            label: 'Վայոց Ձորի մարզի քաղաքներ և համայնքներ',
            items: [
                'Եղեգնաձոր', 'Ջերմուկ', 'Վայք', 'Արենի',
                'Մալիշկա', 'Եղեգիս', 'Գնդեվազ'
            ]
        }
    };

    const roomOptions = ['1', '2', '3', '4', '5', '6', '7', '8+'];
    const buildingTypes = ['Քարե', 'Պանելային', 'Մոնոլիտ', 'Աղյուսե', 'Կասետային', 'Փայտե'];
    const floorOptions = ['1', '2', '3', '4+'];
    const bathroomOptions = ['1', '2', '3+'];

    const renovationOptions = [
        'Չվերանորոգված',
        'Հին',
        'Մասնակի',
        'Կոսմետիկ',
        'Եվրո',
        'Դիզայներական',
        'Կապիտալ'
    ];

    const garageOptions = [
        'Առկա չէ',
        '1 տեղ',
        '2 տեղ',
        '3 կամ ավելի տեղեր'
    ];

    const amenitiesList = [
        { key: 'tv', label: 'Հեռուստացույց' },
        { key: 'internet', label: 'Ինտերնետ' },
        { key: 'airConditioner', label: 'Օդորակիչ' },
        { key: 'pool', label: 'Լողավազան' },
        { key: 'sauna', label: 'Սաունա' },
        { key: 'fireplace', label: 'Բուխարի' },
        { key: 'bbq', label: 'Խորովածի վառարան' },
        { key: 'billiards', label: 'Բիլիարդ' },
        { key: 'gazebo', label: 'Տաղավար' },
        { key: 'security', label: 'Անվտանգության համակարգ' },
    ];

    const appliancesList = [
        { key: 'fridge', label: 'Սառնարան' },
        { key: 'stove', label: 'Սալօջախ' },
        { key: 'microwave', label: 'Միկրոալիքային վառարան' },
        { key: 'coffeeMaker', label: 'Սրճեփ' },
        { key: 'dishwasher', label: 'Սպասք լվացող մեքենա' },
        { key: 'washingMachine', label: 'Լվացքի մեքենա' },
        { key: 'dryer', label: 'Չորացնող մեքենա' },
        { key: 'waterHeater', label: 'Ջրատաքացուցիչ' },
        { key: 'iron', label: 'Արդուկ' },
        { key: 'hairDryer', label: 'Ֆեն' },
    ];

    const comfortItems = [
        'Սրբիչներ',
        'Անկողնային պարագաներ',
        'Հիգիենայի պարագաներ'
    ];

    const currencyOptions = [
        { code: 'AMD', label: '֏ AMD' },
        { code: 'USD', label: '$ USD' },
        { code: 'EUR', label: '€ EUR' },
        { code: 'RUB', label: '₽ RUB' },
    ];

    const periodOptions = ['օրական', 'ամսական'];

    // Հետ գնալու ֆունկցիա
    const handleGoBackToFirstStep = () => {
        if (onBack) {
            onBack();
        } else if (
            typeof window !== 'undefined' &&
            window.history &&
            window.history.length > 1
        ) {
            window.history.back();
        } else {
            setCurrentStep(1);
        }
    };

    const handleToggleComfort = (item) => {
        if (comfort.includes(item)) {
            setComfort(comfort.filter((i) => i !== item));
        } else {
            setComfort([...comfort, item]);
        }
    };

    const addPhotoFiles = async (files) => {
        const newPhotos = await filesToPhotoCards(files);

        if (newPhotos.length === 0) {
            return;
        }

        setPhotos((prev) => [...prev, ...newPhotos]);

        if (errors.photos) {
            setErrors((prev) => ({
                ...prev,
                photos: null
            }));
        }
    };

    const handleFileUpload = (e) => {
        addPhotoFiles(e.target.files);
    };

    const handleRemovePhoto = (id) => {
        setPhotos(photos.filter((p) => p.id !== id));
    };

    const handleSaveDraft = () => {
        setShowDraftToast(true);

        setTimeout(() => {
            setShowDraftToast(false);
        }, 3500);
    };

    const handleResetForm = () => {
        if (
            window.confirm(
                'Իսկապե՞ս ցանկանում եք չեղարկել և մաքրել ձևաթուղթը:'
            )
        ) {
            setStatus('');
            setRegion('');
            setCityOrDistrict('');
            setStreet('');
            setBuildingNumber('');
            setHideBuildingNumber(false);

            setRoomsCount('');
            setHouseArea('');
            setBuildingType('');
            setFloorsCount('');
            setBathroomsCount('');
            setRenovation('');
            setGarage('');

            setAmenities({
                tv: false,
                internet: false,
                airConditioner: false,
                pool: false,
                sauna: false,
                fireplace: false,
                bbq: false,
                billiards: false,
                gazebo: false,
                security: false,
            });

            setAppliances({
                fridge: false,
                stove: false,
                microwave: false,
                coffeeMaker: false,
                dishwasher: false,
                washingMachine: false,
                dryer: false,
                waterHeater: false,
                iron: false,
                hairDryer: false,
            });

            setWheelchairAccessible('');
            setComfort([]);
            setLandArea('');

            setWithChildren('');
            setPetsAllowed('');
            setMaxGuests('');
            setOvernightAllowed('');

            setPrice('');
            setCurrency('');
            setPeriod('');

            setPhotos([]);
            setContactType('');
            setPhoneNumber('');

            setErrors({});

            handleGoBackToFirstStep();
        }
    };

    const handleQuickDemoFill = () => {
        setStatus('owner');
        setRegion('Երևան');
        setCityOrDistrict('Կենտրոն');
        setStreet('Թումանյան փող․');
        setBuildingNumber('28');
        setHideBuildingNumber(false);

        setRoomsCount('4');
        setHouseArea('220');
        setBuildingType('Մոնոլիտ');
        setFloorsCount('2');
        setBathroomsCount('2');
        setRenovation('Դիզայներական');
        setGarage('2 տեղ');

        setAmenities({
            tv: true,
            internet: true,
            airConditioner: true,
            pool: true,
            sauna: false,
            fireplace: true,
            bbq: true,
            billiards: false,
            gazebo: true,
            security: true,
        });

        setAppliances({
            fridge: true,
            stove: true,
            microwave: true,
            coffeeMaker: true,
            dishwasher: true,
            washingMachine: true,
            dryer: true,
            waterHeater: true,
            iron: true,
            hairDryer: true,
        });

        setWheelchairAccessible('Այո');

        setComfort([
            'Սրբիչներ',
            'Անկողնային պարագաներ',
            'Հիգիենայի պարագաներ'
        ]);

        setLandArea('450');

        setWithChildren('Այո');
        setPetsAllowed('Համաձայնությամբ');
        setMaxGuests('8');
        setOvernightAllowed('Այո');

        setPrice('85000');
        setCurrency('AMD');
        setPeriod('օրական');

        setPhotos([
            {
                id: '1',
                name: 'house_main.jpg',
                url: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=800&q=80',
                size: '1.4',
            },
            {
                id: '2',
                name: 'living_room.jpg',
                url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
                size: '1.2',
            },
        ]);

        setContactType('phone');
        setPhoneNumber('(077) 12-35-23');

        setErrors({});
    };

    const validateForm = () => {
        const newErrors = {};

        if (!status) {
            newErrors.status = 'Նշեք ձեր կարգավիճակը';
        }

        if (!region) {
            newErrors.region = 'Ընտրեք տարածաշրջանը';
        }

        if (!street.trim()) {
            newErrors.street = 'Մուտքագրեք փողոցը';
        }

        if (!roomsCount) {
            newErrors.roomsCount = 'Ընտրեք սենյակների քանակը';
        }

        if (!houseArea) {
            newErrors.houseArea = 'Նշեք տան մակերեսը';
        }

        if (!buildingType) {
            newErrors.buildingType = 'Ընտրեք շինության տիպը';
        }

        if (!floorsCount) {
            newErrors.floorsCount = 'Նշեք հարկերի քանակը';
        }

        if (!bathroomsCount) {
            newErrors.bathroomsCount = 'Նշեք սանհանգույցների քանակը';
        }

        if (!renovation) {
            newErrors.renovation = 'Ընտրեք վերանորոգման վիճակը';
        }

        if (!garage) {
            newErrors.garage = 'Ընտրեք ավտոտնակի տարբերակը';
        }

        if (!landArea) {
            newErrors.landArea = 'Նշեք հողատարածքի մակերեսը';
        }

        if (!withChildren) {
            newErrors.withChildren = 'Նշեք երեխաների հետ կարգավիճակը';
        }

        if (!petsAllowed) {
            newErrors.petsAllowed = 'Նշեք կենդանիների թույլտվությունը';
        }

        if (!maxGuests) {
            newErrors.maxGuests = 'Նշեք հյուրերի առավելագույն քանակը';
        }

        if (!overnightAllowed) {
            newErrors.overnightAllowed = 'Նշեք գիշերակացի հնարավորությունը';
        }

        if (!wheelchairAccessible) {
            newErrors.wheelchairAccessible =
                'Նշեք՝ արդյոք հարմար է անվասայլակով մարդկանց համար';
        }

        if (!price) {
            newErrors.price = 'Նշեք վարձավճարը';
        }

        if (photos.length === 0) {
            newErrors.photos = 'Վերբեռնեք առնվազն մեկ լուսանկար';
        }

        setErrors(newErrors);

        return Object.keys(newErrors).length === 0;
    };

    const handlePreview = () => {
        if (validateForm()) {
            setCurrentStep(3);

            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        } else {
            window.scrollTo({
                top: 150,
                behavior: 'smooth'
            });
        }
    };

    const handleFinalSubmit = () => {
        const payload = {
            status,
            region,
            cityOrDistrict,
            street,
            buildingNumber,
            hideBuildingNumber,

            roomsCount,
            houseArea,
            buildingType,
            floorsCount,
            bathroomsCount,
            renovation,
            garage,

            amenities,
            appliances,
            wheelchairAccessible,
            comfort,

            landArea,

            withChildren,
            petsAllowed,
            maxGuests,
            overnightAllowed,

            price,
            currency,
            period,

            photos,
            photosCount: photos.length,

            contactType,
            phoneNumber
        };

        if (onSave) {
            onSave(payload);
        } else {
            alert('Հայտարարությունը հաջողությամբ ուղարկվեց');
        }
    };

    const fullLocationDisplay = region
        ? `${region}${cityOrDistrict ? `, ${cityOrDistrict}` : ''}`
        : '';

    const activeSubdivision = region
        ? regionSubdivisions[region]
        : null;

    return (
        <I18nTree>
        <div className="commercial-form-page">

            {/* Toast */}
            {showDraftToast && (
                <div className="draft-toast">
                    <BookmarkCheck className="draft-toast-icon" />
                    <span>Սևագիրը հաջողությամբ պահպանվեց</span>
                </div>
            )}

            <div className="commercial-form-container">

                {/* Stepper Header_agency */}
                <div className="stepper-header">

                    <div
                        className="step-item completed clickable"
                        onClick={handleGoBackToFirstStep}
                        title="Վերադառնալ Բաժինների ընտրությանը"
                    >
                        <div className="step-badge completed-badge">
                            <Check size={14} strokeWidth={3} />
                        </div>

                        <span>Բաժին</span>
                    </div>

                    <div
                        onClick={() => setCurrentStep(2)}
                        className={`step-item ${
    currentStep === 2
        ? 'active'
        : 'inactive'
} clickable`}
                    >
                        <div
                            className={`step-badge ${
    currentStep === 2
        ? 'active-badge'
        : 'inactive-badge'
}`}
                        >
                            2
                        </div>

                        <span>Հայտարարություն</span>
                    </div>

                    <div
                        onClick={() =>
                            validateForm() &&
                            setCurrentStep(3)
                        }
                        className={`step-item ${
    currentStep === 3
        ? 'active'
        : 'inactive'
} clickable`}
                    >
                        <div
                            className={`step-badge ${
    currentStep === 3
        ? 'active-badge'
        : 'inactive-badge'
}`}
                        >
                            3
                        </div>

                        <span>Ուղարկել</span>
                    </div>
                </div>

                {/* Step 1 Dummy View */}
                {currentStep === 1 && (
                    <div
                        className="form-card"
                        style={{
                            textAlign: 'center',
                            padding: '48px 24px'
                        }}
                    >
                        <Home
                            size={44}
                            style={{
                                color: '#38bdf8',
                                margin: '0 auto 16px'
                            }}
                        />

                        <h2
                            style={{
                                fontSize: '20px',
                                fontWeight: 700,
                                marginBottom: '8px'
                            }}
                        >
                            Ընտրեք հայտարարության բաժինը
                        </h2>

                        <p
                            style={{
                                color: '#94a3b8',
                                fontSize: '14px',
                                marginBottom: '24px'
                            }}
                        >
                            Դուք ընտրել եք «Տներ › Տուն» բաժինը:
                        </p>

                        <button
                            type="button"
                            onClick={() => setCurrentStep(2)}
                            className="btn-submit"
                            style={{ margin: '0 auto' }}
                        >
                            Անցնել Հայտարարության լրացմանը (Քայլ 2)
                        </button>
                    </div>
                )}

                {/* Step 3: Preview Screen */}
                {currentStep === 3 && (
                    <div className="form-card">

                        <div className="preview-header">
                            <div>
                                <button
                                    type="button"
                                    onClick={() => setCurrentStep(2)}
                                    className="btn-back-edit"
                                >
                                    <ArrowLeft size={16} />
                                    Վերադառնալ խմբագրմանը
                                </button>

                                <h1 className="form-main-title">
                                    Հայտարարության նախադիտում
                                </h1>
                            </div>

                            <span className="preview-badge-status">
                                Պատրաստ է հրապարակման
                            </span>
                        </div>

                        {/* Photos Preview */}
                        <div className="form-section">
                            <div className="field-label">
                                Լուսանկարներ ({photos.length})
                            </div>

                            <div className="photos-preview-grid">
                                {photos.map((photo, i) => (
                                    <div
                                        key={photo.id}
                                        className="photo-thumbnail-card"
                                    >
                                        <img
                                            src={photo.url}
                                            alt={`Photo ${i + 1}`}
                                            className="photo-img"
                                        />

                                        {i === 0 && (
                                            <span className="badge-main-photo">
                                                Գլխավոր
                                            </span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Price & Location Summary */}
                        <div className="preview-summary-card">

                            <div>
                                <div
                                    style={{
                                        fontSize: '13px',
                                        color: '#94a3b8'
                                    }}
                                >
                                    Տեղադրել հայտարարություն › Տներ › Տուն
                                </div>

                                <div
                                    style={{
                                        fontSize: '18px',
                                        fontWeight: 'bold',
                                        color: '#fff',
                                        marginTop: '4px'
                                    }}
                                >
                                    {fullLocationDisplay}, {street}{' '}
                                    {buildingNumber &&
                                    !hideBuildingNumber
                                        ? `շ․ ${buildingNumber}`
                                        : ''}
                                </div>
                            </div>

                            <div style={{ textAlign: 'right' }}>
                                <div className="preview-price-amount">
                                    {Number(price).toLocaleString()}{' '}
                                    {currency === 'AMD'
                                        ? '֏'
                                        : currency === 'USD'
                                            ? '$'
                                            : currency === 'EUR'
                                                ? '€'
                                                : currency === 'RUB'
                                                    ? '₽'
                                                    : ''}
                                </div>

                                <div
                                    style={{
                                        fontSize: '13px',
                                        color: '#94a3b8'
                                    }}
                                >
                                    {period ? `/ ${period}` : ''}
                                </div>
                            </div>
                        </div>

                        {/* Parameters Grid */}
                        <div className="preview-grid-params">

                            <div>
                                <h4
                                    style={{
                                        color: '#fff',
                                        borderBottom: '1px solid #26344b',
                                        paddingBottom: '8px',
                                        marginBottom: '8px'
                                    }}
                                >
                                    Տան պարամետրեր
                                </h4>

                                <div className="preview-param-row">
                                    <span className="preview-param-label">
                                        Կարգավիճակ:
                                    </span>

                                    <span className="preview-param-val">
                                        {status === 'owner'
                                            ? 'Սեփականատեր'
                                            : status === 'agency'
                                                ? 'Գործակալություն'
                                                : ''}
                                    </span>
                                </div>

                                <div className="preview-param-row">
                                    <span className="preview-param-label">
                                        Տարածաշրջան:
                                    </span>

                                    <span className="preview-param-val">
                                        {fullLocationDisplay}
                                    </span>
                                </div>

                                <div className="preview-param-row">
                                    <span className="preview-param-label">
                                        Սենյակներ:
                                    </span>

                                    <span className="preview-param-val">
                                        {roomsCount}
                                    </span>
                                </div>

                                <div className="preview-param-row">
                                    <span className="preview-param-label">
                                        Տան մակերես:
                                    </span>

                                    <span className="preview-param-val">
                                        {houseArea} քմ
                                    </span>
                                </div>

                                <div className="preview-param-row">
                                    <span className="preview-param-label">
                                        Հողատարածքի մակերես:
                                    </span>

                                    <span className="preview-param-val">
                                        {landArea} քմ
                                    </span>
                                </div>

                                <div className="preview-param-row">
                                    <span className="preview-param-label">
                                        Շինության տիպ:
                                    </span>

                                    <span className="preview-param-val">
                                        {buildingType}
                                    </span>
                                </div>

                                <div className="preview-param-row">
                                    <span className="preview-param-label">
                                        Հարկեր:
                                    </span>

                                    <span className="preview-param-val">
                                        {floorsCount}
                                    </span>
                                </div>

                                <div className="preview-param-row">
                                    <span className="preview-param-label">
                                        Սանհանգույցներ:
                                    </span>

                                    <span className="preview-param-val">
                                        {bathroomsCount}
                                    </span>
                                </div>

                                <div className="preview-param-row">
                                    <span className="preview-param-label">
                                        Վերանորոգում:
                                    </span>

                                    <span className="preview-param-val">
                                        {renovation}
                                    </span>
                                </div>

                                <div className="preview-param-row">
                                    <span className="preview-param-label">
                                        Ավտոտնակ:
                                    </span>

                                    <span className="preview-param-val">
                                        {garage}
                                    </span>
                                </div>
                            </div>

                            <div>
                                <h4
                                    style={{
                                        color: '#fff',
                                        borderBottom: '1px solid #26344b',
                                        paddingBottom: '8px',
                                        marginBottom: '8px'
                                    }}
                                >
                                    Բնակության կանոններ & Կոնտակտ
                                </h4>

                                <div className="preview-param-row">
                                    <span className="preview-param-label">
                                        Երեխաների հետ:
                                    </span>

                                    <span className="preview-param-val">
                                        {withChildren}
                                    </span>
                                </div>

                                <div className="preview-param-row">
                                    <span className="preview-param-label">
                                        Կենդանիներ:
                                    </span>

                                    <span className="preview-param-val">
                                        {petsAllowed}
                                    </span>
                                </div>

                                <div className="preview-param-row">
                                    <span className="preview-param-label">
                                        Հյուրերի քանակ:
                                    </span>

                                    <span className="preview-param-val">
                                        {maxGuests} մարդ
                                    </span>
                                </div>

                                <div className="preview-param-row">
                                    <span className="preview-param-label">
                                        Գիշերակաց:
                                    </span>

                                    <span className="preview-param-val">
                                        {overnightAllowed}
                                    </span>
                                </div>

                                <div className="preview-param-row">
                                    <span className="preview-param-label">
                                        Անվասայլակ:
                                    </span>

                                    <span className="preview-param-val">
                                        {wheelchairAccessible}
                                    </span>
                                </div>

                                <div className="preview-param-row">
                                    <span className="preview-param-label">
                                        Հեռախոս:
                                    </span>

                                    <span className="preview-param-val">
                                        {contactType === 'phone'
                                            ? phoneNumber
                                            : 'Չի կցված'}
                                    </span>
                                </div>

                                {comfort.length > 0 && (
                                    <div style={{ marginTop: '14px' }}>
                                        <span
                                            className="preview-param-label"
                                            style={{
                                                display: 'block',
                                                marginBottom: '6px'
                                            }}
                                        >
                                            Կոմֆորտ:
                                        </span>

                                        <div className="chips-flex-row">
                                            {comfort.map((c) => (
                                                <span
                                                    key={c}
                                                    style={{
                                                        background: '#222f44',
                                                        color: '#cbd5e1',
                                                        padding: '4px 10px',
                                                        borderRadius: '6px',
                                                        fontSize: '12px'
                                                    }}
                                                >
                                                    {c}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Badges preview */}
                        <div
                            style={{
                                borderTop: '1px solid #26344b',
                                paddingTop: '16px',
                                marginBottom: '24px'
                            }}
                        >
                            <div className="field-label">
                                Հարմարություններ և Տեխնիկա
                            </div>

                            <div className="chips-flex-row">

                                {amenitiesList
                                    .filter(
                                        (item) =>
                                            amenities[item.key]
                                    )
                                    .map((item) => (
                                        <span
                                            key={item.key}
                                            className="badge-feature"
                                        >
                                            <Check size={14} />{' '}
                                            {item.label}
                                        </span>
                                    ))}

                                {appliancesList
                                    .filter(
                                        (item) =>
                                            appliances[item.key]
                                    )
                                    .map((item) => (
                                        <span
                                            key={item.key}
                                            className="badge-appliance"
                                        >
                                            <Check size={14} />{' '}
                                            {item.label}
                                        </span>
                                    ))}

                                {wheelchairAccessible && (
                                    <span className="badge-feature">
                                        <Check size={14} /> Հարմար է անվասայլակով մարդկանց համար՝{' '}
                                        {wheelchairAccessible}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="form-actions-bar">

                            <button
                                type="button"
                                onClick={() => setCurrentStep(2)}
                                className="btn-cancel"
                            >
                                Խմբագրել
                            </button>

                            <button
                                type="button"
                                onClick={handleFinalSubmit}
                                className="btn-submit"
                            >
                                Ուղարկել
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 2: Main Form */}
                {currentStep === 2 && (
                    <div className="form-card">

                        {/* Title & Quick Demo Fill & Round Back Button */}
                        <div className="form-header-row">

                            <div className="header-left-group">

                                <button
                                    type="button"
                                    onClick={handleGoBackToFirstStep}
                                    className="btn-round-back"
                                    title="Վերադառնալ առաջին էջ"
                                >
                                    <ArrowLeft
                                        size={18}
                                        strokeWidth={2.4}
                                    />
                                </button>

                                <h1 className="form-main-title">
                                    Տեղադրել հայտարարություն › Տներ › Տուն
                                </h1>
                            </div>

                            <button
                                type="button"
                                onClick={handleQuickDemoFill}
                                className="btn-demo-fill"
                                title="Ավտոմատ լրացնել օրինակային տվյալներով"
                            >
                                <Sparkles size={14} />
                                Լրացնել օրինակով
                            </button>
                        </div>

                        {/* 1. Ձեր կարգավիճակը */}
                        <div className="form-section">

                            <label
                                className="field-label"
                                style={{
                                    fontSize: '16px',
                                    fontWeight: 'bold'
                                }}
                            >
                                Ձեր կարգավիճակը{' '}
                                <span className="required-star">
                                    *
                                </span>
                            </label>

                            <div className="radio-group-vertical">

                                <div
                                    onClick={() =>
                                        setStatus('owner')
                                    }
                                    className="custom-radio-row"
                                >
                                    <div
                                        className={`custom-radio-circle ${
    status === 'owner'
        ? 'checked'
        : ''
}`}
                                    >
                                        {status === 'owner' && (
                                            <div className="custom-radio-dot" />
                                        )}
                                    </div>

                                    <div>
                                        <div className="radio-text-title">
                                            Սեփականատեր
                                        </div>

                                        <div className="radio-text-desc">
                                            Եթե դուք վաճառում եք ձեր սեփական անշարժ գույքը՝ սեփականատեր
                                        </div>
                                    </div>
                                </div>

                                <div
                                    onClick={() =>
                                        setStatus('agency')
                                    }
                                    className="custom-radio-row"
                                >
                                    <div
                                        className={`custom-radio-circle ${
    status === 'agency'
        ? 'checked'
        : ''
}`}
                                    >
                                        {status === 'agency' && (
                                            <div className="custom-radio-dot" />
                                        )}
                                    </div>

                                    <div>
                                        <div className="radio-text-title">
                                            Գործակալություն
                                        </div>

                                        <div className="radio-text-desc">
                                            Եթե դուք միջնորդ եք, բրոքեր կամ անշարժ գույքի գործակալության ներկայացուցիչ
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {errors.status && (
                                <div className="error-text">
                                    <AlertCircle size={14} />
                                    {errors.status}
                                </div>
                            )}
                        </div>

                        {/* 2. Գտնվելու վայրը */}
                        <div className="form-section">

                            <h2 className="section-title">
                                <MapPin className="section-title-icon" />
                                Գտնվելու վայրը
                            </h2>

                            {/* Տարածաշրջան */}
                            <div>
                                <label className="field-label">
                                    Տարածաշրջան{' '}
                                    <span className="required-star">
                                        *
                                    </span>
                                </label>

                                <div className="chips-flex-row">

                                    {regionsList.map((item) => (
                                        <button
                                            key={item}
                                            type="button"
                                            onClick={() => {
                                                setRegion(item);
                                                setCityOrDistrict('');

                                                if (errors.region) {
                                                    setErrors((prev) => ({
                                                        ...prev,
                                                        region: null
                                                    }));
                                                }
                                            }}
                                            className={`chip-btn ${
    region === item
        ? 'selected'
        : ''
}`}
                                        >
                                            {item}
                                        </button>
                                    ))}
                                </div>

                                {/* Մարզի քաղաքներ / համայնքներ */}
                                {activeSubdivision && (
                                    <div className="subdistricts-box">

                                        <div className="subdistricts-title">
                                            {activeSubdivision.label}{' '}
                                            (ըստ ցանկության)՝

                                            {cityOrDistrict && (
                                                <span
                                                    style={{
                                                        color: '#38bdf8',
                                                        marginLeft: '6px',
                                                        fontWeight: 600
                                                    }}
                                                >
                                                    ({cityOrDistrict})
                                                </span>
                                            )}
                                        </div>

                                        <div className="chips-flex-row">

                                            {activeSubdivision.items.map(
                                                (dist) => (
                                                    <button
                                                        key={dist}
                                                        type="button"
                                                        onClick={() =>
                                                            setCityOrDistrict(
                                                                cityOrDistrict ===
                                                                    dist
                                                                    ? ''
                                                                    : dist
                                                            )
                                                        }
                                                        className={`chip-btn-sm ${
    cityOrDistrict ===
    dist
        ? 'selected'
        : ''
}`}
                                                    >
                                                        {dist}
                                                    </button>
                                                )
                                            )}
                                        </div>

                                        {/* Այլ քաղաք/գյուղ */}
                                        <div
                                            style={{
                                                marginTop: '12px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '8px',
                                                flexWrap: 'wrap'
                                            }}
                                        >
                                            <span
                                                style={{
                                                    fontSize: '12px',
                                                    color: '#94a3b8'
                                                }}
                                            >
                                                Այլ քաղաք կամ գյուղ՝
                                            </span>

                                            <input
                                                type="text"
                                                value={
                                                    activeSubdivision.items.includes(
                                                        cityOrDistrict
                                                    )
                                                        ? ''
                                                        : cityOrDistrict
                                                }
                                                onChange={(e) =>
                                                    setCityOrDistrict(
                                                        e.target.value
                                                    )
                                                }
                                                placeholder="Գրեք բնակավայրի անվանումը..."
                                                className="custom-input"
                                                style={{
                                                    maxWidth: '240px',
                                                    padding: '6px 12px',
                                                    fontSize: '12px',
                                                    height: '32px'
                                                }}
                                            />

                                            {cityOrDistrict && (
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setCityOrDistrict('')
                                                    }
                                                    style={{
                                                        background: '#1e293b',
                                                        border: '1px solid #334155',
                                                        borderRadius: '6px',
                                                        color: '#94a3b8',
                                                        cursor: 'pointer',
                                                        fontSize: '11px',
                                                        padding: '4px 8px'
                                                    }}
                                                    title="Մաքրել ընտրությունը"
                                                >
                                                    Մաքրել (
                                                    {cityOrDistrict})
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {errors.region && (
                                    <div className="error-text">
                                        <AlertCircle size={14} />{' '}
                                        {errors.region}
                                    </div>
                                )}
                            </div>

                            {/* Փողոց */}
                            <div className="input-max-width">

                                <label className="field-label">
                                    Փողոց{' '}
                                    <span className="required-star">
                                        *
                                    </span>
                                </label>

                                <input
                                    type="text"
                                    value={street}
                                    onChange={(e) => {
                                        setStreet(e.target.value);

                                        if (errors.street) {
                                            setErrors((prev) => ({
                                                ...prev,
                                                street: null
                                            }));
                                        }
                                    }}
                                    placeholder="Մուտքագրեք փողոցի անվանումը"
                                    className={`custom-input ${
    errors.street
        ? 'has-error'
        : ''
}`}
                                />

                                {errors.street && (
                                    <div className="error-text">
                                        <AlertCircle size={14} />{' '}
                                        {errors.street}
                                    </div>
                                )}
                            </div>

                            {/* Շենքի համար */}
                            <div className="input-max-width">

                                <label className="field-label">
                                    Շենքի համար
                                </label>

                                <input
                                    type="text"
                                    value={buildingNumber}
                                    onChange={(e) =>
                                        setBuildingNumber(
                                            e.target.value
                                        )
                                    }
                                    placeholder="Օրինակ՝ 14/2"
                                    className="custom-input"
                                />
                            </div>

                            {/* Checkbox */}
                            <div style={{ marginTop: '14px' }}>

                                <label className="custom-checkbox-row">

                                    <div
                                        className={`custom-checkbox-box ${
    hideBuildingNumber
        ? 'checked'
        : ''
}`}
                                    >
                                        {hideBuildingNumber && (
                                            <Check
                                                size={14}
                                                strokeWidth={3}
                                            />
                                        )}
                                    </div>

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
                                        style={{
                                            display: 'none'
                                        }}
                                    />

                                    <span className="checkbox-label-text">
                                        Շենքի համարը չցուցադրել հայտարարության մեջ
                                    </span>
                                </label>
                            </div>
                        </div>

                        {/* 3. Տան մասին */}
                        <div className="form-section">

                            <h2 className="section-title">
                                <Home className="section-title-icon" />
                                Տան մասին
                            </h2>

                            {/* Սենյակների քանակ */}
                            <div
                                style={{
                                    marginBottom: '18px'
                                }}
                            >
                                <label className="field-label">
                                    Սենյակների քանակ{' '}
                                    <span className="required-star">
                                        *
                                    </span>
                                </label>

                                <div className="chips-flex-row">

                                    {roomOptions.map((opt) => (
                                        <button
                                            key={opt}
                                            type="button"
                                            onClick={() => {
                                                setRoomsCount(opt);

                                                if (
                                                    errors.roomsCount
                                                ) {
                                                    setErrors(
                                                        (prev) => ({
                                                            ...prev,
                                                            roomsCount:
                                                                null
                                                        })
                                                    );
                                                }
                                            }}
                                            className={`chip-btn chip-btn-square ${
    roomsCount === opt
        ? 'selected'
        : ''
}`}
                                        >
                                            {opt}
                                        </button>
                                    ))}
                                </div>

                                {errors.roomsCount && (
                                    <div className="error-text">
                                        <AlertCircle size={14} />{' '}
                                        {errors.roomsCount}
                                    </div>
                                )}
                            </div>

                            {/* Տան մակերես */}
                            <div
                                className="input-max-width"
                                style={{
                                    marginBottom: '18px'
                                }}
                            >
                                <label className="field-label">
                                    Տան մակերես{' '}
                                    <span className="required-star">
                                        *
                                    </span>
                                </label>

                                <div className="input-with-addon">

                                    <input
                                        type="number"
                                        value={houseArea}
                                        onChange={(e) => {
                                            setHouseArea(
                                                e.target.value
                                            );

                                            if (
                                                errors.houseArea
                                            ) {
                                                setErrors(
                                                    (prev) => ({
                                                        ...prev,
                                                        houseArea:
                                                            null
                                                    })
                                                );
                                            }
                                        }}
                                        placeholder="Օրինակ՝ 180"
                                        className={`custom-input ${
    errors.houseArea
        ? 'has-error'
        : ''
}`}
                                        style={{
                                            paddingRight: '48px'
                                        }}
                                    />

                                    <span className="input-addon-text">
                                        քմ
                                    </span>
                                </div>

                                {errors.houseArea && (
                                    <div className="error-text">
                                        <AlertCircle size={14} />{' '}
                                        {errors.houseArea}
                                    </div>
                                )}
                            </div>

                            {/* Շինության տիպ */}
                            <div
                                style={{
                                    marginBottom: '18px'
                                }}
                            >
                                <label className="field-label">
                                    Շինության տիպ{' '}
                                    <span className="required-star">
                                        *
                                    </span>
                                </label>

                                <div className="chips-flex-row">

                                    {buildingTypes.map(
                                        (type) => (
                                            <button
                                                key={type}
                                                type="button"
                                                onClick={() => {
                                                    setBuildingType(
                                                        type
                                                    );

                                                    if (
                                                        errors.buildingType
                                                    ) {
                                                        setErrors(
                                                            (
                                                                prev
                                                            ) => ({
                                                                ...prev,
                                                                buildingType:
                                                                    null
                                                            })
                                                        );
                                                    }
                                                }}
                                                className={`chip-btn ${
    buildingType ===
    type
        ? 'selected'
        : ''
}`}
                                            >
                                                {type}
                                            </button>
                                        )
                                    )}
                                </div>

                                {errors.buildingType && (
                                    <div className="error-text">
                                        <AlertCircle size={14} />{' '}
                                        {errors.buildingType}
                                    </div>
                                )}
                            </div>

                            {/* Հարկերի քանակ */}
                            <div
                                style={{
                                    marginBottom: '18px'
                                }}
                            >
                                <label className="field-label">
                                    Հարկերի քանակ{' '}
                                    <span className="required-star">
                                        *
                                    </span>
                                </label>

                                <div className="chips-flex-row">

                                    {floorOptions.map(
                                        (opt) => (
                                            <button
                                                key={opt}
                                                type="button"
                                                onClick={() => {
                                                    setFloorsCount(
                                                        opt
                                                    );

                                                    if (
                                                        errors.floorsCount
                                                    ) {
                                                        setErrors(
                                                            (
                                                                prev
                                                            ) => ({
                                                                ...prev,
                                                                floorsCount:
                                                                    null
                                                            })
                                                        );
                                                    }
                                                }}
                                                className={`chip-btn chip-btn-square ${
    floorsCount ===
    opt
        ? 'selected'
        : ''
}`}
                                            >
                                                {opt}
                                            </button>
                                        )
                                    )}
                                </div>

                                {errors.floorsCount && (
                                    <div className="error-text">
                                        <AlertCircle size={14} />{' '}
                                        {errors.floorsCount}
                                    </div>
                                )}
                            </div>

                            {/* Սանհանգույցների քանակ */}
                            <div
                                style={{
                                    marginBottom: '18px'
                                }}
                            >
                                <label className="field-label">
                                    Սանհանգույցների քանակ{' '}
                                    <span className="required-star">
                                        *
                                    </span>
                                </label>

                                <div className="chips-flex-row">

                                    {bathroomOptions.map(
                                        (opt) => (
                                            <button
                                                key={opt}
                                                type="button"
                                                onClick={() => {
                                                    setBathroomsCount(
                                                        opt
                                                    );

                                                    if (
                                                        errors.bathroomsCount
                                                    ) {
                                                        setErrors(
                                                            (
                                                                prev
                                                            ) => ({
                                                                ...prev,
                                                                bathroomsCount:
                                                                    null
                                                            })
                                                        );
                                                    }
                                                }}
                                                className={`chip-btn chip-btn-square ${
    bathroomsCount ===
    opt
        ? 'selected'
        : ''
}`}
                                            >
                                                {opt}
                                            </button>
                                        )
                                    )}
                                </div>

                                {errors.bathroomsCount && (
                                    <div className="error-text">
                                        <AlertCircle size={14} />{' '}
                                        {errors.bathroomsCount}
                                    </div>
                                )}
                            </div>

                            {/* Վերանորոգում */}
                            <div
                                style={{
                                    marginBottom: '18px'
                                }}
                            >
                                <label className="field-label">
                                    Վերանորոգում{' '}
                                    <span className="required-star">
                                        *
                                    </span>
                                </label>

                                <div className="chips-flex-row">

                                    {renovationOptions.map(
                                        (opt) => (
                                            <button
                                                key={opt}
                                                type="button"
                                                onClick={() => {
                                                    setRenovation(
                                                        opt
                                                    );

                                                    if (
                                                        errors.renovation
                                                    ) {
                                                        setErrors(
                                                            (
                                                                prev
                                                            ) => ({
                                                                ...prev,
                                                                renovation:
                                                                    null
                                                            })
                                                        );
                                                    }
                                                }}
                                                className={`chip-btn ${
    renovation ===
    opt
        ? 'selected'
        : ''
}`}
                                            >
                                                {opt}
                                            </button>
                                        )
                                    )}
                                </div>

                                {errors.renovation && (
                                    <div className="error-text">
                                        <AlertCircle size={14} />{' '}
                                        {errors.renovation}
                                    </div>
                                )}
                            </div>

                            {/* Ավտոտնակ */}
                            <div>

                                <label className="field-label">
                                    Ավտոտնակ{' '}
                                    <span className="required-star">
                                        *
                                    </span>
                                </label>

                                <div className="chips-flex-row">

                                    {garageOptions.map(
                                        (opt) => (
                                            <button
                                                key={opt}
                                                type="button"
                                                onClick={() => {
                                                    setGarage(
                                                        opt
                                                    );

                                                    if (
                                                        errors.garage
                                                    ) {
                                                        setErrors(
                                                            (
                                                                prev
                                                            ) => ({
                                                                ...prev,
                                                                garage:
                                                                    null
                                                            })
                                                        );
                                                    }
                                                }}
                                                className={`chip-btn ${
    garage === opt
        ? 'selected'
        : ''
}`}
                                            >
                                                {opt}
                                            </button>
                                        )
                                    )}
                                </div>

                                {errors.garage && (
                                    <div className="error-text">
                                        <AlertCircle size={14} />{' '}
                                        {errors.garage}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* 4. Հարմարություններ */}
                        <div className="form-section">

                            <label className="section-title">
                                <Sliders className="section-title-icon" />
                                Հարմարություններ
                            </label>

                            <div className="checkbox-grid">

                                {amenitiesList.map((item) => (
                                    <label
                                        key={item.key}
                                        className="custom-checkbox-row"
                                    >
                                        <div
                                            className={`custom-checkbox-box ${
    amenities[item.key]
        ? 'checked'
        : ''
}`}
                                        >
                                            {amenities[item.key] && (
                                                <Check
                                                    size={14}
                                                    strokeWidth={3}
                                                />
                                            )}
                                        </div>

                                        <input
                                            type="checkbox"
                                            checked={
                                                amenities[
                                                    item.key
                                                ]
                                            }
                                            onChange={(e) =>
                                                setAmenities({
                                                    ...amenities,
                                                    [item.key]:
                                                        e.target
                                                            .checked
                                                })
                                            }
                                            style={{
                                                display: 'none'
                                            }}
                                        />

                                        <span className="checkbox-label-text">
                                            {item.label}
                                        </span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* 5. Կենցաղային տեխնիկա */}
                        <div className="form-section">

                            <label className="section-title">
                                Կենցաղային տեխնիկա
                            </label>

                            <div className="checkbox-grid">

                                {appliancesList.map((item) => (
                                    <label
                                        key={item.key}
                                        className="custom-checkbox-row"
                                    >
                                        <div
                                            className={`custom-checkbox-box ${
    appliances[
        item.key
        ]
        ? 'checked'
        : ''
}`}
                                        >
                                            {appliances[
                                                item.key
                                            ] && (
                                                <Check
                                                    size={14}
                                                    strokeWidth={3}
                                                />
                                            )}
                                        </div>

                                        <input
                                            type="checkbox"
                                            checked={
                                                appliances[
                                                    item.key
                                                ]
                                            }
                                            onChange={(e) =>
                                                setAppliances({
                                                    ...appliances,
                                                    [item.key]:
                                                        e.target
                                                            .checked
                                                })
                                            }
                                            style={{
                                                display: 'none'
                                            }}
                                        />

                                        <span className="checkbox-label-text">
                                            {item.label}
                                        </span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* 6. Հարմար է անվասայլակով մարդկանց համար */}
                        <div className="form-section">

                            <label className="field-label">
                                Հարմար է անվասայլակով մարդկանց համար{' '}
                                <span className="required-star">
                                    *
                                </span>
                            </label>

                            <div className="chips-flex-row">

                                <button
                                    type="button"
                                    onClick={() => {
                                        setWheelchairAccessible(
                                            'Այո'
                                        );

                                        if (
                                            errors.wheelchairAccessible
                                        ) {
                                            setErrors(
                                                (prev) => ({
                                                    ...prev,
                                                    wheelchairAccessible:
                                                        null
                                                })
                                            );
                                        }
                                    }}
                                    className={`chip-btn ${
    wheelchairAccessible ===
    'Այո'
        ? 'selected'
        : ''
}`}
                                >
                                    Այո
                                </button>

                                <button
                                    type="button"
                                    onClick={() => {
                                        setWheelchairAccessible(
                                            'Ոչ'
                                        );

                                        if (
                                            errors.wheelchairAccessible
                                        ) {
                                            setErrors(
                                                (prev) => ({
                                                    ...prev,
                                                    wheelchairAccessible:
                                                        null
                                                })
                                            );
                                        }
                                    }}
                                    className={`chip-btn ${
    wheelchairAccessible ===
    'Ոչ'
        ? 'selected'
        : ''
}`}
                                >
                                    Ոչ
                                </button>
                            </div>

                            {errors.wheelchairAccessible && (
                                <div className="error-text">
                                    <AlertCircle size={14} />{' '}
                                    {errors.wheelchairAccessible}
                                </div>
                            )}
                        </div>

                        {/* 7. Կոմֆորտ */}
                        <div className="form-section">

                            <label className="section-title">
                                Կոմֆորտ
                            </label>

                            <div className="chips-flex-row">

                                {comfortItems.map((item) => (
                                    <button
                                        key={item}
                                        type="button"
                                        onClick={() =>
                                            handleToggleComfort(
                                                item
                                            )
                                        }
                                        className={`chip-btn ${
    comfort.includes(item)
        ? 'selected'
        : ''
}`}
                                    >
                                        {item}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* 8. Տեղեկություններ հողատարածքի մասին */}
                        <div className="form-section">

                            <h2 className="section-title">
                                Տեղեկություններ հողատարածքի մասին
                            </h2>

                            <div className="input-max-width">

                                <label className="field-label">
                                    Ընդհանուր հողատարածքի մակերես{' '}
                                    <span className="required-star">
                                        *
                                    </span>
                                </label>

                                <div className="input-with-addon">

                                    <input
                                        type="number"
                                        value={landArea}
                                        onChange={(e) => {
                                            setLandArea(
                                                e.target.value
                                            );

                                            if (
                                                errors.landArea
                                            ) {
                                                setErrors(
                                                    (prev) => ({
                                                        ...prev,
                                                        landArea:
                                                            null
                                                    })
                                                );
                                            }
                                        }}
                                        placeholder="Օրինակ՝ 500"
                                        className={`custom-input ${
    errors.landArea
        ? 'has-error'
        : ''
}`}
                                        style={{
                                            paddingRight: '48px'
                                        }}
                                    />

                                    <span className="input-addon-text">
                                        քմ
                                    </span>
                                </div>

                                {errors.landArea && (
                                    <div className="error-text">
                                        <AlertCircle size={14} />{' '}
                                        {errors.landArea}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* 9. Բնակության կանոններ */}
                        <div className="form-section">

                            <h2 className="section-title">
                                Բնակության կանոններ
                            </h2>

                            {/* Երեխաների հետ */}
                            <div
                                style={{
                                    marginBottom: '18px'
                                }}
                            >
                                <label className="field-label">
                                    Երեխաների հետ{' '}
                                    <span className="required-star">
                                        *
                                    </span>
                                </label>

                                <div className="chips-flex-row">

                                    {[
                                        'Այո',
                                        'Ոչ',
                                        'Համաձայնությամբ'
                                    ].map((opt) => (
                                        <button
                                            key={opt}
                                            type="button"
                                            onClick={() => {
                                                setWithChildren(
                                                    opt
                                                );

                                                if (
                                                    errors.withChildren
                                                ) {
                                                    setErrors(
                                                        (prev) => ({
                                                            ...prev,
                                                            withChildren:
                                                                null
                                                        })
                                                    );
                                                }
                                            }}
                                            className={`chip-btn ${
    withChildren === opt
        ? 'selected'
        : ''
}`}
                                        >
                                            {opt}
                                        </button>
                                    ))}
                                </div>

                                {errors.withChildren && (
                                    <div className="error-text">
                                        <AlertCircle size={14} />{' '}
                                        {errors.withChildren}
                                    </div>
                                )}
                            </div>

                            {/* Կենդանիներ */}
                            <div
                                style={{
                                    marginBottom: '18px'
                                }}
                            >
                                <label className="field-label">
                                    Թույլատրվում են կենդանիներ{' '}
                                    <span className="required-star">
                                        *
                                    </span>
                                </label>

                                <div className="chips-flex-row">

                                    {[
                                        'Այո',
                                        'Ոչ',
                                        'Համաձայնությամբ'
                                    ].map((opt) => (
                                        <button
                                            key={opt}
                                            type="button"
                                            onClick={() => {
                                                setPetsAllowed(
                                                    opt
                                                );

                                                if (
                                                    errors.petsAllowed
                                                ) {
                                                    setErrors(
                                                        (prev) => ({
                                                            ...prev,
                                                            petsAllowed:
                                                                null
                                                        })
                                                    );
                                                }
                                            }}
                                            className={`chip-btn ${
    petsAllowed === opt
        ? 'selected'
        : ''
}`}
                                        >
                                            {opt}
                                        </button>
                                    ))}
                                </div>

                                {errors.petsAllowed && (
                                    <div className="error-text">
                                        <AlertCircle size={14} />{' '}
                                        {errors.petsAllowed}
                                    </div>
                                )}
                            </div>

                            {/* Հյուրերի առավելագույն քանակ */}
                            <div
                                className="input-max-width"
                                style={{
                                    marginBottom: '18px'
                                }}
                            >
                                <label className="field-label">
                                    Հյուրերի առավելագույն քանակ{' '}
                                    <span className="required-star">
                                        *
                                    </span>
                                </label>

                                <input
                                    type="number"
                                    value={maxGuests}
                                    onChange={(e) => {
                                        setMaxGuests(
                                            e.target.value
                                        );

                                        if (
                                            errors.maxGuests
                                        ) {
                                            setErrors(
                                                (prev) => ({
                                                    ...prev,
                                                    maxGuests:
                                                        null
                                                })
                                            );
                                        }
                                    }}
                                    placeholder="Օրինակ՝ 6"
                                    className={`custom-input ${
    errors.maxGuests
        ? 'has-error'
        : ''
}`}
                                />

                                {errors.maxGuests && (
                                    <div className="error-text">
                                        <AlertCircle size={14} />{' '}
                                        {errors.maxGuests}
                                    </div>
                                )}
                            </div>

                            {/* Գիշերակացի հնարավորություն */}
                            <div>

                                <label className="field-label">
                                    Գիշերակացի հնարավորություն{' '}
                                    <span className="required-star">
                                        *
                                    </span>
                                </label>

                                <div className="chips-flex-row">

                                    {['Այո', 'Ոչ'].map(
                                        (opt) => (
                                            <button
                                                key={opt}
                                                type="button"
                                                onClick={() => {
                                                    setOvernightAllowed(
                                                        opt
                                                    );

                                                    if (
                                                        errors.overnightAllowed
                                                    ) {
                                                        setErrors(
                                                            (
                                                                prev
                                                            ) => ({
                                                                ...prev,
                                                                overnightAllowed:
                                                                    null
                                                            })
                                                        );
                                                    }
                                                }}
                                                className={`chip-btn ${
    overnightAllowed ===
    opt
        ? 'selected'
        : ''
}`}
                                                style={{
                                                    minWidth:
                                                        '70px',
                                                    textAlign:
                                                        'center'
                                                }}
                                            >
                                                {opt}
                                            </button>
                                        )
                                    )}
                                </div>

                                {errors.overnightAllowed && (
                                    <div className="error-text">
                                        <AlertCircle size={14} />{' '}
                                        {errors.overnightAllowed}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* 10. Գործարքի պայմաններ */}
                        <div className="form-section">

                            <h2 className="section-title">
                                <DollarSign className="section-title-icon" />
                                Գործարքի պայմաններ
                            </h2>

                            <label className="field-label">
                                Վարձավճար{' '}
                                <span className="required-star">
                                    *
                                </span>
                            </label>

                            <div
                                className="input-max-width"
                                style={{
                                    marginTop: '4px'
                                }}
                            >
                                <input
                                    type="number"
                                    value={price}
                                    onChange={(e) => {
                                        setPrice(
                                            e.target.value
                                        );

                                        if (errors.price) {
                                            setErrors(
                                                (prev) => ({
                                                    ...prev,
                                                    price: null
                                                })
                                            );
                                        }
                                    }}
                                    placeholder="Գումար"
                                    className={`custom-input ${
    errors.price
        ? 'has-error'
        : ''
}`}
                                />
                            </div>

                            {/* Արժույթ */}
                            <div
                                style={{
                                    marginTop: '14px'
                                }}
                            >
                                <div
                                    style={{
                                        fontSize: '12px',
                                        color: '#94a3b8',
                                        marginBottom: '6px'
                                    }}
                                >
                                    Արժույթ՝
                                </div>

                                <div className="chips-flex-row">

                                    {currencyOptions.map(
                                        (curr) => (
                                            <button
                                                key={curr.code}
                                                type="button"
                                                onClick={() =>
                                                    setCurrency(
                                                        curr.code
                                                    )
                                                }
                                                className={`chip-btn-sm ${
    currency ===
    curr.code
        ? 'selected'
        : ''
}`}
                                            >
                                                {curr.label}
                                            </button>
                                        )
                                    )}
                                </div>
                            </div>

                            {/* Պարբերականություն */}
                            <div
                                style={{
                                    marginTop: '14px'
                                }}
                            >
                                <div
                                    style={{
                                        fontSize: '12px',
                                        color: '#94a3b8',
                                        marginBottom: '6px'
                                    }}
                                >
                                    Պարբերականություն՝
                                </div>

                                <div className="chips-flex-row">

                                    {periodOptions.map(
                                        (p) => (
                                            <button
                                                key={p}
                                                type="button"
                                                onClick={() =>
                                                    setPeriod(p)
                                                }
                                                className={`chip-btn-sm ${
    period === p
        ? 'selected'
        : ''
}`}
                                            >
                                                {p}
                                            </button>
                                        )
                                    )}
                                </div>
                            </div>

                            {errors.price && (
                                <div
                                    className="error-text"
                                    style={{
                                        marginTop: '8px'
                                    }}
                                >
                                    <AlertCircle size={14} />{' '}
                                    {errors.price}
                                </div>
                            )}
                        </div>

                        {/* 11. Լուսանկարներ */}
                        <div className="form-section">

                            <label
                                className="field-label"
                                style={{
                                    fontSize: '16px',
                                    fontWeight: 'bold'
                                }}
                            >
                                Լուսանկարներ{' '}
                                <span className="required-star">
                                    *
                                </span>
                            </label>

                            <p
                                style={{
                                    fontSize: '13px',
                                    color: '#94a3b8',
                                    lineHeight: 1.5,
                                    margin: '6px 0 16px 0'
                                }}
                            >
                                Խնդրում ենք վերբեռնել լուսանկարները հետևյալ հերթականությամբ՝ սենյակներ, խոհանոց, սանհանգույց, պատշգամբ և ապա նոր ոչ բնակելի տարածքների լուսանկարներ (շենքի ճակատ, նկուղ, պատուհաններից բացվող տեսարան, շենքի մուտք, ավտոկայանատեղի և այլն)։
                            </p>

                            <div
                                onClick={() =>
                                    fileInputRef.current?.click()
                                }
                                onDragOver={(e) =>
                                    e.preventDefault()
                                }
                                onDrop={(e) => {
                                    e.preventDefault();

                                    const files =
                                        Array.from(
                                            e.dataTransfer
                                                .files || []
                                        );

                                    if (files.length > 0) {
                                        addPhotoFiles(files);
                                    }
                                }}
                                className={`upload-dropzone ${
    errors.photos
        ? 'has-error'
        : ''
}`}
                            >
                                <input
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    ref={fileInputRef}
                                    onChange={
                                        handleFileUpload
                                    }
                                    style={{
                                        display: 'none'
                                    }}
                                />

                                <div className="upload-icon-wrapper">
                                    <ImageIcon size={24} />
                                </div>

                                <div className="upload-text-main">
                                    Քաշեք ու թողեք ֆայլը կամ{' '}
                                    <span className="upload-text-highlight">
                                        վերբեռնեք սարքից
                                    </span>
                                </div>

                                <div className="upload-text-sub">
                                    PNG, JPG, WEBP մինչև 15MB
                                </div>
                            </div>

                            {/* Photos List */}
                            {photos.length > 0 && (
                                <div className="photos-preview-grid">

                                    {photos.map(
                                        (p, idx) => (
                                            <div
                                                key={p.id}
                                                className="photo-thumbnail-card"
                                            >
                                                <img
                                                    src={p.url}
                                                    alt={p.name}
                                                    className="photo-img"
                                                />

                                                <button
                                                    type="button"
                                                    onClick={(
                                                        e
                                                    ) => {
                                                        e.stopPropagation();
                                                        handleRemovePhoto(
                                                            p.id
                                                        );
                                                    }}
                                                    className="btn-remove-photo"
                                                >
                                                    <X size={14} />
                                                </button>

                                                {idx === 0 && (
                                                    <span className="badge-main-photo">
                                                        Գլխավոր
                                                    </span>
                                                )}
                                            </div>
                                        )
                                    )}
                                </div>
                            )}

                            {errors.photos && (
                                <div className="error-text">
                                    <AlertCircle size={14} />{' '}
                                    {errors.photos}
                                </div>
                            )}

                            <AiPhotoCleaner
                                onTransferToMainPhotos={(newPhotos) =>
                                    setPhotos((prev) => [
                                        ...prev,
                                        ...newPhotos.map((url, index) => ({
                                            id: `ai-${Date.now()}-${index}`,
                                            name: "AI մշակված լուսանկար",
                                            url,
                                            size: "AI",
                                        })),
                                    ])
                                }
                            />
                        </div>

                        {/* 12. Կոնտակտային տվյալներ */}
                        <div className="form-section">

                            <h2 className="section-title">
                                Կոնտակտային տվյալներ
                            </h2>

                            <div className="radio-group-vertical">

                                <div
                                    onClick={() =>
                                        setContactType(
                                            'phone'
                                        )
                                    }
                                    className="custom-radio-row"
                                >
                                    <div
                                        className={`custom-radio-circle ${
    contactType ===
    'phone'
        ? 'checked'
        : ''
}`}
                                    >
                                        {contactType ===
                                            'phone' && (
                                            <div className="custom-radio-dot" />
                                        )}
                                    </div>

                                    <div
                                        style={{
                                            display: 'flex',
                                            alignItems:
                                                'center',
                                            gap: '8px',
                                            fontSize: '14px',
                                            color: '#f1f5f9'
                                        }}
                                    >
                                        <Phone
                                            size={16}
                                            color="#94a3b8"
                                        />

                                        <span>
                                            {phoneNumber ||
                                                'Հեռախոսահամար չի նշվել'}
                                        </span>
                                    </div>
                                </div>

                                <div
                                    onClick={() =>
                                        setContactType(
                                            'none'
                                        )
                                    }
                                    className="custom-radio-row"
                                >
                                    <div
                                        className={`custom-radio-circle ${
    contactType ===
    'none'
        ? 'checked'
        : ''
}`}
                                    >
                                        {contactType ===
                                            'none' && (
                                            <div className="custom-radio-dot" />
                                        )}
                                    </div>

                                    <div
                                        style={{
                                            display: 'flex',
                                            alignItems:
                                                'center',
                                            gap: '8px',
                                            fontSize: '14px',
                                            color: '#94a3b8'
                                        }}
                                    >
                                        <Phone
                                            size={16}
                                            style={{
                                                opacity: 0.5,
                                                textDecoration:
                                                    'line-through'
                                            }}
                                        />

                                        <span>
                                            Չկցել հեռախոսահամար
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Bottom Actions */}
                        <div className="form-actions-bar">

                            <button
                                type="button"
                                onClick={handleResetForm}
                                className="btn-cancel"
                            >
                                Չեղարկել
                            </button>

                            <div
                                style={{
                                    display: 'flex',
                                    gap: '12px'
                                }}
                            >
                                <button
                                    type="button"
                                    onClick={handleSaveDraft}
                                    className="btn-draft"
                                >
                                    Պահպանել որպես սևագիր
                                </button>

                                <button
                                    type="button"
                                    onClick={handlePreview}
                                    className="btn-submit"
                                >
                                    Ուղարկել
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
        </I18nTree>
    );
}

export default CommercialHouseForm;
