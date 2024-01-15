import { Card, Col, Divider, Row, Space, Tag, Typography } from "antd";
import React from "react";
import "./overview.less";

const { Title } = Typography;

export const Overview = (props: {
  groups: {
    title: string;
    prefix: string;
    children: {
      filename: string;
      title: string;
      subtitle: string;
      cover: string;
      link: string;
      tag: string;
    }[];
  }[];
}) => {
  const { groups } = props;
  return (
    <section className="markdown">
      <Divider />
      {groups.map((group) => {
        const components = group.children;
        return components.length ? (
          <div key={group.title} className="components-overview">
            <Title level={2} className="components-overview-group-title">
              <Space align="center">
                {group.title}
                <Tag style={{ display: "block" }}>{components.length}</Tag>
              </Space>
            </Title>
            <Row gutter={[24, 24]}>
              {components.map((component) => {
                const uri = `${group.prefix}/${component.link}`.replace(
                  "//",
                  "/",
                );

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
                          backgroundImage: `url(${component.tag})`,
                        }}
                        size="small"
                        className="components-overview-card"
                        title={
                          <div className="components-overview-title">
                            {component.title} {component.subtitle}
                          </div>
                        }
                      >
                        <div className="components-overview-img">
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
