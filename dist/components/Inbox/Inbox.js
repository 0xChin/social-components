import React, { useState, useEffect, useRef, useContext } from "react";
import Postbox from "../Postbox";
import Post from "../Post";
import User, { UserPfp, Username } from "../User";
import ConnectButton from "../ConnectButton";
import LoadingCircle from "../LoadingCircle";
import { InboxContext } from "../../contexts/InboxContext";
import OrbisProvider from "../OrbisProvider";
import useOrbis from "../../hooks/useOrbis";
import { Logo, EmptyStateComments, CheckIcon } from "../../icons";
import { defaultTheme, getThemeValue, getStyle } from "../../utils/themes";
import { sleep, getTimestamp } from "../../utils";
import Input from "../Input";
import Button from "../Button";

/** Import CSS */
import styles from './Inbox.module.css';
export default function Inbox({
  context,
  theme,
  options
}) {
  return /*#__PURE__*/React.createElement(OrbisProvider, {
    context: context,
    theme: theme,
    options: options
  }, /*#__PURE__*/React.createElement(InboxContent, null));
}

/** Global inbox component */
const InboxContent = () => {
  const {
    user,
    setUser,
    orbis,
    theme,
    context,
    accessRules
  } = useOrbis();
  const [loading, setLoading] = useState(false);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [conversationSelected, setConversationSelected] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);

  /** Load posts on load */
  useEffect(() => {
    if (user) {
      loadConversations();
    }
  }, [context, user]);

  /** Load posts on load */
  useEffect(() => {
    if (user && conversationSelected) {
      loadMessages();
    }
  }, [user, conversationSelected]);

  /** Retrieve conversations from Orbis for this context */
  async function loadConversations() {
    setLoading(true);
    //let { data, error } = await orbis.getConversations({did: user.did ,context: context}, 0);
    let {
      data,
      error
    } = await orbis.getConversations({
      did: user.did
    }, 0);
    setConversations(data);
    setLoading(false);
  }

  /** Retrieve conversations from Orbis for this context */
  async function loadMessages() {
    setMessagesLoading(true);
    let {
      data,
      error
    } = await orbis.getMessages(conversationSelected.stream_id);
    setMessages(data);
    setMessagesLoading(false);
  }
  return /*#__PURE__*/React.createElement(InboxContext.Provider, {
    value: {
      conversationSelected,
      setConversationSelected,
      messagesLoading,
      messages,
      setMessages,
      isExpanded,
      setIsExpanded
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: styles.inboxContainer,
    style: {
      background: getThemeValue("background", theme, "main"),
      borderColor: getThemeValue("border", theme, "secondary"),
      height: isExpanded ? "500px" : "auto"
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: styles.inboxHeaderContainer,
    style: {
      ...getStyle("button-main", theme, "main"),
      ...getThemeValue("font", theme, "main")
    }
  }, /*#__PURE__*/React.createElement(HeaderInbox, null)), isExpanded && /*#__PURE__*/React.createElement("div", {
    className: styles.inboxContent
  }, user ? /*#__PURE__*/React.createElement(React.Fragment, null, conversationSelected ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: styles.messagesContainer
  }, /*#__PURE__*/React.createElement(Messages, null)), /*#__PURE__*/React.createElement("div", {
    className: "flex w-full border-gray-100 border-t bg-white px-3 py-3 flex-row"
  }, /*#__PURE__*/React.createElement(MessageBox, null))) : /*#__PURE__*/React.createElement(React.Fragment, null, user.hasLit ? /*#__PURE__*/React.createElement("ul", {
    role: "list",
    className: styles.conversationsContainer
  }, /*#__PURE__*/React.createElement(LoopConversations, {
    conversations: conversations
  })) : /*#__PURE__*/React.createElement("div", {
    className: styles.connectContainer
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      ...getThemeValue("font", theme, "secondary"),
      color: getThemeValue("color", theme, "primary"),
      textAlign: "center",
      marginBottom: 8
    }
  }, /*#__PURE__*/React.createElement("b", null, "Last step:"), " Setup your private account to be able to decrypt messages. "), /*#__PURE__*/React.createElement(ConnectButton, {
    litOnly: true,
    title: "Setup Private Account"
  })))) : /*#__PURE__*/React.createElement("div", {
    className: styles.connectContainer
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      ...getThemeValue("font", theme, "secondary"),
      color: getThemeValue("color", theme, "primary"),
      textAlign: "center",
      marginBottom: 8
    }
  }, /*#__PURE__*/React.createElement("b", null, "Step 1:"), " You need to be connected to access your messages."), /*#__PURE__*/React.createElement(ConnectButton, {
    lit: true
  })))));
};

