import { lazy, Suspense, useEffect, useState } from "react";

import {
    clearUiSession,
    readSavedPage,
    saveCurrentPage,
    usePageScroll,
} from "../services/uiSession.js";
import { AUTH_API_URL } from "../services/api.js";
import { AGENCY_API_URL } from "../services/api.js";
import { sendHouseListing } from "../services/sendHouseListing.js";
import { startSessionKeepAlive } from "../services/sessionAuth.js";
import { I18nTree } from "../i18n/I18n.jsx";

const Login = lazy(() => import("./Login.jsx"));
const Register = lazy(() => import("./Register.jsx"));
const MainMenu = lazy(() => import("./MainMenu.jsx"));
const Header = lazy(() => import("./Header.jsx"));

const PropertyType = lazy(() => import("../home/PropertyType.jsx"));
const ApartmentRentForm = lazy(() => import("../home/ApartmentRentForm.jsx"));
const HouseRentForm = lazy(() => import("../home/HouseRentForm.jsx"));
const HouseForm = lazy(() => import("../home/HouseForm.jsx"));
const CommercialHouseForm = lazy(() => import("../home/CommercialHouseForm.jsx"));
const ApartmentSaleForm = lazy(() => import("../home/ApartmentSaleForm.jsx"));
const HouseSaleForm = lazy(() => import("../home/HouseSaleForm.jsx"));

const AgencyModule = lazy(() => import("./AgencyModule.jsx"));
const TodoListAdmin = lazy(() => import("../adminList/TodoListAdmin.jsx"));
const PublicSharePage = lazy(() => import("../agent/PublicSharePage.jsx"));

function Loading() {
    return (
        <div
            style={{
                minHeight: "100vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: "Arial, sans-serif",
            }}
        >
            <I18nTree>Բեռնում...</I18nTree>
        </div>
    );
}

function readShareToken() {
    const params = new URLSearchParams(window.location.search);
    const fromQuery = params.get("share");
    if (fromQuery) {
        return fromQuery;
    }

    const fromPath = window.location.pathname.match(
        /\/(?:house\/\d+\/|share\/)([a-zA-Z0-9]+)/i
    );
    return fromPath ? fromPath[1] : "";
}

