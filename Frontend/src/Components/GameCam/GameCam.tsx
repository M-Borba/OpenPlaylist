import { useRef, useEffect,useState } from 'react';
import '@mediapipe/face_mesh';
import '@tensorflow/tfjs-core';
// Register WebGL backend.
import '@tensorflow/tfjs-backend-webgl';
import * as faceLandmarksDetection from '@tensorflow-models/face-landmarks-detection';
import './GameCam.css'
import { WebcamState, GameScore, GameState, Point, Food, checkCollision, distance, drawFood } from './gameCamUtils';




const junkFoodList=['🍔','🍕','🍟']
// const healthyFoods = ['🍎','🥦','🥕']
// const specialFood = ['🌶️']

const gameVelocity = 200;
const foodWidth =50
const gameTime= 40000
const initialGameState={healthyFood:[],junkFood:[],showLandMarks:false,time:-1,capturedImage:""};
const initialGameScore = {junkEaten:0,healthyEaten:0,junkOnFloor:0, healthyOnFloor:0}


function randomIntFromInterval(min: number, max: number) { // min and max included 
  return Math.floor(Math.random() * (max - min + 1) + min)
}

const GameCamComponent = () =>  {
  
  const videoRef= useRef<any>();
  const canvasRef = useRef<any>();
  const [modelSetup, setModelSetup] = useState<WebcamState>('notStarted');
  const [gameScore, setGameScore] = useState<GameScore>(initialGameScore);
  const [isMouthOpen, setIsMouthOpen] = useState(false);
  const detectionInterval =  useRef<any>();
  // im using ref here because the game is rendered with a setInterval which makes a closure and does not update react states
  const gameState = useRef<GameState>(initialGameState);
  const detector:any = useRef<any>();

  const addRandomJunkFood = () =>{
    const canvas:any = canvasRef.current;
    const rndX = randomIntFromInterval(10, canvas.width-10);
    const rndY = randomIntFromInterval(0, 10);
    gameState.current.junkFood.push({x: rndX, y: rndY, char: junkFoodList[randomIntFromInterval(0, junkFoodList.length - 1)]});
  }


  const startGame = () =>{
    if(gameState.current.time==-1){
      setGameScore(initialGameScore)
      gameState.current=initialGameState;
      gameState.current.time=0;
    }
  }
  
  // const addRandomHealthyFood = () =>{
  //   const canvas:any = canvasRef.current;
  //   const rndX = randomIntFromInterval(10, canvas.width-10)
  //   const rndY = randomIntFromInterval(0, 10)
  //   const newHealtyList = [...healthyFood, {x:rndX,y:rndY}]
  //   setHealthyFood(newHealtyList);
  //   clearInterval(detectionInterval.current);
  //   const newInterval = setInterval(()=>gameLoop(detector,junkFood), gameVelocity); // 1000 ms = 1 second
  //   detectionInterval.current = newInterval;
  // }
  const drawAndUpdateFoods = (lipRight:Point,lipLeft:Point,lipTop:Point,lipBottom:Point,mouthOpen:boolean) => {  

    const canvas:any = canvasRef.current;
    const context = canvas.getContext("2d");

    gameState.current.junkFood.forEach((food:Food)=>{
     drawFood(food,foodWidth,context,gameState.current.showLandMarks)
    })

    //clear food that already fell away
    const filteredJunkFood = gameState.current.junkFood.filter((food: Food) => {
      const collidesWithLips = checkCollision(
        { xymin: { x: lipRight.x, y: lipTop.y }, xymax: { x: lipLeft.x, y: lipBottom.y } }, // lips
        { xymin: { x: food.x , y: food.y - foodWidth }, xymax: { x: food.x + foodWidth , y: food.y  } } // food
      );

      const eatingFood = collidesWithLips && mouthOpen
      const foodOutOfBounds =food.y + 5 > canvas.height

      if (foodOutOfBounds){
        setGameScore((prevState:GameScore) => ({...prevState,junkOnFloor: prevState.junkOnFloor+1}))
        return false;
      }
      if (eatingFood) { 
        //take a picture of player when eating food after half game
        if(!gameState.current.capturedImage && 3*gameState.current.time > (gameTime/gameVelocity)){ 
          const video = videoRef.current;
          context.drawImage(video, 0, 0, canvas.width, canvas.height);
          const imageDataURL = canvas.toDataURL('image/png');
          gameState.current.capturedImage = imageDataURL;
        }
        setGameScore((prevState:GameScore) => ({...prevState,junkEaten: prevState.junkEaten+1}))
        return false;
      } 
      
      return true; // no event happened
      
    })

    gameState.current.junkFood = filteredJunkFood


    const filteredHealtyFood = gameState.current.healthyFood.filter((food:Food)=>food.y+10 < canvas.height)
    gameState.current.healthyFood = filteredHealtyFood
    
  }

  const gameLoop = () => {
        const canvas:any = canvasRef.current;
        const canvasContext = canvas.getContext('2d');

        if(gameState.current.time>(gameTime/gameVelocity) || gameState.current.time==-1){ //30 seconds have passed
          gameState.current.time=-1
          canvasContext.clearRect(0, 0, canvas.width, canvas.height); //clean previous frame
          setGameScore(initialGameScore)
          gameState.current=initialGameState;
          return
        }else gameState.current.time++
        if(gameState.current.time % (2000/gameVelocity) === 0){
          addRandomJunkFood()
        }else

    

        // Perform the facial landmark detection
          if (detector.current?.estimateFaces) detector.current.estimateFaces(videoRef.current).then((result: any) => {
            canvasContext.clearRect(0, 0, canvas.width, canvas.height); //clean previous frame

          if(result[0]){             
              const faceBox = result[0].box // consider only first face detected
              const lipTop = result[0].keypoints[0]
              const lipBottom = result[0].keypoints[17]
              const lipRight = result[0].keypoints[61]
              const lipLeft = result[0].keypoints[409] // Had to take a big look to know the indexes i wanted, couldn't found documentation for it
              const faceWidth = faceBox.width

            if(gameState.current.showLandMarks){
              canvasContext.strokeStyle = 'blue';
              canvasContext.lineWidth = 2;
              canvasContext.beginPath();
              canvasContext.rect(faceBox.xMin, faceBox.yMin, faceBox.width, faceBox.height);
              canvasContext.stroke();
              
              canvasContext.beginPath();
              canvasContext.arc(lipTop.x, lipTop.y, 3, 0, 2 * Math.PI); // top
              canvasContext.fill();

              canvasContext.arc(lipBottom.x, lipBottom.y, 3, 0, 2 * Math.PI); // bottom
              canvasContext.fill();

              canvasContext.beginPath();
              canvasContext.arc(lipRight.x, lipRight.y, 3, 0, 2 * Math.PI);// right
              canvasContext.fill();

              canvasContext.beginPath();
              canvasContext.arc(lipLeft.x, lipLeft.y, 3, 0, 2 * Math.PI); // left
              canvasContext.fill();

              canvasContext.beginPath()
              canvasContext.globalAlpha = 0.5
              canvasContext.fillStyle ='#FF0000'
              canvasContext.lineTo(lipTop.x, lipTop.y );
              canvasContext.lineTo(lipRight.x, lipRight.y);
              canvasContext.lineTo(lipBottom.x, lipBottom.y );
              canvasContext.lineTo(lipLeft.x, lipLeft.y);
              canvasContext.fill();
              canvasContext.globalAlpha = 1
            }
              const horizontalLine = distance(lipRight,lipLeft)
              const verticalLine = distance(lipTop,lipBottom)

              const xyRatio =  verticalLine/horizontalLine
              const mouthFaceRatio = horizontalLine / faceWidth;
              // these ratios are made with my own face, it might work a little bit off with other faces, but for the most part it works fine
              const mouthOpen = xyRatio > 0.45 && mouthFaceRatio > 0.34  ? true : false
            setIsMouthOpen(mouthOpen)
            drawAndUpdateFoods(lipRight,lipLeft,lipTop,lipBottom,mouthOpen)
        
          }else {
            const nullPoint={x:0,y:0}
            drawAndUpdateFoods(nullPoint,nullPoint,nullPoint,nullPoint,false); // no mouth detected
          }
          
        });
      }

  

  useEffect(() => {

    // Function to access the user's webcam and render the feed in the video element
    let mediaStream: MediaStream;

     const setupWebcam = async () => {
      try {
        mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
        videoRef.current.srcObject = mediaStream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play().catch((error: any) => {
            console.error('Error playing video:', error);
          });
        };
        const model:any = faceLandmarksDetection.SupportedModels.MediaPipeFaceMesh;
        const detectorConfig:any = {
        runtime: 'tfjs', // or 'tfjs'
        solutionPath: 'https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh',
        }
        await faceLandmarksDetection.createDetector(model, detectorConfig).then((det:any)=>{
          detector.current=det
        })
        setModelSetup('setUpDone')
  
        const interval = setInterval(()=>gameLoop(), gameVelocity); // 1000 ms = 1 second
        detectionInterval.current = interval;

      } catch (error) {
        console.error('Error accessing webcam:', error);
      }
    };

    // Check if webcam setup is done before calling setupWebcam
    if (modelSetup=='notStarted') {
      setModelSetup('settingUp')
      setupWebcam();
    }
    

     return () => {
        if (mediaStream instanceof MediaStream) {
          mediaStream.getTracks().forEach((track) => track.stop());
        }
        clearInterval(detectionInterval.current);

      };
   
  }, []);


  return (
    <div className="game-container">
      <h2>🍔 🍕 🍟 😋 Picky eater game 🤮 🍎 🥦 🥕</h2>
          {modelSetup !== 'setUpDone' &&  (
          <>
            <div className="loader"/>
            <p>Loading model</p>
          </>
          )}
          <div className="display-container">
            <video ref={videoRef} width="640" height="480" className="video" />
            <canvas ref={canvasRef} width="640" height="480" className="canvas" />
          </div>
    <h2>  {isMouthOpen ? '😮' : '😐' } </h2> 
    <p>  Score: {gameScore.junkEaten} junk food eaten, {gameScore.junkOnFloor} fell on the floor  </p> 

    <button onClick={startGame}>Play ▶</button>
    <button onClick={()=>{gameState.current.showLandMarks = !gameState.current.showLandMarks}}>
       { gameState.current.showLandMarks ? 'Hide LandMarks':'Show LandMarks' }
       {gameState.current.capturedImage && gameState.current.time==-1 && 
       <div className="fixed-center">
        <div className="photograph">
        <img src={gameState.current.capturedImage} alt="Captured image" />
          <b>Seems like you had fun !</b>
        </div>
       </div>
       }
       
    </button>
    </div>
  );
};

export default GameCamComponent;


