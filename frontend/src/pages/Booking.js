import axios from 'axios';
import React, { useContext, useEffect, useState } from 'react';
import { Link, useRouteMatch } from 'react-router-dom';
import { toast } from 'react-toastify';
import { myContext } from '../Context';
import './profile.css';
import { convertToHTML } from 'draft-convert';
import DOMPurify from 'dompurify';

function Booking() {
  let { path, url } = useRouteMatch();
  const { user, auth, setHeader, refresh } = useContext(myContext);
  setHeader(true);
  const [data, setdata] = useState(null);

  useEffect(() => {
    axios
      .get(`/api/book/${user._id}`, { withCredentials: true })
      .then((d) => setdata(d.data))
      .catch((e) => console.log(e));
  }, []);

  return (
    <div className="col-12 col-md-8 shadow profilecard  card p-5">
      <h3>Your Bookings</h3>
      <div className="row">
        {data &&
          data.map((d) => (
            <>
              <div className="col-12 col-lg-6 my-3">
                <div className="row booking_card p-2">
                  <div className="col-12">
                    <div className="row">
                      <div className="col-6">
                        <span className="title">Service</span>
                        <p>{d.service.serviceType}</p>
                      </div>
                      <div className="col-6">
                        {d.service.serviceType === 'Repair' ? (
                          <>
                            <span className="title">Car</span>
                            <p>
                              {d.vehicle.brand} {d.vehicle.model}
                            </p>
                          </>
                        ) : (
                          <>
                            <span className="title">Plan</span>
                            <p>{d.service.plan}</p>
                          </>
                        )}
                      </div>
                      <div className="col-12 my-1">
                        <span className="title">Scheduled Date & Time</span>
                        <div className="d-flex irow">
                          <i class="far fa-calendar-alt"></i>
                          <p>{new Date(d.scheduleDate).toDateString()}</p>
                          <i class="fal fa-clock"></i>
                          <p>{d.scheduleTime}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <hr className="light" />
                  <div className="col-12 d-flex justify-content-between align-items-center">
                    <p className="price">
                      {d.service.serviceType === 'Repair'
                        ? ''
                        : `Rs. ${d.payment.amount}`}
                    </p>
                    <Link className="btn buttonView" to={`${url}/${d._id}`}>
                      View
                    </Link>
                  </div>
                </div>
              </div>
            </>
          ))}
        {/*  MINE END*/}
      </div>
    </div>
  );
}

export function ViewBooking({ match }) {
  const [data, setdata] = useState(null);
  useEffect(() => {
    axios
      .get(`/api/book/find/${match.params.id}`, { withCredentials: true })
      .then((d) => setdata(d.data))
      .catch((e) => console.log(e));
  }, []);

  const createMarkup = (html) => {
    return {
      __html: DOMPurify.sanitize(html),
    };
  };

  // data && data.descBox && convertContentToHTML();

  // wysiwyg END

  return (
    <div className="col-12 col-md-8 shadow profilecard  card p-5">
      <h3>
        Your Booking for {data && data.service.serviceType}{' '}
        {data && data.completed && (
          <span class="badge badge-success align-self-right">Completed</span>
        )}
      </h3>
      <div className="row">
        {data && (
          <>
            <div className="col-12 my-3">
              <div className="row booking_card p-2">
                <div className="col-12">
                  <div className="row">
                    <div className="col-12 mt-2">
                      <h6>Plan & Service Details</h6>
                    </div>
                    <div className="col-3">
                      <span className="title">Service</span>
                      <p>{data.service.serviceType}</p>
                    </div>
                    <div className="col-3">
                      {data.service.serviceType === 'Repair' ? (
                        <>
                          <span className="title">Car</span>
                          <p>
                            {data.vehicle.brand} {data.vehicle.model}
                          </p>
                        </>
                      ) : (
                        <>
                          <span className="title">Plan</span>
                          <p>{data.service.plan}</p>
                        </>
                      )}
                    </div>
                    <div className="col-6">
                      <span className="title">Scheduled Date & Time</span>
                      <div className="d-flex irow">
                        <i class="far fa-calendar-alt"></i>
                        <p>{new Date(data.scheduleDate).toDateString()}</p>
                        <i class="fal fa-clock"></i>
                        <p>{data.scheduleTime}</p>
                      </div>
                    </div>
                    <div className="col-3">
                      <span className="title">Car Manufacturer</span>
                      <p>{data.vehicle.brand}</p>
                    </div>
                    <div className="col-8">
                      {data.service.serviceType === 'Repair' ? (
                        <>
                          <span className="title d-block">Services Opted</span>
                          {data.service.repair.map((r) => (
                            <p className="d-inline mr-2">{r}, </p>
                          ))}
                        </>
                      ) : data.service.serviceType === 'Maintenance' ? (
                        <>
                          <span className="title">Vehicle Model</span>
                          <p>{data.vehicle.model}</p>
                        </>
                      ) : (
                        <>
                          <span className="title">Vehicle Type</span>
                          <p>{data.vehicle.vehicleType}</p>
                        </>
                      )}
                    </div>
                    {data.vehicle.reg && data.vehicle.reg.length > 9 && (
                      <div className="col-4 mt-2">
                        <span className="title">Vehicle No</span>
                        <p>{data.vehicle.reg}</p>
                      </div>
                    )}
                  </div>
                </div>
                <div className="col-12">
                  <hr />
                  <div className="row">
                    <div className="col-12 mt-2">
                      <h6>User & Location Info</h6>
                    </div>
                    <div className="col-3">
                      <span className="title">Name</span>
                      <p>{data.user_id.name}</p>
                    </div>
                    <div className="col-3">
                      <span className="title">Contact No</span>
                      <p>{data.user_id.phone}</p>
                    </div>
                    <div className="col-6">
                      <span className="title">Service Location</span>
                      <p>{data.location}</p>
                    </div>
                  </div>
                </div>
                {data && data.service.serviceType === 'Repair' && data.descBox && (
                  <>
                    <div className="col-12">
                      <hr />
                      <div className="row">
                        <div className="col-12 mt-2">
                          <h6>Description</h6>
                          <div
                            className="preview"
                            dangerouslySetInnerHTML={createMarkup(
                              JSON.parse(data.descBox)
                            )}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                <div className="col-12">
                  <hr />
                  <div className="row">
                    <div className="col-12 mt-2">
                      <h6>Payment Info</h6>
                    </div>
                    <div className="col-3">
                      <span className="title">Payment Mode</span>
                      <p>{data.payment.mode}</p>
                    </div>
                    {data.service.serviceType === 'Repair' ? (
                      <>
                        <div className="col-8">
                          <span className="title">Note</span>
                          <p>
                            Estimated cost will be provided later by our
                            mechanic
                          </p>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="col-3">
                          <span className="title">Payment Status</span>
                          <p>{data.payment.Paid ? 'Paid' : 'Pending'}</p>
                        </div>
                        <div className="col-6">
                          <span className="title">Amount</span>
                          <p> Rs {data.payment.amount} </p>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <div className="foot mt-3 text-right">
                {/* {data && data.completed == false && (
                  // <p className="title text-danger">Cancel Booking</p>
                )} */}
              </div>
            </div>
          </>
        )}
        {/*  MINE END*/}
      </div>
    </div>
  );
}

export default Booking;
