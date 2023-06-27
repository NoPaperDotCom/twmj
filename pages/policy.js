import React from "react";
import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

import {
  Flex,
  Block,
  Text
} from "de/components";

import { TWMJLogo } from "@/components/logo";
import { HomeBtn } from "@/components/elements";
 
import styles from "@/styles/global";

export default function Policy({ locale }) {
  const { t } = useTranslation(["common", "app", "policy"]);
  const _router = useRouter();
  const _policy = t("policy:terms", { returnObjects: true });
  return (
    <Flex size={"auto"}>
      <Flex size={["100%", "auto"]} gap={1} padding={[2, 6]}>
        <TWMJLogo />
        {
          _policy.map(({ title, content }, idx) => 
            <Block key={idx} align="start" size={["100%", "auto"]}>
              <Text size={styles.textSize.medium} weight={2} color={styles.color.white}>{title}</Text>
              <br />
              <Text size={styles.textSize.small} weight={1} color={styles.color.white}>{content}</Text>
            </Block>
          )
        }
        <HomeBtn t={t} router={_router} />
      </Flex>
    </Flex>
  )
}

export async function getServerSideProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, [
        "common",
        "app",
        "policy"
      ]))
    }
  };
};
