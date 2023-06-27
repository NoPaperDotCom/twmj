import React from "react";
import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

import Error from "@/components/pages/error";

export default function ErrorPage({ locale, error }) {
  const { t } = useTranslation(["common", "app", "error"]);
  const _router = useRouter();
  return (<Error t={t} router={_router} error={error} />);
}

export async function getServerSideProps({ locale, query, req, res }) {
  const { message = "internal_500_unknown" } = query;
  const [errorText, errorCode = 500, errorMessage = ""] = message.split("_");
  return {
    props: {
      ...(await serverSideTranslations(locale, [
        "common",
        "app",
        "error"
      ])),
      locale,
      error: { text: errorText, code: errorCode, message: errorMessage }
    }
  };
};
