import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Button, Card, CardBody, Col, Row, Table } from "reactstrap";
import ReactPaginate from "react-paginate";
import moment from "moment";
import not_survey from '../assets/img/not.png'
import { Progress } from 'reactstrap';

import { ToastContainer, toast } from 'react-toastify';

import './Summary.css'
import {
  deleteMetaDataRequest,
  fetchsurvey,
  getAllSettings,
  getDetailRequest,
  getFootfall,
  getFootfallData,
  getSurveyRequest,
  surveyDeleteRequest,
  updateSurveryRequest
} from "../helpers/requests";
import { Link } from "react-router-dom";
import { SiMicrosoftexcel } from 'react-icons/si';
import { FiDelete, FiEdit } from 'react-icons/fi';
import DeleteModal from "../components/DeleteModal";
import RecordsModal from "../components/RecordsModal";

const Summary = () => {

  const [fetchSurvey, setFetchSurvey] = useState([])
  const [deleteJob, setDeleteFlag] = useState(false);
  const [askModal, setAskModal] = useState(false);
  const [currentJob, setCurrentJob] = useState()
  const dispatch = useDispatch();

  const deleteSurvey = async (item) => {
    let obj = {
      job_id: item.id,
    }
    let res = await surveyDeleteRequest(obj);
    if (res.status) {
      toast.success(`Deleted Successfully`, {
        position: toast.POSITION.TOP_CENTER,
        autoClose: true,
      })

      let surveryList = await fetchsurvey();
      if (surveryList.status) {
        setFetchSurvey(surveryList.data)
      }
      else {
        setFetchSurvey([])
      }
    }
    else {
      toast.error("An error occurred", {
        position: toast.POSITION.TOP_CENTER,
        autoClose: true,
      })
    }
  }

  const setJobChunk = ({ item, action }) => {
    setCurrentJob(item)
    if (action === 'delete') {
      setDeleteFlag(true)
    }
    else if (action === 'ask') {
      setAskModal(true)
    }
  }


  const updateSurvey = async ({ item, jobStart }) => {

    let status = jobStart === 0 ? 3 : 1;

    let res = await updateSurveryRequest({ job_id: item.id, jobStart, status });
    if (res.status === 200) {
      if (res.data.status) {
        toast.success(`Job has been ${jobStart === 0 ? 'stopped' : 'started'}`, {
          position: toast.POSITION.TOP_CENTER,
          autoClose: true,
        })
      }
      const fetch_survey = await fetchsurvey();
      if (fetch_survey.status) {
        setFetchSurvey(fetch_survey.data)
      }
      else {
        setFetchSurvey([])
      }
    }
  }

  const removeMetadata = async (item) => {

    let res = await deleteMetaDataRequest({ job_id: item.id });
    if (res.status) {
      updateSurvey({ item: item, jobStart: 0 })
    }
  }


  useEffect(async () => {
    const fetch_survey = await fetchsurvey();
    console.log('fetch_survey', fetch_survey);
    if (fetch_survey.status) {
      setFetchSurvey(fetch_survey.data)

    }
    else {
      setFetchSurvey([])
    }



  }, [1])


  return (
    <>

      <ToastContainer />


      <Col className="summary_main" md={12}>
        {
          fetchSurvey.length === 0 ?
            <div className="summary_content" style={{ marginTop: '50px' }}>
              <img src={not_survey} />
              <div className="summary_title">No survey has been created yet</div>
              <div className="summary_note">It’s easy to create one</div>
              <Link to='/survey' style={{ textDecoration: 'none' }}  >
                <button className="summary_btn"><span className="summary_plus">+</span> Create Survey </button>
              </Link>

            </div>
            :
            <div className="main_detail">
              <div className="survey_topbar">
                <div className="survey_text">
                  <div className="survey_heading">Survey</div>
                  <div className="survey_basic_heading">If you are already a member you can login with your email and password.</div>
                </div>
                <Link to='/survey' style={{ textDecoration: 'none' }}  >
                  <button className="summary_btn"><span className="summary_plus">+</span> Create Survey </button>
                </Link>
              </div>


              <Table style={{ marginTop: '50px' }} hover>
                <thead>
                  <tr>
                    <th>Sr No.</th>
                    <th>Label</th>
                    <th>Date</th>
                    <th>Location</th>
                    <th>Type</th>
                    {/* <th>Status</th> */}
                    <th>Progress</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {fetchSurvey.length > 0 && fetchSurvey.map((e, index) => {

                    console.log('eeee', e);
                    return (
                      <>
                        <tr>
                          <th scope="row">{index + 1}</th>
                          <td>{e.title}</td>
                          <td>{e.survey_date}</td>
                          <td>{e.location}</td>
                          <td>{e.type}</td>
                          {/* <td><span style={{ background: '#D4F8D3', padding: '3px 10px' }}>{e.status}</span></td> */}
                          <td><Progress value={e.progress}>{e.progress + "%"}</Progress></td>
                          <td>
                            <span style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                              <Link to={'/detail/' + e.id}>
                                <abbr title="Details" style={{ cursor: 'pointer' }}>
                                  <SiMicrosoftexcel className="sum_icon" />
                                </abbr>
                              </Link>
                              <abbr title="Edit" style={{ cursor: 'pointer' }}>
                                <FiEdit className="sum_icon" />
                              </abbr>
                              <abbr title="Delete" style={{ cursor: 'pointer' }}>
                                <FiDelete className="sum_icon" onClick={() => setJobChunk({ item: e, action: 'delete' })} />
                              </abbr>
                              <Button disabled={e.jobStart === 1 || e.status ===2 || e.status === 3 || e.status === 4} className="btn btn-primary" onClick={() => updateSurvey({ jobStart: 1, item: e })}>Start</Button>
                              <Button disabled={e.jobStart === 0 || e.status ===2 || e.status === 3 || e.status === 4} className="btn btn-secondary" onClick={() => setJobChunk({ item: e, action: 'ask' })}>Stop</Button>
                              {e.status === 2 && <span  style={{color : '#00C425'}} className="primary"><em>Completed!</em></span>}
                              {e.status === 3 && <span style={{color : '#f34446'}}  className="danger"><em>Stopped!</em></span>}
                              {e.status === 4 && <span style={{color : '#f34446'}}  className="danger"><em>Error!</em></span>}


                            </span>
                          </td>
                        </tr>
                      </>
                    )
                  })}
                </tbody>
              </Table>
            </div>
        }

        {deleteJob && currentJob !== undefined && currentJob && <DeleteModal
          modal={deleteJob}
          setModal={(output) => setDeleteFlag(output)}
          delete={(event) => deleteSurvey(currentJob)}
        />}
        {askModal && currentJob !== undefined && currentJob && <RecordsModal
          modal={askModal}
          setModal={(output) => setAskModal(output)}
          notDelete={(event) => updateSurvey({ item: currentJob, jobStart: 0 })}
          delete={(event) => removeMetadata(currentJob)}
        />}

      </Col>


    </>
  );
};

export default Summary;
