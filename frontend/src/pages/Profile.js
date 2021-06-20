import axios from 'axios';
import React, { useContext, useEffect, useState } from 'react';
import { Link, useHistory } from 'react-router-dom';
import { toast } from 'react-toastify';
import { myContext } from '../Context';
import './profile.css';

function Profile() {
  const { user, auth, setHeader, refresh } = useContext(myContext);
  setHeader(true);
  function updateProfile() {
    axios
      .patch('/api/user/edit', { form }, { withCredentials: true })
      .then((done) => toast.success('Updated'))
      .catch((err) => toast.error('Error'));
  }
  const [dp, setdp] = useState({
    file: null,
    temp: null,
  });

  const [form, setForm] = useState({
    fullName: user.name,
    email: user.email,
    phone: user.phone,
    houseNo: user.address ? user.address.houseNo : null,
    locality: user.address ? user.address.locality : null,
    city: user.address ? user.address.city : null,
    pincode: user.address ? user.address.pincode : null,
    country: 'INDIA',
  });

  function imageRemove() {
    if (dp.file || dp.temp) {
      setdp({ temp: null, file: null });
    }
    if (user.profileImg && dp.file === null) {
      axios
        .post(
          '/api/user/rmvdp',
          { img: user.profileImg },
          { withCredentials: true }
        )
        .then((res) => {
          refresh();
          setdp({ temp: null, file: null });
          toast.success('Image removed');
        })
        .catch((err) => console.log(err));
    }
  }

  function imageupload() {
    const data = new FormData();
    data.append('pic', dp.file);
    if (dp.file) {
      axios
        .post('/api/user/setdp', data, { withCredentials: true })
        .then((res) => {
          refresh();
          URL.revokeObjectURL(dp.temp);
          setdp({ ...dp, file: null });
          toast.success('Image updated');
        })
        .catch((err) => console.log(err));
    } else toast.warning('Please select an image first');
  }

  return (
    <div className="col-md-6 shadow card profilecard p-5">
      <div className="row">
        <div className="col-12">
          <div className="row">
            <div className="col-3">
              <div className="profile_pic">
                <img
                  src={
                    (dp.temp && dp.temp) ||
                    (user.profileImg && user.profileImg) ||
                    require('../assets/dp.png').default
                  }
                  alt="pic"
                  className="rounded-circle"
                  height="100px"
                  width="100px"
                />
                <label htmlFor="dp" className="selectPic">
                  <i class="fal fa-camera-alt"></i>
                </label>
                <input
                  type="file"
                  name="profile"
                  id="dp"
                  accept="image/*"
                  onChange={(e) => {
                    setdp({
                      temp: URL.createObjectURL(e.target.files[0]),
                      file: e.target.files[0],
                    });
                  }}
                />
              </div>
            </div>
            <div className="col-9 mt-auto mb-3">
              <h4 className="ml-3">{user.name}</h4>
              <button
                className="btn profile-btn upload"
                onClick={() => imageupload()}
              >
                Upload
              </button>
              <button className="btn profile-btn" onClick={() => imageRemove()}>
                Remove
              </button>
            </div>
          </div>
        </div>
        <hr className="hr-custom my-4" />
        <div className="col-12 mb-3">
          <h6>Full Name</h6>
          <input
            type="text"
            className="form-control"
            onChange={(e) => setForm({ ...form, fullName: e.target.value })}
            value={form.fullName}
          />
        </div>
        <div className="col-6">
          <h6>Email</h6>
          <input
            type="email"
            className="form-control"
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            value={form.email}
            disabled
          />
        </div>
        <div className="col-6">
          <h6>Phone No</h6>
          <input
            type="text"
            className="form-control"
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            value={form.phone}
          />
        </div>

        <div className="col-12">
          <hr className="hr-custom my-4" />
          <div className="row mt-3">
            <div className="col-12">Address</div>
            <div className="col-md-12 mb-3">
              <input
                type="text"
                placeholder="House No  / Floor No / Appartment Name"
                maxLength="100"
                className="form-control"
                value={form.houseNo}
                onChange={(e) => setForm({ ...form, houseNo: e.target.value })}
              />
            </div>
            <div className="col-md-5 mb-3">
              <input
                type="text"
                placeholder="Locality"
                maxLength="50"
                className="form-control"
                value={form.locality}
                onChange={(e) => setForm({ ...form, locality: e.target.value })}
              />
            </div>
            <div className="col-md-4 mb-3">
              <input
                type="text"
                placeholder="City"
                maxLength="50"
                className="form-control"
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
              />
            </div>
            <div className="col-md-3 mb-3">
              <input
                type="text"
                placeholder="Pincode"
                className="form-control"
                value={form.pincode}
                onChange={(e) => setForm({ ...form, pincode: e.target.value })}
              />
            </div>
            <div className="col-md-12 mb-3">
              <input
                type="text"
                value="India"
                maxLength="30"
                className="form-control"
                disabled
              />
            </div>
          </div>
        </div>
        <div className="col-12 text-right mt-4">
          <button
            type="submit"
            className="btn btn-primary"
            onClick={() => updateProfile()}
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}

export default Profile;

export const Cpassword = () => {
  const { user, auth, setHeader, refresh, setAuth } = useContext(myContext);
  const history = useHistory();

  const [pass, setpass] = useState({
    current: null,
    new: null,
    confirm: null,
  });

  function logout() {
    axios
      .get('/api/auth/logout', {}, { withCredentials: true })
      .then(() => {
        setAuth(false);
        history.push('/signin');
      })
      .catch((er) => console.log(er));
  }

  function changepass() {
    if (pass.new === pass.confirm) {
      axios
        .post('/api/user/changepass', { pass }, { withCredentials: true })
        .then(() => {
          toast.success('password changed');
          setpass({ current: null, new: null, confirm: null });
          logout();
        })
        .catch((err) => toast.error('current password is incorrect'));
    } else toast.error('password does not match');
  }

  return (
    <div className="col-md-6 shadow card profilecard p-5">
      <h3>Change Password</h3>
      <div className="row mt-3">
        <div className="col-12 mb-3">
          <h6>Current Password</h6>
          <input
            type="password"
            className="form-control"
            value={pass.current}
            onChange={(p) => setpass({ ...pass, current: p.target.value })}
          />
        </div>
        <div className="col-6">
          <h6>New password</h6>
          <input
            type="password"
            className="form-control"
            value={pass.new}
            onChange={(p) => setpass({ ...pass, new: p.target.value })}
          />
        </div>
        <div className="col-6">
          <h6>Confirm Password</h6>
          <input
            type="password"
            className="form-control"
            value={pass.confirm}
            onChange={(p) => setpass({ ...pass, confirm: p.target.value })}
          />
        </div>

        <div className="col-12 text-right mt-4">
          <button
            onClick={() => changepass()}
            type="submit"
            className="btn btn-primary"
          >
            Change password
          </button>
        </div>
      </div>
    </div>
  );
};
