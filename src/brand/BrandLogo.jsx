const LOGO_SRC = "/images/level-home-logo.jpg";

export default function BrandLogo({
    alt = "LEVEL HOME • Агент 1",
    className = "",
}) {
    return (
        <img
            src={LOGO_SRC}
            alt={alt}
            className={`brand-logo-img ${className}`.trim()}
        />
    );
}

export { LOGO_SRC };
