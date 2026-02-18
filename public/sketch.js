// ========================================
// ⏰ GUÍA DE TIEMPOS CONFIGURABLES PARA PRUEBAS
// ========================================
// 
// 1. TIEMPO ANTES DE MOSTRAR IMAGEN IDLE:
//    📍 Archivo: SceneManager.js, línea ~15
//    📍 Variable: this.idleThreshold 
//    📍 Valor actual: 30 segundos (30 * 1000 ms)
//
// 2. DURACIÓN DE CADA IMAGEN IDLE:
//    📍 Archivo: SceneManager.js, línea ~18  
//    📍 Variable: this.idleSceneDuration
//    📍 Valor actual: 20 segundos (20 * 1000 ms)
//
// 3. VELOCIDAD DE APARICIÓN (FADE-IN):
//    📍 Archivo: Scene.js, línea ~15
//    📍 Variable: this.fadeInSpeed
//    📍 Valor actual: 10 (más alto = más rápido)
//
// 4. VELOCIDAD DE DESAPARICIÓN (FADE-OUT):
//    📍 Archivo: Scene.js, línea ~18
//    📍 Variable: this.fadeOutSpeed  
//    📍 Valor actual: 2 (más alto = más rápido)
//
// 5. TIEMPO ENTRE FRASES DE TEXTO:
//    📍 Archivo: Scene.js, línea ~21
//    📍 Variable: this.commentInterval
//    📍 Valor actual: 180 frames = 3 segundos a 60fps
//
// 6. TAMAÑO DE LAS IMÁGENES IDLE:
//    📍 Archivo: Scene.js, línea ~24
//    📍 Variable: this.idleImageScale
//    📍 Valor actual: 0.8 (1.0 = pantalla completa, 0.8 = con margen)
//
// ========================================

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
let rotateCamera = false;
let screenWidth;
let screenHeight;
let fontTitle, fontText;

let cam;

let classKeys = [];
let currentIndex = -1;

let idleData;
let idleTimer = 0;
const idleThreshold = 60 * 60 * 3; // 3 minutos a 60fps

// Variables para las nuevas funcionalidades
let detectionText = ""; // Contenido de text01.txt
let idleImages = []; // Array de imágenes para mostrar cuando no hay detección
let currentIdleImage = null;

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
    
    // Cargar el texto de detección
    detectionText = await loadStrings("assets/texts/text01.txt");
    detectionText = detectionText.join(" "); // Convertir array a string
    
    // Cargar todas las imágenes de la carpeta assets/images/
    await loadIdleImages();
    
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

async function loadIdleImages() {
  // Lista de nombres de imágenes (basada en lo que encontramos)
  const imageNames = [
    "Camisas piedras para app-01.png",
    "Camisas piedras para app-02.png", 
    "Camisas piedras para app-03.png",
    "Camisas piedras para app-04.png",
    "Camisas piedras para app-05.png",
    "Camisas piedras para app-06.png",
    "Camisas piedras para app-07.png",
    "Camisas piedras para app-08.png",
    "Camisas piedras para app-09.png",
    "Camisas piedras para app-10.png",
    "Camisas piedras para app-11.png",
    "Camisas piedras para app-12.png",
    "Camisas piedras para app-14.png"
  ];
  
  console.log("Cargando imágenes idle...");
  
  for (let imageName of imageNames) {
    try {
      const img = await loadImage("assets/images/" + imageName);
      idleImages.push(img);
      console.log("Imagen cargada:", imageName);
    } catch (error) {
      console.warn("No se pudo cargar:", imageName, error);
    }
  }
  
  console.log("Total imágenes cargadas:", idleImages.length);
}

function draw() {
  background(255);

  push();
  
  // Aplicar rotación global si está configurada
  if (rotateScreen) {
    translate(width, 0);
    rotate(HALF_PI);
  }

  // Verificar que las variables estén inicializadas
  if (video && screenWidth && screenHeight && !isNaN(screenWidth) && !isNaN(screenHeight)) {
    
    // Solo mostrar la cámara si hay detección activa
    if (currentClass && currentClass !== "" && currentClass !== "Control") {
      
      push();
      
      if (rotateCamera) {
        // Cámara vertical: necesita rotación adicional para mostrarse correctamente
        if (rotateScreen) {
          // Monitor vertical + cámara vertical: aplicar flip vertical
          let imgHeight = screenHeight * 240 / 320;
          translate(0, imgHeight);
          scale(1, -1);
          image(video, 0, 0, screenHeight, imgHeight);
        } else {
          // Monitor horizontal + cámara vertical: rotar la imagen del video
          let imgWidth = screenWidth * 320 / 240;
          let imgHeight = screenWidth;
          translate(imgWidth / 2, imgHeight / 2);
          rotate(-HALF_PI);
          image(video, -imgHeight / 2, -imgWidth / 2, imgHeight, imgWidth);
        }
      } else {
        // Cámara horizontal: mostrar directamente
        if (rotateScreen) {
          // Monitor vertical + cámara horizontal: flip vertical
          let imgHeight = screenHeight * 240 / 320;
          translate(0, imgHeight);
          scale(1, -1);
          image(video, 0, 0, screenHeight, imgHeight);
        } else {
          // Monitor horizontal + cámara horizontal: directo
          image(video, 0, 0, screenWidth, screenWidth * 240 / 320);
        }
      }
      
      pop();
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
    if (rotateScreen) {
      text("Cargando...", screenWidth / 2, screenHeight / 2);
    } else {
      text("Cargando...", width / 2, height / 2);
    }
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
