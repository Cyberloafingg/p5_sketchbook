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
var tessss;

var bg;
var ma;
var loopDelay=0;
//加一个注释用来测试

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
   // backgroundLock = true;
    saveAll();
    this.cmd = "unlock";
  } else if (this.cmd == "unlock") {
    backgroundLock = false;
    saveAll();
    this.cmd = "lock";
  } else if(this.cmd == "allin"){
    allin();
  }else if (this.cmd == "pause") {
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
    playAllAni(mas);
    playAllAni(yues);
    playAllAni(shans);
    playAllAni(chuans);
    playAllAni(ris);
    this.cmd = "voice";
  } else if(this.cmd == "voice"){
    for (var i = 0; i < objects.length; i++) {
      objects[i].isPlaying = false;
    }
    stopAllAni(mas);
    stopAllAni(yues);
    stopAllAni(shans);
    stopAllAni(chuans);
    stopAllAni(ris);

    voiceControl = true;
    this.cmd = "pause";
  } else if (this.cmd == "timer") {
    brushType = "TIMER";
  } else if (this.cmd == "eraser") {
    brushType = "ERASER";
  } else if (this.cmd == "clear") {
    objects = [];
    deleteAllhan(mas);
    deleteAllhan(ris);
    deleteAllhan(yues);
    deleteAllhan(shans);
    deleteAllhan(chuans);
  } else if (this.cmd == "save") {
    //截图
    saveCanvas("picture", "png")
  } else if (this.cmd == "circle") {
    brushType = "CIRCLE";
    this.cmd = "circle";
  } else if (this.cmd == "triangle") {
    brushType = "TRIANGLE";
    this.cmd = "triangle";
  } else if (this.cmd == "write") {
    brushType = "WRITE";
    this.cmd = "write";
  } else if(this.cmd == "snow"){
    brushType = "SNOW";
    this.cmd = "snow";
  }else if(this.cmd == "badge"){
    brushType = "BADGE";
    this.cmd = "badge";
  }
  else if (this.cmd == "grass") {
    brushType = "GRASS";
    pbrushType = "GRASS";
    this.cmd = "grass";
  } else if (this.cmd == "mountain") {
    brushType = "MOUNTAIN";
    pbrushType = "MOUNTAIN";
    this.cmd = "mountain";
  } else if (this.cmd == "recogOn") {
    recogFlag = false;
    pbrushType = "WRITE1";
    brushType = "WRITE"
    this.cmd = "recogOff";
  } else if(this.cmd == "recogOff"){
    recogFlag = true;
    brushType = "WRITE1"
    pbrushType = "WRITE";
    this.cmd = "recogOn";
  }else if (this.cmd == "transparency"){
    count=count+1;
    this.cmd = "transparency";
  }
  else if (this.cmd == "ri") {
    brushType = "RI";
    pbrushType = "RI";
    this.cmd = "ri";
  }else if(this.cmd == "ma"){
    brushType = "MA";
    pbrushType = "MA";
    this.cmd = "ma";
  }else if(this.cmd == "yue"){
    brushType = "YUE";
    pbrushType = "YUE";
    this.cmd = "yue";
  }else if(this.cmd == "chuan"){
    brushType = "CHUAN";
    pbrushType = "CHUAN";
    this.cmd = "chuan";
  }else if(this.cmd == "shu"){
    brushType = "SHU";
    pbrushType = "SHU";
    this.cmd = "shu";
  }else if(this.cmd == "lan"){
    brushType = "LAN";
    pbrushType = "LAN";
    this.cmd = "lan";
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
    //按钮位置debug
//   stroke(0);
//   strokeWeight(2);
//   fill(255, 255, 255,0);
//   ellipse(this.x+15, this.y+15, this.w, this.h);
  if (this.cmd == "lock") {

  } else if (this.cmd == "unlock") {

  } else if(this.cmd == "pause") {
     translate(this.x + this.w / 2, this.y + this.h / 2);
     scale(0.25);
     image(stop_icon,-500,-190,147*4,52*4);
     resetMatrix();
  } else if (this.cmd == "play") {
    translate(this.x + this.w / 2, this.y + this.h / 2);
     scale(0.25);
     image(play_icon,-530,-240,158*4,75*4);
     resetMatrix();
  } else if (this.cmd == "voice"){

  } else if (this.cmd == "timer") {

  }else if (this.cmd == "recogOn") {
    translate(this.x + this.w / 2, this.y + this.h / 2);
     scale(0.25);
     image(turnon_icon,-530,-240,158*4,75*4);
     resetMatrix();
  } else if(this.cmd == "recogOff") {
    translate(this.x + this.w / 2, this.y + this.h / 2);
     scale(0.25);
     image(turnoff_icon,-530,-240,158*4,75*4);
     resetMatrix();
  } else if(this.cmd == "transparency"){

  } else if (this.cmd == "eraser") {

  } else if (this.cmd == "clear") {

} else if (this.cmd == "save") {

  } else if (this.cmd == "circle") {

  } else if (this.cmd == "triangle") {

  } else if (this.cmd == "write") {

  }else if(this.cmd == "snow"){

  } else if (this.cmd == "badge") {

  } 
  else if (this.cmd == "grass") {

  } else if (this.cmd == "mountain") {
  } 
  else if (this.cmd == "ri") {

  }
  else if(this.cmd == 'ma'){

  }else if(this.cmd == 'yue'){
    fill(0);
    strokeWeight(2);
    resetMatrix();
  }else if(this.cmd == 'chuan'){
    fill(0);
    strokeWeight(2);
    resetMatrix();
  }else if(this.cmd == 'lwn'){
    fill(0);
    strokeWeight(2);
    resetMatrix();
  }else if(this.cmd == 'shu'){
    fill(0);
    strokeWeight(2);
    resetMatrix();
  }else if(this.cmd == 'allin'){

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
//绘制按钮
ColorButton.prototype.displayButton = function() {
  stroke(0);
  strokeWeight(1);
//   fill(this.r * 1.5, this.g * 1.5, this.b * 1.5);
//   ellipse(this.x+10, this.y+10, this.w, this.h, 5);
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
  //线线画笔
  //需要改一改
  } else if (this.shapeType == "WRITE") {
      push();
      strokeCap(ROUND);
      strokeWeight(20);
      stroke(this.R, 
             this.G, 
             this.B, 
             128);
      line(this.pmouseX, this.pmouseY, this.mouseX, this.mouseY);
      strokeWeight(20);
      stroke(this.R, 
             this.G, 
             this.B, 255- 51*(count%6));
      line(this.pmouseX, this.pmouseY, this.mouseX+10, this.mouseY);
      pop();
      resetMatrix();
  } else if(this.shapeType == "WRITE1"){
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
  else if (this.shapeType == "SNOW") {
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
    //image(badge, 0+c/4, -10*c/2);
    //image(badge, -5.5*c/2,-5*c);
    resetMatrix();
    //山的图象画笔
  } else if (this.shapeType == "GRASS") {
	translate(this.position.x, this.position.y);
    var r=this.size.x * 50 / 10;
    var g=this.size.x * 200 / 10; 
    var b=this.size.x * 50 / 10;
    fill(r,g,b);
    translate(this.x + this.w / 2, this.y + this.h / 2);
    var c=abs(cos(this.timepast) * this.baseSize.y - this.size.y * 0.01);
    image(shan_p, 5*c/2, -5*c/3,500,500);
    resetMatrix(); 
  } else if (this.shapeType == "MOUNTAIN") {

  } 
  else if (this.shapeType == "RI") {
  }
  else if(this.shapeType == 'MA'){

  }else if(this.shapeType == 'YUE'){

 }else if(this.shapeType == 'CHUAN'){

 }else if(this.shapeType == 'SHU'){
    translate(this.position.x, this.position.y);
    var r=this.size.x * 50 / 10;
    var g=this.size.x * 200 / 10; 
    var b=this.size.x * 50 / 10;
    fill(r,g,b);
    translate(this.x + this.w / 2, this.y + this.h / 2);
    var c=abs(cos(this.timepast) * this.baseSize.y - this.size.y * 0.01);
    image(shu, 5*c/2, -5*c/3,100,100);
    resetMatrix(); 

}else if(this.shapeType == 'LAN'){
    translate(this.position.x, this.position.y);
    var r=this.size.x * 50 / 10;
    var g=this.size.x * 200 / 10; 
    var b=this.size.x * 50 / 10;
    fill(r,g,b);
    translate(this.x + this.w / 2, this.y + this.h / 2);
    var c=abs(cos(this.timepast) * this.baseSize.y - this.size.y * 0.01);
    image(lan, 5*c/2, -5*c/3,70,70);
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
    this.timepast += vol;
  }
}

var anim_ma;
var anim_r;
var anim_y;
var mas;
var ris;
////////////////////////////////////////////
//三大基本函数区域655-956
////////////////////////////////////////////
//////////
//preload
//////////
function preload() {
  badge=loadImage('bg/badge.png');
  badge_icon=loadImage('icon/1.png');
  erase_icon=loadImage('icon/eraser.png')
  turnon_icon=loadImage('bg/人像开.png');
  turnoff_icon=loadImage('bg/人像关.png');
  load_icon=loadImage('icon/load.png');
  trans_icon=loadImage('icon/trans.png');
  clear_icon=loadImage('icon/clear.png');
  tableload = loadTable('new.csv', 'csv', 'header');
  voice_icon = loadImage('icon/voice.png');
  unlock_icon = loadImage('icon/开锁.png');
  lock_icon = loadImage('icon/上锁.png');
  shan_p = loadImage('bg/山.png')
  shu = loadImage('bg/树.png')
  lan = loadImage('bg/兰.png')
  play_icon = loadImage('bg/播放.png')
  stop_icon = loadImage('bg/暂停.png')
  bg=loadImage('bg/bg.jpg');
  anim_ma = loadAnimation('ma/ma_00.png','ma/ma_01.png','ma/ma_02.png','ma/ma_03.png','ma/ma_04.png','ma/ma_05.png','ma/ma_06.png','ma/ma_07.png','ma/ma_08.png','ma/ma_09.png',
                          'ma/ma_10.png','ma/ma_11.png','ma/ma_12.png','ma/ma_13.png','ma/ma_14.png','ma/ma_15.png','ma/ma_16.png','ma/ma_17.png','ma/ma_18.png','ma/ma_19.png',
                          'ma/ma_20.png','ma/ma_21.png','ma/ma_22.png','ma/ma_23.png','ma/ma_24.png','ma/ma_25.png','ma/ma_26.png','ma/ma_27.png');
  anim_r = loadAnimation('r/r_00.png','r/r_01.png','r/r_02.png','r/r_03.png','r/r_04.png','r/r_05.png','r/r_06.png','r/r_07.png','r/r_08.png','r/r_09.png',
                         'r/r_10.png','r/r_11.png','r/r_12.png','r/r_13.png','r/r_14.png','r/r_15.png','r/r_16.png','r/r_17.png','r/r_18.png','r/r_19.png',
                         'r/r_20.png','r/r_21.png','r/r_22.png','r/r_23.png','r/r_24.png','r/r_25.png','r/r_26.png','r/r_27.png');   
  anim_y = loadAnimation('y/y_00.png','y/y_01.png','y/y_02.png','y/y_03.png','y/y_04.png','y/y_05.png','y/y_06.png','y/y_07.png','y/y_08.png','y/y_09.png',
                         'y/y_10.png','y/y_11.png','y/y_12.png','y/y_13.png','y/y_14.png','y/y_15.png','y/y_16.png','y/y_17.png','y/y_18.png','y/y_19.png',
                         'y/y_20.png','y/y_21.png','y/y_22.png','y/y_23.png','y/y_24.png','y/y_25.png','y/y_26.png','y/y_27.png');  
                         
  anim_chuan = loadAnimation('chuan/chuan_00.png','chuan/chuan_01.png','chuan/chuan_02.png','chuan/chuan_03.png','chuan/chuan_04.png','chuan/chuan_05.png','chuan/chuan_06.png','chuan/chuan_07.png','chuan/chuan_08.png','chuan/chuan_09.png',
                             'chuan/chuan_10.png','chuan/chuan_11.png','chuan/chuan_12.png','chuan/chuan_13.png','chuan/chuan_14.png','chuan/chuan_15.png','chuan/chuan_16.png','chuan/chuan_17.png','chuan/chuan_18.png','chuan/chuan_19.png',
                             'chuan/chuan_20.png'); 
  anim_shan = loadAnimation('shan/shan_00.png','shan/shan_01.png','shan/shan_02.png','shan/shan_03.png','shan/shan_04.png','shan/shan_05.png','shan/shan_06.png','shan/shan_07.png','shan/shan_08.png','shan/shan_09.png',
                         'shan/shan_10.png','shan/shan_11.png','shan/shan_12.png','shan/shan_13.png','shan/shan_14.png','shan/shan_15.png','shan/shan_16.png','shan/shan_17.png','shan/shan_18.png','shan/shan_19.png',
                         'shan/shan_20.png','shan/shan_21.png','shan/shan_22.png','shan/shan_23.png','shan/shan_24.png','shan/shan_25.png','shan/shan_26.png','shan/shan_27.png');
}
////////
//Setup
////////
function setup() {
  //帧率
  frameRate(FPS);
  let canvas = createCanvas(WIDTH,HEIGHT);

  w_Scaling_factor = WIDTH/640;
  h_Scaling_factor = HEIGHT/480;
  table = new p5.Table();
  mic=new p5.AudioIn();
  mic.start();
  mas=new Group();
  ris = new Group();
  yues = new Group();
  shans = new Group();
  chuans = new Group();
//测试一些东西
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
  //第一行
  buttons.push(new ColorButton(100, 25, 50, 50, 0,0,0));
  buttons.push(new ColorButton(175, 25, 50, 50, 40,34,28));
  buttons.push(new ColorButton(250, 25, 50, 50, 27,93,115));
  buttons.push(new ColorButton(325, 25, 50, 50,39,75,88));
  buttons.push(new ColorButton(395, 25, 50, 50,0,89,73));
  buttons.push(new ColorButton(470, 25, 50,50,180,135,27));
  buttons.push(new ColorButton(545, 25, 50,50,171,60,0));
  buttons.push(new ColorButton(620, 25, 50,50,134,43,27));

  //第二行
  buttons.push(new ColorButton(620, 100, 50, 50, 156, 0, 0));
  buttons.push(new ColorButton(545,100,50,50,240,93,11));
  buttons.push(new ColorButton(470,100,50,50, 150, 100, 0));
  buttons.push(new ColorButton(395,100,50,50, 66,102,45));
  buttons.push(new ColorButton(325,100,50,50, 105,167,148));
  buttons.push(new ColorButton(250,100,50,50, 120,196,206));
  buttons.push(new ColorButton(175,100,50,50,76,47,23));
  buttons.push(new ColorButton(100, 100, 50, 50, 255, 255, 255));

  //功能按键位置设置
  buttons.push(new buttonsControl(380, 895, 120, 80, "lock"));
  if(isPlaying){
    buttons.push(new buttonsControl(580, 895, 120, 80, "pause"));
  }else{
    buttons.push(new buttonsControl(580, 895, 120, 80, "play"));
  }

  buttons.push(new buttonsControl(1330, 895, 120, 80, "allin"));

  buttons.push(new buttonsControl(1130,895, 120, 80, "timer"));

  buttons.push(new buttonsControl(1500, 895, 120, 80, "eraser"));

  buttons.push(new buttonsControl(1690, 895, 120, 80, "clear"));

  buttons.push(new buttonsControl(200, 895, 120, 80, "save"));

  buttons.push(new buttonsControl(940, 895, 120, 80, "transparency"));

  if(recogFlag){
    buttons.push(new buttonsControl(760 , 895, 120, 80, "recogOn"));
  }else{
    buttons.push(new buttonsControl(760 , 895, 120, 80, "recogOff"));
  }
  //笔刷按键位置设置
  //圆形
  buttons.push(new buttonsControl(1500, 25, 40,40, "circle"));
  //三角
  buttons.push(new buttonsControl(1575, 25, 40, 40, "triangle"));
  //写汉字的
  buttons.push(new buttonsControl(935, 50, 200, 80, "write"));
  //草
  buttons.push(new buttonsControl(1425, 96, 40, 40, "grass"));
  buttons.push(new buttonsControl(1425, 25, 40, 40, "shu"));
  //汉字山
  buttons.push(new buttonsControl(1720, 96, 40, 40, "mountain"));
  //汉字日
  buttons.push(new buttonsControl(1720, 25, 40, 40, "ri"));

  buttons.push(new buttonsControl(1500, 96, 40, 40, "snow"));
  buttons.push(new buttonsControl(1575, 96, 40,40, "badge"));
  buttons.push(new buttonsControl(1650, 96, 40, 40, "lan"));
  buttons.push(new buttonsControl(1650, 25, 40, 40, "ma"));
  buttons.push(new buttonsControl(1790, 96, 40, 40, "chuan"));
  buttons.push(new buttonsControl(1790, 25, 40, 40, "yue"));
}
///////
//Draw
///////
function draw() {
 //background(0,0,50);
 background(247,244,200);
 image(bg,0,0);
 //画布设定
loopDelay++;
if(loopDelay >=3){
    loopDelay = 0;
}

//  if(backgroundLock){
//    background(colorPicked.r, colorPicked.g, colorPicked.b);
//  }
  time += 1 / FPS;
  //1显示状态文字
  showGroupName(time);
  //2音频获取
  vol=mic.getLevel(0.15)//获取音量大小
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
  if ( mouseY>148 && mouseY < 870|| isMenuHide) {
    noCursor();
    fill(R * 1.5, G * 1.5, B * 1.5);
    stroke(R * 1.5, G * 1.5, B * 1.5);
    if (brushType == "CIRCLE") {
      ellipse(mouseX, mouseY, 10, 10);
    } else if (brushType == "TRIANGLE") {
      triangle(mouseX - 5, mouseY + 3, mouseX + 5, mouseY + 3, mouseX, mouseY - 5);
    } else if (brushType == "WRITE") {
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
      image(shan_p,-10,-10,500,500);
      resetMatrix();
    } else if (brushType == "MOUNTAIN") {
      translate(mouseX, mouseY);
      noFill();
      stroke(255 - bR);
      ellipse(0, 0, 20, 20);
      fill(R * 1.5, G * 1.5, B * 1.5);
      noStroke();
      ellipse(0, 0, 6, 6);
      resetMatrix();
    } 
    else if (brushType == "RI") {
      translate(mouseX, mouseY);
      rect(10,10,-10,-10);
      resetMatrix();
    }
    else if (brushType == "BADGE"){
      translate(mouseX, mouseY);
      image(badge,-10,-10);
      resetMatrix();
    }
    else if (brushType == "SNOW"){
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
    } else if(brushType == "WRITE1"){
      translate(mouseX, mouseY);
      noFill();
      stroke(255 - bR);
      ellipse(0, 0, 20, 20);
      fill(R * 1.5, G * 1.5, B * 1.5);
      noStroke();
      ellipse(0, 0, 6, 6);
      resetMatrix();
    }
    else if(brushType == "MA"){
        fill(0,0,0);
        ellipse(mouseX, mouseY, 10, 10);
    }else if(brushType == "YUE"){
        fill(0,0,0);
        ellipse(mouseX, mouseY, 10, 10);
    }else if(brushType == "CHUAN"){
        fill(0,0,0);
        ellipse(mouseX, mouseY, 10, 10);
    }else if (brushType == "SHU"){
      translate(mouseX, mouseY);
      image(shu,-10,-10,100,100);
      resetMatrix();
      }else if (brushType == "LAN"){
        translate(mouseX, mouseY);
        image(lan,-10,-10,70,70);
        resetMatrix();
      }
  }
  drawSprites();
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
    if (brushType == "TIMER" && (mouseX > 40 && mouseY>148 && mouseY < 870|| isMenuHide)) {
      for (var i = 0; i < objects.length; i++) {
        if (sqrt(sq(objects[i].position.x - mouseX) + sq(objects[i].position.y - mouseY)) <= timerRange) {
          objects[i].timepast += 2 / FPS;
          objects[i].isPlaying = false;
        }
      }
      playAni(mas);
      playAni(ris);
      playAni(yues);
      playAni(chuans);
      playAni(shans);
    }

  //鼠标画图
  if (mouseIsPressed && (mouseX > 40 && mouseY>148 && mouseY < 870|| isMenuHide)) {
    if (brushType == "CIRCLE" || brushType == "WRITE"  ||brushType == "TRIANGLE") {
      var position = createVector(mouseX, mouseY);
        objects.push(new Node(position, sqrt(sq(mouseX - pmouseX) + sq(mouseY - pmouseY)), R, G, B));
    }
    else if( brushType == "GRASS"||brushType == "SNOW"||brushType == "BADGE"||brushType == "SHU"||brushType == "LAN") {
      var position = createVector(mouseX, mouseY);
      if(loopDelay == 0){
        objects.push(new Node(position, sqrt(sq(mouseX - pmouseX) + sq(mouseY - pmouseY)), R, G, B));
      }
    }
    else if(brushType == "MOUNTAIN"){
        if(loopDelay == 0){
            draw_shan();
        }
    } else if(brushType == "RI"){
        if(loopDelay == 0){
            draw_ri();
        }
    }else if(brushType == "MA"){
        if(loopDelay == 0){
            draw_ma();
        }
    }else if(brushType == "YUE"){
        if(loopDelay == 0){
            draw_yue();
        }
    }else if(brushType == "CHUAN"){
        if(loopDelay == 0){
            draw_chuan();
        }
    }
    //Eraser
    else if (brushType == "ERASER") {
      for (var i = 0; i < objects.length; i++) {
        if (sqrt(sq(objects[i].position.x - mouseX) + sq(objects[i].position.y - mouseY)) <= eraserRange) {
          objects.splice(i, 1);
          break;
        }
      }
      deleteAni(mas);
      deleteAni(ris);
      deleteAni(shans);
      deleteAni(chuans);
      deleteAni(yues);
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
    if (brushType == "CIRCLE" || brushType == "WRITE1" || brushType == "TRIANGLE"|| 
        brushType == "GRASS"||brushType == "MOUNTAIN"||brushType == "SNOW"||brushType == "BADGE"||brushType == "SHU"||brushType == "LAN") {
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

//绘制汉字
function draw_ma(){
    ma=createSprite(mouseX,mouseY,10,10);
    ma.addAnimation('ma', anim_ma);
    ma.animation.frameDelay=10;
    ma.animation.stop();
    console.log(ma.position.x);
    mas.add(ma);
    console.log("abc");
  }
  function draw_ri(){
    ri=createSprite(mouseX,mouseY,10,10);
    ri.addAnimation('ri', anim_r);
    ri.animation.frameDelay=10;
    ri.animation.stop();
    ris.add(ri);
    console.log("abc");
  }

  function draw_yue(){
    yue=createSprite(mouseX,mouseY,10,10);
    yue.addAnimation('yue', anim_y);
    yue.animation.frameDelay=10;
    yue.animation.stop();
    yues.add(yue);
  }
  function draw_shan(){
    shan=createSprite(mouseX,mouseY,10,10);
    shan.addAnimation('shan', anim_shan);
    shan.animation.frameDelay=10;
    shan.animation.stop();
    shans.add(shan);
  }
  function draw_chuan(){
    chuan=createSprite(mouseX,mouseY,10,10);
    chuan.addAnimation('chuan', anim_chuan);
    chuan.animation.frameDelay=10;
    chuan.animation.stop();
    chuans.add(chuan);
  }


function deleteAni(han){
    if(han.length>0){
        for (var i=0;i<han.length;i++){
          if (sqrt(sq(han[i].position.x - mouseX) + sq(han[i].position.y - mouseY)) <= eraserRange){
            han[i].remove();
          }
        }
      }
}

function playAni(han){
    if(han.length>0){
        for (var i=0;i<han.length;i++){
          if (sqrt(sq(han[i].position.x - mouseX) + sq(han[i].position.y - mouseY)) <= eraserRange){
            han[i].animation.play();
          }else{
            han[i].animation.stop();
          }
        }
      }
}

function playAllAni(han){
    if(han.length>0){
        for (var i=0;i<han.length;i++){
            han[i].animation.play();
        }
    }
}
function stopAllAni(han){
        if(han.length>0){
            for (var i=0;i<han.length;i++){
                han[i].animation.stop();
            }
    }
}



function deleteAllhan(han){
    han.removeSprites();
}

function saveAll(){
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

function allin(){
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
      objects[i].rotateAngle = parseFloat(tableload.getColumn('rotateAngle')[i]);
      objects[i].pmouseX = parseFloat(tableload.getColumn('pmouseX')[i]);
      objects[i].pmouseY = parseFloat(tableload.getColumn('pmouseY')[i]);
      objects[i].mouseX = parseFloat(tableload.getColumn('mouseX')[i]);
      objects[i].mouseY = parseFloat(tableload.getColumn('mouseY')[i]);
    }
 
  }
