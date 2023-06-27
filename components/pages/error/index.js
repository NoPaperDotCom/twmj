import React from "react";
import { BannerLayout } from "./../default";

import {
  Block,
  Text
} from "de/components";

import { HomeBtn } from "@/components/elements";
import styles from "@/styles/global";

export default function Error({ t, router, error }) {
  const _errorText = t(`error:${error.text}`, { message: error.message });
  return (
    <BannerLayout>
      <Block size={["100%", "auto"]}>
        <Text size={styles.textSize.medium} weight={2} color={{ h: -120, s: 0.6, l: 0.65 }}>{_errorText}</Text>
      </Block>
      <HomeBtn t={t} router={router} />
    </BannerLayout>
  )
}
