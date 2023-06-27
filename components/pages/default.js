import React from "react";

import {
  Flex,
  Block,
  ImageBackground
} from "de/components";

import { TWMJLogo } from "@/components/logo";
import styles from "@/styles/global";

export function BannerLayout({ children }) {
  return (
    <Flex itemPosition={["center", "center"]} size={["100%", "auto"]} gap={0.75} padding={[10, 5, 0, 5]}>
      <Block size={styles.imageSize.large} padding={0}>
        <ImageBackground size="cover" src="/imgs/logo.png" />
      </Block>
      <TWMJLogo />
      {children}
    </Flex>
  )
}

export function NavbarLayout({ children }) {
}