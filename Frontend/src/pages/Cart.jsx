import { useUser } from "../contexts/AuthContext";
import { useLanguage } from "../contexts/LanguageContext";

export default function Cart() {
  const { user } = useUser();
  const { t } = useLanguage();
  return (
    <div className="as-container as-page">
      <div className="as-card">
        <h2 className="as-title">{t.customerCart}</h2>
        <div className="as-muted">Cart placeholder. User: {user?.email}</div>
      </div>
    </div>
  );
}
