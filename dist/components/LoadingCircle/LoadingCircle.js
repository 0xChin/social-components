import React from "react";

/** Import CSS */
import styles from './LoadingCircle.module.css';
export default function LoadingCircle({
  style
}) {
  return /*#__PURE__*/React.createElement("svg", {
    className: styles.LoadingCircle,
    xmlns: "http://www.w3.org/2000/svg",
    fill: "none",
    viewBox: "0 0 24 24",
    style: style
  }, /*#__PURE__*/React.createElement("circle", {
    style: {
      opacity: 0.25
    },
    cx: "12",
    cy: "12",
    r: "10",
    stroke: "currentColor",
    strokeWidth: "4"
  }), /*#__PURE__*/React.createElement("path", {
    style: {
      opacity: 0.75
    },
    fill: "currentColor",
    d: "M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
  }));
}