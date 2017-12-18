  (function(){
      //screen.lockOrientationUniversal = screen.lockOrientation || screen.mozLockOrientation || screen.msLockOrientation;
      //screen.lockOrientationUniversal("portrait-primary ");
      //if (screen.orientation && screen.orientation.lock) screen.orientation.lock();
      function toggleFullScreen() {
        var doc = window.document;
        var docEl = doc.documentElement;

        var requestFullScreen = docEl.requestFullscreen || docEl.mozRequestFullScreen || docEl.webkitRequestFullScreen || docEl.msRequestFullscreen;
        var cancelFullScreen = doc.exitFullscreen || doc.mozCancelFullScreen || doc.webkitExitFullscreen || doc.msExitFullscreen;

        if(!doc.fullscreenElement && !doc.mozFullScreenElement && !doc.webkitFullscreenElement && !doc.msFullscreenElement) {
          requestFullScreen.call(docEl);
        }
        else {
          cancelFullScreen.call(doc);
        }
      }

      //window.scrollTo(0,0);
      var requestAnimationFrame = window.requestAnimationFrame ||
                                  window.mozRequestAnimationFrame ||
                                  window.webkitRequestAnimationFrame ||
                                  window.msRequestAnimationFrame;
      var canvas=document.getElementById("canvas");
      var context=canvas.getContext("2d");
      var canvasWidth = canvas.width = window.innerWidth;
      var canvasHeight = canvas.height = window.innerHeight;
      var focalLength = 300;
      var GRAVITY_MAX = 0.98;
      var STROKE_WIDTH_MAX = 7;
      var gravity = 0;
      var browserSpeedX = 0;
      var browserSpeedY = 0;
      var browserSpeedZ = 0;

      canvas.addEventListener("click", function() {
        toggleFullScreen();
      }, false);

      // center screen projection origin
      context.translate(canvasWidth * 0.5, canvasHeight * 0.5);

      var rectangles = new Array();

      if (window.DeviceOrientationEvent) {
        window.addEventListener('deviceorientation', deviceOrientationHandler, false);
        //document.getElementById("doeSupported").innerText = "Supported!";
        console.log("SUPPORTED");
      }

      if (window.DeviceMotionEvent) {
        window.addEventListener('devicemotion', deviceMotionHandler, false);
      }

      var prevAlpha = 0, prevBeta = 0, prevGamma = 0;
      function deviceOrientationHandler(event){
        document.getElementById('alpha').innerHTML = event.alpha;
        document.getElementById('beta').innerHTML = event.beta;
        document.getElementById('gamma').innerHTML = event.gamma;

        gravity = (event.beta / 90) * GRAVITY_MAX;
        var ROT_CONST = 3;
        rotate(ROT_CONST * -degToRad(prevGamma - event.gamma), ROT_CONST * degToRad(prevBeta - event.beta), ROT_CONST * degToRad(prevAlpha - event.alpha));

        prevAlpha = event.alpha;
        prevBeta = event.beta;
        prevGamma = event.gamma;
      }

      function degToRad(deg){
        return (deg * Math.PI / 180);
      }
      function deviceMotionHandler(event) {
        document.getElementById('acceleration').innerHTML = event.acceleration.x + ", " + event.acceleration.y + ", " + event.acceleration.z;
        document.getElementById('accelerationIncludingGravity').innerHTML = event.accelerationIncludingGravity.x + ", " + event.accelerationIncludingGravity.y + ", " + event.accelerationIncludingGravity.z;
        var accX = event.acceleration.x;
        accX = (Math.abs(accX) < 0.8) ? 0 : accX;
        //browserSpeedX += -80*accX;
        //browserSpeedY += 12*event.acceleration.y;
        //browserSpeedZ += 12*event.acceleration.z;
        //browserSpeedX *= 0.2;
        // browserSpeedY *= 0.26;
        // browserSpeedZ *= 0.26;
      }

      function rotate(pitch, roll, yaw) {
          var cosa = Math.cos(yaw);
          var sina = Math.sin(yaw);

          var cosb = Math.cos(pitch);
          var sinb = Math.sin(pitch);

          var cosc = Math.cos(roll);
          var sinc = Math.sin(roll);

          var Axx = cosa*cosb;
          var Axy = cosa*sinb*sinc - sina*cosc;
          var Axz = cosa*sinb*cosc + sina*sinc;

          var Ayx = sina*cosb;
          var Ayy = sina*sinb*sinc + cosa*cosc;
          var Ayz = sina*sinb*cosc - cosa*sinc;

          var Azx = -sinb;
          var Azy = cosb*sinc;
          var Azz = cosb*cosc;

          for (var i = 0; i < rectangles.length; i++) {
              var px = rectangles[i].x;
              var py = rectangles[i].y;
              var pz = rectangles[i].z;

              rectangles[i].x = Axx*px + Axy*py + Axz*pz;
              rectangles[i].y = Ayx*px + Ayy*py + Ayz*pz;
              //rectangles[i].z = Azx*px + Azy*py + Azz*pz;
          }
      }

       //loop function
      function draw(){

         // clear the canvas for this loop's animation
         context.clearRect(-canvasWidth * 0.5, -canvasHeight * 0.5, canvasWidth, canvasHeight);
         //context.fillStyle = '#000000';
         //context.fillRect(0, 0, canvas.width, canvas.height);

         for (var i = 0; i < rectangles.length; i++) {
             var rectangle = rectangles[i];
             rectangle.update();
             if (!rectangle.dead) drawRectangle(rectangle);
         }
         prune();
         createRectangle();
         window.requestAnimationFrame(draw);
      }


      //
      // The Rectangle "constructor" is responsible for creating the rectangle
      // objects and defining the various properties they have
      //
      function Rectangle(x, y, z, width, height) {
          this.x = x;
          this.y = y;
          this.z = z;
          this.rotX = 0;
          this.rotY = 0;
          this.rotZ = 0;
          this.width = width;
          this.height = height;
          this.speedX = 0;//-0.01 + Math.random() * 0.02;
          this.speedY = 0;//-0.01 + Math.random() * 0.02;
          this.speedZ = 25;// + Math.random() * 1.1;
          this.lifetime = 0;
          this.lifespan = 120;//80 + Math.random() * 40;
          this.dead = false;
          this.opacity = 1;
          this.red = 240;//Math.round(140 + Math.random() * 115);
          this.green = 10;//Math.round(20 + Math.random() * 100);
          this.blue = 10;//Math.round(0 + Math.random() * 100);
      }

      Rectangle.prototype.update = function () {
        if (this.lifetime >= this.lifespan){
          this.dead = true;
          return;
        }

        this.speedY += gravity;
        //this.speedX += browserRotationAccelerationX;
        //this.speedY += browserRotationAccelerationY;
        //this.speedZ += browserRotationAccelerationZ;

        this.x += this.speedX + browserSpeedX;
        this.y += this.speedY + browserSpeedY;
        this.z += this.speedZ + browserSpeedZ;

        //this.width -= this.speedZ;
        //this.height -= this.speedZ;

        this.lifetime++;
        this.opacity = Math.pow((1 - (this.lifetime / this.lifespan)),2);//1 - (this.z / 10000);
      };

      function drawRectangle (rectangle) {
        var perspective = focalLength / (focalLength + rectangle.z);
        context.save();
        context.scale(perspective, perspective);
        context.translate(rectangle.x, rectangle.y);
        context.beginPath();
        context.moveTo(rectangle.x - rectangle.width * 0.5, rectangle.y - rectangle.height * 0.5);
        context.lineTo(rectangle.x + rectangle.width * 0.5, rectangle.y - rectangle.height * 0.5);
        context.lineTo(rectangle.x + rectangle.width * 0.5, rectangle.y + rectangle.height * 0.5);
        context.lineTo(rectangle.x - rectangle.width * 0.5, rectangle.y + rectangle.height * 0.5);
        context.lineTo(rectangle.x - rectangle.width * 0.5, rectangle.y - rectangle.height * 0.5);
        context.closePath();
        context.strokeStyle = 'rgba(' + rectangle.red + ', ' + rectangle.green + ', ' + rectangle.blue + ', ' + rectangle.opacity + ')';
        context.lineWidth = STROKE_WIDTH_MAX * perspective;
        //context.fillStyle = 'rgba(' + rectangle.red + ', ' + rectangle.green + ', ' + rectangle.blue + ', ' + rectangle.opacity * 0.01 + ')';
        //context.fill();
        context.stroke();
        context.restore();
      }

      function createRectangle() {
          var rectangle = new Rectangle(0, 0, 0, canvasWidth, canvasHeight);
          //var rectangle = new Rectangle(-canvasWidth/2 + Math.random() * canvasWidth, -canvasHeight/2 + Math.random() * canvasHeight, 0, 10 + Math.random() * 5, 10 + Math.random() * 5);
          rectangles.push(rectangle);
      }

      function prune(){
        var indicies = new Array();
        for (var i = 0; i < rectangles.length; i++) {
            if (rectangles[i].dead) indicies.push(i);
        }

        for (var i = 0; i < indicies.length; i++) {
            rectangles.splice(indicies[i],1);
        }
      }

      window.addEventListener("resize", resizeHandler, false);

      function resizeHandler (event){
        canvasWidth = canvas.width = window.innerWidth;
        canvasHeight = canvas.height = window.innerHeight;
        context.translate(canvasWidth * 0.5, canvasHeight * 0.5);
      }

      createRectangle();
      draw();

  })(); // end $(function(){});



