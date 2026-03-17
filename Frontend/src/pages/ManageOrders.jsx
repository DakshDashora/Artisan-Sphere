import { useLanguage } from "../contexts/LanguageContext";

export default function ManageOrders() {
  const { t } = useLanguage();
  return (
    <div className="as-container as-page">
      <div className="as-card">
        <h2 className="as-title">{t.manageOrders}</h2>
        <div className="as-muted">Orders list placeholder.</div>
      </div>
    </div>
  );
}