/** Header content for the inbox */
function HeaderInbox() {
  const {
    conversationSelected,
    isExpanded,
    setIsExpanded
  } = useContext(InboxContext);
  if (conversationSelected) {
    return /*#__PURE__*/React.createElement("div", {
      className: styles.header
    }, /*#__PURE__*/React.createElement(Participants, {
      conversation: conversationSelected
    }));
  } else {
    return /*#__PURE__*/React.createElement("div", {
      className: styles.header,
      onClick: () => setIsExpanded(!isExpanded)
    }, /*#__PURE__*/React.createElement(DmIcon, null), /*#__PURE__*/React.createElement("p", null, "Direct Messages"));
  }
}

/** Loop through all conversations for this user in this context and display them */
function LoopConversations({
  conversations
}) {
  return conversations.map((conversation, key) => {
    return /*#__PURE__*/React.createElement(Conversation, {
      conversation: conversation,
      key: key
    });
  });
}

/** Render a conversation line */
function Conversation({
  conversation
}) {
  const {
    user,
    theme
  } = useOrbis();
  const {
    setConversationSelected
  } = useContext(InboxContext);
  return /*#__PURE__*/React.createElement("li", {
    className: styles.conversationContainer,
    onClick: () => setConversationSelected(conversation),
    style: {
      borderColor: getThemeValue("border", theme, "secondary")
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: styles.conversationRecipientsContainer
  }, /*#__PURE__*/React.createElement("div", {
    className: styles.conversationRecipientsPfpContainer
  }, conversation.recipients.length > 2 ? /*#__PURE__*/React.createElement("div", {
    style: {
      position: "relative"
    }
  }, /*#__PURE__*/React.createElement(RecipientsPfp, {
    conversation: conversation
  })) : /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(UserPfp, {
    details: conversation.recipients_details[0].did == user.did ? conversation.recipients_details[1] : conversation.recipients_details[0]
  }))), /*#__PURE__*/React.createElement("div", {
    className: styles.conversationRecipientsDetailsContainer
  }, /*#__PURE__*/React.createElement(RecipientsUsername, {
    recipients: conversation.recipients,
    recipients_details: conversation.recipients_details
  }), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 12,
      color: getThemeValue("color", theme, "secondary")
    }
  }, "1h"))));
}

