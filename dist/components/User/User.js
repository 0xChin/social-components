import React, { useState, useEffect, useRef, useContext } from "react";
import { GlobalContext } from "../../contexts/GlobalContext";
import { shortAddress, sleep } from "../../utils";
import { decryptString, generateAccessControlConditionsForDMs } from "@orbisclub/orbis-sdk";

/** Internal components */
import LoadingCircle from "../LoadingCircle";
import ConnectButton from "../ConnectButton";
import Button from "../Button";
import Input from "../Input";
import Badge from "../Badge";
import Alert from "../Alert";
import UpdateProfileModal from "../ProfileModal";
import { CheckIcon, EditIcon, ErrorIcon, LockIcon, LogoutIcon, TwitterIcon, GithubIcon, GoogleIcon, OpenSeaIcon, UniswapIcon, TheGraphIcon, SushiIcon, HopIcon, LidoIcon, SnapshotIcon, SismoIcon, EthereumIcon, PolygonIcon, ArbitrumIcon, OptimismIcon, X2Y2Icon, LooksRareIcon, EmailCredentialIcon } from "../../icons";
import useHover from "../../hooks/useHover";
import useDidToAddress from "../../hooks/useDidToAddress";
import useGetUsername from "../../hooks/useGetUsername";
import useOrbis from "../../hooks/useOrbis";
import { defaultTheme, getThemeValue, getStyle } from "../../utils/themes";

/** Import CSS */
import styles from './User.module.css';

/** Full component for a user */
const User = ({
  did,
  details,
  connected = false,
  height = 44,
  hover = false
}) => {
  const [userDetails, setUserDetails] = useState(details);
  const {
    user,
    theme,
    orbis
  } = useOrbis();

  /** This will retrieve user details in case a did is passed instead of the full user details */
  useEffect(() => {
    if (did) {
      loadProfile();
    }
    async function loadProfile() {
      let {
        data,
        error
      } = await orbis.getProfile(did);
      setUserDetails(data?.details);
    }
  }, [did]);
  return /*#__PURE__*/React.createElement("div", {
    className: styles.userContainer
  }, /*#__PURE__*/React.createElement(UserPfp, {
    height: height,
    details: connected ? user : userDetails,
    hover: hover
  }), /*#__PURE__*/React.createElement("div", {
    className: styles.userUsernameContainer
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex"
    }
  }, /*#__PURE__*/React.createElement(Username, {
    details: connected ? user : userDetails
  }))));
};

/** Export only the User Pfp */
export const UserPfp = ({
  details,
  height = 44,
  showBadge = true,
  hover = false,
  showEmailCta = false
}) => {
  const {
    user,
    theme
  } = useOrbis();
  const [hoverRef, isHovered] = useHover();
  return /*#__PURE__*/React.createElement("div", {
    className: styles.userPfpContainer,
    ref: hoverRef
  }, details && details.profile && details.profile?.pfp ? /*#__PURE__*/React.createElement("img", {
    className: styles.userPfpContainerImg,
    src: details.profile.pfp,
    alt: "",
    style: {
      height: height,
      width: height
    }
  }) : /*#__PURE__*/React.createElement("span", {
    className: styles.userPfpContainerImgEmpty,
    style: {
      height: height,
      width: height,
      background: theme?.bg?.tertiary ? theme.bg.tertiary : defaultTheme.bg.tertiary,
      color: theme?.color?.tertiary ? theme.color.tertiary : defaultTheme.color.tertiary
    }
  }, /*#__PURE__*/React.createElement("svg", {
    style: {
      width: "100%",
      height: "100%"
    },
    fill: "currentColor",
    viewBox: "0 0 24 24"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z"
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      top: -4,
      right: -5,
      position: "absolute",
      display: "flex",
      flexDirection: "col"
    }
  }, showEmailCta && user && user.did == details.did && !details?.encrypted_email && /*#__PURE__*/React.createElement("svg", {
    width: "18",
    height: "18",
    viewBox: "0 0 20 20",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, /*#__PURE__*/React.createElement("path", {
    fillRule: "evenodd",
    clipRule: "evenodd",
    d: "M0.25 10C0.25 4.61522 4.61522 0.25 10 0.25C15.3848 0.25 19.75 4.61522 19.75 10C19.75 15.3848 15.3848 19.75 10 19.75C4.61522 19.75 0.25 15.3848 0.25 10ZM10 6.25C10.4142 6.25 10.75 6.58579 10.75 7V10.75C10.75 11.1642 10.4142 11.5 10 11.5C9.58579 11.5 9.25 11.1642 9.25 10.75V7C9.25 6.58579 9.58579 6.25 10 6.25ZM10 14.5C10.4142 14.5 10.75 14.1642 10.75 13.75C10.75 13.3358 10.4142 13 10 13C9.58579 13 9.25 13.3358 9.25 13.75C9.25 14.1642 9.58579 14.5 10 14.5Z",
    fill: "#FF3162"
  })), showBadge && details && details.profile && details.profile?.pfpIsNft && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("img", {
    style: {
      height: "1.25rem",
      width: "1.25rem"
    },
    src: "https://app.orbis.club/img/icons/nft-verified-" + details.profile?.pfpIsNft.chain + ".png"
  }))), hover && /*#__PURE__*/React.createElement(UserPopup, {
    visible: isHovered,
    details: details
  }));
};

