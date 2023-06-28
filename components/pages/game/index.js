import React from "react";
import { BannerLayout } from "./../default";

import { share } from "de/utils";
import { callMethod, useEventListener } from "de/hooks";
import {
  setOverlayDisplay,
  ColorBackground,
  ImageBackground,
  Locator,
  Flex,
  Block,
  Text,
  Icon,
  FillBtn,
  OutlineBtn,
  NumberInput
} from "de/components";

import { TWMJLogo } from "@/components/logo";
import { Loading, InviteTag, Tag, PolicyAndSignOutTag } from "@/components/elements";
import { MenuPopup, InviteModal, FanModal, FinalAccountModal } from "@/components/modal";

import styles from "@/styles/global";
import Parse, { callParseMethod, parseLiveClient } from "@/utils/parse";
import AppError from "@/utils/error";

const _callParseCloudFunction = async (funcName, params, router, setSetting) => {
  try {
    setOverlayDisplay("loading-popup", true);
    const { status, ...others } = await Parse.Cloud.run(funcName, params);
    if (status === "error") { throw new AppError({ text: "parse-error", status: 500, message: others.error }); }

    setOverlayDisplay("loading-popup", false);
    if (status === "unauthorized") { window.localStorage.removeItem("twmj:session-token"); setSetting(old => ({ ...old, status: "landing" })); return false; }
    if (status === "expired") { setSetting(old => ({ ...old, status: "notpurchase" })); return false; }
    return others;
  } catch (error) {
    router.replace(`/error?message=${error.message}`);
    return false;
  }
};

const MyNumberInput = React.forwardRef(({ placeholder, ...props }, ref) => {
  return (
    <NumberInput
      ref={ref}
      min={0}
      step={1}
      border
      rounded
      color={styles.color.white}
      placeholder={placeholder}
      {...props}
    />
  );
});
MyNumberInput.displayName = "MyNumberInput";

export function NewGame({ t, userRef, router, setSetting }) {
  const [_gameSetting, _setGameSetting] = React.useState({ baseFan: 10, amountPerFan: 1 });
  const _createNewGameHandler = async () => {
    setSetting(old => ({ ...old, status: "loading" }));
    const _ret = await _callParseCloudFunction("updateGame", { sessionToken: userRef.current.sessionToken, setting: {}, ..._gameSetting }, router, setSetting);
    return (!_ret) ? false : setSetting(old => ({ ...old, status: "ingame", game: _ret.game, rounds: _ret.rounds }));
  };

  const _onChange = (key) => (evt) => _setGameSetting(old => ({ ...old, [key]: evt.target.value }));
  const _onBlur = (key, defaultVal) => (val) => _setGameSetting(old => ({ ...old, [key]: (!val || parseInt(val) <= 0) ? defaultVal : parseInt(val) }));

  return (
    <BannerLayout>
      <Flex size={["100%", "auto"]} gap={0.25}>
        <Flex size={styles.layout.column(0.45)}>
          <MyNumberInput placeholder={t("index:input-base-placeholder")} value={_gameSetting.baseFan} onChange={_onChange("baseFan")} onBlur={_onBlur("baseFan", 10)} />
        </Flex>
        <Flex size={styles.layout.column(0.45)}>
          <MyNumberInput placeholder={t("index:input-amtperfan-placeholder")} value={_gameSetting.amountPerFan} onChange={_onChange("amountPerFan")} onBlur={_onBlur("amountPerFan", 1)} />
        </Flex>
      </Flex>
      <FillBtn onClick={_createNewGameHandler} rounded padding={1} color={styles.color.similar2} hoverColorEffect focusScaleEffect>
        <Text size={1} weight={2} color={styles.color.white}>{t("newgame")}</Text>
      </FillBtn>
      <PolicyAndSignOutTag t={t} router={router} onSignOut={() => setSetting(old => ({ ...old, status: "landing" }))} />
    </BannerLayout>
  );
};

// ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- //
export const Navbar = ({ t, userRef, router, setSetting, gameInfo }) => {
  const _menuItemsForOwner = [{
    icon: "refresh",
    name: t("index:menu-regame"),
    onClick: () => {
      callMethod("confirm-modal", "setContent", {
        title: t("index:menu-regame"),
        content: t("index:confirm-regame"),
        onClick: async () => {
          setSetting(old => ({ ...old, status: "loading" }));
          const _ret = await _callParseCloudFunction("leaveGame", { gameId: gameInfo.objectId, sessionToken: userRef.current.sessionToken }, router, setSetting);
          return (!ret) ? false : setSetting(old => ({ ...old, status: "newgame", game: false, rounds: [] }));
        }
      });
      setOverlayDisplay("confirm-modal", true);
    }
  }, {
    icon: "edit_note",
    name: t("index:menu-retitle"),
    onClick: () => {
      callMethod("prompt-modal", "setContent", {
        title: t("index:menu-retitle"),
        defaultVal: gameInfo.name,
        placeholder: t("index:placeholder-retitle"),
        onClick: async (val) => { return await _callParseCloudFunction("updateGame", { name: val, gameId: gameInfo.objectId, sessionToken: userRef.current.sessionToken }, router, setSetting); }
      });
      setOverlayDisplay("prompt-modal", true);
    }
  }];

  const _menuItemsForNonOwner = [{
    icon: "exit_to_app",
    name: t("index:menu-leavegame"),
    onClick: () => {
      callMethod("confirm-modal", "setContent", {
        title: t("index:menu-leavegame"),
        content: t("index:confirm-leavegame"),
        onClick: async () => {
          setSetting(old => ({ ...old, status: "loading" }));
          const _ret = await _callParseCloudFunction("leaveGame", { gameId: gameInfo.objectId, sessionToken: userRef.current.sessionToken }, router, setSetting);
          return (!ret) ? false : setSetting(old => ({ ...old, status: "newgame", game: false, rounds: [] }));
        }
      });
      setOverlayDisplay("confirm-modal", true);
    }
  }];

  const _menuItems = [{
    icon: "person",
    name: t("index:menu-rename"),
    onClick: () => {
      callMethod("prompt-modal", "setContent", {
        title: t("index:menu-rename"),
        defaultVal: userRef.current.playerName,
        placeholder: t("index:placeholder-rename"),
        onClick: async (val) => { return await _callParseCloudFunction("updatePlayerName", { name: val, gameId: gameInfo.objectId, sessionToken: userRef.current.sessionToken }, router, setSetting); }
      });
      setOverlayDisplay("prompt-modal", true);
    }
  }, {
    icon: "qr_code",
    name: t("index:menu-invite"),
    onClick: () => setOverlayDisplay("invite-modal", true)
  }, {
    icon: "undo",
    name: t("index:menu-back"),
    onClick: () => {
      callMethod("confirm-modal", "setContent", {
        title: t("index:menu-back"),
        content: t("index:confirm-back"),
        onClick: async () => {
          return await _callParseCloudFunction("deleteRound", { gameId: gameInfo.objectId, sessionToken: userRef.current.sessionToken }, router, setSetting);
        }
      });
      setOverlayDisplay("confirm-modal", true);
    }
  }, { 
    icon: "payments",
    name: t("index:menu-bill"),
    onClick: () => setOverlayDisplay("final-amount-modal", true)
  }, {
    icon: "logout",
    name: t("signout"),
    onClick: () => {
      window.localStorage.removeItem("twmj:session-token");
      setSetting(old => ({ ...old, status: "landing" }));
    }
  }];

  return (
    <Locator fixed loc={[0, 0, 10]} size={["100%", "auto"]}>
      <Flex size={"100%"} padding={[0.75, 0.25]}>
        <ColorBackground color={styles.color.darken} />
        <Flex itemPosition={["start", "center"]} size={["50%", "auto"]}>
          <Block size={"auto"}>
            <Text size={1.5} weight={2} color={styles.color.lighten}>{gameInfo.name}</Text>
          </Block>
        </Flex>
        <Flex itemPosition={["end", "center"]} size={["50%", "auto"]}>
          <OutlineBtn
            size={"auto"}
            focusScaleEffect={0.8}
            onClick={() => setOverlayDisplay("navbar-menu-popup", true)}
          >
            <Icon name="menu" color={styles.color.lighten} size={1.5} />
          </OutlineBtn>
        </Flex>
      </Flex>
      <MenuPopup id="navbar-menu-popup" menuitems={(userRef.current.objectId === gameInfo.creatorId) ? [..._menuItemsForOwner, ..._menuItems] : [..._menuItemsForNonOwner, ..._menuItems]} />
    </Locator>
  );
};

const PlayerLists = ({ t, players, meObjectId }) => {
  return (
    <Flex size={["100%", "auto"]} gap={0.5} padding={1}>
      {
        Object.entries(players).map(([id, { name }]) => 
          <Tag
            key={id}
            text={name}
            highlight={meObjectId === id}
          />
        )
      }
    </Flex>
  );
};

