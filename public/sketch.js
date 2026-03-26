async function setup() {
  createCanvas(windowWidth, windowHeight);
  
  try {
    await app.loadAssets();
    app.initializeScreenDimensions();
    
    app.sceneManager = new SceneManager(app.contentData);
    app.sceneManager.loadIdleTexts(app.idleData);
    
    if (Config.video.enableCamera) {
      await app.startCamera();
    }
    
    if (Config.video.enableDetection && Config.video.enableCamera) {
      await app.loadModel();
    }
    
  } catch (error) {
    console.error("Error cargando archivos:", error);
  }
}

function draw() {
  background(255,0,0);

  push();
  
  if (Config.screen.rotateScreen) {
    translate(width, 0);
    rotate(HALF_PI);
  }

  if (app.isReady && app.screenWidth && app.screenHeight) {
    app.renderVideo();
    
    if (app.sceneManager) {
      app.sceneManager.update();
      app.sceneManager.render();
    }
  } else {
    fill(0);
    textAlign(CENTER, CENTER);
    textSize(24);
    
    const x = Config.screen.rotateScreen ? app.screenWidth / 2 : width / 2;
    const y = Config.screen.rotateScreen ? app.screenHeight / 2 : height / 2;
    text("Cargando...", x || width / 2, y || height / 2);
  }

  pop();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  app.initializeScreenDimensions();
}

function keyPressed() {
  const classKeys = app.getClassKeys();
  let newClass = "";

  if (key === '1') {
    newClass = "Class 1";
  } else if (key === '3') {
    newClass = "Molto piacere";
  }

  if (key === 'c') {
    const currentIndex = floor(random(classKeys.length));
    newClass = classKeys[currentIndex];
    console.log("Clase simulada:", newClass);
  }

  if (newClass) {
    app.updateDetectedClass(newClass);
  }

  // Space: saltar al siguiente asset idle
  if (key === ' ' && app.sceneManager) {
    app.sceneManager.forceNextIdleScene();
  }
}
