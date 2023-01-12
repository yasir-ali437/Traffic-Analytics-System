import React, { Fragment, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { encryptStorage } from "../helpers/encryptStorage";
import { HiChartSquareBar } from "react-icons/hi";
import { useAuth } from "../App";
import { Col } from "reactstrap";
import { NavLink } from "react-router-dom";
import { BsLock } from "react-icons/bs";
import { RiLogoutCircleLine } from "react-icons/ri";
import { BsBellFill } from "react-icons/bs";
import { IoIosArrowDown } from "react-icons/io";
import { useSelector } from "react-redux";
import logo from "../assets/img/traf_logo.png";
import { DownOutlined } from "@ant-design/icons";
import { Dropdown, Space } from "antd";
import "./Header.css";



const Header = () => {

  const items = [
    {
      label: <div className="sign_out" href="#" onClick={()=> signOut()}> <RiLogoutCircleLine/> Logout</div>,
      key: "0",
    },
    {
      label: <Link  style={{ textDecoration: "none" , marginLeft : '12px' }}  to={"/settings"}>Settings</Link>,
      key: "1",
    },
  
    {
      label: <Link style={{ textDecoration: "none", marginLeft : '12px' }} to={"/profile"}>Account</Link>,
      key: "3",
    },
  ];

  const config = useSelector((state) => state.data.config);
  const [skillLogo, setSkillLogo] = useState(config.data.key);
  // const skillLogo = config.data.key;
  if (skillLogo === "intrusion") {
    setSkillLogo("Intrusion");
  }
  let navigate = useNavigate();
  let location = useLocation();
  let auth = useAuth();
  let from = "/";
  const signOut = () => {
    auth.signout(() => {
      // localStorage.removeItem("user");
      encryptStorage.removeItem("user");
      navigate(from, { replace: true });
    });
  };
  return (
    <Col md={12} className="main_header">
      <Col className="logo" md={2}>
        <img src={logo} alt="Optra_Skill_Logo" height="39" width="157" />
        {/* <img src={`https://api.adlytic.ai/uploads/optra/sm/${skillLogo}.png`} alt="Optra_Skill_Logo" height="60" /> */}
        {/* <img src={logo} alt="Optra_Skill_Logo" height="auto" /> */}
      </Col>
      <Col className="menu" md={7}>
        <>
          {config.menu.map((e, index) => {
            return (
              <>
                <NavLink
                  className={({ isActive }) =>
                    isActive ? "active_link" : "text"
                  }
                  style={{ textDecoration: "none" }}
                  to={e.path}
                  key={index}
                >
                  {e.label}
                </NavLink>
              </>
            );
          })}
        </>
      </Col>

      <Col md={3} className="notification">
        {/* <div className="icon">
          <BsBellFill />
          <div className="dot"></div>
        </div> */}
        {/* <div className="line"></div> */}
        <div className="dropdown">
          <Dropdown className="login_btn" menu={{ items }} trigger={["click"]}>
            <Space onClick={(e) => e.preventDefault()} className="drop_text">
              User Login <IoIosArrowDown />
            </Space>
          </Dropdown>
        </div>
      </Col>
      {/*
    <header className="col-12 border-bottom">
    <button className="navbar-toggler position-absolute d-md-none collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#sidebarMenu" aria-controls="sidebarMenu" aria-expanded="false" aria-label="Toggle navigation">
        <span className="navbar-toggler-icon"></span>
    </button>
   <input className="form-control form-control-light w-100 shadow-none" type="text" placeholder="Search" aria-label="Search"/>
   <div className="navbar-nav">
   <div className="nav-item text-nowrap">
   <a className="nav-link px-3 radius-8" href="#" onClick={()=> signOut()}> <RiLogoutCircleLine/> Logout</a>
   </div>
   </div>
   </header>
*/}
    </Col>
  );
};

export default Header;
