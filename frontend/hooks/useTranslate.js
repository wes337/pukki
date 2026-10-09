import { useRouter } from "next/router";
import i18n from "../i18n";

export default function useTranslate() {
  const router = useRouter();
  const { locale } = router;

  const translate = (text, variables) => {
    try {
      if (variables) {
        return i18n[text][locale](variables);
      }
      return i18n[text][locale] || "";
    } catch {
      return text || "";
    }
  };

  return translate;
}
