import React, { Fragment } from 'react';
import { Navigate,useLocation } from 'react-router-dom';
const AuthRoute = ({path, element, children}) => {
  
  var rawUser = encryptStorage.getItem("user");
    const user = rawUser ? JSON.parse(rawUser) : null;
    const isAuthenticated = user ? user.isAuthenticated : false;
    const location = useLocation()
    return (
      isAuthenticated ? 
        <Fragment
            path={path}
            element={element}
        >
          {children}
        </Fragment>
      :
        <Navigate to="/login" state={{ from: location }} replace />
    );
}

export default AuthRoute;