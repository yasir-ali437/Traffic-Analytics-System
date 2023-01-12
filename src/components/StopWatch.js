import React, { Fragment, useEffect, useState } from "react";

var timeHandler = null;
const StopWatch = () => {
    const [time, setTime] = useState(0);
    const [current, setCurrent] = useState("");
    const init = () => {
        setTime(0);
        setCurrent("start");
    }
    const pause = () => {
        setCurrent("pause");
    }
    const resume = () => {
        setCurrent("resume");
    }
    const stop = () => {
        setCurrent("resume");
    }

    const increaseTime = () => {
        setTime(time + 1);
    }

    useEffect(()=>{
        if(current == "start" || current == "resume"){
            timeHandler = setInterval(increaseTime, 1000)
        }else{
            clearInterval(timeHandler);
        }
    }, [current])

    return (
        <Fragment>
            <div>{time}</div>
            <button onClick={()=>init()}>Init</button>
            <button onClick={()=> pause()}>Pause</button>
            <button onClick={() => resume()}>Resume</button>
            <button onClick={() => stop()}>Stop</button>
        </Fragment>
    )
}

export default StopWatch;