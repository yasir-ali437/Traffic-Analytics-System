import React, { useState, useEffect, Fragment, useRef } from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Table, TabContent, TabPane, Nav, NavItem, NavLink, Card, Button, CardTitle, CardText, Row, Col, Label, Input } from 'reactstrap';
import Select from 'react-select';
import { checkString } from '../helpers/utils';



export default function AddCamera(props) {

    const modalToggle = () => props.setModal(!props.modal);
    const [macItem, setMacItem] = useState()
    const [labelExist, setExist] = useState(false)
    const dropdownRef = useRef()
    const onChangeMac = (value) => {
        props.setStoreMac(value);
        setMacItem(value);
    }


    const deleteChildFeature = () => {

    }
    const [label, setLabel] = useState();



    useEffect(() => {
        if (typeof label !== undefined && label) {
            console.log('props.allSettingsLocal', props.allSettingsLocal);
            let existLabels = props.allSettingsLocal.filter((item) => {
                return  item.label.toLowerCase() === label.toLowerCase()
            });
            if(existLabels.length > 0){
                setExist(true)
            }
            else {
                setExist(false)
            }


        }

    }, [label])






    useEffect(() => {
        const handleClickOutside = event => {
            const isDropdownClick =
                dropdownRef.current && dropdownRef.current.contains(event.target);
            //   const isButtonClick =
            //     buttonRef.current && buttonRef.current.contains(event.target);

            if (isDropdownClick) {
                // If the ref is not defined or the user clicked on the menu, we don’t do anything.
                return;
            }
            // Otherwise we close the menu.

            props.setModal(false)

        };

        document.addEventListener("mousedown", handleClickOutside); // handle desktops
        document.addEventListener("touchstart", handleClickOutside); // handle touch devices

        // Event cleanup
        return () => {
            document.removeEventListener("mousedown", handleClickOutside); // handle desktops
            document.removeEventListener("touchstart", handleClickOutside); // handle touch devices
        };
    }, [dropdownRef]);


    console.log('labelExist', labelExist);
    return (
        <Modal isOpen={props.modal} size="lg">
            <div ref={dropdownRef}>
                <ModalHeader>Add camera</ModalHeader>

                <ModalBody className=''>


                    <Row className='p-3' >
                        <Col md={6} style={{}} >
                            <Label>Label</Label>
                            <br></br>
                            
                            <input
                                onChange={(e) => setLabel(e.target.value)}
                                value={label}
                                name='label'
                                style={labelExist ? {border : "1px solid red", borderRadius : '8px', height : '2.2rem'} : {border : "1px solid green", borderRadius : '8px',height : '2.2rem'}}
                            />
                            <br></br>
                            {labelExist &&<span className="d-block small opacity-100">
                                <i>This label already exists.!</i>
                            </span>}
                        </Col>
                    </Row>




                </ModalBody>
                <ModalFooter>
                    <button onClick={() => { props.setModal(false); props.setCurrentIndex(0) }} className='btn btn-secondary'>Close</button>
                    <button onClick={() => { props.setModal(false); props.addCamera({ label: label }) }} disabled={  labelExist || !label   } className='btn btn-primary'>Submit</button>

                </ModalFooter>
            </div>
        </Modal>
    )
}
