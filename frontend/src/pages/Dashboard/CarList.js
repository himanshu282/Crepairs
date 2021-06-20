import React, { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

function CarList({ match }) {
  const id = match.params.id;

  const [modal, setmodal] = useState(false);
  const [BrandModel, setBrandModel] = useState({
    name: null,
    image: null,
  });
  const [cars, setcars] = useState(null);

  useEffect(() => {
    fetchcars();
  }, []);

  function fetchcars() {
    axios
      .get(`/api/cars/model/${id}`, { withCredentials: true })
      .then(({ data }) => {
        setcars(data);
      })
      .catch((err) => console.log(err));
  }

  function submitModel(e) {
    e.preventDefault();

    const data = new FormData();
    data.append('modelImg', BrandModel.image);
    data.append('model', BrandModel.name);
    axios
      .post(`/api/cars/model/${id}`, data, { withCredentials: true })
      .then((d) => {
        toast.success('Added');
        setBrandModel({
          name: null,
          image: null,
        });
        fetchcars();
      })
      .catch((e) => console.log('error'));
    setmodal(!modal);
  }

  return (
    <div className="row">
      <div className="container">
        <div className="col-12 d-flex justify-content-between">
          <h3>Vehicle List</h3>
          <button className="btn btn-info" onClick={() => setmodal(!modal)}>
            Add New Model
          </button>
        </div>

        {/* <!-- Modal --> */}
        {modal && (
          <div className="model-out-overlay">
            <div className="custom-model">
              <div className="col-6 card p-4">
                <form onSubmit={submitModel}>
                  <div className="row">
                    <div className="col-12 mb-3">
                      <h4>Add Model</h4>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Car Model Name"
                        value={BrandModel.name}
                        onChange={(b) =>
                          setBrandModel({ ...BrandModel, name: b.target.value })
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
                          setBrandModel({
                            ...BrandModel,
                            image: b.target.files[0],
                          })
                        }
                      />
                    </div>
                    <div className="col-12">
                      <button className="modal-sub mr-3">Add Model</button>
                      <button
                        className="btn btn-secondary"
                        onClick={() => setmodal(!modal)}
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

        <div className="col-12 my-3">
          <div className="row carlist">
            {cars &&
              cars.models.map((c) => (
                <>
                  {/* car card */}
                  <div className="col-md-4 mb-4">
                    <div className="card px-4 py-3">
                      <img className="img-fluid" src={c.Image} alt="" />
                      <h5 className="text-center mt-2 "> {c.Name} </h5>
                    </div>
                  </div>
                  {/*  car card */}
                </>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CarList;
