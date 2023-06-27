import React from "react";
import {
  setOverlayDisplay,
  Overlay,
  ColorBackground,
  Block,
  Flex,
  Text,
  Icon,
  OutlineBtn,
  FillBtn,
  TextInput,
  NumberInput,
  Select
} from "de/components";
import { useMethod } from "de/hooks";

import styles from "@/styles/global";
import { Loading, InviteTag } from "@/components/elements";

const Modal = ({ id = "", title = "", itemPosition=["start", "start"], children }) => {
  return (
    <Overlay id={id} color={{ s: 0, l: 0, a: 0.8 }} onClick={(evt) => (evt.target.id === id) ? setOverlayDisplay(id, false) : false}>
      <Block size={["100%", "auto"]} padding={1.5}>
        <Flex rounded="{}" itemPosition={["start", "start"]} size={"100%"} padding={0.75}>
          <ColorBackground color={{ s: 0.2, l: 0.23 }} />
          <Flex size={["100%", "8%"]} border={["", "", { c: { s: 0.3, l: 0.8 }, w: 4 }, ""]}>
            <Flex size={["100%", "100%"]} itemPosition={["start", "center"]} padding={0}>
              <Text size={styles.textSize.medium} color={{ s: 0.3, l: 0.8 }}>{title}</Text>
            </Flex>
          </Flex>
          <Flex itemPosition={itemPosition} size={["100%", "92%"]} padding={[0, 2]} baseStyle={{ overflow: [false, true] }}>
            {children}
          </Flex>
        </Flex>
      </Block>
    </Overlay>
  );
};

export const MenuPopup = ({ id, menuitems, itemPosition = ["start", "start"] }) => {
  const _paramsRef = React.useRef({});
  useMethod(id, "setParams", (params) => { _paramsRef.current = params });

  return (
    <Overlay id={id} color={{ s: 0, l: 0, a: 0.7 }} onClick={() => setOverlayDisplay(id, false)}>
      <Block size={"100%"} padding={1.5}>
        <Flex rounded="{}" itemPosition={itemPosition} size={["100%", "auto"]} gap={0.5} padding={0.5}>
          <ColorBackground color={styles.color.antitri} />
          {menuitems.map(({ icon, name, onClick }, idx) => 
            <OutlineBtn size={["100%", "auto"]} onClick={() => { setOverlayDisplay(id, false); onClick(_paramsRef.current); }}>
              <Flex key={idx} itemPosition={"start"} size={["100%", "auto"]}>
                <Icon size={styles.textSize.large} name={icon} color={styles.color.white} />&nbsp;&nbsp;
                <Text size={styles.textSize.medium} weight={2} color={styles.color.white}>{name}</Text>
              </Flex>
            </OutlineBtn>
          )}
        </Flex>
      </Block>
    </Overlay>
  );
};

export const LoadingPopup = ({ id }) => (
  <Overlay id={id} color={{ s: 0, l: 0, a: 0.7 }}>
    <Loading />
  </Overlay>
);

