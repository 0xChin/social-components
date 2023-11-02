import React, { useState, useEffect, useRef, useContext } from "react";
import { GlobalContext } from "../../contexts/GlobalContext";
import { UserPfp, Username, UserPopup, UserBadge } from "../User";
import Postbox from "../Postbox";
import Button from "../Button";
import LoadingCircle from "../LoadingCircle";
import useHover from "../../hooks/useHover";
import useOrbis from "../../hooks/useOrbis";
import useOutsideClick from "../../hooks/useOutsideClick";
import ReactTimeAgo from 'react-time-ago';
import { cleanBody } from "../../utils";
import { defaultTheme, getThemeValue } from "../../utils/themes";
import { MenuHorizontal, ReplyIcon, LikeIcon } from "../../icons";

/** Import CSS */
import styles from './Post.module.css';

/** For Markdown support */
import { marked } from 'marked';

/** Display the post details */
export default function Post({
  post,
  showPfp = true,
  showCta = true,
  characterLimit = null,
  showReplyTo = false,
  setReply = null,
  defaultReply = null
}) {
  const {
    user,
    setUser,
    orbis,
    theme,
    hasAccess
  } = useOrbis();
  const [editPost, setEditPost] = useState(false);
  const [isDeleted, setIsDeleted] = useState(false);
  const [reply, _setReply] = useState();
  const [userReaction, setUserReaction] = useState();
  const [postMenuVis, setPostMenuVis] = useState(false);
  const [hoverRef, isHovered] = useHover();
  useEffect(() => {
    if (user) {
      getUserReaction();
    }
  }, [user]);

  /** Will update the reply status based on the forced parent parameters */
  useEffect(() => {
    _setReply(defaultReply);
  }, [defaultReply]);

  /** Will reply to a post either by replying within the post or by adding the reply in the main PostBox (for chat) */
  function replyToPost(post) {
    if (setReply) {
      setReply(post);
    } else {
      _setReply(post);
    }
  }

  /** If user is connected we check if it has reacted to this post */
  async function getUserReaction() {
    let {
      data,
      error
    } = await orbis.getReaction(post.stream_id, user.did);
    if (data) {
      setUserReaction(data.type);
    }
  }

  /** To like a post */
  async function like(type) {
    if (!user) {
      alert("You must be connected to react to posts.");
      return;
    }
    if (!hasAccess) {
      alert("You need the required credentials to react to posts in this feed.");
      return;
    }

    /** Anticipate success and update UI */
    setUserReaction(type);

    /** React to the post using the SDK */
    let res = await orbis.react(post.stream_id, type);

    /** Check results */
    switch (res.status) {
      case 300:
        console.log("Error reacting to the post:", res);
        break;
    }
  }

  /** Unselect reply when new post is shared */
  function callbackShared() {
    replyToPost(false);
  }

  /** Called when a post is being edited with success */
  function callbackEdit(content) {
    setEditPost(false);
    post.content = content;
  }

  /** If the post has been deleted from the front-end we hide it in the UI */
  if (isDeleted) {
    return null;
  }
  return /*#__PURE__*/React.createElement("div", {
    className: styles.postContainer
  }, showReplyTo && post.reply_to_details && /*#__PURE__*/React.createElement("div", {
    className: styles.replyToContainer
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      marginRight: 10
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: styles.linkReply,
    style: {
      borderColor: getThemeValue("border", theme, "main")
    }
  }), /*#__PURE__*/React.createElement(UserPfp, {
    details: post.reply_to_creator_details,
    height: 30,
    hover: false
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex"
    }
  }, /*#__PURE__*/React.createElement(PostBody, {
    showViewMore: false,
    post: {
      stream_id: post.reply_to,
      content: post.reply_to_details
    },
    characterLimit: 70
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "row",
      width: "100%"
    }
  }, showPfp && /*#__PURE__*/React.createElement("div", {
    style: {
      position: "relative"
    },
    ref: hoverRef
  }, /*#__PURE__*/React.createElement(UserPfp, {
    details: post.creator_details,
    hover: false
  }), /*#__PURE__*/React.createElement(UserPopup, {
    visible: isHovered,
    details: post.creator_details
  })), /*#__PURE__*/React.createElement("div", {
    className: styles.postDetailsContainer
  }, showPfp && /*#__PURE__*/React.createElement("div", {
    className: styles.postDetailsContainerMetadata
  }, /*#__PURE__*/React.createElement("div", {
    className: styles.postDetailsContainerUser
  }, /*#__PURE__*/React.createElement("span", {
    className: styles.postDetailsContainerUsername,
    style: {
      ...getThemeValue("font", theme, "main"),
      color: getThemeValue("color", theme, "main")
    }
  }, /*#__PURE__*/React.createElement(Username, {
    details: post.creator_details
  })), /*#__PURE__*/React.createElement("div", {
    className: styles.hideMobile,
    style: {
      marginLeft: "0.5rem"
    }
  }, /*#__PURE__*/React.createElement(UserBadge, {
    details: post.creator_details
  }))), /*#__PURE__*/React.createElement("div", {
    className: styles.postDetailsContainerTimestamp,
    style: {
      fontSize: 12,
      color: theme?.color?.secondary ? theme.color.secondary : defaultTheme.color.secondary
    }
  }, /*#__PURE__*/React.createElement(ReactTimeAgo, {
    style: {
      display: "flex",
      fontSize: 12,
      ...getThemeValue("font", theme, "actions")
    },
    date: post.timestamp * 1000,
    locale: "en-US"
  }), /*#__PURE__*/React.createElement("div", {
    className: styles.hideMobile
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      marginLeft: "0.5rem",
      marginRight: "0.5rem",
      color: getThemeValue("color", theme, "secondary"),
      ...getThemeValue("font", theme, "actions")
    }
  }, "\xB7"), /*#__PURE__*/React.createElement("a", {
    style: {
      textDecoration: "none",
      color: getThemeValue("color", theme, "secondary"),
      ...getThemeValue("font", theme, "actions")
    },
    href: "https://cerscan.com/mainnet/stream/" + post.stream_id,
    rel: "noreferrer",
    target: "_blank"
  }, "Proof")), user && user.did == post.creator && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("span", {
    style: {
      marginLeft: "0.5rem",
      marginRight: "0.5rem",
      color: getThemeValue("color", theme, "secondary")
    }
  }, "\xB7"), /*#__PURE__*/React.createElement("div", {
    style: {
      alignItems: "center",
      display: "flex"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      cursor: "pointer",
      color: getThemeValue("color", theme, "secondary")
    },
    onClick: () => setPostMenuVis(true)
  }, /*#__PURE__*/React.createElement(MenuHorizontal, null)), postMenuVis && /*#__PURE__*/React.createElement(PostMenu, {
    stream_id: post.stream_id,
    setPostMenuVis: setPostMenuVis,
    setEditPost: setEditPost,
    setIsDeleted: setIsDeleted
  }))))), editPost ? /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: "0.5rem"
    }
  }, /*#__PURE__*/React.createElement(Postbox, {
    showPfp: false,
    defaultPost: post,
    reply: reply,
    callback: callbackEdit,
    rows: "1",
    ctaTitle: "Edit",
    ctaStyle: styles.postReplyCta,
    setEditPost: setEditPost
  })) : /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column"
    }
  }, /*#__PURE__*/React.createElement(PostBody, {
    post: post,
    characterLimit: characterLimit
  })), showCta && /*#__PURE__*/React.createElement("div", {
    className: styles.postActionsContainer
  }, reply && reply.stream_id == post.stream_id ? /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: styles.postActionButton,
    style: {
      color: getThemeValue("color", theme, "active"),
      ...getThemeValue("font", theme, "actions")
    },
    onClick: () => replyToPost(null)
  }, /*#__PURE__*/React.createElement(ReplyIcon, {
    type: "full"
  }), "Reply") : /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: styles.postActionButton,
    style: {
      color: getThemeValue("color", theme, "secondary"),
      ...getThemeValue("font", theme, "actions")
    },
    onClick: () => replyToPost(post)
  }, /*#__PURE__*/React.createElement(ReplyIcon, {
    type: "line"
  }), "Reply"), /*#__PURE__*/React.createElement("span", {
    style: {
      marginLeft: "0.75rem",
      flexDirection: "row",
      display: "flex"
    }
  }, userReaction == "like" ? /*#__PURE__*/React.createElement("button", {
    className: styles.postActionButton,
    style: {
      color: getThemeValue("color", theme, "active"),
      ...getThemeValue("font", theme, "actions")
    },
    onClick: () => like(null)
  }, /*#__PURE__*/React.createElement(LikeIcon, {
    type: "full"
  }), "Liked") : /*#__PURE__*/React.createElement("button", {
    className: styles.postActionButton,
    style: {
      color: getThemeValue("color", theme, "secondary"),
      ...getThemeValue("font", theme, "actions")
    },
    onClick: () => like("like")
  }, /*#__PURE__*/React.createElement(LikeIcon, {
    type: "line"
  }), "Like"))), reply && reply.stream_id == post.stream_id && !defaultReply && /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 8
    }
  }, /*#__PURE__*/React.createElement(Postbox, {
    reply: reply,
    callback: callbackShared,
    placeholder: "Add your reply...",
    rows: "1",
    ctaTitle: "Reply",
    ctaStyle: styles.postReplyCta
  })))));
}

