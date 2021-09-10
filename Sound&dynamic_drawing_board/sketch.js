////////////////////////////////////////////
//变量定义区域
////////////////////////////////////////////
//互动的物理基础部分
let VerletPhysics2D = toxi.physics2d.VerletPhysics2D,
    VerletParticle2D = toxi.physics2d.VerletParticle2D,
    AttractionBehavior = toxi.physics2d.behaviors.AttractionBehavior,
    GravityBehavior = toxi.physics2d.behaviors.GravityBehavior,
    Vec2D = toxi.geom.Vec2D,
    Rect = toxi.geom.Rect;
let NUM_PARTICLES = 10;
let physics;
let mouseAttractor;
let mousePos;
let headAttractor;
let headPos;
let leftSAttractor;
let leftPos;
let rightSAttractor;
let rightPos;
let leftHAttractor;
let leftHPos;
let rightHAttractor;
let rightHPos;
//table系列，将画布上objects[]中的全部元素储存在table中
let table;
let tableload;
//画布尺寸
var WIDTH =1920 ;
var HEIGHT =960 ;
//缩放参数
var w_Scaling_factor;
var h_Scaling_factor;
//视频与人像识别
let video;
let poseNet;
let poses = [];
let skeletons = [];
let textures = [];
let pPositions = [];
let cPositions = [];
let xs = [];
let easing = 0.1;
let pX=WIDTH/2, pY = HEIGHT/2;
let offset=2000;
//音频
let mic;
let vol;
//画板部分
var objects = [];
var buttons = [];
var eraserRange = 20;
var timerRange = 50;
var brushType = "CIRCLE";
var pbrushType = "CIRCLE";
var isPlaying = true;
var isMenuHide = false;
var recogFlag = false;
var count = 0;
var badge;
var showPalette;
var voiceControl = false;
var backgroundLock =false;
var FPS = 60;
var time = 0;
var R = 200;
var G = 150;
var B = 50;
var bR = 0;
var bG = 0;
var bB = 50;
//画笔参数
var wind=10;
var isWindR=false;
var isWindL=false;