const InviteFriend = ({ t, game }) => {
  const _shareLink = `${window.location}?gameId=${game.objectId}`;
  return (
    <Flex size={["100%", "auto"]} gap={0.5}>
      <TWMJLogo />
      <InviteTag title={t("index:invite-friend")} shareLink={_shareLink} inviteText={t("index:invite")} />
    </Flex>
  );
};

const RoundTitle = ({ t, userRef, router, setSetting, gameInfo, round, latestRound }) => {
  const { roundNumber, seatAt, hostAt } = round;
  const _direction = t("index:direction", { returnObjects: true });
  const _title = t("index:round-title", { seat: _direction[seatAt], host: _direction[hostAt] });
  return (
    <Flex id="round-title" size={["100%", "auto"]} padding={1}>
      <Flex size={["5%", "auto"]}>
      </Flex>
      <Flex size="auto" baseStyle={{ flex: 1 }}>
        <Text size={1.5} weight={2} color={styles.color.white}>{`${t("index:round", { roundNumber })} - ${_title}`}</Text>
      </Flex>
      <Flex size={["5%", "auto"]}>
      {
        (!latestRound) ? null :
        <OutlineBtn
          size={"auto"}
          focusScaleEffect={0.8}
          padding={0}
          onClick={async () => await _callParseCloudFunction("createRound", { gameId: gameInfo.objectId, sessionToken: userRef.current.sessionToken }, router, setSetting) }
        >
          <Icon name="add" color={styles.color.white} size={1.75} />
        </OutlineBtn>
      }
      </Flex>     
    </Flex>
  );
};

const _icon = {
  "bouns-grass": "grass",
  "bouns-flower": "deceased",
  "bouns-gong": "dashboard_customize",
  "bouns-666": "casino",
  "bouns-123": "123",
  "bouns-chase": "crop_portrait",
  "pull-cancelled": "conversion_path_off",
  "pull": "conversion_path",
  "eat": "partner_exchange",
  "self": "front_hand",
  "player": "person"
};

const SeatCard = ({ t, userRef, router, setSetting, gameInfo, round, enabledReseat }) => {
  const { resultsTable, pullsTable, bounsTable, playersTable, seat, hostAt, hostCount } = round;
  const _getPlayerName = (playerId) => (playerId.length === 0) ? "--" : gameInfo.players[playerId].name;
  const _getPlayerFan = (playerId) => {
    if (playerId.length === 0) { return 0; }
    let _fan = playersTable[playerId];
    Object.entries(pullsTable).forEach(([id, { cancelled, fan }]) => {
      const [_winnerId, _loserId] = id.split("_");
      if (cancelled) {
        if (_winnerId === playerId) { _fan += fan; }
        if (_loserId === playerId) { _fan -= fan; }
      }

      return;
    });

    Object.values(bounsTable).forEach(({ userId, fan }) => {
      if (userId === playerId) { _fan += (3 * fan); }
      else { _fan -= fan; }
      return;
    });

    return _fan;
  }

  return (
    <Flex size={["100%", "auto"]} rounded="{}" border>
      <ColorBackground color={{ ...styles.color.antisimilar2, s: 0.3, l: 0.5 }} />
      {
        seat.map((playerId, idx) => {
          const _fan = _getPlayerFan(playerId);
          return (
            <Flex key={idx} size={["100%", "auto"]} itemPosition={["start", "center"]} round="{}" gap={0.5} padding={0.2}>
              {(hostAt === idx) ? <ColorBackground color={{ ...styles.color.antitri, s: 0.3, l: 0.6 }} /> : null}
              <Block size={styles.imageSize.medium} padding={0} onClick={() => {
                if (enabledReseat && Object.keys(bounsTable).length === 0 && Object.keys(resultsTable).length === 0) { callMethod("reseat-menu-popup", "setParams", { index: idx }); return setOverlayDisplay("reseat-menu-popup", true); }
                return false;
              }}>
                {(hostAt === idx) ?
                  <Locator size="auto" loc={[0, -0.45, 1]}>
                    <Block rounded size={[1, "s"]}>
                      <ColorBackground color={styles.color.antitri} />
                      <Text size={styles.imageSize.small} weight={1} color={styles.color.grey}>{hostCount}</Text>
                    </Block>
                  </Locator> : null}
                <ImageBackground size="cover" src={`/imgs/seat${idx}.png`} />
              </Block>
              <Block size="auto" baseStyle={{ flex: 1 }}>
                <Flex size={["100%", "auto"]}>
                  <Flex size={["80%", "auto"]} itemPosition={["start", "center"]}>
                    <Text size={styles.imageSize.medium} weight={2} color={styles.color.grey}>{_getPlayerName(playerId)}</Text>
                  </Flex>
                  <Flex size={["20%", "auto"]} itemPosition={["end", "center"]}>
                    <Text
                      size={0.75}
                      weight={1}
                      color={(playerId.length === 0) ? styles.color.grey : (_fan < 0) ? "negative" : "positive"}
                    >
                      {(playerId.length === 0) ? "" : (_fan < 0) ? `${t("index:lose")}${Math.abs(_fan)}${t("index:fan")}` : `${t("index:win")}${_fan}${t("index:fan")}`}
                    </Text>
                  </Flex>
                </Flex>
                {
                  (seat.indexOf("") != -1) ? null :
                  <Flex size={["100%", "auto"]} gap={1} padding={[0, 0.25]} itemPosition={["start", "center"]}>
                    <OutlineBtn
                      padding={0}
                      size={"auto"}
                      focusScaleEffect={0.8}
                      onClick={() => setOverlayDisplay(`${playerId}-eat-menu-popup`, true)}
                    >
                      <Text size={0.75} weight={1} color={styles.color.tri}>{t("index:eat")}</Text>
                    </OutlineBtn>
                    <OutlineBtn
                      padding={0}
                      size={"auto"}
                      focusScaleEffect={0.8}
                      onClick={() => { callMethod("bouns-menu-popup", "setParams", { userId: playerId }); return setOverlayDisplay("bouns-menu-popup", true); }}
                    >
                      <Text size={0.75} weight={1} color={styles.color.tri}>{t("index:bouns")}</Text>
                    </OutlineBtn>
                  </Flex>
                }
              </Block>
            </Flex>
          ); 
        })
      }
    </Flex>
  );
};

