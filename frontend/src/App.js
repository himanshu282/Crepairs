import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link,
  useHistory,
  Redirect,
} from 'react-router-dom';
import './App.css';
import Home from './Home';
import Login, { ForgotPassword, NewPassword, RegisterPage } from './Login';
import Dashboard from './pages/Dashboard/Dashboard';
import { myContext } from './Context';
import { useContext } from 'react';
import Wash from './pages/Wash';
import ScrollToTop from './Scrolltotop';
import * as Scroll from 'react-scroll';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Success } from './pages/Success';
import User from './pages/User';
import { Repair } from './pages/Repair';
import Maintain from './pages/Maintain';

function App(props) {
  const { user, auth, isheader } = useContext(myContext);

  return (
    <Router>
      <ScrollToTop>
        {isheader ? <Header user={user} /> : null}
        <Switch>
          <Route exact path="/" component={Home} />
          <Route path="/about" component={About} />
          <Route path="/services/car-spa" component={Wash} />
          <Route path="/services/repair" component={Repair} />
          <Route path="/services/maintenance" component={Maintain} />
          <Route path="/success" component={Success} />

          {auth ? (
            <>
              <Route path="/dashboard" component={Dashboard} />
              <Route path="/user" component={User} />
            </>
          ) : (
            <>
              <Route exact path="/signin" component={Login} />
              <Route exact path="/signup" component={RegisterPage} />
              <Route exact path="/signin/reset" component={ForgotPassword} />
              <Route
                exact
                path="/signin/createnew/:resetToken"
                component={NewPassword}
              />
            </>
          )}
        </Switch>
      </ScrollToTop>
    </Router>
  );
}

const Header = ({ user }) => {
  const history = useHistory();
  const { setAuth } = useContext(myContext);

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
  return (
    <nav className="header">
      <div className="nav container">
        <div className="navbar-header">
          <Link className="brand" to="/">
            Crepairs
          </Link>
        </div>
        <div className="menu">
          <ul className="navlink mb-0">
            <li>
              <Link to="/">Home</Link>
            </li>
            <li>
              <Scroll.Link to="about" smooth duration={500}>
                About
              </Scroll.Link>
            </li>
            <li>
              <Scroll.Link to="services" smooth duration={500}>
                Services
              </Scroll.Link>
            </li>
          </ul>
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
                      require('./assets/dp.png').default
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
                        <i className="far fa-toolbox"></i>
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
    </nav>
  );
};

function About() {
  return <h2>about ka page</h2>;
}

export default App;
