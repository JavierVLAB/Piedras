class App {
  constructor() {
    this.classifier = null;
    this.video = null;
    this.currentClass = "";
    this.confidence = 0;
    this.sceneManager = null;
    this.contentData = null;
    this.idleData = null;
    // Pool unificado de assets idle: cada entrada es { type: 'image'|'video', asset }
    this.idleAssets = [];
    this.fontTitle = null;
    this.fontText = null;
    this.detectionText = "";
    this.screenWidth = 0;
    this.screenHeight = 0;
    this.isReady = false;
  }

  initializeScreenDimensions() {
    if (Config.screen.rotateScreen) {
      this.screenWidth = height;
      this.screenHeight = width;
    } else {
      this.screenWidth = width;
      this.screenHeight = height;
    }
  }

  async loadAssets() {
    console.log("Cargando archivos...");
    
    const timestamp = Date.now();
    
    this.contentData = await loadJSON(`${Config.assets.dataFile}?v=${timestamp}`);
    this.idleData = await loadJSON(`${Config.assets.idleTextsFile}?v=${timestamp}`);
    this.fontTitle = await loadFont(`${Config.assets.fontFile}`);
    this.fontText = await loadFont(`${Config.assets.fontFile}`);
    
    this.detectionText = await loadStrings(Config.assets.textFile);
    this.detectionText = this.detectionText.join(" ");
    
    await this.loadIdleAssets();
    
    console.log("Archivos cargados correctamente");
    console.log("Idle data cargado:", this.idleData);
    
    this.isReady = true;
  }

  async loadIdleAssets() {
    console.log("Cargando assets idle (imágenes y videos)...");

    for (let imageName of Config.assets.imageNames) {
      try {
        const img = await loadImage(Config.assets.imagesFolder + imageName);
        this.idleAssets.push({ type: 'image', asset: img });
        console.log("Imagen cargada:", imageName);
      } catch (error) {
        console.warn("No se pudo cargar imagen:", imageName, error);
      }
    }

    for (let videoName of (Config.assets.videoNames || [])) {
      try {
        const vid = await new Promise((resolve, reject) => {
          const v = createVideo(Config.assets.imagesFolder + videoName, () => resolve(v));
          v.hide(); // ocultar el elemento HTML nativo
        });
        this.idleAssets.push({ type: 'video', asset: vid });
        console.log("Video cargado:", videoName);
      } catch (error) {
        console.warn("No se pudo cargar video:", videoName, error);
      }
    }

    console.log("Total assets idle cargados:", this.idleAssets.length);
  }

  getClassKeys() {
    return this.contentData ? Object.keys(this.contentData) : [];
  }

  updateDetectedClass(newClass) {
    if (this.sceneManager) {
      this.sceneManager.updateDetectedClass(newClass);
    }
  }

  // Devuelve un asset idle aleatorio { type, asset }, o null si no hay ninguno
  selectNextIdleAsset() {
    if (this.idleAssets.length === 0) return null;
    return random(this.idleAssets);
  }

  async startCamera() {
    if (!Config.video.enableCamera) {
      console.log("Cámara deshabilitada en configuración");
      return;
    }
    this.video = createCapture(VIDEO);
    this.video.size(Config.video.width, Config.video.height);
    this.video.hide();
    console.log("Cámara iniciada");
  }

  async loadModel() {
    if (!Config.video.enableDetection) {
      console.log("Detección deshabilitada en configuración");
      return;
    }
    if (!Config.video.enableCamera) {
      console.log("Error: No se puede activar detección sin cámara");
      return;
    }
    this.classifier = ml5.imageClassifier(Config.model.url + "model.json", () => {
      console.log("Modelo ML5 cargado correctamente");
      this.classifyVideo();
    });
  }

  classifyVideo() {
    if (!this.classifier || !this.video || !Config.video.enableCamera) return;

    const tempW = Config.video.width;
    const tempH = Config.video.height;
    const g = createGraphics(tempW, tempH);
    g.image(this.video, 0, 0, tempW, tempH);

    let frame;
    if (Config.screen.rotateCamera) {
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

    this.classifier.classify(frame, (error, results) => this.handleResult(error, results));
  }

  handleResult(error, results) {
    if (error) {
      console.warn("Error de clasificación:", error);
    }

    let detectedClass = "";
    let confidenceValue = 0;

    if (results && results.length > 0) {
      const result = results[0];
      if (result.label !== "Clase 4" && result.confidence > Config.model.confidenceThreshold) {
        detectedClass = result.label;
        confidenceValue = result.confidence;
      }
    }

    this.currentClass = detectedClass;
    this.confidence = confidenceValue;
    this.updateDetectedClass(detectedClass);

    this.classifyVideo();
  }

  renderVideo() {
    if (!Config.video.enableCamera || !this.video) return;
    if (!this.currentClass || this.currentClass === "" || this.currentClass === "Control") return;

    if (Config.screen.rotateCamera) {
      if (Config.screen.rotateScreen) {
        let imgHeight = this.screenHeight * 240 / 320;
        translate(0, imgHeight);
        scale(1, -1);
        image(this.video, 0, 0, this.screenHeight, imgHeight);
      } else {
        let imgWidth = this.screenWidth * 320 / 240;
        let imgHeight = this.screenWidth;
        translate(imgWidth / 2, imgHeight / 2);
        rotate(-HALF_PI);
        image(this.video, -imgHeight / 2, -imgWidth / 2, imgHeight, imgWidth);
      }
    } else {
      if (Config.screen.rotateScreen) {
        let imgHeight = this.screenHeight * 240 / 320;
        translate(0, imgHeight);
        scale(1, -1);
        image(this.video, 0, 0, this.screenHeight, imgHeight);
      } else {
        image(this.video, 0, 0, this.screenWidth, this.screenWidth * 240 / 320);
      }
    }
  }
}

const app = new App();