const BounsCard = ({ t, userRef, router, setSetting, gameInfo, round }) => {
  if (Object.keys(round.bounsTable).length === 0) { return null; }
  const _removeBounsHandler = async (bounsId) => {
    const _bounsTable = { ...round.bounsTable };
    delete _bounsTable[bounsId];
    return await _callParseCloudFunction("updateRound", { roundNumber: round.roundNumber, bounsTable: _bounsTable, gameId: gameInfo.objectId, sessionToken: userRef.current.sessionToken }, router, setSetting);    
  };

  return (
    <Flex size={["100%", "auto"]} rounded="{}" border>
      <ColorBackground color={{ ...styles.color.antisimilar2, s: 0.3, l: 0.5 }} />
      {
        Object.entries(round.bounsTable).map(([id, { userId, name, fan }]) => {
          const _playerName = gameInfo.players[userId].name;
          const _bounsName = t(`index:${name}`);
          const _color = (fan < 0) ? "negative" : "positive";
          const _text = t(`index:${(fan < 0) ? "lose" : "win"}-bouns`, { player: _playerName, type: _bounsName, fan: Math.abs(fan) });
          return (
            <Flex key={id} size={["100%", "auto"]} itemPosition={["start", "center"]}>
              <Flex size={["80%", "auto"]} itemPosition={["start", "center"]}>
                &nbsp;&nbsp;&nbsp;&nbsp;<Icon name={_icon[name]} color={_color} size={1} />&nbsp;&nbsp;
                <Text size={0.75} weight={2} color={_color}>{_text}</Text>
              </Flex>
              <Flex size={["20%", "auto"]} itemPosition={["end", "center"]}>
                <OutlineBtn
                  size={"auto"}
                  padding={0.5}
                  focusScaleEffect={0.8}
                  onClick={() => _removeBounsHandler(id)}
                >
                  <Icon name="delete" color={styles.color.grey} size={1} />
                </OutlineBtn>
              </Flex>
            </Flex>
          )
        })
      }
    </Flex>
  );
};

