class SceneManager {
  constructor(content) {
    this.content = content;
    this.currentScene = null;
    this.currentClass = "";

    this.lastDetectedTime = millis();
    this.idleThreshold = Config.timing.idleThreshold;
    this.idleSceneDuration = Config.timing.idleSceneDuration;
    
    this.idleScene = null;
    this.idleSceneStartTime = null;
    this.idleTexts = [];
    this.fadeState = "none";
  }

  updateDetectedClass(newClass) {
    if (newClass === this.currentClass) {
      return;
    }

    if (newClass === "") {
      if (this.currentScene && this.fadeState !== "out") {
        this.currentScene.startFadeOut();
        this.fadeState = "out";
      }
      this.currentClass = "";
      return;
    }

    if (newClass && newClass !== "" && newClass !== "Control") {
      const detectionScene = new Scene({
        title: "",
        recepcion: "",
        comments: [app.detectionText],
        isDetection: true
      });
      
      detectionScene.label = newClass;
      detectionScene.startFadeIn();
      this.currentScene = detectionScene;
      this.currentClass = newClass;
      this.fadeState = "in";
      
      this.lastDetectedTime = millis();

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
    const now = millis();

    if (this.currentScene) {
      this.currentScene.update();

      if (this.currentScene.isInvisible()) {
        this.currentScene = null;
        this.lastDetectedTime = millis();
      }
    }

    if (!this.currentScene && !this.idleScene) {
      if (now - this.lastDetectedTime > this.idleThreshold && app.idleImages.length > 0) {
        app.selectRandomIdleImage();

        this.idleScene = new Scene({
          title: "",
          data: [],
          comments: [],
          isIdle: true,
          isImageIdle: true
        });

        this.idleScene.startFadeIn();
        this.idleSceneStartTime = now;
        this.idleSceneFadingOut = false;
        console.log("🟢 Idle image scene started");
      }
    }

    if (this.idleScene) {
      this.idleScene.update();

      if (now - this.idleSceneStartTime > this.idleSceneDuration && !this.idleSceneFadingOut) {
        this.idleScene.startFadeOut();
        this.idleSceneFadingOut = true;
        console.log("🟡 Idle scene fading out");
      }

      if (this.idleScene.isInvisible()) {
        console.log("⚫ Idle scene removed");
        this.idleScene = null;
        this.idleSceneStartTime = null;
        this.idleSceneFadingOut = false;
        this.lastDetectedTime = millis();
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
