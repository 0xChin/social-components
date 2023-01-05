import React from "react";
import reactStringReplace from 'react-string-replace';

/** Returns current timestamp */
export function getTimestamp() {
  const cur_timestamp = Math.round(new Date().getTime() / 1000).toString();
  return cur_timestamp;
}

/** Returns a short address */
export function shortAddress(_address) {
  if (!_address) {
    return "-";
  }
  const _firstChars = _address.substring(0, 5);
  const _lastChars = _address.substr(_address.length - 5);
  return _firstChars.concat('-', _lastChars);
}

/** Regex patterns to use */
var patternMentions = /\B@[a-z0-9_.⍙-]+/gi;

/** Returns an array of urls found in a post */
export function getUrls(body) {
  const urls = body.match(/(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/g);
  return urls;
}

/** This is a simple implementation of markdown, would love for this part to be improved by an external contributor */
export function cleanBody(post, characterLimit) {
  /** We make sure the post has a content */
  if (!post || !post.content || !post.content.body) {
    return null;
  }
  let body = post.content.body;
  if (characterLimit) {
    body = post.content.body?.substring(0, characterLimit);
  }

  /** Replace all <br> generated by the postbox to \n to handle line breaks*/
  body = reactStringReplace(body, "<br>", function (match, i) {
    return /*#__PURE__*/React.createElement("br", {
      key: match + i
    });
  });
  body = reactStringReplace(body, '\n', function (match, i) {
    return /*#__PURE__*/React.createElement("br", {
      key: match + i
    });
  });

  /** Replace URLs*/
  body = reactStringReplace(body, /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/g, function (match, i) {
    return /*#__PURE__*/React.createElement("a", {
      key: match + i,
      href: match,
      target: "_blank"
    }, match);
  });

  /** Identify and replace mentions */

  /** Get mentions in post metadata */
  let mentions = post.content.mentions;

  /** Retrieve mentions in the body */
  let mentionsInBody = post.content.body.toString().match(patternMentions);

  /** Compare both and replace in body
  if(mentionsInBody && mentions && isArray(mentions)) {
    mentionsInBody.forEach(_m => {
      let mention = mentions.find(obj => obj.username === _m);
      if(mention !== undefined) {
          body = reactStringReplace(body, _m, (match, i) => (
              mention.did ? <Link href={"/profile/" + mention.did} key={match + i}>{mention.username}</Link> : <span className="link" key={i}>{mention.username}</span>
          ));
      }
    });
  }*/

  return body;
}

/** Replace mentions in post */
function replaceMentions(post) {
  /** Get body from post */
  let _body = post.content.body;
  let body = post.content.body;

  /** Return result */
  return _body;
}