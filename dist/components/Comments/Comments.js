import React, { useState, useEffect, useRef, useContext } from "react";
import Postbox from "../Postbox";
import Post from "../Post";
import User from "../User";
import LoadingCircle from "../LoadingCircle";
import { CommentsContext } from "../../contexts/CommentsContext";
import OrbisProvider from "../OrbisProvider";
import useOrbis from "../../hooks/useOrbis";
import { Logo, EmptyStateComments, NotificationIcon } from "../../icons";
import { defaultTheme, getThemeValue } from "../../utils/themes";

/** Import CSS */
import styles from './Comments.module.css';
export default function Comments({
  context,
  theme = defaultTheme,
  options,
  characterLimit = null,
  master = null
}) {
  return /*#__PURE__*/React.createElement(OrbisProvider, {
    context: context,
    theme: theme,
    options: options
  }, /*#__PURE__*/React.createElement(CommentsContent, {
    characterLimit: characterLimit,
    master: master
  }));
}

/*export interface CommentsProps {
  label: string;
}*/

const CommentsContent = ({
  characterLimit,
  master
}) => {
  const {
    user,
    setUser,
    orbis,
    theme,
    context,
    accessRules,
    setAuthorizationsModalVis
  } = useOrbis();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sharing, setSharing] = useState(false);

  /** Load posts on load */
  useEffect(() => {
    loadPosts();
  }, [context]);

  /** Retrieve posts from Orbis for this context */
  async function loadPosts() {
    setLoading(true);
    let queryParams;
    if (master) {
      queryParams = {
        master: master
      };
    } else {
      queryParams = {
        context: context
      };
    }
    console.log("queryParams:", queryParams);
    let {
      data,
      error
    } = await orbis.getPosts(queryParams, 0);

    /** Store last message timestamp in localStorage to check if user has unread message */
    if (localStorage && data && data.length > 0) {
      localStorage.setItem(context + "-last-read", data[0].timestamp);
    }

    /** Save in state */
    setComments(data);
    setLoading(false);
  }
  return /*#__PURE__*/React.createElement(CommentsContext.Provider, {
    value: {
      comments,
      setComments
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: styles.commentsGlobalContainer,
    style: {
      background: getThemeValue("bg", theme, "main"),
      borderColor: getThemeValue("border", theme, "main")
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "1rem"
    }
  }, /*#__PURE__*/React.createElement(Postbox, {
    context: context,
    master: master
  })), /*#__PURE__*/React.createElement("div", {
    className: styles.commentsContainer,
    style: {
      borderColor: getThemeValue("border", theme, "secondary")
    }
  }, loading ? /*#__PURE__*/React.createElement("div", {
    className: styles.loadingContainer,
    style: {
      color: getThemeValue("color", theme, "main")
    }
  }, /*#__PURE__*/React.createElement(LoadingCircle, null)) : /*#__PURE__*/React.createElement(React.Fragment, null, comments.length <= 0 ? /*#__PURE__*/React.createElement("div", {
    className: styles.commentsEmptyStateContainer
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      color: getThemeValue("color", theme, "secondary"),
      fontSize: 15,
      marginTop: "0.5rem",
      marginBottom: "0.5rem"
    }
  }, "Be the first to leave a comment here."), /*#__PURE__*/React.createElement(EmptyStateComments, null)) : /*#__PURE__*/React.createElement(LoopComments, {
    comments: comments,
    characterLimit: characterLimit,
    master: master
  }))), /*#__PURE__*/React.createElement("div", {
    className: styles.footerContainer
  }, /*#__PURE__*/React.createElement("a", {
    href: "https://useorbis.com?utm_source=comments_module",
    rel: "noreferrer",
    target: "_blank",
    className: styles.footerOpenSocialContainer
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: getThemeValue("color", theme, "secondary"),
      ...getThemeValue("font", theme, "main"),
      fontWeight: 400,
      marginRight: 5,
      fontSize: 15
    }
  }, "Open Social with"), /*#__PURE__*/React.createElement(Logo, {
    className: "flex",
    color: getThemeValue("color", theme, "main")
  })))));
};

/** Loop through all posts and display them one by one */
function LoopComments({
  comments,
  characterLimit,
  master
}) {
  return comments.map((comment, key) => {
    if (comment.content.reply_to == master || (!comment.content.reply_to || comment.content.reply_to == "") && (!comment.content.master || comment.content.master == "")) {
      return /*#__PURE__*/React.createElement(Comment, {
        comments: comments,
        comment: comment,
        master: comment.content.master,
        characterLimit: characterLimit,
        key: comment.stream_id
      });
    } else {
      return null;
    }
  });
}

/** One comment component is also looping through the other replies to see if it has any internal replies */
function Comment({
  comments,
  comment,
  master,
  characterLimit,
  z
}) {
  const {
    theme
  } = useOrbis();
  function LoopInternalReplies() {
    return comments.map((_comment, key) => {
      if (_comment.content.reply_to == comment.stream_id) {
        return /*#__PURE__*/React.createElement(Comment, {
          comment: _comment,
          master: master,
          comments: comments,
          key: _comment.stream_id
        });
      }
    });
  }
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: "relative"
    }
  }, comment.content.reply_to != null && /*#__PURE__*/React.createElement("span", {
    className: styles.greyLine,
    style: {
      top: 60,
      bottom: 20,
      left: 22,
      width: 1,
      backgroundColor: theme?.border?.main ? theme.border.main : defaultTheme.border.main
    },
    "aria-hidden": "true"
  }), /*#__PURE__*/React.createElement(Post, {
    post: comment,
    characterLimit: characterLimit
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      marginLeft: "2.5rem",
      marginTop: "1.75rem"
    }
  }, /*#__PURE__*/React.createElement(LoopInternalReplies, null)));
}