/*

  var mainCanvas = document.getElementById("myCanvas");
  var mainContext = mainCanvas.getContext('2d');

  var canvasWidth = mainCanvas.width;
  var canvasHeight = mainCanvas.height;

  // the cornerstone to any nutritious animation
  var requestAnimationFrame = window.requestAnimationFrame ||
                              window.mozRequestAnimationFrame ||
                              window.webkitRequestAnimationFrame ||
                              window.msRequestAnimationFrame;

  // this array contains a reference to every circle that you will create
  var circles = new Array();

  //
  // The Circle "constructor" is responsible for creating the circle
  // objects and defining the various properties they have
  //
  function Circle(angle, sign, radius, rotationRadius, initialX, initialY) {
      this.angle = angle;
      this.sign = sign;
      this.radius = radius;
      this.rotationRadius = rotationRadius;
      this.initialX = initialX;
      this.initialY = initialY;
      this.incrementer = .01 + Math.random() * .1;
  }

  Circle.prototype.update = function () {

      this.angle += this.incrementer;

      this.currentX = this.initialX + this.rotationRadius * Math.cos(this.angle);
      this.currentY = this.initialY + this.rotationRadius * Math.sin(this.angle);

      if (this.angle >= (Math.PI * 2)) {
          this.angle = 0;
          this.incrementer = .01 + Math.random() * .1;
      }

      // The following code is responsible for actually drawing the circle
      mainContext.beginPath();
      mainContext.arc(this.currentX, this.currentY, this.radius,
                      0, Math.PI * 2, false);
      mainContext.closePath();
      mainContext.fillStyle = 'rgba(0, 51, 204, .1)';
      mainContext.fill();
  };

  //
  // This function creates the circles that you end up seeing
  //
  function createCircles() {
      // change the range of this loop to adjust the number of circles you see
      for (var i = 0; i < 50; i++) {
          var radius = 5 + Math.random() * 100;
          var initialX = canvasWidth / 2;
          var initialY = canvasHeight / 2;
          var rotationRadius = 1 + Math.random() * 30;
          var angle = Math.random() * 2 * Math.PI;

          var signHelper = Math.floor(Math.random() * 2);
          var sign;

          // Randomly specify the direction the circle will be rotating
          if (signHelper == 1) {
              sign = -1;
          } else {
              sign = 1;
          }

          // create the Circle object
          var circle = new Circle(angle,
                                  sign,
                                  radius,
                                  rotationRadius,
                                  initialX,
                                  initialY);
          circles.push(circle);
      }
      // call the draw function approximately 60 times a second
      draw();
  }
  createCircles();

  function draw() {
      mainContext.clearRect(0, 0, canvasWidth, canvasHeight);
      mainContext.fillStyle = '#F6F6F6';
      mainContext.fillRect(0, 0, canvasWidth, canvasHeight);

      for (var i = 0; i < circles.length; i++) {
          var circle = circles[i];
          circle.update();
      }

      // call the draw function again!
      requestAnimationFrame(draw);
  }
*/