function Auth() {
    const shareToken = readShareToken();

    const getSavedUser = () => {
        const localUser = localStorage.getItem("currentUser");

        if (localUser) {
            try {
                return JSON.parse(localUser);
            } catch {
                localStorage.removeItem("currentUser");
            }
        }

        const sessionUser = sessionStorage.getItem("currentUser");

        if (sessionUser) {
            try {
                return JSON.parse(sessionUser);
            } catch {
                sessionStorage.removeItem("currentUser");
            }
        }

        return null;
    };

    const savedUser = getSavedUser();

    const [page, setPage] = useState(() => readSavedPage(Boolean(savedUser)));
    const [currentUser, setCurrentUser] = useState(savedUser);
    const [appLocked, setAppLocked] = useState(false);

    useEffect(() => {
        saveCurrentPage(page);
    }, [page]);

    useEffect(() => startSessionKeepAlive(), []);

    useEffect(() => {
        const token = localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken");
        if (!token) {
            return;
        }

        fetch(`${AUTH_API_URL}/me`, {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then((response) => response.json())
            .then((data) => {
                if (data.user?.role || data.user?.email) {
                    setCurrentUser((prev) => ({ ...prev, ...data.user }));
                    const storage = localStorage.getItem("currentUser") ? localStorage : sessionStorage;
                    const merged = { ...(savedUser || {}), ...data.user };
                    storage.setItem("currentUser", JSON.stringify(merged));
                }
            })
            .catch(() => {});
    }, []);

    useEffect(() => {
        const runtimeUrl = AGENCY_API_URL.replace(/\/api\/agency$/, "/api/runtime");
        const loadLock = () => {
            fetch(runtimeUrl)
                .then((response) => response.json())
                .then((data) => setAppLocked(Boolean(data.locked)))
                .catch(() => {});
        };
        loadLock();
        const timer = setInterval(loadLock, 8000);
        return () => clearInterval(timer);
    }, []);

    usePageScroll(page);

    const handleGoToRegister = () => {
        setPage("register");
    };

    const handleGoToLogin = () => {
        setPage("login");
    };

    const handleLoginSuccess = (loginData) => {
        if (loginData?.user) {
            setCurrentUser(loginData.user);
        }

        setPage("main-menu");
    };

    const handleLogout = async () => {
        const accessToken =
            localStorage.getItem("accessToken") ||
            sessionStorage.getItem("accessToken");

        const refreshToken =
            localStorage.getItem("refreshToken") ||
            sessionStorage.getItem("refreshToken");

        try {
            if (accessToken || refreshToken) {
                await fetch(`${AUTH_API_URL}/logout`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        ...(accessToken
                            ? { Authorization: `Bearer ${accessToken}` }
                            : {}),
                    },
                    body: JSON.stringify({ refreshToken }),
                });
            }
        } catch (error) {
            console.error("Backend-ի հետ կապի սխալ logout-ի ժամանակ:", error);
        } finally {
            localStorage.removeItem("currentUser");
            localStorage.removeItem("accessToken");
            localStorage.removeItem("refreshToken");
            sessionStorage.removeItem("currentUser");
            sessionStorage.removeItem("accessToken");
            sessionStorage.removeItem("refreshToken");
            clearUiSession();
            setCurrentUser(null);
            setPage("login");
        }
    };

    const handleBackToMainMenu = () => {
        setPage("main-menu");
    };

    const handleBackToPropertyType = () => {
        setPage("property-type");
    };

    const handlePropertyTypeContinue = (propertyData) => {
        if (
            propertyData.dealTypeId === "long-term" &&
            propertyData.categoryId === "apartments"
        ) {
            setPage("long-term-apartment");
            return;
        }

        if (
            propertyData.dealTypeId === "long-term" &&
            propertyData.categoryId === "houses"
        ) {
            setPage("long-term-house");
            return;
        }

        if (
            propertyData.dealTypeId === "daily" &&
            propertyData.categoryId === "apartments"
        ) {
            setPage("daily-apartment");
            return;
        }

        if (
            propertyData.dealTypeId === "daily" &&
            propertyData.categoryId === "houses"
        ) {
            setPage("daily-house");
            return;
        }

        if (
            propertyData.dealTypeId === "sale" &&
            propertyData.categoryId === "apartments"
        ) {
            setPage("sale-apartment");
            return;
        }

        if (
            propertyData.dealTypeId === "sale" &&
            propertyData.categoryId === "houses"
        ) {
            setPage("sale-house");
            return;
        }
    };

    const isHouseSection =
        page !== "login" &&
        page !== "register" &&
        page !== "activation" &&
        page !== "main-menu" &&
        page !== "agency-home";

    const isSuperAdmin = currentUser?.role === "super_admin";

    if (shareToken) {
        if (appLocked && !isSuperAdmin) {
            return (
                <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#060b13", color: "#fff", fontFamily: "Arial, sans-serif", padding: 24, textAlign: "center" }}>
                    <I18nTree>Ծրագիրը արգելափակված է Super Admin-ի կողմից։</I18nTree>
                </div>
            );
        }
        return (
            <Suspense fallback={<Loading />}>
                <PublicSharePage token={shareToken} />
            </Suspense>
        );
    }

    if (appLocked && !isSuperAdmin && page !== "login" && page !== "register") {
        return (
            <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, background: "#060b13", color: "#fff", fontFamily: "Arial, sans-serif", padding: 24, textAlign: "center" }}>
                <I18nTree>Ծրագիրը արգելափակված է Super Admin-ի կողմից։</I18nTree>
                <button type="button" onClick={handleLogout} style={{ background: "#1e3a5f", color: "#fff", border: "1px solid #3b82f6", borderRadius: 10, padding: "10px 18px", cursor: "pointer", fontWeight: 700 }}>
                    <I18nTree>Դուրս գալ</I18nTree>
                </button>
            </div>
        );
    }

    return (
        <Suspense fallback={<Loading />}>
            {page === "login" && (
                <Login
                    onRegister={handleGoToRegister}
                    onSuccess={handleLoginSuccess}
                />
            )}

            {page === "register" && (
                <Register
                    onLogin={handleGoToLogin}
                    onSuccess={handleLoginSuccess}
                />
            )}

            {page === "activation" && (
                <TodoListAdmin
                    onBack={handleBackToMainMenu}
                    user={currentUser}
                    appLocked={appLocked}
                    onAppLockChange={setAppLocked}
                />
            )}

            {page === "main-menu" && (
                <MainMenu
                    user={currentUser}
                    appLocked={appLocked}
                    onAppLockChange={setAppLocked}
                    onSelectHouses={() => setPage("property-type")}
                    onSelectAgency={() => setPage("agency-home")}
                    onSelectActivation={() => setPage("activation")}
                    onLogout={handleLogout}
                />
            )}

            {page === "agency-home" && (
                <AgencyModule onBackToMainMenu={handleBackToMainMenu} />
            )}

            {isHouseSection && (
                <div className="app-container">
                    <Header
                        user={currentUser}
                        onLogout={handleLogout}
                        onMainMenu={handleBackToMainMenu}
                    />

                    <main className="app-main-content">
                        {page === "property-type" && (
                            <PropertyType
                                onContinue={handlePropertyTypeContinue}
                                onBackToMainMenu={handleBackToMainMenu}
                            />
                        )}

                        {(page === "long-term-apartment" || page === "apartment-rent") && (
                            <ApartmentRentForm
                                dealType="Երկարաժամկետ վարձակալություն"
                                propertyType="Բնակարաններ"
                                onBack={handleBackToPropertyType}
                                onSave={(data) =>
                                    sendHouseListing("apartment-rent", {
                                        ...data,
                                        dealType: "Երկարաժամկետ վարձակալություն",
                                        propertyType: "Բնակարաններ",
                                    })
                                }
                            />
                        )}

                        {(page === "long-term-house" || page === "house-rent") && (
                            <HouseRentForm
                                dealType="Երկարաժամկետ վարձակալություն"
                                propertyType="Տուն"
                                onBack={handleBackToPropertyType}
                                onSave={(data) =>
                                    sendHouseListing("house-rent", {
                                        ...data,
                                        dealType: "Երկարաժամկետ վարձակալություն",
                                        propertyType: "Տուն",
                                    })
                                }
                            />
                        )}

                        {page === "daily-apartment" && (
                            <HouseForm
                                dealType="Օրական վարձակալություն"
                                propertyType="Բնակարաններ"
                                onBack={handleBackToPropertyType}
                                onSave={(data) =>
                                    sendHouseListing("daily-apartment", {
                                        ...data,
                                        dealType: "Օրական վարձակալություն",
                                        propertyType: "Բնակարաններ",
                                    })
                                }
                            />
                        )}

                        {page === "daily-house" && (
                            <CommercialHouseForm
                                dealType="Օրական վարձակալություն"
                                propertyType="Տուն"
                                onBack={handleBackToPropertyType}
                                onSave={(data) =>
                                    sendHouseListing("daily-house", {
                                        ...data,
                                        dealType: "Օրական վարձակալություն",
                                        propertyType: "Տուն",
                                    })
                                }
                            />
                        )}

                        {(page === "sale-apartment" || page === "apartment-sale") && (
                            <ApartmentSaleForm
                                dealType="Վաճառք"
                                propertyType="Բնակարաններ"
                                onBack={handleBackToPropertyType}
                                onSave={(data) =>
                                    sendHouseListing("apartment-sale", {
                                        ...data,
                                        dealType: "Վաճառք",
                                        propertyType: "Բնակարաններ",
                                    })
                                }
                            />
                        )}

                        {(page === "sale-house" || page === "house-sale") && (
                            <HouseSaleForm
                                dealType="Վաճառք"
                                propertyType="Տուն"
                                onBack={handleBackToPropertyType}
                                onSave={(data) =>
                                    sendHouseListing("house-sale", {
                                        ...data,
                                        dealType: "Վաճառք",
                                        propertyType: "Տուն",
                                    })
                                }
                            />
                        )}
                    </main>
                </div>
            )}
        </Suspense>
    );
}

export default Auth;