/** Clean display of a participants in a conversation */
function Participants({
  conversation
}) {
  const {
    user
  } = useOrbis();
  const {
    setConversationSelected
  } = useContext(InboxContext);
  return /*#__PURE__*/React.createElement("div", {
    className: styles.participantsContainer
  }, /*#__PURE__*/React.createElement("div", {
    className: styles.participantsContainerCta,
    onClick: () => setConversationSelected(null)
  }, /*#__PURE__*/React.createElement("svg", {
    width: "18",
    height: "16",
    viewBox: "0 0 20 18",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, /*#__PURE__*/React.createElement("path", {
    fillRule: "evenodd",
    clipRule: "evenodd",
    d: "M9.03033 0.96967C9.32322 1.26256 9.32322 1.73744 9.03033 2.03033L2.81066 8.25H19C19.4142 8.25 19.75 8.58579 19.75 9C19.75 9.41421 19.4142 9.75 19 9.75H2.81066L9.03033 15.9697C9.32322 16.2626 9.32322 16.7374 9.03033 17.0303C8.73744 17.3232 8.26256 17.3232 7.96967 17.0303L0.46967 9.53033C0.176777 9.23744 0.176777 8.76256 0.46967 8.46967L7.96967 0.96967C8.26256 0.676777 8.73744 0.676777 9.03033 0.96967Z",
    fill: "#FAFBFB"
  }))), /*#__PURE__*/React.createElement("div", {
    className: styles.participantsContainerPfp
  }, conversation.recipients.length > 2 ? /*#__PURE__*/React.createElement("div", {
    style: {
      position: "relative",
      paddingTop: 5
    }
  }, /*#__PURE__*/React.createElement(RecipientsPfp, {
    conversation: conversation,
    height: 25
  })) : /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(UserPfp, {
    details: conversation.recipients_details[0].did == user.did ? conversation.recipients_details[1] : conversation.recipients_details[0],
    height: 38
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "relative",
      display: "flex",
      flex: 1,
      alignItems: "center"
    }
  }, /*#__PURE__*/React.createElement(RecipientsUsername, {
    recipients: conversation.recipients,
    recipients_details: conversation.recipients_details
  })));
}

/** Loop through recipients to display their Pfp */
const RecipientsPfp = ({
  conversation,
  height = 28
}) => {
  const {
    user,
    theme
  } = useOrbis();
  let i = 0;
  return conversation.recipients_details.map((recipient, key) => {
    if (recipient.did != user.did && i < 2) {
      i++;
      if (i == 1) {
        return /*#__PURE__*/React.createElement("div", {
          style: {
            position: "relative",
            display: "flex"
          },
          key: key
        }, /*#__PURE__*/React.createElement(UserPfp, {
          height: height,
          details: recipient,
          key: key,
          showBadge: false
        }));
      } else {
        return /*#__PURE__*/React.createElement("div", {
          className: "rounded-full border-2 border-white",
          style: {
            position: "absolute",
            left: 13,
            top: -8,
            width: height + 4
          },
          key: key
        }, /*#__PURE__*/React.createElement(UserPfp, {
          height: height,
          details: recipient,
          key: key
        }));
      }
    } else {
      return null;
    }
  });
};

/** Loop through recipients to display their Usernames */
const RecipientsUsername = ({
  recipients,
  recipients_details
}) => {
  const {
    user,
    theme
  } = useOrbis();
  return /*#__PURE__*/React.createElement("div", {
    className: styles.conversationRecipientsUsernameContainer,
    style: {
      ...getThemeValue("font", theme, "main"),
      color: getThemeValue("color", theme, "main")
    }
  }, recipients.length > 2 ? /*#__PURE__*/React.createElement("p", {
    style: {
      display: "flex",
      flexDirection: "row"
    }
  }, /*#__PURE__*/React.createElement(Username, {
    details: recipients_details[0].did == user.did ? recipients_details[1] : recipients_details[0]
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      ...getThemeValue("font", theme, "main"),
      color: getThemeValue("color", theme, "secondary"),
      marginLeft: 4
    }
  }, "and ", /*#__PURE__*/React.createElement("span", {
    className: "text-gray-900 font-medium"
  }, recipients.length - 1, " others"))) : /*#__PURE__*/React.createElement("p", null, /*#__PURE__*/React.createElement(Username, {
    details: recipients_details[0].did == user.did ? recipients_details[1] : recipients_details[0]
  })));
};

