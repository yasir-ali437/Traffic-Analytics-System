import React from 'react'
import { Button, Col, Row, Table } from 'reactstrap'
import { FolderPlus, MoreVertical, PlusCircle, Delete } from 'react-feather';
import DeleteModal from './DeleteModal';
import { useState } from 'react';

export default function RegoinsTable(props) {
    const [deleteRegion, setDeleteRegion] = useState(false);
    const [currentRegion, setCurrentRegion] = useState();


    const setData = (index) => {
        setCurrentRegion(index);
        setDeleteRegion(true);
    }


    const excludeRegion = async () => {
        if (typeof props.currentCam !== undefined && props.currentCam) {
            let regions = props.currentCam.setting.regions.slice();
            let filteredRegion = await regions.filter((item) => { return item !== regions[currentRegion] });
            console.log('filteredRegion', filteredRegion);
            props.save({ type: 'regions', data: filteredRegion })
        }

    }

    const updateHandle = (index) => {

        let _currentRegion = props.currentCam.setting.regions[index];
        props.setCurrentRegion({edit : true, region : _currentRegion, index : index});
        props.setShowCanvas(true)

    }





    return (
        <div>
            <>
                <Table>
                    <thead>
                        <tr>
                            <th>Label</th>
                            <th>Edit</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {props.currentCam.setting.regions.map((item, index) => {
                            return (
                                <tr key={index}>
                                    <td>{item.label}</td>
                                    <td>
                                        <Button
                                            className={"radius-8 btn btn-sm btn-outline"}
                                            id="entryButton"
                                            onClick={() => updateHandle(index)}
                                        >Redraw</Button>
                                    </td>
                                    <td><Delete style={{ cursor: 'pointer' }} color="var(--danger)" size={23} onClick={() => setData(index)} /></td>
                                </tr>
                            )
                        })}
                    </tbody>
                </Table>
            </>

            <DeleteModal
                modal={deleteRegion}
                setModal={(output) => setDeleteRegion(output)}
                delete={(event) => excludeRegion()}
            />

        </div>
    )
}