export const FanModal = ({ id, t, baseFan, players, onClick }) => {
  const [_setting, _setSetting] = React.useState({ eatBySelf: false, winnerId: "", loserIds: [], hostAtUserId: "", hostCount: 0, onClick: () => true });
  const [_cardFan, _setCardFan] = React.useState(0);
  useMethod(id, "setDetail", ({ eatBySelf, winnerId, loserIds, hostAtUserId, hostCount, onClick }) => _setSetting(old => ({ ...old, eatBySelf, winnerId, loserIds, hostAtUserId, hostCount, onClick })));

  const _totalFan = (loserId) => {
    let _tot = baseFan + ((!_cardFan || _cardFan < 0) ? 0 : parseInt(_cardFan));
    if (_setting.eatBySelf) { _tot += 1; }
    if (_setting.hostAtUserId === loserId || _setting.hostAtUserId === _setting.winnerId) { _tot += (2 * _setting.hostCount + 1); }
    return _tot;
  };

  const _description = (loserId) => {
    const _cardFanInt = (!_cardFan || _cardFan < 0) ? 0 : parseInt(_cardFan);
    let _detail = `${baseFan}${t("index:base")}${_cardFanInt}${t("index:card")}`;
    if (_setting.eatBySelf) { _detail = _detail + `1${t("index:self")}`; }
    if (_setting.hostAtUserId === loserId || _setting.hostAtUserId === _setting.winnerId) { _detail = _detail + `${2*_setting.hostCount + 1}${t("index:host")}`; }
    return t("index:eat-other", { player: players[loserId].name, detail: _detail, fan: _totalFan(loserId) });
  };

  const _onClick = () => {
    const _results = _setting.loserIds.reduce((ret, id) => ({
      ...ret,
      [`${_setting.winnerId}_${id}`]: { name: (_setting.eatBySelf) ? "self" : "eat", fan: _totalFan(id) }
    }), {});
    return _setting.onClick(_results);
  };

  return (
    <Modal id={id} title={(_setting.winnerId.length === 0) ? "" : `${players[_setting.winnerId].name}${t("index:win")}${(_setting.eatBySelf) ? t("index:self") : t("index:eat")}`}>
      <Flex itemPosition={["start", "center"]} size={["100%", "auto"]}>
        <NumberInput
          min={0}
          step={1}
          border
          rounded
          color={styles.color.white}
          placeholder={t("index:card-fan")}
          value={_cardFan}
          onChange={(evt) => _setCardFan(evt.target.value)}
          onBlur={(val) => _setCardFan((!val || val < 0) ? 0 : parseInt(val))}
        />
      </Flex>
      <Flex itemPosition={["start", "start"]} size={["100%", "auto"]} padding={0.5}>
      {
        _setting.loserIds.map(id => (
          <Block key={id} size={["100%", "auto"]} align="start">
            <Text align="start" size={styles.textSize.small} weight={1} color={{ s: 0.8, l: 0.8 }}>-&nbsp;&nbsp;{_description(id)}</Text>
          </Block>
        ))
      }
      </Flex>
      <Flex itemPosition={["center", "center"]} size={["100%", "auto"]}>  
        <FillBtn size={["40%", "auto"]} color={styles.color.similar2} onClick={() => { setOverlayDisplay(id, false); _onClick(); }} rounded="(]">
          <Text size={styles.textSize.medium} color={styles.color.white}>{t("confirm")}</Text>
        </FillBtn>
        <FillBtn size={["40%", "auto"]} color={styles.color.grey} onClick={() => setOverlayDisplay(id, false)} rounded="[)">
          <Text size={styles.textSize.medium} color={styles.color.similar2}>{t("cancel")}</Text>
        </FillBtn>
      </Flex>
    </Modal>
  );
};

