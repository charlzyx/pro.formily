import { genStyleHook } from "@formily/antd-v5/esm/__builtins__";

export default genStyleHook("array-table", (token) => {
  const {
    componentCls,
    antCls,
    colorErrorBorder,
    fontSizeSM,
    colorBgBase,
    colorBorder,
    colorBgContainer,
    colorPrimary,
  } = token;
  const itemCls = `${antCls}-formily-item`;

  return {
    [componentCls]: {
      [`${componentCls}-pagination`]: {
        display: "flex",
        justifyContent: "center",

        [`${componentCls}-status-select.has-error`]: {
          [`${antCls}-select-selector`]: {
            borderColor: `${colorErrorBorder} !important`,
          },
        },
      },
      [`${antCls}-table`]: {
        "th.react-resizable": {
          position: "relative",
          backgroundClip: "padding-box",
        },
        th: {
          ".react-resizable-handle": {
            position: "absolute",
            backgroundClip: "padding-box",
            right: "-4px",
            top: 0,
            backgroundColor: colorPrimary,
            backgroundSize: "50% 100%",
            opacity: 0,
            bottom: 0,
            transition: "opacity 0.3s ease",
            zIndex: 10000,
            width: "10px",
            border: "4px solid transparent",
            borderTop: 0,
            borderBottom: 0,
            height: "100%",
            cursor: "col-resize",
          },
          ".react-resizable-handle.active": {
            border: "4px solid transparent",
            opacity: 0.5,
          },
        },
        td: {
          visibility: "visible",
          [`${itemCls}:not(${itemCls}-feedback-layout-popover)`]: {
            marginBottom: "0 !important",

            [`${itemCls}-help`]: {
              position: "absolute",
              fontSize: fontSizeSM,
              top: "100%",
              background: colorBgBase,
              width: "100%",
              marginTop: 3,
              padding: 3,
              zIndex: 1,
              borderRadius: 3,
              boxShadow: `0 0 10px ${colorBorder}`,
              animation: "none",
              transform: "translateY(0)",
              opacity: 1,
            },
          },
        },

        table: {
          overflow: "hidden",
        },
      },

      [`${componentCls}-sort-helper`]: {
        background: colorBgContainer,
        border: `1px solid ${colorBorder}`,
        zIndex: 10,
      },
    },
  };
});
