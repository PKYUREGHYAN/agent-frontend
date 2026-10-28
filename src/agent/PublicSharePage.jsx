import { useEffect, useState } from "react";
import { AGENCY_API_URL } from "../services/api.js";
import { authFetch } from "../services/sessionAuth.js";
import ShareListingCard from "./ShareListingCard.jsx";
import "./share-listing-card.css";
import { I18nTree } from "../i18n/I18n.jsx";

export default function PublicSharePage({ token }) {
    const [state, setState] = useState({ loading: true, expired: false, share: null, message: "", forever: false });

    useEffect(() => {
        let cancelled = false;

        (async () => {
            try {
                const response = await fetch(`${AGENCY_API_URL}/share/${encodeURIComponent(token)}`);
                const data = await response.json().catch(() => ({}));
                if (cancelled) {
                    return;
                }

                if (response.ok && data.share?.listing) {
                    setState({ loading: false, expired: false, share: data.share, message: "", forever: false });
                    return;
                }

                if (response.status === 410 || data.expired) {
                    const adminResponse = await authFetch(
                        `${AGENCY_API_URL}/share-admin/by-token/${encodeURIComponent(token)}`
                    );
                    const adminData = await adminResponse.json().catch(() => ({}));
                    if (!cancelled && adminResponse.ok && adminData.share?.listing) {
                        setState({
                            loading: false,
                            expired: false,
                            share: adminData.share,
                            message: "",
                            forever: true,
                        });
                        return;
                    }

                    setState({
                        loading: false,
                        expired: true,
                        share: null,
                        message: data.message || "Այս հղումը 3 օր հետո փակվել է",
                        forever: false,
                    });
                    return;
                }

                setState({
                    loading: false,
                    expired: true,
                    share: null,
                    message: data.message || "Հղումը չի գտնվել",
                    forever: false,
                });
            } catch {
                if (!cancelled) {
                    setState({
                        loading: false,
                        expired: true,
                        share: null,
                        message: "Հղումը չհաջողվեց բացել",
                        forever: false,
                    });
                }
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [token]);

    if (state.loading) {
        return (
            <I18nTree>
            <div className="slc-page slc-full">
                <article className="slc-card">Բեռնում...</article>
            </div>
            </I18nTree>
        );
    }

    if (state.expired || !state.share?.listing) {
        return (
            <I18nTree>
            <div className="slc-page slc-full">
                <article className="slc-card">
                    <h1 className="slc-title">Հղումը փակ է</h1>
                    <p className="slc-text">{state.message || "Այս հղումը 3 օր հետո անհետացել է հաճախորդի մոտ։"}</p>
                </article>
            </div>
            </I18nTree>
        );
    }

    return <ShareListingCard listing={state.share.listing} brand="Agent_1" fullPage />;
}
