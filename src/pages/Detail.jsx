import React, { createElement } from 'react'
import { useSelector } from 'react-redux';
import { json, Link, useParams } from 'react-router-dom'
import { Button, ButtonGroup, Card, Col, Row, Table } from 'reactstrap';
import ReactHTMLTableToExcel from "react-html-table-to-excel";
import { Switch } from 'antd'
import './Detail.css'
import { BiDownload } from 'react-icons/bi';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { fetchsurvey, getDetailRequest, getSurveyRequest, updateVideoRequest, vehiclesRequest } from '../helpers/requests';
import { useState } from 'react';
import { capitalizeFirstLetter, tabStyle } from '../helpers/utils';
import { useLocalStorage } from '../customHooks/useLocalStorage';
import moment from 'moment';
import dayjs from 'dayjs';
import { async } from 'q';
import { toast, ToastContainer } from 'react-toastify';
// import { tablesToExcel } from '../components/exportTable';
import { useRef } from 'react';

const Detail = () => {

    const dispatch = useDispatch();
    const ref = useRef()
    const job_id = useParams();
    const [currentJob, setJob] = useState('');
    const [currentDirection, setCurrentDirection] = useState({ title: '_details', id: '_details' })
    const details = useSelector((state) => state.settings.details);
    const [localDetails, setLocalDetails] = useState([]);
    const [vehicles, setVehicles] = useState([])

    useEffect(async () => {

        let _vehicles = await vehiclesRequest({ dispatch });
        if (_vehicles !== undefined && _vehicles && _vehicles.status) {
            setVehicles(_vehicles.data);
        }
    }, [])




    useEffect(async () => {
        if (job_id !== undefined && job_id) {


            let job = await getSurveyRequest({ job_id: job_id.id });
            if (job.status) {
                setJob(job.data)
            }
            if (job !== undefined && job) {
                if (job.directions !== undefined && job.directions && job.directions.length > 0) {
                    // setCurrentDirection({ title: job.directions[0].title, id: job.directions[0].id })

                }

            }


            let object = {
                job_id: job_id.id,
                date: job.data.survey_date,
                interval: 15,
                dispatch
            }

            let details = await getDetailRequest(object);


        }

    }, [job_id])

    useEffect(() => {
        if (currentDirection !== undefined && currentDirection && details !== undefined && details && details.length) {

            let _details = JSON.stringify(details);


            // let _details = details.filter((item) => {
            //     return item.data.filter((_data) => {
            //         return _data.direction_id === currentDirection.id
            //     })
            // })

            let _localDetails = [];
            JSON.parse(_details).forEach((item) => {
                let filter = item.data.filter((dir) => {
                    return dir.direction_id == currentDirection.id
                });
                item['data'] = filter;
                _localDetails.push(item)
            })
            setLocalDetails(_localDetails)

        }

    }, [currentDirection, details])


    // useEffect(() => {
    //     if (currentJob !== undefined && currentJob && "directions" in currentJob && currentJob.directions.length > 0 && details !== undefined && details && details.length > 0 && vehicles.length > 0) {
    //         let _details = JSON.stringify(details);
    //         let allTable = currentJob.directions.map((item) => {
    //             let currentDirection = item;
    //             let _localDetails = [];
    //             JSON.parse(_details).forEach((item) => {
    //                 let filter = item.data.filter((dir) => {
    //                     return dir.direction_id == currentDirection.id
    //                 });
    //                 item['data'] = filter;
    //                 _localDetails.push(item)
    //             })

    //             console.log('_localDetails_localDetails_localDetails', _localDetails, vehicles);



    //             return (
    //                 <Table id={currentDirection.id} bordered>
    //                     <thead>
    //                         <tr>
    //                             <th style={{ textAlign: 'center' }} rowSpan='2'>Sr No.</th>
    //                             <th style={{ textAlign: 'center' }} colSpan='2'>Time</th>
    //                             <th style={{ textAlign: 'center' }} colSpan={vehicles.length}>Classifications</th>
    //                             <th style={{ textAlign: 'center' }} rowSpan='2'>Total Number of Vehicles</th>
    //                         </tr>
    //                         <tr>
    //                             <th style={{ textAlign: 'center' }}>Satrt</th>
    //                             <th style={{ textAlign: 'center' }}>End</th>
    //                             {vehicles.length > 0 && vehicles.map((item, index) => {
    //                                 return (
    //                                     <th style={{ textAlign: 'center' }}>{capitalizeFirstLetter(item.label)} </th>
    //                                 )
    //                             })}
    //                         </tr>
    //                     </thead>
    //                     <tbody>
    //                         {
    //                             _localDetails.length > 0 && _localDetails.map((item, index) => {

    //                                 let start = item.start.split(" ")[1].slice(0, 5);
    //                                 let end = item.end.split(" ")[1].slice(0, 5);
    //                                 let _total = 0;

    //                                 return (
    //                                     <tr>
    //                                         <th style={{ textAlign: 'center' }} scope='row'>{index + 1}</th>
    //                                         <td style={{ textAlign: 'center' }}>{start}</td>
    //                                         <td style={{ textAlign: 'center' }}>{end}</td>
    //                                         {vehicles.length > 0 && vehicles.map((veh, index) => {
    //                                             console.log('veh', veh, item);

    //                                             let _data = { total: 0 };
    //                                             if (item.data.length) {
    //                                                 _data = item.data.filter((i) => { return i.vehicle_id === veh.id })[0]
    //                                             }

    //                                             if (_data !== undefined && _data && "total" in _data) {
    //                                                 _total = _total + _data.total

    //                                             }

    //                                             return (
    //                                                 <td style={{ textAlign: 'center' }}>{(_data !== undefined && _data && 'total' in _data) ? _data.total : 0} </td>
    //                                             )
    //                                         })}
    //                                         <td style={{ textAlign: 'center' }}>{_total}</td>
    //                                     </tr>
    //                                 )

    //                             })
    //                         }
    //                     </tbody>

    //                 </Table>
    //             )
    //         })

    //         console.log('allTable', allTable);
    //     }

    // }, [currentJob, details, vehicles])


    let _data = [
        { title: 'Arslan', start: '', end: '', status: 1, },
        { title: 'Fezan', start: '', end: '', status: 0, },
        { title: 'saqib', start: '', end: '', status: 2, },
        { title: 'Arslan', start: '', end: '', status: 0, },
        { title: 'Arslan', start: '', end: '', status: 1, },
    ]

    const setVisualization = async ({ item, e }) => {
        let object = {
            video_id: item.id,
            visualize: e ? 1 : 0,
        }
        let res = await updateVideoRequest(object);
        if (res.data.status) {
            toast.success('Successfully done', {
                position: toast.POSITION.TOP_CENTER,
                autoClose: true,
            })
            if (job_id !== undefined && job_id) {
                let job = await getSurveyRequest({ job_id: job_id.id });
                if (job.status) {
                    setJob(job.data)
                }
            }
        }
    }

    const downloadAll = () => {

    }



    return (

        <div className="main_detail">
            <ToastContainer />

            <Card className="my-4" style={{ backgroundColor: "" }}>
                <Row>
                    <Col
                        className="h-100 align-middle px-4 text-right"
                        style={{ height: "64px" }}
                    >


                        <ButtonGroup size="sm" style={{ borderRadius: "0px" }}>
                            <Button
                                style={tabStyle("_details", currentDirection.id)}
                                onClick={() => setCurrentDirection({ title: "_details", id: "_details" })}
                            >
                                Details

                            </Button>

                            {currentJob !== undefined && currentJob && 'directions' in currentJob && currentJob.directions.map((direction) => {

                                return (
                                    <Button
                                        style={tabStyle(direction.id, currentDirection.id)}
                                        onClick={() => setCurrentDirection({ title: direction.title, id: direction.id })}
                                    >
                                        {capitalizeFirstLetter(direction.title)}
                                    </Button>

                                )


                            })}
                        </ButtonGroup>




                    </Col>
                </Row>
            </Card>

            {currentDirection.id === "_details" &&
                <>
                    <Table style={{ marginTop: '50px' }} hover>
                        <thead>
                            <tr>
                                <th style={{ textAlign: 'center' }}>Sr No.</th>
                                <th style={{ textAlign: 'center' }}>Title</th>
                                <th style={{ textAlign: 'center' }}>Start Time-End Time</th>
                                <th style={{ textAlign: 'center' }}>Status</th>
                                <th style={{ textAlign: 'center' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentJob !== undefined && currentJob && currentJob.videos !== undefined && currentJob.videos && currentJob.videos.map((item, index) => {
                                let start = item.start_time
                                let start_tim = dayjs(start).format('HH:mm:ss');
                                let end_time = dayjs(item.end_time).format('HH:mm:ss');
                                return (
                                    <tr key={index}>
                                        <th style={{ textAlign: 'center' }} scope="row">{index + 1}</th>
                                        <td style={{ textAlign: 'center' }}>{item.title}</td>
                                        <td style={{ textAlign: 'center' }}>{`${start_tim}-${end_time}`}</td>
                                        <td style={{ textAlign: 'center' }}><span style={{ background: '#D4F8D3', padding: '4px 10px' }} >{item.status === 0 ? "Pending" : item.status === 1 ? 'Processing' : "Completed"}</span></td>
                                        <td style={{ textAlign: 'center' }}> <Switch
                                            checked={item.visualize === 1}
                                            disabled={item.status !== 1}
                                            checkedChildren={"Visualize On"} unCheckedChildren={"Visualize Off"} onChange={(e) => setVisualization({ item: item, e: e })} /></td>
                                    </tr>
                                )
                            })}

                        </tbody>
                    </Table>

                </>
            }



            {currentDirection.id !== "_details" &&
                <>


                    {/* {
                        currentJob !== undefined && currentJob && "directions" in currentJob && currentJob.directions.length > 1 &&
                        <button className="btn btn-sm btn-outline-primary mx-2" onClick={() => tablesToExcel(currentJob.directions.map((item) => { return item.id }), currentJob.directions.map((item) => { return item.title }), 'Table.xls', 'Excel')}>Download All</button>

                    } */}
                    <ReactHTMLTableToExcel

                        id="test-table-xls-button"
                        className={"my-2 btn btn-sm btn-outline-primary"}
                        table={"table-to-xls"}
                        filename={currentDirection.title}
                        sheet={currentDirection.title}
                        buttonText={<BiDownload className="sum_icon" />}
                    />





                    <Table bordered id={"table-to-xls"}>
                        <thead>
                            <tr>
                                <th style={{ textAlign: 'center' }} rowSpan='2'>Sr No.</th>
                                <th style={{ textAlign: 'center' }} colSpan='2'>Time</th>
                                <th style={{ textAlign: 'center' }} colSpan={vehicles.length}>Classifications</th>
                                <th style={{ textAlign: 'center' }} rowSpan='2'>Total Number of Vehicles</th>
                            </tr>
                            <tr>
                                <th style={{ textAlign: 'center' }}>Satrt</th>
                                <th style={{ textAlign: 'center' }}>End</th>
                                {vehicles.length > 0 && vehicles.map((item, index) => {
                                    return (
                                        <th style={{ textAlign: 'center' }}>{capitalizeFirstLetter(item.label)} </th>
                                    )
                                })}
                            </tr>
                        </thead>
                        <tbody>
                            {
                                localDetails.length > 0 && localDetails.map((item, index) => {

                                    let start = item.start.split(" ")[1].slice(0, 5);
                                    let end = item.end.split(" ")[1].slice(0, 5);
                                    let _total = 0;

                                    return (
                                        <tr>
                                            <th style={{ textAlign: 'center' }} scope='row'>{index + 1}</th>
                                            <td style={{ textAlign: 'center' }}>{start}</td>
                                            <td style={{ textAlign: 'center' }}>{end}</td>
                                            {vehicles.length > 0 && vehicles.map((veh, index) => {
                                                let _data = { total: 0 };
                                                if (item.data.length) {
                                                    _data = item.data.filter((i) => { return i.vehicle_id === veh.id })[0]
                                                }

                                                if (_data !== undefined && _data && "total" in _data) {
                                                    _total = _total + _data.total

                                                }

                                                return (
                                                    <td style={{ textAlign: 'center' }}>{(_data !== undefined && _data && 'total' in _data) ? _data.total : 0} </td>
                                                )
                                            })}
                                            <td style={{ textAlign: 'center' }}>{_total}</td>
                                        </tr>
                                    )

                                })
                            }



                        </tbody>
                    </Table>
                </>
            }



        </div>
    )
}

export default Detail