/** Load all messages in a conversation and decrypt them */
function Messages() {
  const {
    user,
    orbis,
    theme
  } = useOrbis();
  const {
    conversationSelected,
    messages,
    messagesLoading
  } = useContext(InboxContext);

  /** Show loading state */
  if (messagesLoading) {
    return /*#__PURE__*/React.createElement("div", {
      className: styles.loadingContainer,
      style: {
        color: getThemeValue("color", theme, "main")
      }
    }, /*#__PURE__*/React.createElement(LoadingCircle, null));
  }
  if (messages && messages.length == 0 || !messages) {
    return /*#__PURE__*/React.createElement("p", {
      style: {
        ...getThemeValue("font", theme, "secondary"),
        color: getThemeValue("color", theme, "primary"),
        textAlign: "center",
        marginBottom: 8
      }
    }, "You haven't received any messages yet.");
  }

  /** List messages */
  return messages.map((message, key) => {
    return /*#__PURE__*/React.createElement(Message, {
      message: message,
      key: message.stream_id
    });
  });
}

/** Display the details of a message */
function Message({
  message
}) {
  const {
    user,
    orbis,
    theme
  } = useOrbis();
  const [body, setBody] = useState();
  useEffect(() => {
    let active = true;
    decrypt();
    return () => {
      active = false;
    };
    async function decrypt() {
      /**
       * If body passed as a parameter use it immediately without decrypting the content
       * (that's the case when the message was just sent by the user and added to the conversation as a callback)
       */
      if (message.content?.body) {
        /** Save in state */
        setBody(message.content.body);
      }

      /** Otherwise we decrypt the content using Lit Protocol and return the result. */else if (message.content?.encryptedMessage?.encryptedString != {}) {
        let res = await orbis.decryptMessage(message.content);

        /** Save in state */
        setBody(res.result);
      } else {
        return null;
      }
      if (!active) {
        return;
      }
    }
  }, []);
  if (user.did == message.creator) {
    return /*#__PURE__*/React.createElement("div", {
      className: styles.messageContainer,
      style: {
        justifyContent: "flex-end"
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: styles.message,
      style: {
        ...getStyle("button-main", theme, "main"),
        fontSize: 15
      }
    }, /*#__PURE__*/React.createElement("p", {
      className: "text-white"
    }, body ? body : /*#__PURE__*/React.createElement(LoadingCircle, null))));
  } else {
    return /*#__PURE__*/React.createElement("div", {
      className: styles.messageContainer
    }, /*#__PURE__*/React.createElement("div", {
      className: styles.message,
      style: {
        background: getThemeValue("bg", theme, "tertiary"),
        fontSize: 15
      }
    }, /*#__PURE__*/React.createElement("p", {
      className: "text-gray-900"
    }, body ? body : /*#__PURE__*/React.createElement(LoadingCircle, null))));
  }
}

