import { useState } from "react";
import "./auth-modal_agency.css";
import { I18nTree } from "../i18n/I18n.jsx";

export default function AuthModal_agency({
    isOpen = true,
    onClose,
    onApplyKey,
    onRequestKey,
}) {
    const [accessKey, setAccessKey] = useState("");
    const [email, setEmail] = useState("");
    const [agreed, setAgreed] = useState(false);
    const [busy, setBusy] = useState(false);
    const [status, setStatus] = useState(null);

    if (!isOpen) return null;

    const handleApply = (e) => {
        e.preventDefault();
        if (accessKey.trim() && onApplyKey) {
            onApplyKey(accessKey.trim());
        }
    };

    const handleRequest = async (e) => {
        e.preventDefault();
        setStatus(null);

        if (!agreed) {
            setStatus({ ok: false, text: "Подтвердите согласие с условиями" });
            return;
        }

        if (!email.trim()) {
            setStatus({ ok: false, text: "Укажите ваш Gmail" });
            return;
        }

        if (!onRequestKey) {
            return;
        }

        setBusy(true);
        const result = await onRequestKey(email.trim());
        setBusy(false);

        if (result?.message) {
            setStatus({ ok: Boolean(result.ok), text: result.message });
        }
    };

    return (
        <I18nTree>
        <div className="az-modal-overlay" onClick={onClose}>
            <div className="az-modal-card" onClick={(e) => e.stopPropagation()}>
                <button
                    type="button"
                    className="az-modal-close"
                    onClick={onClose}
                    aria-label="Закрыть"
                >
                    ✕
                </button>

                <div className="az-modal-section">
                    <h2 className="az-modal-title">ВВЕСТИ КЛЮЧ:</h2>
                    <p className="az-modal-subtitle">
                        Если у вас уже есть ключ доступа.
                    </p>

                    <form onSubmit={handleApply} className="az-input-row">
                        <input
                            type="text"
                            placeholder="ваш ключ доступа"
                            value={accessKey}
                            onChange={(e) => setAccessKey(e.target.value)}
                            className="az-input"
                            required
                        />
                        <button type="submit" className="az-btn-green-sm">
                            Применить
                        </button>
                    </form>
                </div>

                <div className="az-modal-divider" />

                <div className="az-modal-section">
                    <h2 className="az-modal-title">ПОЛУЧИТЬ КЛЮЧ:</h2>
                    <p className="az-modal-subtitle">
                        Если вы не получали или потеряли ключ.
                    </p>

                    <form onSubmit={handleRequest} className="az-request-form">
                        <input
                            type="email"
                            placeholder="укажите ваш Gmail"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="az-input az-input-wide"
                            required
                            disabled={busy}
                        />

                        <label className="az-checkbox-row">
                            <input
                                type="checkbox"
                                checked={agreed}
                                onChange={(e) => setAgreed(e.target.checked)}
                            />
                            <span>
                                Я согласен со всеми{" "}
                                <a href="#" onClick={(e) => e.preventDefault()}>
                                    условиями соглашения
                                </a>
                                .
                            </span>
                        </label>

                        {status ? (
                            <p
                                style={{
                                    margin: 0,
                                    fontSize: 12,
                                    color: status.ok ? "#15803d" : "#b91c1c",
                                }}
                            >
                                {status.text}
                            </p>
                        ) : null}

                        <button type="submit" className="az-btn-request" disabled={busy}>
                            {busy ? "ОТПРАВЛЯЕМ..." : "ЗАПРОСИТЬ КЛЮЧ"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
        </I18nTree>
    );
}
