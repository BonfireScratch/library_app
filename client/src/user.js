import React, { lazy, Suspense, Component } from 'react';
import axios from 'axios';
import './user.scss';

const Header = lazy(() => import('./header'));

let normalizeGreek = text => text.normalize('NFD').replace(/[\u0300-\u036f]/g, "").replace('ς', 'σ');

const warning = <div className="alert alert-danger alert-dismissible fade show" role="alert">
                  Προέκυψε κάποιο πρόβλημα
                  <button type="button" className="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                </div>;

const success = <div className="alert alert-success alert-dismissible fade show" role="alert">
                  Η διαδικασία ολοκληρώθηκε
                  <button type="button" className="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                </div>;

export default class UserPage extends Component {
  constructor(props) {
    super(props);

    this.state = {
      mode: props.match.params.mode,
      firstNameInput: "",
      lastNameInput: "",
      fathersNameInput: "",
      yearOfBirthInput: "",
      classInput: "",
      userInput: "",
      usersToShow: [],
      booksBorrowed: [],
      createMessage: "",
      editMessage: "",
    };

    this.handleInputChange = this.handleInputChange.bind(this);
    this.doUserSearch = this.doUserSearch.bind(this);
    this.createUser = this.createUser.bind(this);
    this.editUser = this.editUser.bind(this);
    this.canBeDeleted = this.canBeDeleted.bind(this);
    this.deleteUser = this.deleteUser.bind(this);
  }

  handleInputChange(evt) {
    // Store the input values to the state
    const value = evt.target.value;
    this.setState({ [evt.target.name]: value });
  }

  updateUserFields(id, first_name, last_name, fathers_name, year_of_birth, class_) {
    this.setState({
      borrowUser: id,
      userInput: `${first_name} ${last_name}`,
      firstNameInput: first_name,
      lastNameInput: last_name,
      fathersNameInput: fathers_name,
      yearOfBirthInput: year_of_birth,
      classInput: class_
    });
  }

  verifyUserFields() {
    // Check if all inputs have been filled
    if (!this.state.firstNameInput || !this.state.lastNameInput || !this.state.fathersNameInput || !this.state.yearOfBirthInput || !this.state.classInput) return false;

    // Get the class level (ex. Γ, ΣΤ)
    let classLevel;

    if (this.state.classInput.length === 2) {
      classLevel = this.state.classInput.charAt(0).toUpperCase();
    } else if (this.state.classInput.length === 3) {
      classLevel = this.state.classInput.substring(0, 2).toUpperCase();
    } else {
      // If the length is not 2 or 3, then class is invalid
      return false;
    }

    // Get the class number
    const classNumber = parseInt(this.state.classInput.charAt(1));
    const validClassLevels = ['Α', 'Β', 'Γ', 'Δ', 'Ε', 'ΣΤ'];

    // Check if the classLevel and classNumber are valid
    if (validClassLevels.indexOf(classLevel) < 0 || classNumber < 1 || classNumber > 3) return false;

    // Check if date of birth is in a reasonable boundary
    if (this.state.yearOfBirthInput < new Date().getFullYear() - 13 || this.state.yearOfBirthInput > new Date().getFullYear() - 5) return false;

    return true;
  }

