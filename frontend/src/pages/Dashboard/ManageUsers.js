import axios from 'axios';
import React, { useContext, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { myContext } from '../../Context';

export const ManageUsers = () => {
  const [all, setall] = useState('');
  const { user, setHeader } = useContext(myContext);
  useEffect(() => {
    axios
      .get('/api/user/all', { withCredentials: true })
      .then((d) => setall(d.data))
      .catch((err) => alert('error in getting users'));
  }, [deleteuser]);

  function deleteuser(id, email) {
    email !== user.email
      ? axios
          .post('/api/user/deleteuser', { id }, { withCredentials: true })
          .then(() => toast.info('User deleted'))
          .catch((err) => toast.error('error'))
      : toast.warning('You cannot delete your account');
  }
  return (
    <div className="row">
      <div className="container">
        <h4>Users list</h4>
        {all && (
          <div className="col-12 card my-3">
            <table class="table">
              <thead>
                <tr>
                  <th scope="col">#</th>
                  <th scope="col">Name</th>
                  <th scope="col">Email</th>
                  <th scope="col">Role</th>
                  <th scope="col">Reg Date</th>
                  <th scope="col">Options</th>
                </tr>
              </thead>
              <tbody>
                {all.map((d, i) => (
                  <tr>
                    <th scope="row">{i + 1}</th>
                    <td>{d.name}</td>
                    <td>{d.email}</td>
                    <td>{d.isAdmin ? 'Admin' : 'Customer'}</td>
                    <td>{new Date(d.registerDate).toDateString()}</td>
                    <td>
                      <button
                        className="btn btn-danger"
                        onClick={() => deleteuser(d._id, d.email)}
                      >
                        <i class="fas fa-trash"></i> Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