////////////////////////////////////////////
//三大类定义区域
////////////////////////////////////////////
/////////////////////
//一.功能函数buttonsControl类
/////////////////////
function buttonsControl(X, Y, W, H, CMD) {
  this.x = X;this.y = Y;this.w = W;this.h = H;this.cmd = CMD;
}
//（1）按钮命令设置
buttonsControl.prototype.clickButton = function() {
  if (this.cmd == "lock") {
    backgroundLock = true;
    this.cmd = "unlock";
  } else if (this.cmd == "unlock") {
    backgroundLock = false;
    this.cmd = "lock";
  } else if (this.cmd == "pause") {
    voiceControl =false;
    isPlaying = false;
    for (var i = 0; i < objects.length; i++) {
      objects[i].isPlaying = false;
    }
    this.cmd = "play";
  } else if (this.cmd == "play") {
    voiceControl =false;
    isPlaying = true;
    for (var i = 0; i < objects.length; i++) {
      objects[i].isPlaying = true;
    }
    this.cmd = "voice";
  } else if(this.cmd == "voice"){
    for (var i = 0; i < objects.length; i++) {
      objects[i].isPlaying = false;
    }
    voiceControl = true;
    this.cmd = "pause";
  } else if (this.cmd == "timer") {
    brushType = "TIMER";
  } else if (this.cmd == "eraser") {
    brushType = "ERASER";
  } else if (this.cmd == "clear") {
    objects = [];
  } else if (this.cmd == "save") {
    //截图
    saveCanvas("picture", "png")
  } else if (this.cmd == "circle") {
    brushType = "CIRCLE";
    this.cmd = "circle";
  } else if (this.cmd == "triangle") {
    brushType = "TRIANGLE";
    this.cmd = "triangle";
  } else if (this.cmd == "lines") {
    brushType = "LINES";
    this.cmd = "lines";
  } else if(this.cmd == "star"){
    brushType = "STAR";
    this.cmd = "star";
  }else if(this.cmd == "badge"){
    brushType = "BADGE";
    this.cmd = "badge";
  }
  else if (this.cmd == "grass") {
    brushType = "GRASS";
    pbrushType = "GRASS";
    this.cmd = "grass";
  } else if (this.cmd == "river") {
    brushType = "RIVER";
    pbrushType = "RIVER";
    this.cmd = "river";
  } else if (this.cmd == "recogOn") {
    recogFlag = false;
    pbrushType = "LINES1";
    brushType = "LINES"
    this.cmd = "recogOff";
  } else if(this.cmd == "recogOff"){
    recogFlag = true;
    brushType = "LINES1"
    pbrushType = "LINES";
    this.cmd = "recogOn";
  }else if (this.cmd == "transparency"){
    count=count+1;
    this.cmd = "transparency";
  }
  else if (this.cmd == "rec") {
    brushType = "REC";
    pbrushType = "REC";
    this.cmd = "rec";
  }
}
//(2)判断鼠标是不是在按键上
buttonsControl.prototype.isMouseInButton = function() {
  if (mouseX >= this.x && mouseX <= this.x + this.w &&
    mouseY >= this.y && mouseY <= this.y + this.h) {
    return true;
  } else {
    return false;
  }
}
//（3）按钮的制作
buttonsControl.prototype.displayButton = function() {
  stroke(0);
  strokeWeight(1);
  fill(255, 255, 255);
  ellipse(this.x+15, this.y+15, this.w, this.h);
  if (this.cmd == "lock") {
    //背景锁定按钮
    fill(255, 255, 255);
    translate(this.x + this.w / 2, this.y + this.h / 2);
    scale(0.15);
    image(lock_icon,-95,-97);
    resetMatrix();
  } else if (this.cmd == "unlock") {
    //解锁按钮
    fill(255, 255, 50);
    translate(this.x + this.w / 2, this.y + this.h / 2);
    scale(0.15);
    image(unlock_icon,-95,-97);
    resetMatrix();
  } else if (this.cmd == "pause") {
    fill(0);
    translate(this.x + this.w / 2, this.y + this.h / 2);
    rectMode(CENTER);
    rect(-4, 0, 4, 15);
    rect(4, 0, 4, 15);
    rectMode(CORNER);
    resetMatrix();
  } else if (this.cmd == "play") {
    fill(0);
    translate(this.x + this.w / 2, this.y + this.h / 2);
    triangle(-2, -8, -2, 8, 6, 0);
    resetMatrix();
  } else if (this.cmd == "voice"){
    translate(this.x + this.w / 2, this.y + this.h / 2);
    scale(0.12);
    image(voice_icon,-95,-100);
    resetMatrix();
  } else if (this.cmd == "timer") {
    translate(this.x + this.w / 2, this.y + this.h / 2);
    noFill();
    ellipse(0, 0, 20, 20);
    ellipse(0, 0, 23, 23);
    fill(0);
    ellipse(0, 0, 3, 3);
    strokeWeight(2);
    line(0, 0, 5, 0);
    line(0, 0, 0, -7);
    resetMatrix();
  }else if (this.cmd == "recogOn") {
    translate(this.x + this.w / 2, this.y + this.h / 2);
    scale(0.25);
    image(turnon_icon,-100,-100);
    resetMatrix();
  } else if(this.cmd == "recogOff") {
    translate(this.x + this.w / 2, this.y + this.h / 2);
    scale(0.25);
    image(turnoff_icon,-100,-100);
    resetMatrix();
  } else if(this.cmd == "transparency"){
    translate(this.x + this.w / 2, this.y + this.h / 2);
    scale(0.18);
    image(trans_icon,-90,-90);
    resetMatrix();
  } else if (this.cmd == "eraser") {
    translate(this.x + this.w / 2, this.y + this.h / 2);
    scale(0.15);
    image(erase_icon,-90,-100);
    resetMatrix();
  } else if (this.cmd == "clear") {
    translate(this.x + this.w / 2, this.y + this.h / 2);
    scale(0.2);
    image(clear_icon,-100,-100);
    resetMatrix();
} else if (this.cmd == "save") {
  translate(this.x + this.w / 2, this.y + this.h / 2);
  scale(0.2);
  image(load_icon,-100,-100);
  resetMatrix();
  } else if (this.cmd == "circle") {
    fill(0);
    translate(this.x + this.w / 2, this.y + this.h / 2);
    ellipse(6, -2, 10, 10);
    ellipse(-5, -5, 5, 5);
    ellipse(3, 8, 4, 4);
    resetMatrix();
  } else if (this.cmd == "triangle") {
    fill(0);
    translate(this.x + this.w / 2, this.y + this.h / 2);
    triangle(0, 0, 10, 0, 5, -8);
    triangle(-5, 8, 5, 8, 0, 0);
    triangle(-8, -5, -3, -5, -5.5, -9);
    resetMatrix();
  } else if (this.cmd == "lines") {
    fill(0);
    strokeWeight(2);
    translate(this.x + this.w / 2, this.y + this.h / 2);
    line(-5, -10, 5, 0);
    line(-10, -10, 10, 10);
    line(-5, 0, 5, 10);
    resetMatrix();
  }else if(this.cmd == "star"){
    fill(0);
    strokeWeight(2);
    translate(this.x + this.w / 2, this.y + this.h / 2);
    snow(0,0,10);
    resetMatrix();
  } else if (this.cmd == "badge") {
    translate(this.x + this.w / 2, this.y + this.h / 2);
    scale(0.25);
    image(badge_icon,-100,-100);
    resetMatrix();
  } 
  else if (this.cmd == "grass") {
    fill(0);
    strokeWeight(2);
    stroke(0);
    translate(this.x + this.w / 2, this.y + this.h / 2);
    triangle(0, 8, 10, 8, 5, -5);
    triangle(-5, 8, 5, 8, 0, -10);
    triangle(-8, 8, -3, 8, -5.5,-5);
    resetMatrix();
  } else if (this.cmd == "river") {

    fill(0);
    strokeWeight(2);
    stroke(0);
    translate(this.x + this.w / 2, this.y + this.h / 2);
    line(-8, -5, 0, -5);
    line(-10, 0, 10, 0);
    line(-5,5, 5, 5);
    resetMatrix();
  } 
  else if (this.cmd == "rec") {
    fill(0);
    translate(this.x + this.w / 2, this.y + this.h / 2);
    rect(0, -8, 10, 10);
    rect(-8, -10, 5, 5);
    rect(1, 6, 5, 5);
    resetMatrix();
  }
}


