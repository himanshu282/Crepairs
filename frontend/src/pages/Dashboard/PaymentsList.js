import React, { useEffect, useState } from 'react';
import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css';
import BootstrapTable from 'react-bootstrap-table-next';
import paginationFactory from 'react-bootstrap-table2-paginator';
import 'react-bootstrap-table2-paginator/dist/react-bootstrap-table2-paginator.min.css';
import axios from 'axios';

function PaymentsList() {
  const [paymentsData, setPaymentsData] = useState(null);

  useEffect(() => {
    axios
      .get('/api/book/', { withCredentials: true })
      .then(({ data }) => setPaymentsData(data));
  }, []);

  console.log(paymentsData);

  const columns = [
    {
      dataField: 'bookedOn',
      text: 'Booked Date',
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
      dataField: 'payment.mode',
      text: 'Pay Mode',
      sort: true,
    },
    {
      dataField: 'payment.amount',
      text: 'Amount (Rs)',
      formatter: (cell) => `Rs. ${cell}`,
      sort: true,
    },
    {
      dataField: 'payment.Paid',
      text: 'Payment Status',
      formatter: priceFormatter,
      sort: true,
    },
  ];

  const style = {
    padding: '5px 10px',
    fontWeight: '500',
  };

  function priceFormatter(cell, row) {
    if (cell)
      return (
        <span style={style} className="badge  badge-success">
          Completed
        </span>
      );
    return (
      <span style={style} className="badge  badge-danger">
        Pending
      </span>
    );
  }

  return (
    <div>
      {paymentsData && (
        <div className="card px-3">
          <h4 className="my-4">Payments Data</h4>
          <BootstrapTable
            bootstrap4
            keyField="_id"
            data={paymentsData}
            columns={columns}
            pagination={paginationFactory()}
          />
        </div>
      )}
    </div>
  );
}

export default PaymentsList;