const PullsCard = ({ t, userRef, router, setSetting, gameInfo, round }) => {
  if (Object.keys(round.pullsTable).length === 0) { return null; }
  const _clearPullHandler = async (pullId, cancelled) => {
    const _pullsTable = { ...round.pullsTable };
    _pullsTable[pullId].cancelled = cancelled;
    return await _callParseCloudFunction("updateRound", { roundNumber: round.roundNumber, pullsTable: _pullsTable, gameId: gameInfo.objectId, sessionToken: userRef.current.sessionToken }, router, setSetting);    
  };

  return (
    <Flex size={["100%", "auto"]} rounded="{}" border>
      <ColorBackground color={{ ...styles.color.antisimilar2, s: 0.3, l: 0.5 }} />
      {
        Object.entries(round.pullsTable).map(([id, { count, fan, cancelled }]) => {
          const [winnerId, loserId] = id.split("_");
          const _winnerName = gameInfo.players[winnerId].name;
          const _loserName = gameInfo.players[loserId].name;
          const _text = t("index:pull-at", { winner: _winnerName, loser: _loserName, fan, count });
          return (
            <Flex key={id} size={["100%", "auto"]}>
              <Flex size={["80%", "auto"]} itemPosition={["start", "center"]}>
                &nbsp;&nbsp;&nbsp;&nbsp;<Icon name={_icon[(cancelled) ? "pull_cancelled" : "pull"]} color="positive" size={1} />&nbsp;&nbsp;
                <Text size={0.75} weight={1} color="positive" lineThrough={cancelled} baseStyle={{ textDecorationThickness: 2, textDecorationColor: "negative" }}>{_text}</Text>
              </Flex>
              <Flex size={["20%", "auto"]} itemPosition={["end", "center"]}>
                <OutlineBtn
                  size={"auto"}
                  padding={0.5}
                  focusScaleEffect={0.8}
                  onClick={() => _clearPullHandler(id, !cancelled)}
                >
                  <Text size={0.75} weight={1} color={styles.color.grey}>{(cancelled) ? t("index:reset") : t("index:clear")}</Text>
                </OutlineBtn>
              </Flex>
            </Flex>
          )
        })
      }
    </Flex>
  );
};

const ResultsCard = ({ t, userRef, router, setSetting, gameInfo, round }) => {
  if (Object.keys(round.resultsTable).length === 0) { return null; }
  const _removeResultHandler = async (id = "all") => {
    const _resultsTable = (id === "all") ? {} : { ...round.resultsTable };
    if (id !== "all") { delete _resultsTable[id]; }
    return await _callParseCloudFunction("updateRound", { roundNumber: round.roundNumber, resultsTable: _resultsTable, gameId: gameInfo.objectId, sessionToken: userRef.current.sessionToken }, router, setSetting); 
  }

  if (round.resultsTable[Object.keys(round.resultsTable)[0]].name === "self") {
    const [winnerId, _] = Object.keys(round.resultsTable)[0].split("_");
    const _sumOfFan = Object.values(round.resultsTable).reduce((sum, { fan }) => sum + fan, 0);
    return (
      <Flex size={["100%", "auto"]} rounded="{}" border padding={[0, 0, 0.5, 0]}>
        <ColorBackground color={{ ...styles.color.antisimilar2, s: 0.3, l: 0.5 }} />
        <Flex size={["100%", "auto"]}>
          <Flex size={["80%", "auto"]} itemPosition={["start", "center"]}>
            &nbsp;&nbsp;&nbsp;&nbsp;<Icon name={_icon.self} color="positive" size={1} />&nbsp;&nbsp;
            <Text size={0.75} weight={1} color="positive">{`${gameInfo.players[winnerId].name}${t("index:eat-self", { fan: _sumOfFan })}`}</Text>
          </Flex>
          <Flex size={["20%", "auto"]} itemPosition={["end", "center"]}>
            <OutlineBtn
              size={"auto"}
              padding={0.5}
              focusScaleEffect={0.8}
              onClick={() => _removeResultHandler()}
            >
              <Icon name="delete" color={styles.color.grey} size={1} />
            </OutlineBtn>
          </Flex>
        </Flex>
        {
          Object.entries(round.resultsTable).map(([id, { fan }]) => {
            const [_, loserId] = id.split("_");
            return (
              <Block key={id} align="start" size={["100%", "auto"]}>
                <Text size={0.7} weight={1} color={styles.color.grey}>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;-&nbsp;{t("index:eat-other", { player: gameInfo.players[loserId].name, fan, detail: "" })}</Text>
              </Block>
            );
          })
        }
      </Flex>
    );
  }

  return (
    <Flex size={["100%", "auto"]} rounded="{}" border>
      <ColorBackground color={{ ...styles.color.antisimilar2, s: 0.3, l: 0.5 }} />
      {
        Object.entries(round.resultsTable).map(([id, { fan }]) => {
          const [winnerId, loserId] = id.split("_");
          return (
            <Flex key={id} size={["100%", "auto"]}>
              <Flex size={["80%", "auto"]} itemPosition={["start", "center"]}>
                &nbsp;&nbsp;&nbsp;&nbsp;<Icon name={_icon.eat} color="positive" size={1} />&nbsp;&nbsp;
                <Text size={0.75} weight={1} color="positive">{`${gameInfo.players[winnerId].name} ${t("index:eat-other", { player: gameInfo.players[loserId].name, fan, detail: "" })}`}</Text>
              </Flex>
              <Flex size={["20%", "auto"]} itemPosition={["end", "center"]}>
                <OutlineBtn
                  size={"auto"}
                  padding={0.5}
                  focusScaleEffect={0.8}
                  onClick={() => _removeResultHandler(id)}
                >
                  <Icon name="delete" color={styles.color.grey} size={1} />
                </OutlineBtn>
              </Flex>
            </Flex>
          );
        })
      }
    </Flex>
  );
};