/** Export only the Username */
export const Username = ({
  details
}) => {
  const {
    address,
    chain
  } = useDidToAddress(details?.did);
  const username = useGetUsername(details?.profile, address, details?.did);
  return username;
};

/** Export only the Badge */
export const UserBadge = ({
  details
}) => {
  const {
    theme
  } = useOrbis();
  const {
    address,
    chain
  } = useDidToAddress(details?.did);
  if (address) {
    return /*#__PURE__*/React.createElement("div", {
      className: styles.userBadge,
      style: {
        ...getThemeValue("badges", theme, "main"),
        ...getThemeValue("font", theme, "badges")
      }
    }, details?.metadata?.ensName ? details.metadata.ensName : shortAddress(address));
  } else {
    return null;
  }
};

/** Modal appearing on request with more details about a specific user */
export const UserPopup = ({
  details,
  visible,
  position = "absolute"
}) => {
  const {
    orbis,
    user,
    setUser,
    theme
  } = useOrbis();
  const [locked, setLocked] = useState(false);
  const [vis, setVis] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [pfp, setPfp] = useState(details?.profile?.pfp);
  const [pfpNftDetails, setPfpNftDetails] = useState(details?.profile?.pfpIsNft);
  useEffect(() => {
    if (locked == false) {
      setVis(visible);
    }
  }, [visible]);
  function _setIsEditing(vis) {
    setIsEditing(vis);
    setLocked(vis);
  }
  function callbackNftUpdate(url, details) {
    setPfp(url);
    setPfpNftDetails(details);
  }
  async function logout() {
    let res = orbis.logout();
    setUser(null);
  }
  if (vis == false) {
    return null;
  }
  return /*#__PURE__*/React.createElement("div", {
    className: styles.userPopupContainer,
    style: {
      position: position
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: styles.userPopupContent,
    style: {
      background: theme?.bg?.secondary ? theme.bg.secondary : defaultTheme.bg.secondary,
      borderColor: theme?.border?.main ? theme.border.main : defaultTheme.border.main
    }
  }, isEditing ? /*#__PURE__*/React.createElement(UserEditProfile, {
    setIsEditing: _setIsEditing,
    setShowProfileModal: setShowProfileModal,
    pfp: pfp,
    pfpNftDetails: pfpNftDetails
  }) : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: styles.userPopupTopDetailsContainer
  }, /*#__PURE__*/React.createElement(UserPfp, {
    details: details,
    hover: false
  }), /*#__PURE__*/React.createElement("div", {
    className: styles.userPopupDetailsContainer
  }, /*#__PURE__*/React.createElement("span", {
    className: styles.userPopupDetailsUsername,
    style: {
      color: getThemeValue("color", theme, "main"),
      ...getThemeValue("font", theme, "main")
    }
  }, /*#__PURE__*/React.createElement(Username, {
    details: details
  })), /*#__PURE__*/React.createElement("span", {
    className: styles.userPopupDetailsBadgeContainer
  }, /*#__PURE__*/React.createElement(UserBadge, {
    details: details
  }))), /*#__PURE__*/React.createElement("div", {
    className: styles.userPopupDetailsActionsContainer
  }, user && user.did == details.did ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Button, {
    color: "primary",
    onClick: () => _setIsEditing(true)
  }, "Edit", /*#__PURE__*/React.createElement(EditIcon, null)), /*#__PURE__*/React.createElement("span", {
    style: {
      marginLeft: 7,
      cursor: "pointer",
      color: getThemeValue("color", theme, "main")
    },
    onClick: () => logout()
  }, /*#__PURE__*/React.createElement(LogoutIcon, null))) : /*#__PURE__*/React.createElement(FollowButton, {
    did: details.did
  }))), user && user.did == details.did && !user.encrypted_email && /*#__PURE__*/React.createElement(Alert, {
    title: /*#__PURE__*/React.createElement(AddEmailAddress, null),
    style: {
      backgroundColor: getThemeValue("bg", theme, "main"),
      color: getThemeValue("color", theme, "main"),
      borderColor: "#FF3162",
      marginTop: 12
    }
  }), details?.profile?.description && /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: "0.5rem"
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      ...getThemeValue("font", theme, "secondary"),
      lineHeight: "inherit",
      color: getThemeValue("color", theme, "secondary")
    }
  }, details.profile.description)), /*#__PURE__*/React.createElement(UserCredentials, {
    details: details
  }), /*#__PURE__*/React.createElement("div", {
    className: styles.userPopupFooterContainer
  }, /*#__PURE__*/React.createElement("div", {
    className: styles.userPopupFooterFollowers,
    style: {
      borderColor: theme?.border?.main ? theme.border.main : defaultTheme.border.main
    }
  }, /*#__PURE__*/React.createElement("p", {
    className: styles.userPopupFooterFollowTitle,
    style: {
      ...getThemeValue("font", theme, "main"),
      fontWeight: 400,
      fontSize: 13,
      color: getThemeValue("color", theme, "secondary")
    }
  }, "Followers"), /*#__PURE__*/React.createElement("p", {
    className: styles.userPopupFooterFollowCount,
    style: {
      ...getThemeValue("font", theme, "secondary"),
      fontSize: 15,
      color: getThemeValue("color", theme, "main")
    }
  }, details.count_followers)), /*#__PURE__*/React.createElement("div", {
    className: styles.userPopupFooterFollowing
  }, /*#__PURE__*/React.createElement("p", {
    className: styles.userPopupFooterFollowTitle,
    style: {
      ...getThemeValue("font", theme, "main"),
      fontWeight: 400,
      fontSize: 13,
      color: getThemeValue("color", theme, "secondary")
    }
  }, "Following"), /*#__PURE__*/React.createElement("p", {
    className: styles.userPopupFooterFollowCount,
    style: {
      ...getThemeValue("font", theme, "secondary"),
      fontSize: 15,
      color: getThemeValue("color", theme, "main")
    }
  }, details.count_following))))), showProfileModal && /*#__PURE__*/React.createElement(UpdateProfileModal, {
    hide: () => setShowProfileModal(false),
    callbackNftUpdate: callbackNftUpdate
  }));
};

