import { ImageView } from "@proformily/antd-v5";
import { Divider } from "antd";
import React from "react";

const App = () => {
  const uris = [
    "https://img.alicdn.com/imgextra/i1/O1CN01bHdrZJ1rEOESvXEi5_!!6000000005599-55-tps-800-800.svg",
    "https://img.alicdn.com/imgextra/i3/O1CN01xlETZk1G0WSQT6Xii_!!6000000000560-55-tps-800-800.svg",
  ];
  return (
    <div>
      <ImageView value={uris} />
      <Divider></Divider>
      <ImageView value="https://img.alicdn.com/imgextra/i3/O1CN01xlETZk1G0WSQT6Xii_!!6000000000560-55-tps-800-800.svg" />
    </div>
  );
};

export default App;
