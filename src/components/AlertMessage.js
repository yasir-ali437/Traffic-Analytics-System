import React from 'react'
import { Button, Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap'

export default function AlertMessage(props) {
    return (
        <div>
            <Modal isOpen={props.modal.flag} toggle={() => props.toggle()}>
                <ModalHeader toggle={() => props.toggle()}>
                    Confirmation
                </ModalHeader>
                <ModalBody>
                    PLease save settings first. Otherwise this action will dismiss all current changes and is not reversible.
                </ModalBody>
                <ModalFooter>
                    <Button
                        className="btn-primary radius-8"
                        onClick={() => {props.continue(props.modal.currentIndex); props.toggle()}}
                    >
                        Continue
                    </Button>
                    <Button
                        className="outline-danger radius-8"
                        onClick={() => props.toggle()}
                    >
                        Close
                    </Button>
                </ModalFooter>
            </Modal>
        </div>
    )
}