const RoundContainer = ({ t, userRef, router, setSetting, gameInfo, round, latestRound }) => {
  const { resultsTable, bounsTable, seat, hostAt, hostCount, roundNumber } = round;
  const _curRoundNumberRef = React.useRef(0);
  const [_setting, _setSetting] = React.useState({ round, statusStyle: { opacity: 0, scale: [1, 0] } });

  React.useEffect(() => {
    let _timer = false;
    if (round.roundNumber !== _curRoundNumberRef.current) {
      _curRoundNumberRef.current = round.roundNumber;
      _setSetting(old => (old.opacity === 0) ? old : { ...old, statusStyle: { opacity: 0, scale: [1, 0] } });
      _timer = window.setTimeout(() => _setSetting(old => ({ ...old, round, statusStyle: { opacity: 1, scale: [1, 1] } })), 300);
    } else {
      _setSetting(old => ({ ...old, round }));
    }

    return () => (_timer) ? window.clearTimeout(_timer) : false;
  }, [round]);

  const _reseatHandler = async (idx, playerId) => {
    const _seat = [];
    _seat[0] = (idx === 0) ? playerId : (seat[0] === playerId) ? "" : seat[0];
    _seat[1] = (idx === 1) ? playerId : (seat[1] === playerId) ? "" : seat[1];
    _seat[2] = (idx === 2) ? playerId : (seat[2] === playerId) ? "" : seat[2];
    _seat[3] = (idx === 3) ? playerId : (seat[3] === playerId) ? "" : seat[3];
    return await _callParseCloudFunction("updateRound", { roundNumber, seat: _seat, gameId: gameInfo.objectId, sessionToken: userRef.current.sessionToken }, router, setSetting);
  };

  const _addBounsHandler = async (userId, name, fan) => {
    const _bounsTable = { ...bounsTable, [(new Date()).valueOf().toString()]: { userId, name, fan } };
    return await _callParseCloudFunction("updateRound", { roundNumber, bounsTable: _bounsTable, gameId: gameInfo.objectId, sessionToken: userRef.current.sessionToken }, router, setSetting);
  };

  const _addResultHandler = async (result) => {
    let _resultsTable = result;
    if (result[Object.keys(result)[0]].name === "eat" && Object.keys(resultsTable).length > 0 && resultsTable[Object.keys(resultsTable)[0]].name === "eat") {
      const _loserId = Object.keys(result)[0].split("_")[1];
      if (Object.keys(resultsTable)[0].indexOf(`_${_loserId}`) !== -1) { _resultsTable = { ...resultsTable, ...result }; }
    }

    return await _callParseCloudFunction("updateRound", { roundNumber, resultsTable: _resultsTable, gameId: gameInfo.objectId, sessionToken: userRef.current.sessionToken }, router, setSetting);
  };

  const _menuBounsItems = [
    { icon: _icon["bouns-grass"], name: t("index:bouns-grass"), onClick: ({ userId }) => _addBounsHandler(userId, "bouns-grass", Math.ceil(gameInfo.baseFan / 2)) },
    { icon: _icon["bouns-flower"], name: t("index:bouns-flower"), onClick: ({ userId }) => _addBounsHandler(userId, "bouns-flower", gameInfo.baseFan) },
    { icon: _icon["bouns-gong"], name: t("index:bouns-gong"), onClick: ({ userId }) => _addBounsHandler(userId, "bouns-gong", gameInfo.baseFan) },
    { icon: _icon["bouns-666"], name: t("index:bouns-666"), onClick: ({ userId }) => _addBounsHandler(userId, "bouns-666", gameInfo.baseFan) },
    { icon: _icon["bouns-123"], name: t("index:bouns-123"), onClick: ({ userId }) => _addBounsHandler(userId, "bouns-123", -1 * gameInfo.baseFan) },
    { icon: _icon["bouns-chase"], name: t("index:bouns-chase"), onClick: ({ userId }) => _addBounsHandler(userId, "bouns-chase", -1 * gameInfo.baseFan) }
  ];

  const _menuPlayerItems = Object.entries(gameInfo.players).map(([playerId, { name }]) => ({ icon: _icon.player, name, onClick: ({ index }) => _reseatHandler(index, playerId) }));

  return (
    <>
      <Flex
        size="auto"
        gap={0.5}
        transitions={{ all: { duration: 0.25, timeFunction: "ease-in-out", delay: 0 } }}
        baseStyle={{ transformOrigin: "0 0" }}
        statusStyle={_setting.statusStyle}
      >
        <SeatCard t={t} userRef={userRef} router={router} setSetting={setSetting} gameInfo={gameInfo} round={_setting.round} enabledReseat={latestRound} />
        <PullsCard t={t} userRef={userRef} router={router} setSetting={setSetting} gameInfo={gameInfo} round={_setting.round} />
        <BounsCard t={t} userRef={userRef} router={router} setSetting={setSetting} gameInfo={gameInfo} round={_setting.round} />
        <ResultsCard t={t} userRef={userRef} router={router} setSetting={setSetting} gameInfo={gameInfo} round={_setting.round} />
      </Flex>
      <MenuPopup id="bouns-menu-popup" menuitems={_menuBounsItems} />
      <MenuPopup id="reseat-menu-popup" menuitems={_menuPlayerItems} />
      {
        seat.map(playerId => <MenuPopup
          key={playerId}
          id={`${playerId}-eat-menu-popup`}
          menuitems={[{
            icon: _icon.self,
            name: t("index:self"),
            onClick: () => {
              callMethod("eat-fan-modal", "setDetail", {
                eatBySelf: true,
                winnerId: playerId,
                loserIds: seat.filter(id => id != playerId),
                hostAtUserId: seat[hostAt],
                hostCount,
                onClick: _addResultHandler
              });
              return setOverlayDisplay("eat-fan-modal", true);
            }              
          },
          ...seat.filter(id => id !== playerId).map(id => ({
            icon: _icon.player,
            name: gameInfo.players[id].name,
            onClick: () => {
              callMethod("eat-fan-modal", "setDetail", {
                eatBySelf: false,
                winnerId: playerId,
                loserIds: [id],
                hostAtUserId: seat[hostAt],
                hostCount,
                onClick: _addResultHandler
              });
              return setOverlayDisplay("eat-fan-modal", true);
            }
          }))]}
        />)
      }
    </>
  );
};

