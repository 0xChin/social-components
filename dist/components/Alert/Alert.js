import React, { useState, useEffect, useRef, useContext } from "react";
import { GlobalContext } from "../../contexts/GlobalContext";
import { defaultTheme, getThemeValue, getStyle } from "../../utils/themes";
import useOrbis from "../../hooks/useOrbis";

/** Import CSS */
import styles from './Alert.module.css';
const Alert = ({
  color,
  style,
  tooltip,
  title,
  icon
}) => {
  const {
    orbis,
    user,
    theme
  } = useOrbis();
  return /*#__PURE__*/React.createElement("div", {
    className: styles.emptyState,
    style: style
  }, icon, /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 13
    }
  }, title));
};
export default Alert;