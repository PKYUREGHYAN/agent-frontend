import React, { useState, useRef } from 'react';
import { filesToPhotoCards, loadFormDraft, useFormDraftState, useSaveFormDraft } from "../services/uiSession.js";
import {
    Check,
    X,
    Image as ImageIcon,
    AlertCircle,
    BookmarkCheck,
    ArrowLeft,
    Sparkles,
    MapPin,
    Building2,
    Home,
    DollarSign,
    Phone,
    Eye
} from 'lucide-react';
import './ApartmentSaleForm.css';
import { I18nTree } from '../i18n/I18n.jsx';
import AiPhotoCleaner from "../ai-cleaner/AiPhotoCleaner.jsx";

export function ApartmentSaleForm({ onBack, onSave }) {
    const draft = loadFormDraft("apartment-sale");

    // Stepper state (1: Բաժին, 2: Հայտարարություն, 3: Ուղարկել)
    const [currentStep, setCurrentStep] = useState(draft.currentStep || 2);
    const [showDraftToast, setShowDraftToast] = useState(false);
    const [errors, setErrors] = useState({});

    // 1. Ձեր կարգավիճակը
    // Սկզբում ոչ մեկը ընտրված չէ
    const [status, setStatus] = useState(draft.status || '');

    // 2. Գտնվելու վայրը
    const [region, setRegion] = useState(draft.region || '');
    const [cityOrDistrict, setCityOrDistrict] = useState(draft.cityOrDistrict || '');
    const [street, setStreet] = useState(draft.street || '');
    const [buildingNumber, setBuildingNumber] = useState(draft.buildingNumber || '');
    const [hideBuildingNumber, setHideBuildingNumber] = useState(Boolean(draft.hideBuildingNumber));

    // 3. Շենքի մասին
    const [buildingType, setBuildingType] = useState(draft.buildingType || '');
    const [newConstruction, setNewConstruction] = useState(draft.newConstruction || '');
    const [elevator, setElevator] = useState(draft.elevator || '');
    const [buildingFloors, setBuildingFloors] = useState(draft.buildingFloors || '');
    const [buildingFeatures, setBuildingFeatures] = useState(draft.buildingFeatures || {
        intercom: false,
        concierge: false,
        playground: false,
    });
    const [parking, setParking] = useState(draft.parking || {
        open: false,
        covered: false,
        garage: false,
    });

    // 4. Բնակարանի մասին
    const [floorArea, setFloorArea] = useState(draft.floorArea || '');
    const [roomsCount, setRoomsCount] = useState(draft.roomsCount || '');
    const [bathroomsCount, setBathroomsCount] = useState(draft.bathroomsCount || '');
    const [ceilingHeight, setCeilingHeight] = useState(draft.ceilingHeight || '');
    const [floor, setFloor] = useState(draft.floor || '');
    const [balcony, setBalcony] = useState(draft.balcony || '');
    const [furniture, setFurniture] = useState(draft.furniture || '');
    const [renovation, setRenovation] = useState(draft.renovation || '');

    const [appliances, setAppliances] = useState(draft.appliances || {
        airConditioner: false,
        fridge: false,
        stove: false,
        dishwasher: false,
        washingMachine: false,
        dryer: false,
    });

    const [windowViews, setWindowViews] = useState(draft.windowViews || {
        yard: false,
        street: false,
        city: false,
        park: false,
        ararat: false,
    });

    // Հարմար է անվասայլակով մարդկանց համար
    // Սկզբում ոչ մեկը ընտրված չէ
    const [wheelchairAccessible, setWheelchairAccessible] = useState(draft.wheelchairAccessible || '');

    // 5. Գին
    const [price, setPrice] = useState(draft.price || '');

    // Սկզբում արժույթ ընտրված չէ
    const [currency, setCurrency] = useState(draft.currency || '');

    // 6. Լուսանկարներ
    const [photos, setPhotos] = useFormDraftState("apartment-sale", "photos", draft.photos || []);
    const fileInputRef = useRef(null);

    // 7. Կոնտակտային տվյալներ
    // Սկզբում ոչ մեկը ընտրված չէ
    const [contactType, setContactType] = useState(draft.contactType || '');
    const [phoneNumber, setPhoneNumber] = useState(draft.phoneNumber || '');

    useSaveFormDraft("apartment-sale", {
        currentStep,
        status,
        region,
        cityOrDistrict,
        street,
        buildingNumber,
        hideBuildingNumber,
        buildingType,
        newConstruction,
        elevator,
        buildingFloors,
        buildingFeatures,
        parking,
        floorArea,
        roomsCount,
        bathroomsCount,
        ceilingHeight,
        floor,
        balcony,
        furniture,
        renovation,
        appliances,
        windowViews,
        wheelchairAccessible,
        price,
        currency,
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

    const buildingTypes = [
        'Քարե',
        'Պանելային',
        'Մոնոլիտ',
        'Աղյուսե',
        'Կասետային',
        'Փայտե'
    ];

    const newConstructionOptions = ['Ոչ', 'Այո'];

    const elevatorOptions = [
        'Առկա է',
        'Առկա չէ'
    ];

    const buildingFloorOptions = [
        '1', '2', '3', '4', '5', '6', '7', '8', '9',
        '10', '11', '12', '14', '16', '18', '20', '24+'
    ];

    const buildingFeaturesList = [
        { key: 'intercom', label: 'Դոմոֆոն' },
        { key: 'concierge', label: 'Դռնապահ' },
        { key: 'playground', label: 'Խաղահրապարակ' },
    ];

    const parkingList = [
        { key: 'open', label: 'Բացօթյա' },
        { key: 'covered', label: 'Ծածկապատ' },
        { key: 'garage', label: 'Ավտոտնակ' },
    ];

    const roomOptions = [
        '1', '2', '3', '4', '5', '6', '7', '8+'
    ];

    const bathroomOptions = [
        '1', '2', '3+'
    ];

    const ceilingHeightOptions = [
        '2.5 մ',
        '2.6 մ',
        '2.7 մ',
        '2.75 մ',
        '2.8 մ',
        '3 մ',
        '3.2 մ',
        '3.5 մ',
        '4+ մ'
    ];

    const floorOptions = [
        '1', '2', '3', '4', '5', '6', '7', '8',
        '9', '10', '11', '12', '14', '16+'
    ];

    const balconyOptions = [
        'Առկա չէ',
        'Բաց',
        'Փակ'
    ];

    const furnitureOptions = [
        'Կահույքով',
        'Առկա չէ',
        'Մասնակի',
        'Համաձայնությամբ'
    ];

    const renovationOptions = [
        'Չվերանորոգված',
        'Հին',
        'Մասնակի',
        'Կոսմետիկ',
        'Եվրո',
        'Դիզայներական',
        'Կապիտալ'
    ];

    const appliancesList = [
        { key: 'airConditioner', label: 'Օդորակիչ' },
        { key: 'fridge', label: 'Սառնարան' },
        { key: 'stove', label: 'Սալօջախ' },
        { key: 'dishwasher', label: 'Սպասք լվացող մեքենա' },
        { key: 'washingMachine', label: 'Լվացքի մեքենա' },
        { key: 'dryer', label: 'Չորացնող մեքենա' },
    ];

    const windowViewsList = [
        { key: 'yard', label: 'Դեպի բակ' },
        { key: 'street', label: 'Դեպի փողոց' },
        { key: 'city', label: 'Դեպի քաղաք' },
        { key: 'park', label: 'Դեպի այգի' },
        { key: 'ararat', label: 'Դեպի Արարատ' },
    ];

    const currencyOptions = [
        { code: 'AMD', label: '֏ (AMD)' },
        { code: 'USD', label: '$ (USD)' },
        { code: 'EUR', label: '€ (EUR)' },
        { code: 'RUB', label: '₽ (RUB)' },
    ];

    // Հետ գնալ առաջին էջ
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

            setBuildingType('');
            setNewConstruction('');
            setElevator('');
            setBuildingFloors('');

            setBuildingFeatures({
                intercom: false,
                concierge: false,
                playground: false,
            });

            setParking({
                open: false,
                covered: false,
                garage: false,
            });

            setFloorArea('');
            setRoomsCount('');
            setBathroomsCount('');
            setCeilingHeight('');
            setFloor('');
            setBalcony('');
            setFurniture('');
            setRenovation('');

            setAppliances({
                airConditioner: false,
                fridge: false,
                stove: false,
                dishwasher: false,
                washingMachine: false,
                dryer: false,
            });

            setWindowViews({
                yard: false,
                street: false,
                city: false,
                park: false,
                ararat: false,
            });

            setWheelchairAccessible('');

            setPrice('');
            setCurrency('');

            setPhotos([]);

            setContactType('');
            setPhoneNumber('');

            setErrors({});

            handleGoBackToFirstStep();
        }
    };

    // Ավտոմատ լրացում օրինակով
    const handleQuickDemoFill = () => {
        setStatus('owner');

        setRegion('Երևան');
        setCityOrDistrict('Արաբկիր');
        setStreet('Կոմիտաս պող․');
        setBuildingNumber('49/2');
        setHideBuildingNumber(false);

        setBuildingType('Մոնոլիտ');
        setNewConstruction('Այո');
        setElevator('Առկա է');
        setBuildingFloors('16');

        setBuildingFeatures({
            intercom: true,
            concierge: true,
            playground: true,
        });

        setParking({
            open: true,
            covered: false,
            garage: true,
        });

        setFloorArea('92');
        setRoomsCount('3');
        setBathroomsCount('2');
        setCeilingHeight('3 մ');
        setFloor('7');
        setBalcony('Բաց');
        setFurniture('Կահույքով');
        setRenovation('Դիզայներական');

        setAppliances({
            airConditioner: true,
            fridge: true,
            stove: true,
            dishwasher: true,
            washingMachine: true,
            dryer: false,
        });

        setWindowViews({
            yard: true,
            street: false,
            city: true,
            park: false,
            ararat: true,
        });

        setWheelchairAccessible('1');

        setPrice('145000');
        setCurrency('USD');

        setPhotos([
            {
                id: '1',
                name: 'apartment_living.jpg',
                url: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80',
                size: '1.2',
            },
            {
                id: '2',
                name: 'kitchen.jpg',
                url: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=800&q=80',
                size: '1.1',
            },
            {
                id: '3',
                name: 'bedroom.jpg',
                url: 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=800&q=80',
                size: '1.4',
            },
            {
                id: '4',
                name: 'bathroom.jpg',
                url: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80',
                size: '1.0',
            }
        ]);

        setContactType('phone');
        setPhoneNumber('(077) 12-35-23');

        setErrors({});
    };

    // Ստուգումներ (Validation)
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

        if (!buildingType) {
            newErrors.buildingType = 'Ընտրեք շինության տիպը';
        }

        if (!newConstruction) {
            newErrors.newConstruction = 'Նշեք արդյոք նորակառույց է';
        }

        if (!elevator) {
            newErrors.elevator = 'Նշեք վերելակի առկայությունը';
        }

        if (!buildingFloors) {
            newErrors.buildingFloors = 'Նշեք շենքի հարկերի քանակը';
        }

        if (!floorArea) {
            newErrors.floorArea = 'Նշեք ընդհանուր մակերեսը';
        }

        if (!roomsCount) {
            newErrors.roomsCount = 'Ընտրեք սենյակների քանակը';
        }

        if (!bathroomsCount) {
            newErrors.bathroomsCount = 'Նշեք սանհանգույցների քանակը';
        }

        if (!ceilingHeight) {
            newErrors.ceilingHeight = 'Նշեք առաստաղի բարձրությունը';
        }

        if (!floor) {
            newErrors.floor = 'Ընտրեք հարկը';
        }

        if (!balcony) {
            newErrors.balcony = 'Ընտրեք պատշգամբի տարբերակը';
        }

        if (!furniture) {
            newErrors.furniture = 'Նշեք կահույքի առկայությունը';
        }

        if (!renovation) {
            newErrors.renovation = 'Ընտրեք վերանորոգման վիճակը';
        }

        if (!price) {
            newErrors.price = 'Նշեք վաճառքի գինը';
        }

        if (photos.length === 0) {
            newErrors.photos = 'Վերբեռնեք առնվազն 1 լուսանկար';
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
            dealType: 'Վաճառք',
            category: 'Բնակարաններ',

            status,

            region,
            cityOrDistrict,
            yerevanDistrict: cityOrDistrict,
            street,
            buildingNumber,
            hideBuildingNumber,

            buildingType,
            newConstruction,
            elevator,
            buildingFloors,

            buildingFeatures,
            parking,

            floorArea,
            roomsCount,
            bathroomsCount,
            ceilingHeight,
            floor,
            balcony,
            furniture,
            renovation,

            appliances,
            windowViews,

            wheelchairAccessible,

            price,
            currency,

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
        <div className="apartment-sale-page">

            {/* Toast Notification */}
            {showDraftToast && (
                <div className="draft-toast">
                    <BookmarkCheck className="draft-toast-icon"/>
                    <span>Սևագիրը հաջողությամբ պահպանվեց</span>
                </div>
            )}

            <div className="apartment-sale-container">

                {/* Stepper Header_agency (1..5) */}
                <div className="stepper-header">

                    <div
                        className="step-item completed clickable"
                        onClick={handleGoBackToFirstStep}
                        title="Վերադառնալ Բաժինների ընտրությանը"
                    >
                        <div className="step-badge completed-badge">
                            <Check size={14} strokeWidth={3}/>
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

                    <div className="step-item inactive">
                        <div className="step-badge inactive-badge">
                            4
                        </div>

                        <span>Վավերացում</span>
                    </div>

                    <div className="step-item inactive">
                        <div className="step-badge inactive-badge">
                            5
                        </div>

                        <span>Տեղադրել</span>
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
                        <Building2
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
                            Դուք ընտրել եք «Վաճառք › Բնակարաններ» բաժինը:
                        </p>

                        <button
                            type="button"
                            onClick={() => setCurrentStep(2)}
                            className="btn-submit"
                            style={{margin: '0 auto'}}
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
                                    <ArrowLeft size={16}/>
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
                                    Տեղադրել հայտարարություն › Վաճառք › Բնակարաններ
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

                            <div style={{textAlign: 'right'}}>

                                <div className="preview-price-amount">
                                    {Number(price).toLocaleString()}{' '}
                                    {currency === 'AMD'
                                        ? '֏'
                                        : currency === 'USD'
                                            ? '$'
                                            : currency === 'EUR'
                                                ? '€'
                                                : '₽'}
                                </div>

                                <div
                                    style={{
                                        fontSize: '13px',
                                        color: '#10b981',
                                        fontWeight: 600
                                    }}
                                >
                                    Վաճառք
                                </div>

                            </div>

                        </div>

                        {/* Parameters Grid */}
                        <div className="preview-grid-params">

                            <div>

                                <h4 className="preview-group-title">
                                    Շենքի տվյալներ
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
                                        Շինության տիպ:
                                    </span>

                                    <span className="preview-param-val">
                                        {buildingType}
                                    </span>
                                </div>

                                <div className="preview-param-row">
                                    <span className="preview-param-label">
                                        Նորակառույց:
                                    </span>

                                    <span className="preview-param-val">
                                        {newConstruction}
                                    </span>
                                </div>

                                <div className="preview-param-row">
                                    <span className="preview-param-label">
                                        Վերելակ:
                                    </span>

                                    <span className="preview-param-val">
                                        {elevator}
                                    </span>
                                </div>

                                <div className="preview-param-row">
                                    <span className="preview-param-label">
                                        Հարկերի քանակ շենքում:
                                    </span>

                                    <span className="preview-param-val">
                                        {buildingFloors}
                                    </span>
                                </div>

                                {/* Building features badges */}
                                <div style={{marginTop: '10px'}}>

                                    <span
                                        className="preview-param-label"
                                        style={{
                                            display: 'block',
                                            marginBottom: '6px'
                                        }}
                                    >
                                        Շենքում առկա են՝
                                    </span>

                                    <div className="chips-flex-row">

                                        {buildingFeaturesList
                                            .filter(
                                                (item) =>
                                                    buildingFeatures[item.key]
                                            )
                                            .map((item) => (
                                                <span
                                                    key={item.key}
                                                    className="badge-feature"
                                                >
                                                    <Check size={12}/>
                                                    {' '}
                                                    {item.label}
                                                </span>
                                            ))}

                                        {parkingList
                                            .filter(
                                                (item) =>
                                                    parking[item.key]
                                            )
                                            .map((item) => (
                                                <span
                                                    key={item.key}
                                                    className="badge-feature"
                                                >
                                                    <Check size={12}/>
                                                    {' '}
                                                    {item.label} կայանատեղի
                                                </span>
                                            ))}

                                    </div>
                                </div>

                            </div>

                            <div>

                                <h4 className="preview-group-title">
                                    Բնակարանի տվյալներ
                                </h4>

                                <div className="preview-param-row">
                                    <span className="preview-param-label">
                                        Մակերես:
                                    </span>

                                    <span className="preview-param-val">
                                        {floorArea} քմ
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
                                        Հարկ:
                                    </span>

                                    <span className="preview-param-val">
                                        {floor}
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
                                        Առաստաղի բարձրություն:
                                    </span>

                                    <span className="preview-param-val">
                                        {ceilingHeight}
                                    </span>
                                </div>

                                <div className="preview-param-row">
                                    <span className="preview-param-label">
                                        Պատշգամբ:
                                    </span>

                                    <span className="preview-param-val">
                                        {balcony}
                                    </span>
                                </div>

                                <div className="preview-param-row">
                                    <span className="preview-param-label">
                                        Կահույք:
                                    </span>

                                    <span className="preview-param-val">
                                        {furniture}
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
                                        Հարմար է անվասայլակով մարդկանց համար:
                                    </span>

                                    <span className="preview-param-val">
                                        {wheelchairAccessible === '1'
                                            ? 'Այո'
                                            : wheelchairAccessible === '2'
                                                ? 'Ոչ'
                                                : ''}
                                    </span>
                                </div>

                                <div className="preview-param-row">
                                    <span className="preview-param-label">
                                        Հեռախոս:
                                    </span>

                                    <span className="preview-param-val">
                                        {contactType === 'phone'
                                            ? phoneNumber
                                            : contactType === 'none'
                                                ? 'Չկցել հեռախոսահամար'
                                                : ''}
                                    </span>
                                </div>

                            </div>

                        </div>

                        {/* Appliances & Views Badges */}
                        <div
                            style={{
                                borderTop: '1px solid #26344b',
                                paddingTop: '16px'
                            }}
                        >

                            <div className="field-label">
                                Կենցաղային տեխնիկա & Տեսարաններ
                            </div>

                            <div className="chips-flex-row">

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
                                            <Check size={14}/>
                                            {' '}
                                            {item.label}
                                        </span>
                                    ))}

                                {windowViewsList
                                    .filter(
                                        (item) =>
                                            windowViews[item.key]
                                    )
                                    .map((item) => (
                                        <span
                                            key={item.key}
                                            className="badge-feature"
                                        >
                                            <Eye size={14}/>
                                            {' '}
                                            {item.label}
                                        </span>
                                    ))}

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
                                    Տեղադրել հայտարարություն › Վաճառք › Բնակարաններ
                                </h1>

                            </div>

                            <button
                                type="button"
                                onClick={handleQuickDemoFill}
                                className="btn-demo-fill"
                                title="Ավտոմատ լրացնել օրինակային տվյալներով"
                            >
                                <Sparkles size={14}/>
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

                                {/* Owner */}
                                <div
                                    onClick={() => setStatus('owner')}
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
                                            <div className="custom-radio-dot"/>
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

                                {/* Agency */}
                                <div
                                    onClick={() => setStatus('agency')}
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
                                            <div className="custom-radio-dot"/>
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

                        </div>

                        {/* 2. Գտնվելու վայրը */}
                        <div className="form-section">

                            <h2 className="section-title">
                                <MapPin className="section-title-icon"/>
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

                                        {/* Այլ քաղաք կամ գյուղ մուտքագրելու դաշտ */}
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
                                                    {cityOrDistrict}
                                                    )
                                                </button>
                                            )}

                                        </div>

                                    </div>
                                )}

                                {errors.region && (
                                    <div className="error-text">
                                        <AlertCircle size={14}/>
                                        {' '}
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
                                        <AlertCircle size={14}/>
                                        {' '}
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

                            {/* Checkbox: Չցուցադրել շենքի համարը */}
                            <div style={{marginTop: '14px'}}>

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
                                                strokeWidth={3.5}
                                            />
                                        )}
                                    </div>

                                    <input
                                        type="checkbox"
                                        checked={hideBuildingNumber}
                                        onChange={(e) =>
                                            setHideBuildingNumber(
                                                e.target.checked
                                            )
                                        }
                                        style={{display: 'none'}}
                                    />

                                    <span className="checkbox-label-text">
                                        Շենքի համարը չցուցադրել հայտարարության մեջ
                                    </span>

                                </label>

                            </div>

                        </div>

                        {/* 3. Շենքի մասին */}
                        <div className="form-section">

                            <h2 className="section-title">
                                <Building2 className="section-title-icon"/>
                                Շենքի մասին
                            </h2>

                            {/* Շինության տիպ */}
                            <div style={{marginBottom: '18px'}}>

                                <label className="field-label">
                                    Շինության տիպ{' '}
                                    <span className="required-star">
                                        *
                                    </span>
                                </label>

                                <div className="chips-flex-row">

                                    {buildingTypes.map((type) => (
                                        <button
                                            key={type}
                                            type="button"
                                            onClick={() => {
                                                setBuildingType(type);

                                                if (errors.buildingType) {
                                                    setErrors((prev) => ({
                                                        ...prev,
                                                        buildingType: null
                                                    }));
                                                }
                                            }}
                                            className={`chip-btn ${
    buildingType === type
        ? 'selected'
        : ''
}`}
                                        >
                                            {type}
                                        </button>
                                    ))}

                                </div>

                                {errors.buildingType && (
                                    <div className="error-text">
                                        <AlertCircle size={14}/>
                                        {' '}
                                        {errors.buildingType}
                                    </div>
                                )}

                            </div>

                            {/* Նորակառույց */}
                            <div style={{marginBottom: '18px'}}>

                                <label className="field-label">
                                    Նորակառույց{' '}
                                    <span className="required-star">
                                        *
                                    </span>
                                </label>

                                <div className="chips-flex-row">

                                    {newConstructionOptions.map(
                                        (opt) => (
                                            <button
                                                key={opt}
                                                type="button"
                                                onClick={() => {
                                                    setNewConstruction(
                                                        opt
                                                    );

                                                    if (
                                                        errors.newConstruction
                                                    ) {
                                                        setErrors(
                                                            (prev) => ({
                                                                ...prev,
                                                                newConstruction:
                                                                    null
                                                            })
                                                        );
                                                    }
                                                }}
                                                className={`chip-btn ${
    newConstruction === opt
        ? 'selected'
        : ''
}`}
                                                style={{
                                                    minWidth: '70px',
                                                    textAlign: 'center'
                                                }}
                                            >
                                                {opt}
                                            </button>
                                        )
                                    )}

                                </div>

                                {errors.newConstruction && (
                                    <div className="error-text">
                                        <AlertCircle size={14}/>
                                        {' '}
                                        {errors.newConstruction}
                                    </div>
                                )}

                            </div>

                            {/* Վերելակ */}
                            <div style={{marginBottom: '18px'}}>

                                <label className="field-label">
                                    Վերելակ{' '}
                                    <span className="required-star">
                                        *
                                    </span>
                                </label>

                                <div className="chips-flex-row">

                                    {elevatorOptions.map((opt) => (
                                        <button
                                            key={opt}
                                            type="button"
                                            onClick={() => {
                                                setElevator(opt);

                                                if (errors.elevator) {
                                                    setErrors((prev) => ({
                                                        ...prev,
                                                        elevator: null
                                                    }));
                                                }
                                            }}
                                            className={`chip-btn ${
    elevator === opt
        ? 'selected'
        : ''
}`}
                                        >
                                            {opt}
                                        </button>
                                    ))}

                                </div>

                                {errors.elevator && (
                                    <div className="error-text">
                                        <AlertCircle size={14}/>
                                        {' '}
                                        {errors.elevator}
                                    </div>
                                )}

                            </div>

                            {/* Հարկերի քանակ */}
                            <div style={{marginBottom: '18px'}}>

                                <label className="field-label">
                                    Հարկերի քանակ շենքում{' '}
                                    <span className="required-star">
                                        *
                                    </span>
                                </label>

                                <div className="chips-flex-row">

                                    {buildingFloorOptions.map((opt) => (
                                        <button
                                            key={opt}
                                            type="button"
                                            onClick={() => {
                                                setBuildingFloors(
                                                    opt
                                                );

                                                if (
                                                    errors.buildingFloors
                                                ) {
                                                    setErrors(
                                                        (prev) => ({
                                                            ...prev,
                                                            buildingFloors:
                                                                null
                                                        })
                                                    );
                                                }
                                            }}
                                            className={`chip-btn chip-btn-square ${
    buildingFloors === opt
        ? 'selected'
        : ''
}`}
                                        >
                                            {opt}
                                        </button>
                                    ))}

                                </div>

                                {errors.buildingFloors && (
                                    <div className="error-text">
                                        <AlertCircle size={14}/>
                                        {' '}
                                        {errors.buildingFloors}
                                    </div>
                                )}

                            </div>

                            {/* Առկա են */}
                            <div style={{marginBottom: '18px'}}>

                                <label className="field-label">
                                    Առկա են
                                </label>

                                <div className="chips-flex-row">

                                    {buildingFeaturesList.map(
                                        (item) => {
                                            const isChecked =
                                                buildingFeatures[
                                                    item.key
                                                ];

                                            return (
                                                <button
                                                    key={item.key}
                                                    type="button"
                                                    onClick={() =>
                                                        setBuildingFeatures(
                                                            {
                                                                ...buildingFeatures,
                                                                [item.key]:
                                                                    !isChecked
                                                            }
                                                        )
                                                    }
                                                    className={`chip-checkbox-btn ${
    isChecked
        ? 'selected'
        : ''
}`}
                                                >
                                                    <div
                                                        className={`chip-box-indicator ${
    isChecked
        ? 'checked'
        : ''
}`}
                                                    >
                                                        {isChecked && (
                                                            <Check
                                                                size={12}
                                                                strokeWidth={
                                                                    3
                                                                }
                                                            />
                                                        )}
                                                    </div>

                                                    <span>
                                                        {item.label}
                                                    </span>
                                                </button>
                                            );
                                        }
                                    )}

                                </div>

                            </div>

                            {/* Կայանատեղի */}
                            <div>

                                <label className="field-label">
                                    Կայանատեղի
                                </label>

                                <div className="chips-flex-row">

                                    {parkingList.map((item) => {
                                        const isChecked =
                                            parking[item.key];

                                        return (
                                            <button
                                                key={item.key}
                                                type="button"
                                                onClick={() =>
                                                    setParking({
                                                        ...parking,
                                                        [item.key]:
                                                            !isChecked
                                                    })
                                                }
                                                className={`chip-checkbox-btn ${
    isChecked
        ? 'selected'
        : ''
}`}
                                            >
                                                <div
                                                    className={`chip-box-indicator ${
    isChecked
        ? 'checked'
        : ''
}`}
                                                >
                                                    {isChecked && (
                                                        <Check
                                                            size={12}
                                                            strokeWidth={3}
                                                        />
                                                    )}
                                                </div>

                                                <span>
                                                    {item.label}
                                                </span>
                                            </button>
                                        );
                                    })}

                                </div>

                            </div>

                        </div>

                        {/* 4. Բնակարանի մասին */}
                        <div className="form-section">

                            <h2 className="section-title">
                                <Home className="section-title-icon"/>
                                Բնակարանի մասին
                            </h2>

                            {/* Ընդհանուր մակերես */}
                            <div
                                className="input-max-width"
                                style={{marginBottom: '18px'}}
                            >

                                <label className="field-label">
                                    Ընդհանուր մակերես{' '}
                                    <span className="required-star">
                                        *
                                    </span>
                                </label>

                                <div className="input-with-addon">

                                    <input
                                        type="number"
                                        value={floorArea}
                                        onChange={(e) => {
                                            setFloorArea(
                                                e.target.value
                                            );

                                            if (errors.floorArea) {
                                                setErrors((prev) => ({
                                                    ...prev,
                                                    floorArea: null
                                                }));
                                            }
                                        }}
                                        placeholder="Օրինակ՝ 85"
                                        className={`custom-input ${
    errors.floorArea
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

                                {errors.floorArea && (
                                    <div className="error-text">
                                        <AlertCircle size={14}/>
                                        {' '}
                                        {errors.floorArea}
                                    </div>
                                )}

                            </div>

                            {/* Սենյակների քանակ */}
                            <div style={{marginBottom: '18px'}}>

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

                                                if (errors.roomsCount) {
                                                    setErrors((prev) => ({
                                                        ...prev,
                                                        roomsCount: null
                                                    }));
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
                                        <AlertCircle size={14}/>
                                        {' '}
                                        {errors.roomsCount}
                                    </div>
                                )}

                            </div>

                            {/* Սանհանգույցների քանակ */}
                            <div style={{marginBottom: '18px'}}>

                                <label className="field-label">
                                    Սանհանգույցների քանակ{' '}
                                    <span className="required-star">
                                        *
                                    </span>
                                </label>

                                <div className="chips-flex-row">

                                    {bathroomOptions.map((opt) => (
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
                                                        (prev) => ({
                                                            ...prev,
                                                            bathroomsCount:
                                                                null
                                                        })
                                                    );
                                                }
                                            }}
                                            className={`chip-btn chip-btn-square ${
    bathroomsCount === opt
        ? 'selected'
        : ''
}`}
                                        >
                                            {opt}
                                        </button>
                                    ))}

                                </div>

                                {errors.bathroomsCount && (
                                    <div className="error-text">
                                        <AlertCircle size={14}/>
                                        {' '}
                                        {errors.bathroomsCount}
                                    </div>
                                )}

                            </div>

                            {/* Առաստաղի բարձրություն */}
                            <div style={{marginBottom: '18px'}}>

                                <label className="field-label">
                                    Առաստաղի բարձրություն{' '}
                                    <span className="required-star">
                                        *
                                    </span>
                                </label>

                                <div className="chips-flex-row">

                                    {ceilingHeightOptions.map(
                                        (opt) => (
                                            <button
                                                key={opt}
                                                type="button"
                                                onClick={() => {
                                                    setCeilingHeight(
                                                        opt
                                                    );

                                                    if (
                                                        errors.ceilingHeight
                                                    ) {
                                                        setErrors(
                                                            (prev) => ({
                                                                ...prev,
                                                                ceilingHeight:
                                                                    null
                                                            })
                                                        );
                                                    }
                                                }}
                                                className={`chip-btn ${
    ceilingHeight ===
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

                                {errors.ceilingHeight && (
                                    <div className="error-text">
                                        <AlertCircle size={14}/>
                                        {' '}
                                        {errors.ceilingHeight}
                                    </div>
                                )}

                            </div>

                            {/* Հարկ */}
                            <div style={{marginBottom: '18px'}}>

                                <label className="field-label">
                                    Հարկ{' '}
                                    <span className="required-star">
                                        *
                                    </span>
                                </label>

                                <div className="chips-flex-row">

                                    {floorOptions.map((opt) => (
                                        <button
                                            key={opt}
                                            type="button"
                                            onClick={() => {
                                                setFloor(opt);

                                                if (errors.floor) {
                                                    setErrors((prev) => ({
                                                        ...prev,
                                                        floor: null
                                                    }));
                                                }
                                            }}
                                            className={`chip-btn chip-btn-square ${
    floor === opt
        ? 'selected'
        : ''
}`}
                                        >
                                            {opt}
                                        </button>
                                    ))}

                                </div>

                                {errors.floor && (
                                    <div className="error-text">
                                        <AlertCircle size={14}/>
                                        {' '}
                                        {errors.floor}
                                    </div>
                                )}

                            </div>

                            {/* Պատշգամբ */}
                            <div style={{marginBottom: '18px'}}>

                                <label className="field-label">
                                    Պատշգամբ{' '}
                                    <span className="required-star">
                                        *
                                    </span>
                                </label>

                                <div className="chips-flex-row">

                                    {balconyOptions.map((opt) => (
                                        <button
                                            key={opt}
                                            type="button"
                                            onClick={() => {
                                                setBalcony(opt);

                                                if (errors.balcony) {
                                                    setErrors((prev) => ({
                                                        ...prev,
                                                        balcony: null
                                                    }));
                                                }
                                            }}
                                            className={`chip-btn ${
    balcony === opt
        ? 'selected'
        : ''
}`}
                                        >
                                            {opt}
                                        </button>
                                    ))}

                                </div>

                                {errors.balcony && (
                                    <div className="error-text">
                                        <AlertCircle size={14}/>
                                        {' '}
                                        {errors.balcony}
                                    </div>
                                )}

                            </div>

                            {/* Կահույք */}
                            <div style={{marginBottom: '18px'}}>

                                <label className="field-label">
                                    Կահույք{' '}
                                    <span className="required-star">
                                        *
                                    </span>
                                </label>

                                <div className="chips-flex-row">

                                    {furnitureOptions.map((opt) => (
                                        <button
                                            key={opt}
                                            type="button"
                                            onClick={() => {
                                                setFurniture(opt);

                                                if (errors.furniture) {
                                                    setErrors((prev) => ({
                                                        ...prev,
                                                        furniture: null
                                                    }));
                                                }
                                            }}
                                            className={`chip-btn ${
    furniture === opt
        ? 'selected'
        : ''
}`}
                                        >
                                            {opt}
                                        </button>
                                    ))}

                                </div>

                                {errors.furniture && (
                                    <div className="error-text">
                                        <AlertCircle size={14}/>
                                        {' '}
                                        {errors.furniture}
                                    </div>
                                )}

                            </div>

                            {/* Վերանորոգում */}
                            <div style={{marginBottom: '18px'}}>

                                <label className="field-label">
                                    Վերանորոգում{' '}
                                    <span className="required-star">
                                        *
                                    </span>
                                </label>

                                <div className="chips-flex-row">

                                    {renovationOptions.map((opt) => (
                                        <button
                                            key={opt}
                                            type="button"
                                            onClick={() => {
                                                setRenovation(opt);

                                                if (errors.renovation) {
                                                    setErrors(
                                                        (prev) => ({
                                                            ...prev,
                                                            renovation:
                                                                null
                                                        })
                                                    );
                                                }
                                            }}
                                            className={`chip-btn ${
    renovation === opt
        ? 'selected'
        : ''
}`}
                                        >
                                            {opt}
                                        </button>
                                    ))}

                                </div>

                                {errors.renovation && (
                                    <div className="error-text">
                                        <AlertCircle size={14}/>
                                        {' '}
                                        {errors.renovation}
                                    </div>
                                )}

                            </div>

                            {/* Կենցաղային տեխնիկա */}
                            <div style={{marginBottom: '18px'}}>

                                <label className="field-label">
                                    Կենցաղային տեխնիկա
                                </label>

                                <div className="chips-flex-row">

                                    {appliancesList.map((item) => {
                                        const isChecked =
                                            appliances[item.key];

                                        return (
                                            <button
                                                key={item.key}
                                                type="button"
                                                onClick={() =>
                                                    setAppliances({
                                                        ...appliances,
                                                        [item.key]:
                                                            !isChecked
                                                    })
                                                }
                                                className={`chip-checkbox-btn ${
    isChecked
        ? 'selected'
        : ''
}`}
                                            >
                                                <div
                                                    className={`chip-box-indicator ${
    isChecked
        ? 'checked'
        : ''
}`}
                                                >
                                                    {isChecked && (
                                                        <Check
                                                            size={12}
                                                            strokeWidth={3}
                                                        />
                                                    )}
                                                </div>

                                                <span>
                                                    {item.label}
                                                </span>
                                            </button>
                                        );
                                    })}

                                </div>

                            </div>

                            {/* Տեսարաններ պատուհաններից */}
                            <div style={{marginBottom: '18px'}}>

                                <label className="field-label">
                                    Տեսարաններ պատուհաններից
                                </label>

                                <div className="chips-flex-row">

                                    {windowViewsList.map((item) => {
                                        const isChecked =
                                            windowViews[item.key];

                                        return (
                                            <button
                                                key={item.key}
                                                type="button"
                                                onClick={() =>
                                                    setWindowViews({
                                                        ...windowViews,
                                                        [item.key]:
                                                            !isChecked
                                                    })
                                                }
                                                className={`chip-checkbox-btn ${
    isChecked
        ? 'selected'
        : ''
}`}
                                            >
                                                <div
                                                    className={`chip-box-indicator ${
    isChecked
        ? 'checked'
        : ''
}`}
                                                >
                                                    {isChecked && (
                                                        <Check
                                                            size={12}
                                                            strokeWidth={3}
                                                        />
                                                    )}
                                                </div>

                                                <span>
                                                    {item.label}
                                                </span>
                                            </button>
                                        );
                                    })}

                                </div>

                            </div>

                            {/* Հարմար է անվասայլակով մարդկանց համար */}
                            <div>

                                <label className="field-label">
                                    Հարմար է անվասայլակով մարդկանց համար
                                </label>

                                <div className="chips-flex-row">

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setWheelchairAccessible('1')
                                        }
                                        className={`chip-btn ${
    wheelchairAccessible === '1'
        ? 'selected'
        : ''
}`}
                                    >
                                        Այո
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setWheelchairAccessible('2')
                                        }
                                        className={`chip-btn ${
    wheelchairAccessible === '2'
        ? 'selected'
        : ''
}`}
                                    >
                                        Ոչ
                                    </button>

                                </div>

                            </div>

                        </div>

                        {/* 5. Գին */}
                        <div className="form-section">

                            <h2 className="section-title">
                                <DollarSign className="section-title-icon"/>
                                Գին
                            </h2>

                            <label className="field-label">
                                Գին{' '}
                                <span className="required-star">
                                    *
                                </span>
                            </label>

                            <div
                                className="input-max-width"
                                style={{marginTop: '4px'}}
                            >
                                <input
                                    type="number"
                                    value={price}
                                    onChange={(e) => {
                                        setPrice(e.target.value);

                                        if (errors.price) {
                                            setErrors((prev) => ({
                                                ...prev,
                                                price: null
                                            }));
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
                            <div style={{marginTop: '14px'}}>

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

                                    {currencyOptions.map((curr) => (
                                        <button
                                            key={curr.code}
                                            type="button"
                                            onClick={() =>
                                                setCurrency(
                                                    curr.code
                                                )
                                            }
                                            className={`chip-btn-sm ${
    currency === curr.code
        ? 'selected'
        : ''
}`}
                                        >
                                            {curr.label}
                                        </button>
                                    ))}

                                </div>

                            </div>

                            {errors.price && (
                                <div
                                    className="error-text"
                                    style={{marginTop: '8px'}}
                                >
                                    <AlertCircle size={14}/>
                                    {' '}
                                    {errors.price}
                                </div>
                            )}

                        </div>

                        {/* 6. Լուսանկարներ */}
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
                                Խնդրում ենք վերբեռնել լուսանկարները հետևյալ
                                հերթականությամբ՝ սենյակներ, խոհանոց,
                                սանհանգույց, պատշգամբ և ապա նոր ոչ բնակելի
                                տարածքների լուսանկարներ (շենքի ճակատ, նկուղ,
                                պատուհաններից բացվող տեսարան, շենքի մուտք,
                                ավտոկայանատեղի և այլն): Նաև ցույց տվեք շենքի
                                ճակատը, պատուհաններից բացվող տեսարանը, շենքի
                                մուտքը և ավտոկայանատեղին։ Կարող եք նաև
                                ավելացնել հատակագիծը։ Խնդրում ենք համոզվել,
                                որ ձեր լուսանկարն առնվազն 600 պիքսել
                                լայնություն և 500 պիքսել բարձրություն ունի։
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

                                    const files = Array.from(
                                        e.dataTransfer.files || []
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
                                    onChange={handleFileUpload}
                                    style={{display: 'none'}}
                                />

                                <div className="upload-icon-wrapper">
                                    <ImageIcon size={24}/>
                                </div>

                                <div className="upload-text-main">
                                    Քաշեք ու թողեք ֆայլը կամ{' '}
                                    <span className="upload-text-highlight">
                                        վերբեռնեք սարքից
                                    </span>
                                </div>

                                <div className="upload-text-sub">
                                    JPG, JPEG, PNG մինչև 15MB
                                </div>

                            </div>

                            {/* Photos List */}
                            {photos.length > 0 && (
                                <div className="photos-preview-grid">

                                    {photos.map((p, idx) => (
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
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleRemovePhoto(
                                                        p.id
                                                    );
                                                }}
                                                className="btn-remove-photo"
                                            >
                                                <X size={14}/>
                                            </button>

                                            {idx === 0 && (
                                                <span className="badge-main-photo">
                                                    Գլխավոր
                                                </span>
                                            )}
                                        </div>
                                    ))}

                                </div>
                            )}

                            {errors.photos && (
                                <div className="error-text">
                                    <AlertCircle size={14}/>
                                    {' '}
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

                        {/* 7. Կոնտակտային տվյալներ */}
                        <div className="form-section">

                            <h2 className="section-title">
                                Կոնտակտային տվյալներ
                            </h2>

                            <div className="radio-group-vertical">

                                {/* Phone */}
                                <div
                                    onClick={() =>
                                        setContactType('phone')
                                    }
                                    className="custom-radio-row"
                                >

                                    <div
                                        className={`custom-radio-circle ${
    contactType === 'phone'
        ? 'checked'
        : ''
}`}
                                    >
                                        {contactType === 'phone' && (
                                            <div className="custom-radio-dot"/>
                                        )}
                                    </div>

                                    <div
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
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
                                                'Հեռախոսահամար'}
                                        </span>
                                    </div>

                                </div>

                                {/* Without phone */}
                                <div
                                    onClick={() =>
                                        setContactType('none')
                                    }
                                    className="custom-radio-row"
                                >

                                    <div
                                        className={`custom-radio-circle ${
    contactType === 'none'
        ? 'checked'
        : ''
}`}
                                    >
                                        {contactType === 'none' && (
                                            <div className="custom-radio-dot"/>
                                        )}
                                    </div>

                                    <div
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
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

export default ApartmentSaleForm;
