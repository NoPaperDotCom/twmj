import React from "react";
import { BannerLayout } from "./../default";

import {
  Text,
  FillBtn
} from "de/components";

import styles from "@/styles/global";

export default function Landing({ t, router }) {
  return (
    <BannerLayout>
      <FillBtn
        onClick={(evt) => {
          evt.target.currentTarget = true;
          return router.replace("/oauth/google?requestLink=1");
        }}
        rounded
        padding={1}
        color={styles.color.similar2}
        hoverColorEffect
        focusScaleEffect
      >
        <Text size={1} weight={2} color={styles.color.white}>{t("google-signin")}</Text>
      </FillBtn>
    </BannerLayout>
  )
}
