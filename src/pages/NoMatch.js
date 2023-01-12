import React, { Fragment } from 'react';
import { Link } from 'react-router-dom';

const NoMatch = () => {
  return (
    <Fragment>
        <h2>Nothing to see here!</h2>
        <p>
            <Link to="/">Go to the home page</Link>
        </p>
    </Fragment>
  );
}

export default NoMatch;