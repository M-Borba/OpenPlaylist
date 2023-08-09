import { useRef, useEffect,useState, MutableRefObject } from 'react';
import '@mediapipe/face_mesh';
import '@tensorflow/tfjs-core';
// Register WebGL backend.
import '@tensorflow/tfjs-backend-webgl';
import * as faceLandmarksDetection from '@tensorflow-models/face-landmarks-detection';
import './GameCamComponent.css'


type WebcamState = 'notStarted' | 'settingUp' | 'setUpDone';

interface Point {
  x: number;
  y: number; 
}
interface Food extends Point {
  char?:string;
}

const junkFoodList=['🍔','🍕','🍟']
// const healthyFoods = ['🍎','🥦','🥕']
// const specialFood = ['🌶️']

interface BoundingBox {
  xymin: Point;
  xymax: Point;
}

const gameVelocity = 500;

function checkCollision(box1: BoundingBox, box2: BoundingBox): boolean {
  const horizontalCollision = box1.xymin.x <= box2.xymax.x && box1.xymax.x >= box2.xymin.x;
  const verticalCollision = box1.xymin.y <= box2.xymax.y && box1.xymax.y >= box2.xymin.y;
  const collision2d = horizontalCollision && verticalCollision
  return collision2d;
}

function distance(a: Food, b: Food): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx ** 2 + dy ** 2); //euclideanDist
}

interface GameState{ 
  junkFood:any[]
  healthyFood:any[]
  showLandMarks:boolean
  playing:boolean
}

interface GameScore { 
  junkEaten:number
  healthyEaten:number
  junkOnFloor:number
  healthyOnFloor:number
}

function randomIntFromInterval(min: number, max: number) { // min and max included 
  return Math.floor(Math.random() * (max - min + 1) + min)
}

