import React, { useState, useEffect, useRef, useContext } from "react";
import ConnectButton from "../ConnectButton";
import LoadingCircle from "../LoadingCircle";
import AccessRulesModal from "../AccessRulesModal";
import Button from "../Button";
import Input from "../Input";
import Alert from "../Alert";
import User, { UserPfp, Username, UserPopup } from "../User";
import { getTimestamp } from "../../utils";
import { defaultTheme, getThemeValue, getStyle } from "../../utils/themes";
import { CommentsContext } from "../../contexts/CommentsContext";
import { Logo, LockIcon, UnlockIcon, SendIcon } from "../../icons";
import useHover from "../../hooks/useHover";
import useOrbis from "../../hooks/useOrbis";

/** Import CSS */
import styles from './Postbox.module.css';

/** Init mentions object */
let mentions = [];

/** Display postbox or connect CTA */
export default function Postbox({
  showPfp = true,
  connecting,
  reply = null,
  callback,
  minInputHeight = 50,
  defaultPost,
  setEditPost,
  ctaTitle = "Comment",
  ctaStyle = styles.postboxShareContainerBtn,
  placeholder = "Add your comment...",
  master,
  ascending = false
}) {
  const {
    user,
    setUser,
    orbis,
    theme,
    context,
    accessRules,
    hasAccess
  } = useOrbis();
  const {
    comments,
    setComments
  } = useContext(CommentsContext);
  const [sharing, setSharing] = useState(false);
  const [hoverRef, isHovered] = useHover();
  const [body, setBody] = useState("");
  const [accessRulesModalVis, setAccessRulesModalVis] = useState(false);
  const postbox = useRef();

  /** Manage mentions */
  const [mentionsBoxVis, setMentionsBoxVis] = useState(false);
  const [focusOffset, setFocusOffset] = useState(null);
  const [focusNode, setFocusNode] = useState(null);

  /** If user is editing a post we use the content as the default post */
  useEffect(() => {
    if (defaultPost) {
      if (postbox.current) {
        postbox.current.textContent = defaultPost.content.body;
        setBody(defaultPost.content.body);
      }
    }
  }, [defaultPost, postbox]);

  /** Will autofocus the textarea if user is replying to a post */
  useEffect(() => {
    if (reply && postbox) {
      postbox.current.focus();
    }
  }, [reply]);

  /** Will cancel the edit post action using the `setEditPost` function passed as a parameter */
  function cancelEdit() {
    setEditPost(false);
  }

  /** Share a post on orbis */
  const handleSubmit = async event => {
    event.preventDefault();
    if (sharing) {
      console.log("A request is already being processed.");
      return;
    }
    setSharing(true);

    // Get the form data from the event object
    const formData = new FormData(event.target);

    /** Decide which `master` and `reply_to` we should use */
    if (!master) {
      if (reply && reply.content.master) {
        master = reply.content.master;
      } else if (reply) {
        master = reply.stream_id;
      }
    }

    /** Create new post or edit existing post */
    if (defaultPost) {
      let _contentEdit = {
        ...defaultPost.content
      };
      _contentEdit.body = body;
      let res = await orbis.editPost(defaultPost.stream_id, _contentEdit);
      if (callback) {
        callback(_contentEdit);
      }
    } else {
      let _contentCreate = {
        body: body,
        context: context ? context : null,
        master: master,
        reply_to: reply ? reply.stream_id : master,
        mentions: mentions
      };
      let res = await orbis.createPost(_contentCreate);

      /** Return results */
      if (res.status == 200) {
        if (comments) {
          /** Add new comment on the top or bottom based on `ascending` parameter passed */
          if (ascending == false) {
            setComments([{
              timestamp: getTimestamp(),
              creator_details: user,
              creator: user.did,
              stream_id: res.doc,
              content: _contentCreate,
              count_likes: 0,
              reply_to: _contentCreate.reply,
              reply_to_details: reply ? reply.content : null,
              reply_to_creator_details: reply ? reply.creator_details : null
            }, ...comments]);
          } else {
            setComments([...comments, {
              timestamp: getTimestamp(),
              creator_details: user,
              creator: user.did,
              stream_id: res.doc,
              content: _contentCreate,
              count_likes: 0
            }]);
          }
        }
      } else {
        console.log("Error submitting form:", res);
      }
      if (callback) {
        callback();
      }
    }

    /** Manage success */
    if (postbox.current) {
      postbox.current.value = "";
    }

    /** Reset postbox */
    setBody(null);
    mentions = [];
    if (postbox.current) {
      postbox.current.textContent = "";
      //postbox.current.focus();
    }

    setSharing(false);
  };

  /** Track input to use mention box */
  async function handleInput(e) {
    let inputValue = e.currentTarget.innerText;
    let keyCode = e.nativeEvent.data;

    /** Manage custom actions for some keycodes */
    switch (keyCode) {
      /** Pressing @ will trigger the opening of the mentions box */
      case "@":
        if (user.nonces && user.nonces?.global <= 0 && user.a_r <= 1) {
          return;
        } else {
          setMentionsBoxVis(true);
        }
        console.log("Should show mention box!");
        break;

      /** Hide mentions box when pressed enter */
      case " ":
        //setMentionsBoxVis(false);
        postbox?.current.focus();
        break;
      default:
        setMentionsBoxVis(false);
        break;
    }

    /** Save current position of the caret to make sure we paste at the correct location. */
    setBody(inputValue);
    saveCaretPos(document.getSelection());
  }

  /** Save the position of the caret */
  function saveCaretPos(_sel) {
    setFocusOffset(_sel.focusOffset);
    setFocusNode(_sel.focusNode);
  }
  ;
  function addMention(mention) {
    console.log("Adding user:", mention);
    /** Position caret at the correct position */
    restoreCaretPos();

    /** Save username to did  */
    let _mentionName = mention.profile?.username?.replaceAll(" ", "");
    mentions.push({
      username: "@" + _mentionName,
      did: mention.did
    });

    /** Add mention tag */
    var _mentionTag = "<span style='color: " + getThemeValue("color", theme, "active") + "; font-weight: " + 500 + ";' class='mention' contentEditable='false' data-did='" + mention.did + "'>@" + _mentionName + "</span>&nbsp;";

    /** Remove last character from content to avoid having two '@' */
    document.execCommand("delete", null, false);

    /** Use paste to add mention tag */
    document.execCommand("insertHTML", false, _mentionTag);
    console.log("Trying to paste mention:", _mentionTag);
    //setBody(body +  <span style={{color: "blue"}}>{_mentionName}</span> + " ")

    /** Hide mentions box */
    setMentionsBoxVis(false);
  }

  /** Restore the caret position after mention is added */
  function restoreCaretPos() {
    /** Focus on textarea */
    postbox.current.focus();
    var sel = document.getSelection();
    sel.collapse(focusNode, focusOffset);
  }
  ;
  if (user) {
    return /*#__PURE__*/React.createElement("div", {
      className: styles.postboxGlobalContainer
    }, showPfp && /*#__PURE__*/React.createElement("div", {
      className: styles.postboxUserContainer,
      ref: hoverRef
    }, /*#__PURE__*/React.createElement(UserPfp, {
      details: user,
      hover: true,
      showEmailCta: true
    })), /*#__PURE__*/React.createElement("div", {
      className: styles.postboxContainer
    }, /*#__PURE__*/React.createElement("form", {
      style: {
        width: "100%"
      },
      onSubmit: event => handleSubmit(event)
    }, /*#__PURE__*/React.createElement("div", {
      className: styles.postbox,
      style: {
        borderColor: getThemeValue("input", theme).border,
        backgroundColor: getThemeValue("input", theme, sharing).background
      }
    }, reply && /*#__PURE__*/React.createElement("div", {
      className: styles.postboxReplyContainer
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        marginRight: "0.25rem",
        color: theme?.color?.secondary ? theme.color.secondary : defaultTheme.color.secondary
      }
    }, "Replying to:"), /*#__PURE__*/React.createElement("div", {
      className: styles.postboxReplyBadge,
      style: {
        background: theme?.badges?.main?.bg ? theme.badges.main.bg : defaultTheme.badges.main.bg,
        color: theme?.badges?.main?.color ? theme.badges.main.color : defaultTheme.badges.main.color
      }
    }, /*#__PURE__*/React.createElement(Username, {
      details: reply.creator_details
    }))), hasAccess && /*#__PURE__*/React.createElement("div", {
      contentEditable: true,
      autoFocus: true,
      "data-placeholder": placeholder,
      ref: postbox,
      name: "body",
      id: "postbox-area",
      value: body,
      onChange: e => setBody(e.target.value),
      className: styles.postboxInput,
      style: {
        minHeight: minInputHeight,
        fontSize: 15,
        color: getThemeValue("input", theme, sharing).color,
        ...getThemeValue("font", theme, "secondary")
      },
      placeholder: placeholder,
      disabled: sharing,
      onInput: e => handleInput(e)
    }), /*#__PURE__*/React.createElement("div", {
      className: styles.postboxShareContainer
    }, accessRules && accessRules.length > 0 && /*#__PURE__*/React.createElement(AccessRulesDetails, {
      accessRules: accessRules,
      setAccessRulesModalVis: setAccessRulesModalVis,
      hasAccess: hasAccess
    }), sharing ? /*#__PURE__*/React.createElement("button", {
      type: "submit",
      className: ctaStyle,
      style: {
        background: "transparent",
        color: getThemeValue("color", theme, "main"),
        ...getThemeValue("font", theme, "buttons")
      }
    }, /*#__PURE__*/React.createElement(LoadingCircle, null), " Sending") : /*#__PURE__*/React.createElement(React.Fragment, null, defaultPost && /*#__PURE__*/React.createElement(Button, {
      color: "secondary",
      style: {
        marginRight: 5
      },
      onClick: () => setEditPost(false)
    }, "Cancel"), hasAccess ? /*#__PURE__*/React.createElement("button", {
      type: "submit",
      className: ctaStyle,
      style: {
        ...getStyle("button-main", theme, "main"),
        ...getThemeValue("font", theme, "buttons")
      }
    }, ctaTitle, /*#__PURE__*/React.createElement(SendIcon, null)) : /*#__PURE__*/React.createElement("button", {
      type: "submit",
      disabled: true,
      className: ctaStyle,
      style: {
        ...getStyle("button-main", theme, "main"),
        ...getThemeValue("font", theme, "buttons"),
        opacity: 0.7,
        marginTop: 10
      }
    }, /*#__PURE__*/React.createElement(LockIcon, {
      style: {
        marginRight: 5
      }
    }), "Locked"))))), mentionsBoxVis && /*#__PURE__*/React.createElement(MentionsBox, {
      add: addMention
    })), accessRulesModalVis && /*#__PURE__*/React.createElement(AccessRulesModal, {
      accessRules: accessRules,
      hide: () => setAccessRulesModalVis(false)
    }));
  } else {
    return /*#__PURE__*/React.createElement("div", {
      className: styles.postboxConnectContainer
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: "60%"
      }
    }, /*#__PURE__*/React.createElement(ConnectButton, {
      orbis: orbis
    }), accessRules && accessRules.length > 0 && /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: 10
      }
    }, /*#__PURE__*/React.createElement(AccessRulesDetails, {
      accessRules: accessRules,
      setAccessRulesModalVis: setAccessRulesModalVis,
      hasAccess: hasAccess,
      style: {
        justifyContent: "center"
      }
    }))), accessRulesModalVis && /*#__PURE__*/React.createElement(AccessRulesModal, {
      accessRules: accessRules,
      hide: () => setAccessRulesModalVis(false)
    }));
  }
}

