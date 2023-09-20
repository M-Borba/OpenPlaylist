

import './MBorba.css'
import GameCamComponent from '../../Components/GameCam/GameCam.tsx';


function MBorba() {
  return (
    <div>
      <h1>Martín Borba </h1>
      <div className="card">
          System Analist

        <p>
         Advanced computer engineering student and also Fullstack developer with a strong interest in AI, my thesis is about object detection.  
        </p>
        <p className="light-text">
          Here is a simple game demo implemented using pre-trained 
           <a href="https://github.com/tensorflow/tfjs-models/blob/master/face-landmarks-detection/README.md"> face mesh model</a> from tensorflow.js, eat as much as you can under 30 seconds! 
        </p>
        <p className="light-text">Open your mouth to eat the falling food, and always face the camera forward for better detection</p>
      </div>
      <GameCamComponent /> 
    </div>
  )
}

export default MBorba