  async doUserSearch() {
    const { userInput } = this.state;

    if (!userInput) return;

    // Get users with matching first/last name

    const data = await axios.get(`${process.env.REACT_APP_API_LINK}user?keywords=${normalizeGreek(userInput)}&limit=5`);
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

  async createUser() {
    // Check if all fields are valid
    if (!this.verifyUserFields()) {
      this.setState({ createMessage: warning });
      return;
    }

    // Send a request to create user
    try {
      await axios.post(`${process.env.REACT_APP_API_LINK}user/`, {
        first_name: this.state.firstNameInput,
        last_name: this.state.lastNameInput,
        fathers_name: this.state.fathersNameInput,
        year_of_birth: this.state.yearOfBirthInput,
        class: this.state.classInput,
        date_of_join: new Date().toISOString().slice(0, 10) // Date in YYYY-MM-DD format
      });

      this.setState({ createMessage: success });
    } catch {
      this.setState({ createMessage: warning });
    }
  }

  async editUser() {
    // Check if the user ID is defined
    if (!this.state.borrowUser) {
      this.setState({ editMessage: warning });
      return;
    }

    // Check if all fields are valid
    if (!this.verifyUserFields()) {
      this.setState({ editMessage: warning });
      return;
    }

    try {
      await axios.put(`${process.env.REACT_APP_API_LINK}user/${this.state.borrowUser}`, {
        first_name: this.state.firstNameInput,
        last_name: this.state.lastNameInput,
        fathers_name: this.state.fathersNameInput,
        year_of_birth: this.state.yearOfBirthInput,
        class: this.state.classInput,
      });

      this.setState({ editMessage: success });
    } catch {
      this.setState({ editMessage: warning });
    }
  }

  async canBeDeleted() {
    try {
      // Find this user's pending borrows
      const res = await axios.get(`${process.env.REACT_APP_API_LINK}borrow/${this.state.borrowUser}?using=user_id`);

      let bookTitles = [];

      // Get the title for each of the pending books
      for (let borrow of res.data) {
        const bookId = borrow.f_book_id;
        const bookRes = await axios.get(`${process.env.REACT_APP_API_LINK}book/${bookId}`);

        bookTitles.push(bookRes.data.title);
      }

      this.setState({ booksBorrowed: bookTitles });
    } catch {
      this.setState({ editMessage: warning });
    }
  }

  async deleteUser() {
    try {
      // Send delete request
      await axios.delete(`${process.env.REACT_APP_API_LINK}user/${this.state.borrowUser}`);

      // Reload the page
      window.location.reload();
    } catch {
      this.setState({ editMessage: warning });
    }
  }
  
  render() {
    const { userInput, firstNameInput, lastNameInput, fathersNameInput, yearOfBirthInput, classInput } = this.state;

    return (
      <>
        <div className="modal fade" id="deleteModal" tabIndex="-1" aria-labelledby="deleteModalLabel" aria-hidden="true">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Διαγραφή χρήστη</h5>
                <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
              </div>
              <div className="modal-body">
                {this.state.booksBorrowed.length === 0 ?
                  <h6>Είστε σίγουροι ότι θέλετε να διαγράψετε τον χρήστη;</h6> :
                  <>
                    <h6>Ο χρήστης {this.state.first_name} {this.state.last_name} έχει δανειστεί τα εξής βιβλία: {this.state.booksBorrowed.join(', ')}.</h6>
                    <h6>Για να τον διαγράψετε πρέπει πρώτα αυτά να επιστραφούν.</h6>
                  </>
                }
              </div>
              <div className="modal-footer">
                {this.state.booksBorrowed.length === 0 ?
                  <>
                    <button type="button" className="btn btn-primary" data-bs-dismiss="modal">Όχι</button>
                    <button type="button" className="btn btn-danger" data-bs-dismiss="modal" onClick={this.deleteUser}>Ναι</button>
                  </> :
                  <button type="button" className="btn btn-primary" data-bs-dismiss="modal">OK</button>
                }
              </div>
            </div>
          </div>
        </div>
        <Suspense fallback={<div>Loading...</div>}>
          <Header content={<h2 className="text-center">ΔΙΑΧΕΙΡΗΣΗ ΧΡΗΣΤΩΝ</h2>} backButton={true} />
        </Suspense>
        <div className="createContainer h-100 pt-5">
          <div className="headerWave">
            <svg data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
              <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" className="shape-fill"></path>
            </svg>
          </div>
          <div className={`${this.state.mode === 'create' ? '' : 'disabled-div'}`}>
            <h3 className="text-center">Δημιουργία χρήστη</h3>
            <div className="row p-5 g-3" noValidate>
              <div className="form-floating col-md-2">
                <input type="text" name="firstNameInput" className="form-control" placeholder="-" value={firstNameInput} onChange={this.handleInputChange}></input>
                <label htmlFor="firstNameInput">Όνομα</label>
              </div>
              <div className="form-floating col-md-2">
                <input type="text" name="lastNameInput" className="form-control" placeholder="-" value={lastNameInput} onChange={this.handleInputChange}></input>
                <label htmlFor="lastNameInput" className="form-label">Επώνυμο</label>
              </div>
              <div className="form-floating col-md-2">
                <input type="text" name="fathersNameInput" className="form-control" placeholder="-" value={fathersNameInput} onChange={this.handleInputChange}></input>
                <label htmlFor="fathersNameInput" className="form-label">Πατρώνυμο</label>
              </div>
              <div className="form-floating col-md-2">
                <input type="text" name="yearOfBirthInput" className="form-control" placeholder="-" value={yearOfBirthInput} onChange={this.handleInputChange}></input>
                <label htmlFor="yearOfBirthInput" className="form-label">Έτος Γέννησης</label>
              </div>
              <div className="form-floating col-md-1">
                <input type="text" name="classInput" className="form-control" placeholder="-" value={classInput} onChange={this.handleInputChange}></input>
                <label htmlFor="classInput" className="form-label">Τμήμα</label>
              </div>
              <div className="col-md-2">
                <button className="btn btn-primary btn-lg" type="submit" onClick={this.createUser}>Δημιουργία</button>
              </div>
              <div className="col-md-4">
                {this.state.createMessage}
              </div>
            </div>
          </div>
          <div className={`manageContainer darkContainer px-5 ${this.state.mode === 'manage' ? '' : 'disabled-div'}`}>
            <div className="tilt">
              <svg data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
                <path d="M1200 120L0 16.48 0 0 1200 0 1200 120z" className="shape-fill"></path>
              </svg>
            </div>
            <h3 className="text-center pt-5">Επεξεργασία χρήστη</h3>
            <div className="w-75 m-auto">
              <div className="input-group d-flex justify-content-center pt-3">
                <input type="form-control" className="form-control" placeholder="Όνομα μαθητή" value={userInput} onChange={e => this.setState({ userInput: e.target.value }, this.doUserSearch)}></input>
                <button className="btn" type="button" id="button-addon" onClick={this.doUserSearch}>Αναζήτηση</button>
              </div>
              <div className="list-group pb-3">
                {this.state.usersToShow.map(({id, fathers_name, first_name, last_name, year_of_birth, class_ }, index) => {
                  return (
                    <li className="list-group-item list-group-item-action" onClick={() => this.updateUserFields(id, first_name, last_name, fathers_name, year_of_birth, class_)} key={index}><span>{first_name} {last_name} του {fathers_name}</span>, {class_}</li>
                  )
                })}
              </div>
              <div className="row py-5 g-3" noValidate>
                <div className="form-floating col-md-2">
                  <input type="text" name="firstNameInput" className="form-control" placeholder="-" value={firstNameInput} onChange={this.handleInputChange}></input>
                  <label htmlFor="firstNameInput">Όνομα</label>
                </div>
                <div className="form-floating col-md-2">
                  <input type="text" name="lastNameInput" className="form-control" placeholder="-" value={lastNameInput} onChange={this.handleInputChange}></input>
                  <label htmlFor="lastNameInput" className="form-label">Επώνυμο</label>
                </div>
                <div className="form-floating col-md-2">
                  <input type="text" name="fathersNameInput" className="form-control" placeholder="-" value={fathersNameInput} onChange={this.handleInputChange}></input>
                  <label htmlFor="fathersNameInput" className="form-label">Πατρώνυμο</label>
                </div>
                <div className="form-floating col-md-2">
                  <input type="text" name="yearOfBirthInput" className="form-control" placeholder="-" value={yearOfBirthInput} onChange={this.handleInputChange}></input>
                  <label htmlFor="yearOfBirthInput" className="form-label">Έτος Γέννησης</label>
                </div>
                <div className="form-floating col-md-1">
                  <input type="text" name="classInput" className="form-control" placeholder="-" value={classInput} onChange={this.handleInputChange}></input>
                  <label htmlFor="classInput" className="form-label">Τμήμα</label>
                </div>
                <div className="col-md-2">
                  <button className="btn btn-lg" type="submit" onClick={this.editUser}>Επεξεργασία</button>
                </div>
                <div className="col-md-2">
                  <button className="btn btn-lg" type="submit" onClick={this.canBeDeleted} data-bs-toggle="modal" data-bs-target="#deleteModal">Διαγραφή</button>
                </div>
                <div className="col-md-9">
                  {this.state.editMessage}
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }
}