export const FinalAccountModal = ({ id= "", t, title, players, amountPerFan, latestRound }) => {
  const [_fromPlayer, _setFromPlayer] = React.useState("all");
  const [_toPlayer, _setToPlayer] = React.useState("all");
  const [_additionalCharge, _setAdditionalCharge] = React.useState([]);
  const _transferAmountRef = React.useRef();

  React.useEffect(() => {
    _transferAmountRef.current.value = 0;
    return () => true;
  }, []);


  const _menuFromPlayerItems = [
    { icon: "group", name: t("all"), onClick: () => _setFromPlayer("all") },
    ...Object.entries(players).map(([playerId, { name }]) => ({ icon: "person", name, onClick: () => _setFromPlayer(playerId) }))
  ];

  const _menuToPlayerItems = [
    { icon: "group", name: t("all"), onClick: () => _setToPlayer("all") },
    ...Object.entries(players).map(([playerId, { name }]) => ({ icon: "person", name, onClick: () => _setToPlayer(playerId) }))
  ];

  const _addAdditionalChargeHandler = () => {
    const _amount = parseFloat(_transferAmountRef.current.value);
    if (_amount === 0) { return; }
    if (_fromPlayer === "all" && _toPlayer === "all") { return; }
    
    const _from = (_fromPlayer === "all") ? Object.keys(players) : [_fromPlayer];
    const _to = (_toPlayer === "all") ? Object.keys(players) : [_toPlayer];

    if (_from.length > 1) {
      const _filterFrom = _from.filter(id => id !== _to[0]);
      _setAdditionalCharge(old => [...old, ..._filterFrom.map(id => ({ fromPlayer: id, toPlayer: _to[0], amount: _amount }))]);
    } else if (_to.length > 1) {
      const _filterTo = _to.filter(id => id !== _from[0]);
      _setAdditionalCharge(old => [...old, ..._filterTo.map(id => ({ fromPlayer: _from[0], toPlayer: id, amount: _amount }))]);
    } else {
      _setAdditionalCharge(old => [...old, { fromPlayer: _from[0], toPlayer: _to[0], amount: _amount }]);
    }
    
    return;
  };

  const _overall = () => Object.entries(players).map(([id, { name }]) => {
    let _amount = (latestRound.playersTable[id]) ? latestRound.playersTable[id] * amountPerFan : 0;
    Object.entries(latestRound.pullsTable).forEach(([pullId, { fan }]) => {
      const [_winnerId, _loserId] = pullId.split("_");
      if (_winnerId === id) { _amount += fan * amountPerFan; }
      else if (_loserId === id) { _amount -= fan * amountPerFan; }
      return;
    });

    _additionalCharge.forEach(({ fromPlayer, toPlayer, amount }) => {
      if (fromPlayer === id) { _amount -= amount; }
      else if (toPlayer === id) { _amount += amount; }
      return;
    });

    return { player: name, amount: _amount };
  });

  return (
    <Modal id={id} title={title}>
      <Flex itemPosition={["start", "start"]} size={["100%", "auto"]} padding={0}>
        <Flex itemPosition={["start", "center"]} size={["100%", "auto"]} gap={0.25}>
          <OutlineBtn
            size={["25%", "auto"]}
            focusScaleEffect={0.8}
            padding={0}
            onClick={() => setOverlayDisplay("from-players-menu-popup", true)}
          >
            <Text size={styles.textSize.small} color={styles.color.white}>{(_fromPlayer === "all") ? t("all") : players[_fromPlayer].name}</Text>
          </OutlineBtn>
          <Flex size={["5%", "auto"]}>
            <Text size={styles.textSize.small} color={styles.color.white}>{t("index:give")}</Text>
          </Flex>
          <OutlineBtn
            size={["25%", "auto"]}
            focusScaleEffect={0.8}
            padding={0}
            onClick={() => setOverlayDisplay("to-players-menu-popup", true)}
          >
            <Text size={styles.textSize.small} color={styles.color.white}>{(_toPlayer === "all") ? t("all") : players[_toPlayer].name}</Text>
          </OutlineBtn>
          <Flex size={"auto"} baseStyle={{ flex: 1 }}>
            <NumberInput
              ref={_transferAmountRef}
              min={0}
              color={styles.color.white}
            />
          </Flex>
          <OutlineBtn
            size={["5%", "auto"]}
            focusScaleEffect={0.8}
            padding={0}
            onClick={_addAdditionalChargeHandler}
          >
            <Icon name="add" color={styles.color.white} size={1.5} />
          </OutlineBtn>
        </Flex>
        <Flex itemPosition={["start", "center"]} size={["100%", "auto"]} gap={0.25}>
          {_additionalCharge.map(({ fromPlayer, toPlayer, amount }, idx) => (
            <Flex key={idx} size={["100%", "auto"]} itemPosition={["start", "center"]}>
              <Flex size={["80%", "auto"]} itemPosition={["start", "center"]}>
                &nbsp;&nbsp;&nbsp;&nbsp;-&nbsp;&nbsp;
                <Text size={0.75} weight={2} color={styles.color.white}>{t("index:transfer", { fromPlayer: players[fromPlayer].name, toPlayer: players[toPlayer].name, amount })}</Text>
              </Flex>
              <Flex size={["20%", "auto"]} itemPosition={["end", "center"]}>
                <OutlineBtn
                  size={"auto"}
                  padding={0.5}
                  focusScaleEffect={0.8}
                  onClick={() => _setAdditionalCharge(old => old.filter((_, index) => index !== idx))}
                >
                  <Icon name="delete" color={styles.color.grey} size={1} />
                </OutlineBtn>
              </Flex>
            </Flex>)
          )}
        </Flex>
        <Flex size={["100%", "auto"]} border={[{ c: { s: 0.3, l: 0.8 }, w: 2 }, "", "", ""]}>
          {_overall().map(({ player, amount }) => (
            <Block align="start" size={["100%", "auto"]}>
              <Text size={0.75} weight={2} color={(amount < 0) ? { h: -120, s: 0.5, l: 0.5 } : { s: 0.5, l: 0.5 }}>
                &nbsp;&nbsp;&nbsp;&nbsp;-&nbsp;&nbsp;{t((amount < 0) ? "index:total-lose" : "index:total-win", { player, amount: Math.abs(amount) })}
              </Text>            
            </Block>
          ))}
        </Flex>
      </Flex>
      <MenuPopup id="from-players-menu-popup" menuitems={_menuFromPlayerItems} />
      <MenuPopup id="to-players-menu-popup" menuitems={_menuToPlayerItems} />
    </Modal>
  );
};

