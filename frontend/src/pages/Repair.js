import React, { useContext, useEffect, useState } from 'react';
import { Link, useHistory } from 'react-router-dom';
import { myContext } from '../Context';
import './services.css';
import { CSSTransition } from 'react-transition-group';
import { toast } from 'react-toastify';
import axios from 'axios';
import { keys } from './Razorpay/keys';

import { EditorState } from 'draft-js';
import { Editor } from 'react-draft-wysiwyg';
import { convertToHTML } from 'draft-convert';
import DOMPurify from 'dompurify';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
import TimePicker from 'react-bootstrap-time-picker';

export const Repair = () => {
  const { user, setAuth, auth, setHeader } = useContext(myContext);
  const history = useHistory();
  setHeader(false);

  const [brands, setbrands] = useState(null);

  // wysiwyg
  const [editorState, setEditorState] = useState(() =>
    EditorState.createEmpty()
  );
  const [convertedContent, setConvertedContent] = useState(null);

  const handleEditorChange = (state) => {
    setEditorState(state);
    convertContentToHTML();
  };

  const convertContentToHTML = () => {
    let currentContentAsHTML = convertToHTML(editorState.getCurrentContent());
    setConvertedContent(currentContentAsHTML);
    setForm((f) => ({ ...f, descBox: JSON.stringify(currentContentAsHTML) }));
  };

  console.log(convertedContent);

  const createMarkup = (html) => {
    return {
      __html: DOMPurify.sanitize(html),
    };
  };
  // wysiwyg END

  useEffect(() => {
    fetchbrands();
    if (user) {
      setForm((f) => ({
        ...f,
        fullName: user ? user.name : null,
        phoneNo: user ? user.phone : null,
        email: user ? user.email : null,

        houseNo: user ? user.address && user.address.houseNo : null,
        locality: user ? user.address && user.address.locality : null,
        city: user ? user.address && user.address.city : null,
        pincode: user ? user.address && user.address.pincode : null,
      }));
    }
  }, [user]);

  function fetchbrands() {
    axios
      .get('/api/cars/', { withCredentials: true })
      .then(({ data }) => {
        setbrands(data);
      })
      .catch((err) => console.log(err));
  }

  const [step, setStep] = useState(1);
  const [animate, setAnimate] = useState(false);

  const [form, setForm] = useState({
    reg: null,
    vehicleBrand: null,
    vehicleModel: null,
    vehicleImage: null,
    repair: [],
    serviceType: 'Repair',
    descBox: null,
    price: null,
    duration: null,
    date: null,
    time: null,
    fullName: user ? user.name : null,
    phoneNo: user ? user.phone : null,
    email: user ? user.email : null,

    houseNo: user ? user.address && user.address.houseNo : null,
    locality: user ? user.address && user.address.locality : null,
    city: user ? user.address && user.address.city : null,
    pincode: user ? user.address && user.address.pincode : null,
    country: 'INDIA',
    paymentMethod: 'onDelivery',

    razorpay: {
      razorpay_payment_id: null,
      razorpay_order_id: null,
      razorpay_signature: null,
      loading: true,
    },
  });

  useEffect(() => {
    if (brands) {
      const i = brands.filter((b) => {
        return b.brand === form.vehicleBrand;
      })[0];
      console.log(i);
    }
  }, [form.vehicleModel]);

  useEffect(() => {
    setAnimate(true);
  }, [step]);

  const handleContinue = () => {
    if (step === 3) {
      if (form.paymentMethod === 'Online') {
        // displayRazorpay();
      } else
        axios
          .post('/api/book/add', form, { withCredentials: true })
          .then((e) => {
            history.push('/success');
          })
          .catch((e) => console.log(e));
    }
    if (step !== 3) {
      switch (step) {
        case 1:
          if (
            form.vehicleBrand === null ||
            form.vehicleModel === null ||
            form.repair.length === 0
          )
            toast.error('Please fill all fields');
          else {
            setAnimate(false);
            auth ? setStep((e) => e + 1) : history.push('/signin');
          }
          break;

        case 2:
          if (
            form.date === null ||
            form.time === null ||
            form.fullName === null ||
            form.email === null ||
            form.phoneNo === null ||
            form.houseNo === null ||
            form.locality === null ||
            form.pincode === null ||
            form.city === null ||
            form.country === null
          )
            toast.error('Please fill all fields');
          else {
            setAnimate(false);
            setStep((e) => e + 1);
          }
          break;

        default:
          break;
      }
    }
  };
  const handlePrevious = () => {
    if (step !== 1) {
      setAnimate(false);
      setStep((e) => e - 1);
    }
  };

  function selectRepair(type) {
    if (form.repair.includes(type)) {
      const newList = form.repair.filter((data) => data !== type);
      setForm((f) => ({ ...f, repair: [...newList] }));
    } else {
      setForm((f) => ({
        ...f,
        repair: [...f.repair, type],
      }));
    }
    console.log(form);
  }

  function logout() {
    axios
      .get('/api/auth/logout', {}, { withCredentials: true })
      .then(() => {
        setAuth(false);
        toast.info('Success logout');
        history.push('/');
      })
      .catch((er) => console.log(er));
  }

  return (
    <div id="repair">
      <div className="service_nav">
        <div className="navbar-header">
          <Link className="brand" to="/">
            Crepairs
          </Link>
        </div>
        <div className="step_menu">
          <div className={step >= 1 ? 'step active' : 'step'}>
            <p>Select</p>
            <div className="circle">
              {step > 1 ? <i className="gg-check"></i> : 1}
            </div>
          </div>
          <div className="line"></div>
          <div className={step >= 2 ? 'step active' : 'step'}>
            <p>Put Info</p>
            <div className="circle">
              {step > 2 ? <i className="gg-check"></i> : 2}
            </div>
          </div>
          <div className="line"></div>
          <div className={step >= 3 ? 'step active' : 'step '}>
            <p>Book</p>
            <div className="circle">
              {step > 3 ? <i className="gg-check"></i> : 3}
            </div>
          </div>
        </div>

        <div className="auth">
          {user ? (
            <div className="userwithDrop">
              <div className="userbadge">
                <div className="d-flex">
                  <div className="col myuser text-right px-2">
                    <h6> {user.name}</h6>
                    <p> {user.isAdmin ? 'Admin' : 'Customer'}</p>
                  </div>
                  <img
                    src={
                      (user.profileImg && user.profileImg) ||
                      require('../assets/dp.png').default
                    }
                    alt="profile"
                    className="rounded-circle"
                    height="35px"
                    width="35px"
                  />
                </div>
              </div>
              <div className="user-dropdown">
                <ul className="drop-li">
                  <li>
                    <Link to="/user/profile">
                      <i className="far fa-user"></i>
                      <span> Profile</span>
                    </Link>
                  </li>
                  {user.isAdmin ? (
                    <li>
                      <Link to="/dashboard">
                        <i className="far fa-clipboard-list-check"></i>
                        <span> Dashboard</span>
                      </Link>
                    </li>
                  ) : (
                    <li>
                      <Link to="/user/booking">
                        <i className="far fa-clipboard-list-check"></i>
                        <span> My Bookings </span>
                      </Link>
                    </li>
                  )}
                  <li onClick={() => logout()}>
                    <i className="far fa-sign-out-alt"></i>
                    <span> Logout</span>
                  </li>
                </ul>
              </div>
            </div>
          ) : (
            <Link className="login-btn" to="/signin">
              Sign in
            </Link>
          )}
        </div>
      </div>
      <div className="container mheight">
        {step === 1 && (
          <CSSTransition in={animate} timeout={1000} classNames="animate">
            <div className="step1">
              <div className="row area-top">
                <div className="col-md-5 left_area">
                  <h2>Car Information</h2>
                  <label>Vehicle Registration Number </label>

                  <input type='text'
                  className='form-control appt'
                  style={{maxWidth:400, height:40}}
                  placeholder="e.g. DL 12 XY 6789"
                    value={form.reg}
                    onChange={(e) =>
                      setForm({ ...form, reg: e.target.value.toLocaleUpperCase(), })
                    }
                  />

                  <label>Vehicle Brand</label>

                  <select
                    value={form.vehicleBrand}
                    onChange={(e) =>
                      setForm({ ...form, vehicleBrand: e.target.value })
                    }
                  >
                    <option value="" selected>
                      Choose Brand
                    </option>
                    {brands && brands.map((b) => <option>{b.brand}</option>)}
                  </select>

                  <label>Vehicle Model</label>

                  <select
                    value={form.vehicleModel}
                    onChange={(e) =>
                      setForm({ ...form, vehicleModel: e.target.value })
                    }
                  >
                    <option value="" selected>
                      Choose Model
                    </option>
                    {brands &&
                      form.vehicleBrand &&
                      brands
                        .filter((b) => {
                          return b.brand === form.vehicleBrand;
                        })
                        .map((m) =>
                          m.models.map((m) => <option>{m.Name}</option>)
                        )}
                  </select>
                </div>
                <div className="col-md-7 center">
                  {brands &&
                    brands
                      .filter((b) => {
                        return b.brand === form.vehicleBrand;
                      })
                      .map(({ models }) =>
                        models.map(
                          (m) =>
                            m.Name === form.vehicleModel && (
                              <img src={m.Image} alt="car" height="300px" />
                            )
                        )
                      )}
                  {(form.vehicleBrand == null || form.vehicleModel == null) && (
                    <div
                      style={{
                        minHeight: 300,
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}
                    >
                      <img
                        src={require('../assets/8227.png').default}
                        width="80%"
                        alt=""
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="row opt">
                <div className="col-2">
                  <div
                    className={
                      form.repair.includes('Wheels') ? 'card active' : 'card'
                    }
                    onClick={() => selectRepair('Wheels')}
                  >
                    <img
                      src={require('../assets/repair/wheel.png').default}
                      alt=""
                    />
                    <p>Wheels</p>
                  </div>
                </div>
                <div className="col-2">
                  <div
                    className={
                      form.repair.includes('Ac') ? 'card active' : 'card'
                    }
                    onClick={() => selectRepair('Ac')}
                  >
                    <img
                      src={require('../assets/repair/ac.png').default}
                      alt=""
                    />
                    <p>Ac Repair</p>
                  </div>
                </div>
                <div className="col-2">
                  <div
                    className={
                      form.repair.includes('Disc Brake')
                        ? 'card active'
                        : 'card'
                    }
                    onClick={() => selectRepair('Disc Brake')}
                  >
                    <img
                      src={require('../assets/repair/break.png').default}
                      alt=""
                    />
                    <p>Disc Brake</p>
                  </div>
                </div>
                <div className="col-2">
                  <div
                    className={
                      form.repair.includes('Batteries') ? 'card active' : 'card'
                    }
                    onClick={() => selectRepair('Batteries')}
                  >
                    <img
                      src={require('../assets/repair/batt.png').default}
                      alt=""
                    />
                    <p>Batteries</p>
                  </div>
                </div>
                <div className="col-2">
                  <div
                    className={
                      form.repair.includes('Custom') ? 'card active' : 'card'
                    }
                    onClick={() => selectRepair('Custom')}
                  >
                    <img
                      src={require('../assets/repair/custom.png').default}
                      alt=""
                    />
                    <p>Custom Service</p>
                  </div>
                </div>
              </div>
            </div>
          </CSSTransition>
        )}
        {step === 2 && (
          <CSSTransition in={animate} timeout={1000} classNames="animate">
            <div style={{ minHeight: 450 }}>
              <div className="row mt-3">
                <div className="col-8">
                  <div className="">
                    <h5>Write your problem / requirement below with details</h5>
                    <Editor
                      editorState={editorState}
                      onEditorStateChange={handleEditorChange}
                      wrapperClassName="wrapper-class"
                      editorClassName="editor-class"
                      toolbarClassName="toolbar-class"
                      toolbar={{
                        options: [
                          'inline',
                          'blockType',
                          'fontSize',
                          'list',
                          'textAlign',
                          'history',
                        ],
                        inline: {
                          inDropdown: false,
                          options: ['bold', 'italic', 'underline'],
                        },

                        list: { inDropdown: false },
                        textAlign: { inDropdown: true },
                      }}
                    />
                  </div>
                </div>
                <div className="col-4">
                  <h5>Services Selected </h5>
                  <ul class="list-group">
                    {form.repair.map((d) => (
                      <li class="list-group-item">
                        <i class="fas fa-check-circle text-success mr-2"></i>
                        {d}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="row mt-2 p-3">
                <div className="col-8 UserInfo px-5 py-4">
                  <h5 className="mb-3">User Information</h5>
                  <div className="row">
                    <div className="col-md-4">
                      Full Name
                      <input
                        type="text"
                        placeholder="Enter Your Name"
                        className="form-control"
                        maxLength="20"
                        value={form.fullName}
                        onMouseLeave={(e) => e.target.checkValidity()}
                        pattern="[A-Za-z]+"
                        onChange={(e) =>
                          e.target.validity.valid &&
                          setForm({ ...form, fullName: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div className="col-md-3">
                      Phone Number
                      <input
                        type="text"
                        placeholder="+91"
                        maxLength="10"
                        className="form-control"
                        value={form.phoneNo}
                        pattern="[0-9]*"
                        onChange={(e) =>
                          e.target.validity.valid &&
                          setForm({ ...form, phoneNo: e.target.value })
                        }
                      />
                    </div>
                    <div className="col-md-5">
                      Email
                      <input
                        type="email"
                        placeholder="ex@domain.com"
                        className="form-control"
                        value={form.email}
                        onChange={(e) =>
                          setForm({ ...form, email: e.target.value })
                        }
                      />
                    </div>
                  </div>

                  <div className="row mt-3">
                    <div className="col-12">Address</div>
                    <div className="col-md-8 mb-3">
                      <input
                        type="text"
                        placeholder="House No  / Floor No / Appartment Name"
                        maxLength="100"
                        className="form-control"
                        value={form.houseNo}
                        onChange={(e) =>
                          setForm({ ...form, houseNo: e.target.value })
                        }
                      />
                    </div>
                    <div className="col-md-4 mb-3">
                      <input
                        type="text"
                        placeholder="Locality"
                        maxLength="50"
                        className="form-control"
                        value={form.locality}
                        pattern="[A-Za-z]+"
                        onChange={(e) =>
                          e.target.validity.valid &&
                          setForm({ ...form, locality: e.target.value })
                        }
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <input
                        type="text"
                        placeholder="City"
                        maxLength="50"
                        className="form-control"
                        value={form.city}
                        pattern="[A-Za-z]+"
                        onChange={(e) =>
                          e.target.validity.valid &&
                          setForm({ ...form, city: e.target.value })
                        }
                      />
                    </div>
                    <div className="col-md-3 mb-3">
                      <input
                        type="text"
                        placeholder="Pincode"
                        className="form-control"
                        pattern="[0-9]*"
                        maxLength="6"
                        value={form.pincode}
                        onChange={(e) => {
                          e.target.validity.valid &&
                            setForm({
                              ...form,
                              pincode: e.target.value,
                            });
                        }}
                      />
                    </div>
                    <div className="col-md-3 mb-3">
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
                <div className="col-4 DT p-4">
                  <div className="col-md-12 align-self-center">
                    <h4 style={{ fontWeight: 600 }}> Appointment </h4>
                    <div className="row mt-3">
                      <div className="col-md-12">
                        <label> Date </label>
                        <input
                          type="date"
                          className="form-control appt"
                          min={new Date().toISOString().split('T')[0]}
                          value={form.date}
                          onChange={(e) =>
                            setForm({ ...form, date: e.target.value })
                          }
                        />
                      </div>
                      <div className="col-md-12">
                        <label> Time </label>
                        <TimePicker
                          className="appt"
                          start={
                            form.date &&
                            new Date().toISOString().split('T')[0] ===
                              new Date(form.date).toISOString().split('T')[0]
                              ? `${
                                  new Date().getMinutes() > 50
                                    ? new Date().getHours() + 2
                                    : new Date().getHours() + 1
                                }:00`
                              : '06:00'
                          }
                          end="22:00"
                          step={60}
                          value={form.time}
                          onChange={(t) =>
                            setForm({ ...form, time: `${t / 3600}:00` })
                          }
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CSSTransition>
        )}

        {step === 3 && (
          <CSSTransition in={animate} timeout={1000} classNames="animate">
            <>
              <div className="row finalDisp mt-4" style={{ minHeight: 500 }}>
                <div className="col-md-7 ">
                  <div className="row">
                    <div className="card d-flex w-100 flex-wrap p-3 flex-row">
                      <div className="col-md-6">
                        <span>Contact Name</span>
                        <h5>{form.fullName}</h5>
                      </div>
                      <div className="col-md-6">
                        <span>Contact No</span>
                        <h5>{form.phoneNo}</h5>
                      </div>
                      <div className="col-md-6 mt-2">
                        <span>Pickup Address</span>
                        <h5>
                          {form.houseNo}, {form.locality}, {form.city},{' '}
                          {form.pincode}, {form.country}
                        </h5>
                      </div>
                      <div className="col-md-6 mt-2">
                        <span>Pickup Date & Time</span>
                        <h5>
                          {form.date}, {form.time}
                        </h5>
                      </div>
                      <div className="col-md-6 mt-2">
                            <span>Car Registration</span>
                            <h5>{form.reg}</h5>
                      </div>
                    </div>

                    <div className="card d-flex w-100 flex-wrap p-3 flex-row my-3">
                      <div className="col-12">
                        <span className="d-block">Your Selected services</span>
                        <div className="mx-2">
                          {form.repair.map((d) => (
                            <h5 className="d-inline mr-3">
                              <i class="fas fa-check-circle text-success mr-1"></i>
                              {d}
                            </h5>
                          ))}
                        </div>
                      </div>
                      <div className="col-12 mt-2">
                        <span>Repair Information</span>
                        <div
                          className="mt-2 preview p-2 rounded border"
                          style={{ background: 'rgb(255, 250, 221)' }}
                          dangerouslySetInnerHTML={createMarkup(
                            convertedContent
                          )}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-md-5 carImage">
                  {brands &&
                    brands
                      .filter((b) => {
                        return b.brand === form.vehicleBrand;
                      })
                      .map(({ models }) =>
                        models.map(
                          (m) =>
                            m.Name === form.vehicleModel && (
                              <img src={m.Image} alt="car" width="auto" />
                            )
                        )
                      )}
                  <p className="my-3">
                    {form.vehicleBrand} {form.vehicleModel}
                  </p>
                </div>
              </div>
            </>
          </CSSTransition>
        )}

        <div className="sFoot">
          <p
            className={step === 1 ? 'prev disable' : 'prev'}
            onClick={() => handlePrevious()}
          >
            Previous
          </p>

          <button className="Continue" onClick={() => handleContinue()}>
            {step !== 3 ? 'Continue' : 'Confirm Booking'}
          </button>
        </div>
      </div>
    </div>
  );
};