/** Body of the post */
const PostBody = ({
  post,
  characterLimit,
  showViewMore = true
}) => {
  const {
    theme
  } = useOrbis();
  const [charLimit, setCharLimit] = useState(characterLimit);
  const [body, setBody] = useState(post?.content?.body ? post.content.body : "");
  useEffect(() => {
    let _body = post.content.body;
    let mentions = post.content.mentions;
    if (mentions && mentions.length > 0) {
      mentions.forEach((mention, i) => {
        _body = _body.replaceAll(mention.username, "**" + mention.username + "**");
      });
    }
    setBody(_body);
  }, [post]);
  const Body = () => {
    return /*#__PURE__*/React.createElement("div", {
      className: styles.postContent,
      style: {
        ...getThemeValue("font", theme, "secondary"),
        color: getThemeValue("color", theme, "main")
      },
      dangerouslySetInnerHTML: {
        __html: marked.parse(charLimit ? body?.substring(0, charLimit) + "..." : body)
      }
    });
  };
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Body, null), showViewMore && /*#__PURE__*/React.createElement(React.Fragment, null, charLimit && post.content?.body?.length > charLimit ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: styles.postViewMoreCtaContainer
  }, /*#__PURE__*/React.createElement(Button, {
    color: "secondary",
    style: {
      marginRight: 5
    },
    onClick: () => setCharLimit(null)
  }, "View more"))) : /*#__PURE__*/React.createElement(React.Fragment, null, post.indexing_metadata?.urlMetadata && post.creator_details?.a_r > 15 && /*#__PURE__*/React.createElement(LinkCard, {
    metadata: post.indexing_metadata.urlMetadata
  }))));
};

