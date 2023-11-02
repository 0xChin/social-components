import React, { useState, useEffect, useRef, useContext } from "react";
import { GlobalContext } from "../../contexts/GlobalContext";
import { defaultTheme, getThemeValue, getStyle } from "../../utils/themes";
import useOrbis from "../../hooks/useOrbis";

/** Import CSS */
import styles from './Button.module.css';
const Button = ({
  color,
  style,
  children,
  onClick
}) => {
  const {
    orbis,
    user,
    theme
  } = useOrbis();

  /** Select correct style based on the `color` parameter passed
  let btnStyle;
  switch (color) {
    case "primary":
      btnStyle = styles.btnPrimary;
      break;
    case "green":
      btnStyle = styles.btnPrimary;
      break;
  }*/
  return /*#__PURE__*/React.createElement("button", {
    className: styles.btnPrimary,
    style: {
      ...getThemeValue("button", theme, color),
      ...getThemeValue("font", theme, "buttons"),
      ...style
    },
    onClick: onClick ? () => onClick() : null
  }, children);
};
export default Button;