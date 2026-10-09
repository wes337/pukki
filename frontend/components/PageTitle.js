import useTranslate from "../hooks/useTranslate";
import Head from "next/head";

export default function PageTitle({ children }) {
  const translate = useTranslate();
  return <Head><title>{children ? `Pukki | ${translate(children)}` : "Pukki"}</title></Head>;
}
