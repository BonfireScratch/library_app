import React, { Component, lazy, Suspense } from "react";
import axios from "axios";
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faTrashAlt, faEdit, faCheck } from "@fortawesome/free-solid-svg-icons";
import "./book.scss";

let normalizeGreek = text => text.normalize('NFD').replace(/[\u0300-\u036f]/g, "").replace('ς', 'σ');

const Calendar = lazy(() => import('./calendar'));

const warning = <div className="alert alert-danger mt-3 alert-dismissible fade show" role="alert">
                  <strong>Κάτι πήγε στραβά!</strong> Προέκυψε κάποιο πρόβλημα
                  <button type="button" className="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                </div>;

export default class BookPage extends Component {
  constructor(props) {
    super(props);

    this.state = {
      mode: props.match.params.mode,
      bookId: props.match.params.id,
      bookData: {},
      borrowData: {},
      userInput: "",
      borrowStartDate: "",
      borrowEndDate: "",
      message: "",
      borrowUser: 0,
      edit: false,
      isBorrowChecked: false,
      isReturnChecked: false,
      usersToShow: [],
    };

    this.titleRef = React.createRef();
    this.authorRef = React.createRef();
    this.genreRef = React.createRef();
    this.publisherRef = React.createRef();
    
    this.onChangeDate = this.onChangeDate.bind(this);
    this.editEnv = this.editEnv.bind(this);
    this.doUserSearch = this.doUserSearch.bind(this);
    this.sendBorrowRequest = this.sendBorrowRequest.bind(this);
    this.sendReturnRequest = this.sendReturnRequest.bind(this);
    this.deleteBook = this.deleteBook.bind(this);
    this.editBook = this.editBook.bind(this);
  }

  async componentDidMount() {
    if (this.state.mode === 'create') {
      // Set bookData to defaults
      let bookData = {
        title: this.state.bookId,
        author: "χ. σ.",
        publisher: " ",
        genre: "Είδος",
        availability: 0
      };

      this.setState({ bookData, edit: true });      
    } else {
      // When component is ready, fetch book data from the API
      const bookRes = await axios.get(`${process.env.REACT_APP_API_LINK}book/${this.state.bookId}`);
      this.setState({ bookData: bookRes.data });

      if (this.state.bookData.availability === 0) return;

      // If the book is borrowed, fetch the borrow data
      const borrowRes = await axios.get(`${process.env.REACT_APP_API_LINK}borrow/${this.state.bookId}?using=book_id`);

      // Get the borrower's first/last name based on their ID
      const userRes = await axios.get(`${process.env.REACT_APP_API_LINK}user/${borrowRes.data.f_user_id}`);
      
      let borrowState = {};
      borrowState.borrowedBy = `${userRes.data.first_name} ${userRes.data.last_name}`;
      borrowState.date_of_borrow = borrowRes.data.date_of_borrow;
      borrowState.date_of_exp_return = borrowRes.data.date_of_exp_return;

      this.setState({ borrowData: borrowState });
    }
  }
  
  onChangeDate({ startDate, endDate }) {
    // Save the new borrow dates in the state
    this.setState({ borrowStartDate: startDate, borrowEndDate: endDate });
  }

  editEnv() {
    // Enable edit mode
    this.setState({ edit: true });
  }

  async doUserSearch() {
    if (!this.state.userInput) return;

    // Get users with matching first/last name

    const data = await axios.get(`${process.env.REACT_APP_API_LINK}user?keywords=${normalizeGreek(this.state.userInput)}&limit=5`);
    const users = data.data.rows;
    let finalData = [];

    // Loop through users and chcange the name of the class column to class_

    for (const user of users) {
      const { class: class_, ...otherProps } = user;
      const entry = { class_, ...otherProps };

      finalData.push(entry);
    }

    this.setState({ usersToShow: finalData });
  }

  async sendBorrowRequest() {
    try {
      // Send borrow request
      await axios.post('${process.env.REACT_APP_API_LINK}borrow/', {
        f_user_id: this.state.borrowUser,
        f_book_id: this.state.bookId,
        date_of_borrow: this.state.borrowStartDate,
        date_of_exp_return: this.state.borrowEndDate
      });

      // Update the book's availability status
      await axios.put(`${process.env.REACT_APP_API_LINK}book/${this.state.bookId}`, {
        title: this.state.bookData.title,
        author: this.state.bookData.author,
        publisher: this.state.bookData.publisher,
        genre: this.state.bookData.genre,
        availability: 1
      });

      // Reload the window to display the changes
      window.location.reload();
    } catch {
      this.setState({ message: warning });
    }
  }