/** Component with the email address field and respective loading state */
const AddEmailAddress = () => {
  const {
    orbis,
    user,
    setUser,
    theme
  } = useOrbis();
  const [email, setEmail] = useState("");
  const [savingEmail, setSavingEmail] = useState(false);

  /** Will encrypt the email and save in Ceramic */
  async function saveEmail() {
    if (!email || email == "") {
      alert("Email is required.");
      return;
    }
    setSavingEmail(true);
    let res = await orbis.setEmail(email);
    console.log("res:", res);
    if (res.status == 200) {
      let _user = {
        ...user
      };
      _user.encrypted_email = res.encryptedEmail;
      console.log("_user:", _user);
      setUser(_user);
      setSavingEmail(false);
    }
  }
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column"
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      ...getThemeValue("font", theme, "secondary"),
      fontSize: 13,
      marginTop: 0,
      marginBottom: 8,
      textAlign: "center",
      color: getThemeValue("color", theme, "secondary")
    }
  }, "Add your email address to receive notifications for replies and mentions."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "row",
      alignItems: "center"
    }
  }, /*#__PURE__*/React.createElement(Input, {
    type: "text",
    name: "email",
    value: email,
    onChange: e => setEmail(e.target.value),
    disabled: savingEmail,
    placeholder: "Your email address",
    style: {
      ...getStyle("input", theme, savingEmail),
      marginTop: "0rem",
      width: "auto",
      flex: 1,
      marginRight: 8
    }
  }), savingEmail ? /*#__PURE__*/React.createElement(Button, {
    color: "secondary"
  }, /*#__PURE__*/React.createElement(LoadingCircle, null)) : /*#__PURE__*/React.createElement(Button, {
    color: "secondary",
    onClick: () => saveEmail()
  }, "Save")));
};

/** Load and display credentials for this user */
function UserCredentials({
  details
}) {
  const {
    orbis,
    user,
    theme
  } = useOrbis();
  const [credentials, setCredentials] = useState([]);
  const [credentialsLoading, setCredentialsLoading] = useState(false);
  useEffect(() => {
    loadCredentials();
  }, []);

  /** Load credentials for this user with Orbis SDK */
  async function loadCredentials() {
    setCredentialsLoading(true);
    let {
      data,
      error,
      status
    } = await orbis.api.rpc("get_verifiable_credentials", {
      q_subject: details.did,
      q_min_weight: 10
    });
    setCredentials(data);
    setCredentialsLoading(false);
  }
  const LoopCredentials = () => {
    if (credentials && credentials.length > 0) {
      return credentials.map((credential, key) => {
        return /*#__PURE__*/React.createElement(UserCredential, {
          credential: credential,
          key: key
        });
      });
    } else {
      return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Alert, {
        title: "User doesn't have any credentials yet.",
        style: {
          width: "100%",
          backgroundColor: getThemeValue("bg", theme, "main"),
          color: getThemeValue("color", theme, "main")
        }
      }));
    }
  };
  return /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 15,
      marginBottom: 15
    }
  }, /*#__PURE__*/React.createElement("p", {
    className: styles.userPopupFooterFollowTitle,
    style: {
      ...getThemeValue("font", theme, "main"),
      fontWeight: 400,
      fontSize: 13,
      color: theme?.color?.secondary ? theme.color.secondary : defaultTheme.color.secondary
    }
  }, "Credentials:"), /*#__PURE__*/React.createElement("div", {
    className: styles.userPopupCredentialsContainer
  }, credentialsLoading ? /*#__PURE__*/React.createElement("div", {
    className: styles.loadingContainer,
    style: {
      color: getThemeValue("color", theme, "main")
    }
  }, /*#__PURE__*/React.createElement(LoadingCircle, null)) : /*#__PURE__*/React.createElement(LoopCredentials, null)));
}

