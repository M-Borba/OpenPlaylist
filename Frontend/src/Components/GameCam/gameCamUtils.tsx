

export type WebcamState = 'notStarted' | 'settingUp' | 'setUpDone';

export interface Point {
  x: number;
  y: number; 
}
export interface Food extends Point {
  char?:string;
}


export interface BoundingBox {
  xymin: Point;
  xymax: Point;
}


export function drawFood(food:Food,foodWidth:number,canvasContext:any,showLandMarks:boolean){
      canvasContext.font = `${foodWidth}px serif`
      canvasContext.fillText(food.char, food.x , food.y)
      if(showLandMarks){
        canvasContext.strokeStyle = 'green';
        canvasContext.lineWidth = 2;
        canvasContext.beginPath();
        canvasContext.rect(food.x, food.y-foodWidth, foodWidth, foodWidth);
        canvasContext.stroke();
      }
      // update food position which is "falling" 
      food.y=food.y+10

}


export function checkCollision(box1: BoundingBox, box2: BoundingBox): boolean {
  const horizontalCollision = box1.xymin.x <= box2.xymax.x && box1.xymax.x >= box2.xymin.x;
  const verticalCollision = box1.xymin.y <= box2.xymax.y && box1.xymax.y >= box2.xymin.y;
  const collision2d = horizontalCollision && verticalCollision
  return collision2d;
}

export function distance(a: Food, b: Food): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx ** 2 + dy ** 2);
}

export interface GameState { 
  junkFood:any[]
  healthyFood:any[]
  showLandMarks:boolean
  time:number
  capturedImage:string
}

export interface GameScore { 
  junkEaten:number
  healthyEaten:number
  junkOnFloor:number
  healthyOnFloor:number
}

export function randomIntFromInterval(min: number, max: number) { // min and max included 
  return Math.floor(Math.random() * (max - min + 1) + min)
}
