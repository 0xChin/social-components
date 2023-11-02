import React, { useState, useEffect, useRef, useContext } from "react";
import { GlobalContext } from "../../contexts/GlobalContext";
import { defaultTheme, getThemeValue, getStyle } from "../../utils/themes";
import useHover from "../../hooks/useHover";
import useOrbis from "../../hooks/useOrbis";

/** Import CSS */
import styles from './Badge.module.css';
const Badge = ({
  color,
  style,
  tooltip,
  children
}) => {
  const {
    orbis,
    user,
    theme
  } = useOrbis();
  const [hoverRef, isHovered] = useHover();
  return /*#__PURE__*/React.createElement("div", {
    className: styles.badge,
    ref: hoverRef,
    style: style
  }, children, isHovered && tooltip && /*#__PURE__*/React.createElement("div", {
    className: styles.tooltip
  }, tooltip));
};
export default Badge;