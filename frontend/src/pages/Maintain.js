import React, { useContext, useEffect, useState } from 'react';
import { Link, useHistory } from 'react-router-dom';
import { myContext } from '../Context';
import './services.css';
import { CSSTransition } from 'react-transition-group';
import { toast } from 'react-toastify';
import axios from 'axios';
import { keys } from './Razorpay/keys';
import TimePicker from 'react-bootstrap-time-picker';

function Maintain() {
  const { user, setAuth, auth, setHeader } = useContext(myContext);
  const [brands, setbrands] = useState(null);
  const [step, setStep] = useState(1);
  const [animate, setAnimate] = useState(false);

  const [form, setForm] = useState({
    reg: '',
    vehicleBrand: null,
    vehicleModel: null,
    vehicleImage: null,
    repair: [],
    plan: null,
    serviceType: 'Maintenance',
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
  const history = useHistory();
  setHeader(false);

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
        displayRazorpay();
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
            form.reg.length < 9 ||
            form.plan === null
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
            form.phoneNo.length !== 10 ||
            form.houseNo === null ||
            form.locality === null ||
            form.pincode === null ||
            form.pincode.length !== 6 ||
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

  function loadScript(src) {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = src;
      script.onload = () => {
        resolve(true);
      };
      script.onerror = () => {
        resolve(false);
      };
      document.body.appendChild(script);
    });
  }

  async function onlineCompleted(response) {
    const {
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
    } = response;

    axios
      .post(
        '/api/book/add',
        { ...form, razorpay_payment_id, razorpay_order_id, razorpay_signature },
        { withCredentials: true }
      )
      .then((e) => {
        history.push('/success');
      })
      .catch((e) => console.log(e));
  }

  async function displayRazorpay() {
    const res = await loadScript(
      'https://checkout.razorpay.com/v1/checkout.js'
    );
    if (!res) {
      alert('Razorpay SDK Failed to load are you online ?');
      return;
    }

    const data = await axios
      .post('/api/book/razorpay', { amount: form.price })
      .then((d) => d.data);

    const options = {
      key: keys.keyId,
      currency: 'INR',
      amount: (form.price * 100).toString(),
      order_id: data.id,
      name: 'crepairs',
      description: 'Thank you for nothing.',
      handler: (response) => {
        onlineCompleted(response);
      },
      prefill: {
        name: form.fullName,
        email: form.email,
        contact: form.phoneNo,
      },
    };
    const paymentObject = new window.Razorpay(options);
    paymentObject.open();
  }

  const handlePlanSelect = (name, dur, price) => {
    setForm({ ...form, plan: name, duration: dur, price: price });
  };

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

  const plans = [
    {
      Name: 'Basic',
      Description: 'In a period of 3 months',
      Price: 1800,
      features: [
        { name: 'AC cooling' },
        { name: 'Engine oil' },
        { name: 'Air filter' },
      ],
      Duration: '1 hr',
    },
    {
      Name: 'Normal',
      Description: 'In a period of 6 months',
      Price: 2600,
      features: [
        { name: 'AC cooling' },
        { name: 'Engine oil' },
        { name: 'Air filter' },
        { name: 'Brake Pad' },
        { name: 'Wheel Alignment' },
      ],
      Duration: '3 hr',
    },
    {
      Name: 'Advance',
      Description: 'In a period of 12 months',
      Price: 4000,
      features: [
        { name: 'AC cooling' },
        { name: 'Engine oil' },
        { name: 'Air filter' },
        { name: 'Brake Pad' },
        { name: 'Wheel Alignment' },
        { name: 'Change Tyre' },
      ],
      Duration: '4 hr',
    },
  ];

  return (
    <div>
      <div id="">
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
              <div
                className={
                  form.vehicleModel == null || form.reg.length < 10
                    ? 'step1 d-flex align-items-center'
                    : 'step1'
                }
              >
                <div className="row area-top">
                  <div className="col-md-5 left_area">
                    <h2>Car Information</h2>

                    <label>Vehicle Registration Number </label>
                    <input
                      type="text"
                      className="form-control appt"
                      style={{ maxWidth: 400, height: 40 }}
                      value={form.reg}
                      placeholder="e.g. DL 12 XY 6789"
                      onChange={(e) =>
                        setForm({
                          ...form,
                          reg: e.target.value.toLocaleUpperCase(),
                        })
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
                      form.reg.length >= 10 &&
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
                    {(form.vehicleBrand == null ||
                      form.vehicleModel == null ||
                      form.reg.length < 10) && (
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

                <div className="row plansGrid">
                  {form.vehicleModel !== null &&
                    form.reg.length >= 10 &&
                    plans.map((data) => (
                      <div className="col-md-3">
                        <div
                          className={
                            data.Name === form.plan ? 'plans active' : 'plans'
                          }
                          onClick={() =>
                            handlePlanSelect(
                              data.Name,
                              data.Duration,
                              data.Price
                            )
                          }
                        >
                          <div className="price">
                            <h5>{data.Name}</h5>
                            <p>Rs. {data.Price} </p>
                          </div>
                          <p style={{ fontSize: '0.9rem' }}>
                            {data.Description}
                          </p>
                          <div className="features mt-3">
                            {data.features.map((d) => (
                              <div className="col-12">
                                <div className="d-flex">
                                  <i class="gg-check"></i>
                                  <p>{d.name}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                          <div className="time">
                            <div className="wtICON">
                              <i class="gg-alarm"></i>
                              <p>Duration</p>
                            </div>
                            <p>{data.Duration}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </CSSTransition>
          )}
          {step === 2 && (
            <CSSTransition in={animate} timeout={1000} classNames="animate">
              <div className="step2">
                <div className="row">
                  <div className="col-md-8 align-self-center">
                    <h4 style={{ fontWeight: 600 }}> Appointment </h4>
                    <div className="row mt-3">
                      <div className="col-md-6">
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
                      <div className="col-md-6">
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
                  <div className="col-md-4 center">
                    {brands &&
                      brands
                        .filter((b) => {
                          return b.brand === form.vehicleBrand;
                        })
                        .map(({ models }) =>
                          models.map(
                            (m) =>
                              m.Name === form.vehicleModel && (
                                <img
                                  src={m.Image}
                                  alt="car"
                                  height="150px"
                                  width="auto"
                                />
                              )
                          )
                        )}
                  </div>
                </div>

                <div className="row p-3">
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
                          pattern="^[a-zA-Z_ ]*$"
                          onChange={(e) =>
                            e.target.validity.valid &&
                            setForm({ ...form, fullName: e.target.value })
                          }
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
                          pattern="^[a-zA-Z_ ]*$"
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
                          pattern="^[a-zA-Z_ ]*$"
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
                          maxLength="6"
                          value={form.pincode}
                          pattern="[0-9]*"
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
                  <div className="col-4 PlanDet plansGrid p-4">
                    {plans.map((p) =>
                      p.Name === form.plan ? (
                        <>
                          <div className="plans noplans">
                            <div className="price">
                              <h5>{p.Name}</h5>
                              <p>Rs. {p.Price} </p>
                            </div>
                            <div className="features">
                              {p.features.map((d) => (
                                <div className="col-6">
                                  <div className="d-flex">
                                    <i class="gg-check"></i>
                                    <p>{d.name}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                            <div className="time">
                              <div className="wtICON">
                                <i class="gg-alarm"></i>
                                <p>Duration</p>
                              </div>
                              <p>{p.Duration}</p>
                            </div>
                          </div>
                        </>
                      ) : null
                    )}
                  </div>
                </div>
              </div>
            </CSSTransition>
          )}

          {step === 3 && (
            <CSSTransition in={animate} timeout={1000} classNames="animate">
              <div className="step3">
                <div className="row">
                  <div className="col-12 my-3">
                    <h4 style={{ fontWeight: 600 }}>Summary</h4>
                  </div>
                  <div className="col-md-8">
                    <div className="row">
                      <div className="col-12">
                        <div className="card shadow p-4">
                          <h5>Personal Details</h5>
                          <div className="row details">
                            <div className="col-md-3">
                              <p>Name</p>
                              <h6> {form.fullName} </h6>
                            </div>
                            <div className="col-md-3">
                              <p>Phone no</p>
                              <h6>{form.phoneNo}</h6>
                            </div>
                            <div className="col-md-6">
                              <p>Email</p>
                              <h6>{form.email}</h6>
                            </div>
                            <div className="col-12 mt-3">
                              <p>Address</p>
                              <h6>
                                {form.houseNo}, {form.locality}, {form.city},{' '}
                                {form.pincode}, {form.country}
                              </h6>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="col-12">
                        <div className="card shadow p-4 mt-3">
                          <h5>Plan & Booking Details</h5>
                          <div className="row details">
                            <div className="col-4 mt-2">
                              <p>Plans</p>
                              <h6>{form.plan}</h6>
                            </div>
                            <div className="col-4 mt-2">
                              <p>Car Brand</p>
                              <h6>{form.vehicleBrand}</h6>
                            </div>
                            <div className="col-4 mt-2">
                              <p>Car Model</p>
                              <h6>{form.vehicleModel}</h6>
                            </div>

                            <div className="col-4 mt-2">
                              <p>Date</p>
                              <h6>{form.date}</h6>
                            </div>
                            <div className="col-4 mt-2">
                              <p>Time</p>
                              <h6>{form.time}</h6>
                            </div>
                            <div className="col-4 mt-2">
                              <p>Duration</p>
                              <h6>{form.duration}</h6>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="row">
                      <div className="col-12">
                        <div className="card shadow p-4">
                          <h4>Price Breakdown</h4>
                          <div className="px-3 mt-2">
                            <div className="d-flex justify-content-between">
                              <p>price</p>
                              <h6>Rs {form.price}</h6>
                            </div>
                            <div className="d-flex justify-content-between">
                              <p>Pick & Drop charges</p>
                              <h6>Free</h6>
                            </div>
                            <div className="d-flex justify-content-between final">
                              <p>Total</p>
                              <h5>Rs {form.price}</h5>
                            </div>
                          </div>
                          <hr />
                          <h5>Payment Method</h5>

                          <div className="px-3">
                            <div className="cusRadio">
                              <input
                                class="m-auto"
                                type="radio"
                                value="onDelivery"
                                name="pay"
                                id="COD"
                                onClick={(e) =>
                                  setForm({
                                    ...form,
                                    paymentMethod: e.target.value,
                                  })
                                }
                                checked={
                                  form.paymentMethod === 'onDelivery'
                                    ? true
                                    : false
                                }
                              />
                              <label htmlFor="COD">Pay on delivery</label>
                            </div>
                            <div className="cusRadio">
                              <input
                                class="m-auto"
                                type="radio"
                                value="Online"
                                name="pay"
                                id="OP"
                                onClick={(e) =>
                                  setForm({
                                    ...form,
                                    paymentMethod: e.target.value,
                                  })
                                }
                                checked={
                                  form.paymentMethod === 'Online' ? true : false
                                }
                              />
                              <label htmlFor="OP">Online Payment</label>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
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
    </div>
  );
}

export default Maintain;