/** Mentions Box Container */
export const MentionsBox = ({
  add
}) => {
  const {
    orbis,
    user,
    theme
  } = useOrbis();
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  useEffect(() => {
    if (search && search.length >= 2) {
      searchUsers();
    }
    async function searchUsers() {
      setLoading(true);
      let {
        data,
        error,
        status
      } = await orbis.getProfilesByUsername(search);
      setLoading(false);
      if (error) {
        console.log("Error querying Orbis usernames: ", error);
      }
      if (data) {
        setUsers(data);
      } else {
        setUsers([]);
      }
    }
  }, [search]);
  const LoopUsers = () => {
    if (!search || search == "" || search.length < 2) {
      return null;
    }
    if (loading) {
      return /*#__PURE__*/React.createElement("div", {
        className: styles.loadingContainer,
        style: {
          color: getThemeValue("color", theme, "main")
        }
      }, /*#__PURE__*/React.createElement(LoadingCircle, null));
    } else {
      if (users.length > 0) {
        return users.map((_user, key) => {
          return /*#__PURE__*/React.createElement("div", {
            className: styles.userResultContainer,
            onClick: () => add(_user.details),
            style: {
              fontSize: 15,
              color: theme?.color?.main ? theme.color.main : defaultTheme.color.main
            },
            key: key
          }, /*#__PURE__*/React.createElement(User, {
            details: _user.details,
            key: key,
            isLink: false
          }));
        });
      } else {
        return /*#__PURE__*/React.createElement("p", null, "No users");
      }
    }
  };
  return /*#__PURE__*/React.createElement("div", {
    className: styles.mentionsBoxContainer,
    style: {
      background: theme?.bg?.secondary ? theme.bg.secondary : defaultTheme.bg.secondary,
      borderColor: theme?.border?.main ? theme.border.main : defaultTheme.border.main
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: styles.mentionsBoxInputContainer
  }, /*#__PURE__*/React.createElement(Input, {
    autofocus: true,
    type: "text",
    name: "username",
    value: search,
    onChange: e => setSearch(e.target.value),
    placeholder: "Search username",
    style: {
      ...getStyle("input", theme, status == 1),
      borderRadius: 0,
      borderWidth: 0,
      borderBottomWidth: 1
    }
  })), search && search.length >= 2 ? /*#__PURE__*/React.createElement("div", {
    className: styles.userResults,
    style: {
      borderColor: theme?.border?.main ? theme.border.main : defaultTheme.border.main
    }
  }, /*#__PURE__*/React.createElement(LoopUsers, null)) : /*#__PURE__*/React.createElement("p", {
    className: styles.mentionsBoxEmptyState,
    style: {
      color: theme?.color?.secondary ? theme.color.secondary : defaultTheme.color.secondary
    }
  }, "Search by username to mention someone."));
};

