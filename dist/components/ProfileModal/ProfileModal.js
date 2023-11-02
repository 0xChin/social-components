import React, { useRef, useContext, useState, useEffect } from "react";
import { GlobalContext } from "../../contexts/GlobalContext";
import LoadingCircle from "../LoadingCircle";
import Modal from "../Modal";
import { defaultTheme, getThemeValue } from "../../utils/themes";
import { sleep, getNFTs, getTimestamp } from "../../utils";
import useHover from "../../hooks/useHover";
import useDidToAddress from "../../hooks/useDidToAddress";
import useOrbis from "../../hooks/useOrbis";
import { EditIcon } from "../../icons";

/** Import CSS */
import styles from './ProfileModal.module.css';
export default function UpdateProfileModal({
  hide,
  callbackNftUpdate
}) {
  const {
    user,
    theme
  } = useOrbis();
  const {
    address,
    chain
  } = useDidToAddress(user?.did);
  const [chainSelected, setChainSelected] = useState("mainnet");

  /** Callback function to perform live update of the PFP */
  function callback(url, details) {
    callbackNftUpdate(url, details);
    hide();
  }
  const ChainItem = ({
    color,
    name,
    slug
  }) => {
    let active = false;
    if (chainSelected == slug) {
      active = true;
    }
    if (active) {
      return /*#__PURE__*/React.createElement("div", {
        className: styles.tabsChain,
        style: {
          background: color,
          color: "#FFF"
        }
      }, name);
    } else {
      return /*#__PURE__*/React.createElement("div", {
        className: styles.tabsChain,
        style: {
          cursor: "pointer"
        },
        onClick: () => setChainSelected(slug)
      }, name);
    }
  };
  return /*#__PURE__*/React.createElement(Modal, {
    hide: () => hide(),
    width: 500,
    title: "Update your profile picture",
    description: "Pick your favorite NFT or upload your profile picture."
  }, /*#__PURE__*/React.createElement("div", {
    className: styles.tabsChainsWraper
  }, /*#__PURE__*/React.createElement("div", {
    className: styles.tabsChainsContainer,
    style: {
      background: theme?.bg?.tertiary ? theme.bg.tertiary : defaultTheme.bg.tertiary,
      color: theme?.color?.main ? theme.color.main : defaultTheme.color.main
    }
  }, /*#__PURE__*/React.createElement(ChainItem, {
    name: "Mainnet",
    slug: "mainnet",
    color: "#0085ff"
  }), /*#__PURE__*/React.createElement(ChainItem, {
    name: "Polygon",
    slug: "polygon",
    color: "#7b4dd8"
  }), /*#__PURE__*/React.createElement(ChainItem, {
    name: "Optimism",
    slug: "optimism",
    color: "#f64f4f"
  }))), /*#__PURE__*/React.createElement(ListNFTs, {
    chainSelected: chainSelected,
    callback: callback,
    address: address
  }));
}

/** Retrieve NFTs owned by this user and display them in modal */
function ListNFTs({
  chainSelected,
  address,
  callback
}) {
  const [loading, setLoading] = useState(false);
  const [nfts, setNfts] = useState([]);
  useEffect(() => {
    loadNFTs();
    async function loadNFTs() {
      setLoading(true);
      let nfts = await getNFTs(address, 0, chainSelected);
      setNfts(nfts);
      setLoading(false);
    }
  }, [chainSelected]);

  /** Loop through all NFTs and display them */
  function Loop() {
    return nfts.map((nft, key) => {
      return /*#__PURE__*/React.createElement(NFT, {
        nft: nft,
        chain: chainSelected,
        callback: callback,
        key: key
      });
    });
  }

  /** Display loading state if loading */
  if (loading) {
    return /*#__PURE__*/React.createElement("div", {
      className: styles.loadingContainer
    }, /*#__PURE__*/React.createElement(LoadingCircle, null));
  }
  if (nfts && nfts.length == 0) {
    return /*#__PURE__*/React.createElement("div", {
      className: styles.nftsEmptyState
    }, /*#__PURE__*/React.createElement("p", {
      style: {
        fontSize: 13
      }
    }, "You don't have any NFT on this network."));
  }
  return /*#__PURE__*/React.createElement("div", {
    className: styles.nftsContainer
  }, /*#__PURE__*/React.createElement(Loop, null));
}

/** Returns the details of one NFT */
function NFT({
  nft,
  chain,
  callback
}) {
  const {
    theme
  } = useOrbis();
  const [hoverNft, isNftHovered] = useHover();

  /** Set NFT as profile picture */
  function setAsNft() {
    console.log("Setting NFT as profile picture.");

    /** Save image URL */
    let _imageUrl;
    if (nft.media && nft.media?.length > 0) {
      _imageUrl = nft.media[0].thumbnail ? nft.media[0].thumbnail : nft.media[0].gateway;
    }

    /** Set NFT proof details */
    let nftDetails = {
      chain: chain,
      contract: nft.contract.address,
      tokenId: nft.id.tokenId,
      //web3.utils.hexToNumberString(nft.id.tokenId),
      timestamp: getTimestamp()
    };

    /** Save NFT details and PFP Url */
    callback(_imageUrl, nftDetails);
  }
  return /*#__PURE__*/React.createElement("div", {
    className: styles.nftContainer
  }, /*#__PURE__*/React.createElement("div", {
    ref: hoverNft,
    className: styles.nftImageContainer
  }, nft.media && nft.media?.length > 0 && /*#__PURE__*/React.createElement(React.Fragment, null, nft.media[0].thumbnail ? /*#__PURE__*/React.createElement("img", {
    src: nft.media[0].thumbnail
  }) : /*#__PURE__*/React.createElement("img", {
    src: nft.media[0].gateway
  })), isNftHovered && /*#__PURE__*/React.createElement("div", {
    className: styles.nftOverlayContainer,
    onClick: () => setAsNft()
  }, /*#__PURE__*/React.createElement("p", {
    className: styles.nftOverlayText
  }, "Use as profile ", /*#__PURE__*/React.createElement("br", null), " picture", /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement(EditIcon, {
    style: {
      color: "#FFF"
    }
  })))), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 15,
      marginTop: "0.5rem",
      color: getThemeValue("color", theme, "main")
    }
  }, nft.title));
}