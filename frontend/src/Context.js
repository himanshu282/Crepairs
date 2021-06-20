import axios from 'axios';
import { createContext, useEffect, useState } from 'react';

export const myContext = createContext();

function Context(props) {
  const [user, setUser] = useState(null);
  const [auth, setAuth] = useState(false);
  const [isheader, setHeader] = useState(true);

  useEffect(() => {
    if (auth === false) setUser(null);
    fetchuseragain();
  }, [auth]);

  const fetchuseragain = () => {
    axios
      .get('/api/user', { withCredentials: true })
      .then((u) => {
        setUser(u.data);
        setAuth(true);
      })
      .catch((err) => {
        setUser(null);
        setAuth(false);
      });
  };

  return (
    <myContext.Provider
      value={{
        user,
        auth,
        refresh: fetchuseragain,
        setAuth,
        isheader,
        setHeader,
      }}
    >
      {props.children}
    </myContext.Provider>
  );
}

export default Context;
