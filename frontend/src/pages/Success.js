import React, { useContext, useState } from 'react';
import { Link, useHistory } from 'react-router-dom';
import { myContext } from '../Context';
import Lottie from 'lottie-react';
import tick from '../assets/success-indicator.json';

export const Success = () => {
  const { setHeader } = useContext(myContext);
  const history = useHistory();
  setHeader(true);
  const [done, setDone] = useState(false);

  return (
    <div id="success">
      <div className="container">
        <div className="row py-4 justify-content-center">
          <div className="col-6 card shadow text-center">
            <Lottie
              animationData={tick}
              loop={false}
              style={{ height: 200 }}
              onComplete={() => setDone(true)}
            />
            {done && (
              <>
                <span className="woho">Woo Hoo!</span>
                <h2>Your pickup is confirmed</h2>
                <Link to="user/booking">View Status</Link>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
