
import { useRef, useState, useEffect } from 'react';


import './Mborba.css'
import GameCamComponent from './GameCamComponent';



function MBorba() {


  return (
    <div>
      <h1>Martín Borba </h1>
      <div className="card">
          System Analist

        <p className="light-text">
         Advanced student of computer engineering and also fullstack developer really interested in AI, my thesis is about object detection, here is a game demo
        </p>
      </div>
      <GameCamComponent /> 
      
    

    </div>
  )
}

export default MBorba

function isMouthOpen(mouthLandmarks: any) {
  console.log(mouthLandmarks)
  return false
}

