import React from "react";
import { BannerLayout } from "./../default";

import {
  Flex,
  Block,
  Text,
  FillBtn
} from "de/components";

import { PolicyAndSignOutTag } from "@/components/elements";
import styles from "@/styles/global";

export default function NotPurchase({ t, router, userRef, setSetting }) {
  return (
    <BannerLayout>
      <Block size={["100%", "auto"]}>
        <Text size={styles.textSize.medium} weight={2} color={styles.color.white}>{t("expired")}</Text>
      </Block>
      <Flex size={["100%", "auto"]}>
        <FillBtn
          size={styles.layout.column(0.5)}
          onClick={() => router.replace(`/checkout/stripe?sessionToken=${userRef.current.sessionToken}&days=3`)}
          rounded={styles.groupbtnshape.start}
          padding={1}
          color={styles.color.antitri}
          hoverColorEffect
          focusScaleEffect
        >
          <Text size={1} weight={2} color={styles.color.white}>{t("buy3day")}</Text>
        </FillBtn>
        <FillBtn
          size={styles.layout.column(0.5)}
          onClick={() => router.replace(`/checkout/stripe?sessionToken=${userRef.current.sessionToken}&days=30`)}
          rounded={styles.groupbtnshape.end}
          padding={1}
          color={styles.color.darken}
          hoverColorEffect
          focusScaleEffect
        >
          <Text size={1} weight={2} color={styles.color.white}>{t("buy1month")}</Text>
        </FillBtn>
      </Flex>
      <PolicyAndSignOutTag t={t} router={router} onSignOut={() => setSetting(old => ({ ...old, status: "landing" }))} />
    </BannerLayout>
  )
}