//////////////////////
//二.颜色按钮colorbtn类
//////////////////////
function ColorButton(X, Y, W, H, gR, gG, gB) {
  this.x = X;
  this.y = Y;
  this.w = W;
  this.h = H;
  this.r = gR;
  this.g = gG;
  this.b = gB;
}
ColorButton.prototype.isMouseInButton = function() {
  if (mouseX >= this.x && mouseX <= this.x + this.w &&
    mouseY >= this.y && mouseY <= this.y + this.h) {
    return true;
  } else {
    return false;
  }
}
ColorButton.prototype.clickButton = function() {
  R = this.r;
  G = this.g;
  B = this.b;
  if (brushType == "ERASER" || brushType == "TIMER") {
    brushType = pbrushType;
  }
}
ColorButton.prototype.displayButton = function() {
  stroke(0);
  strokeWeight(1);
  fill(this.r * 1.5, this.g * 1.5, this.b * 1.5);
  ellipse(this.x+10, this.y+10, this.w, this.h, 5);
}
/////////////////////////////////////////
//三.画笔node类
////////////////////////////////////////
function Node(position, givenSize, givenR, givenG, givenB) {
  this.R = givenR;
  this.G = givenG;
  this.B = givenB;
  this.position = createVector(position.x, position.y);
  this.position.x += (random(20) - 10);
  this.position.y += (random(20) - 10);
  this.size = createVector(0, 0);
  this.sizeScale = 0.5;
  var randomSize = givenSize / 2 + random(10);
  this.baseSize = createVector(randomSize, randomSize);
  this.timepast = 0;
  this.isPlaying = isPlaying;
  this.rotateAngle = random(0,2 * PI);
  this.shapeType = brushType;
  this.snowx=mouseX;
  this.snowy=mouseY;
  this.snowg=2;
  this.snowSize=random(5)+5;
  this.snowAngle=0.005*PI;
  this.snowTurn=random(1);
  this.snowColor=random(1.5)+1;
  this.pmouseX = pmouseX;
  this.pmouseY = pmouseY;
  this.mouseX = mouseX;
  this.mouseY = mouseY;
}
//画笔粒子制作
Node.prototype.drawing = function() {
  noStroke();
  //圆圈画笔
  if (this.shapeType == "CIRCLE") {
    translate(this.position.x, this.position.y);
    fill(this.size.x * this.R / 10, 
         this.size.x * this.G / 10, 
         this.size.x * this.B / 10, 
         round(sin(this.timepast) * 128));
    ellipse(sin(this.timepast) * this.baseSize.x, 
            cos(this.timepast) * this.baseSize.y, 
            this.size.x * 1.25, 
            this.size.y * 1.25);
    fill(this.size.x * this.R / 10, 
         this.size.x * this.G / 10, 
         this.size.x * this.B / 10,
        255- 51*(count%6));
    ellipse(sin(this.timepast) * this.baseSize.x,
            cos(this.timepast) * this.baseSize.y,
            this.size.x,
            this.size.y);
    resetMatrix();
  //三角画笔
  } else if (this.shapeType == "TRIANGLE") {
    translate(this.position.x, this.position.y);
    rotate(this.rotateAngle);
    fill(this.size.x * this.R / 10, 
         this.size.x * this.G / 10, 
         this.size.x * this.B / 10, 
         round(sin(this.timepast) * 128));
    triangle(sin(this.timepast) * this.baseSize.x - this.size.x * 1.5 * 0.5,
             cos(this.timepast) * this.baseSize.y - this.size.y * 1.5 * 0.5,

             sin(this.timepast) * this.baseSize.x + this.size.x * 1.5 * 0.5,
             cos(this.timepast) * this.baseSize.y - this.size.y * 1.5 * 0.5,
             
             sin(this.timepast) * this.baseSize.x * 0.5,
             cos(this.timepast) * this.baseSize.y + this.size.y * 1.5 * 0.9 * 0.5);
    fill(this.size.x * this.R / 10, 
         this.size.x * this.G / 10, 
         this.size.x * this.B / 10, 
        255- 51*(count%6));
    triangle(sin(this.timepast) * this.baseSize.x - this.size.x * 0.5,
             cos(this.timepast) * this.baseSize.y - this.size.y * 0.5,

             sin(this.timepast) * this.baseSize.x + this.size.x * 0.5,
             cos(this.timepast) * this.baseSize.y - this.size.y * 0.5,

             sin(this.timepast) * this.baseSize.x * 0.5,
             cos(this.timepast) * this.baseSize.y + this.size.y * 0.9 * 0.5);
    resetMatrix();
  //线线画笔
  //需要改一改
  } else if (this.shapeType == "LINES") {
      push();
      console.log(6);
      strokeCap(PROJECT);
      strokeWeight(2 + this.size.x / 1.5 * 0.75);
      stroke(this.size.x * this.R / 8, 
             this.size.x * this.G / 8, 
             this.size.x * this.B / 8, 
             round(sin(this.timepast) * 128));
      line(this.pmouseX, this.pmouseY, this.mouseX, this.mouseY);
      strokeWeight(1.5 + this.size.x / 1.5 * 0.5);
      stroke(this.size.x * this.R / 8, 
             this.size.x * this.G / 8, 
             this.size.x * this.B / 8, 255- 51*(count%6));
      line(this.pmouseX, this.pmouseY, this.mouseX, this.mouseY);
      pop();
      resetMatrix();
  //草画笔
  } else if(this.shapeType == "LINES1"){
    console.log(5);
      translate(this.position.x, this.position.y);
      strokeWeight(2 + this.size.x / 1.5 * 0.75);
      stroke(this.size.x * this.R / 8, 
             this.size.x * this.G / 8, 
             this.size.x * this.B / 8, 
             round(sin(this.timepast) * 128));
      line(sin(this.timepast) * this.baseSize.x, cos(this.timepast) * this.baseSize.y,  sin(this.timepast) * this.baseSize.x * 0.5, cos(this.timepast) * this.baseSize.y + this.size.y * 0.9 * 0.5);
      strokeWeight(1.5 + this.size.x / 1.5 * 0.5);
      stroke(this.size.x * this.R / 8, 
             this.size.x * this.G / 8, 
             this.size.x * this.B / 8, 255-51*(count%6));
             line(sin(this.timepast) * this.baseSize.x, cos(this.timepast) * this.baseSize.y,  sin(this.timepast) * this.baseSize.x * 0.5, cos(this.timepast) * this.baseSize.y + this.size.y * 0.9 * 0.5);
      resetMatrix();
  }
  else if (this.shapeType == "STAR") {
      translate(this.snowx, this.snowy);
      rotate(this.snowAngle);
      if(this.snowTurn<0.5){
        this.snowTurn=-1*this.snowTurn;
      }
      stroke( this.R*this.snowColor, this.G*this.snowColor,  this.B*this.snowColor ,255- 51*(count%6));
      snow(0, 0,this.snowSize);
      if(this.isPlaying){
        this.snowy+=this.snowg*this.snowSize/5;
      }
      if(!isWindR&&!isWindL){
        this.snowx+=sin(this.timepast) * this.snowSize/15*this.snowTurn;
      }else if(isWindR||isWindL){
        if(this.snowSize<5){
          this.snowx+=wind/5;
        }else{
          this.snowx+=wind/this.snowSize*2;
        }
      }
      if(this.snowy>height){
        this.snowy=0;
      }  
      if(this.snowx>width){
        this.snowx=0;
      }
      if(this.snowx<0){
        this.snowx=width;
        this.snowAngle+=0.005*PI;
        if(this.snowAngle>2*PI){
          this.snowAngle=0.005*PI;
        }
      }
      resetMatrix();
   } else if (this.shapeType == "BADGE") {
    translate(this.position.x, this.position.y);
    var r=this.size.x * 50 / 10;
    var g=this.size.x * 200 / 10; 
    var b=this.size.x * 50 / 10;
    fill(r,g,b);
    translate(this.x + this.w / 2, this.y + this.h / 2);
    var c=abs(cos(this.timepast) * this.baseSize.y - this.size.y * 0.01);
    image(badge, 5*c/2, -5*c/3);
    image(badge, 0+c/4, -10*c/2);
    image(badge, -5.5*c/2,-5*c);
    resetMatrix();
  } else if (this.shapeType == "GRASS") {
		translate(this.position.x, this.position.y);
    var r=this.size.x * 50 / 10;
    var g=this.size.x * 200 / 10; 
    var b=this.size.x * 50 / 10;
    fill(r,g,b,255- 51*(count%6));
    translate(this.x + this.w / 2, this.y + this.h / 2);
    var c=abs(cos(this.timepast) * this.baseSize.y - this.size.y * 0.01);
    triangle(0+c, 8, 10, 8, 5*c/2, -5*c/3);
    triangle(-5+c, 8, 5, 8, 0+c/4, -10*c/2);
    triangle(-8+c, 8, -3, 8, -5.5*c/2,-5*c);
    resetMatrix();
  //河流画笔  
  } else if (this.shapeType == "RIVER") {
    translate(this.position.x,this.position.y);
    var c=cos(this.timepast) * this.baseSize.y - this.size.y * 0.01;
    var r=this.size.x * this.R / 10;
    var g=this.size.x * this.G / 10; 
    var b=this.size.x * this.B / 10;
    fill(r,g,b,round(sin(this.timepast) * 128));
    strokeWeight(2);
    fill(r,g,b,255- 51*(count%6) );
    stroke(r,g,b,255- 51*(count%6));
    line(-8+c, -5, 0+c, -5);
    line(-10*c/2, 0, 10*c, 0);
    line(-5+c,5, 5+c, 5);
    resetMatrix();
  } 
  else if (this.shapeType == "REC") {
    translate(this.position.x,this.position.y);
    fill(this.size.x * this.R / 10, this.size.x * this.G / 10, this.size.x * this.B / 10, round(sin(this.timepast) * 128));
      rect(sin(this.timepast) * this.baseSize.x+5, cos(this.timepast) * this.baseSize.y+5, this.size.x * 1.25, this.size.y * 1.25);
      rotate(this.rotateAngle);
      fill(this.size.x * this.R / 10, this.size.x * this.G / 10, this.size.x * this.B / 10, 255- 51*(count%6));
      rect(sin(this.timepast) * this.baseSize.x, cos(this.timepast) * this.baseSize.y, this.size.x/2, this.size.y/2);
      resetMatrix();
  }
}
//画笔动效函数
Node.prototype.update = function() {
  this.size = createVector(this.baseSize.x + sin(this.timepast) * this.baseSize.x * this.sizeScale,
                          this.baseSize.y + sin(this.timepast) * this.baseSize.y * this.sizeScale);
  if (this.isPlaying) {
    this.timepast += 1/FPS;
  } else if (voiceControl){
    this.timepast += 0.8*vol;
  }
}


