import { useState } from "react";
import Home from "../agent/Home.jsx";
import ListingDemo from "../agent/ListingDemo.jsx";
import ClientView from "../agent/ClientView.jsx";
import PropertyCardView from "../agent/PropertyCardView.jsx";
import {
    getCurrentAgencyListing,
    updateSavedAgencyListing,
} from "../agent/agencyListings.js";

export default function AgencyModule({ onBackToMainMenu }) {
    const [view, setView] = useState("home");
    const [currentListing, setCurrentListing] = useState(() => getCurrentAgencyListing());

    const handleNavigateToListing = (payload) => {
        if (payload?.data) {
            setCurrentListing(payload.data);
            updateSavedAgencyListing(payload.data);
        }
        setView("listing");
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleOpenPhotos = () => {
        setView("photos");
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleOpenCard = () => {
        setView("card");
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleBackToListing = () => {
        setView("listing");
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleBackToHome = () => {
        setView("home");
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleUpdateListing = (nextData) => {
        setCurrentListing((prev) => {
            const merged = { ...(prev || {}), ...(nextData || {}) };
            updateSavedAgencyListing(merged);
            return merged;
        });
    };

    return (
        <div className="agency-module-root" style={{ minHeight: "100vh", background: "#060b13", color: "#ffffff" }}>
            {view === "home" && (
                <Home
                    onNavigateToListing={handleNavigateToListing}
                    onBackToMainMenu={onBackToMainMenu}
                />
            )}

            {view === "listing" && (
                <ListingDemo
                    listingData={currentListing}
                    onReset={() => {}}
                    onBackToHome={handleBackToHome}
                    onOpenPhotos={handleOpenPhotos}
                    onOpenCard={handleOpenCard}
                />
            )}

            {view === "photos" && (
                <ClientView
                    listingData={currentListing}
                    onUpdateListing={handleUpdateListing}
                    onBackToListing={handleBackToListing}
                />
            )}

            {view === "card" && (
                <PropertyCardView
                    listingData={currentListing}
                    onUpdateListing={handleUpdateListing}
                    onBackToListing={handleBackToListing}
                />
            )}
        </div>
    );
}
