import React, { useState } from 'react'
import { Progress } from 'antd';



const Progress_ex = () => {

const [progres, setProgress]=useState(25)

const next=()=>{

setProgress(progres+25)

}

  return (
    <div>
    <Progress percent={progres} />

{progres===25?

'Hello':progres===50? 'you' :progres===75? 'and' :progres===100? 'love':''

}

<button onClick={next}>Next</button>


    
    </div>
  )
}

export default Progress_ex