export const ConfirmModal = ({ id = "", btnYesText = "Yes", btnNoText = "No" }) => {
  const [_setting, _setSetting] = React.useState({ title: "", content: "", onClick: () => true });
  useMethod(id, "setContent", ({ content, title, onClick }) => _setSetting(old => ({ ...old, content, title, onClick })));

  return (
    <Modal id={id} title={_setting.title}>
      <Flex itemPosition={["start", "start"]} size={["100%", "auto"]} padding={2}>
        <Text align="start" size={styles.textSize.medium} weight={1} color={{ s: 0.8, l: 0.8 }}>{_setting.content}</Text>
      </Flex>
      <Flex itemPosition={["center", "center"]} size={["100%", "auto"]}>  
        <FillBtn size={["40%", "auto"]} color={styles.color.similar2} onClick={() => { setOverlayDisplay(id, false); _setting.onClick(); }} rounded="(]">
          <Text size={styles.textSize.medium} color={styles.color.white}>{btnYesText}</Text>
        </FillBtn>
        <FillBtn size={["40%", "auto"]} color={styles.color.grey} onClick={() => setOverlayDisplay(id, false)} rounded="[)">
          <Text size={styles.textSize.medium} color={styles.color.similar2}>{btnNoText}</Text>
        </FillBtn>
      </Flex>
    </Modal>
  );
};


export const PromptModal = ({ id = "", btnEditText = "Edit", btnCancelText = "Cancel" }) => {
  const [_setting, _setSetting] = React.useState({ title: "", placeholder: "", defaultVal: "", inputVal: "", onClick: () => true });
  useMethod(id, "setContent", ({ title, placeholder, defaultVal, onClick }) => _setSetting(old => ({ ...old, title, placeholder, defaultVal, inputVal: defaultVal, onClick })));

  return (
    <Modal id={id} title={_setting.title}>
      <Flex itemPosition={["start", "start"]} size={["100%", "auto"]} padding={2}>
        <TextInput
          border
          rounded
          color={styles.color.white}
          placeholder={_setting.placeholder}
          value={_setting.inputVal}
          onChange={(evt) => _setSetting(old => ({ ...old, inputVal: evt.target.value }))}
          onBlur={(val) => _setSetting(old => ({ ...old, inputVal: (!val || val.trim().length === 0) ? _setting.defaultVal : val.trim() }))}
        />
      </Flex>
      <Flex itemPosition={["center", "center"]} size={["100%", "auto"]}>  
        <FillBtn size={["40%", "auto"]} color={styles.color.similar2} onClick={() => { setOverlayDisplay(id, false); _setting.onClick(_setting.inputVal); }} rounded="(]">
          <Text size={styles.textSize.medium} color={styles.color.white}>{btnEditText}</Text>
        </FillBtn>
        <FillBtn size={["40%", "auto"]} color={styles.color.grey} onClick={() => setOverlayDisplay(id, false)} rounded="[)">
          <Text size={styles.textSize.medium} color={styles.color.similar2}>{btnCancelText}</Text>
        </FillBtn>
      </Flex>
    </Modal>
  );
};

export const InviteModal = ({ id = "", title, shareLink, inviteText }) => {
  return (
    <Modal id={id} title={title}>
      <Flex size={["100%", "auto"]} gap={0.5}>
        <InviteTag title={""} shareLink={shareLink} inviteText={inviteText} />
      </Flex>
    </Modal>
  );
};
