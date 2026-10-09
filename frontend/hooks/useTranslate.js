import { useRouter } from "next/router";
import i18n from "../i18n";
import { translateMessage } from "../i18n/translate.mjs";

export default function useTranslate() {
  const router = useRouter();
  const { locale } = router;

  return (text, variables) => translateMessage(i18n, locale, text, variables);
}