/** Display one credential */
export function UserCredential({
  credential,
  showTooltip = true
}) {
  const {
    theme
  } = useOrbis();
  function clean(str) {
    if (str) {
      return str.toLowerCase().replaceAll(" ", "").replaceAll("-", "_");
    }
  }
  const CredentialIcon = () => {
    let protocol = credential.content?.credentialSubject?.protocol;
    if (protocol) {
      switch (clean(protocol)) {
        case "opensea":
          return /*#__PURE__*/React.createElement(OpenSeaIcon, null);
        case "uniswap":
          return /*#__PURE__*/React.createElement(UniswapIcon, null);
        case "thegraph":
          return /*#__PURE__*/React.createElement(TheGraphIcon, null);
        case "lido":
          return /*#__PURE__*/React.createElement(LidoIcon, null);
        case "sushiswap":
          return /*#__PURE__*/React.createElement(SushiIcon, null);
        case "hop":
          return /*#__PURE__*/React.createElement(HopIcon, null);
        case "snapshot":
          return /*#__PURE__*/React.createElement(SnapshotIcon, null);
        case "sismo":
          return /*#__PURE__*/React.createElement(SismoIcon, null);
        case "x2y2":
          return /*#__PURE__*/React.createElement(X2Y2Icon, null);
        case "looksrare":
          return /*#__PURE__*/React.createElement(LooksRareIcon, null);
        case "email":
          return /*#__PURE__*/React.createElement(EmailCredentialIcon, null);
        case "nonces":
          switch (credential.content?.credentialSubject?.type) {
            case "active-wallet-mainnet":
              return /*#__PURE__*/React.createElement(EthereumIcon, null);
            case "active-wallet-polygon":
              return /*#__PURE__*/React.createElement(PolygonIcon, null);
            case "active-wallet-arbitrum":
              return /*#__PURE__*/React.createElement(ArbitrumIcon, null);
            case "active-wallet-optimism":
              return /*#__PURE__*/React.createElement(OptimismIcon, null);
            default:
              return null;
          }
          ;
        case "evm":
          switch (credential.content?.credentialSubject?.type) {
            case "active-wallet-mainnet":
              return /*#__PURE__*/React.createElement(EthereumIcon, null);
            case "active-wallet-polygon":
              return /*#__PURE__*/React.createElement(PolygonIcon, null);
            case "active-wallet-arbitrum":
              return /*#__PURE__*/React.createElement(ArbitrumIcon, null);
            case "active-wallet-optimism":
              return /*#__PURE__*/React.createElement(OptimismIcon, null);
            default:
              return null;
          }
          ;
        default:
          return null;
      }
    } else {
      return null;
    }
  };

  /** Orbis credentials */
  if (credential.content && credential.issuer == "did:key:z6mkfglpulq7vvxu93xrh1mlgha5fmutcgmuwkz1vuwt3qju") {
    if (credential.content.credentialSubject.protocol == "nonces" || credential.content.credentialSubject.protocol == "EVM") {
      return /*#__PURE__*/React.createElement(Badge, {
        style: {
          ...getStyle("badge", theme, clean(credential.content.credentialSubject.type)),
          ...getThemeValue("font", theme, "badges")
        },
        tooltip: showTooltip ? credential.content.credentialSubject.description : null
      }, /*#__PURE__*/React.createElement(CredentialIcon, null), credential.content.credentialSubject.name);
    } else {
      return /*#__PURE__*/React.createElement(Badge, {
        style: getStyle("badge", theme, clean(credential.content?.credentialSubject.protocol)),
        tooltip: showTooltip ? credential.content.credentialSubject.description : null
      }, /*#__PURE__*/React.createElement(CredentialIcon, null), credential.content.credentialSubject.name);
    }
  }

  /** Gitcoin credentials */else if (credential.issuer == "did:key:z6mkghvghlobledj1bgrlhs4lpgjavbma1tn2zcryqmyu5lc") {
    return /*#__PURE__*/React.createElement(Badge, {
      style: {
        backgroundColor: "#FFF"
      }
    }, /*#__PURE__*/React.createElement(GitcoinProvider, {
      credential: credential
    }));
  }
}
const GitcoinProvider = ({
  credential
}) => {
  /** Default provider */
  let provider = /*#__PURE__*/React.createElement("div", {
    className: "verified-credential-type"
  }, /*#__PURE__*/React.createElement("span", null, credential.content?.credentialSubject?.provider));

  /** Num Gitcoin Grants contributed to */
  if (credential.content?.credentialSubject?.provider.includes('GitcoinContributorStatistics#numGrantsContributeToGte#')) {
    let numGrantsContributeTo = credential.content?.credentialSubject?.provider.replace('GitcoinContributorStatistics#numGrantsContributeToGte#', '');
    provider = /*#__PURE__*/React.createElement("div", {
      className: "verified-credential-type"
    }, /*#__PURE__*/React.createElement("span", {
      className: "inline-block break-word"
    }, "Contributed to at least ", /*#__PURE__*/React.createElement("span", {
      className: "primary bold mleft-3"
    }, numGrantsContributeTo), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("img", {
      src: "/img/icons/gitcoin-logo.png",
      height: "19",
      className: "mleft-3 mright-4"
    }), " grants")));
  }

  /** Value contribution Grants total */
  if (credential.content?.credentialSubject?.provider.includes('GitcoinContributorStatistics#totalContributionAmountGte#')) {
    let totalContributionAmountGte = credential.content?.credentialSubject?.provider.replace('GitcoinContributorStatistics#totalContributionAmountGte#', '');
    provider = /*#__PURE__*/React.createElement("div", {
      className: "verified-credential-type"
    }, /*#__PURE__*/React.createElement("span", {
      className: "inline-block break-word"
    }, "Contributed more than ", /*#__PURE__*/React.createElement("span", {
      className: "primary bold mleft-3"
    }, totalContributionAmountGte, " ETH to "), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("img", {
      src: "/img/icons/gitcoin-logo.png",
      height: "19",
      className: "mleft-3 mright-4"
    }), " grants")));
  }

  /** Num Gitcoin Rounds contributed to */
  if (credential.content?.credentialSubject?.provider.includes('GitcoinContributorStatistics#numRoundsContributedToGte#')) {
    let numRoundsContributedToGte = credential.content?.credentialSubject?.provider.replace('GitcoinContributorStatistics#numRoundsContributedToGte#', '');
    provider = /*#__PURE__*/React.createElement("div", {
      className: "verified-credential-type"
    }, /*#__PURE__*/React.createElement("span", {
      className: "inline-block break-word"
    }, "Contributed to at least ", /*#__PURE__*/React.createElement("span", {
      className: "primary bold mleft-3"
    }, numRoundsContributedToGte, " "), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("img", {
      src: "/img/icons/gitcoin-logo.png",
      height: "19",
      className: "mleft-3 mright-4"
    }), " rounds")));
  }

  /** Num Gitcoin contributions for GR14 to */
  if (credential.content?.credentialSubject?.provider.includes('GitcoinContributorStatistics#numGr14ContributionsGte#')) {
    let numGr14ContributionsGte = credential.content?.credentialSubject?.provider.replace('GitcoinContributorStatistics#numGr14ContributionsGte#', '');
    provider = /*#__PURE__*/React.createElement("div", {
      className: "verified-credential-type"
    }, /*#__PURE__*/React.createElement("span", {
      className: "inline-block break-word"
    }, "Contributed to at least ", /*#__PURE__*/React.createElement("span", {
      className: "primary bold mleft-3"
    }, numGr14ContributionsGte, " "), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("img", {
      src: "/img/icons/gitcoin-logo.png",
      height: "19",
      className: "mleft-3 mright-4"
    }), " grant(s) in GR14")));
  }

  /** Amount of Twitter followers GT */
  if (credential.content?.credentialSubject?.provider.includes('TwitterFollowerGT')) {
    let countTwitterFollowers = credential.content?.credentialSubject?.provider.replace('TwitterFollowerGT', '');
    provider = /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(TwitterIcon, {
      style: {
        marginRight: 4,
        color: "#1DA1F2"
      }
    }), /*#__PURE__*/React.createElement("span", null, "Followers ", /*#__PURE__*/React.createElement("span", {
      className: "primary bold"
    }, ` > `), " ", countTwitterFollowers));
  }

  /** Amount of Twitter followers GTE */
  if (credential.content?.credentialSubject?.provider.includes('TwitterFollowerGTE')) {
    let countTwitterFollowersGte = credential.content?.credentialSubject?.provider.replace('TwitterFollowerGTE', '');
    provider = /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(TwitterIcon, {
      style: {
        marginRight: 4,
        color: "#1DA1F2"
      }
    }), /*#__PURE__*/React.createElement("span", null, "Followers ", /*#__PURE__*/React.createElement("span", {
      className: "primary bold"
    }, ` > `), " ", countTwitterFollowersGte));
  }

  /** Amount of tweets */
  if (credential.content?.credentialSubject?.provider.includes('TwitterTweetGT')) {
    let countTweets = credential.content?.credentialSubject?.provider.replace('TwitterTweetGT', '');
    provider = /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(TwitterIcon, {
      style: {
        marginRight: 4,
        color: "#1DA1F2"
      }
    }), /*#__PURE__*/React.createElement("span", null, "Tweets ", /*#__PURE__*/React.createElement("span", {
      className: "primary bold"
    }, ` > `), " ", countTweets));
  }

  /** GTC possession */
  if (credential.content?.credentialSubject?.provider.includes('gtcPossessionsGte')) {
    let countGtc = credential.content?.credentialSubject?.provider.replace('gtcPossessionsGte#', '');
    provider = /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("span", null, "Owns at least ", /*#__PURE__*/React.createElement("span", {
      className: "primary bold"
    }, countGtc)), /*#__PURE__*/React.createElement("img", {
      src: "/img/icons/gtc-logo.webp",
      height: "15",
      className: "mright-4 mleft-4"
    }), /*#__PURE__*/React.createElement("span", {
      className: "primary bold"
    }, "GTC"));
  }
  switch (credential.content?.credentialSubject?.provider) {
    /** User has a Twitter account */
    case 'Twitter':
      provider = /*#__PURE__*/React.createElement(React.Fragment, null, "Has a ", /*#__PURE__*/React.createElement(TwitterIcon, {
        style: {
          marginLeft: 3,
          marginRight: 3,
          color: "#1DA1F2"
        }
      }), " account");
      break;

    /** User has a Github account */
    case 'Github':
      provider = /*#__PURE__*/React.createElement(React.Fragment, null, "Has a ", /*#__PURE__*/React.createElement(GithubIcon, {
        style: {
          marginLeft: 3,
          marginRight: 3
        }
      }), " account");
      break;

    /** Has starred Github repository */
    case 'StarredGithubRepoProvider':
      provider = /*#__PURE__*/React.createElement(React.Fragment, null, "Has stars on ", /*#__PURE__*/React.createElement(GithubIcon, {
        style: {
          marginLeft: 3,
          marginRight: 3
        }
      }), " repositories");
      break;

    /** Has more than 10 followers */
    case 'TenOrMoreGithubFollowers':
      provider = /*#__PURE__*/React.createElement(React.Fragment, null, "Has at least 10 ", /*#__PURE__*/React.createElement(GithubIcon, {
        style: {
          marginLeft: 3,
          marginRight: 3
        }
      }), " followers");
      break;

    /** Has forked Github repositories */
    case 'ForkedGithubRepoProvider':
      provider = /*#__PURE__*/React.createElement(React.Fragment, null, "Forked some ", /*#__PURE__*/React.createElement(GithubIcon, {
        style: {
          marginLeft: 3,
          marginRight: 3
        }
      }), " repositories");
      break;

    /** User has more than 5 Github repositories */
    case 'FiveOrMoreGithubRepos':
      provider = /*#__PURE__*/React.createElement(React.Fragment, null, "Owns at least ", /*#__PURE__*/React.createElement("span", {
        className: "primary bold"
      }, "5"), " ", /*#__PURE__*/React.createElement(GithubIcon, {
        style: {
          marginLeft: 3,
          marginRight: 3
        }
      }), " repositories");
      break;

    /** User has a Proof of Humanity */
    case 'Poh':
      provider = /*#__PURE__*/React.createElement(React.Fragment, null, "Human on Proof of Humanity");
      break;

    /** User has an ENS name */
    case 'Ens':
      provider = /*#__PURE__*/React.createElement(React.Fragment, null, "Has an ENS name");
      break;

    /** User has a Discord account */
    case 'Discord':
      provider = /*#__PURE__*/React.createElement(React.Fragment, null, "Has a ", /*#__PURE__*/React.createElement("img", {
        src: "/img/icons/discord-logo.png",
        height: "17",
        className: "mleft-4 mright-4"
      }), " account");
      break;

    /** User has a Linkedin account */
    case 'Linkedin':
      provider = /*#__PURE__*/React.createElement(React.Fragment, null, "Has a ", /*#__PURE__*/React.createElement("img", {
        src: "/img/icons/linkedin-logo.png",
        height: "17",
        className: "mleft-4 mright-4"
      }), " account");
      break;

    /** User has a Google account */
    case 'Google':
      provider = /*#__PURE__*/React.createElement(React.Fragment, null, "Has a ", /*#__PURE__*/React.createElement(GoogleIcon, {
        style: {
          marginLeft: 3,
          marginRight: 3
        }
      }), " account");
      break;

    /** User has an Facebook account */
    case 'Facebook':
      provider = /*#__PURE__*/React.createElement("div", {
        className: "verified-credential-type"
      }, /*#__PURE__*/React.createElement("span", {
        className: "inline-block break-word"
      }, "Has a ", /*#__PURE__*/React.createElement("img", {
        src: "/img/icons/facebook-logo.png",
        height: "17",
        className: "mleft-4 mright-4"
      }), " account"));
      break;

    /** User has an Facebook profile picture */
    case 'FacebookProfilePicture':
      provider = /*#__PURE__*/React.createElement("div", {
        className: "verified-credential-type"
      }, /*#__PURE__*/React.createElement("span", {
        className: "inline-block break-word"
      }, "Has a ", /*#__PURE__*/React.createElement("img", {
        src: "/img/icons/facebook-logo.png",
        height: "17",
        className: "mleft-4 mright-4"
      }), " profile picture"));
      break;

    /** User has an Facebook account */
    case 'Brightid':
      provider = /*#__PURE__*/React.createElement("div", {
        className: "verified-credential-type"
      }, /*#__PURE__*/React.createElement("span", {
        className: "inline-block break-word"
      }, "Verified on ", /*#__PURE__*/React.createElement("img", {
        src: "/img/icons/brightid-logo.png",
        height: "17",
        className: "mleft-4 mright-4"
      })));
      break;

    /** Wallet with more than one transaction */
    case "EthGTEOneTxnProvider":
      provider = /*#__PURE__*/React.createElement("div", {
        className: "verified-credential-type"
      }, /*#__PURE__*/React.createElement("span", {
        className: "inline-block break-word"
      }, "Wallet with ", /*#__PURE__*/React.createElement("span", {
        className: "primary bold mleft-4 mright-4"
      }, ` >= 1 `), " Txn"));
      break;

    /** Wallet owns more than 1 ETH */
    case "ethPossessionsGte#1":
      provider = /*#__PURE__*/React.createElement("div", {
        className: "verified-credential-type"
      }, /*#__PURE__*/React.createElement("span", {
        className: "inline-block break-word"
      }, "Wallet with ", /*#__PURE__*/React.createElement("span", {
        className: "primary bold mleft-4 mright-4"
      }, ` >= 1 `), " ETH"));
      break;

    /** Voted on Snapshot */
    case "SnapshotVotesProvider":
      provider = /*#__PURE__*/React.createElement("div", {
        className: "verified-credential-type"
      }, /*#__PURE__*/React.createElement("span", {
        className: "inline-block break-word"
      }, "Voted on ", /*#__PURE__*/React.createElement("span", {
        className: "primary bold mleft-4 mright-4"
      }, `Snapshot`)));
      break;
  }
  return provider;
};

