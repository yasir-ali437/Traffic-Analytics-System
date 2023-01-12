import React, { useEffect } from "react";
import { Fragment } from "react";
import {
  Col,
  Dropdown,
  DropdownMenu,
  ListGroup,
  ListGroupItem,
  Row,
  Button,
  DropdownToggle,
} from "reactstrap";
import "react-modern-calendar-datepicker/lib/DatePicker.css";
import { Calendar } from "react-modern-calendar-datepicker";
import { useLocalStorage } from "../customHooks/useLocalStorage";
import { colors } from "../helpers/meta";
import { useState } from "react";
import moment from "moment";
import { Filter } from "react-feather";
import {
  convertObjectIntoArray,
  createDateFilters,
  getCameraObject,
  getDateObject,
} from "../helpers/utils";
import { useDispatch, useSelector } from "react-redux";
import { getAllSettings } from "../helpers/requests";






const MainFilter = ({ pageTitle = "Summary", updateFilter }) => {
  const dispatch = useDispatch();
  const [dateSelection, setDateSelection] = useState("yesterday");
  const [showFilters, setShowFilters] = useState(false);
  const allSettings = useSelector((state) => state.settings.allSettings);
  const [selectedCam, setSelectedCam] = useLocalStorage(
    "selectedCam",
    undefined
  );
  const [selectedRegion, setSelectedRegion] = useLocalStorage(
    "selectedRegion",
    {}
  );
  const [selectType, setSelectType] = useState("day");
  const [selectAll, setSelectAll] = useState(true);

  const [updateState, setUpdate] = useState(false);

  console.log("selectedCam", selectedCam, selectedRegion);

  const defaultDate = {
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
    day: new Date().getDate() - 1,
  };

  const [selectedDayRange, setSelectedDayRange] = useLocalStorage(
    "selectedDayRange",
    {
      from: defaultDate,
      to: defaultDate,
    }
  );

  const [options, setOptions] = useState(allSettings);
  const [option, setOption] = useState(allSettings);
  console.log("console for setings", allSettings);

  const selectDateFilter = (key) => {
    setDateSelection(key);
    let date = dates[key];
    setSelectedDayRange({ from: date.from, to: date.to });
  };
  var randomstring = Math.random()
    .toString(36)
    .slice(-9);

  const selectCamera = (item) => {
    let _selectedCam = { ...selectedCam };
    let _currentCam = options.filter((cam) => {
      return cam.id === item.id;
    });
    let _selectedRegion = { ...selectedRegion };

    if (item.id in _selectedCam) {
      if (
        _currentCam.length > 0 &&
        typeof _currentCam[0].setting.regions !== undefined &&
        _currentCam[0].setting.regions &&
        _currentCam[0].setting.regions.length > 0
      ) {
        _currentCam[0].setting.regions.forEach((item) => {
          delete _selectedRegion[item.id];
        });
        setSelectedRegion(_selectedRegion);
      }
      delete _selectedCam[item.id];
      setSelectedCam(_selectedCam);
    } else {
      if (
        _currentCam.length > 0 &&
        typeof _currentCam[0].setting.regions !== undefined &&
        _currentCam[0].setting.regions &&
        _currentCam[0].setting.regions.length > 0
      ) {
        let firstRegion = {};
        let region = _currentCam[0].setting.regions[0].id;
        firstRegion[region] = region;

        let newRegions = { ..._selectedRegion, ...firstRegion };
        setSelectedRegion(newRegions);
      }
      let newSelectedCam = { ..._selectedCam, ...{ [item.id]: item.id } };
      setSelectedCam(newSelectedCam);
    }
    setSelectAll(false);
  };

  const selectRegion = ({ region, camera }) => {
    let _selectedRegion = { ...selectedRegion };
    let _currentCam = camera;
    if ("id" in region && region.id in _selectedRegion) {
      delete _selectedRegion[region.id];
      let found = false;

      let _currentCamRegions = camera.setting.regions;
      if (
        typeof _currentCamRegions !== undefined &&
        _currentCamRegions &&
        _currentCamRegions.length > 0
      ) {
        for (let i = 0; i < _currentCamRegions.length; i++) {
          if (_currentCamRegions[i].id in _selectedRegion) {
            found = true;
            break;
          }
        }
      }
      if (!found) {
        let _selectedCam = { ...selectedCam };
        delete _selectedCam[camera.id];
        setSelectedCam(_selectedCam);
      }

      setSelectedRegion(_selectedRegion);
    } else {
      let newSelectedRegion = {
        ..._selectedRegion,
        ...{ [region.id]: region.id },
      };
      setSelectedRegion(newSelectedRegion);
    }
  };

  const menu = options.length > 0 && options.map((camera, index) => {
    return (
      <ListGroupItem
        key={"dates-" + index}
        className="white"
        style={{ color: "none" }}
        tag="a"
        href="#"
      >
        <>
          <div
            style={{
              cursor: "pointer",
              borderTop: "none",
              borderLeft: "none",
              borderRight: "none",
              backgroundColor: "",
            }}
            className={
              typeof selectedCam !== undefined &&
              selectedCam &&
              camera.id in selectedCam
                ? "storeItemActive p-2 cityItem"
                : "p-2"
            }
            onClick={() => selectCamera(camera)}
          >
            <span>{camera.label}</span>
          </div>
          {typeof selectedCam !== undefined &&
            selectedCam &&
            typeof camera !== undefined &&
            camera &&
            camera.id in selectedCam &&
            "setting" in camera &&
            typeof camera.setting !== undefined &&
            camera.setting &&
            "regions" in camera.setting &&
            typeof camera.setting.regions !== undefined &&
            camera.setting.regions.length > 0 &&
            camera.setting.regions.map((region, index1) => {
              return (
                <div className={"px-3 my-2 "} style={{ cursor: "pointer" }}>
                  <div
                    className={
                      typeof selectedRegion !== undefined &&
                      selectedRegion &&
                      typeof region !== undefined &&
                      region &&
                      "id" in region &&
                      region.id in selectedRegion
                        ? "storeItemActive p-2"
                        : "storeItem p-2"
                    }
                    onClick={(e) => {
                      selectRegion({ region: region, camera: camera });
                    }}
                  >
                    {region.label}
                  </div>
                </div>
              );
            })}
        </>
      </ListGroupItem>
    );
  });

  const dates = createDateFilters();
  const datesMenu = Object.keys(dates).map((key) => {
    return (
      <ListGroupItem
        key={"dates-" + key}
        className={dateSelection == key ? "active" : ""}
        tag="a"
        href="#"
        onClick={() => selectDateFilter(key)}
      >
        {dates[key].label}
      </ListGroupItem>
    );
  });

  const getStartDate = (date) => {
    if (date !== undefined && date) {
      let _start = moment(
        new Date(date.year, date.month - 1, date.day)
      ).startOf("day");
      return _start;
    }
  };

  const getEndDate = (date) => {
    if (date !== undefined && date) {
      let _start = moment(new Date(date.year, date.month - 1, date.day))
        .endOf("day")
        .format("YYYY-MM-DD HH:MM:00");
      return _start;
    }

    let _end = moment(
      new Date(
        selectedDayRange.to.year,
        selectedDayRange.to.month - 1,
        selectedDayRange.to.day
      )
    )
      .endOf("day")
      .format("YYYY-MM-DD HH:MM:00");
  };

  var dateTyes = [
    { value: "min", label: "By minutes", _id: 1 },
    { value: "hour", label: "By hourly", _id: 2 },
    { value: "day", label: "Daily", _id: 3 },
    { value: "month", label: "Monthly", _id: 4 },
    { value: "year", label: "Yearly", _id: 5 },
  ];

  const datesType = dateTyes.map((val) => {
    return (
      <ListGroupItem
        key={"dates-" + val._id}
        className={selectType == val.value ? "active" : ""}
        tag="a"
        href="#"
        onClick={() => setSelectType(val.value)}
      >
        {val.label}
      </ListGroupItem>
    );
  });

  const setSelectedDayRangeFromCalendar = (obj) => {
    setSelectedDayRange(obj);
    setDateSelection("");
  };

  const selectAllCam = () => {
    setSelectAll(true);
    setSelectedCam({});
    setSelectedRegion({});
  };

  const updateFilterForOnlyCalendar = async () => {
    let start = await getStartDate(selectedDayRange.from);
    let end = await getEndDate(selectedDayRange.to);
    let cids = [];
    let rids = [];

    if (selectAll) {
      let getAllObject = await getCameraObject(options);
      cids = getAllObject.cids;
      rids = getAllObject.rids;
    } else {
      cids = await convertObjectIntoArray(selectedCam);
      rids = await convertObjectIntoArray(selectedRegion);
    }

    var filter = {
      start: start,
      end: end,
      camera: cids,
      regions: rids,
      type: selectType,
    };
    updateFilter(filter);
    setShowFilters(false);
  };

  const toggle = () => {
    setShowFilters(!showFilters);
  };

  useEffect(async () => {
    if (typeof allSettings !== undefined && allSettings) {
      console.log("fdgsfdgfdsgsdfgsfdgsfdg");
      let _options = JSON.stringify(allSettings);
      await updateStates(allSettings);
      setOptions(JSON.parse(_options));
    }
  }, [allSettings]);

  const updateStates = async (allSettings) => {
    if (typeof allSettings !== undefined && allSettings && !selectAll) {
      let _selectedCam = {};
      let _selectedRegion = {};
      if (allSettings.length > 0 && "id" in allSettings[0]) {
        _selectedCam[allSettings[0].id] = allSettings[0].id;
        if (
          "setting" in allSettings[0] &&
          allSettings[0].setting &&
          "regions" in allSettings[0].setting &&
          allSettings[0].setting.regions.length > 0
        ) {
          let firstRegion = allSettings[0].setting.regions[0];
          if (
            typeof firstRegion !== undefined &&
            firstRegion &&
            "id" in firstRegion
          ) {
            _selectedRegion[firstRegion.id] = firstRegion.id;
          }
        }
      }

      await setSelectedCam(_selectedCam);
      await setSelectedRegion(_selectedRegion);

      return true;
    } else {
      return false;
    }
  };

  useEffect(async () => {
    await getAllSettings({ dispatch });
  }, []);

  useEffect(() => {
    if (options.length) {
      if (
        Object.keys(selectedCam ? selectedCam : {}).length > 0 &&
        Object.keys(selectedRegion ? selectedRegion : {}).length > 0
      ) {
        updateFilterForOnlyCalendar();
      }
    }
  }, [options]);

  return (
    <div>
      <Row className="mb-4 mt-1">
        <Col sm={2} style={{ backgroundColor: "" }} className="p-2 mt-2">
          <h4 className="m-0 p-0"> {pageTitle} </h4>
        </Col>
        <Col className="text-end" md={10}>
          <Row>
            <Col md={10}></Col>
            <Col md={2} className="p-2">
              <Dropdown
                id="filter"
                style={{
                  width: "fit-content",
                  float: "right",
                  whiteSpace: "nowrap",
                }}
                isOpen={showFilters}
                toggle={toggle}
                direction="down"
              >
                <DropdownToggle
                  nav
                  className="text-dark"
                  style={{ cursor: "pointer" }}
                >
                  <Filter size="16" /> Filters
                </DropdownToggle>

                <DropdownMenu
                  id="main"
                  style={{
                    minWidth: "550px",
                    padding: "0px",
                    maxWidth: "1100px",
                    width: "1100px",
                    maxHeight: "515px",
                    marginTop: "5px",
                  }}
                >
                  <div
                    style={{ paddingLeft: "0.75rem", paddingRight: "0.75rem" }}
                  >
                    <Row>
                      <Fragment>
                        <Col
                          md={3}
                          className="  pt-3 border-start border-end border-bottom border-1"
                        >
                          <div className="">
                            <h4 className="filter-heading">Cameras</h4>
                            <div
                              className="scrollbar "
                              id="style-3"
                              style={{ width: "100%" }}
                            >
                              <ListGroup flush>
                                <ListGroupItem
                                  className={selectAll ? "active" : ""}
                                  tag="a"
                                  href="#"
                                  onClick={(e) => selectAllCam()}
                                >
                                  All Cameras
                                </ListGroupItem>
                                {menu}
                              </ListGroup>
                            </div>
                          </div>
                        </Col>

                        <Col
                          md={3}
                          className="  pt-3 border-start border-end border-bottom border-1 "
                        >
                          <div className="">
                            <h4 className="filter-heading">Date Filters</h4>
                            <div
                              className="scrollbar "
                              id="style-3"
                              style={{ width: "100%" }}
                            >
                              <ListGroup flush>{datesMenu}</ListGroup>
                            </div>
                          </div>
                        </Col>
                        <Col
                          md={3}
                          className="  pt-3 border-start border-end border-bottom border-1 "
                        >
                          <h4 className="filter-heading">Select Granularity</h4>

                          <ListGroup flush>{datesType}</ListGroup>
                        </Col>

                        <Col md={3} className="border-bottom border-1">
                          <Calendar
                            calendarClassName="pt-0 Calendar"
                            value={selectedDayRange}
                            onChange={setSelectedDayRangeFromCalendar}
                            colorPrimary={colors.primary}
                            colorPrimaryLight={colors.active}
                            maximumDate={getDateObject(moment(new Date()))}
                          />
                        </Col>
                      </Fragment>
                    </Row>
                    <Row>
                      <Col md={4}></Col>
                      <Col md={6} className="text-end p-3 py-4">
                        {
                          <>
                            {!(
                              Object.keys(selectedCam ? selectedCam : {})
                                .length > 0
                            ) &&
                              !(
                                Object.keys(
                                  selectedRegion ? selectedRegion : {}
                                ).length > 0 || selectAll
                              ) && (
                                <span>
                                  Please select atleast one camera and one
                                  region{" "}
                                </span>
                              )}
                            {/* {!selectedFeature && (Object.keys(sidForInsights ? sidForInsights : {}).length > 0) && <span>Please select at least one feature</span>} */}
                            {/* {!(Object.keys(sidForInsights ? sidForInsights : {}).length) && selectedFeature && <span>Please select one store </span>} */}
                          </>
                        }
                      </Col>

                      <Col md={2} className="text-end p-3">
                        {
                          <Button
                            disabled={
                              !(
                                Object.keys(selectedCam ? selectedCam : {})
                                  .length > 0
                              ) &&
                              !(
                                Object.keys(
                                  selectedRegion ? selectedRegion : {}
                                ).length > 0 || selectAll
                              )
                            }
                            color="primary"
                            className="w-100"
                            onClick={() => updateFilterForOnlyCalendar()}
                          >
                            Apply
                          </Button>
                        }
                      </Col>
                    </Row>
                  </div>
                </DropdownMenu>
              </Dropdown>
            </Col>
          </Row>
        </Col>
      </Row>
    </div>
  );
};

export default MainFilter;
