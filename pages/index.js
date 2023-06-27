import React from "react";
import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { callParseMethod } from "@/utils/parse";
import AppError from "@/utils/error";

import { Loading } from "@/components/elements";
import Landing from "@/components/pages/landing";
import NotPurchase from "@/components/pages/notpurchase";
import { NewGame, InGame } from "@/components/pages/game";

export default function Index({ gameId }) {
  const { t } = useTranslation(["common", "app", "index"]);
  const _router = useRouter();
  const _userRef = React.useRef({});
  const [_setting, _setSetting] = React.useState({ status: "loading", game: false, rounds: [] });

  React.useEffect(() => {
    let _abortController = new AbortController();
    const _sessionToken = window.localStorage.getItem("twmj:session-token");
    if (!_sessionToken || _sessionToken.length === 0) {
      if (gameId) { _router.replace(`/oauth/google?requestLink=1&gameId=${gameId}`); }  
      _setSetting(old => ({ ...old, status: "landing" }));
    } else {
      callParseMethod("getUser", { sessionToken: _sessionToken }, _abortController)
      .then(({ status, user, game, error }) => {
        if (status === "unauthorized") {
          window.localStorage.removeItem("twmj:session-token")
          if (gameId) { _router.replace(`/oauth/google?requestLink=1&gameId=${gameId}`); }
          throw new AppError({ text: "session-invalidation", status: 401, message: error });
        }

        if (error) { throw new AppError({ text: "parse-error", status: 500, message: error }); }

        _userRef.current = { ...user, expired: (status === "expired") };
        if (gameId) { return callParseMethod("getGame", { sessionToken: _sessionToken, gameId }, _abortController); }
        if (game && game.objectId.length > 0) { return callParseMethod("getGame", { sessionToken: _sessionToken, gameId: game.objectId }, _abortController); }
        return { game: false };
      })
      .then(({ status, game, rounds }) => {
        if (!game || status === "expired") {
          if (_userRef.current.expired) { throw new AppError({ text: "notpurchase", status: 401, message: "expired" }); }
          return _setSetting(old => ({ ...old, status: "newgame" }));
        }

        if (_userRef.current.expired && _userRef.current.objectId === game.creatorId) { throw new AppError({ text: "notpurchase", status: 401, message: "expired" }); }
        const _rounds = Array(rounds[rounds.length - 1].roundNumber);
        rounds.forEach(r => {
          _rounds[r.roundNumber - 1] = r;
          return;
        });

        return _setSetting(old => ({ ...old, status: "ingame", game, rounds: _rounds }));
      })
      .catch(error => {
        if (error.message.indexOf("session-invalidation") !== -1) { return _setSetting(old => ({ ...old, status: "landing" })); }
        if (error.message.indexOf("notpurchase") !== -1){ return _setSetting(old => ({ ...old, status: "notpurchase" })); }
        return _router.replace(`/error?message=${error.message}`);
      });
    }

    return () => _abortController.abort();
  }, [gameId]);

  
  if (_setting.status === "landing") {
    return <Landing t={t} router={_router} />
  }

  if (_setting.status === "notpurchase") {
    return <NotPurchase t={t} router={_router} userRef={_userRef} setSetting={_setSetting} />
  }

  if (_setting.status === "newgame") {
    return <NewGame t={t} userRef={_userRef} router={_router} setSetting={_setSetting} />
  }

  if (_setting.status === "ingame") {
    return <InGame t={t} userRef={_userRef} router={_router} setSetting={_setSetting} game={_setting.game} rounds={_setting.rounds} />
  }

  return (<Loading />);
}

export async function getServerSideProps({ locale, query, req, res }) {
  const { gameId = false } = query;
  return {
    props: {
      ...(await serverSideTranslations(locale, [
        "common",
        "app",
        "index"
      ])),
      gameId,
      locale
    }
  };
}
