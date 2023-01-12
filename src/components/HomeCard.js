import React, { Fragment } from 'react';
import { Card, CardBody } from 'reactstrap';

const HomeCard = ({title, value}) => {

    return (
        <Fragment>
            <Card>
                <CardBody>
                    <h6>{title}</h6>
                    <h1>{value}</h1>
                </CardBody>
            </Card>
        </Fragment>
    )
} 

export default HomeCard;