/** This will display the gating details if any */
export const AccessRulesDetails = ({
  accessRules,
  setAccessRulesModalVis,
  style,
  hasAccess
}) => {
  const {
    user,
    setUser,
    orbis,
    theme,
    context
  } = useOrbis();
  useEffect(() => {
    getLabel();
  }, []);
  function getLabel(type) {
    let labelDesktop = "This discussion feed is gated. ";
    let labelMobile = "Discussion is gated. ";
    let countCredentialsRules = 0;
    let countDidRules = 0;
    let countTokenRules = 0;
    accessRules.forEach((rule, i) => {
      switch (rule.type) {
        case "credentials":
          countCredentialsRules++;
          break;
        case "did":
          countDidRules++;
          break;
        case "token":
          countTokenRules++;
          break;
        default:
      }
    });

    /** Token only gating */
    if (countTokenRules > 0 && countCredentialsRules == 0 && countDidRules == 0) {
      labelDesktop = "Discussion feed is token gated. ";
      labelMobile = "Discussion gated. ";
    }

    /** Credentials gated */
    if (countTokenRules == 0 && countCredentialsRules > 0 && countDidRules == 0) {
      labelDesktop = "Discussion feed is gated using credentials. ";
      labelMobile = "Discussion gated. ";
    }

    /** Users gated */
    if (countTokenRules == 0 && countCredentialsRules == 0 && countDidRules > 0) {
      labelDesktop = "Discussion feed is restricted to some users. ";
      labelMobile = "Discussion gated. ";
    }
    if (type == "mobile") {
      return labelMobile;
    }
    if (type == "desktop") {
      return labelDesktop;
    }
  }
  return /*#__PURE__*/React.createElement("div", {
    className: styles.accessRulesContainer,
    style: {
      color: getThemeValue("color", theme, "secondary"),
      ...style
    }
  }, user && hasAccess ? /*#__PURE__*/React.createElement(UnlockIcon, {
    style: {
      marginRight: 5,
      color: getThemeValue("color", theme, "secondary")
    }
  }) : /*#__PURE__*/React.createElement(LockIcon, {
    style: {
      marginRight: 5,
      color: getThemeValue("color", theme, "secondary")
    }
  }), /*#__PURE__*/React.createElement("span", {
    className: styles.postboxGatingTextMobile,
    style: {
      color: getThemeValue("color", theme, "secondary"),
      ...getThemeValue("font", theme, "secondary")
    }
  }, getLabel("mobile"), " ", /*#__PURE__*/React.createElement("span", {
    className: styles.hoverLink,
    style: {
      fontWeight: 500,
      color: getThemeValue("color", theme, "active")
    },
    onClick: () => setAccessRulesModalVis(true)
  }, "View rules")), /*#__PURE__*/React.createElement("span", {
    className: styles.postboxGatingTextDesktop,
    style: {
      color: getThemeValue("color", theme, "secondary"),
      ...getThemeValue("font", theme, "secondary")
    }
  }, getLabel("desktop"), "  ", /*#__PURE__*/React.createElement("span", {
    className: styles.hoverLink,
    style: {
      fontWeight: 500,
      color: getThemeValue("color", theme, "active")
    },
    onClick: () => setAccessRulesModalVis(true)
  }, "View")));
};
const KeyIcon = ({
  style
}) => {
  return /*#__PURE__*/React.createElement("svg", {
    width: "15",
    height: "15",
    viewBox: "0 0 24 24",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg",
    style: style
  }, /*#__PURE__*/React.createElement("g", {
    "clip-path": "url(#clip0_615_22)"
  }, /*#__PURE__*/React.createElement("path", {
    "fill-rule": "evenodd",
    "clip-rule": "evenodd",
    d: "M22.0763 7.22703C19.4402 4.59099 15.1664 4.59099 12.5303 7.22703C12.2519 7.50543 12.0026 7.80258 11.7825 8.11458C11.555 8.43707 11.2535 8.59835 10.986 8.59835L1.79505 8.59835C0.9994 8.59835 0.236339 8.91442 -0.326271 9.47703L-2.31891 11.4697C-2.61181 11.7626 -2.61181 12.2374 -2.31891 12.5303L0.332738 15.182C0.625632 15.4749 1.10051 15.4749 1.3934 15.182L2.45406 12.1213L3.51472 15.182C3.80761 15.4749 4.28249 15.4749 4.57538 15.182L5.63604 12.1213L6.6967 15.182C6.83735 15.3226 7.02812 15.4016 7.22703 15.4016H10.986C11.2535 15.4016 11.555 15.5629 11.7825 15.8854C12.0026 16.1974 12.2519 16.4946 12.5303 16.773C15.1664 19.409 19.4402 19.409 22.0763 16.773C24.7123 14.1369 24.7123 9.86307 22.0763 7.22703ZM19.955 9.34835C19.6621 9.05546 19.1872 9.05546 18.8943 9.34835C18.6014 9.64124 18.6014 10.1161 18.8943 10.409C19.773 11.2877 19.773 12.7123 18.8943 13.591C18.6014 13.8839 18.6014 14.3588 18.8943 14.6516C19.1872 14.9445 19.6621 14.9445 19.955 14.6516C21.4194 13.1872 21.4194 10.8128 19.955 9.34835Z",
    fill: "currentColor"
  })), /*#__PURE__*/React.createElement("defs", null, /*#__PURE__*/React.createElement("clipPath", {
    id: "clip0_615_22"
  }, /*#__PURE__*/React.createElement("rect", {
    width: "24",
    height: "24",
    fill: "transparent"
  }))));
};