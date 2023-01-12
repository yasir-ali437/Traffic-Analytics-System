import React, { useEffect, useState } from "react";
import { BsInfoCircleFill, BsLink } from "react-icons/bs";
import Joyride, { ACTIONS, EVENTS, STATUS } from "react-joyride";
import { getSettings, updateSettings, deletePreviewsRecord, createSetting, getAllSettings, updateCurrentCamSetting } from "../helpers/requests";
import { useSelector, useDispatch } from "react-redux";
import { FolderPlus, MoreVertical, PlusCircle, Delete } from 'react-feather';
import { GoPrimitiveDot } from "react-icons/go";


import Preview from "../components/Preview";
import {
  Modal,
  ModalBody,
  ModalHeader,
  ModalFooter,
  Button,
  Row,
  Col,
  Alert,
  Card,
  CardHeader,
  CardBody,
  Table,
  Label,
  Input
} from "reactstrap";

import DrawROIs from "../components/DrawROIs";
import DrawQueueROIs from "../components/DrawQueueROIs";
import { Plus, Trash2 } from "react-feather";
import * as configs from "../../src/config.json";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AddCamera from "../components/AddCamera";
import DrawPointsOnScaleImage from "../components/DrawPointsOnScaleImage";
import { baseUrl } from "../helpers/auth";
import SectionWithScale from "../components/DrawPointsOnScaleImage";
import { isInside } from "../components/isInside";
import DrawRegions from "../components/DrawRegions";
import DeleteModal from "../components/DeleteModal";
import RegoinsTable from "../components/RegoinsTable";
import AlertMessage from "../components/AlertMessage";


