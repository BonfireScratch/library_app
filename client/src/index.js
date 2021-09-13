import React, { lazy, Suspense } from 'react';
import ReactDOM from 'react-dom';
import 'bootstrap/dist/css/bootstrap.css';
import 'jquery/dist/jquery';
import 'bootstrap/dist/js/bootstrap';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import './main.scss';

const LandingPage = lazy(() => import('./landing'));
const BookPage = lazy(() => import('./book'));
const UserPage = lazy(() => import('./user'));
const AllBooks = lazy(() => import('./allBooks'));

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<div>Loading...</div>}>
        <Switch>
          <Route exact path='/' component={LandingPage} />
          <Route path="/book/:mode/:id" component={BookPage} />
          <Route path="/user/:mode" component={UserPage} />
          <Route path="/all-books/:availability" component={AllBooks} />
          <Route component={Error} />
        </Switch>
      </Suspense>
    </BrowserRouter>
  );
}

ReactDOM.render(
  <App />, document.getElementById('root')
);
