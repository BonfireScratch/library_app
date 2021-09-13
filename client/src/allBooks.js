import React, { Component, lazy, Suspense } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const Header = lazy(() => import('./header'));

export default class AllBooks extends Component {
  constructor(props) {
    super(props);

    this.state = {
      availability: props.match.params.availability,
      booksToShow: [],
    };
  }

  async componentDidMount() {
    // Fetch all books with the given availability status
    const res = await axios.get(`${process.env.REACT_APP_API_LINK}book?availability=[${this.state.availability}]`);

    this.setState({ booksToShow: res.data.rows });
  }

  render() {
    return (
      <>
        <Suspense fallback={<div>Loading...</div>}>
          <Header content={<h2 className="headerTextCenter">ΛΙΣΤΑ ΒΙΒΛΙΩΝ</h2>} backButton={true} />
        </Suspense>
        <div className="list-group pb-3">
          {this.state.booksToShow.map(({id, title, author}, index) => {
            return (
              <Link to={`/book/view/${id}`} className="list-group-item list-group-item-action" key={index}><span>{title}</span> του {author}</Link>
            )
          })}
        </div>
      </>
    );
  }
}
