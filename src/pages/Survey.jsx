import React, { useState, useRef } from "react";
import "./Survey.css";
import { PlusOutlined } from "@ant-design/icons";
import { BsArrowRight } from 'react-icons/bs';
import { AiFillDelete } from 'react-icons/ai';
import region from '../assets/img/regionpic.png'
import { Divider, Empty, Select, Input, Space, DatePicker, Button, message, Steps, Radio, Table, Modal, TimePicker } from "antd";
import { capitalizeFirstLetter } from "../helpers/utils";
import dayjs from "dayjs";
import DrawPointsOnScaleImage from "../components/DrawPointsOnScaleImage";
import { addLocationRequest, fetchLocationRequest, addDistrictRequest, fetxhDistrictRequest, addCityRequest, fetxhCityRequest, add_step_1_Request, step_2_videos_Request, addRegionsRequest, addDirectionRequest, fetxhregion, fetchsurvey, getSurveyRequest, updateSurveryRequest } from '../helpers/requests'
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Progress } from 'antd';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer, toast } from 'react-toastify';
import { apiUrl } from "../helpers/auth";
import { useLocalStorage } from "../customHooks/useLocalStorage";
import DeleteModal from "../components/DeleteModal";
import { Col, Row } from "reactstrap";
import { FaUndoAlt } from "react-icons/fa";