////////////////////////////////////////////
//三大基本函数区域655-956
////////////////////////////////////////////
//////////
//preload
//////////
function preload() {
  badge=loadImage('badge.png');
  badge_icon=loadImage('icon/1.png');
  erase_icon=loadImage('icon/eraser.png')
  turnon_icon=loadImage('icon/识别前.png');
  turnoff_icon=loadImage('icon/识别后.png');
  load_icon=loadImage('icon/load.png');
  trans_icon=loadImage('icon/trans.png');
  clear_icon=loadImage('icon/clear.png');
  tableload = loadTable('new.csv', 'csv', 'header');
  voice_icon = loadImage('icon/voice.png');
  unlock_icon = loadImage('icon/开锁.png');
  lock_icon = loadImage('icon/上锁.png');
}
////////
//Setup
////////
function setup() {
  //帧率
  frameRate(FPS);
  let canvas = createCanvas(WIDTH,HEIGHT);
  canvas.parent('left');
  w_Scaling_factor = WIDTH/640;
  h_Scaling_factor = HEIGHT/480;
  table = new p5.Table();
  mic=new p5.AudioIn();
  mic.start();
  //图像识别的内部配置  
  video = createCapture(VIDEO);
  for(let i=0;i<NUM_PARTICLES;i++) {
    let p = createVector(0,0);
    pPositions.push(p);
    cPositions.push(p);
    xs.push(0);
  }
  poseNet = ml5.poseNet(video, modelLoaded);
  poseNet.on('pose', function (results) {
    poses = results;
  });
  video.hide();
  fill(255);
  stroke(255);
  physics = new VerletPhysics2D();
  physics.setDrag(0.05);
  physics.setWorldBounds(new Rect(50, 0, width-100, height-height/3));
  physics.addBehavior(new GravityBehavior(new Vec2D(0, 0.15)));

  headPos = new Vec2D(width/2,height/2); 
  headAttractor = new AttractionBehavior(headPos, 200, -2.9);
  physics.addBehavior(headAttractor);

  leftPos = new Vec2D(width/2,height/2); 
  leftSAttractor = new AttractionBehavior(leftPos, 100, -2.9);
  physics.addBehavior(leftSAttractor);
  
  rightPos = new Vec2D(width/2,height/2); 
  rightSAttractor = new AttractionBehavior(rightPos, 100, -2.9);
  physics.addBehavior(rightSAttractor);

  leftHPos = new Vec2D(width/2,height/2); 
  leftHAttractor = new AttractionBehavior(leftHPos, 100, -2.9);
  physics.addBehavior(leftHAttractor);

  rightHPos = new Vec2D(width/2,height/2); 
  rightHAttractor = new AttractionBehavior(rightHPos, 100, -2.9);
  physics.addBehavior(rightHAttractor);
  //隐藏鼠标
  noCursor();
  strokeCap(PROJECT);
  //颜色按键位置设置
  //第一列
  //红
  buttons.push(new ColorButton(5 + 20 * 0, 5, 20, 20, 200, 50, 50));
  buttons.push(new ColorButton(5, 5 + 20 * 1, 20, 20, 200, 100, 100));
  buttons.push(new ColorButton(5, 5 + 20 * 2, 20, 20, 255, 255, 255));
  //橙
  buttons.push(new ColorButton(5 + 20 * 1, 5, 20, 20, 200, 100, 50));
  buttons.push(new ColorButton(5 + 20 * 1, 5 + 20 * 1, 20, 20, 150, 50, 0));
  buttons.push(new ColorButton(5 + 20 * 1, 5 + 20 * 2, 20, 20, 100, 50, 0));
  //黄
  buttons.push(new ColorButton(5 + 20 * 2, 5, 20, 20, 200, 150, 50));
  buttons.push(new ColorButton(5 + 20 * 2, 5 + 20 * 1, 20, 20, 150, 100, 0));
  buttons.push(new ColorButton(5 + 20 * 2, 5 + 20 * 2, 20, 20, 100, 50, 0));
  //黄绿
  buttons.push(new ColorButton(5 + 20 * 3, 5, 20, 20, 150, 200, 50));
  buttons.push(new ColorButton(5 + 20 * 3, 5 + 20 * 1, 20, 20, 100, 150, 0));
  buttons.push(new ColorButton(5 + 20 * 3, 5 + 20 * 2, 20, 20, 50, 100, 0));
  //绿
  buttons.push(new ColorButton(5 + 20 * 4, 5, 20, 20, 100, 200, 50));
  buttons.push(new ColorButton(5 + 20 * 4, 5 + 20 * 1, 20, 20, 50, 150, 0));
  buttons.push(new ColorButton(5 + 20 * 4, 5 + 20 * 2, 20, 20, 0, 100, 0));
  //绿
  buttons.push(new ColorButton(5 + 20 * 5, 5, 20, 20, 50, 200, 50));
  buttons.push(new ColorButton(5 + 20 * 5, 5 + 20 * 1, 20, 20, 0, 150, 0));
  buttons.push(new ColorButton(5 + 20 * 5, 5 + 20 * 2, 20, 20, 0, 100, 0));
  //青蓝
  buttons.push(new ColorButton(5 + 20 * 6, 5, 20, 20, 50, 150, 200));
  buttons.push(new ColorButton(5 + 20 * 6, 5 + 20 * 1, 20, 20, 0, 100, 150));
  buttons.push(new ColorButton(5 + 20 * 6, 5 + 20 * 2, 20, 20, 0, 50, 100));
  //蓝
  buttons.push(new ColorButton(5 + 20 * 7, 5, 20, 20, 50, 100, 200));
  buttons.push(new ColorButton(5 + 20 * 7, 5 + 20 * 1, 20, 20, 0, 50, 150));
  buttons.push(new ColorButton(5 + 20 * 7, 5 + 20 * 2, 20, 20, 0, 25, 100));
  //深蓝
  buttons.push(new ColorButton(5 + 20 * 8, 5, 20, 20, 50, 50, 200));
  buttons.push(new ColorButton(5 + 20 * 8, 5 + 20 * 1, 20, 20, 0, 0, 150));
  buttons.push(new ColorButton(5 + 20 * 8, 5 + 20 * 2, 20, 20, 0, 0, 100));
  //蓝紫
  buttons.push(new ColorButton(5 + 20 * 9, 5, 20, 20, 100, 50, 200));
  buttons.push(new ColorButton(5 + 20 * 9, 5 + 20 * 1, 20, 20, 50, 0, 150));
  buttons.push(new ColorButton(5 + 20 * 9, 5 + 20 * 2, 20, 20, 0, 0, 80));
  //紫
  buttons.push(new ColorButton(5 + 20 * 10, 5, 20, 20, 150, 50, 200));
  buttons.push(new ColorButton(5 + 20 * 10, 5 + 20 * 1, 20, 20, 100, 0, 150));
  buttons.push(new ColorButton(5 + 20 * 10, 5 + 20 * 2, 20, 20, 50, 0, 100));
  //粉
  buttons.push(new ColorButton(5 + 20 * 11, 5, 20, 20, 200, 50, 200));
  buttons.push(new ColorButton(5 + 20 * 11, 5 + 20 * 1, 20, 20, 150, 0, 150));
  buttons.push(new ColorButton(5 + 20 * 11, 5 + 20 * 2, 20, 20, 100, 0, 100));
  //功能按键位置设置
  buttons.push(new buttonsControl(5, 5 + 30 * 12, 30, 30, "lock"));
  if(isPlaying){
    buttons.push(new buttonsControl(5, 5 + 30 * 13, 30, 30, "pause"));
  }else{
    buttons.push(new buttonsControl(5, 5 + 30 * 13, 30, 30, "play"));
  }
  buttons.push(new buttonsControl(5, 5 + 30 * 14, 30, 30, "timer"));
  buttons.push(new buttonsControl(5, 5 + 30 * 15, 30, 30, "eraser"));
  buttons.push(new buttonsControl(5, 5 + 30 * 16, 30, 30, "clear"));
  buttons.push(new buttonsControl(5, 5 + 30 * 17, 30, 30, "save"));
  buttons.push(new buttonsControl(5, 5 + 30 * 18, 30, 30, "transparency"));
  if(recogFlag){
    buttons.push(new buttonsControl(5, 5 + 30 * 19, 30, 30, "recogOn"));
  }else{
    buttons.push(new buttonsControl(5, 5 + 30 * 19, 30, 30, "recogOff"));
  }
  //笔刷按键位置设置
  buttons.push(new buttonsControl(5, 5 + 30 * 3, 30, 30, "circle"));
  buttons.push(new buttonsControl(5, 5 + 30 * 4, 30, 30, "triangle"));
  buttons.push(new buttonsControl(5, 5 + 30 * 5, 30, 30, "lines"));
  buttons.push(new buttonsControl(5, 5 + 30 * 6, 30, 30, "grass"));
  buttons.push(new buttonsControl(5, 5 + 30 * 7, 30, 30, "river"));
  buttons.push(new buttonsControl(5, 5 + 30 * 8, 30, 30, "rec"));
  buttons.push(new buttonsControl(5, 5 + 30 * 9, 30, 30, "star"));
  buttons.push(new buttonsControl(5, 5 + 30 * 10, 30, 30, "badge"));
}
///////
//Draw
///////
function draw() {
 background(0,0,50);
 //画布设定
 if(backgroundLock){
   background(colorPicked.r, colorPicked.g, colorPicked.b);
 }
  time += 1 / FPS;
  //1显示状态文字
  showGroupName(time);
  //2音频获取
  vol=mic.getLevel(0.15)//获取音量大小
  console.log(vol);
  //3绘图  
  push();
  drawsomething();
  pop();
  //4识别
  if(recogFlag){
    tint(255,40);
    push();
    image(video, 0, 0, WIDTH, HEIGHT); 
    pop();
    //粒子处理
    if (physics.particles.length < NUM_PARTICLES) {
      addParticle();
    }
    for (let i=0;i<physics.particles.length;i++) {
      let p = physics.particles[i];
      cPositions[i]=createVector(p.x,p.y);
      var angleDeg = Math.atan2(pPositions[i].y - p.y, pPositions[i].x - p.x);
      let targetX = angleDeg;
      let dx = targetX - xs[i];
      xs[i] += dx * easing;
      tint(255);
      push();
      translate(p.x, p.y);
      rotate(xs[i]);
      pop();
      pPositions[i] = cPositions[i];
    }

  }
  stroke(0);
  strokeWeight(2);
  if (!isMenuHide) {
    for (var i = 0; i < buttons.length; i++) {
      buttons[i].displayButton();
      if (buttons[i].isMouseInButton()) {
        cursor(HAND);
      }
    }
  }
  //5光标绘制
  if (mouseX > 40 && mouseY>70 || mouseX> 250 || isMenuHide) {
    noCursor();
    fill(R * 1.5, G * 1.5, B * 1.5);
    stroke(R * 1.5, G * 1.5, B * 1.5);
    if (brushType == "CIRCLE") {
      ellipse(mouseX, mouseY, 10, 10);
    } else if (brushType == "TRIANGLE") {
      triangle(mouseX - 5, mouseY + 3, mouseX + 5, mouseY + 3, mouseX, mouseY - 5);
    } else if (brushType == "LINES") {
      translate(mouseX, mouseY);
      noFill();
      stroke(255 - bR);
      ellipse(0, 0, 20, 20);
      fill(R * 1.5, G * 1.5, B * 1.5);
      noStroke();
      ellipse(0, 0, 6, 6);
      resetMatrix();
    } else if (brushType == "GRASS") {
      translate(mouseX, mouseY);
      noStroke();
    	strokeWeight(2);
    	stroke(50,200,50);
      fill(50,200,50);
      triangle(0, 8, 10, 8, 5, -5);
    	triangle(-5, 8, 5, 8, 0, -10);
    	triangle(-8, 8, -3, 8, -5.5,-5);
      resetMatrix();
    } else if (brushType == "RIVER") {
      translate(mouseX, mouseY);
      noFill();
      stroke(255 - bR);
      ellipse(0, 0, 20, 20);
      fill(R * 1.5, G * 1.5, B * 1.5);
      noStroke();
      ellipse(0, 0, 6, 6);
      resetMatrix();
    } 
    else if (brushType == "REC") {
      translate(mouseX, mouseY);
      rect(10,10,-10,-10);
      resetMatrix();
    }
    else if (brushType == "BADGE"){
      translate(mouseX, mouseY);
      image(badge,-10,-10);
      resetMatrix();
    }
    else if (brushType == "STAR"){
      ellipse(mouseX, mouseY, 10, 10);
    }
    else if (brushType == "ERASER") {
      translate(mouseX, mouseY);
      noFill();
      stroke(255 - bR);
      ellipse(0, 0, eraserRange, eraserRange);
      resetMatrix();

    } else if (brushType == "TIMER") {
      translate(mouseX, mouseY);
      stroke(255 - bR);
      noFill();
      ellipse(0, 0, timerRange, timerRange);
      ellipse(0, 0, 22, 22);
      ellipse(0, 0, 25, 25);
      fill(255 - bR);
      ellipse(0, 0, 3, 3);
      strokeWeight(2);
      line(0, 0, 5, 0);
      line(0, 0, 0, -7);
      resetMatrix();
    } else if(brushType == "LINES1"){
      translate(mouseX, mouseY);
      noFill();
      stroke(255 - bR);
      ellipse(0, 0, 20, 20);
      fill(R * 1.5, G * 1.5, B * 1.5);
      noStroke();
      ellipse(0, 0, 6, 6);
      resetMatrix();0
    }
  }
}
////////////////////////////////////////////
//自定义函数区域960-1238
////////////////////////////////////////////
//提示文字设置

