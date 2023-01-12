import React, { Fragment, useEffect, useRef, useState } from 'react';
import { Button, Col, Row } from 'reactstrap';
import { baseUrl } from '../helpers/auth';
var img;
var canvas;
var ctx;
const DrawQueueROIs = (props) => {
    console.log(props);
    const ref = useRef(null);
    const canvasRef = useRef(null);
    const [imgData, setImgData] = useState({width: 0, height: 0, showCanvas: false});
    const oldPoints = (props.points["queue"+props.type]);
    const [points, setPoints] = useState([]);
    const radius= 10;
    const [count, setCount] = useState(0);
    const [firstClick, setFirstClick] = useState(false);

    const save = () => {
        if(props.type === "line"){
            if(points.length<2){
                alert("A line must have atleast two points.");
                return;
            }
        }else{
            if(points.length<4){
                alert("An "+props.type+" region must have atleast four points.");
                return;
            }
        }
        var _queue = props.points;
        _queue[props.type] = points;
        props.save({type: "queue", data: _queue});
    }

    const canvasClick = (event) => {
        var _points = points.slice();
        console.log(event);
        if(props.type === "line"){
            _points[count%2] = {x: event.offsetX, y: event.offsetY};
            setCount(count + 1);
        }else{
            _points.push({x: event.offsetX, y: event.offsetY});
        }
        paintCanvas(_points, props.type);
        setPoints(_points);
    }

    const paintCanvas = (_points, old=false) => {
        try{
            ctx.lineWidth = 5;
            ctx.strokeStyle= "#00FF00";
            ctx.fillStyle= "#00FF00";
            ctx.clearRect(0, 0, imgData.width, imgData.height);
            ctx.drawImage(img, 0, 0);
            _points.forEach((val, index) => {
                ctx.fillRect(val.x-radius/2, val.y-radius/2, radius, radius);
                if(_points.length > 1){
                    if(index === 0){
                        ctx.beginPath();
                        ctx.moveTo(val.x, val.y);
                    }else{
                        ctx.lineTo(val.x, val.y);
                    }
                    if(index === _points.length-1 && _points.length > 1){
                        ctx.stroke();
                    }
                }
            });

            ctx.strokeStyle= "#FF0000";
            ctx.fillStyle= "#FF0000";
            
            Object.keys(props.points).forEach((key, ind) => {
                var p = props.points[key];
                if(p.length > 0){
                    p.forEach((val, index) => {
                        ctx.fillRect(val.x-radius/2, val.y-radius/2, radius, radius);
                        if(index === 0){
                            ctx.beginPath();
                            ctx.moveTo(val.x, val.y);
                        }else{
                            ctx.lineTo(val.x, val.y);
                        }
                        if(index === p.length-1 && p.length > 1){
                            ctx.stroke();
                        }
                    });
                }
            })
            
        }catch(e){
            console.log(e);
        }
    }

    const undoPoints = () => {
        var _points = points.slice();
        _points.pop();
        paintCanvas(_points);
        setPoints(_points);
    }

    useEffect(()=>{
        img = new Image();
        img.onload = () => {
            setImgData({width: img.width, height: img.height, showCanvas: true});
            console.log({width: img.width, height: img.height, showCanvas: true});
        }
        img.src = baseUrl + props.url;
    }, [props.url]);

    // useEffect(() => {
      
    // }, [])
    
    // useEffect(() => {
    //     setDivData({width: ref.current.offsetWidth, height: ref.current.offsetHeight});
    // }, [ref.current]);

    
    useEffect(() => {
        console.log(canvasRef.current, imgData.showCanvas);
        if(canvasRef.current){
            try{
                ctx = canvasRef.current.getContext("2d");
                if(!firstClick){
                    console.log("Repaint useEffect", count);
                    ctx.drawImage(img, 0, 0);
                    paintCanvas(oldPoints, true);
                    setFirstClick(true);
                }
            }catch(e){
                console.log(e);
            }
        }
    }, [canvasRef.current, imgData.showCanvas, oldPoints]);

    return (
        <Fragment>
            <div ref={ref} className='full-screen'>
                <div id="canvas" style={{paddingTop: "56px", paddingBottom: "56px"}}>
                    {/* {canvas} */}
                    {
                        imgData.showCanvas && 
                        <canvas ref={canvasRef} width={imgData.width} height={imgData.height} onClick={(e)=> canvasClick(e.nativeEvent)}/>
                    }
                </div>
                <div style={{position: "fixed", top: "0px", left: "0px", width: "100vw", padding: "10px", background: "rgba(255,255,255, 0.8)"}}>
                    <Row>
                        <Col>
                            
                        </Col>
                        <Col>
                            <div className='text-right' style={{textAlign: "right"}}>
                                <Button color="warning" onClick={()=>undoPoints()} className='btn-sm btn-outline radius-8'>Undo</Button>
                                <Button color="outline-danger" onClick={()=>props.close()} className='mx-2 btn-sm radius-8'>Close</Button>
                                <Button color="dark" onClick={()=>save()} className='btn-sm btn-primary radius-8'>Save Points</Button>
                            </div>
                        </Col>
                    </Row>
                </div>
                
            </div>
        </Fragment>
    );
}

export default DrawQueueROIs;