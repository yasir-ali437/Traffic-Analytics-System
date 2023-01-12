import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation, Navigate } from "react-router-dom";
import React, { createContext, useEffect, useState } from 'react';
import Login from './pages/Login.jsx';
import Layout from './pages/Layout';
import Settings from './pages/Settings';
import Profile from './pages/Profile';
import NoMatch from './pages/NoMatch';
import { authProvider } from './helpers/auth';
import {encryptStorage} from './helpers/encryptStorage'

import {Provider} from 'react-redux';
import store from './store/store';
import Selection from './pages/Selection';
import Survey from "./pages/Survey";
import Detail from "./pages/Detail.jsx";
import Progress_ex from "./pages/Progress_ex.jsx";
// import * as config from './config.json'; 


function App() {
  return (
    <Provider store={store}>
      <AuthProvider>
        <Router>
          <Routes>
          
            <Route path="/pro" element={<Progress_ex/>}/>
            <Route path="/login" element={<Login />}/>
            <Route path="/" element={<RequireAuth><Layout /></RequireAuth>}>
              <Route path={'/settings'} element={<Settings />}/>
              <Route path={'/profile'} element={<Profile />}/>
              <Route index element={<Selection />}/>
              <Route path="/detail/:id" element={<Detail />}/>
              <Route path="/survey" element={<Survey />}/>
            </Route>
            <Route path="*" element={<NoMatch/>}/>
          </Routes>
        </Router>
      </AuthProvider>
    </Provider>
  );
}

// const AuthContextType = {
//   user: null,
//   signin: (user, callback) => {},
//   signout: (callback) => {}
// }

let AuthContext = createContext(null);

function AuthProvider({ children }) {
  // var rawUser = localStorage.getItem("user");
  var rawUser = encryptStorage.getItem("user");
  
  let [user, setUser] = useState(rawUser);

  let signin = (data, callback) => {
    return authProvider.signin(data, (res) => {
      setUser(res);
      callback(res);
    });
  };

  let signout = (callback) => {
    return authProvider.signout(() => {
      setUser(null);
      callback();
    });
  };

  let value = { user, signin, signout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return React.useContext(AuthContext);
}

function AuthStatus() {
  let auth = useAuth();
  let navigate = useNavigate();

  if (!auth.user) {
    return <p>You are not logged in.</p>;
  }

  return (
    <p>
      Welcome {auth.user}!{" "}
      <button
        onClick={() => {
          auth.signout(() => navigate("/"));
        }}
      >
        Sign out
      </button>
    </p>
  );
}

export const RequireAuth = ({ children }) => {

  let auth = useAuth();
  console.log('authauth',auth);
  let location = useLocation();

  if (!auth.user) {
    // Redirect them to the /login page, but save the current location they were
    // trying to go to when they were redirected. This allows us to send them
    // along to that page after they login, which is a nicer user experience
    // than dropping them off on the home page.
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

export default App;
