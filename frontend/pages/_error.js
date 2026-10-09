import NextError from "next/error";
import PageTitle from "../components/PageTitle";

export default function ErrorPage(props) {
  return <>
    <NextError {...props} />
    <PageTitle>{props.statusCode === 404 ? "Page not found" : "Something went wrong"}</PageTitle>
  </>;
}

ErrorPage.getInitialProps = NextError.getInitialProps;
