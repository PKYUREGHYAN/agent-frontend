import { useEffect, useRef, useState } from "react";
import "./AiPhotoCleaner.css";
import { I18nTree } from "../i18n/I18n.jsx";

import { AI_TOOLS, ALL_AI_TOOLS } from "./data/aiTools.js";
import { AI_API_URL } from "../services/api.js";
import { useFormDraftState, usePersistentState } from "../services/uiSession.js";


/*
|--------------------------------------------------------------------------
| INITIAL DATA
|--------------------------------------------------------------------------
*/

const INITIAL_AI_PHOTOS = [];

const getErrorMessage = (value) => {
    if (typeof value === "string") {
        return value;
    }

    if (Array.isArray(value)) {
        return value.map(getErrorMessage).filter(Boolean).join("; ");
    }

    if (value && typeof value === "object") {
        const message =
            getErrorMessage(value.message) ||
            getErrorMessage(value.msg) ||
            getErrorMessage(value.detail);
        const location = Array.isArray(value.loc)
            ? value.loc.filter((part) => part !== "body").join(".")
            : "";

        if (message && location) {
            return `${location}: ${message}`;
        }

        return message || JSON.stringify(value);
    }

    return "";
};


/*
|--------------------------------------------------------------------------
| COMPONENT
|--------------------------------------------------------------------------
*/

