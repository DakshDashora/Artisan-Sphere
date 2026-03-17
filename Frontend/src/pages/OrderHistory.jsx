import { useLanguage } from "../contexts/LanguageContext";

export default function OrderHistory() {
  const { t } = useLanguage();
  return (
    <div className="as-container as-page">
      <div className="as-card">
        <h2 className="as-title">{t.orderHistory}</h2>
        <div className="as-muted">Order history placeholder.</div>
      </div>
    </div>
  );
}