function showGroupName(time){
  if (!isMenuHide) {
      if (time < 2) {
        noStroke();
        textAlign(LEFT);
        textSize(15);
        fill(255 - bR);
        text("声形动效画板 ver1.0  copyright:发际线保卫小组 ", 10, height - 10);
      }
    }
  }
//绘图设置
function drawsomething(){
  //鼠标画图
  if (mouseIsPressed && (mouseX > 40 && mouseY>70 ||mouseX>250 || isMenuHide)) {
    if (brushType == "CIRCLE" || brushType == "LINES" || brushType == "TRIANGLE"|| 
        brushType == "GRASS"||brushType == "RIVER"||brushType == "REC"||brushType == "STAR"||brushType == "BADGE") {
      var position = createVector(mouseX, mouseY);
      objects.push(new Node(position, sqrt(sq(mouseX - pmouseX) + sq(mouseY - pmouseY)), R, G, B));
      // console.log(mouseY)
      
    }
    //Eraser
    else if (brushType == "ERASER" && objects.length > 0) {
      for (var i = 0; i < objects.length; i++) {
        if (sqrt(sq(objects[i].position.x - mouseX) + sq(objects[i].position.y - mouseY)) <= eraserRange) {
          objects.splice(i, 1);
          break;
        }
      }
    } else if (brushType == "TIMER" && objects.length > 0) {
      for (var i = 0; i < objects.length; i++) {
        if (sqrt(sq(objects[i].position.x - mouseX) + sq(objects[i].position.y - mouseY)) <= timerRange) {
          objects[i].timepast += 2 / FPS;
          objects[i].isPlaying = false;
        }
      }
    }
  }

  {
    var X_=WIDTH/2, Y_=HEIGHT/2;
    if(poses[0]!= null){
      let keypoint=poses[0].pose.keypoints[10];
      X_ = keypoint.position.x*w_Scaling_factor;
      Y_ = keypoint.position.y*h_Scaling_factor;
    }
    if (X_ - pX > offset){
      X_ = pX + offset;
    }else if (pX - X_ > offset){
      X_ = pX - offset;
    }
    if (Y_ - pY > offset){
      Y_ = pY + offset;
    }
    else if (pY - Y_ > offset){
      Y_ = pY - offset;
    }
    // if (X_ > 0 && X_ < width  && Y_ < height) {
    //   text("手",X_+10, Y_);
    // }
    pX = X_;
    pY = Y_;
  }

  if(recogFlag && mouseIsPressed){
    if (brushType == "CIRCLE" || brushType == "LINES1" || brushType == "TRIANGLE"|| 
        brushType == "GRASS"||brushType == "RIVER"||brushType == "STAR"||brushType == "BADGE") {
      var position = createVector(X_, Y_);
      objects.push(new Node(position, sqrt(sq(X_ - pX) + sq(Y_ - pY)), R, G, B));
      translate(X_, Y_);
      noFill();
      stroke(255 - bR);
      ellipse(0, 0, eraserRange, eraserRange);
      resetMatrix();
    }
  } else if(recogFlag){
    translate(X_, Y_);
      noFill();
      stroke(255 - bR);
      ellipse(0, 0, eraserRange, eraserRange);
      resetMatrix();
  }
  for (var i = 0; i < objects.length; i++) {
    objects[i].drawing();
    objects[i].update();
  }

}
//鼠标设置
function mouseClicked() {
  if (!isMenuHide) {
    for (var i = 0; i < buttons.length; i++) {
      if (buttons[i].isMouseInButton()) {
        buttons[i].clickButton();
      }
    }
  }
  return false;
}
//键盘设置
function keyPressed() {
  if (keyCode == 49||keyCode==97) { //1
    buttons[44].clickButton();
  }
  if (keyCode == 50||keyCode==98) { //2
    buttons[45].clickButton();
  }
  if (keyCode == 51||keyCode==99) { //3
    buttons[46].clickButton();
  }
  if (keyCode ==52||keyCode==100) { //4
    buttons[47].clickButton();
  }
  if (keyCode == 53||keyCode==101) { //5
    buttons[48].clickButton();
  }
  if (keyCode == 54||keyCode==102) { //6
    buttons[49].clickButton();
  }
  if (keyCode === 55||keyCode==103) { //7
    buttons[50].clickButton();
  }
  if (keyCode === 56||keyCode==104) { //8
    buttons[51].clickButton();
  }
  if (keyCode == 96||keyCode==48) {//0清空
    buttons[40].clickButton();
  }
  if (keyCode == 69) {//e橡皮
    buttons[39].clickButton();
  }
  if (keyCode == 84) {//t透明度
    buttons[42].clickButton();
  }
  if (keyCode == 83) { //s保存png
    buttons[41].clickButton();
  }
  if (keyCode == 16) { //Shift
    isMenuHide = !isMenuHide;
  }

  if (keyCode == 67) { //保存源文件
      table.addColumn('id');
      table.addColumn('position.x');
      table.addColumn('position.y');
      table.addColumn('shapeType');
      table.addColumn('R');
      table.addColumn('G');
      table.addColumn('B');
      table.addColumn('isPlaying');
      table.addColumn('baseSize.x');
      table.addColumn('baseSize.y');
      table.addColumn('size.x');
      table.addColumn('size.y');
      table.addColumn('timepast');
      table.addColumn('sizeScale');
      table.addColumn('rotateAngle');
      table.addColumn('pmouseX');
      table.addColumn('pmouseY');
      table.addColumn('mouseX');
      table.addColumn('mouseY');
    for (var i = 0; i < objects.length; i++) {
      console.log("---------------------");
      let newRow = table.addRow();
      newRow.setNum('id', table.getRowCount() - 1);
      newRow.setString('position.x', objects[i].position.x);
      newRow.setString('position.y', objects[i].position.y);
      newRow.setString('shapeType', objects[i].shapeType);
      newRow.setString('R', objects[i].R);
      newRow.setString('G', objects[i].G);
      newRow.setString('B', objects[i].B);
      newRow.setString('isPlaying', objects[i].isPlaying);
      newRow.setString('baseSize.x', objects[i].baseSize.x);
      newRow.setString('baseSize.y', objects[i].baseSize.y);
      newRow.setString('size.x', objects[i].size.x);
      newRow.setString('size.y', objects[i].size.y);
      newRow.setString('timepast', objects[i].timepast);
      newRow.setString('sizeScale', objects[i].sizeScale);
      newRow.setString('rotateAngle', objects[i].rotateAngle);
      newRow.setString('pmouseX', objects[i].pmouseX);
      newRow.setString('pmouseY', objects[i].pmouseY);
      newRow.setString('mouseX', objects[i].mouseX);
      newRow.setString('mouseY', objects[i].mouseY);
    }
    saveTable(table, 'new.csv');
    table = new p5.Table();
    console.log("save success")
  }
  if (keyCode === 86) { //v置入源文件
    objects = [];
    for (var i = 0; i < tableload.getRowCount(); i++) {
      objects[i] = new Node(createVector(parseFloat(tableload.getColumn('position.x')[i]),parseFloat(tableload.getColumn('position.y')[i])));
      objects[i].R = parseFloat(tableload.getColumn('R')[i]);
      objects[i].G = parseFloat(tableload.getColumn('G')[i]);
      objects[i].B = parseFloat(tableload.getColumn('B')[i]);
      objects[i].shapeType = tableload.getColumn('shapeType')[i];
      if(tableload.getColumn('isPlaying')[i] == "TRUE"){
        objects[i].isPlaying = true;
      }else{
        objects[i].isPlaying = false;
      }
      objects[i].baseSize.x = parseFloat(tableload.getColumn('baseSize.x')[i]);
      objects[i].baseSize.y = parseFloat(tableload.getColumn('baseSize.y')[i]);
      objects[i].size.x = parseFloat(tableload.getColumn('size.x')[i]);
      objects[i].size.y = parseFloat(tableload.getColumn('size.y')[i]);
      objects[i].timepast = parseFloat(tableload.getColumn('timepast')[i]);
      objects[i].sizeScale = parseFloat(tableload.getColumn('sizeScale')[i]);
      console.log("wtf");
      objects[i].rotateAngle = parseFloat(tableload.getColumn('rotateAngle')[i]);
      objects[i].pmouseX = parseFloat(tableload.getColumn('pmouseX')[i]);
      objects[i].pmouseY = parseFloat(tableload.getColumn('pmouseY')[i]);
      objects[i].mouseX = parseFloat(tableload.getColumn('mouseX')[i]);
      objects[i].mouseY = parseFloat(tableload.getColumn('mouseY')[i]);
    }
 
  }
  if (keyCode === 80){
    buttons[36].clickButton();
  }

}

