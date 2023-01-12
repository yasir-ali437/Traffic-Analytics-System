import React from "react";
import {Outlet} from "react-router-dom";

import "../assets/css/layout.css";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";

const Layout = () => {
  return (
    <>
      <Header />
      <div className="container-fluid">
        <div className="row">
         {/*<Sidebar />*/} 
          <main className="col-md-12 ms-sm-auto col-lg-12 px-md-4">
            <Outlet />
          </main>
        </div>
      </div>
    </>
  );
};

export default Layout;
