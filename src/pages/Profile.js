import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Alert, Button, Col, Row } from 'reactstrap';
import { changePasword, getLocalUser } from '../helpers/requests';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './Profile.css'

const Profile = () => {
  const user = getLocalUser();
  const [oldPassword, setOldPassword] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [res, setRes] = useState({ msg: "", status: "", data: null });
  const dispatch = useDispatch();
  const updatePassword = async () => {
    if (password.length === 0 || confirm.length === 0 ||oldPassword.length=== 0) {
      setRes({ msg: "Passwords cannot be empty.", status: "error" });
      return;
    }
    setLoading(true);
    var res = await changePasword({
      dispatch,
      params: {
        password: password,
        confirm: confirm,
        oldpassword: oldPassword,
      }
    });
    toast(res.message);
    setRes(res);
    if (res.status === "success") {
      setPassword("");
      setConfirm("");
      setOldPassword("");
    }
    setLoading(false);
  }
  return (
    <>
      <ToastContainer />
      <div className='py-5'>
        <Row>
          <Col sm={12} md={12} lg={12}>
            <h4 className='mb-3' style={{textAlign:'center'}} >Account</h4>
          </Col>
          <Col className='col-md-6 col-sm-12 col-lg-6 offset-md-3 offset-lg-3'>
            <h5>Reset Password:</h5>
            <div className='mb-3'>
              <label className='profile_label'>Old Password</label>
              <input type="password" placeholder="Old Password" className="form-control" id="old_password" onChange={(e) => setOldPassword(e.target.value)} />
            </div>
            <div className='mb-3'>
              <label className='profile_label'>Password</label>
              <input type="password" placeholder="Password" className="form-control" id="password" onChange={(e) => setPassword(e.target.value)} />
            </div>
            <div className='mb-3'>
              <label className='profile_label'>Confirm</label>
              <input type="password" placeholder="Confirm Password" className="form-control" id="confirm" onChange={(e) => setConfirm(e.target.value)} />
            </div>
            {
              res.status === "error" &&
              <Alert color="danger">
                {res.msg}
              </Alert>
            }
            <button className='summary_btn' onClick={() => updatePassword()} disabled={loading}>{loading ? "Wait..." : "Change Password"}</button>
          </Col>
        </Row>
      </div>
    </>
  );
}

export default Profile;