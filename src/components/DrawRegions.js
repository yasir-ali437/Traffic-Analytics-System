import React, { useState, useEffect, Fragment, useRef } from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Table, TabContent, TabPane, Nav, NavItem, NavLink, Card, Button, CardTitle, CardText, Row, Col, Label, Input } from 'reactstrap';
import Select from 'react-select';
import SectionWithScale from './DrawPointsOnScaleImage';
import { baseUrl } from '../helpers/auth';
import { ToastContainer, toast } from 'react-toastify';
import { addIdIntoBank, getIdsFromBank } from '../helpers/requests';



export default function DrawRegions(props) {

    const [initialPoints, setInitialPoints] = useState([]);
    const [regionId, setRegionId] = useState((props.editFlag.edit && typeof props.editFlag.region !== undefined && props.editFlag.region && "id" in props.editFlag.region) ? props.editFlag.region.id : "");
    const [label, setLabel] = useState((props.editFlag.edit && typeof props.editFlag.region !== undefined && props.editFlag.region && "label" in props.editFlag.region) ? props.editFlag.region.label : "");
    const [outside, setOutside] = useState(true);
    const [cameraCoordinates, setCameraCoordinates] = useState([]);
    const [sections, setSection] = useState([])
    const [labelExist, setExist] = useState(false)
    // let generateId =  Math.random().toString(36).slice(-9);



    console.log('pointspoints', initialPoints);
    console.log('cameraCoordinates', cameraCoordinates);

    const getSelectedValueBack = (item) => {

    }



    const undoPoints = () => {
        let _points = initialPoints.slice();
        _points.pop();
        setInitialPoints(_points);
    }

    const updateRegion = async () => {


        let _polygon = JSON.stringify(initialPoints.slice());
        let process = false;

        if (props.type === "line") {
            if (JSON.parse(_polygon).length < 2) {
                alert("A line must have atleast two points.");
                return;
            }
            else {
                process = true
            }
        } else {
            if (JSON.parse(_polygon).length < 3) {
                toast.error("An " + props.type + " region must have atleast three points.", {
                    position: toast.POSITION.TOP_CENTER,
                    autoClose: true,
                })
                return;
            }
            else {
                process = true
            }
        }



        if (process && typeof props.currentCam !== undefined && props.currentCam) {
            if ('setting' in props.currentCam && props.currentCam.setting.regions.length > 0) {

                let _currentRegion = props.editFlag.region;
                let regionIndex = props.editFlag.index;




                let obj = { label: label, roi: JSON.parse(_polygon), id : regionId };
                setSection(JSON.parse(_polygon))
                let _regions = props.currentCam.setting.regions.slice();
                _regions[regionIndex] = obj;
                let _currentCam = { ...props.currentCam };
                _currentCam.setting['flag'] = 'save';
                _currentCam.setting.regions = _regions;
                props.save({ type: 'regions', data: _regions })

            }

        }


    }


    const checkIds = async (generateId, bankIds) => {

        let uniqueId;

        if (typeof bankIds !== undefined && bankIds && bankIds.length > 0) {

            let isFind = bankIds.filter(item => {

                return item._id === generateId
            });

            if (typeof isFind !== undefined && isFind && isFind.length > 0) {
                let generateAnotherId = Math.random().toString(36).slice(-9);
                await checkIds(generateAnotherId, bankIds)

            } else {
                uniqueId = generateId
            }
        }
        else {
            uniqueId = generateId
        }

        return uniqueId
    }




    useEffect(async () => {
        if (!props.editFlag.edit) {

            const bankIds = await getIdsFromBank();
            console.log('bankIds',bankIds);
            let generateId = Math.random().toString(36).slice(-9);
            let id = await checkIds(generateId, bankIds.data);
            setRegionId(id)

        }




    }, [])

    const savePoints = async () => {




        let outsidePolygon = [];
        let insidePolygon = [];
        let _polygon = JSON.stringify(initialPoints.slice());
        let _polygonTwo = JSON.stringify(initialPoints.slice());
        let process = false;

        if (props.type === "line") {
            if (JSON.parse(_polygon).length < 2) {
                alert("A line must have atleast two points.");
                return;
            }
            else {
                process = true
            }
        } else {
            if (JSON.parse(_polygon).length < 3) {
                toast.error("An " + props.type + " region must have atleast three points.", {
                    position: toast.POSITION.TOP_CENTER,
                    autoClose: true,
                })
                return;
            }
            else {
                process = true
            }
        }

        console.log('process', process, _polygon.length);


        if (process && typeof props.currentCam !== undefined && props.currentCam) {
            if ('setting' in props.currentCam && props.currentCam.setting.url) {




                let img = new Image;
                img.onload = async () => {



                    let obj = { label: label, roi: JSON.parse(_polygon), id: regionId };
                    setSection(JSON.parse(_polygon))
                    let _regions = props.currentCam.setting.regions.slice();
                    let newRegions = [..._regions, ...[obj]];
                    let _currentCam = { ...props.currentCam };
                    _currentCam.setting['flag'] = 'save';
                    _currentCam.setting.regions = newRegions;
                    props.save({ type: 'regions', data: newRegions})
                    let params = {id :regionId }
                    await addIdIntoBank({params : params});


                }
                img.src = baseUrl + props.currentCam.setting.url;
            }

        }




    }



    const handleClose = () => props.setShowCanvas(false);

    console.log('labelExist', labelExist);
    useEffect(() => {
        if (typeof label !== undefined && label && props.currentCam !== undefined && props.currentCam && "setting" in props.currentCam) {
            if (props.editFlag.edit) {
                if (props.editFlag.index > -1) {
                    let _regions = props.currentCam.setting.regions.slice();
                    _regions.splice(props.editFlag.index, 1);
                    let existLabels = _regions.filter((item) => {
                        if ("label" in item) {
                            return item.label === label
                        }
                    })
                    if (existLabels.length > 0) {
                        setExist(true)
                    }
                    else {
                        setExist(false)
                    }

                }


            }
            else {

                let existLabels = props.currentCam.setting.regions.filter((item) => {
                    if ("label" in item) {
                        return item.label === label
                    }
                })
                if (existLabels.length > 0) {
                    setExist(true)
                }
                else {
                    setExist(false)
                }
            }
        }

    }, [label])




    return (
        <>
            <Modal
                show={props.showCanvas}
                isOpen={props.showCanvas}
                onHide={handleClose}
                backdrop="static"
                keyboard={false}
                size="lg"

            >
                <div >
                    <ModalHeader>
                        <Col className="" style={{ marginTop: '5px' }}>
                            <h5 className="mb-0"> {props.editFlag.edit ? "Re-Draw Internal Floor Region" : "Draw Internal Floor Region"}</h5>
                        </Col>
                    </ModalHeader>

                    <ModalBody className=''>
                        <SectionWithScale
                            points={initialPoints}
                            setPoints={(output) => setInitialPoints(output)}
                            dye={props.currentCam ? baseUrl + props.currentCam.setting.url : ""}
                            map={props.currentCam ? baseUrl + props.currentCam.setting.url : ""}
                            sections={props.editFlag.edit ? [props.editFlag.region] : props.currentCam ? props.currentCam.setting.regions : []}
                            section={""}
                            selectedSection={getSelectedValueBack}
                            heatmap={false}
                        />
                        <Button
                            color="warning"
                            onClick={() => undoPoints()}
                            className="my-2 btn-sm btn-outline radius-8 text-right"
                        >
                            Undo
                        </Button>
                    </ModalBody>
                    <ModalFooter>
                        <div className='d-flex' style={{ width: "100%", position: '' }}>
                            <Label className='m-2'>Label</Label>
                            <input className='m-2'
                                style={labelExist ? { border: "1px solid red", borderRadius: '8px', height: '2rem' } : { border: "1px solid green", borderRadius: '8px', height: '2rem' }}
                                type="String" value={label} onChange={(e) => setLabel(e.target.value)}></input>
                            {labelExist && <span style={{ marginTop: '1rem' }} className="d-block  small opacity-100">
                                <i>This label already exists.!</i>
                            </span>}


                            <div style={{ marginLeft: 'auto' }}>

                                <Button
                                    color="outline-danger"
                                    onClick={() => props.close()}
                                    className="m-2 btn-sm radius-8 text-end"

                                >
                                    Close
                                </Button>
                                <Button
                                    color="dark"
                                    onClick={() => props.editFlag.edit ? updateRegion() : savePoints()}
                                    disabled={!initialPoints.length || !label || labelExist}
                                    className="my-2 btn-sm btn-primary radius-8 text-end"
                                    style={{ marginLeft: 'auto' }}

                                >
                                    {props.editFlag.edit ? "Update points" : " Save points"}
                                </Button>
                            </div>

                        </div>
                    </ModalFooter>
                </div>
            </Modal>


            <Row>
                <Col md={3} className='my-2'>

                </Col>



            </Row>
        </>
    )
}
