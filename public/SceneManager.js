class SceneManager {
  constructor(content) {
    this.content = content; // JSON completo con todas las clases
    this.currentScene = null;
    this.currentClass = "";

    this.lastDetectedTime = millis();
    
    // ========================================
    // ⏰ TIEMPOS CONFIGURABLES PARA PRUEBAS
    // ========================================
    
    // Tiempo que espera sin detección antes de mostrar imagen idle (en milisegundos)
    this.idleThreshold = 1 * 5 * 1000; // 30 segundos (cambiar aquí para pruebas)
    
    // Tiempo que se muestra cada imagen idle antes de cambiar (en milisegundos)  
    this.idleSceneDuration = 10 * 1000; // 20 segundos (cambiar aquí para pruebas)
    
    // ========================================
    
    this.idleScene = null;
    this.idleSceneStartTime = null;
    this.idleTexts = []; // la carga vendrá desde fuera
    
  }

  updateDetectedClass(newClass) {
    if (newClass === this.currentClass) {
      // Nada ha cambiado, mantener escena actual
      return;
    }

    // Caso: clase desaparece (""), empezar fadeOut
    if (newClass === "") {
      if (this.currentScene && this.fadeState !== "out") {
        this.currentScene.startFadeOut();
        this.fadeState = "out";
      }
      this.currentClass = "";
      return;
    }

    // Caso: nueva detección - mostrar texto de detección
    if (newClass && newClass !== "" && newClass !== "Control") {
      // Crear escena con el texto de detección
      const detectionScene = new Scene({
        title: "",
        recepcion: "",
        comments: [detectionText], // Usar el texto cargado de text01.txt
        isDetection: true // Marcar como escena de detección
      });
      
      detectionScene.label = newClass;
      detectionScene.startFadeIn();
      this.currentScene = detectionScene;
      this.currentClass = newClass;
      this.fadeState = "in";
      
      this.lastDetectedTime = millis();

      // Si había escena idle activa, desactívala
      if (this.idleScene) {
        this.idleScene.startFadeOut();
        this.idleScene = null;
        this.idleSceneStartTime = null;
        this.idleSceneFadingOut = false;
      }
    }
  }

  loadIdleTexts(idleData) {
    this.idleTexts = idleData.textos;
  }



  update() {
    let now = millis();

    // Actualizar escena principal
    if (this.currentScene) {
      this.currentScene.update();

      if (this.currentScene.isInvisible()) {
        this.currentScene = null;
        this.lastDetectedTime = millis(); // Reinicia temporizador tras escena normal
      }
    }

    // Crear escena idle si no hay escena principal ni idle activa
    if (!this.currentScene && !this.idleScene) {
      if (now - this.lastDetectedTime > this.idleThreshold && idleImages.length > 0) {
        // Seleccionar una imagen aleatoria
        currentIdleImage = random(idleImages);

        this.idleScene = new Scene({
          title: "",
          data: [],
          comments: [],
          isIdle: true,
          isImageIdle: true // Nueva propiedad para distinguir escenas idle con imágenes
        });

        this.idleScene.startFadeIn();
        this.idleSceneStartTime = now;
        this.idleSceneFadingOut = false;
        console.log("🟢 Idle image scene started");
      }
    }

    // Actualizar escena idle (si existe)
    if (this.idleScene) {
      this.idleScene.update();

      // Programar desaparición después del tiempo configurado
      if (
        now - this.idleSceneStartTime > this.idleSceneDuration &&
        !this.idleSceneFadingOut
      ) {
        this.idleScene.startFadeOut();
        this.idleSceneFadingOut = true;
        console.log("🟡 Idle scene fading out");
      }

      // Eliminar la escena idle una vez desaparece
      if (this.idleScene.isInvisible()) {
        console.log("⚫ Idle scene removed");
        this.idleScene = null;
        this.idleSceneStartTime = null;
        this.idleSceneFadingOut = false;
        this.lastDetectedTime = millis(); // Reinicia espera para nueva escena idle
      }
    }
  }


  render() {
    if (this.currentScene) {
      this.currentScene.render();
    }
    if (!this.currentScene && this.idleScene) {
      this.idleScene.render();
    }
  }
}
