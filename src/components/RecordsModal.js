import { Row, Col, Card, CardBody, ButtonGroup, Button, Progress, Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';
import { CustomInput, Form, FormGroup, Input, Label, } from 'reactstrap';
import React, { useState, useEffect, Fragment } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Spinner, Toast, ToastBody, ToastHeader } from 'reactstrap';
import { Trash2 } from 'react-feather';
import { RxCross2 } from 'react-icons/rx'
import "../pages/Summary.css"





export default function RecordsModal(props) {

    const [modal, setModal] = useState(false);

    const toggle = () => {
        setModal(!modal)
        props.setModal(!modal)
    }

    const deleteItem = () => {
        props.setModal(false)
        setModal(false)
        props.delete();

    }

    const dontDeleteItem = () => {
        props.setModal(false);
        setModal(false);
        props.notDelete();
    }

    useEffect(() => {
        setModal(props.modal);
    }, [props])

    return <div>
        <Modal isOpen={modal} toggle={toggle} centered >
            <ModalHeader >
                <div className='text-right' style={{cursor: "pointer", textAlign: 'right' }}>
                    <RxCross2 className="sum_icon" onClick={toggle} />
                </div>
            </ModalHeader>
            <ModalBody className='text-center'>
                <Trash2 size='70' color="var(--primary)" />
                <span className="d-block small opacity-50 my-3">Do you want to delete the processed data? </span>
                <Button color="" className='deleteButton m-2 mt-4' onClick={deleteItem}>Yes</Button>
                <Button color='#c1c1c1' className='btn btn-secondary  m-2 mt-4' onClick={dontDeleteItem}>No</Button>
            </ModalBody>
        </Modal>
    </div>;
}
