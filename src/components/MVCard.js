import React, { Fragment } from 'react';
import { Card, CardBody, Col, Row } from 'reactstrap';

const MVCard = ({title, entry, exit}) => {

    return (
        <Fragment>
            <Card>
                <CardBody>
                    <h6 className='p-0 m-0'>{title}</h6>
                    <hr/>
                    <Row>
                        <Col className='text-center'>
                            <h1 className='p-0 m-0'>{entry}</h1>
                            <small>Entry</small>
                        </Col>
                        <Col className='text-center'>
                            <h1 className='p-0 m-0'>{exit}</h1>
                            <small>Exit</small>
                        </Col>
                        {/* <Col className='text-center'>
                            <h1 className='p-0 m-0'>{entry-exit < 0 ? 0 : entry-exit}</h1>
                            <small>Occupancy</small>
                        </Col> */}
                    </Row>
                </CardBody>
            </Card>
        </Fragment>
    )
} 

export default MVCard;