export function AiPhotoCleaner({
                                   onTransferToMainPhotos,
                                   onSelectionChange,
                               }) {

    /*
    |--------------------------------------------------------------------------
    | PHOTOS
    |--------------------------------------------------------------------------
    */

    const [photos, setPhotos] = useFormDraftState(
        "ai-cleaner",
        "photos",
        INITIAL_AI_PHOTOS
    );


    /*
    |--------------------------------------------------------------------------
    | SELECTED PHOTOS
    |--------------------------------------------------------------------------
    */

    const [selectedIds, setSelectedIds] = usePersistentState(
        "ai-cleaner-selected",
        []
    );


    /*
    |--------------------------------------------------------------------------
    | ACTIVE AI TOOL
    |--------------------------------------------------------------------------
    */

    const [activeToolId, setActiveToolId] = usePersistentState(
        "ai-cleaner-tool",
        null
    );

    const [apiCapabilities, setApiCapabilities] = useState(null);


    /*
    |--------------------------------------------------------------------------
    | PROCESSING
    |--------------------------------------------------------------------------
    */

    const [isProcessing, setIsProcessing] = useState(false);

    const [processingStage, setProcessingStage] = useState("");


    /*
    |--------------------------------------------------------------------------
    | BEFORE / AFTER MODAL
    |--------------------------------------------------------------------------
    */

    const [compareModalPhoto, setCompareModalPhoto] =
        useState(null);


    /*
    |--------------------------------------------------------------------------
    | FILE INPUT
    |--------------------------------------------------------------------------
    */

    const fileInputRef = useRef(null);

    useEffect(() => {
        let isMounted = true;

        fetch(`${AI_API_URL}/capabilities`)
            .then(async (response) => {
                const result = await response.json().catch(() => ({}));
                if (!response.ok || !result.success) {
                    throw new Error("AI ծառայության վիճակը հասանելի չէ");
                }
                return result;
            })
            .then((result) => {
                if (isMounted) {
                    setApiCapabilities(result);
                }
            })
            .catch((error) => {
                console.error("Could not load AI capabilities:", error);
            });

        return () => {
            isMounted = false;
        };
    }, []);


    /*
    |--------------------------------------------------------------------------
    | FIND ACTIVE TOOL
    |--------------------------------------------------------------------------
    */

    const activeTool = ALL_AI_TOOLS.find(
        (tool) => tool.id === activeToolId
    );


    /*
    |--------------------------------------------------------------------------
    | SELECT PHOTO
    |--------------------------------------------------------------------------
    */

    const toggleSelectPhoto = (id) => {

        setSelectedIds((prev) => {

            const next = prev.includes(id)
                ? prev.filter(
                    (item) => item !== id
                )
                : [
                    ...prev,
                    id,
                ];

            if (onSelectionChange) {
                onSelectionChange(next.length);
            }

            return next;
        });
    };


    /*
    |--------------------------------------------------------------------------
    | SELECT ALL
    |--------------------------------------------------------------------------
    */

    const toggleSelectAll = () => {

        if (photos.length === 0) {
            return;
        }

        if (
            selectedIds.length === photos.length
        ) {

            setSelectedIds([]);

            if (onSelectionChange) {
                onSelectionChange(0);
            }

            return;
        }

        const allIds = photos.map(
            (photo) => photo.id
        );

        setSelectedIds(allIds);

        if (onSelectionChange) {
            onSelectionChange(allIds.length);
        }
    };


    /*
    |--------------------------------------------------------------------------
    | DELETE PHOTO
    |--------------------------------------------------------------------------
    */

    const handleDeletePhoto = (id) => {

        setPhotos((prev) =>
            prev.filter(
                (photo) => photo.id !== id
            )
        );

        setSelectedIds((prev) => {

            const next = prev.filter(
                (item) => item !== id
            );

            if (onSelectionChange) {
                onSelectionChange(next.length);
            }

            return next;
        });

        if (
            compareModalPhoto &&
            compareModalPhoto.id === id
        ) {
            setCompareModalPhoto(null);
        }
    };


    /*
    |--------------------------------------------------------------------------
    | UPLOAD PHOTOS
    |--------------------------------------------------------------------------
    */

    const handleUpload = (e) => {

        const files = e.target.files;

        if (
            !files ||
            files.length === 0
        ) {
            return;
        }

        Array.from(files).forEach(
            (file, index) => {

                const reader = new FileReader();

                reader.onload = () => {

                    if (
                        typeof reader.result !==
                        "string"
                    ) {
                        return;
                    }

                    const newId =
                        `ai-user-${Date.now()}-${index}`;

                    const newCard = {
                        id: newId,

                        category:
                            "Վերբեռնված լուսանկար",

                        original:
                        reader.result,

                        cleaned:
                        reader.result,

                        isCleaned:
                            false,

                        toolCommand:
                            null,
                    };

                    setPhotos((prev) => [
                        ...prev,
                        newCard,
                    ]);

                    setSelectedIds((prev) => {

                        const next = [
                            ...prev,
                            newId,
                        ];

                        if (onSelectionChange) {
                            onSelectionChange(
                                next.length
                            );
                        }

                        return next;
                    });
                };

                reader.readAsDataURL(file);
            }
        );

        /*
         * Թույլ ենք տալիս նույն ֆայլը
         * կրկին ընտրել։
         */

        e.target.value = "";
    };


    /*
    |--------------------------------------------------------------------------
    | SELECT AI TOOL
    |--------------------------------------------------------------------------
    */

    const handleToolClick = (tool) => {

        if (isProcessing) {
            return;
        }

        if (!apiCapabilities) {
            setProcessingStage("AI ծառայության հնարավորությունները դեռ ստուգվում են։");
            return;
        }

        const isSupported =
            apiCapabilities.supported_commands?.includes(tool.command);

        if (!isSupported) {
            setProcessingStage(
                `⚠️ ${
                    apiCapabilities?.unavailable_commands?.[tool.command] ||
                    "Այս գործիքը հիմա հասանելի չէ"
                }`
            );
            return;
        }

        setActiveToolId(tool.id);

        setProcessingStage("");
    };


    /*
    |--------------------------------------------------------------------------
    | PROCESS ONE PHOTO
    |--------------------------------------------------------------------------
    |
    | LOCAL AI API
    |
    |--------------------------------------------------------------------------
    */

    const processSinglePhoto = async (photo, tool) => {

        if (!photo?.original?.startsWith("data:image/")) {
            throw new Error("Լուսանկարի տվյալը բացակայում է. հեռացրեք և կրկին վերբեռնեք նկարը։");
        }

        if (typeof tool?.command !== "string" || !tool.command.trim()) {
            throw new Error(
                "AI գործիքի command-ը բացակայում է. կրկին ընտրեք արագ գործիքը։"
            );
        }

        const sourceImage = photo.isCleaned ? photo.cleaned : photo.original;

        const response = await fetch(
            `${AI_API_URL}/process-image`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    image_data: sourceImage,
                    command: tool.command,
                }),
            }
        );

        const result = await response.json().catch(
            () => ({})
        );

        if (!response.ok || !result.success) {
            const message = getErrorMessage(result.detail) || getErrorMessage(result.message);
            throw new Error(message || "Տեղային AI ծառայությունը չկարողացավ մշակել նկարը");
        }

        return result;
    };


    /*
    |--------------------------------------------------------------------------
    | RUN AI
    |--------------------------------------------------------------------------
    */

    const handleRunAiCleaning = async (tool = activeTool) => {

        // React passes the click event to a handler supplied directly as
        // onClick={handler}.  It is not an AI tool and has no `command`.
        // Fall back to the selected quick tool in that case.
        if (typeof tool?.command !== "string") {
            tool = activeTool;
        }

        if (selectedIds.length === 0) {
            return;
        }

        if (!tool) {

            setProcessingStage(
                "⚠️ Նախ ընտրեք AI գործիք"
            );

            return;
        }

        if (!apiCapabilities) {
            setProcessingStage("⚠️ AI ծառայության հնարավորությունները դեռ չեն բեռնվել։ Թարմացրեք էջը։");
            return;
        }

        const unavailableReason =
            apiCapabilities?.unavailable_commands?.[tool.command];

        if (unavailableReason) {
            setProcessingStage(`⚠️ ${unavailableReason}`);
            return;
        }

        setIsProcessing(true);

        setProcessingStage(
            `🔍 AI-ն պատրաստվում է «${tool.label}» գործողությանը...`
        );

        const selectedPhotos =
            photos.filter(
                (photo) =>
                    selectedIds.includes(
                        photo.id
                    )
            );

        let successCount = 0;

        let lastError = "";

        let usedLightweightFallback = false;

        try {

            /*
             * Յուրաքանչյուր լուսանկար
             * մշակվում է առանձին։
             */

            for (
                let index = 0;
                index < selectedPhotos.length;
                index++
            ) {

                const photo =
                    selectedPhotos[index];

                setProcessingStage(
                    `✨ ${tool.label} — նկարը ${
                        index + 1
                    } / ${
                        selectedPhotos.length
                    }`
                );

                try {

                    const response =
                        await processSinglePhoto(
                            photo,
                            tool
                        );

                    if (
                        response &&
                        response.processed_image
                    ) {

                        usedLightweightFallback ||=
                            response.engine === "local-opencv";

                        setPhotos((prev) =>
                            prev.map(
                                (item) =>
                                    item.id === photo.id
                                        ? {
                                            ...item,

                                            cleaned:
                                            response.processed_image,

                                            isCleaned:
                                                true,

                                            toolCommand:
                                            tool.command,
                                        }
                                        : item
                            )
                        );

                        successCount++;
                    }

                } catch (photoError) {

                    console.error(
                        `AI processing failed for ${photo.id}:`,
                        photoError
                    );

                    lastError =
                        getErrorMessage(photoError) ||
                        "AI processing error";

                    setProcessingStage(
                        `⚠️ Նկար ${
                            index + 1
                        }-ի սխալ՝ ${
                            lastError
                        }`
                    );
                }
            }

            if (successCount === 0) {

                throw new Error(
                    lastError ||
                    "Ոչ մի լուսանկար չմշակվեց։"
                );
            }

            setProcessingStage(
                `✓ «${tool.label}» ավարտվեց — ${successCount} / ${selectedPhotos.length} նկար${
                    usedLightweightFallback
                        ? " (թեթև OpenCV ռեժիմ՝ սահմանափակ RAM-ի պատճառով)"
                        : ""
                }`
            );

        } catch (error) {

            console.error(
                "AI Processing error:",
                error
            );

            setProcessingStage(
                `⚠️ AI մշակման սխալ՝ ${getErrorMessage(error) || "Անհայտ սխալ"}`
            );

        } finally {

            setIsProcessing(false);
        }
    };

    /*
    |--------------------------------------------------------------------------
    | TRANSFER TO MAIN PHOTOS
    |--------------------------------------------------------------------------
    */

    const handleTransferToMain = () => {

        if (selectedIds.length === 0) {
            return;
        }

        const photosToMove =
            photos
                .filter(
                    (photo) =>
                        selectedIds.includes(
                            photo.id
                        )
                )
                .map(
                    (photo) =>
                        photo.isCleaned
                            ? photo.cleaned
                            : photo.original
                );

        if (onTransferToMainPhotos) {

            onTransferToMainPhotos(
                photosToMove
            );
        }
    };


    /*
    |--------------------------------------------------------------------------
    | RENDER
    |--------------------------------------------------------------------------
    */

    return (
        <I18nTree>
        <div
            className="ai-cleaner-card"
            id="ai-photo-cleaner-section"
        >

            {/* =====================================================
                HEADER
            ====================================================== */}

            <div className="ai-cleaner-header">

                <div className="ai-cleaner-title-wrap">

                    <span className="ai-cleaner-badge">
                        AI PHOTO TOOLS
                    </span>

                    <h3 className="ai-cleaner-title">
                        ✨ AI նկարների մաքրում
                    </h3>

                </div>

                {photos.length > 0 && (

                    <button
                        type="button"
                        className={`ai-btn-select-all ${
                            selectedIds.length ===
                            photos.length
                                ? "active"
                                : ""
                        }`}
                        onClick={toggleSelectAll}
                    >

                        {
                            selectedIds.length ===
                            photos.length
                                ? "✕ Հանել ընտրությունը"
                                : "✓ Ընտրել բոլորը"
                        }

                    </button>

                )}

            </div>


            <p className="ai-cleaner-subtitle">
                Վերբեռնեք ձեր նկարները։ Յուրաքանչյուր նկար մշակվում է առանձին։
                Ընտրեք արագ գործիք և մշակեք ընտրվածները։
            </p>

            {apiCapabilities?.runtime && (
                <div
                    className={`ai-runtime-status ${
                        apiCapabilities.runtime.object_removal_ready ? "ready" : "limited"
                    }`}
                    role="status"
                >
                    <span>
                        AI ռեժիմ՝ {apiCapabilities.runtime.name} · RAM՝
                        {" "}{apiCapabilities.runtime.available_ram_gib} / {apiCapabilities.runtime.total_ram_gib} GB ազատ
                    </span>
                    {!apiCapabilities.runtime.object_removal_ready && (
                        <span>
                            Օբյեկտ հեռացնելու համար ազատեք առնվազն{" "}
                            {apiCapabilities.runtime.min_free_for_removal_gib} GB RAM։
                            Լուսավորության արագ գործիքները հասանելի են։
                        </span>
                    )}
                </div>
            )}

            {apiCapabilities?.large_inpaint && !apiCapabilities.large_inpaint.available && (
                <div className="ai-runtime-status limited" role="status">
                    <span>Պատերի և մեծ հատվածների AI վերականգնումը միացված չէ։</span>
                    <span>{apiCapabilities.large_inpaint.reason}</span>
                </div>
            )}


            {/* =====================================================
                AI TOOLS
            ====================================================== */}

            <div className="ai-tools-container">

                {/* =================================================
                    LEFT SIDE — IMPROVE
                ================================================== */}

                <div className="ai-tools-section">

                    <div className="ai-tools-section-header">

                        <div className="ai-tools-section-title">

                            <span className="ai-tools-section-icon">
                                🏠
                            </span>

                            <div>

                                <strong>
                                    Բարելավել
                                </strong>

                                <small>
                                    Պատ, տեսք, սիրունցնել, սփռոց՝ առանձին կոճակներ
                                </small>

                            </div>

                        </div>

                    </div>


                    <div className="ai-tools-grid">

                        {AI_TOOLS.improve.map(
                            (tool) => {

                                const isActive =
                                    activeToolId ===
                                    tool.id;

                                return (

                                    <button
                                        key={tool.id}
                                        type="button"
                                        className={`ai-tool-card ${
                                            isActive
                                                ? "active"
                                                : ""
                                        }`}
                                        onClick={() =>
                                            handleToolClick(
                                                tool
                                            )
                                        }
                                        disabled={
                                            isProcessing ||
                                            !apiCapabilities ||
                                            !apiCapabilities.supported_commands.includes(tool.command)
                                        }
                                        title={
                                            apiCapabilities?.unavailable_commands?.[tool.command] ||
                                            (!apiCapabilities ? "Ստուգվում են AI գործիքները…" : tool.description)
                                        }
                                    >

                                        <span className="ai-tool-icon">
                                            {
                                                tool.icon
                                            }
                                        </span>

                                        <span className="ai-tool-content">

                                            <span className="ai-tool-label">
                                                {
                                                    tool.label
                                                }
                                            </span>

                                            <span className="ai-tool-description">
                                                {
                                                    tool.description
                                                }
                                            </span>

                                        </span>

                                        {isActive && (

                                            <span className="ai-tool-check">
                                                ✓
                                            </span>

                                        )}

                                    </button>
                                );
                            }
                        )}

                    </div>

                </div>


                {/* =================================================
                    RIGHT SIDE — REMOVE
                ================================================== */}

                <div className="ai-tools-section ai-tools-section-remove">

                    <div className="ai-tools-section-header">

                        <div className="ai-tools-section-title">

                            <span className="ai-tools-section-icon">
                                🗑️
                            </span>

                            <div>

                                <strong>
                                    Ջնջել
                                </strong>

                                <small>
                                    Մանր իրերը մեկ կոճակով, գույքը՝ առանձին
                                </small>

                            </div>

                        </div>

                    </div>


                    {AI_TOOLS.removeGroups.map((group) => (

                        <div
                            key={group.id}
                            className="ai-tools-group"
                        >

                            <div className="ai-tools-group-header">
                                <strong>{group.title}</strong>
                                <small>{group.subtitle}</small>
                            </div>

                            <div className="ai-tools-grid">

                                {group.tools.map((tool) => {

                                    const isActive =
                                        activeToolId ===
                                        tool.id;

                                    return (

                                        <button
                                            key={tool.id}
                                            type="button"
                                            className={`ai-tool-card ai-tool-card-remove ${
                                                isActive
                                                    ? "active"
                                                    : ""
                                            }`}
                                            onClick={() =>
                                                handleToolClick(
                                                    tool
                                                )
                                            }
                                            disabled={
                                                isProcessing ||
                                                !apiCapabilities ||
                                                !apiCapabilities.supported_commands.includes(tool.command)
                                            }
                                            title={
                                                apiCapabilities?.unavailable_commands?.[tool.command] ||
                                                (!apiCapabilities ? "Ստուգվում են AI գործիքները…" : tool.description)
                                            }
                                        >

                                            <span className="ai-tool-icon">
                                                {tool.icon}
                                            </span>

                                            <span className="ai-tool-content">

                                                <span className="ai-tool-label">
                                                    {tool.label}
                                                </span>

                                                <span className="ai-tool-description">
                                                    {tool.description}
                                                </span>

                                            </span>

                                            {isActive && (

                                                <span className="ai-tool-check">
                                                    ✓
                                                </span>

                                            )}

                                        </button>
                                    );
                                })}

                            </div>

                        </div>

                    ))}

                </div>

            </div>


            {/* =====================================================
                SELECTED TOOL
            ====================================================== */}

            <div className="ai-selected-tool">

                {activeTool ? (

                    <>
                        <span className="ai-selected-tool-icon">
                            {
                                activeTool.icon
                            }
                        </span>

                        <div className="ai-selected-tool-content">

                            <span className="ai-selected-tool-label">
                                Ընտրված գործիք
                            </span>

                            <strong>
                                {
                                    activeTool.label
                                }
                            </strong>

                        </div>

                        <span className="ai-selected-tool-command">
                            {
                                activeTool.command
                            }
                        </span>
                    </>

                ) : (

                    <>
                        <span className="ai-selected-tool-icon">
                            ⚡
                        </span>

                        <div className="ai-selected-tool-content">

                            <span className="ai-selected-tool-label">
                                AI գործիք
                            </span>

                            <strong>
                                Ընտրեք անհրաժեշտ գործողությունը
                            </strong>

                        </div>
                    </>

                )}

            </div>


            {/* =====================================================
                FILE INPUT
            ====================================================== */}

            <input
                type="file"
                ref={fileInputRef}
                style={{
                    display: "none",
                }}
                multiple
                accept="image/*"
                onChange={handleUpload}
            />


            {/* =====================================================
                DROPZONE
            ====================================================== */}

            <div
                className="ai-dropzone"
                onClick={() =>
                    fileInputRef.current?.click()
                }
            >

                <div className="ai-dropzone-icon">
                    🪄
                </div>

                <div className="ai-dropzone-text">

                    Բերեք ձեր պանակի նկարները{" "}

                    <strong>
                        AI մշակման համար
                    </strong>

                    {" "}կամ{" "}

                    <span className="ai-dropzone-link">
                        Վերբեռնեք սարքից
                    </span>

                </div>

            </div>


            {/* =====================================================
                PHOTOS
            ====================================================== */}

            {photos.length > 0 && (

                <>

                    <div className="ai-toolbar">

                        <div className="ai-toolbar-badge">

                            <span>
                                Նշված է AI մշակման համար՝
                            </span>

                            <span className="ai-toolbar-count">

                                {
                                    selectedIds.length
                                }

                                {" / "}

                                {
                                    photos.length
                                }

                            </span>

                        </div>

                        <button
                            type="button"
                            className={`ai-btn-select-all ${
                                selectedIds.length ===
                                photos.length
                                    ? "active"
                                    : ""
                            }`}
                            onClick={toggleSelectAll}
                        >

                            {
                                selectedIds.length ===
                                photos.length
                                    ? "✕ Հանել ընտրությունը"
                                    : "✓ Ընտրել բոլորը"
                            }

                        </button>

                    </div>


                    <div className="ai-grid">

                        {photos.map(
                            (item) => {

                                const isSelected =
                                    selectedIds.includes(
                                        item.id
                                    );

                                const displayImage =
                                    item.isCleaned
                                        ? item.cleaned
                                        : item.original;

                                return (

                                    <div
                                        key={item.id}
                                        className={`ai-card-item ${
                                            isSelected
                                                ? "selected"
                                                : "unselected"
                                        }`}
                                        onClick={() =>
                                            toggleSelectPhoto(
                                                item.id
                                            )
                                        }
                                    >

                                        <div className="ai-image-wrap">

                                            <img
                                                src={
                                                    displayImage
                                                }
                                                alt={
                                                    item.category
                                                }
                                            />

                                            <div className="ai-card-checkbox">
                                                {
                                                    isSelected
                                                        ? "✓"
                                                        : ""
                                                }
                                            </div>

                                            <button
                                                type="button"
                                                className="ai-card-delete"
                                                onClick={(e) => {

                                                    e.stopPropagation();

                                                    handleDeletePhoto(
                                                        item.id
                                                    );
                                                }}
                                                title="Հեռացնել լուսանկարը"
                                            >
                                                ✕
                                            </button>

                                            {item.isCleaned && (

                                                <button
                                                    type="button"
                                                    className="ai-view-toggle-btn"
                                                    onClick={(e) => {

                                                        e.stopPropagation();

                                                        setCompareModalPhoto(
                                                            item
                                                        );
                                                    }}
                                                    title="Տեսնել Մինչ / Հետո տարբերությունը"
                                                >
                                                    ⚖️ Մինչ / Հետո
                                                </button>

                                            )}

                                        </div>


                                        <div className="ai-card-meta">

                                            <div className="ai-card-meta-row">

                                                <span className="ai-card-category">
                                                    {
                                                        item.category
                                                    }
                                                </span>

                                                <span
                                                    className={`ai-status-badge ${
                                                        item.isCleaned
                                                            ? "cleaned"
                                                            : isSelected
                                                                ? "pending"
                                                                : "unselected"
                                                    }`}
                                                >

                                                    {
                                                        item.isCleaned
                                                            ? "✓ AI Մաքրված"
                                                            : isSelected
                                                                ? "Կմշակվի"
                                                                : "Չի մշակվի"
                                                    }

                                                </span>

                                            </div>


                                            {item.toolCommand && (

                                                <div className="ai-card-command">

                                                    ⚡{" "}

                                                    {
                                                        item.toolCommand
                                                    }

                                                </div>

                                            )}

                                        </div>

                                    </div>
                                );
                            }
                        )}

                    </div>


                    {/* =================================================
                        PROGRESS
                    ================================================== */}

                    {(isProcessing ||
                        processingStage) && (

                        <div className="ai-progress-banner">

                            {isProcessing ? (

                                <span className="ai-spinner" />

                            ) : (

                                <span className="ai-progress-success">
                                    ✓
                                </span>

                            )}

                            <span>
                                {
                                    processingStage
                                }
                            </span>

                        </div>
                    )}


                    {/* =================================================
                        ACTIONS
                    ================================================== */}

                    <div className="ai-actions-wrap">

                        <button
                            type="button"
                            className="ai-btn-process"
                            onClick={() => handleRunAiCleaning()}
                            disabled={
                                isProcessing ||
                                selectedIds.length === 0 ||
                                !activeTool ||
                                !apiCapabilities
                            }
                        >

                            {isProcessing ? (

                                <>
                                    <span className="ai-spinner" />

                                    <span>
                                      AI Մշակում ընթացքում է...
                                    </span>
                                </>

                            ) : (

                                <span>
                                    ✨ Մշակել
                                    {activeTool
                                        ? `՝ ${activeTool.label}`
                                        : " AI-ով"}
                                    {" "}
                                    (
                                    {selectedIds.length}
                                    )
                                </span>

                            )}

                        </button>


                        <button
                            type="button"
                            className="ai-btn-transfer"
                            onClick={
                                handleTransferToMain
                            }
                            disabled={
                                selectedIds.length === 0
                            }
                        >

                            📥 Տեղափոխել հիմնական նկարների մեջ (
                            {
                                selectedIds.length
                            }
                            )

                        </button>

                    </div>

                </>
            )}


            {/* =====================================================
                BEFORE / AFTER MODAL
            ====================================================== */}

            {compareModalPhoto && (

                <div
                    className="ai-compare-modal-backdrop"
                    onClick={() =>
                        setCompareModalPhoto(null)
                    }
                >

                    <div
                        className="ai-compare-modal"
                        onClick={(e) =>
                            e.stopPropagation()
                        }
                    >

                        <div className="ai-compare-header">

                            <h4 className="ai-compare-title">
                                🔍 Մինչև և Հետո (AI Մշակում)
                            </h4>

                            <button
                                type="button"
                                className="ai-compare-close"
                                onClick={() =>
                                    setCompareModalPhoto(null)
                                }
                            >
                                ✕
                            </button>

                        </div>


                        <div className="ai-compare-body">

                            <div className="ai-compare-view-grid">

                                <div className="ai-compare-pane">

                                    <div className="ai-compare-pane-label ai-before-label">
                                        🔴 ՄԻՆՉԵՎ
                                    </div>

                                    <img
                                        src={
                                            compareModalPhoto.original
                                        }
                                        alt="Before original"
                                    />

                                </div>


                                <div className="ai-compare-pane">

                                    <div className="ai-compare-pane-label ai-after-label">
                                        🟢 ՀԵՏՈ
                                    </div>

                                    <img
                                        src={
                                            compareModalPhoto.cleaned
                                        }
                                        alt="After AI"
                                    />

                                </div>

                            </div>

                        </div>


                        <div className="ai-compare-footer">

                            <button
                                type="button"
                                className="ai-btn-select-all active"
                                onClick={() =>
                                    setCompareModalPhoto(null)
                                }
                            >
                                Փակել
                            </button>

                        </div>

                    </div>

                </div>

            )}

        </div>
        </I18nTree>
    );
}


export default AiPhotoCleaner;
