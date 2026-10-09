import useTranslate from "../hooks/useTranslate";
import NextError from "next/error";
import PageTitle from "../components/PageTitle";

export default function ErrorPage(props) {
  const translate = useTranslate();
  return <>
    <NextError {...props} title={translate(props.statusCode === 404 ? "Page not found" : "Something went wrong")} />
    <PageTitle>{props.statusCode === 404 ? "Page not found" : "Something went wrong"}</PageTitle>
  </>;
}

ErrorPage.getInitialProps = NextError.getInitialProps;
