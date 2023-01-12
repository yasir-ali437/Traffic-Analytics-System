import React, { Fragment, useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { HiChartSquareBar } from "react-icons/hi";
import { TiUser } from "react-icons/ti";
import { RiSettings4Fill } from "react-icons/ri";
import { GoPrimitiveDot } from "react-icons/go";
import { IconContext } from 'react-icons';
import { getSettings } from '../helpers/requests';

const Sidebar = () => {
    const [seconds, setSeconds] = useState(0);
    const [settings, setSettings] = useState({});
    const [device, setDevice] = useState(false);
    useEffect(() => {
        let interval = setInterval(async() => {
            setSeconds(seconds => seconds + 1);
            let _settings = await getSettings({});
            console.log('_settings',_settings);
            if(typeof _settings !== undefined && _settings && _settings.status){
                // var serverTime = new Date(_settings.data.device).getTime();
                // var localTime = new Date(new Date().toUTCString()).getTime();
                // console.log(serverTime, localTime);
                // if((localTime - serverTime) < 20000){
                //     setDevice(true);
                // }else{
                //     setDevice(false);
                // }
                setDevice(_settings.data.device);
                setSettings(_settings.data);
            }
        }, 5000);
        return () => clearInterval(interval);
    }, [seconds]);

    useEffect(()=>{
        setTimeout(()=>{
            setSeconds(1);
        }, 1000)
    }, [])
    return (
        <Fragment>
            <nav id="sidebarMenu" className="col-md-3 col-lg-2 d-md-block bg-white sidebar collapse">
                <div className="position-sticky pt-3">
                    <ul className="nav flex-column py-3">
                        <h6 className="sidebar-heading d-flex justify-content-between align-items-center px-3 mt-4 mb-1 text-muted">
                            <span>Menu</span>
                        </h6>
                        {/* <li className="nav-item mb-1">
                            <NavLink className="nav-link radius-8" to="/">
                                <HiChartSquareBar size={18} style={{verticalAlign: "text-bottom", marginRight: "8px"}}/>
                                 Dashboard
                            </NavLink>
                        </li> */}
                        <li className="nav-item mb-1">
                            <NavLink className="nav-link radius-8" to="/">
                                <HiChartSquareBar className='' size={18} style={{verticalAlign: "text-bottom", marginRight: "8px"}}/> 
                                 Summary
                            </NavLink>
                        </li>
                        <li className="nav-item mb-1">
                            <NavLink className="nav-link radius-8" to="settings">
                                <RiSettings4Fill size={18} style={{verticalAlign: "text-bottom", marginRight: "8px"}}/> 
                                Settings
                            </NavLink>
                        </li>
                        <li className="nav-item mb-1">
                            <NavLink className="nav-link radius-8" to="profile">
                                <TiUser size={18} style={{verticalAlign: "text-bottom", marginRight: "8px"}}/> 
                                Account
                            </NavLink>
                        </li>
                        <hr></hr>
                        <h6 className="sidebar-heading d-flex justify-content-between align-items-center px-3 mt-4 mb-1 text-muted">
                            <span>Status</span>
                        </h6>
                        <IconContext.Provider value={{className: "global-class-name" }} >
                        <li className="nav-item mb-1">
                        <div className="nav-link radius-8" style={{pointerEvents:'none'}}>
                           Device
                           <GoPrimitiveDot className='' color={device?'yellowgreen':'silver'}  size={24} style={{float:'right'}} title="offline"/>
                        </div>
                       
                        </li>
                        <li className="nav-item mb-1">
                        <div className="nav-link radius-8" style={{pointerEvents:'none'}} >
                           Camera Stream
                           <GoPrimitiveDot className=''  color={device && settings.isStream ?'yellowgreen':'silver'} size={24} style={{float:'right'}} title="offline"/> 
                        </div>
                        </li>
                        <li className="nav-item mb-1">
                        <div className="nav-link radius-8" style={{pointerEvents:'none'}}>
                           Processing
                           <GoPrimitiveDot className=''  color={device && settings.isProcessing ?'yellowgreen':'silver'} size={24} style={{float:'right'}} title="offline"/>
                        </div>
                        </li>
                        </IconContext.Provider>
                    </ul>
                   
                </div>
            </nav>
        </Fragment>
    );
}

export default Sidebar;