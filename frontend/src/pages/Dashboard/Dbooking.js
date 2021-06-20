import axios from 'axios';
import React from 'react';
import { useState } from 'react';
import { useEffect } from 'react';
import BootstrapTable from 'react-bootstrap-table-next';
import paginationFactory from 'react-bootstrap-table2-paginator';
import { Link, useRouteMatch } from 'react-router-dom';

export const Dbooking = () => {
  let { path, url } = useRouteMatch();
  const [bookings, setbookings] = useState();

  useEffect(() => {
    axios
      .get('/api/book/', { withCredentials: true })
      .then(({ data }) => setbookings(data));
  }, []);

  const columns = [
    {
      dataField: 'bookedOn',
      text: 'Booked on',
      formatter: (cell) => new Date(cell).toDateString(),
      sort: true,
    },
    {
      dataField: 'scheduleDate',
      text: 'Scheduled Date',
      formatter: (cell) => new Date(cell).toDateString(),
      sort: true,
    },
    {
      dataField: 'user_id.name',
      text: 'Name',
      sort: true,
    },
    {
      dataField: 'service.serviceType',
      text: 'Service',
      sort: true,
    },
    {
      dataField: 'completed',
      text: 'Status',
      formatter: (cell) =>
        cell ? (
          <span style={style} className="badge  badge-success">
            Completed
          </span>
        ) : (
          <span style={style} className="badge  badge-danger">
            Pending
          </span>
        ),
      sort: true,
    },
    {
      dataField: '_id',
      text: 'Options',
      formatter: (d) => (
        <Link to={`${url}/${d}`}>
          <button className="btn buttonView">View</button>
        </Link>
      ),
    },
  ];
  const style = {
    padding: '5px 10px',
    fontWeight: '500',
  };
  return (
    <div>
      {bookings && (
        <div className="card px-3">
          <h4 className="my-4">Bookings Data</h4>
          <BootstrapTable
            bootstrap4
            keyField="_id"
            data={bookings}
            columns={columns}
            pagination={paginationFactory()}
          />
        </div>
      )}
    </div>
  );
};
