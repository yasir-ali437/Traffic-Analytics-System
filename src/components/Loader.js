import React, { Fragment, useEffect, useState } from 'react';
import { baseUrl } from '../helpers/auth';
const Loader = ({show, text}) => {
    return (
        <Fragment>
            {
                show && 
                <div className='text-center p-2'>
                    <div className="spinner-border" role="status"></div>
                    {
                        text &&
                        <p>{text}</p>
                    }
                </div>
            }
        </Fragment>
    );
}

export default Loader;