/** Card to display's url metadata */
const LinkCard = ({
  metadata
}) => {
  const {
    theme
  } = useContext(GlobalContext);
  return /*#__PURE__*/React.createElement("div", {
    className: styles.postUrlMetadataContainer,
    style: {
      background: theme?.bg?.secondary ? theme.bg.secondary : defaultTheme.bg.secondary,
      borderColor: theme?.border?.main ? theme.border.main : defaultTheme.border.main,
      maxWidth: 480
    }
  }, metadata.image && /*#__PURE__*/React.createElement("a", {
    href: metadata.url,
    target: "_blank",
    rel: "noreferrer"
  }, /*#__PURE__*/React.createElement("div", {
    className: styles.postUrlMetadataImage,
    style: {
      backgroundImage: "url(" + metadata.image + ")"
    }
  })), /*#__PURE__*/React.createElement("div", {
    className: styles.postUrlMetadataDetails,
    style: {
      borderColor: theme?.border?.secondary ? theme.border.secondary : defaultTheme.border.secondary
    }
  }, metadata.source && /*#__PURE__*/React.createElement("p", {
    style: {
      color: theme?.color?.active ? theme.color.active : defaultTheme.color.active,
      ...getThemeValue("font", theme, "secondary"),
      fontSize: 13,
      fontWeight: 500
    }
  }, metadata.source), /*#__PURE__*/React.createElement("h3", {
    style: {
      color: theme?.color?.main ? theme.color.main : defaultTheme.color.main,
      fontSize: 17,
      fontWeight: 500,
      lineHeight: "1.5rem"
    }
  }, metadata.title), metadata.description && /*#__PURE__*/React.createElement("p", {
    style: {
      color: theme?.color?.secondary ? theme.color.secondary : defaultTheme.color.secondary,
      fontSize: 15
    }
  }, metadata.description.length > 155 ? /*#__PURE__*/React.createElement(React.Fragment, null, metadata.description, "...") : /*#__PURE__*/React.createElement(React.Fragment, null, metadata.description))));
};

