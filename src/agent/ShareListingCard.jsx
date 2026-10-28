import { useState } from "react";
import "./share-listing-card.css";
import { I18nTree } from "../i18n/I18n.jsx";
import BrandLogo from "../brand/BrandLogo.jsx";

function photoSrc(photo) {
    if (!photo) {
        return "";
    }
    return typeof photo === "string" ? photo : photo.src || "";
}

function displayTitle(listing) {
    const raw = String(listing?.title || "Объект").trim();
    return raw.replace(/\s+-\s+[^-]+$/u, "").trim() || raw;
}

function listingFacts(listing) {
    const facts = [];
    if (listing.attrs && typeof listing.attrs === "object") {
        for (const [label, value] of Object.entries(listing.attrs)) {
            if (label && value) {
                facts.push(`${label}: ${value}`);
            }
        }
        if (facts.length) {
            return facts;
        }
    }

    if (listing.metro) {
        facts.push(`Մետրո: ${listing.metro}`);
    }
    if (listing.rooms) {
        facts.push(`Սենյակներ: ${listing.rooms}`);
    }
    if (listing.area || listing.floorArea) {
        facts.push(`Ընդհանուր մակերես: ${listing.area || listing.floorArea}`);
    }
    if (listing.kitchenArea) {
        facts.push(`Խոհանոցի մակերես: ${listing.kitchenArea}`);
    }
    if (listing.floor) {
        facts.push(`Հարկ: ${listing.floorsCount ? `${listing.floor} из ${listing.floorsCount}` : listing.floor}`);
    }
    if (listing.bathroom) {
        facts.push(`Սանհանգույց: ${listing.bathroom}`);
    }
    if (listing.ceiling) {
        facts.push(`Առաստաղ: ${listing.ceiling}`);
    }

    if (facts.length) {
        return facts;
    }

    const blob = `${listing.title || ""}\n${listing.description || ""}`;
    const area = blob.match(/(\d+(?:[.,]\d+)?)\s*(մ²|м²|քմ|кв\.?\s*м)/i);
    const floor = blob.match(/(\d+\s*\/\s*\d+)\s*(հարկ|этаж)/i) || blob.match(/(\d+)\s*(հարկ|этаж)/i);
    const rooms = blob.match(/(\d+)\s*(սենյակ|комн)/i);

    if (rooms) {
        facts.push(`Սենյակներ: ${rooms[1]}`);
    }
    if (area) {
        facts.push(`Ընդհանուր մակերես: ${area[1]} ${area[2]}`);
    }
    if (floor) {
        facts.push(`Հարկ: ${floor[1]}`);
    }

    return facts;
}

export default function ShareListingCard({ listing, brand = "LEVEL HOME", fullPage = false }) {
    const photos = listing?.photos || [];
    const [index, setIndex] = useState(0);
    const [lightbox, setLightbox] = useState(false);
    const [touchX, setTouchX] = useState(null);
    const current = photos[index];
    const next = photos.length > 1 ? photos[(index + 1) % photos.length] : null;
    const facts = listingFacts(listing || {});

    const go = (step) => {
        if (!photos.length) {
            return;
        }
        setIndex((prev) => (prev + step + photos.length) % photos.length);
    };

    return (
        <I18nTree>
        <div className={`slc-page${fullPage ? " slc-full" : ""}`}>
            <article className="slc-card">
                <div className="slc-brand-wrap">
                    <BrandLogo className="slc-brand-logo" />
                    <span className="slc-brand">{brand}</span>
                </div>
                <h1 className="slc-title">{displayTitle(listing)}</h1>
                <div className="slc-topline">
                    <p className="slc-address">{listing?.address || ""}</p>
                    {listing?.price ? <p className="slc-price">{listing.price}</p> : null}
                </div>

                {current ? (
                    <div className="slc-gallery">
                        <div
                            className="slc-hero"
                            onTouchStart={(event) => setTouchX(event.changedTouches[0].clientX)}
                            onTouchEnd={(event) => {
                                if (touchX == null) {
                                    return;
                                }
                                const delta = event.changedTouches[0].clientX - touchX;
                                setTouchX(null);
                                if (Math.abs(delta) > 40) {
                                    go(delta < 0 ? 1 : -1);
                                }
                            }}
                        >
                            {photos.length > 1 ? <div className="slc-count">{photos.length} ФОТО</div> : null}
                            {photos.length > 1 ? (
                                <button type="button" className="slc-nav slc-nav-left" onClick={() => go(-1)} aria-label="Предыдущее">
                                    ‹
                                </button>
                            ) : null}
                            <button type="button" className="slc-hero-hit" onClick={() => setLightbox(true)}>
                                <img src={photoSrc(current)} alt={listing?.title || "Фото"} />
                            </button>
                            {photos.length > 1 ? (
                                <button type="button" className="slc-nav slc-nav-right" onClick={() => go(1)} aria-label="Следующее">
                                    ›
                                </button>
                            ) : null}
                        </div>
                        {next ? (
                            <div className="slc-peek" aria-hidden="true">
                                <img src={photoSrc(next)} alt="" />
                            </div>
                        ) : null}
                    </div>
                ) : null}

                {facts.length ? (
                    <div className="slc-facts">
                        {facts.map((line) => (
                            <p key={line}>{line}</p>
                        ))}
                    </div>
                ) : null}

                {listing?.description ? (
                    <p className="slc-text">
                        {listing.id ? `ID: ${listing.id}. ` : ""}
                        {listing.description}
                    </p>
                ) : null}
            </article>

            {lightbox && current ? (
                <div className="slc-lightbox" onClick={() => setLightbox(false)}>
                    <button type="button" className="slc-close" onClick={() => setLightbox(false)}>
                        ×
                    </button>
                    {photos.length > 1 ? (
                        <button
                            type="button"
                            className="slc-nav slc-nav-left slc-nav-light"
                            onClick={(event) => {
                                event.stopPropagation();
                                go(-1);
                            }}
                        >
                            ‹
                        </button>
                    ) : null}
                    <img src={photoSrc(photos[index])} alt="" onClick={(event) => event.stopPropagation()} />
                    {photos.length > 1 ? (
                        <button
                            type="button"
                            className="slc-nav slc-nav-right slc-nav-light"
                            onClick={(event) => {
                                event.stopPropagation();
                                go(1);
                            }}
                        >
                            ›
                        </button>
                    ) : null}
                    <div className="slc-lightbox-index">
                        {index + 1} / {photos.length}
                    </div>
                </div>
            ) : null}
        </div>
        </I18nTree>
    );
}
