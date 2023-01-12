import React from 'react'
import { ChevronDown, ChevronLeft, ChevronRight,  ChevronUp } from 'react-feather';
import { useSelector } from 'react-redux';
import { Row, Col, Card, CardBody, CardTitle, CardHeader,  Badge } from 'reactstrap'

export default function JourneyCard(props) {
    const config = useSelector(state => state.data.config);
    const getIcon = (side) =>  {
        if(side === config.data.directions.left){
            return {entry: <ChevronRight/>, exit: <ChevronLeft/>, isVertical: true};
        }else if(side === config.data.directions.right){
            return {entry: <ChevronLeft/>, exit: <ChevronRight/>, isVertical: true};
        }else if(side === config.data.directions.top){
            return {entry: <ChevronDown/>, exit: <ChevronUp/>, isVertical: false};
        }else{
            return {entry: <ChevronUp/>, exit: <ChevronDown/>, isVertical: false};
        }
    }
    const icons = getIcon(props.title);
      
    return (
        <div className='d-flex justify-content-center'>
            <Row >
                <Col>
                    <Card className='border-8' style={{maxWidth:'150px', width:'150px'}}>
                        <CardHeader style={{background: "white"}}>{props.title} Area</CardHeader>
                        <CardBody>
                            <Row>
                                <Col md={12}  sm={2}  lg={ 12} >
                                    <CardTitle><Badge className='badge-primary'>{icons.entry}</Badge> <span style={{fontSize: "16px", fontWeight: "bold"}}>{props.entry}</span></CardTitle>
                                </Col>
                                <Col md={12}  sm={12}  lg={ 12}>
                                    <CardTitle style={{marginBottom: "0px"}}><Badge className='badge-primary'>{icons.exit}</Badge> <span style={{fontSize: "16px", fontWeight: "bold"}}>{props.exit}</span></CardTitle> 
                                </Col>
                            </Row>
                                                        
                        </CardBody>
                    </Card>
                </Col>
            </Row>

        </div>
    )
}
