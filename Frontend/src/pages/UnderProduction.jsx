
import { useLanguage } from "../contexts/LanguageContext";

export default function UnderProduction() {
  const { t } = useLanguage();

  return (
    <div className="as-container as-center">
      <div className="as-card as-center-content">
        <h1 className="as-section-title">
          {t.underProduction || "🚧 Page Under Production"}
        </h1>
        <p className="as-muted">
          {t.underProductionMsg || "We are working hard to bring this feature to you soon!"}
        </p>
      </div>
    </div>
  );
}