const GameCamComponent = () =>  {
  const videoRef= useRef<any>();
  const canvasRef = useRef<any>();

  const [modelSetup, setModelSetup] = useState<WebcamState>('notStarted');
  const [gameScore, setGameScore] = useState<GameScore>({junkEaten:0,healthyEaten:0,junkOnFloor:0, healthyOnFloor:0});

  // const [showMetadata, setShowMetadata] = useState<boolean>(true);

  const [isMouthOpen, setIsMouthOpen] = useState(false);
  const detectionInterval =  useRef<any>();
  const gameState = useRef<GameState>({healthyFood:[],junkFood:[],showLandMarks:false,playing:false});
  // const [junkFood, setJunkFood]:any = useState([]);
  // const [healthyFood, setHealthyFood]:any = useState([]);


  // const [gamePlaying, setGamePlaying] = useState<boolean>(false);
  const detector:any = useRef<any>();


  // const checkIfMouthOpen = (mouthLandmarks: any) =>{
  //   console.log(mouthLandmarks)
  //   setIsMouthOpen(true)// todo change
  //   return false
  // }

  const addRandomJunkFood = () =>{
    const canvas:any = canvasRef.current;
    const rndX = randomIntFromInterval(10, canvas.width-10);
    const rndY = randomIntFromInterval(0, 10);
    gameState.current.junkFood.push({x: rndX, y: rndY, char: junkFoodList[randomIntFromInterval(0, junkFoodList.length - 1)]});

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
  const drawAndUpdateFoods = (lipRight:Point,lipLeft:Point,lipTop:Point,lipBottom:Point,mouthOpen:boolean) => {   // todo take a picture of player when eating and show it at the end

    const canvas:any = canvasRef.current;
    const contex = canvas.getContext("2d");

    gameState.current.junkFood.forEach((food:Food)=>{
      contex.font = '50px serif'
      contex.fillText(food.char, food.x , food.y)

      // contex.beginPath();
      // contex.arc(food.x, food.y-50, 5, 0, 2 * Math.PI); 
      // contex.fill();


      // contex.beginPath();
      // contex.arc(food.x+50, food.y, 5, 0, 2 * Math.PI); 
      
      // contex.fill();
      contex.strokeStyle = 'green';
      contex.lineWidth = 2;
      contex.beginPath();
      contex.rect(food.x, food.y, 50, 50);
      contex.stroke();

      food.y=food.y+10
      
    })

    //clear food that already fell away
    //        {xymin:{x:lipRight.x , y:lipTop.y}, xymax:{x:lipLeft.x , y:lipBottom.y}}, // lips
    const filteredJunkFood=   gameState.current.junkFood.filter((food: Food) => {
      const collidesWithLips = checkCollision(
        { xymin: { x: lipRight.x, y: lipTop.y }, xymax: { x: lipLeft.x, y: lipBottom.y } }, // lips
        { xymin: { x: food.x , y: food.y - 50 }, xymax: { x: food.x + 50 , y: food.y  } } // food
      );

      const eatingFood = collidesWithLips && mouthOpen
      const foodOutOfBounds =food.y + 5 > canvas.height

      if (foodOutOfBounds){
        setGameScore((prevState:GameScore) => ({...prevState,junkOnFloor: prevState.junkOnFloor+1}))
        return false;
      }
      if (eatingFood) { 
        setGameScore((prevState:GameScore) => ({...prevState,junkEaten: prevState.junkEaten+1}))
        return false;
      } 
      
      return true; // no event happened
      
    })

    gameState.current.junkFood = filteredJunkFood


    const filteredHealtyFood = gameState.current.healthyFood.filter((food:Food)=>food.y+10 < canvas.height)
    gameState.current.healthyFood = filteredHealtyFood
    
    // clearInterval(detectionInterval.current)
    // const newInterval = setInterval(()=>gameLoop(), gameVelocity); // 1000 ms = 1 second
    // detectionInterval.current = newInterval;
  }

  const gameLoop = () => {
        // Perform the facial landmark detection
          if (detector.current?.estimateFaces) detector.current.estimateFaces(videoRef.current).then((result: any) => {
            const canvas:any = canvasRef.current;
            const canvasContext = canvas.getContext('2d');
          if(result[0]){             
            // if(showMetadata){
              const faceBox = result[0].box // consider only first face detected
              canvasContext.clearRect(0, 0, canvas.width, canvas.height);
              canvasContext.strokeStyle = 'red';
              canvasContext.lineWidth = 2;
              canvasContext.beginPath();
              canvasContext.rect(faceBox.xMin, faceBox.yMin, faceBox.width, faceBox.height);
              canvasContext.stroke();

              const lipTop = result[0].keypoints[0]
              const lipBottom = result[0].keypoints[17]
              const lipRight = result[0].keypoints[61]
              const lipLeft = result[0].keypoints[409] // Had to take a big look to know the indexes i wanted, couldn't found documentation for it
              const faceWidth = faceBox.width
              // const lips = result[0].keypoints.filter((keypoint:any,index:number) =>keypoint?.name == 'lips') 
              // see all lip positions
              // canvasContext.beginPath();
              // lips.forEach((lipPos: { x: any; y: any; }) =>{
              //   canvasContext.arc(lipPos.x, lipPos.y, 3, 0, 2 * Math.PI);
              // });
              // canvasContext.stroke();

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
            // } metadata
              const horizontalLine = distance(lipRight,lipLeft)
              const verticalLine = distance(lipTop,lipBottom)

              const xyRatio =  verticalLine/horizontalLine
              const mouthFaceRatio = horizontalLine / faceWidth;
              const mouthOpen = xyRatio > 0.45 && mouthFaceRatio > 0.34  ? true : false
              // these ratios are made with my own face, it might work a little bit off with other faces, but for the most part it works
              // console.log('xyRatio:',xyRatio > 0.45,"mouthFaceRatio", mouthFaceRatio > 0.32,mouthFaceRatio )
            setIsMouthOpen(mouthOpen)
            drawAndUpdateFoods(lipRight,lipLeft,lipTop,lipBottom,mouthOpen)
          }else {
            const canvasContext = canvas.getContext('2d');
            canvasContext.clearRect(0, 0, canvas.width, canvas.height);
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
    <p>  {isMouthOpen ? 'Mouth is open': 'Mouth is closed'} </p> 
    <p>  Score: {gameScore.junkEaten} junk food eaten, {gameScore.junkOnFloor} fell on the floor  </p> 

    <button onClick={()=>addRandomJunkFood()}>Play ▶</button>
    {/* <button onClick={()=>setShowMetadata(!showMetadata)}> { showMetadata ? 'Hide Metadata':'Show Metadata' } </button> */}
    </div>
  );
};

export default GameCamComponent;



function newJunkFoodList(newJunkFoodList: any) {
  throw new Error('Function not implemented.');
}

