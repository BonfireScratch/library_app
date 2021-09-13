import React, { Component, lazy, Suspense } from "react";
import { Link } from 'react-router-dom';
import axios from 'axios';

const Header = lazy(() => import('./header'));

let normalizeGreek = text => text.normalize('NFD').replace(/[\u0300-\u036f]/g, "").replace('ς', 'σ');
const searchOptionsCheckbox = ["Μη δανεισμένo", "Δανεισμένo", "Εκπρόθεσμo"];

export default class LandingPage extends Component {
  constructor(props) {
    super(props);

    this.state = {
      bookInput: "",
      booksToShow: [],
      searchIn: [0, 1, 2],
      booksByStatus: [],
    };

    this.doBookSearch = this.doBookSearch.bind(this);
  }

  async componentDidMount() {
    let booksByStatus = [];

    for (let search of this.state.searchIn) {
      const res = await axios.get(`${process.env.REACT_APP_API_LINK}book?availability=[${search}]`);
      booksByStatus.push(res.data.count);
    }

    this.setState({booksByStatus});
  }

  async doBookSearch() {
    const { bookInput, searchIn } = this.state;

    if (bookInput.length < 3) return;

    // Fetch books containing the given keywords
    const res = await axios.get(`${process.env.REACT_APP_API_LINK}book?keywords=${normalizeGreek(bookInput)}&availability=${JSON.stringify(searchIn)}&limit=8`);

    this.setState({ booksToShow: res.data.rows });
  }

  searchCheckboxChange(checkboxIndex) {
    // Add checkboxIndex to state if checked, remove checkboxIndex if not checked

    let searchInCopy = this.state.searchIn; // Make a copy of the state entry to mutate
    let index = searchInCopy.indexOf(checkboxIndex);

    if (index === -1) {
      searchInCopy.push(checkboxIndex);
    } else {
      searchInCopy.splice(index, 1);
    }

    this.setState({ searchIn: searchInCopy });

    // Update search results
    this.doBookSearch();
  }

  render() {
    const { bookInput } = this.state;

    return (
      <>
        <Suspense fallback={<div>Loading...</div>}>
          <Header content={<h1 className="text-center">ΒΙΒΛΙΟΘΗΚΗ</h1>} backButton={false} />
        </Suspense>
        <div className="container-fluid darkContainer h-100 p-5">
          <div className="headerWave">
            <svg data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
              <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" className="shape-fill"></path>
            </svg>
          </div>
          <div className="w-75 mx-auto">
            <h3 className="text-center">Αναζήτηση βιβλίου</h3>
            <div className="input-group pt-3">
              <input type="form-control" className="form-control" placeholder="Ο Μικρός Πρίγκηπας" value={bookInput} onChange={e => this.setState({ bookInput: e.target.value }, this.doBookSearch) }></input>
              <button className="btn" type="button" id="button-addon" onClick={this.doBookSearch}>Αναζήτηση</button>
            </div>
            <div className="list-group pb-3">
              {this.state.booksToShow.map(({id, title, author}, index) => {
                return (
                  <Link to={`/book/view/${id}`} className="list-group-item list-group-item-action" key={index}><span>{title}</span> του {author}</Link>
                )
              })}
              {(this.state.booksToShow.length === 0 && this.state.bookInput.length > 2) ?
                <Link to={`/book/create/${this.state.bookInput}`} className="list-group-item list-group-item-action list-group-item-dark">Το βιβλίο αυτό δεν υπάρχει. Θέλετε να το καταχωρήσετε;</Link> :
                ''
              }
            </div>
            <div className="row pb-5">
              <div className="col-md-4 d-flex justify-content-center">
                <span>Το βιβλίο που ψάχνω είναι:</span>
              </div>
              {searchOptionsCheckbox.map((label, index) => {
                return (
                  <div className="col-md-2 form-check form-check-inline" key={index}>
                    <input className="form-check-input" type="checkbox" value={index} id={`searchCheckbox${index}`} onChange={() => this.searchCheckboxChange(index)} defaultChecked></input>
                    <label className="form-check-label" htmlFor={`searchCheckbox${index}`}>{label}</label>
                  </div>
                );
              })}
            </div>
            <h3 className="text-center">Διαχείρηση χρηστών</h3>
            <div className="d-flex justify-content-center align-items-center pb-5">
              <Link to="/user/manage"><h4><button className="btn me-3" type="button" id="button-addon">Επεξεργασία χρήστη</button></h4></Link>
              <h4 className="text-center">ή</h4>
              <Link to="/user/create"><h4><button className="btn ms-3" type="button" id="button-addon">Δημιουργία χρήστη</button></h4></Link>
            </div>
            <h3 className="text-center">Στατιστικά</h3>
            {this.state.booksByStatus.map((count, index) => {
              return (
                <h4 key={index}>{searchOptionsCheckbox[index].replace(/.$/, "α")}: <Link to={`/all-books/${index}`}>{count}</Link></h4>
              );
            })}
          </div>
        </div>
      </>
    );
  }
}
