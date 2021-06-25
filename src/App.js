// App.js
import React from 'react';

import { BrowserRouter as Router, Route, Switch, Link } from 'react-router-dom';

import Home from './pages/home';
import Education from './pages/education';

//const Home = () => <h1><Link to="/about">Click Me</Link></h1>
//const About = () => <h1>About Us</h1>

const App = () => (
  <Router>
    <nav>
      <ul>
        <li><Link to="/">Home</Link></li>
        <li><Link to="/edu">Edu</Link></li>
      </ul>
    </nav>
    <Switch>
      <Route exact path="/" component={Home} />
      <Route path="/edu" component={Education} />
    </Switch>
  </Router>
)

export default App;