export function InGame({ t, userRef, router, setSetting, game, rounds }) {
  const _rounds = React.useRef(rounds);
  const _currentRoundNumber = React.useRef((rounds.length === 0) ? 1 : rounds[rounds.length - 1].roundNumber);
  const _mousePointRef = React.useRef({ x: 0, y: 0 });
  const [_gameInfo, _setGameInfo] = React.useState({ ...game, currentRoundNumber: (rounds.length === 0) ? 1 : rounds[rounds.length - 1].roundNumber });
  const eventStatus = useEventListener("round-container", "pointerdown,pointerup", true, true);

  React.useEffect(() => {
    const { eventName, event } = eventStatus;
    if (eventName === "pointerdown") {
      _mousePointRef.current = { x: event.pageX, y: event.pageY };
    } else if (eventName === "pointerup") {
      const _windowWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
      const _windowHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
      const _mousePointDiff = {  x: (event.pageX - _mousePointRef.current.x) / _windowWidth, y: Math.abs(event.pageY - _mousePointRef.current.y) / _windowHeight };
      window.alert(`${_mousePointDiff.x} ${_mousePointDiff.y}`);
      
      if (_mousePointDiff.x >= 0.2 && _mousePointDiff.y <= 0.05) {
        if (_currentRoundNumber.current !== 1) {
          _currentRoundNumber.current = _currentRoundNumber.current - 1;
          if (!_rounds.current[_currentRoundNumber.current - 1]) {
            _callParseCloudFunction("getRound", { roundNumber: _currentRoundNumber.current, gameId: game.objectId, sessionToken: userRef.current.sessionToken }, router, setSetting).then(res => {
              res.rounds.forEach(r => { _rounds.current[r.roundNumber - 1] = r; return; });
              _setGameInfo(old => ({ ...old, currentRoundNumber: old.currentRoundNumber - 1 }));
            });
          } else {
            _setGameInfo(old => ({ ...old, currentRoundNumber: old.currentRoundNumber - 1 }));
          }
        }
      } else if (_mousePointDiff.x <= -0.2 && _mousePointDiff.y <= 0.05) {
        if (_currentRoundNumber.current !== _rounds.current.length) { _currentRoundNumber.current = _currentRoundNumber.current + 1; }
        _setGameInfo(old => (old.currentRoundNumber === _rounds.current.length) ? old : { ...old, currentRoundNumber: old.currentRoundNumber + 1 });
      }
    }
    
    return () => true;
  }, [game, eventStatus]);

  React.useEffect(() => {
    const _client = parseLiveClient();
    _client.open();

    let _gameQuery = new Parse.Query("Game");
    _gameQuery = _gameQuery.equalTo("objectId", game.objectId);
    const _gameSubscription = _client.subscribe(_gameQuery);
    _gameSubscription.on("update", g => _setGameInfo(old => ({ ...old, name: g.get("name"), players: g.get("players") })));
    _gameSubscription.on("delete", g => setSetting(old => ({ ...old, status: "newgame", game: false, rounds: [] })));

    let _roundQuery = new Parse.Query("Round");
    _roundQuery = _roundQuery.equalTo("gameId", game.objectId);
    const _roundSubscription = _client.subscribe(_roundQuery);
    _roundSubscription.on("create", r => {
      if (r.get("roundNumber") > _rounds.current.length) {
        _rounds.current.push({
          playersTable: r.get("playersTable"),
          pullsTable: r.get("pullsTable"),
          resultsTable: r.get("resultsTable"),
          bounsTable: r.get("bounsTable"),
          seat: r.get("seat"),
          hostCount: r.get("hostCount"),
          hostAt: r.get("hostAt"),
          seatAt: r.get("seatAt"),        
          roundNumber: r.get("roundNumber")
        });
 
        _setGameInfo(old => {
          if (old.currentRoundNumber === r.get("roundNumber") - 1) {
            _currentRoundNumber.current = r.get("roundNumber"); 
            return { ...old, currentRoundNumber: r.get("roundNumber") }; 
          }

          return old
        });
      }

      return;
    });

    _roundSubscription.on("update", r => {
      const _index = r.get("roundNumber") - 1;
      _rounds.current[_index] = {
        playersTable: r.get("playersTable"),
        pullsTable: r.get("pullsTable"),
        resultsTable: r.get("resultsTable"),
        bounsTable: r.get("bounsTable"),
        seat: r.get("seat"),
        hostCount: r.get("hostCount"),
        hostAt: r.get("hostAt"),
        seatAt: r.get("seatAt"),        
        roundNumber: r.get("roundNumber") 
      };
      _setGameInfo(old => (old.currentRoundNumber === r.get("roundNumber")) ? { ...old, currentRoundNumber: r.get("roundNumber") } : old);
      return;
    });

    _roundSubscription.on("delete", r => {
      if (r.get("roundNumber") === _rounds.current.length) {
        _rounds.current.pop();
        _setGameInfo(old => {
          if (old.currentRoundNumber === r.get("roundNumber")) {
            _currentRoundNumber.current = r.get("roundNumber") - 1;
            return { ...old, currentRoundNumber: r.get("roundNumber") - 1 };
          }
          
          return old
        });
      }
      return;
    });

    return () => Parse.LiveQuery.close();
  }, [game, setSetting]);

  return (
    <Flex size={"auto"} padding={[4, 2, 6, 2]}>
      <Navbar t={t} userRef={userRef} router={router} setSetting={setSetting} gameInfo={_gameInfo} />
      {
        (Object.keys(_gameInfo.players).length >= 4) ? 
          <Flex id="round-container" size={"auto"}>
            <RoundTitle
              t={t}
              userRef={userRef}
              router={router}
              setSetting={setSetting}
              gameInfo={_gameInfo}
              round={_rounds.current[_gameInfo.currentRoundNumber - 1]}
              latestRound={_gameInfo.currentRoundNumber === _rounds.current.length}
            />
            <RoundContainer
              t={t}
              userRef={userRef}
              router={router}
              setSetting={setSetting}
              gameInfo={_gameInfo}
              round={_rounds.current[_gameInfo.currentRoundNumber - 1]}
              latestRound={_gameInfo.currentRoundNumber === _rounds.current.length}
            />
          </Flex>
        : <InviteFriend t={t} game={game} />
      }
      <PlayerLists t={t} players={_gameInfo.players} meObjectId={_gameInfo.me.objectId} />
      <InviteModal id="invite-modal" title={t("index:menu-invite")} shareLink={`${window.location}?gameId=${game.objectId}`} inviteText={t("index:invite")} />
      <FanModal id="eat-fan-modal" t={t} baseFan={_gameInfo.baseFan} players={_gameInfo.players} />
      <FinalAccountModal id="final-amount-modal" t={t} title={t("index:menu-bill")} players={_gameInfo.players} amountPerFan={_gameInfo.amountPerFan} latestRound={_rounds.current[_rounds.current.length - 1]} />
    </Flex>
  );
};
