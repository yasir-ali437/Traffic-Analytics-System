import React, { Fragment, useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import {
  Button,
  Card,
  CardBody,
  Col,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Row,
} from "reactstrap";
import { baseUrl } from "../helpers/auth";
import { getPreview } from "../helpers/requests";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import * as config from '../config.json';
import { graphColors, regionsColor } from "../helpers/meta";
const Preview = ({ settings, isQueue }) => {
  console.log('settingssettings',settings);
  const imgRef = useRef(null);
  const [imgStatus, setImgStatus] = useState({
    ready: false,
    width: 0,
    height: 0,
    tWidth: 0,
    tHeight: 0,
    target: false,
  });
  console.log('imgStatus',imgStatus);
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState(false);
  const [scale, setScale] = useState(1);
  const toggle = async () => {
    setModal(!modal);
  };
  // const placeholderUrl = "https://api.adlytic.ai/uploads/client/1656417284543lexmark-region.jpg";
  // const placeholderUrl = "https://devapi.adlytic.ai/uploads/client/1656501933957queue-lexmark.jpg";
  // const placeholderUrl = "https://devapi.adlytic.ai/uploads/client/1656501810613lexmark-intrusion.jpg";
  // const placeholderUrl = "https://devapi.adlytic.ai/uploads/client/1656591602736Lexmark-heatmap.jpg";

  const placeholderUrl = config.placeholderImage;
  let urll = baseUrl + settings.url;
  console.log('urllurll',urll);

  const fetchPreview = async () => {
    setLoading(true);
    setModal(!modal);
    toggle();
    const res = await getPreview({ params: settings, dispatch });
    toast(res.message);
    setLoading(false);
  };

  useEffect(() => {
    if (settings.url && settings.url.length) {

      let img = new Image();
      img.onload = () => {

        setImgStatus({
          ...imgStatus,
          ready: true,
          width: img.width,
          height: img.height,
        });
        if (imgStatus.tWidth > 0) {
          setScale(imgStatus.tWidth / img.width);
        }
      };
      img.src = baseUrl + settings.url;
    } else {
      let img = new Image();
      img.onload = () => {

        setImgStatus({
          ...imgStatus,
          ready: true,
          width: img.width,
          height: img.height,
        });
        if (imgStatus.tWidth > 0) {
          setScale(imgStatus.tWidth / img.width);
        }
      };
      img.src = baseUrl + settings.placeholder;
    }
  }, [settings]);

  useEffect(() => {
    if (imgRef.current && imgStatus.ready) {
      var _imgStatus = {
        ...imgStatus,
        tWidth: imgRef.current.width,
        tHeight: imgRef.current.height,
        target: true,
      };
      setImgStatus(_imgStatus);
      if (imgStatus.width > 0) {
        setScale(imgRef.current.width / imgStatus.width);
      }
    }
  }, [imgRef.current, imgStatus.ready, settings]);


  return (
    <Fragment>
      <div>
        <ToastContainer />
      </div>
      <Row>
        <Col sm={12} md={12} lg={12}>
          <div className="text-center pb-3">
            {/* {!settings.url && !settings.stream && (
              <h6 className="pb-4">
                No camera preview available. Fetch one now.
              </h6>
            )} */}
            {/* {!settings.stream && (
              <h6 className="pb-4">Please provide a stream URL first.</h6>
            )} */}
            {/* <Loader show={loading} text="Loading..."/> */}
            <Button
              className="btn-primary w-100 radius-8"
              onClick={() => toggle()}
              disabled={loading || !settings.stream}
            >
              {loading ? "Loading..." : "Fetch Preview"}
            </Button>
            <Modal isOpen={modal} toggle={() => toggle()}>
              <ModalHeader toggle={() => toggle()}>Confirmation</ModalHeader>
              <ModalBody>
                Fetching preview will reset your unsaved changes e.g. any line
                or region.
              </ModalBody>
              <ModalFooter>
                <Button
                  className="btn-outline radius-8"
                  onClick={() => fetchPreview()}
                >
                  Continue
                </Button>{" "}
                <Button
                  className="btn-primary radius-8"
                  onClick={() => toggle()}
                >
                  Close
                </Button>
              </ModalFooter>
            </Modal>
          </div>
        </Col>
        <Col sm={12} md={12} lg={12}>
          <Card className="w-100">
            <CardBody className="d-flex justify-content-center">
              {settings.url &&
                settings.url.length > 0 &&
                settings.type === "regions" &&
                isQueue === false && (
                  <svg
                    width={imgStatus.tWidth}
                    height={imgStatus.tHeight}
                    style={{ position: "absolute" }}
                  >
                    {settings.regions.map((section, ind) => {
                      var points = "";
                      var xCords = [];
                      var yCords = [];
                      section.roi.forEach((point, index) => {
                        if (index > 0) {
                          points +=
                            " " +
                            // point.x * this.state.scale +
                            point.x * scale +

                            "," +
                            point.y * scale;
                        } else {
                          points +=
                            point.x * scale +
                            "," +
                            point.y * scale;
                        }
                        xCords.push(point.x);
                        yCords.push(point.y);
                      });


                      return (
                        <Fragment key={"section_" + ind}>
                          <polygon
                            style={{
                              fill: regionsColor[ind],
                              opacity: "0.64"
                            }}
                            className={"it"}
                            points={points}
                            id={"Popover-" + section._id}
                          />
                        </Fragment>
                      );
                    })}
                    <polygon
                      points={settings.entry.reduce((p, c) => {
                        return p + c.x * scale + "," + c.y * scale + " ";
                      }, "")}
                      style={{
                        stroke: "#00FF00",
                        fill: "#00FF00",
                        fillOpacity: 0.4,
                        strokeOpacity: 0.4,
                        strokeWidth: "1",
                      }}
                    />
                    <polygon
                      points={settings.exit.reduce((p, c) => {
                        return p + c.x * scale + "," + c.y * scale + " ";
                      }, "")}
                      style={{
                        stroke: "#FF0000",
                        fill: "#FF0000",
                        fillOpacity: 0.4,
                        strokeOpacity: 0.4,
                        strokeWidth: 1,
                      }}
                    />
                  </svg>
                )}
              {settings.url &&
                settings.url.length > 0 &&
                settings.type === "regions" &&
                isQueue === true && (
                  <svg
                    width={imgStatus.tWidth}
                    height={imgStatus.tHeight}
                    style={{ position: "absolute" }}
                  >
                    {Object.keys(settings.queue).map((key, ind) => {
                      return (
                        <polygon
                          points={settings.queue[key].reduce((p, c) => {
                            return p + c.x * scale + "," + c.y * scale + " ";
                          }, "")}
                          style={{
                            stroke: "#00FF00",
                            fill: "#00FF00",
                            fillOpacity: 0.4,
                            strokeOpacity: 0.4,
                            strokeWidth: "1",
                          }}
                        />
                      );
                    })}
                  </svg>
                )}
              {settings.url ? (
                <img
                  ref={imgRef}
                  src={baseUrl + settings.url}
                  className="radius-8"
                  alt=""
                />
              ) : (

                <img
                  ref={imgRef}
                  src={placeholderUrl}
                  className="radius-8"
                  alt=""
                />
              )}
            </CardBody>
          </Card>
        </Col>
      </Row>
    </Fragment>
  );
};

export default Preview;
