import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { createElement, isValidElement, Children, cloneElement } from "react";
import { hyToRu } from "./hyToRu.js";
import { ruToHy } from "./ruToHy.js";
import "./language-switch.css";

const STORAGE_KEY = "agent1_lang";
const I18nContext = createContext({
    lang: "hy",
    setLang: () => {},
    t: (value) => value,
});

let liveTranslate = (value) => value;

export function t(value, vars) {
    return liveTranslate(value, vars);
}

function interpolate(text, vars) {
    if (!vars || typeof text !== "string") {
        return text;
    }
    return text.replace(/\{(\w+)\}/g, (_, key) =>
        vars[key] == null ? `{${key}}` : String(vars[key])
    );
}

function normalize(value) {
    return String(value).replace(/\s+/g, " ").trim();
}

function sortedKeys(dict) {
    return Object.keys(dict)
        .filter((key) => key.length >= 3)
        .sort((a, b) => b.length - a.length);
}

const hyKeys = sortedKeys(hyToRu);
const ruKeys = sortedKeys(ruToHy);

function applyDict(dict, keys, source) {
    const variants = [source, source.trim(), normalize(source)];
    for (const variant of variants) {
        if (dict[variant]) {
            return dict[variant];
        }
    }

    let out = source;
    let changed = false;
    for (const key of keys) {
        if (out.includes(key)) {
            out = out.split(key).join(dict[key]);
            changed = true;
        }
    }
    return changed ? out : source;
}

function lookup(lang, value) {
    if (value == null) {
        return value;
    }
    const source = String(value);
    if (lang === "ru") {
        return applyDict(hyToRu, hyKeys, source);
    }
    return applyDict(ruToHy, ruKeys, source);
}

function isTranslatable(value) {
    return typeof value === "string" && /[\u0530-\u058FА-Яа-яЁё]/.test(value);
}

const TEXT_PROPS = ["placeholder", "title", "alt", "aria-label", "ariaLabel", "label"];

function translateTree(node, translate) {
    if (node == null || typeof node === "boolean") {
        return node;
    }
    if (typeof node === "string") {
        return isTranslatable(node) ? translate(node) : node;
    }
    if (Array.isArray(node)) {
        return node.map((item, index) => {
            const next = translateTree(item, translate);
            if (isValidElement(next) && next.key == null) {
                return cloneElement(next, { key: index });
            }
            return next;
        });
    }
    if (!isValidElement(node)) {
        return node;
    }

    const nextProps = { ...node.props };
    for (const prop of TEXT_PROPS) {
        if (isTranslatable(nextProps[prop])) {
            nextProps[prop] = translate(nextProps[prop]);
        }
    }
    if (nextProps.children != null) {
        nextProps.children = translateTree(nextProps.children, translate);
    }
    return cloneElement(node, nextProps);
}

export function I18nTree({ children }) {
    const { t: translate } = useI18n();
    return translateTree(children, translate);
}

export function I18nProvider({ children }) {
    const [lang, setLangState] = useState(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            return saved === "ru" || saved === "hy" ? saved : "hy";
        } catch {
            return "hy";
        }
    });

    const setLang = useCallback((next) => {
        const value = next === "ru" ? "ru" : "hy";
        setLangState(value);
        try {
            localStorage.setItem(STORAGE_KEY, value);
        } catch {
            /* ignore */
        }
    }, []);

    const translate = useCallback(
        (value, vars) => interpolate(lookup(lang, value), vars),
        [lang]
    );

    useEffect(() => {
        liveTranslate = translate;
        document.documentElement.lang = lang === "ru" ? "ru" : "hy";
        document.documentElement.dataset.lang = lang;
        return () => {
            liveTranslate = (value) => value;
        };
    }, [translate, lang]);

    const context = useMemo(
        () => ({ lang, setLang, t: translate }),
        [lang, setLang, translate]
    );

    return <I18nContext.Provider value={context}>{children}</I18nContext.Provider>;
}

export function useI18n() {
    return useContext(I18nContext);
}

export function LanguageSwitch({ compact = false }) {
    const { lang, setLang } = useI18n();

    return (
        <div className={`lang-switch${compact ? " lang-switch-compact" : ""}`} role="group" aria-label="Language">
            <button
                type="button"
                className={lang === "hy" ? "lang-btn on" : "lang-btn"}
                onClick={() => setLang("hy")}
            >
                HY
            </button>
            <button
                type="button"
                className={lang === "ru" ? "lang-btn on" : "lang-btn"}
                onClick={() => setLang("ru")}
            >
                RU
            </button>
        </div>
    );
}

export function withTree(element) {
    return createElement(I18nTree, null, element);
}