/** Follow button component */
export function FollowButton({
  did
}) {
  const {
    orbis,
    user,
    theme
  } = useOrbis();
  const [loading, setLoading] = useState(false);
  const [following, setFollowing] = useState(false);
  const [followHoverRef, isFollowHovered] = useHover();

  /** Will check if user connected is already following this did */
  useEffect(() => {
    if (user) {
      getFollowing();
    }
    async function getFollowing() {
      setLoading(true);
      let {
        data,
        error
      } = await orbis.getIsFollowing(user.did, did);
      if (data) {
        setFollowing(data);
      }
      setLoading(false);
    }
  }, [user, did]);

  /** Will follow / unfollow the user  */
  async function follow(active) {
    setLoading(true);
    let res = await orbis.setFollow(did, active);

    /** Update status according to result from Orbis SDK */
    switch (res.status) {
      case 200:
        setFollowing(active);
        break;
      default:
        console.log("Error following user: ", res);
        break;
    }

    /** Remove loading state */
    setLoading(false);
  }

  /** Returns loading state */
  if (loading) {
    return /*#__PURE__*/React.createElement(Button, {
      color: "green"
    }, /*#__PURE__*/React.createElement(LoadingCircle, null));
  }
  if (following) {
    return /*#__PURE__*/React.createElement("div", {
      ref: followHoverRef
    }, isFollowHovered ? /*#__PURE__*/React.createElement(Button, {
      color: "red"
    }, "Unfollow") : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Button, {
      color: "green-transparent"
    }, /*#__PURE__*/React.createElement(CheckIcon, {
      color: getThemeValue("color", theme, "green"),
      style: {
        marginRight: "0.25rem"
      }
    }), "Following")));
  }
  return /*#__PURE__*/React.createElement(Button, {
    color: "green",
    onClick: () => follow(true)
  }, "Follow");
}

