import React, { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import DOMPurify from 'dompurify';

function BookDetails({ match }) {
  const id = match.params.id;

  const [bookings, setbookings] = useState();
  const [refresh, setRefresh] = useState(true);

  const createMarkup = (html) => {
    return {
      __html: DOMPurify.sanitize(html),
    };
  };

  useEffect(() => {
    axios
      .get(`/api/book/find/${id}`, { withCredentials: true })
      .then(({ data }) => setbookings(data))
      .catch((err) => console.log(err));
  }, [refresh]);

  function handleComplete() {
    let newPrice = bookings.payment.amount;
    if (!newPrice) {
      newPrice = prompt('Please Enter Full Amount Paid by Customer');
    }
    newPrice &&
      axios
        .post(
          `/api/book/${id}/markdone`,
          { newPrice },
          { withCredentials: true }
        )
        .then(({ data }) => {
          toast.success('Booking Completed');
          setRefresh(!refresh);
        })
        .catch((err) => console.log(err));
  }

  return (
    <div className="row">
      <div className="container">
        <h3>Booking Details</h3>
        <h6>
          {bookings &&
            bookings.vehicle.reg &&
            bookings.vehicle.reg.length > 9 &&
            ` Vehicle Number :  ${bookings.vehicle.reg}`}
        </h6>
        <div className="row">
          {bookings && (
            <>
              <div className="col-md-7">
                {bookings && (
                  <div className="row">
                    <div className="col-12">
                      <div className="card shadow my-4 p-4">
                        <h5>Personal Details</h5>
                        <div className="row details">
                          <div className="col-md-4">
                            <p>Name</p>
                            <h6> {bookings.user_id.name} </h6>
                          </div>
                          <div className="col-md-3">
                            <p>Phone no</p>
                            <h6>{bookings.user_id.phone}</h6>
                          </div>
                          <div className="col-md-5">
                            <p>Email</p>
                            <h6>{bookings.user_id.email}</h6>
                          </div>
                          <div className="col-12 mt-3">
                            <p>Address</p>
                            <h6>{bookings.location}</h6>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div className="col-md-5">
                <div className="row">
                  <div className="col-12">
                    <div className="card shadow my-4 p-4">
                      <h5>Plan & Other Info</h5>
                      <div className="row details">
                        <div className="col-md-4">
                          <p>Plan Type</p>
                          <h6> {bookings.service.serviceType}</h6>
                        </div>
                        <div className="col-md-4">
                          <p>Plan Name</p>
                          <h6> {bookings.service.plan}</h6>
                        </div>
                        <div className="col-md-4">
                          <p>Vehicle </p>
                          <h6>
                            {bookings.vehicle.vehicleType
                              ? bookings.vehicle.vehicleType
                              : bookings.vehicle.model}
                          </h6>
                        </div>
                        <div className="col-md-6 mt-3">
                          <p>Date</p>
                          <h6>
                            {new Date(bookings.scheduleDate).toDateString()},
                          </h6>
                        </div>
                        <div className="col-md-6 mt-3">
                          <p>Time</p>
                          <h6>{bookings.scheduleTime}</h6>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-md-12">
                <div className="row">
                  <div className="col-12">
                    <div className="card shadow p-4">
                      {bookings.service.serviceType === 'Repair' &&
                        bookings.descBox && (
                          <div className="mb-3">
                            <h5>Service Details</h5>
                            <div className="row">
                              <div className="col-12">
                                <div
                                  className="preview"
                                  dangerouslySetInnerHTML={createMarkup(
                                    JSON.parse(bookings.descBox)
                                  )}
                                ></div>
                              </div>
                            </div>
                          </div>
                        )}
                      <h5>Payment Details</h5>
                      <div className="row details">
                        <div className="col-md-2">
                          <p>Price</p>
                          <h6> {bookings.payment.amount}</h6>
                        </div>
                        <div className="col-md-2">
                          <p>Paid</p>
                          <h6>{bookings.payment.Paid ? 'Yes' : 'No'}</h6>
                        </div>
                        <div className="col-md-3">
                          <p>Booked On</p>
                          <h6>
                            {new Date(bookings.bookedOn).toLocaleDateString()}
                          </h6>
                        </div>
                        <div className="col-md-2">
                          <p>Payment Mode</p>
                          <h6>{bookings.payment.mode}</h6>
                        </div>
                        <div className="col-md-3">
                          <p>Status</p>
                          <h6>
                            {bookings.completed ? 'Completed' : 'Pending'}
                          </h6>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="sFoot mx-0">
                  {!bookings.completed && (
                    <button onClick={handleComplete} className="Continue">
                      Mark As Completed
                    </button>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default BookDetails;
