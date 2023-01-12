import React from 'react';
import { useSelector } from 'react-redux';
import Summary from './Summary';

const components = {
    "Summary": <Summary/>
} 

const Selection = () => {
    const config = useSelector(state => state.data.config);
    return(
        components[config.default]
    );
}

export default Selection;