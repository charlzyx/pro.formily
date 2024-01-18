import { Card, Col, Divider, Row, Space, Tag, Typography } from "antd";
// import Col from "@arco-design/web-react/es/Grid/col";
// import Row from "@arco-design/web-react/es/Grid/row";

import { useState } from "react";

const style = {
  components_overview: {
    padding: "0",
  },
  components_overview_group_title: {
    marginBottom: "24px !important",
  },
  components_overview_a_hover: {
    textDecoration: "none",
  },
  components_overview_title: {
    overflow: "hidden",
    color: "black",
    textOverflow: "ellipsis",
  },
  components_overview_img: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    height: "152px",
  },
  components_overview_card: {
    cursor: "pointer",
    transition: "all 0.5s",
  },
  components_overview_card_hover: {
    boxShadow:
      "0 6px 16px -8px rgba(0,0,0,0.08), 0 9px 28px 0 rgba(0,0,0,0.05), 0 12px 48px 16px rgba(0,0,0,0.03)",
  },
};

const { Title } = Typography;

export default () => {
  const prefix = window.location.pathname.replace(/\.html$/, "");
  const groups = [
    {
      title: "专业级组件",
      prefix: `${prefix}/pro`,
      children: [
        {
          title: "QueryList",
          subtitle: "查询列表",
          cover:
            "https://gw.alipayobjects.com/zos/antfincdn/AwU0Cv%26Ju/bianzu%2525208.svg",
          link: "/query-list",
        },
        {
          title: "ArrayTablePro",
          subtitle: "专业Table",
          cover:
            "https://mdn.alipayobjects.com/huamei_7uahnr/afts/img/A*3yz3QqMlShYAAAAAAAAAAAAADrJ8AQ/original",
          link: "/array-table-pro",
        },
        {
          title: "EditablePro",
          subtitle: "专业对象编辑器",
          cover:
            "https://gw.alipayobjects.com/zos/antfincdn/mStei5BFC/bianzu%2525207.svg",
          link: "/editable-pro",
        },
      ],
    },
    {
      title: "增强型组件",
      prefix: `${prefix}/plus`,
      children: [
        {
          title: "Dict",
          subtitle: "远程词典",
          cover:
            "https://mdn.alipayobjects.com/huamei_7uahnr/afts/img/A*I5a2Tpqs3y0AAAAAAAAAAAAADrJ8AQ/original",
          link: "/dict",
        },
        {
          title: "Suggestion",
          subtitle: "搜索建议",
          cover:
            "https://gw.alipayobjects.com/zos/alicdn/qtJm4yt45/AutoComplete.svg",
          link: "/suggestion",
        },
        {
          title: "Linkage",
          subtitle: "级联选择",
          cover:
            "https://gw.alipayobjects.com/zos/alicdn/UdS8y8xyZ/Cascader.svg",
          link: "/linkage",
        },
      ],
    },
    {
      title: "优雅阅读态组件",
      prefix: `${prefix}/pretty`,
      children: [
        {
          title: "ImageView",
          subtitle: "图片查看",
          cover:
            "https://gw.alipayobjects.com/zos/antfincdn/D1dXz9PZqa/image.svg",
          link: "/image-view",
        },
      ],
    },
  ];

  const [hover, setHover] = useState({ overview: false, card: "" });
  return (
    <section className="markdown">
      {groups.map((group, gidx) => {
        const components = group.children;
        return components.length ? (
          <div
            key={group.title}
            style={style.components_overview}
            className="components-overview"
          >
            {gidx === 0 ? null : <Divider />}
            <Title
              // @ts-ignore
              level={2}
              // @ts-ignore
              heading={2}
              style={style.components_overview_group_title}
              className="components-overview-group-title"
            >
              <Space align="center">
                {group.title}
                <Tag style={{ display: "block" }}>{components.length}</Tag>
              </Space>
            </Title>
            <Row gutter={[24, 24]}>
              {components.map((component, idx) => {
                const uri = `${`${group.prefix}${component.link}`.replace(
                  "//",
                  "/",
                )}.html`;

                return (
                  <Col xs={24} sm={12} lg={8} xl={6} key={component.title}>
                    <a
                      style={{
                        textDecoration: "none",
                      }}
                      href={uri}
                    >
                      <Card
                        bodyStyle={{
                          backgroundRepeat: "no-repeat",
                          backgroundPosition: "bottom right",
                          // backgroundImage: `url(${component.tag})`,
                          ...style.components_overview_card,
                          ...(hover.card === `${gidx}${idx}`
                            ? style.components_overview_card_hover
                            : {}),
                        }}
                        onMouseEnter={() => {
                          setHover((x) => ({ ...x, card: `${gidx}${idx}` }));
                        }}
                        onMouseLeave={() => {
                          setHover((x) => ({ ...x, card: "" }));
                        }}
                        size="small"
                        className="components-overview-card"
                        title={
                          <div
                            style={style.components_overview_title}
                            className="components-overview-title"
                          >
                            {component.title} {component.subtitle}
                          </div>
                        }
                      >
                        <div
                          style={style.components_overview_img}
                          className="components-overview-img"
                        >
                          <img src={component.cover} alt={component.title} />
                        </div>
                      </Card>
                    </a>
                  </Col>
                );
              })}
            </Row>
          </div>
        ) : null;
      })}
    </section>
  );
};