//图象函数设置
function addParticle() {
  let randLoc = Vec2D.randomVector().scale(5).addSelf(width / 2, 0);
  let p = new VerletParticle2D(randLoc);
    physics.addParticle(p); 
    physics.addBehavior(new AttractionBehavior(p, 100, -0.8, 0.1));
}
function modelLoaded() {
  print('model loaded'); 
}
//音频权限获取
function mousePressed(){
  if(getAudioContext().state!='running'){
    getAudioContext().resume();
  }
}
//snow画笔设置
function snow(x,y,size){
  strokeCap(ROUND);
  strokeWeight(size/8);
  line(x, y, x+size, y);
  line(x, y, x+size/2, y+size*sqrt(3)/2);
  line(x, y, x-size/2, y+size*sqrt(3)/2);
  line(x, y, x-size, y);
  line(x, y, x-size/2, y-size*sqrt(3)/2);
  line(x, y, x+size/2, y-size*sqrt(3)/2);
  strokeWeight(size/12);
  line(x+size/2,y,x+size*(sqrt(3)/4+1/2),y+size*1/4);
  line(x+size/2,y,x+size*(sqrt(3)/4+1/2),y-size*1/4);
  line(x-size/2,y,x-size*(sqrt(3)/4+1/2),y+size*1/4);
  line(x-size/2,y,x-size*(sqrt(3)/4+1/2),y-size*1/4);
  line(x+size*(1/4),y+size*(sqrt(3)/4),x+size*(1/4),y+size*(1/2+sqrt(3)/4));
  line(x+size*(1/4),y+size*(sqrt(3)/4),x+size*(1+sqrt(3))/4,y+size*(sqrt(3)/4+1/4));
  line(x-size*(1/4),y+size*(sqrt(3)/4),x-size*(1/4),y+size*(1/2+sqrt(3)/4));
  line(x-size*(1/4),y+size*(sqrt(3)/4),x-size*(1+sqrt(3))/4,y+size*(sqrt(3)/4+1/4));
  line(x+size*(1/4),y-size*(sqrt(3)/4),x+size*(1/4),y-size*(1/2+sqrt(3)/4));
  line(x+size*(1/4),y-size*(sqrt(3)/4),x+size*(1+sqrt(3))/4,y-size*(sqrt(3)/4+1/4));
  line(x-size*(1/4),y-size*(sqrt(3)/4),x-size*(1/4),y-size*(1/2+sqrt(3)/4));
  line(x-size*(1/4),y-size*(sqrt(3)/4),x-size*(1+sqrt(3))/4,y-size*(sqrt(3)/4+1/4));
  line(x+size*(1/5),y,x+size*(1/5+sqrt(2)/6),y+size*(sqrt(2)/6));
  line(x+size*(1/5),y,x+size*(1/5+sqrt(2)/6),y-size*(sqrt(2)/6));
  push();
  translate(x,y);
  rotate(1/3*PI);
  line(size*(1/5),0,size*(1/5+sqrt(2)/6),size*(sqrt(2)/6));
  line(size*(1/5),0,size*(1/5+sqrt(2)/6),-size*(sqrt(2)/6));
  rotate(1/3*PI);
  line(size*(1/5),0,size*(1/5+sqrt(2)/6),size*(sqrt(2)/6));
  line(size*(1/5),0,size*(1/5+sqrt(2)/6),-size*(sqrt(2)/6));
  rotate(1/3*PI);
  line(size*(1/5),0,size*(1/5+sqrt(2)/6),size*(sqrt(2)/6));
  line(size*(1/5),0,size*(1/5+sqrt(2)/6),-size*(sqrt(2)/6));
  rotate(1/3*PI);
  line(x+size*(1/5),y,x+size*(1/5+sqrt(2)/6),y+size*(sqrt(2)/6));
  line(size*(1/5),0,size*(1/5+sqrt(2)/6),size*(sqrt(2)/6));
  line(size*(1/5),0,size*(1/5+sqrt(2)/6),-size*(sqrt(2)/6));
  rotate(1/3*PI);
  line(size*(1/5),0,size*(1/5+sqrt(2)/6),size*(sqrt(2)/6));
  line(size*(1/5),0,size*(1/5+sqrt(2)/6),-size*(sqrt(2)/6));
  pop();
}