  async sendReturnRequest() {
    try {
      // Send book return request
      await axios.delete(`${process.env.REACT_APP_API_LINK}borrow/${this.state.bookId}?using=book_id`);

      // Update the book's availability status
      await axios.put(`${process.env.REACT_APP_API_LINK}book/${this.state.bookId}`, {
        title: this.state.bookData.title,
        author: this.state.bookData.author,
        publisher: this.state.bookData.publisher,
        genre: this.state.bookData.genre,
        availability: 0
      });

      // Reload the window to display the changes
      window.location.reload();
    } catch {
      this.setState({ message: warning });
    }
  }

  async deleteBook() {
    try {
      const { history } = this.props;

      // Send delete request
      await axios.delete(`${process.env.REACT_APP_API_LINK}book/${this.state.bookId}`);

      // Redirect to main page
      history.push('/');
    } catch {
      this.setState({ message: warning });
    }
  }

  async editBook() {
    try {
      // Turn off edit mode
      this.setState({ edit: false });

      let toCall;

      if (this.state.mode === 'create') {
        toCall = axios.post;
      } else {
        toCall = axios.put;
      }

      // Send book update request
      const res = await toCall(`${process.env.REACT_APP_API_LINK}book/${this.state.mode === 'view' ? this.state.bookId : ''}`, {
        title: this.titleRef.current.innerHTML,
        author: this.authorRef.current.innerHTML,
        publisher: this.publisherRef.current.innerHTML,
        genre: this.genreRef.current.innerHTML,
        availability: this.state.availability
      });

      if (this.state.mode === 'create') {
        const { history } = this.props;

        history.push(`/book/view/${res.data.id}`);
        window.location.reload();
      }
    } catch {
      this.setState({ message: warning });
    }
  }

