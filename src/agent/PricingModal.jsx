import { PACKAGES } from './packages.js';
import './pricing-modal.css';
import { I18nTree } from '../i18n/I18n.jsx';

function formatAmd(value) {
    return `${Number(value || 0).toLocaleString('hy-AM')} ֏`;
}

export default function PricingModal({
    isOpen,
    onClose,
    onSelectPlan,
    remainingCount = 0,
    discountPercent = 0,
    packages = PACKAGES,
}) {
    if (!isOpen) return null;

    const isBlocked = remainingCount <= 0;
    const discount = Number(discountPercent) || 0;

    const handleClose = () => {
        if (onClose) onClose();
    };

    return (
        <I18nTree>
        <div className="az-pricing-overlay" onClick={handleClose}>
            <div className="az-pricing-card" onClick={(e) => e.stopPropagation()}>
                <button
                    type="button"
                    className="az-modal-close"
                    onClick={handleClose}
                    aria-label="Закрыть"
                >
                    ✕
                </button>

                <div className="az-pricing-header">
                    <h2 className="az-pricing-title">Стоимость и тарифы</h2>
                    <p className="az-pricing-subtitle">
                        Три пакета обработок. Админ активирует выбранный пакет по 2-му ID.
                    </p>

                    {discount > 0 && (
                        <div className="az-discount-chip">
                            🔥 Скидка администратора: -{discount}% на все пакеты
                        </div>
                    )}
                </div>

                {isBlocked && (
                    <div className="az-pricing-blocked">
                        ⚠️ Остаток поисков: 0. Покажите админу 2-й ID, чтобы активировать пакет.
                    </div>
                )}

                <div className="az-pricing-grid">
                    {packages.map((plan) => {
                        const finalPrice = discount > 0
                            ? Math.round(plan.priceAMD * (1 - discount / 100))
                            : (plan.finalPriceAMD || plan.priceAMD);
                        const hasDiscount = finalPrice !== plan.priceAMD;

                        return (
                            <div
                                key={plan.id}
                                className={`az-plan-card ${plan.popular ? 'popular' : ''}`}
                            >
                                <div className="az-plan-badge">{plan.badgeRu || plan.badge}</div>
                                <div>
                                    <h3 className="az-plan-name">{plan.nameRu || plan.name}</h3>
                                    <div className="az-plan-price-box">
                                        <div className="az-plan-price">
                                            {hasDiscount ? (
                                                <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                                                    <span style={{ textDecoration: 'line-through', fontSize: '16px', color: '#94a3b8' }}>
                                                        {formatAmd(plan.priceAMD)}
                                                    </span>
                                                    <span style={{ color: '#ef4444' }}>{formatAmd(finalPrice)}</span>
                                                </div>
                                            ) : (
                                                formatAmd(plan.priceAMD)
                                            )}
                                        </div>
                                        <div className="az-plan-per-item">{plan.perItemRu || plan.unitPrice}</div>
                                    </div>
                                    <ul className="az-plan-features">
                                        {(plan.featuresRu || []).map((feat) => (
                                            <li key={feat} className="az-plan-feature-item">✓ {feat}</li>
                                        ))}
                                    </ul>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => {
                                        if (onSelectPlan) onSelectPlan(plan);
                                        handleClose();
                                    }}
                                    className={`az-plan-btn ${plan.popular ? 'popular' : ''}`}
                                >
                                    Выбрать пакет
                                </button>
                            </div>
                        );
                    })}
                </div>

                <div className="az-pricing-footer">
                    После оплаты админ включает пакет в базе. Поиски списываются с остатка этого пакета.
                </div>
            </div>
        </div>
        </I18nTree>
    );
}

export { PricingModal };
