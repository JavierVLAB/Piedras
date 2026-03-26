const Config = {
  // Clasificación de imágenes (ML5/Teachable Machine)
  model: {
    url: "./tm-my-image-model/",      // Ruta local del modelo
    confidenceThreshold: 0.8,        // Solo detecta si confianza > 80%
  },

  // Orientación
  screen: {
    rotateScreen: true,              // Para monitores en posición verticales
    rotateCamera: false,             // Para cámaras web en posición verticales
  },

  // Tiempos: 1000ms = 1 segundo
  timing: {
    idleThreshold: 3 * 1000,     // Espera sin detección para mostrar una imagenidle (mseg)
    idleSceneDuration: 10 * 1000,   // Duración de cada imagen idle (mseg)
    fadeInSpeed: 10,                // Velocidad de aparición
    fadeOutSpeed: 2,                // Velocidad de desaparición
    commentInterval: 180,            // Cambio de frase (frames) seg = frames / frecuencia
  },

  // Visual
  display: {
    idleImageScale: 1.0,            // Tamaño de las imagenes (Escala) 
    titleFontSize: 40,               // Tamaño de título (px)
    commentFontSize: 35,             // Tamaño de comentarios (px)  
    maxTextWidth: 600,               // Ancho máximo del texto (px)
  },

  // Archivos
  assets: {
    dataFile: "Soledad_Gomez_all.json",
    idleTextsFile: "idleTexts.json",
    textFile: "assets/texts/text01.txt",
    fontFile: "assets/fonts/UniversLTStd-BoldCnObl 6.otf",
    imagesFolder: "assets/images/",
    imageNames: [
      "Camisas piedras para app-15.jpg",
      "Camisas piedras para app-16.jpg",
      "Camisas piedras para app-17.jpg",
      "Camisas piedras para app-18.jpg",
      "Camisas piedras para app-19.jpg",
      "Camisas piedras para app-21.jpg",
      "Camisas piedras para app-22.jpg"
    ],
    videoNames: [
      // "Video png rombo.mp4",
      // "Video png rombo 2.mp4"
    ],
  },

  // Video y detección
  video: {
    enableCamera: false,         // Activa la cámara web
    enableDetection: true,       // Activa el modelo de clasificación
    width: 320,
    height: 240,
  },
};