const Settings = () => {
  const steps = configs.tutorialSteps;
  const [run, setRun] = useState(Boolean);
  const [currentIndex, setCurrentIndex] = useState(0)
  const [currentCam, setCurrentCam] = useState({});
  console.log('currentCam', currentCam);
  const dispatch = useDispatch();
  const config = useSelector((state) => state.data.config);
  const settings = useSelector((state) => state.settings);
  const [data, setData] = useState(settings.data);
  const allSettings = useSelector((state) => state.settings.allSettings)
  const [allSettingsLocal, setAllSettings] = useState([])
  const [alertMessage, setAlertMessage] = useState({ flag: false, currentIndex: null })
  console.log('settings data', data);
  console.log('currentIndex', currentIndex);

  const [modal, setModal] = useState(false);
  const [deleteRegion, setDeleteRegion] = useState(false);

  const [deleteDataModal, setDeleteDataModal] = useState(false);
  const [inputModal, setInputModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [showCanvas, setShowCanvas] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [roiType, setRoiType] = useState("");
  const [saving, setSaving] = useState(false);
  const [updateFlag, setUpdateFlag] = useState(false);
  const [currentRegion, setCurrentRegion] = useState({ edit: false, region: {}, index: null });


  const [deletingKey, setDeletingKey] = useState("");
  const [queueName, setQueueName] = useState("");
  const [inputError, setInputError] = useState("");
  const [step, Setstep] = useState(steps);
  const [stepIndex, SetstepIndex] = useState(0);
  const [addCameraFlag, setAddCamera] = useState(false)

  console.log('currentCamcurrentCam', currentCam);

  const updateData = (key, value) => {
    // if(key==="ready"){
    // value ? setsaveButton(false) : setsaveButton(true)
    // }
    setUpdateFlag(true);

    togglePreview();

    if (typeof currentCam !== undefined && currentCam && "setting" in currentCam) {
      let _currentCam = { ...currentCam };
      _currentCam.setting[key] = value;
      setCurrentCam(_currentCam);


    }

    // var _data = { ...data };
    // _data[key] = value;
    // setData(_data);
  };

  const save = (key, value) => {
    console.log('key, value', key, value);
    updateData(key, value);
    setShowCanvas(false);
    setCurrentRegion({ edit: false, region: {}, index: null });
  }

  const toggle = () => {
    setModal(!modal);
  };

  const toggleInput = () => {
    setInputModal(!inputModal);
  };

  const toggleDeleteData = () => {
    setDeleteDataModal(!deleteDataModal);
  };

  const toggleDelete = () => {
    setDeleteModal(!deleteModal);
  };

  const setName = () => {
    // console.log(queueName);
    if (queueName.trim() === "") {
      setInputError("Queue title cannot be empty.");
      setTimeout(() => {
        setInputError("");
      }, 5000);
      return;
    }
    let _queueName = queueName;
    let _data = { ...data };
    // _queueName = _queueName.toLowerCase();
    _queueName = _queueName.split(" ");
    _queueName = _queueName.join("_");
    console.log(_queueName);
    if (_data.queue[_queueName] == undefined) {
      _data.queue[_queueName] = [];
      setData(_data);
      setQueueName("");
      setInputError("");
      toggleInput();
    } else {
      setInputError("This name already exisits. Please choose another name.");
      setTimeout(() => {
        setInputError("");
      }, 5000);
    }
  };

  const saveSettings = async () => {
    if (typeof currentCam !== undefined && currentCam && "setting" in currentCam) {
      let _currentCam = { ...currentCam };
      _currentCam.setting['flag'] = 'save';
      console.log('_currentCam', _currentCam);
      setSaving(true)
      let res = await updateCurrentCamSetting({ dispatch, params: _currentCam });
      if (res.status === true) {
        setSaving(false)
        setUpdateFlag(false)
        await getAllSettings({ dispatch })
      }
    }






    // data['flag'] = 'save';
    // // console.log('data',data);
    // setSaving(true);
    // const res = await updateSettings({
    //   dispatch,
    //   params: data,
    // });
    // console.log('resres', res);
    // await getSettings({ dispatch });
    // setSaving(false);
    // toast(res.message);
  };

  const resetSettings = async () => {
    const res = await updateSettings({
      dispatch,
      params: {
        type: "regions",
        exit: [],
        entry: [],
        queue: {},
        stream: null,
        ready: false,
        frame: false,
        restart: false,
        url: null,
        confidence: 0.05,
        percentage: 1,
        flag: "reset",
      },
    });
    await getSettings({ dispatch });
    toast(res.message);
    toggle();
  };

  const deletePreviewRecords = async () => {
    const res = await deletePreviewsRecord();
    console.log(res.message);
    toast(res.message);
    toggleDeleteData();
  }

  const togglePreview = () => {
    setShowPreview(!showPreview);
  };

  const drawROIs = (key) => {
    setRoiType(key);
    setShowCanvas(!showCanvas);
  };

  const addQueue = () => {
    toggleInput();
  };

  const deleteRoi = (key) => {
    setDeletingKey(key);
    toggleDelete();
  };
  const removeRoi = (key) => {
    var _data = { ...data };
    console.log(key, _data.queue, Object.keys(_data.queue));
    delete _data.queue[key];
    setData(_data);
    toggleDelete();
  };

  const keyToLabel = (key) => {
    key = key.split("_");
    key = key.join(" ");
    // return key[0].charAt(0).toUpperCase() + key[0].slice(1) + " " + key[1];
    return key;
  };



  const startTutorial = (e) => {
    e.preventDefault();
    const finishedStatuses = [STATUS.FINISHED, STATUS.SKIPPED];
    if (!finishedStatuses) {
      setRun(!run);
    }
    setRun(!run);
  };

  const handleJoyrideCallback = (data) => {
    const { action, index, status, type } = data;

    if ([EVENTS.STEP_AFTER, EVENTS.TARGET_NOT_FOUND].includes(type)) {
      // Update state to advance the tour
      SetstepIndex(index + (action === ACTIONS.PREV ? -1 : 1));
    } else if ([STATUS.FINISHED, STATUS.SKIPPED, STATUS.CLOSED].includes(status)) {
      // Need to set our running state to false, so we can restart if we click start again.
      setRun(false);
    }
  };



  useEffect(() => {
    if (!showPreview) {
      togglePreview();
    }
  }, [showPreview]);

  useEffect(() => {
    togglePreview();
    setData(settings.data);
  }, [settings]);

  useEffect(() => {
    if (typeof allSettings !== undefined && allSettings && allSettings.length > 0) {
      let _allSettings = JSON.stringify(allSettings);
      setAllSettings(JSON.parse(_allSettings));
    }
  }, [allSettings])

  useEffect(() => {


    if (typeof allSettingsLocal !== undefined && allSettingsLocal && allSettingsLocal.length > 0 && currentIndex !== undefined && currentIndex !== null) {
      let _allSettingsLocal = JSON.stringify(allSettingsLocal);
      setCurrentCam(JSON.parse(_allSettingsLocal)[currentIndex])
      setUpdateFlag(false)
    }

  }, [currentIndex, allSettingsLocal])

  console.log('allSettingsLocal', allSettingsLocal, allSettings);



  useEffect(async () => {
    if (!localStorage.getItem("tourDone")) {
      localStorage.setItem("tourDone", true);
      setRun(true);
    } else {
      setRun(false);
    }
    await getSettings({ dispatch });
    await getAllSettings({ dispatch })
  }, []);


  const setIndex = (index) => {
    if (updateFlag) {
      setAlertMessage({ flag: true, currentIndex: index })
    } else {
      setCurrentIndex(index);
      setAddCamera(false)
    }

  }













  const cameraChunk = [
    { label: 'One', url: "http://localhost:3001", stream: "rtsp://admin:hik12345@192.168.10.114:554" },
    { label: 'Two', url: "http://localhost:3001", stream: "rtsp://admin:hik12345@192.168.10.114:554" },
    { label: 'Three', url: "http://localhost:3001", stream: "rtsp://admin:hik12345@192.168.10.114:554" },
    { label: 'Four', url: "http://localhost:3001", stream: "rtsp://admin:hik12345@192.168.10.114:554" },
    { label: 'Five', url: "http://localhost:3001", stream: "rtsp://admin:hik12345@192.168.10.114:554" },

  ]

  const addCamera = async (obj) => {



    let setting = {
      confidence: 0.5,
      entry: [],
      exit: [],
      frame: false,
      percentage: "1",
      queue: {},
      ready: false,
      restart: false,
      stream: "",
      type: "regions",
      url: "",
      regions: []
    }


    let payload = {
      label: obj.label,
      setting: setting,
      dispatch
    };
    if (typeof payload !== undefined && payload && "label" in payload && "setting" in payload) {

      let newCam = await createSetting(payload);
      let _allSettings = await getAllSettings({ dispatch });
      setAllSettings(_allSettings.data)
      setCurrentIndex((typeof _allSettings !== undefined && _allSettings && _allSettings.data.length > 0) ? _allSettings.data.length - 1 : 0)
    }
  }



  useEffect(() => {


  }, [currentCam])





  return (
    <>




      {console.log('showCanvas', showCanvas)}
      <ToastContainer />

      {/* {showCanvas && config.data.short != "Q" && (
        <DrawROIs
          url={currentCam.setting.url}
          points={
            roiType === "line"
              ? currentCam.line
              : roiType === "region"
                ? currentCam.setting.regions
                : currentCam.setting.regions
          }
          type={roiType}
          close={() => setShowCanvas(false)}
          save={(e) => save(e.type, e.data)}
        />
      )} */}

      {showCanvas && config.data.short == "Q" && (
        <DrawQueueROIs
          url={currentCam.setting.url}
          points={currentCam.setting.url}
          type={roiType}
          close={() => setShowCanvas(false)}
          save={(e) => save(e.type, e.data)}
        />
      )}
      <Joyride
        run={run}
        loading={true}
        steps={steps}
        debug={true}
        continuous={true}
        showSkipButton={true}
        showProgress={true}
        callback={handleJoyrideCallback}
        styles={{
          options: {
            arrowColor: "white",
            primaryColor: "orange",
            textColor: "black",
            width: 500,
            zIndex: 10,
          },
          buttonNext: {
            backgroundColor: 'var(--primary)',
            border: "none",
            borderRadius: 7,
            color: "white",
            "&:focus": {
              outline: "none !important",
            },
          },
          buttonBack: {
            backgroundColor: 'var(--silver)',
            border: "none",
            borderRadius: 7,
            color: "black",
            "&:focus": {
              outline: "none !important",
            },
            marginRight: 5,
          },
          buttonClose: {
            color: "var(--primary)",
            height: 14,
            padding: 15,
            position: "absolute",
            right: 0,
            top: 0,
            width: 14,
          },
        }}
      />
      {console.log('currentIndex',currentIndex)}

      {
        <Row>
          <Col md={3}>
            <Row>
              <Col className='px-3 pt-3'>
                <div className='list-group list-group-checkable m-1'
                  onClick={() => { setCurrentIndex(-1); setAddCamera(true) }}

                >
                  <label className={addCameraFlag ? "list-group-item py-3 activeUser" : "list-group-item py-3"}
                    style={{ cursor: "pointer" }}              >
                    <FolderPlus size={27} />
                    <span className='px-3' >Create Camera</span>
                  </label>
                </div>
                <div className='scrollbar ' id="style-3" style={{ width: "100%", height: '35rem' }}>

                  {typeof allSettingsLocal !== undefined && allSettingsLocal && allSettingsLocal.length > 0 &&
                    allSettingsLocal.map((item, index) => {
                      return (
                        <div className='list-group list-group-checkable m-1' key={index}
                          onClick={() => setIndex(index)}
                        >
                          <label className={currentIndex === index ? "list-group-item py-3 activeUser userHover" : " list-group-item py-3 userHover"} style={{ cursor: "pointer" }}
                          //  onClick={() => editUser(item._id)}
                          >
                            <Row>

                              <Col className='px-3'>
                                {item.label}
                              </Col>
                            </Row>
                          </label>
                        </div>
                      )
                    })}

                </div>

              </Col>
            </Row>
          </Col>

          <Col md={9}>

            {!addCameraFlag && typeof currentCam !== undefined && currentCam && "setting" in currentCam && typeof currentCam.setting !== undefined && currentCam.setting && <>
              <Row className="" style={{ marginTop: '0.5rem' }}>
                {
                  <Col sm={12} md={12} lg={12} className="text-center mb-5">
                    <h3 className="mb-3">Skill Configuration of {typeof currentCam !== undefined && currentCam && currentCam.label}</h3>
                    <p className="text-secondary">
                      Please provide data in the following sections carefully in
                      order to get optimized results. When you save your data the
                      skill starts working accordingly. To view usage guide please click the "Guide Me" button below.
                    </p>
                    <button
                      className="btn-outline-secondary radius-8 btn btn-sm"
                      onClick={startTutorial}
                    >
                      Guide Me
                    </button>
                  </Col>
                }
                {
                  showCanvas && config.data.short != "Q" &&
                  <>
                    <Row>
                      <Col md={3} className='text-end'>



                      </Col>
                      <Col md={8}>
                        <div style={{ width: "", height: "" }} className='text-center'>
                          <DrawRegions
                            url={currentCam.setting.url}
                            currentCam={currentCam}
                            points={
                              roiType === "line"
                                ? currentCam.line
                                : roiType === "region"
                                  ? currentCam.setting.regions
                                  : currentCam.setting.regions
                            }
                            type={roiType}
                            showCanvas={showCanvas}
                            setShowCanvas={(output) => setShowCanvas(output)}
                            close={() => { setShowCanvas(false); setCurrentRegion({ edit: false, region: {}, index: null }) }}
                            save={(e) => save(e.type, e.data)}
                            editFlag={currentRegion}
                          />
                        </div>
                      </Col>
                    </Row>
                  </>






                }
                {
                  !showCanvas &&
                  <>
                    {config && config.settings.configuration.isConfidence && (
                      <>
                        <Col sm={12} md={12} lg={12}>
                          <div className="my-3">
                            {!currentCam.setting.device && <span className="d-block small opacity-50" style={{ color: 'red' }}><i>Device needs to be restarted</i></span>}
                          </div>
                        </Col>
                        <Col sm={12} md={12} lg={12}>
                          <div id="confidenceLabel">
                            <label>
                              Confidence{" "}
                              <span
                                title="This value controls the sensitivity of object detection."
                                style={{ marginTop: "-5px", cursor: "pointer" }}
                              >
                                <BsInfoCircleFill />
                              </span>{" "}
                            </label>
                            <div className=" form-control form-floating mb-3">
                              <input
                                type="text"
                                className="form-control custom-range"
                                value={(currentCam.setting && currentCam.setting.confidence) ? currentCam.setting.confidence : ""}
                                id="confidence"
                                placeholder="Confidence"
                                readOnly
                                style={{ border: "0" }}
                              />
                              <input
                                type="range"
                                className="form-range"
                                id="ageInputId"
                                value={(currentCam.setting && currentCam.setting.confidence) ? currentCam.setting.confidence : ""}
                                min={0}
                                max={1}
                                step={0.01}
                                onChange={(e) =>
                                  updateData("confidence", e.target.value)
                                }
                              />
                            </div>
                          </div>
                        </Col>
                      </>
                    )}{console.log('config', config)}
                    {config && config.settings.configuration.isPercentage && (
                      <>
                        <Col sm={12} md={12} lg={12}>
                          <div></div>
                        </Col>
                        <Col sm={12} md={12} lg={12}>
                          <div id="percentageLabel">
                            <label>
                              Detection Threshold{" "}
                              <span
                                title="What percentage of camera frame must a face should cover to activate detection."
                                style={{ marginTop: "-5px", cursor: "pointer" }}
                              >
                                <BsInfoCircleFill />
                              </span>{" "}
                            </label>
                            <div className=" form-control form-floating mb-3">
                              <input
                                type="text"
                                className="form-control custom-range"
                                value={(currentCam.setting && currentCam.setting.percentage) ? currentCam.setting.percentage : ""}
                                id="percentage"
                                placeholder="Percentage"
                                readOnly
                                style={{ border: "0" }}
                              />
                              <input
                                type="range"
                                className="form-range"
                                id="percentageInputId"
                                value={(currentCam.setting && currentCam.setting.percentage) ? currentCam.setting.percentage : ""}
                                min={0}
                                max={100}
                                step={0.1}
                                onChange={(e) =>
                                  updateData("percentage", e.target.value)
                                }
                              />
                            </div>
                          </div>
                        </Col>
                      </>
                    )}
                    {config && config.settings.configuration.isStream && (
                      <Col sm={12} md={12} lg={12} id="streamLinkLabel">
                        <div>
                          <label>
                            Video Stream Link
                            <span
                              title="For example: rtsp://username:password@domain:port"
                              style={{
                                marginTop: "-5px",
                                cursor: "pointer",
                                marginLeft: "3px",
                              }}
                            >
                              <BsInfoCircleFill />
                            </span>
                          </label>
                          <p className="text-secondary">Read our <a href="https://optra.adlytic.ai" target="_blank">guide</a> to setup an IP camera properly.</p>
                          <div className="form-floating mb-3">
                            <input
                              type="text"
                              className="form-control"
                              value={(currentCam.setting && currentCam.setting.stream) ? currentCam.setting.stream : ""}
                              id="stream"
                              placeholder="Video Stream"
                              onChange={(e) => updateData("stream", e.target.value)}
                            />

                            <label>Video Stream</label>
                            <span className="d-block small opacity-50">{( allSettingsLocal[currentIndex].setting.stream) ? !allSettingsLocal[currentIndex].setting.isStream ?
                              <span><GoPrimitiveDot className='' color={'silver'} size={24} style={{ float: '' }} title="offline" />{"Camera stream is not available"}</span>
                              : <span><GoPrimitiveDot className='' color={'yellowgreen'} size={24} style={{ float: '' }} title="offline" />{"Camera stream is available"}</span> : ""}</span>
                          </div>
                        </div>
                      </Col>
                    )}
                    {currentCam && currentCam.setting && (
                      // settings.data.stream &&
                      // settings.data.stream.length &&
                      <Col sm={12} md={12} lg={12}>
                        <Preview settings={currentCam.setting} isQueue={config.data.short === "Q"} />
                      </Col>
                    )}
                    {


                      // settings.data.stream &&
                      //   settings.data.stream.length > 0 &&
                      //   settings.data.url &&
                      //   settings.data.url.length > 0 &&

                      currentCam.setting && (
                        <Col sm={12} md={12} lg={12}>
                          <div className=" my-3  justify-content-center">
                            {currentCam.setting.type == "regions" && config.data.short != "Q" && (
                              <>
                                {config && config.settings.configuration.entry && (
                                  <>
                                    {!currentCam.setting.regions.length &&
                                      <Button
                                        className={"radius-8 btn btn-sm btn-outline"}
                                        onClick={() => drawROIs("region")}
                                        title="Click to draw entry region on above fetch image"
                                        disabled={!currentCam.setting.stream}
                                        id="entryButton"
                                      >
                                        {currentCam.setting.regions
                                          ? currentCam.setting.regions.length > 0
                                            ? "Add another regoin"
                                            : "Draw Internal floor region"
                                          : "Draw Internal floor region"}
                                      </Button>
                                    }
                                  </>

                                )}
                                {/* {config && config.settings.configuration.exit && (
                            <Button
                              className={"radius-8 btn mx-2 btn-sm btn-outline"}
                              onClick={() => drawROIs("exit")}
                              title="Click to draw exit region on above fetch image"
                              disabled={!currentCam.setting.stream}
                              id="exitButton"
                            >
                              {currentCam.setting.exit
                                ? currentCam.setting.exit.length > 0
                                  ? "Edit Exit"
                                  : "Draw Exit"
                                : "Draw Exit"}
                            </Button>
                          )} */}

                                {typeof currentCam !== undefined && currentCam && currentCam.setting.regions.length > 0 &&
                                  <>
                                    <Row noGutters >
                                      <Col className='' >
                                        <h4 className='d-inline ' style={{ cursor: 'pointer' }}>Internal floor region {' '}<PlusCircle size={27} onClick={() => setShowCanvas(true)} />
                                        </h4>
                                      </Col>
                                    </Row>
                                    <RegoinsTable
                                      currentCam={currentCam}
                                      setCurrentRegion={(output) => setCurrentRegion(output)}
                                      setShowCanvas={(output) => setShowCanvas(output)}
                                      save={(e) => save(e.type, e.data)}

                                    />

                                  </>

                                }
                              </>



                            )}
                            {currentCam.setting.type == "regions" && config.data.short == "Q" && (
                              <>
                                {
                                  <Button
                                    className={"radius-8 btn btn-sm btn-primary mb-2"}
                                    onClick={() => addQueue()}
                                    id="addQueueButton"
                                    disabled={!currentCam.setting.data.stream}
                                  >
                                    <Plus size={16} />
                                  </Button>
                                }
                                {currentCam.setting.queue && Object.keys(currentCam.setting.queue).length > 0 && (
                                  <span className="mx-2">|</span>
                                )}
                                {currentCam.setting.queue &&
                                  Object.keys(currentCam.setting.queue ? currentCam.setting.queue : {}).map((key, ind) => {
                                    return (
                                      <div className="btn-group radius-8 mx-2 mb-2">
                                        <Button
                                          className={"btn-sm btn-primary"}
                                          onClick={() => drawROIs(key)}
                                          key={"btn-roi-" + ind}
                                          id="drawQueueButton"
                                        >
                                          {currentCam.setting.queue[key] && currentCam.setting.queue[key].length > 0
                                            ? "Edit "
                                            : "Draw "}{" "}
                                          {keyToLabel(key)}
                                        </Button>
                                        <Button
                                          className={"btn-sm btn-danger"}
                                          onClick={() => deleteRoi(key)}
                                          key={"btn-roi-" + ind}
                                        >
                                          <Trash2 size={16} />
                                        </Button>
                                      </div>
                                    );
                                  })}
                              </>
                            )}
                          </div>
                          {false &&
                            currentCam.setting.stream &&
                            currentCam.setting.stream.length > 0 &&
                            currentCam.setting.url &&
                            currentCam.setting.url.length > 0 &&
                            currentCam.setting.short == "Q" &&
                            currentCam.setting.queue &&
                            Object.keys(currentCam.setting.queue ? currentCam.setting.queue : {}).length > 0 && (
                              <>
                                <hr
                                  className="my-4"
                                  style={{ background: "var(--silver)" }}
                                />
                                <div className="my-3">
                                  {currentCam.setting.type == "regions" && config.data.short == "Q" && (
                                    <>
                                      {
                                        <Button
                                          className={"radius-8 btn btn-sm btn-primary"}
                                          disabled={true}
                                        >
                                          Delete Queue
                                        </Button>
                                      }
                                      {currentCam.setting.queue &&
                                        Object.keys(currentCam.setting.queue).length > 0 && (
                                          <span className="mx-2">|</span>
                                        )}
                                      {currentCam.setting.queue &&
                                        Object.keys(currentCam.setting.queue).map((key, ind) => {
                                          return (
                                            <Button
                                              className={
                                                "radius-8 btn mx-1 btn-sm btn-outline-danger"
                                              }
                                              onClick={() => deleteRoi(key)}
                                              key={"btn-dlt-roi-" + ind}
                                            >
                                              {currentCam.setting.queue[key] &&
                                                currentCam.setting.queue[key].length > 0
                                                ? "Delete "
                                                : "Delete "}{" "}
                                              {keyToLabel(key)}
                                            </Button>
                                          );
                                        })}
                                    </>
                                  )}
                                </div>
                              </>
                            )}
                          <hr className="my-4" style={{ background: "var(--silver)" }} />
                          <div className="form-check" id="streamProcessLabel">
                            <input
                              type="checkbox"
                              className="form-check-input"
                              id="ready"
                              checked={currentCam.setting.ready}
                              onChange={(e) => updateData("ready", e.target.checked)}
                              disabled={!currentCam.setting.stream}
                            />
                            <label className="form-check-label" htmlFor="ready">


                              {currentCam.setting.ready ? "Ready to Process" : "Start Processing"}{" "}
                              <span
                                title="signals the backend to start processing"
                                style={{ marginTop: "-5px", cursor: "pointer" }}
                              >
                                <BsInfoCircleFill />
                              </span>
                              <br></br>
                              <span className="d-block small opacity-50">
                                {currentCam.setting.isProcessing ?
                                  <span><GoPrimitiveDot className='' color={'yellowgreen'} size={24} style={{ float: '' }} title="offline" />{"Currently processing camera stream"}</span>
                                  : currentCam.setting.ready ? "Ready to start the camera stream Processing " : ""}
                              </span>
                            </label>
                          </div>
                          <hr className="my-4" style={{ background: "var(--silver)" }} />
                        </Col>
                      )}
                    {
                      <Col sm={12} md={12} lg={12}>
                        <Row>
                          <Col>
                            <div className="form-check" id="restartSystemLabel">
                              <input
                                type="checkbox"
                                className="form-check-input"
                                id="restart"
                                checked={currentCam.setting.restart}
                                onChange={(e) =>
                                  updateData("restart", e.target.checked)
                                }
                              />
                              <label
                                className="form-check-label text-success"
                                htmlFor="restart"
                              >
                                {currentCam.setting.restart ? "System is scheduled to restart" : "Restart System!"}
                                <span
                                  title="restart backend pipline"
                                  style={{
                                    marginTop: "-5px",
                                    cursor: "pointer",
                                    marginLeft: "3px",
                                  }}
                                >
                                  <BsInfoCircleFill />
                                </span>
                              </label>
                            </div>
                          </Col>

                          <Col>
                            <div className="text-end">
                              <Button
                                color="outline-danger"
                                onClick={() => toggle()}
                                className={"radius-8 mx-2 btn btn-outline"}
                                title="Reset to default setting"
                                id="resetSystemLabel"
                              >
                                Reset
                              </Button>
                              <Button
                                className={"radius-8 btn btn-primary"}
                                onClick={() => saveSettings()}
                                disabled={!updateFlag}
                                id="saveSettingLabel"
                              >
                                {saving ? "...Saving" : "Save Settings"}
                              </Button>
                            </div>
                          </Col>
                          <hr className="my-4" style={{ background: "var(--silver)" }} />
                        </Row>
                      </Col>
                    }
                  </>
                }

                {console.log('saving', saving)}




              </Row>
              {!showCanvas && <Row>
                <Col sm={12} md={12} lg={12} className="text-end">
                  <Button
                    color="outline-danger"
                    className={"radius-8 btn outline-danger"}
                    onClick={() => toggleDeleteData()}
                    id="deleteData"
                  >
                    Delete Existing Records
                  </Button>
                </Col>
              </Row>}
            </>}

          </Col>

        </Row>}

      {
        addCameraFlag && <AddCamera
          modal={addCameraFlag}
          setModal={(output) => setAddCamera(output)}
          options={[{ value: 'A', label: 'A' }, { value: 'B', label: 'B' }]}
          setStoreMac={""}
          assignStoreToMac={""}
          setCurrentIndex={(output) => setCurrentIndex(output)}
          addCamera={addCamera}
          allSettingsLocal={allSettingsLocal}
        >

        </AddCamera>
      }


      <AlertMessage
        toggle={() => setAlertMessage({ flag: false, currentIndex: null })}
        continue={(output) => setCurrentIndex(output)}
        modal={alertMessage}
      />





      <Row className="py-5">
        <Col>
          <Modal isOpen={modal} toggle={() => toggle()}>
            <ModalHeader toggle={() => toggle()}>Confirmation</ModalHeader>
            <ModalBody>
              Are you sure you want to reset the current settings to default?
              This action will change the values to default and cannot be
              reversed.
            </ModalBody>
            <ModalFooter>
              <Button
                className="btn-primary radius-8"
                onClick={() => resetSettings()}
              >
                Continue
              </Button>
              <Button
                className="outline-danger radius-8"
                onClick={() => toggle()}
              >
                Close
              </Button>
            </ModalFooter>
          </Modal>

          <Modal isOpen={inputModal} toggle={() => toggleInput()}>
            <ModalHeader toggle={() => toggleInput()}>Add Queue</ModalHeader>
            <ModalBody>
              <div className="mb-3">
                <label className="form-label">Queue Title</label>
                <input
                  type="text"
                  className="form-control"
                  id="queue"
                  placeholder="Queue 1"
                  onChange={(e) => setQueueName(e.target.value)}
                />
                {inputError && inputError.length > 0 && (
                  <div id="emailHelp" className="form-text text-danger">
                    {inputError}
                  </div>
                )}
              </div>
            </ModalBody>
            <ModalFooter>
              <Button
                className="btn-primary radius-8"
                onClick={() => setName()}
              >
                Continue
              </Button>{" "}
              <Button
                className="outline-danger radius-8"
                onClick={() => toggleInput()}
              >
                Close
              </Button>
            </ModalFooter>
          </Modal>

          <Modal isOpen={deleteModal} toggle={() => toggleDelete()}>
            <ModalHeader toggle={() => toggleDelete()}>
              Confirmation
            </ModalHeader>
            <ModalBody>
              Are you sure you want to delete {keyToLabel(deletingKey)}
            </ModalBody>
            <ModalFooter>
              <Button
                className="btn-primary radius-8"
                onClick={() => removeRoi(deletingKey)}
              >
                Continue
              </Button>
              <Button
                className="outline-danger radius-8"
                onClick={() => toggleDelete()}
              >
                Close
              </Button>
            </ModalFooter>
          </Modal>

          <Modal isOpen={deleteDataModal} toggle={() => toggleDeleteData()}>
            <ModalHeader toggle={() => toggleDeleteData()}>
              Confirmation
            </ModalHeader>
            <ModalBody>
              This action will delete all existing records and is not reversible.
            </ModalBody>
            <ModalFooter>
              <Button
                className="btn-primary radius-8"
                onClick={() => deletePreviewRecords()}
              >
                Continue
              </Button>
              <Button
                className="outline-danger radius-8"
                onClick={() => toggleDeleteData()}
              >
                Close
              </Button>
            </ModalFooter>
          </Modal>


        </Col>
      </Row>
    </>
  );
};

export default Settings;