/** Box to send a private message */
function MessageBox() {
  const {
    user,
    theme,
    orbis
  } = useOrbis();
  const [content, setContent] = useState("");
  const [status, setStatus] = useState(0);
  const {
    conversationSelected,
    messages,
    setMessages
  } = useContext(InboxContext);

  /** Will send a message to the selected conversation using the Orbis SDK */
  async function send() {
    let _body = content;
    setStatus(1);
    setContent("");
    let res = await orbis.sendMessage({
      conversation_id: conversationSelected.stream_id,
      body: _body
    });
    if (res.status == 200) {
      setStatus(2);

      /** Add new message to the list */
      setMessages([{
        timestamp: getTimestamp(),
        creator_details: user,
        creator: user.did,
        stream_id: res.doc,
        content: {
          body: _body
        }
      }, ...messages]);

      /** Show initial state */
      await sleep(1500);
      setStatus(0);
    }
  }
  return /*#__PURE__*/React.createElement("div", {
    className: styles.messageBoxContainer,
    style: {
      borderColor: getThemeValue("border", theme, "main"),
      background: getThemeValue("bg", theme, "secondary")
    }
  }, /*#__PURE__*/React.createElement(Input, {
    type: "textarea",
    name: "description",
    value: content,
    onChange: e => setContent(e.target.value),
    placeholder: "Your message...",
    style: {
      marginRight: "0.375rem",
      borderRadius: "1.8rem"
    }
  }), status == 0 && /*#__PURE__*/React.createElement(Button, {
    color: "primary",
    onClick: send
  }, /*#__PURE__*/React.createElement("svg", {
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M1.31918 0.60287C1.14269 0.5516 0.952295 0.601289 0.823367 0.732269C0.694438 0.863249 0.647761 1.0544 0.70181 1.23006L2.32333 6.5H8.00049C8.27663 6.5 8.50049 6.72386 8.50049 7C8.50049 7.27614 8.27663 7.5 8.00049 7.5H2.32334L0.701871 12.7698C0.647821 12.9454 0.6945 13.1366 0.82343 13.2676C0.95236 13.3985 1.14275 13.4482 1.31925 13.397C5.78498 12.0996 9.93211 10.0543 13.616 7.40581C13.7467 7.31187 13.8241 7.16077 13.8241 6.99984C13.8241 6.8389 13.7467 6.6878 13.616 6.59386C9.93207 3.94544 5.78492 1.90014 1.31918 0.60287Z",
    fill: "currentColor"
  }))), status == 1 && /*#__PURE__*/React.createElement(Button, {
    color: "primary"
  }, /*#__PURE__*/React.createElement(LoadingCircle, null)), status == 2 && /*#__PURE__*/React.createElement(Button, {
    color: "green"
  }, /*#__PURE__*/React.createElement(CheckIcon, null)));
}
const DmIcon = () => {
  return /*#__PURE__*/React.createElement("svg", {
    width: "20",
    height: "19",
    className: "mr-3",
    viewBox: "0 0 20 19",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, /*#__PURE__*/React.createElement("path", {
    fillRule: "evenodd",
    clipRule: "evenodd",
    d: "M2.80365 18.6442C2.9793 18.6757 3.15732 18.7003 3.33691 18.7178C3.55516 18.7391 3.77647 18.75 4 18.75C5.3153 18.75 6.54447 18.3731 7.58317 17.7213C8.3569 17.9034 9.16679 18 10 18C15.322 18 19.75 14.0307 19.75 9C19.75 3.96934 15.322 0 10 0C4.67799 0 0.25 3.96934 0.25 9C0.25 11.4086 1.2746 13.5871 2.92371 15.1923C3.15571 15.4182 3.20107 15.6196 3.17822 15.7349C3.05254 16.3685 2.76687 16.9451 2.36357 17.4211C2.19016 17.6258 2.13927 17.9075 2.23008 18.1599C2.3209 18.4123 2.5396 18.597 2.80365 18.6442ZM6.25 7.875C5.62868 7.875 5.125 8.37868 5.125 9C5.125 9.62132 5.62868 10.125 6.25 10.125C6.87132 10.125 7.375 9.62132 7.375 9C7.375 8.37868 6.87132 7.875 6.25 7.875ZM8.875 9C8.875 8.37868 9.37868 7.875 10 7.875C10.6213 7.875 11.125 8.37868 11.125 9C11.125 9.62132 10.6213 10.125 10 10.125C9.37868 10.125 8.875 9.62132 8.875 9ZM13.75 7.875C13.1287 7.875 12.625 8.37868 12.625 9C12.625 9.62132 13.1287 10.125 13.75 10.125C14.3713 10.125 14.875 9.62132 14.875 9C14.875 8.37868 14.3713 7.875 13.75 7.875Z",
    fill: "#FAFBFB"
  }));
};

/** Styles for inputs */
let sendStyleMain = "inline-flex items-center rounded-full border border-transparent bg-[#4E75F6] px-5 py-2 text-base font-medium text-white shadow-sm hover:bg-[#3E67F0] focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 cursor-pointer";
let enabledInput = "block w-full resize-none border-0 pb-3 focus:ring-0 text-base placeholder-[#A9AFB7] bg-[#F1F2F3] mr-2";
let disabledInput = "block w-full resize-none border-0 pb-3 text-base bg-transparent";