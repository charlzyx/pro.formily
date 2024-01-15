import React, { Fragment } from "react";
import { useMemo } from "react";
import { Image } from "../adaptor/index";

const size: React.CSSProperties = {
  width: "60px",
  height: "60px",
  objectFit: "contain",
};

export const ImageView = (props: {
  /** 图片地址(支持数组) */
  value?: string | string[];
  /**
   * 样式
   * @default  { width: '60px', height: '60px', objectFit: 'contain' }
   */
  style?: React.CSSProperties;
}) => {
  const { value, style } = props;

  const uris = useMemo(() => {
    const ret = Array.isArray(value) ? value : [value];
    return ret.filter(Boolean);
  }, [value]);

  const mergedStyle = useMemo(() => {
    return { ...size, ...style };
  }, [style]);

  return (
    <Fragment>
      <Image.PreviewGroup>
        {uris.map((uri) => {
          return <Image style={mergedStyle} key={uri} src={uri} preview />;
        })}
      </Image.PreviewGroup>
    </Fragment>
  );
};