/** Menu for a post (visible for owner only) */
const PostMenu = ({
  stream_id,
  setPostMenuVis,
  setEditPost,
  setIsDeleted
}) => {
  const {
    orbis,
    theme
  } = useContext(GlobalContext);
  const [deletingStatus, setDeletingStatus] = useState(0);
  const wrapperRef = useRef(null);

  /** Is triggered when clicked outside the component */
  useOutsideClick(wrapperRef, () => hide());

  /** will trigger the edit post function */
  async function _delete() {
    setDeletingStatus(1);
    let res = await orbis.deletePost(stream_id);
    setDeletingStatus(2);
  }

  /** Will show the postbox instead of the post to allow the connected user to edit its content */
  function edit() {
    setPostMenuVis(false);
    setEditPost(true);
  }

  /** Hide menu */
  function hide() {
    if (deletingStatus == 2) {
      setIsDeleted(true);
    }
    setPostMenuVis(false);
  }
  function DeleteButton() {
    switch (deletingStatus) {
      case 0:
        return /*#__PURE__*/React.createElement("div", {
          class: "text-red-700 hover:bg-gray-50 flex items-center px-3 py-2 text-sm font-medium rounded-md cursor-pointer",
          onClick: () => _delete(true)
        }, "Delete");

      /** Loading */
      case 1:
        return /*#__PURE__*/React.createElement("div", {
          class: "text-red-700 flex items-center px-3 py-2 text-sm font-medium rounded-md"
        }, /*#__PURE__*/React.createElement(LoadingCircle, {
          color: "text-red-700"
        }), /*#__PURE__*/React.createElement("span", {
          class: "truncate"
        }, "Deleting"));

      /** Success */
      case 2:
        return /*#__PURE__*/React.createElement("div", {
          class: "text-green-700 flex items-center px-3 py-2 text-sm font-medium rounded-md"
        }, /*#__PURE__*/React.createElement("span", {
          class: "truncate mr-2"
        }, "Deleted"));
    }
  }
  return /*#__PURE__*/React.createElement("div", {
    className: styles.postMenuContainer,
    ref: wrapperRef,
    style: {
      right: 10,
      background: theme?.bg?.secondary ? theme.bg.secondary : defaultTheme.bg.secondary,
      borderColor: theme?.border?.main ? theme.border.main : defaultTheme.border.main
    }
  }, /*#__PURE__*/React.createElement("div", {
    class: "flex items-center px-3 py-2 text-sm font-medium rounded-md cursor-pointer",
    style: {
      color: theme?.color?.main ? theme.color.main : defaultTheme.color.main
    },
    "aria-current": "page",
    onClick: () => edit(true)
  }, "Edit"), /*#__PURE__*/React.createElement(DeleteButton, null));
};
let sendStyleReply = "inline-flex items-center rounded-full border border-transparent bg-[#4E75F6] px-4 py-1 text-sm font-medium text-white shadow-sm hover:bg-[#3E67F0] focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 cursor-pointer";