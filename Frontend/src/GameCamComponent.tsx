import { useRef, useEffect,useState } from 'react';
import '@mediapipe/face_mesh';
import '@tensorflow/tfjs-core';
// Register WebGL backend.
import '@tensorflow/tfjs-backend-webgl';
import * as faceLandmarksDetection from '@tensorflow-models/face-landmarks-detection';
import './GameCamComponent.css'


 


type WebcamState = 'notStarted' | 'settingUp' | 'setUpDone';

const GameCamComponent = () =>  {

  const videoRef= useRef<any>();
  const canvasRef = useRef<any>();
  const [detector,setDetector] = useState<any>(null);

  const [webcamSetup, setWebcamSetup] = useState<WebcamState>('notStarted');

  // const [isMouthOpen, setIsMouthOpen] = useState(false);
  const [detectionInterval, setDetectionInterval]:any = useState(null);

  console.log("videoRef   ",videoRef.current)


  // const checkIfMouthOpen = (mouthLandmarks: any) =>{
  //   console.log(mouthLandmarks)
  //   setIsMouthOpen(true)// todo change
  //   return false
  // }
  const startGameLoop = () => {
    

  }

  useEffect(() => {
    // Function to access the user's webcam and render the feed in the video element
    let mediaStream: MediaStream;

     const setupWebcam = async () => {
      try {
        mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play();
        setWebcamSetup('setUpDone')
        const model:any = faceLandmarksDetection.SupportedModels.MediaPipeFaceMesh;
        const detectorConfig:any = {
        runtime: 'mediapipe', // or 'tfjs'
        solutionPath: 'https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh',
        }
        setDetector(await faceLandmarksDetection.createDetector(model, detectorConfig));


      } catch (error) {
        console.error('Error accessing webcam:', error);
      }
    };

    // Check if webcam setup is done before calling setupWebcam
    if (webcamSetup=='notStarted') {
      setWebcamSetup('settingUp')
      setupWebcam();
    }
    
    if (webcamSetup=='setUpDone') {
    const interval = setInterval(() => {
      // Perform the facial landmark detection
      detector.estimateFaces(videoRef.current).then((result: any) => {
        console.log("result",result)
        if(result[0]){ 
          // Draw bounding box
          const video = videoRef.current;
          const canvas:any = canvasRef.current;
          const ctx = canvas.getContext('2d');

          // Set canvas size to match the video size
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          
          // Draw the box on the canvas
          const faceBox = result[0].box // consider only first face detected
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.strokeStyle = 'red';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.rect(faceBox.xMin, faceBox.yMin, faceBox.width, faceBox.height);
          ctx.stroke();
        }else {
          console.log("face not detected")
        }

      });
    }, 500); // 1000 ms = 1 second

    setDetectionInterval(interval);
    }else{
      console.log('Webcam setup not done')
    }


     return () => {
        if (mediaStream instanceof MediaStream) {
          mediaStream.getTracks().forEach((track) => track.stop());
        }
        clearInterval(detectionInterval);

      };
   
  }, [webcamSetup]);

  return (
    <div>
      <h2>Eat all you can challenge</h2>
          <div className="game-container">
            <video ref={videoRef} width="640" height="480" className="video" />
            <canvas ref={canvasRef} width="640" height="480" className="canvas" />
          </div>
    {/* <p>  {isMouthOpen ? 'Mouth is open': 'Mouth is closed'} </p>  */}
    <button onClick={startGameLoop}>Play ▶</button>
    </div>
  );
};

export default GameCamComponent;
