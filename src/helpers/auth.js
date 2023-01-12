/**
 * This represents some generic auth provider API, like Firebase.
 */
const axios = require('axios');
var _baseUrl = "";
if(window.location.hostname === "localhost"){
    _baseUrl = "http://localhost:5000";
    // const baseUrl = "https://devapi.adlytic.ai";
    // const baseUrl = "http://192.168.10.20:5000";
}else{
    _baseUrl = window.location.protocol+"//"+window.location.host;
}
const baseUrl = _baseUrl;
// const apiUrl = _baseUrl + "/api";
const apiUrl = 'http://localhost:5005';

const fakeAuthProvider = {
    isAuthenticated: false,
    async signin(data, callback) { 
        fakeAuthProvider.isAuthenticated = true;
        setTimeout(callback(data), 100); // fake async
    },
    signout(callback) {
        fakeAuthProvider.isAuthenticated = false;
        setTimeout(callback, 100);
    }
};
const authProvider = {
  isAuthenticated: false,
  async signin(data, callback) {
    var response = await axios({
      method: "post",
      url: apiUrl + "/login",
      // url: apiUrl+'/users/authenticate',
      data: data,
    });
    authProvider.isAuthenticated = true;
    setTimeout(callback(response), 100); // fake async
  },
  signout(callback) {
    authProvider.isAuthenticated = false;
    setTimeout(callback, 100);
  },
};

export { baseUrl, apiUrl, fakeAuthProvider, authProvider };
