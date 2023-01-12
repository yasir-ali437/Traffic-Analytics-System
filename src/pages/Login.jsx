import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { EyeOff, Eye } from "react-feather";
import { useSelector } from "react-redux";
import { useAuth } from "../App";
// import logo from '../assets/img/sentiment.png';
import logo from "../assets/img/logo.png";
import { loginRequest, loginRequestTwo, updateUser } from "../helpers/requests";
import { Col } from "reactstrap";
import './Login.css'
import logpic from '../assets/img/log_pic.png'
import useEnterKeyListener from "../customHooks/useEnterKeyListener";
import { encryptStorage } from "../helpers/encryptStorage";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { apiUrl } from "../helpers/auth";

import { login_user } from "../helpers/requests.js";

const Login = () => {
  let auth = useAuth();
  const [email, setEmail] = useState();
  const [password, setPassword] = useState();
  const [response, setResponse] = useState();
  const [progress, setProgress] = useState(false);
  const [passwordShown, setPasswordShown] = useState(false);
  const config = useSelector((state) => state.data.config);
  let navigate = useNavigate();

  // const skillLogo = config.data.key;
  // let location = useLocation();
  const [skillLogo, setSkillLogo] = useState(config.data.key);

  if (skillLogo === "intrusion") {
    setSkillLogo("Intrusion");
  }

  let from = "/";

  useEnterKeyListener({
    querySelectorToExecuteClick: "#submitButton",
  });


  const togglePasswordVisiblity = () => {
    setPasswordShown(passwordShown ? false : true);
  };





  const login = () => {
    setProgress(true);

    auth.signin({ email: email, password: password }, (res) => {
      if (res.data.status) {
        setProgress(false);
        let user = {
          ...res.data.data,
          isAuthenticated: true,
          time: new Date(),
        };
        updateUser(user);
        // localStorage.setItem("user", JSON.stringify(user));
        encryptStorage.setItem("user", JSON.stringify(user));

        navigate(from, { replace: true });
      } else {
        // console.log(res.data.message);
        toast(res.data.message);
        setProgress(false);
        setResponse(res.data);
      }
    });
  };












  return (
    <>
      <Col className='main_login'>
        <div className="login_content">
          <div className="login_left">
            <img src={logpic} />
          </div>
          <div className="login_right">
            <div className="login_title">Account Login</div>
            <div className="login_note">If you are already a member you can login
              with your email and password.</div>
            <div className="input_group">
              <label>Email address</label>
              <input type='email' id="floatingInput"
                placeholder="name@example.com"
                value={email} name='email'
                onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="input_group">
              <label>Password</label>
              <input type='password' id="floatingPassword"
                placeholder="Password" value={password} name='password'
                onChange={(e) => setPassword(e.target.value)} />
            </div>

            {response && response.status === "error" && (
              <div className="alert alert-danger" role="alert">
                {response.msg}
              </div>
            )}
            {response && response.status === "success" && (
              <div className="alert alert-success" role="alert">
                {response.msg}
              </div>
            )}

            <div className="check_mark">
              <input type='checkbox' />
              <label>Remember me</label>
            </div>
            <button id="submitButton"
              onClick={login}
              disabled={progress} className="login_button">{progress ? "Wait..." : "Login"}</button>

            <div className="dont_acount">
              Don’t have an account?<span style={{ color: '#2D7BF2', cursor: 'pointer' }}>Sign up here</span>
            </div>

          </div>

        </div>

      </Col>

    </>
  );
};

export default Login;
