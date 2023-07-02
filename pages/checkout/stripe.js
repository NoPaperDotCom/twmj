import React from "react";
import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import Parse from "@/utils/parse";

import {
  Flex,
  Block,
  Text
} from "de/components";

import { TWMJLogo } from "@/components/logo";
import { HomeBtn } from "@/components/elements";

import styles from "@/styles/global";
import AppError from "@/utils/error";

import { loadStripe } from "@stripe/stripe-js";
let _stripe = null;
let _stripePromise = null;

const _getStripeObj = () => {
  if (!_stripe) { _stripe = require("stripe")(process.env.STRIPE_SECRET_KEY); }
  return _stripe;
};

const _getStripePromise = () => {
  if (!_stripePromise) { _stripePromise = loadStripe(process.env.STRIPE_PUBLISHABLE_KEY); }
  return _stripePromise;
};

const _formatDate = (date) => `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth()+1).toString().padStart(2, '0')}/${date.getFullYear()}`;

export default function CheckoutIndexPage({ locale, recipt }) {
  const _router = useRouter();
  const { t } = useTranslation(["common", "app", "checkout"]);
  const _items = t("checkout:items", { returnObjects: true });
  const _recipt = t("checkout:recipt-content", { returnObjects: true, ...recipt, item: _items[recipt.item], startDate: _formatDate(new Date(recipt.startDate)), expiredDate: _formatDate(new Date(recipt.expiredDate)) });
  return (
    <Flex size={"auto"}>       
      <Flex size={["100%", "auto"]} gap={1} padding={[2, 6]}>
        <TWMJLogo />
        <Block size={["100%", "auto"]}>
          <Text size={styles.textSize.medium} weight={2} color={{ h: -120, s: 0.6, l: 0.65 }}>{t("checkout:recipt-message")}</Text> 
        </Block>
        <Block align="start" size={["100%", "auto"]} padding={0.5}>
          <Text size={styles.textSize.medium} weight={1} color={styles.color.white}>{_recipt.transactionId}</Text>
          <br />
          <Text size={styles.textSize.medium} weight={1} color={styles.color.white}>{_recipt.userName}</Text>
          <br />
          <Text size={styles.textSize.medium} weight={1} color={styles.color.white}>{_recipt.item}</Text>
          <br />
          <Text size={styles.textSize.medium} weight={1} color={styles.color.white}>{_recipt.cost}</Text>
          <br />
          <Text size={styles.textSize.medium} weight={1} color={styles.color.white}>{_recipt.startDate}</Text>   
          <br />
          <Text size={styles.textSize.medium} weight={1} color={styles.color.white}>{_recipt.expiredDate}</Text>  
          <br />
          <Text size={styles.textSize.medium} weight={1} color={styles.color.white}>{_recipt.remarks}</Text>        
        </Block>
        <HomeBtn t={t} router={_router} />
      </Flex>
    </Flex>
  )
};

export async function getServerSideProps({ params, query, locale, req, res }) {
  const { status = false, days = 3, sessionToken = false, sessionId = false } = query;
  const _locale = (!locale) ? "zh_hk" : locale;

  const _days = parseInt(days);
  const _proto = req.headers["x-forwarded-proto"] || (req.connection.encrypted ? "https" : "http");
  const _redirectURL = `${_proto}://${req.headers.host}/checkout/stripe`;

  try {
    // not a user or checkout cancelled
    if (!sessionToken || status === "cancelled") {
      return {
        redirect: {
          destination: "/",
          permanent: false
        }
      };
    }

    const { error, user } = await Parse.Cloud.run("getUser", { sessionToken });
    if (error) {
      return {
        redirect: {
          destination: "/",
          permanent: false
        }
      };    
    }

    const _stripeObj = _getStripeObj();

    // checkout success
    if (status === "success") {
      // no stripe session Id
      if (!sessionId) { throw new AppError({ text: "stripe-error", status: 500, message: "no stripe session id" }); }

      const _session = await _stripeObj.checkout.sessions.retrieve(sessionId);
      if (!_session || _session["payment_status"] !== "paid") { throw new AppError({ text: "stripe-error", status: 500, message: _session["payment_status"] }); }

      // set expired date / add transaction ......
      const { transaction, error } = await Parse.Cloud.run("purchased", {
        userId: user.objectId,
        method: "stripe",
        refNumber: _session.payment_intent,
        days: _days,
        item: (_days === 30) ? "online-one-month" : "online-three-days",
        price: _session.amount_total / 100,
        currency: _session.currency
      });
      
      return {
        props: {
          recipt: transaction,
          locale,
          ...(await serverSideTranslations(locale, ["common", "app", "checkout"]))
        }
      };
    }

    // create stripe checkout ...
    const _localeJson = require(`@/public/locales/${_locale}/checkout.json`);
    const _now = new Date();
    const _endDate = new Date()
    _endDate.setDate(_now.getDate() + _days);
 
    const _products = await Promise.all([
      _stripeObj.products.create({
        name: `${_localeJson.items[(_days === 30) ? "online-one-month" : "online-three-days"]} (${_formatDate(_now)} - ${_formatDate(_endDate)})`,
        description: _localeJson.terms.replace("{{link}}", `${_proto}://${req.headers.host}/policy`)
      })
    ]);

    const _prices = await Promise.all(
      _products.map(({ id }, i) =>
        _stripeObj.prices.create({
          product: id,
          unit_amount: ((_days === 30) ? 450 : 50) * 100,
          currency: "hkd"
        })
      )
    );

    // Create Checkout Sessions.
    const _session = await _stripeObj.checkout.sessions.create({
      line_items: _prices.map(({ id }) => ({
        price: id,
        quantity: 1
      })),
      customer_email: user.email,
      payment_method_types: ["card", "wechat_pay"],
      payment_method_options: {
        wechat_pay: {
          client: "web"
        }
      },
      mode: "payment",
      success_url: `${_redirectURL}?days=${_days}&status=success&sessionToken=${sessionToken}&sessionId={CHECKOUT_SESSION_ID}`,
      cancel_url: `${_redirectURL}?status=cancelled&sessionToken=${sessionToken}&sessionId={CHECKOUT_SESSION_ID}`
    });

    return {
      redirect: {
        destination: _session.url,
        permanent: false
      }
    };
  } catch (error) {
    return {
      redirect: {
        destination: `/error?message=${error.message}}`,
        permanent: false
      }
    };
  }
};
