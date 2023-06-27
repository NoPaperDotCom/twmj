import React from "react";
import QRCode from "react-qr-code";

import {
  ColorBackground,
  Flex,
  Block,
  Text,
  Icon,
  Logo,
  OutlineBtn,
  FillBtn,
  Spin
} from "de/components";
import { share } from "de/utils";

import styles from "@/styles/global";

export const Tag = ({ text, highlight = false }) => {
  const _color = styles.color.antisimilar1;
  return (
    <Block
      size={"auto"}
      inline
      rounded
      padding={[1, 0.25]}
      border={{ w: 2, c: _color }}
      animations={styles.animation.fadeIn}
    >
      {(highlight) ? <ColorBackground color={_color} /> : null}
      <Text size={0.75} weight={1} color={(highlight) ? styles.color.white : _color}>{text}</Text>
    </Block>
  );
};

export const Loading = () => {
  return (
    <Flex size="100%" padding={10}>
      <Spin size={12} color={{ s: 0.25, l: 0.5 }} />
    </Flex>
  );
}

export const HomeBtn = ({ t, router }) => (
  <FillBtn
    padding={1}
    rounded="()"
    size={["100%", "auto"]}
    color={styles.color.antitri}
    focusScaleEffect={0.8}
    onClick={() => router.replace("/")}
  >
    <Text size={1} weight={2} color={styles.color.white}>{t("home")}</Text>
  </FillBtn>
);

export const PolicyAndSignOutTag = ({ t, router, onSignOut }) => (
  <Flex size={["100%", "auto"]}>
    <OutlineBtn
      size={"auto"}
      focusScaleEffect={0.8}
      onClick={() => router.push("/policy")}
    >
      <Text size={0.75} weight={1} color={styles.color.lighten}>#{t("policy")}</Text>
    </OutlineBtn>
    <OutlineBtn
      size={"auto"}
      focusScaleEffect={0.8}
      onClick={() => {
        window.localStorage.removeItem("twmj:session-token");
        onSignOut();
      }}
    >
      <Text size={0.75} weight={1} color={styles.color.lighten}>#{t("signout")}</Text>
    </OutlineBtn>
  </Flex>
);

export const InviteTag = ({ title, shareLink, inviteText }) => {
  return (
    <>
      <Block size={["100%", "auto"]}>
        <Text size={styles.textSize.medium} weight={2} color={styles.color.white}>{title}</Text>
      </Block>
      <Block size={styles.imageSize.qrcode} rounded="{}" padding={0.5} animations={styles.animation.fadeIn}>
        <ColorBackground color={styles.color.white} />
        <QRCode
          size={256}
          style={{ height: "auto", maxWidth: "100%", width: "100%" }}
          value={shareLink}
          viewBox={`0 0 256 256`}
        />
      </Block>
      <FillBtn onClick={() => share({ socialMedia: "whatsapp", url: shareLink })} rounded padding={1} color={styles.color.similar2} hoverColorEffect focusScaleEffect animations={styles.animation.fadeIn}>
        <Logo name="whatsapp" size={1.5} color={styles.color.white}/>&nbsp;&nbsp;
        <Text size={1} weight={2} color={styles.color.white}>{`WHATSAPP${inviteText}`}</Text>
      </FillBtn>
    </>
  );
};


