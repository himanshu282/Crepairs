import React, { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { myContext } from '../../Context';
import { Link, useRouteMatch } from 'react-router-dom';

export const ManageCars = () => {
  let { path, url } = useRouteMatch();

  const { user } = useContext(myContext);
  const [modal, setmodal] = useState(false);
  const [brand, setbrand] = useState({
    name: null,
    image: null,
  });
  const [cars, setcars] = useState(null);

  useEffect(() => {
    fetchbrands();
  }, []);

  function fetchbrands() {
    axios
      .get('/api/cars/', { withCredentials: true })
      .then(({ data }) => {
        setcars(data);
      })
      .catch((err) => console.log(err));
  }

  function addBrand(e) {
    e.preventDefault();

    const data = new FormData();
    data.append('brandIcon', brand.image);
    data.append('name', brand.name);
    axios
      .post('/api/cars/addbrand', data, { withCredentials: true })
      .then((d) => {
        toast.success('Added');
        setbrand({
          name: null,
          image: null,
        });
        fetchbrands();
      })
      .catch((e) => console.log('error'));
    setmodal(!modal);
  }

  return (
    <div>
      <div className="container">
        <div className="row">
          <div className="col-10">
            <h3>Manage Manufacturers & Cars </h3>
          </div>
        </div>
        <div className="row my-4">
          {cars &&
            cars.map((c) => (
              <div className="col-md-2">
                <Link to={`${url}/${c._id}`}>
                  <div className="card ">
                    <img src={c.brandImage} alt="Brand" />
                  </div>
                </Link>
              </div>
            ))}

          <div className="col-md-2">
            <div className="card brand-card" onClick={() => setmodal(true)}>
              <i className="fal fa-plus fa-5x"></i>
            </div>
          </div>
        </div>

        {/* <!-- Modal --> */}
        {modal && (
          <div className="model-out-overlay">
            <div className="custom-model">
              <div className="col-6 card p-4">
                <form onSubmit={addBrand}>
                  <div className="row">
                    <div className="col-12 mb-3">
                      <h4>Add Brand</h4>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Manufacturer Name"
                        value={brand.name}
                        onChange={(b) =>
                          setbrand({ ...brand, name: b.target.value })
                        }
                        required
                      />
                    </div>
                    <div className="col-12 mb-3">
                      <input
                        type="file"
                        className="form-control"
                        accept="image/*"
                        name="brandicon"
                        onChange={(b) =>
                          setbrand({ ...brand, image: b.target.files[0] })
                        }
                      />
                    </div>
                    <div className="col-12">
                      <button className="modal-sub mr-3">Add Brand</button>
                      <button
                        className="btn btn-secondary"
                        onClick={() => setmodal(false)}
                      >
                        Close
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
        {/* <!-- END Modal --> */}
      </div>
    </div>
  );
};
