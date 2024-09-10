// components/Layout.js

import Sidebar from "./Sidebar";

const Layout = ({ children }) => {
  return <Sidebar>{children}</Sidebar>;
};

export default Layout;
