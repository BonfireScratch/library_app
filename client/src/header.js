import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft } from '@fortawesome/free-solid-svg-icons';
import './header.scss';

export default class Header extends Component {
  render() {
    return (
      <div className="py-5 header">
        <div className="row">
          <div className={`col-sm-${this.props.backButton ? '9 headerContent d-flex' : '12'} pb-3`}>
            {this.props.content}
          </div>
          {this.props.backButton ?
            <div className="col-sm-3 d-flex justify-content-center align-items-center">
              <Link to="/">
                <FontAwesomeIcon icon={faChevronLeft} className="backButton" />
              </Link>
            </div> : ''
          }
        </div>
        <div className="container">
          <br></br>
          <hr></hr>
        </div>
      </div>
    );
  }
}
