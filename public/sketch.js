//let modelURL = './my_model/';
//let modelURL = 'https://teachablemachine.withgoogle.com/models/2HucpcZdT/';
//let modelURL = 'https://teachablemachine.withgoogle.com/models/-owFz2BSZ/';
// modelo antes del noviembre2025
//let modelURL = 'https://teachablemachine.withgoogle.com/models/qqhdQRo-q/'; 

// modelo antes del 10 noviembre2025
// se añadieron las camisas blancas
//let modelURL = 'https://teachablemachine.withgoogle.com/models/akPXWZY9z/'; 
let modelURL = "./tm-my-image-model/";

let classifier;
let video;
let currentClass = "";
let confidence = 0;
let sceneManager;
let contentData;

let rotateScreen = true;
let rotateCamera = true;
let screenWidth;
let screenHeight;
let fontTitle, fontText;

let cam;

let classKeys = [];
let currentIndex = -1;

let idleData;
let idleTimer = 0;
const idleThreshold = 60 * 60 * 3; // 3 minutos a 60fps

// preload() eliminado - p5.js 2.0 requiere cargar archivos en setup() con async/await





async function setup() {
  createCanvas(windowWidth, windowHeight);
  
  // Cargar archivos usando async/await como requiere p5.js 2.0
  console.log("Cargando archivos...");
  try {
    contentData = await loadJSON("Soledad_Gomez_all.json?v=" + Date.now());
    idleData = await loadJSON("idleTexts.json?v=" + Date.now());
    fontTitle = await loadFont('assets/fonts/UniversLTStd-BoldCnObl 6.otf');
    fontText = await loadFont('assets/fonts/UniversLTStd-BoldCnObl 6.otf');
    
    console.log("Archivos cargados correctamente");
    console.log("Idle data cargado:", idleData);
    
    classKeys = Object.keys(contentData);
    
    // Crear captura de video - siguiendo el ejemplo oficial de p5.js
    video = createCapture(VIDEO);
    video.size(320, 240);
    video.hide();

    sceneManager = new SceneManager(contentData);
    sceneManager.loadIdleTexts(idleData);

    // Cargar modelo ML5
    classifier = ml5.imageClassifier(modelURL + 'model.json', modelReady);
    
  } catch (error) {
    console.error("Error cargando archivos:", error);
  }
  
  // Inicializar dimensiones de pantalla siempre (fuera del try/catch)
  if(rotateScreen){
    screenWidth = height;
    screenHeight = width;
  } else {
    screenWidth = width;
    screenHeight = height;
  }
}

function draw() {
  background(255);

  push();

  // Verificar que las variables estén inicializadas y el video esté listo
  if (video && screenWidth && screenHeight && !isNaN(screenWidth) && !isNaN(screenHeight)) {
    if (rotateScreen) {
      // Rota 90 grados y ajusta el sistema de coordenadas

          // Calcula la altura que estás usando para la imagen
      let imgHeight = screenHeight * 240 / 320;

      push(); // Guarda la configuración actual de transformación

        // 1. Traslada el origen al borde inferior de la imagen.
        // El ancho queda en 0, y la altura es la variable imgHeight.
        translate(0, imgHeight);

        // 2. Aplica el flip vertical escalando por -1 en el eje Y.
        scale(1, -1);

        // 3. Dibuja la imagen. 
        // Debido a que el eje Y está invertido, el dibujo comenzará desde el nuevo 0 (que es imgHeight) 
        // y se extenderá hacia arriba, resultando en el flip vertical.
        image(video, 0, 0, screenHeight, imgHeight);

      pop(); // Restaura la configuración de transformación anterior
      translate(width, 0);
      rotate(HALF_PI);
    } else {   
      // Muestra el video sin rotar
      image(video, 0, 0, screenWidth, screenWidth * 240 / 320);
    }
    
    if (sceneManager) {
      sceneManager.update();
      sceneManager.render();
    }
  } else {
    // Mostrar mensaje de carga mientras se inicializa todo
    fill(0);
    textAlign(CENTER, CENTER);
    textSize(24);
    text("Cargando...", width / 2, height / 2);
  }

  pop();
}

function modelReady() {
  console.log("Modelo ML5 cargado correctamente");
  classifyVideo();
}

function classifyVideo() {
  const tempW = 320;
  const tempH = 240;

  // Creamos un buffer temporal y dibujamos el video
  const g = createGraphics(tempW, tempH);
  g.image(video, 0, 0, tempW, tempH);

  let frame;

  if (rotateCamera) {
    const rotated = createGraphics(tempH, tempW);
    rotated.push();
    rotated.translate(rotated.width / 2, rotated.height / 2);
    rotated.rotate(HALF_PI);
    rotated.imageMode(CENTER);
    rotated.image(g, 0, 0);
    rotated.pop();

    frame = rotated.get();
    rotated.remove();
  } else {
    frame = g.get();
  }

  g.remove();

  classifier.classify(frame, gotResult);
}



function gotResult(error, results) {
  if (error) {
    console.warn("Advertencia:", error);
  }

  let detectedClass = "";
  let confidenceValue = 0;

  if (results && results.length > 0) {
    const result = results[0];
    if (result.label !== "Clase 4" && result.confidence > 0.8) {
      detectedClass = result.label;
      confidenceValue = result.confidence;
      //console.log(detectedClass, confidenceValue);
    }
  }

  // Actualiza solo si se detectó clase válida con >90%
  currentClass = detectedClass;
  confidence = confidenceValue;
  sceneManager.updateDetectedClass(currentClass);

  classifyVideo();
}


function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}


function keyPressed() {
  if (key === '1') {
    currentClass = "Class 1";
  } else if (key === '3') {
    currentClass = "Molto piacere";
  } else {
    currentClass = "";
  }

  if (key === 'c') {
    currentIndex = (currentIndex + 1) % classKeys.length;
    currentClass = classKeys[currentIndex];
    console.log("Clase simulada:", currentClass);
    sceneManager.updateDetectedClass(currentClass);
  }

  sceneManager.updateDetectedClass(currentClass);
}