const Survey = () => {

  const navigate = useNavigate()
  const [progres, setProgress] = useState(25)

  // Single File or Folder State
  const [value, setValue] = useState(1);
  const [regionPoints, setRegionPoints] = useState([])

  const survey_data = {
    label: '',
    date: '',
    location: '',
    district: '',
    city: '',
    type: '',
    is_folder: value,
    videos: [],
    regions: [],
    directions: [],
    id: null,
    region_id: null,
    screenshot: null,
    jobStart: 0,

  }

  const [survery, setSurvery] = useState(survey_data);

  const [regionName, setRegionName] = useState()


  // State for Direction:-
  const [directionTitle, setDirection] = useState()

  // State for district
  const [districtoption, setDistrictoption] = useState(
    [
      { label: 'Lahore', value: 'lahore' },
      { label: 'Kasur', value: 'kasur' }
    ]
  );
  const [newDistrict, setNewDistrict] = useState("");


  // State for city
  const [cityoption, setCityoption] = useState(
    [
      { label: 'Lahore', value: 'lahore' },
      { label: 'Kasur', value: 'kasur' }
    ]
  );
  const [newCity, setNewCity] = useState("");


  // State for location :-

  const [locationOptions, setLocationOptions] = useState(
    [{ value: 'location', label: 'Location' }]
  );

  const [newLocation, setNewLocation] = useState("");


  // Select Types State  

  const [typeoption, setTypeoption] = useState(
    [
      {
        value: 'Patch',
        label: 'Patch',
      },
      {
        value: 'Junction',
        label: 'Junction',
      },

      {
        value: 'Round About',
        label: 'Round About',
      },
    ]
  )


  // Directions State

  const [directionOptions, setDirectionOptions] = useState([]);
  const [startDirection, setStartDirection] = useState('')
  const [endDirection, setEndDirection] = useState('')




  // Upload File :-
  const [uploadfile, setuploadfile] = useState()



  // State for Modal
  const [isModalOpen, setIsModalOpen] = useState(false);

  const setDataFormat = (item) => {

    let _options;
    if (item.data.length > 0) {

      _options = item.data.map((item) => {
        let object = {
          ...item, value: item.id, label: capitalizeFirstLetter(item.title)
        }
        return object
      })
    }
    else {
      _options = [];
    }
    return _options

  }



  // API INTEGRATION ***********************************************************

  // Location API 


  const add_new_location = async () => {

    if (newLocation !== undefined && newLocation) {

      let isAlreadyExist = locationOptions.some((item) => {
        return item.label === newLocation
      });
      if (isAlreadyExist) {
        toast.error('This Location is already exist', {
          position: toast.POSITION.TOP_CENTER,
          autoClose: true,
        })
      }
      else {
        let obj = {
          title: newLocation
        }

        const res = await addLocationRequest(obj);
        if (res.data.status) {
          const getLocations = await fetchLocationRequest();
          if (getLocations.status === 200 && getLocations.data.status) {
            let _locations = setDataFormat(getLocations.data);
            setLocationOptions(_locations);
            setNewLocation('')
          }

        }
      }
    }
    else {
      toast.error('empty field cannot be added', {
        position: toast.POSITION.TOP_CENTER,
        autoClose: true,
      })
    }
  }





  // District API 

  const add_new_district = async () => {

    if (newDistrict !== undefined && newDistrict) {

      let isAlreadyExist = districtoption.some((item) => { return item.label === newDistrict });
      if (isAlreadyExist) {
        toast.error('This district is already exist', {
          position: toast.POSITION.TOP_CENTER,
          autoClose: true,
        })
      }
      else {
        let obj = {
          title: newDistrict
        }
        const res = await addDistrictRequest(obj)
        if (res.status === 200) {
          const getDistrict = await fetxhDistrictRequest();
          if (getDistrict.data.status) {
            let _options = setDataFormat(getDistrict.data);
            setDistrictoption(_options);
            setNewDistrict('')
          }

        }
      }

    }
    else {
      toast.error('empty field cannot be added', {
        position: toast.POSITION.TOP_CENTER,
        autoClose: true,
      })
    }




  }



  // City API 


  const add_new_city = async () => {


    if (newCity !== undefined && newCity) {

      let isAlreadyExist = cityoption.some((item) => { return item.label === newCity });
      if (isAlreadyExist) {
        toast.error('This Location is already exist', {
          position: toast.POSITION.TOP_CENTER,
          autoClose: true,
        })
      }
      else {
        let obj = {
          title: newCity
        }
        const res = await addCityRequest(obj)
        if (res.status === 200) {
          const getCity = await fetxhCityRequest();
          if (getCity.data.status) {
            let _options = setDataFormat(getCity.data);
            setCityoption(_options);
            setNewCity('');
          }
        }
      }
    }
    else {
      toast.error('empty field cannot be added', {
        position: toast.POSITION.TOP_CENTER,
        autoClose: true,
      })
    }




  }




  // Api for Step 1

  const add_step_1 = async () => {

    let obj = {
      title: survery.label,
      survey_date: survery.date,
      location: survery.location,
      district: survery.district,
      city: survery.city,
      type: survery.type,
      is_folder: survery.is_folder,
      visualize: 111,
      write_video: 0,
      status: 1,
      frame: '',
      jobStart: survery.jobStart
    }
    const res = await add_step_1_Request(obj);
    setSurvery({ ...survery, id: res.data.id })

  }


  // Api for Step 2 videos
  const add_step_2 = async () => {

    let obj = {
      job_id: survery.id,
      videos: survery.videos,

    }

    const res = await step_2_videos_Request(obj)




    if (res.status) {
      let frame_pic = apiUrl + res.data.frame;
      setSurvery({ ...survery, screenshot: frame_pic })
    }



  }


  // Api for Step 3 Region
  const add_step_3 = async () => {

    let obj = {
      job_id: survery.id,
      regions: survery.regions,
    }
    const res = await addRegionsRequest(obj)
    let _survey = await getSurveyRequest({ job_id: survery.id });
    if (_survey !== undefined && _survey && _survey.status) {
      let _options = _survey.data.regions.map((item, index) => {
        let object = {
          ...item, value: item.id, label: capitalizeFirstLetter(item.title)
        }
        return object
      })
      _options.unshift({ label: 'Select', value: 'select' })
      setDirectionOptions(_options)

    }
    else {
      alert("Regions not added please try again")
    }



  }


  // Api for Step 4 direction
  const add_step_4 = async () => {
    let obj = {
      job_id: survery.id,
      directions: survery.directions
    }
    const res = await addDirectionRequest(obj);
    if (res.status) {
      toast.success('Survey Created', {
        position: toast.POSITION.TOP_CENTER,
        autoClose: true,
      })
      setTimeout(() => {
        navigate('/')
      }, 2000)

    }
  }

  // Function for Component:-***********


  // Function for maping Direction Array

  const map_direction = () => {

    if (!directionTitle) {
      toast.error('PLease type label', {
        position: toast.POSITION.TOP_CENTER,
        autoClose: true,
      })
    }
    else {
      let isCorrect = true;

      if (!startDirection || !endDirection) {
        isCorrect = false;
      }

      if (!isCorrect) {
        toast.error('Please select directions correctly', {
          position: toast.POSITION.TOP_CENTER,
          autoClose: true,
        })
      }
      else {
        const prvdir = [...survery.directions]
        const direc_obj = {
          title: directionTitle,
          start: startDirection,
          end: endDirection,
          startLabel: directionOptions.filter((item) => { return item.id === startDirection })[0].label,
          endLabel: directionOptions.filter((item) => { return item.id === endDirection })[0].label,
          directn_type: survery.type,
        }
        prvdir.push(direc_obj)
        setSurvery({ ...survery, directions: prvdir })
        setDirection('')
      }


    }



  }

  // Function for saving Region :-


  const save_region = () => {


    if ((regionName !== undefined && regionName) && regionPoints.length >= 3) {
      const region_object = {
        title: regionName,
        coordinate: regionPoints
      }

      const region_list = [...survery.regions]
      region_list.push(region_object)
      setSurvery({ ...survery, regions: region_list })
      toast.success('Region added', {
        position: toast.POSITION.TOP_CENTER,
        autoClose: true,
      })
      setRegionPoints([])
      setRegionName('')
    } else {
      toast.error('PLease add region correctly', {
        position: toast.POSITION.TOP_CENTER,
        autoClose: true,
      })
    }


  }


  // Function for Delete Direction from direction array:-

  const [directionDeleteFlag, setDirectionDeleteFlag] = useState(false);
  const [currentDirection, setCurrentDirection] = useState()

  const handleDeleteDirection = (index) => {
    const del_direc = [...survery.directions]
    del_direc.splice(index, 1)
    setSurvery({ ...survery, directions: del_direc })
  }



  const setDirectionChunk = ({ index, item }) => {
    setCurrentDirection(index);
    setDirectionDeleteFlag(true)
  }


  // Function for delete region

  const [regionDeleteFlag, setRegionDeleteFlag] = useState(false);
  const [currentRegion, setCurrentRegion] = useState()

  const handleDeleteRegion = (index) => {



    const del_reg = [...survery.regions]
    del_reg.splice(index, 1)
    setSurvery({ ...survery, regions: del_reg })

  }

  const setRegionChunk = ({ item, index }) => {
    setCurrentRegion(index);
    setRegionDeleteFlag(true)
  }


  // Function for Modal
  const showModal = () => {
    setIsModalOpen(true);
  };
  const handleOk = () => {
    setIsModalOpen(false);
    setRegionPoints([])
  };
  const handleCancel = () => {
    setIsModalOpen(false);
  };


  // Function for select single file or folder

  const radio_check = (e) => {
    setValue(e.target.value);

  };

  // Function for Pushing video array:-

  const pusharray = () => {

    let addedvid = uploadfile
    let videos = [];

    Object.keys(addedvid).map(key => {
      let object = addedvid[key];
      object['start_time'] = '';
      object['end_time'] = '';
      object['path'] = addedvid[key].name;
      object['status'] = 0;
      object['title'] = addedvid[key].name
      videos.push(object);
    })
    setSurvery({ ...survery, videos: videos })
  }




  // Function of  district*****

  const inputRef = useRef(null);


  //  Function For city******

  const cityInput = useRef(null);



  // Function For location******

  const locationinput = useRef(null);


  // Function for range date picker 
  const onRange_date_Change = ({ date, index }) => {


    const start_date = dayjs(date[0]).format('HH:mm:ss')
    let start_time = start_date;
    const end_date = dayjs(date[1]).format('HH:mm:ss')
    let end_time = end_date;
    dayjs(end_time).format('MM-DD-YY')
    let _uploadedArray = survery.videos.slice();
    let currentVideo = _uploadedArray[index];



    currentVideo['start_time'] = start_time;
    currentVideo['end_time'] = end_time;
    currentVideo['visualize'] = 0;
    currentVideo['path'] = currentVideo.title;
    currentVideo['status'] = 0;
    currentVideo['title'] = currentVideo.title;


    // let obj = {
    //   start_time: start_time,
    //   end_time: end_time,
    //   visualize: 0,
    //   path: currentVideo.title,
    //   status: 0,
    //   title: currentVideo.name,

    // }
    // let 

    _uploadedArray[index] = currentVideo;

    setSurvery({ ...survery, videos: _uploadedArray })

    // setuploadedarray(_uploadedArray);

  };

  const [messageApi, contextHolder] = message.useMessage();

  // Stepper function****

  const error = () => {
    messageApi.open({
      type: 'error',
      content: 'PLease select all fields',
    });
  }


  const next = async () => {
    if (progres === 25) {
      if (!survery.label || !survery.date || !survery.location || !survery.city || !survery.district || !survery.type) {
        // error()
        toast.error('PLease select all fields', {
          position: toast.POSITION.TOP_CENTER,
          autoClose: false,
        })
        // alert("PLease select all fields")


      }
      else {
        await add_step_1();
        setProgress(progres + 25);
      }


    }
    else if (progres === 50) {
      if (!survery.videos.length) {
        toast.error('PLease upload videos', {
          position: toast.POSITION.TOP_CENTER,
          autoClose: true,
        })
        // error()
      }
      else {
        let isTimeAdded = true;
        for (let i = 0; i < survery.videos.length; i++) {
          let video = survery.videos[i];
          if (!video.end_time || !video.start_time) {
            isTimeAdded = false;
            break;
          }
        };

        if (isTimeAdded) {
          await add_step_2();
          setProgress(progres + 25);
        }
        else {
          toast.error('PLease add time', {
            position: toast.POSITION.TOP_CENTER,
            autoClose: false,
          })
        }

      }

    }
    else if (progres === 75) {
      if (!survery.regions.length) {
        toast.error('PLease draw regions', {
          position: toast.POSITION.TOP_CENTER,
          autoClose: true,
        })
      }
      else {
        await add_step_3();
        setProgress(progres + 25);
        setDirection('')

      }

    }
    else if (progres === 100) {
      if (!survery.directions.length) {
        toast.error('Please add Directions', {
          position: toast.POSITION.TOP_CENTER,
          autoClose: false,
        })
      } else {
        await add_step_4();

      }
      // setProgress(progres + 25);
    }

  };

  const undoPoints = () => {
    let _points = regionPoints.slice();
    _points.pop();
    setRegionPoints(_points);
  }


  const prev = () => {
    if (progres > 25) {
      setProgress(progres - 25);
    }
  };




  useEffect(async () => {
    let _locationOptions = await fetchLocationRequest();
    if (_locationOptions.status === 200 && _locationOptions.data.status) {
      let _locations = setDataFormat(_locationOptions.data);
      setLocationOptions(_locations);
    }



    let _districtOptions = await fetxhDistrictRequest();
    if (_districtOptions.status === 200 && _districtOptions.data.status) {
      let _district = setDataFormat(_districtOptions.data);
      setDistrictoption(_district);
    }




    let _cityOptions = await fetxhCityRequest();
    if (_cityOptions.status === 200 && _cityOptions.data.status) {
      let _city = setDataFormat(_cityOptions.data);
      setCityoption(_city);
    }

  }, [1])



  return (
    <div className="main_survey">
      <ToastContainer />
      <div className="survey_content">
        <div className="survey_title">Step {progres / 25} of 4</div>
        <Progress percent={progres} style={{ marginBottom: '50px' }} />

        {progres === 25 ?
          <div className="step_1">


            <div className="step_1_title">Choose your Demographics</div>
            <div className="sub_title">If you are already a member you can login with your email and password.</div>
            <div className="main_group_input">
              <div className="group">
                <label>Add Label</label>
                <input value={survery.label} onChange={(e) => setSurvery({ ...survery, label: e.target.value })} type="text" className="label_input" />

              </div>
              <div className="group">
                <label>Pick a Date</label>
                <DatePicker
                  onChange={(e) => {
                    const realdate = dayjs(e).format('YYYY-MM-DD')
                    setSurvery({ ...survery, date: realdate })
                  }

                  }

                />
              </div>
            </div>

            <div className="places">
              <div className="group">
                <label>Select Location</label>
                <div className="main_loc">
                  <Select value={survery.location} onChange={(e) => setSurvery({ ...survery, location: e })} style={{ width: 300, }} placeholder="Location" dropdownRender={(menu) => (
                    <>
                      {menu}
                      <Divider style={{ margin: "8px 0", }}
                      />
                      <Space style={{ padding: "0 8px 4px", }}>
                        <Input placeholder="Enter New Location" ref={locationinput} value={newLocation} onChange={(e) => setNewLocation(e.target.value)} />
                        <Button type="text" icon={<PlusOutlined />} onClick={add_new_location}>                      </Button>
                      </Space>
                    </>
                  )}
                    options={locationOptions}
                  />
                </div>
              </div>
            
              <div className="group">
                <label>Select District</label>
                <div className="main_loc">
                  <Select value={survery.district} onChange={(e) => setSurvery({ ...survery, district: e })} style={{ width: 300, }} placeholder="District" dropdownRender={(menu) => (
                    <>
                      {menu}
                      <Divider style={{ margin: "8px 0", }} />
                      <Space style={{ padding: "0 8px 4px", }}>
                        <Input placeholder="Enter New District" ref={inputRef} value={newDistrict} onChange={(e) => setNewDistrict(e.target.value)} />
                        <Button type="text" icon={<PlusOutlined />} onClick={add_new_district}></Button>
                      </Space>
                    </>
                  )}
                    options={districtoption}
                  />
                </div>
              </div>

              {/* Select City Dropdown ************************* */}

              <div className="group">
                <label>Select City</label>
                <div className="main_loc">
                  <Select value={survery.city} onChange={(e) => setSurvery({ ...survery, city: e })} style={{ width: 300 }} placeholder="City" dropdownRender={(menu) => (
                    <>
                      {menu}
                      <Divider style={{ margin: "8px 0" }} />
                      <Space style={{ padding: "0 8px 4px", }}>
                        <Input placeholder="Enter City" ref={cityInput} value={newCity} onChange={(e) => setNewCity(e.target.value)} />
                        <Button type="text" icon={<PlusOutlined />} onClick={add_new_city}></Button>
                      </Space>
                    </>
                  )}
                    options={cityoption}
                  />
                </div>
              </div>

              {/* Select Types Dropdown ************************* */}

              <div className="group">
                <label>Types</label>
                <div className="main_loc">
                  <Select value={survery.type} defaultValue="Types" style={{ width: 120, }} onChange={(e) => setSurvery({ ...survery, type: e })} options={typeoption} />
                </div>
              </div>
            </div>

            <div className="checks">
              <Radio.Group onChange={radio_check} value={value}>
                <Radio value={0}>Process A Folder</Radio>
                <Radio value={1}>Process A Single File</Radio>
              </Radio.Group>
            </div>

          </div>

          : progres === 50 ?

            <div className="main_step">

              <div className="upload_group">

                <div className="video_text">
                  <div className="step_1_title">Choose your Video</div>
                  <div className="sub_title">If you are already a member you can login with your email and password.</div>

                </div>

                <div className="upload_btn_group">
                  <input style={{ display: value == 1 ? 'flex' : 'none' }} className="upload_btn" onChange={(e) => setuploadfile(e.target.files)} type="file" />
                  <input style={{ display: value == 0 ? 'flex' : 'none' }} className="upload_btn" directory="" webkitdirectory="" onChange={(e) => setuploadfile(e.target.files)} type="file" />
                  <button style={{ border: 'none', cursor: uploadfile == null ? 'not-allowed' : 'pointer' }} className="true_btn" disabled={uploadfile == null ? true : false} onClick={pusharray}>Upload</button>
                </div>
              </div>

              <div className="video_table">
                <div className="table-wrapper">
                  <table className="fl-table">
                    <thead>
                      <tr>
                        <th>Id</th>
                        <th>Name</th>
                        <th>Path</th>
                        <th>Start To End </th>


                      </tr>
                    </thead>
                    <tbody>
                      {survery.videos.length > 0 && survery.videos.map((item, index) => {
                        return (
                          <tr key={index}>
                            <td>{index + 1}</td>
                            <td>{item.title}</td>
                            <td>{item.path}</td>
                            <td>
                              <TimePicker.RangePicker
                                className="date_pick"
                                showTime={{
                                  format: 'HH:mm',
                                }}
                                format="HH:mm"
                                onChange={(e) => onRange_date_Change({ date: e, index: index })}
                              />
                            </td>


                          </tr>
                        )
                      })}
                    </tbody>

                  </table>
                </div>

              </div>


            </div>


            : progres === 75 ?

              <div className="main_step">


                <div className="step_1_title">Create a Scenario</div>
                <div className="sub_title">If you are already a member you can login with your email and password.</div>


                {


                  survery.screenshot === null ?
                    <div className="fetch_screen">
                      <div className="scenario_temp">
                        <Empty description={'Currently there is no screenshot click the button below to get screenshot !'} />
                      </div>
                      <button style={{ border: 'none', width: '120px' }} className="next_btn">
                        Get Screenshot
                      </button>

                    </div>
                    :
                    <div className="after_screen">
                      <div className="scenario">


                        <DrawPointsOnScaleImage
                          dye={survery.screenshot ? survery.screenshot : ""}
                          map={survery.screenshot ? survery.screenshot : ""}
                          setLinkedSection={''}
                          setPoints={(output) => setRegionPoints(output)}
                          flag={false}
                          points={regionPoints}
                          sections={survery.regions.length > 0 ? survery.regions : []}
                          setSection_id={(event) => (event)}
                          component={'floor'}
                          sectionId={""}
                          deleteCamSection={''}
                          cursor={'pointer'}
                        />


                        <div className="show_region">
                          <div className="table-wrapper">
                            <table className="fl-table">
                              <thead>
                                <tr>
                                  <th>Id</th>
                                  <th>Name</th>
                                  <th>Delete</th>
                                </tr>
                              </thead>
                              <tbody>
                                {survery.regions.map((item, index) => {
                                  return (
                                    <tr key={index}>
                                      <td>{index + 1}</td>
                                      <td>{item.title}</td>
                                      <td><AiFillDelete className="del" onClick={() => setRegionChunk({ item: item, index: index })} /></td>
                                    </tr>
                                  )
                                })}
                              </tbody>

                            </table>
                          </div>


                          {regionDeleteFlag && currentRegion !== undefined && currentRegion >= 0 && <DeleteModal
                            modal={regionDeleteFlag}
                            setModal={(output) => setRegionDeleteFlag(output)}
                            delete={(event) => handleDeleteRegion(currentRegion)}
                          />}



                        </div>

                      </div>
                      <button style={{ border: 'none', width: '120px' }} className="next_btn" onClick={showModal}>
                        Draw Regions
                      </button>
                      <Modal centered open={isModalOpen} onCancel={handleCancel}>
                        <div className="modal_scenario">

                          <DrawPointsOnScaleImage
                            dye={survery.screenshot ? survery.screenshot : ""}
                            map={survery.screenshot ? survery.screenshot : ""}
                            setLinkedSection={''}
                            setPoints={(output) => setRegionPoints(output)}
                            flag={true}
                            points={regionPoints}
                            sections={survery.regions.length > 0 ? survery.regions : []}
                            setSection_id={(event) => (event)}
                            component={'floor'}
                            sectionId={""}
                            deleteCamSection={''}
                            cursor={'crosshair'}

                          />
                        </div>
                        <Row>
                          <Col md={12}>
                            <div className="d-flex" >
                              <div className="input_group">
                                <input style={{ width: '300px' }} name='Region_Label' id="Region_Label" onChange={(e) => setRegionName(e.target.value)} type='text' className="region_label" value={regionName} />
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', marginTop: '20px', marginLeft: "20px" }} className="add_more_label">
                                <button onClick={save_region} style={{ marginTop: 'unset', border: 'none' }} className="next_btn" >Save </button>
                              </div>
                              <div style={{ marginLeft: 'auto' }}>
                                <FaUndoAlt style={{ border: 'none', marginTop: '20px' }} className="sum_icon" cursor={'pointer'} onClick={() => undoPoints()} />
                                {/* <button style={{ border: 'none', marginTop: '20px' }} className="next_btn" onClick={() => undoPoints()}>Undo</button> */}
                              </div>
                            </div>
                          </Col>
                        </Row>

                        <Row className="mt-3">
                          <Col>
                            <div style={{ display: 'flex', justifyContent: 'flex-end' }} className="btn_sec">
                              <button onClick={handleCancel} style={{ marginTop: 'unset' }} className="go_back">Cancel</button>
                              <button onClick={handleOk} style={{ marginTop: 'unset', border: 'none' }} className="next_btn">Done</button>
                            </div>
                          </Col>
                        </Row>
                      </Modal>
                    </div>
                }
              </div>

              : progres === 100 ?

                <div className="main_step">
                  <div className="step_1_title">Create a Scenario</div>
                  <div className="sub_title">If you are already a member you can login with your email and password.</div>

                  <div className="scenario">
                    <DrawPointsOnScaleImage
                      dye={survery.screenshot ? survery.screenshot : ""}
                      map={survery.screenshot ? survery.screenshot : ""}
                      setLinkedSection={''}
                      setPoints={(output) => setRegionPoints(output)}
                      flag={false}
                      points={regionPoints}
                      sections={survery.regions.length > 0 ? survery.regions : []}
                      setSection_id={(event) => (event)}
                      component={'floor'}
                      sectionId={""}
                      deleteCamSection={''}
                    />
                  </div>

                  <div className="main_direction">

                    <div className="group">
                      <label>Direction Label</label>
                      <input onChange={(e) => setDirection(e.target.value)} type="text" className="label_input" value={directionTitle} />
                    </div>

                    <div className="group">
                      <label>Start Point</label>
                      <div className="main_loc">
                        <Select defaultValue="Point A" style={{ width: 120, }} onChange={(e) => setStartDirection(e)} options={directionOptions.filter((item) => { return item.value !== endDirection })} />
                      </div>
                    </div>

                    <BsArrowRight style={{ color: '#2D7BF2' }} />

                    <div className="group">
                      <label>End Point</label>
                      <div className="main_loc">
                        <Select defaultValue="Point B" style={{ width: 120, }} onChange={(e) => setEndDirection(e)} options={directionOptions.filter((item) => { return item.value !== startDirection })} />
                      </div>
                    </div>

                    <button onClick={map_direction} style={{ border: 'none', marginTop: 'unset' }} className="next_btn">Save</button>

                  </div>

                  <div className="main_direction_map">
                    {survery.directions.map((e, index) => {
                      return (
                        <>
                          <div className="direction_content">

                            <div className="direction">
                              {e.title}
                            </div>
                            <div className="direction">
                              {e.startLabel}
                            </div>
                            <BsArrowRight style={{ color: '#2D7BF2' }} />
                            <div className="direction">
                              {e.endLabel}
                            </div>
                            <div className="direction">
                              {survery.type}
                            </div>

                            <div onClick={() => setDirectionChunk({ index: index, item: e })} className="delete_direction">
                              Delete
                            </div>

                          </div>
                        </>

                      )
                    })}
                    {directionDeleteFlag && currentDirection !== undefined && currentDirection >= 0 && <DeleteModal
                      modal={directionDeleteFlag}
                      setModal={(output) => setDirectionDeleteFlag(output)}
                      delete={(event) => handleDeleteDirection(currentDirection)}
                    />}

                  </div>

                </div>

                : ''

        }
        <div className="btn_sec">
          <button className="go_back" style={{ display: progres === 25 ? 'none' : 'flex' }} onClick={() => prev()}>Previous</button>
          <button style={{ border: 'none' }} className="next_btn" type="primary" onClick={() => next()}>{progres === 100 ? 'Done' : 'Next'}</button>
        </div>

      </div>
    </div>
  );
}
export default Survey;