  render() {
    const { userInput } = this.state;
    let titleColor;

    // Set the header color

    if (this.state.bookData.availability === 0) {
      titleColor = '#57bd84';
    } else if (this.state.bookData.availability === 1) {
      titleColor = '#1073e6';
    } else {
      titleColor = '#f32013';
    }

    return (
      <>
        <div className="modal fade" id="deleteModal" tabIndex="-1" aria-labelledby="deleteModalLabel" aria-hidden="true">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Διαγραφή βιβλίου</h5>
                <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
              </div>
              <div className="modal-body">
                <h6>Είστε σίγουροι ότι θέλετε να διαγράψετε το βιβλίο;</h6>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-primary" data-bs-dismiss="modal">Όχι</button>
                <button type="button" className="btn btn-danger" data-bs-dismiss="modal" onClick={this.deleteBook}>Ναι</button>
              </div>
            </div>
          </div>
        </div>
        <div className='title-div row pb-5 mb-5' style={{ '--title-color': titleColor}}>
          <div className="col-sm-9">
            <h3 ref={this.titleRef} className="text-center" contentEditable={this.state.edit} data-gramm_editor="false" suppressContentEditableWarning={true}>
              {this.state.bookData.title}             
            </h3>
            <h4 ref={this.authorRef} className="text-center" contentEditable={this.state.edit} data-gramm_editor="false" suppressContentEditableWarning={true}>
              {this.state.bookData.author}
            </h4>
            <div className="d-flex justify-content-center pb-3">
              {(this.state.bookData.genre !== "") ?
                <span ref={this.genreRef} className="badge rounded-pill bg-light text-dark mx-2" contentEditable={this.state.edit} data-gramm_editor="false" suppressContentEditableWarning={true}>
                  {this.state.bookData.genre}
                </span> :
                ""
              }
              {(this.state.bookData.publisher !== "") ?
                <span ref={this.publisherRef} className="badge rounded-pill bg-light text-dark mx-2" contentEditable={this.state.edit} data-gramm_editor="false" suppressContentEditableWarning={true}>
                  Εκδόσεις {this.state.bookData.publisher}
                </span> :
                ""
              }
            </div>
            <div className="d-flex justify-content-center">
              <button type="button" className={`btn btn-primary ${this.state.edit ? '' : 'in'}visible`} onClick={this.editBook}>
                <FontAwesomeIcon icon={faCheck} />
              </button>
            </div>
          </div>
          <div className="col-sm-3 d-flex justify-content-center align-items-center">
            <Link to="/">
              <FontAwesomeIcon icon={faChevronLeft} className="backButton" />
            </Link>
          </div>
          <div className="wave">
            <svg data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
              <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" className="shape-fill"></path>
            </svg>
          </div>
        </div>
        <div className={`row px-3 ${this.state.mode === 'create' ? 'disabled-div' : ''}`}>
          <div className="col-md-4 pb-3">
            <p className="text-center">
              Το βιβλίο είναι {this.state.bookData.availability === 0 ? "διαθέσιμο" : (this.state.bookData.availability === 1 ? "δανεισμένο" : "εκπρόθεσμο")}
              <FontAwesomeIcon icon={faTrashAlt} className="delete-icon" data-bs-toggle="modal" data-bs-target="#deleteModal" />
              <FontAwesomeIcon icon={faEdit} className="edit-icon" onClick={this.editEnv} />
            </p>
            {this.state.bookData.availability !== 0 ?
              <h5 className="text-center mb-4">{this.state.borrowData.borrowedBy} από {this.state.borrowData.date_of_borrow} μέχρι {this.state.borrowData.date_of_exp_return}</h5> :
              ""
            }
            <div className="d-flex justify-content-center">
              <div className="btn-group btn-group-lg" role="group">
                <input type="checkbox" className="btn-check" id="btn-check-borrow" autoComplete="off" onChange={e => this.setState({ isBorrowChecked: e.target.checked })} disabled={this.state.bookData.availability !== 0}></input>
                <label className="btn btn-outline-primary" htmlFor="btn-check-borrow">Δανεισμός</label>
                <input type="checkbox" className="btn-check" id="btn-check-return" autoComplete="off" onChange={e => this.setState({ isReturnChecked: e.target.checked })} disabled={this.state.bookData.availability === 0}></input>
                <label className="btn btn-outline-primary" htmlFor="btn-check-return">Επιστροφή</label>
              </div>
            </div>
            { (this.state.bookData.availability === 0) ?
              <div className={`${this.state.isBorrowChecked ? "" : "disabled-div"} text-center`}>
                <div className="input-group d-flex justify-content-center pt-3">
                  <input type="form-control" className="form-control" placeholder="Όνομα μαθητή" value={userInput} onChange={e => this.setState({ userInput: e.target.value }, this.doUserSearch)}></input>
                  <button className="btn btn-outline-secondary" type="button" id="button-addon" onClick={this.doUserSearch}>Αναζήτηση</button>
                </div>
                <div className="list-group pb-3">
                  {this.state.usersToShow.map(({id, first_name, last_name, class_ }, index) => {
                    return (
                      <li className="list-group-item list-group-item-action" onClick={e => this.setState({ borrowUser: id, userInput: `${first_name} ${last_name}` })} key={index}><span>{first_name} {last_name}</span>, {class_}</li>
                    )
                  })}
                </div>
                <button type="submit" className="btn btn-lg btn-primary" onClick={this.sendBorrowRequest} disabled={this.state.borrowStartDate === null || this.state.borrowUser === 0}>Δανεισμός</button>
              </div> :
              <div className={`${this.state.isReturnChecked ? "" : "disabled-div"} d-flex justify-content-center pt-3`}>
                <button type="submit" className="btn btn-lg btn-primary" onClick={this.sendReturnRequest}>Επιστροφή</button>
              </div>
            }
            {this.state.message}
          </div>
          <div className="col-md-8 pb-3">
            <div className={`${this.state.isBorrowChecked ? "" : "disabled-div"}`}>
              <div className="d-flex justify-content-center mb-3">
                <Suspense fallback={<div>Loading...</div>}>
                  <Calendar onDateChange={this.onChangeDate}/>
                </Suspense>
              </div>
              {(this.state.borrowStartDate !== null) ?
                <p className="lead text-center">Από {this.state.borrowStartDate} μέχρι {this.state.borrowEndDate}</p> :
                ""
              }
            </div>
          </div>
        </div>
      </>
    );
  }
}