/** Form to update user profile */
function UserEditProfile({
  setIsEditing,
  setShowProfileModal,
  pfp,
  pfpNftDetails
}) {
  const {
    orbis,
    user,
    setUser,
    theme
  } = useOrbis();
  const [username, setUsername] = useState(user?.profile?.username ? user.profile.username : "");
  const [email, setEmail] = useState("");
  const [description, setDescription] = useState(user?.profile?.description ? user.profile.description : "");
  const [status, setStatus] = useState(0);
  useEffect(() => {
    if (user?.encrypted_email) {
      decryptEmail();
    }
    async function decryptEmail() {
      try {
        let _email = await decryptString(user.encrypted_email, "ethereum", localStorage);
        if (_email) {
          setEmail(_email.result);
        }
        console.log("Decrypted email:", _email);
      } catch (e) {
        console.log("Error decrypting email:", e);
        setEmail("•••••••••••••");
      }
    }
  }, [user]);
  async function save() {
    if (status != 0) {
      console.log("Already saving.");
      return;
    }
    setStatus(1);

    /** Update profile using the Orbis SDK */
    let profile = {
      ...user.profile
    };
    profile.username = username;
    profile.description = description;
    profile.pfp = pfp ? pfp : null;

    /** Add pfp nft details if any */
    if (pfpNftDetails) {
      profile.pfpIsNft = pfpNftDetails;
    }

    /** Update profile using Orbis SDK */
    let res = await orbis.updateProfile(profile);
    if (res.status == 200) {
      setStatus(2);
      let _user = {
        ...user
      };
      _user.profile = profile;
      console.log("Updating user to: ", _user);
      setUser(_user);
      await sleep(1500);
      setIsEditing(false);
      setStatus(0);
    } else {
      setStatus(3);
    }
  }
  const SaveButton = () => {
    switch (status) {
      /** Submit state */
      case 0:
        return /*#__PURE__*/React.createElement(Button, {
          color: "primary",
          onClick: () => save()
        }, "Save");

      /** Loading state */
      case 1:
        return /*#__PURE__*/React.createElement(Button, {
          color: "primary"
        }, /*#__PURE__*/React.createElement(LoadingCircle, null), " Saving");
      /** Success state */
      case 2:
        return /*#__PURE__*/React.createElement(Button, {
          color: "green"
        }, "Saved");
      /** Error state */
      case 3:
        return /*#__PURE__*/React.createElement(Button, {
          color: "red"
        }, "Error");
      default:
        return null;
    }
  };
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: styles.userEditContainer
  }, /*#__PURE__*/React.createElement("div", {
    className: styles.userEditPfpContainer
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: "relative",
      width: 44,
      height: 44
    }
  }, /*#__PURE__*/React.createElement(UserPfp, {
    details: {
      profile: {
        pfp: pfp
      }
    },
    showBadge: false
  }), /*#__PURE__*/React.createElement("div", {
    className: styles.userEditPfpOverlay,
    style: {
      background: "rgba(0,0,0,0.5)",
      top: 0,
      width: "100%",
      height: "100%"
    },
    onClick: () => setShowProfileModal(true)
  }, /*#__PURE__*/React.createElement(EditIcon, null)))), /*#__PURE__*/React.createElement("div", {
    className: styles.userEditButtonContainer,
    onClick: () => setIsEditing(false)
  }, /*#__PURE__*/React.createElement(Button, {
    color: "secondary"
  }, "Cancel"))), /*#__PURE__*/React.createElement("div", {
    className: styles.userFieldsContainer
  }, /*#__PURE__*/React.createElement(Input, {
    type: "text",
    name: "username",
    value: username,
    onChange: e => setUsername(e.target.value),
    placeholder: "Your username",
    style: getStyle("input", theme, status == 1)
  }), /*#__PURE__*/React.createElement(Input, {
    type: "textarea",
    name: "description",
    value: description,
    onChange: e => setDescription(e.target.value),
    placeholder: "Enter your description",
    style: {
      ...getStyle("input", theme, status == 1),
      marginTop: "0.5rem"
    }
  }), user.encrypted_email && /*#__PURE__*/React.createElement("p", {
    style: {
      ...getThemeValue("font", theme, "secondary"),
      textAlign: "left",
      fontSize: 13,
      marginTop: 8,
      color: getThemeValue("color", theme, "secondary")
    }
  }, /*#__PURE__*/React.createElement("b", null, "Email"), ": ", email, " ", user.hasLit == false && /*#__PURE__*/React.createElement("span", {
    style: {
      display: "inline-block"
    }
  }, /*#__PURE__*/React.createElement(ConnectButton, {
    icon: null,
    title: "Decrypt email",
    litOnly: true,
    style: {
      fontSize: 13,
      background: "transparent",
      boxShadow: "none",
      padding: 0,
      color: getThemeValue("color", theme, "active")
    }
  })))), /*#__PURE__*/React.createElement("div", {
    className: styles.userFieldsSaveContainer
  }, /*#__PURE__*/React.createElement(SaveButton, null)));
}
export default User;