import React from "react";
import "./Header.css";
import { I18nTree, LanguageSwitch } from "../i18n/I18n.jsx";
import BrandLogo from "../brand/BrandLogo.jsx";

function Header({
  user,
  onLogout,
  onMainMenu,
  subtitle = "ակտիվ AI կապ",
  showVerified = true,
}) {
  // Եթե օգտատերը մուտք գործած չէ, Header-ը չի ցուցադրվում։
  if (!user) {
    return null;
  }

  const username =
    user.username ||
    user.name ||
    user.email?.split("@")[0] ||
    "User";

  const firstLetter = username.charAt(0).toUpperCase();

  // Կանչում ենք Auth.jsx-ից փոխանցված logout ֆունկցիան։
  const handleLogout = async () => {
    if (typeof onLogout !== "function") {
      console.error("Logout ֆունկցիան փոխանցված չէ Header-ին։");
      return;
    }

    await onLogout();
  };

  return (
    <I18nTree>
    <header className="app-header">
      {/* Լոգո և հավելվածի անվանում */}
      <div className="header-logo">
        <div className="header-logo-badge" aria-hidden="true">
          <BrandLogo className="header-logo-photo" />
        </div>

        <div className="header-brand-info">
          <div className="header-brand-title">
            <span>LEVEL HOME</span>
            <span className="header-brand-chat">Агент 1</span>
          </div>

          <div className="header-brand-subtitle">
            <span className="header-brand-subtitle-dot" />
            <span>{subtitle}</span>
          </div>
        </div>
      </div>

      {/* Օգտատիրոջ տվյալներ և դուրս գալու կոճակ */}
      <div className="header-user">
        <LanguageSwitch compact />
        <div
          className="header-profile"
          title={`@${username}`}
        >
          <div className="header-avatar-container">
            <div className="header-avatar">
              {firstLetter}
            </div>

            <span
              className="header-avatar-status"
              title="Առցանց"
            />
          </div>

          <div className="header-user-info">
            <div className="header-user-top">
              <strong>@{username}</strong>

              {showVerified && (
                <svg
                  className="header-verified-icon"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-label="Verified"
                >
                  <circle
                    cx="12"
                    cy="12"
                    r="10"
                    fill="currentColor"
                    fillOpacity="0.2"
                  />
                  <path d="m9 12 2 2 4-4" />
                </svg>
              )}
            </div>

            <span>
              {user.statusText || "առցանց"}
            </span>
          </div>
        </div>

        {onMainMenu ? (
          <button
            type="button"
            className="logout-button"
            onClick={onMainMenu}
          >
            Գլխավոր մենյու
          </button>
        ) : null}

        <button
          type="button"
          className="logout-button"
          onClick={handleLogout}
          aria-label="Դուրս գալ"
        >
          <svg
            className="logout-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>

          <span>Դուրս գալ</span>
        </button>
      </div>
    </header>
    </I18nTree>
  );
}

export default Header;