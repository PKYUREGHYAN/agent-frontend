import { useEffect, useState } from "react";

export default function InstallApp() {
    const [installEvent, setInstallEvent] = useState(null);
    const [hidden, setHidden] = useState(false);

    const standalone =
        typeof window !== "undefined" &&
        (window.matchMedia("(display-mode: standalone)").matches ||
            window.navigator.standalone === true);

    const isIos =
        typeof navigator !== "undefined" &&
        /iphone|ipad|ipod/i.test(navigator.userAgent);

    useEffect(() => {
        const onPrompt = (event) => {
            event.preventDefault();
            setInstallEvent(event);
        };
        window.addEventListener("beforeinstallprompt", onPrompt);
        return () => window.removeEventListener("beforeinstallprompt", onPrompt);
    }, []);

    if (standalone || hidden) {
        return null;
    }

    const install = async () => {
        if (!installEvent) {
            return;
        }
        installEvent.prompt();
        await installEvent.userChoice;
        setInstallEvent(null);
        setHidden(true);
    };

    return (
        <div
            style={{
                marginTop: 18,
                padding: "12px 14px",
                borderRadius: 12,
                background: "rgba(15, 23, 42, 0.9)",
                border: "1px solid rgba(148, 163, 184, 0.35)",
                color: "#e2e8f0",
                fontSize: 13,
                lineHeight: 1.45,
                textAlign: "left",
            }}
        >
            <div style={{ fontWeight: 800, marginBottom: 6 }}>Agent 1 հավելված</div>
            {installEvent ? (
                <button
                    type="button"
                    onClick={install}
                    style={{
                        width: "100%",
                        border: 0,
                        borderRadius: 10,
                        padding: "10px 12px",
                        fontWeight: 800,
                        cursor: "pointer",
                        background: "#38bdf8",
                        color: "#0b111a",
                    }}
                >
                    Տեղադրել հեռախոսում
                </button>
            ) : isIos ? (
                <p style={{ margin: 0 }}>
                    Safari → Share → Add to Home Screen։ Հետո բացիր Agent 1 կոճակը, ոչ բրաուզերը։
                </p>
            ) : (
                <p style={{ margin: 0 }}>
                    Chrome → ⋮ → Add to Home screen / Install app։ Հետո բացիր Agent 1 կոճակը։
                </p>
            )}
        </div>
    );
}
