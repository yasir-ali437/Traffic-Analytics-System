import React, { Fragment, useEffect, useRef, useState } from "react";
import {
  Button,
  Col,
  Input,
  Label,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Row,
} from "reactstrap";
import { baseUrl } from "../helpers/auth";
var img;
var ctx;
const DrawROIs = (props) => {
  const ref = useRef(null);
  const canvasRef = useRef(null);
  const [imgData, setImgData] = useState({
    width: 0,
    height: 0,
    showCanvas: false,
  });
  var oldPoints = props.points;
  const [points, setPoints] = useState([]);
  const [label, setLabel] = useState()
  var radius = 10;
  const [count, setCount] = useState(0);
  const [firstClick, setFirstClick] = useState(false);
  const [modal, setModal] = useState(false);

  const save = () => {
    if (props.type === "line") {
      if (points.length < 2) {
        alert("A line must have atleast two points.");
        return;
      }
    } else {
      if (points.length < 4) {
        alert("An " + props.type + " region must have atleast four points.");
        return;
      }
    }
    props.save({ type: props.type, data: points });
  };

  const canvasClick = (event) => {
    var _points = points.slice();
    if (props.type === "line") {
      _points[count % 2] = { x: event.offsetX, y: event.offsetY };
      setCount(count + 1);
    } else {
      _points.push({ x: event.offsetX, y: event.offsetY });
    }
    paintCanvas(_points);
    setPoints(_points);
  };

  const paintCanvas = (_points, old = false) => {
    try {
      ctx.lineWidth = 5;
      if (props.type === "exit") {
        ctx.strokeStyle = "#FF0000";
        ctx.fillStyle = "#FF0000";
      } else {
        ctx.strokeStyle = "#00FF00";
        ctx.fillStyle = "#00FF00";
      }
      ctx.clearRect(0, 0, imgData.width, imgData.height);
      ctx.drawImage(img, 0, 0);
      _points.forEach((val, index) => {
        ctx.fillRect(val.x - radius / 2, val.y - radius / 2, radius, radius);
        if (_points.length > 1) {
          if (index === 0) {
            ctx.beginPath();
            ctx.moveTo(val.x, val.y);
          } else {
            ctx.lineTo(val.x, val.y);
          }
          if (index === _points.length - 1 && _points.length > 1) {
            ctx.stroke();
          }
        }
      });

      if (props.type === "entry" || props.type === "line") {
        ctx.strokeStyle = "#FF0000";
        ctx.fillStyle = "#FF0000";
      } else {
        ctx.strokeStyle = "#00FF00";
        ctx.fillStyle = "#00FF00";
      }
      oldPoints.forEach((val, index) => {
        ctx.fillRect(val.x - radius / 2, val.y - radius / 2, radius, radius);
        if (index === 0) {
          ctx.beginPath();
          ctx.moveTo(val.x, val.y);
        } else {
          ctx.lineTo(val.x, val.y);
        }
        if (index === oldPoints.length - 1 && oldPoints.length > 1) {
          ctx.stroke();
        }
      });
    } catch (e) {
      console.log(e);
    }
  };

  const undoPoints = () => {
    var _points = points.slice();
    _points.pop();
    paintCanvas(_points);
    setPoints(_points);
  };

  useEffect(() => {
    img = new Image();
    img.onload = () => {
      setImgData({ width: img.width, height: img.height, showCanvas: true });
    };
    img.src = baseUrl + props.url;
  }, [props.url]);

  console.log('imgData', imgData, props.url);

  useEffect(() => {
    if (canvasRef.current) {
      try {
        ctx = canvasRef.current.getContext("2d");
        if (!firstClick) {
          ctx.drawImage(img, 0, 0);
          paintCanvas(oldPoints, true);
          setFirstClick(true);
        }
      } catch (e) {
        console.log(e);
      }
    }
  }, [canvasRef.current, imgData.showCanvas]);

  const toggle = () => {
    setModal(!modal);
    console.log("hei");
  };


  return (
    <Fragment>
      <div ref={ref} className="">
        <div id="canvas" style={{ paddingTop: "56px", paddingBottom: "56px" }}>
          {imgData.showCanvas && (
            <canvas
              ref={canvasRef}
              width={imgData.width}
              height={imgData.height}
              onClick={(e) => canvasClick(e.nativeEvent)}
            />
          )}
        </div>

      
        <div
          style={{
            position: "fixed",
            top: "0px",
            left: "0px",
            width: "100vw",
            padding: "10px",
            background: "rgba(255,255,255, 0.8)",
          }}
        >
          <Row>
            <Col></Col>
            <Col>
              <div className="text-right" style={{ textAlign: "right" }}>
                <Button
                  color="warning"
                  // onClick={() => toggle()}
                  className="btn-sm btn-outline radius-8"
                  disabled
                >
                  Help
                </Button>
                <Button
                  color="warning"
                  onClick={() => undoPoints()}
                  className="mx-2 btn-sm btn-outline radius-8"
                >
                  Undo
                </Button>
                <Button
                  color="outline-danger"
                  onClick={() => props.close()}
                  className="btn-sm radius-8"
                >
                  Close
                </Button>
                <Button
                  color="dark"
                  onClick={() => save()}
                  className="mx-2 btn-sm btn-primary radius-8"
                >
                  Save Points
                </Button>
              </div>
            </Col>
          </Row>
        </div>
      </div>

      <Row>
        <Col>
          <Button
            color="warning"
            onClick={() => undoPoints()}
            className="mx-2 btn-sm btn-outline radius-8"
          >
            Undo
          </Button>
        </Col>
      </Row>
      <Row>
        <Col>
          <Label>Label</Label>
          <Input type="String" value={label} onChange={(e) => setLabel(e.target.value)}></Input>
        </Col>
      </Row>
      <Modal isOpen={modal} toggle={() => toggle()} style={{ zIndex: '10000000' }}>
        <ModalHeader toggle={() => toggle()}>Confirmation</ModalHeader>
        <ModalBody>
          Are you sure you want to reset the current settings to default?
          This action will change the values to default and cannot be
          reversed.
        </ModalBody>
        <ModalFooter>
          <Button
            className="btn-primary radius-8"
          // onClick={() => resetSettings()}
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
    </Fragment>
  );
};

export default DrawROIs;
