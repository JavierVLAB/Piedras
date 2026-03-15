class Scene {
  constructor(data) {
    this.title = data.title;
    this.date = data.recepcion || "";
    this.dataLines = data.recepcion || [];
    this.commentPhrases = data.comments || data.Testimonio || [];
    
    this.opacity = 0;
    this.fadeDirection = 0;

    this.fadeInSpeed = Config.timing.fadeInSpeed;
    this.fadeOutSpeed = Config.timing.fadeOutSpeed;
    this.commentInterval = Config.timing.commentInterval;
    this.idleImageScale = Config.display.idleImageScale;
    
    this.commentIndex = 0;
    this.commentTimer = 0;

    this.isIdle = data?.isIdle || false;
    this.isImageIdle = data?.isImageIdle || false;
    this.isDetection = data?.isDetection || false;
  }

  startFadeIn() {
    this.fadeDirection = 1;
  }

  startFadeOut() {
    this.fadeDirection = -1;
  }

  update() {
    if (this.fadeDirection === 1) {
      this.opacity += this.fadeInSpeed;
      if (this.opacity >= 255) {
        this.opacity = 255;
        this.fadeDirection = 0;
      }
    } else if (this.fadeDirection === -1) {
      this.opacity -= this.fadeOutSpeed;
      if (this.opacity <= 0) {
        this.opacity = 0;
        this.fadeDirection = 0;
        this.commentIndex = 0;
        this.commentTimer = 0;
      }
    }

    if (this.opacity > 0 && this.commentPhrases.length > 0) {
      this.commentTimer++;
      if (this.commentTimer >= this.commentInterval) {
        this.commentIndex = (this.commentIndex + 1) % this.commentPhrases.length;
        this.commentTimer = 0;
      }
    }
  }

  isInvisible() {
    return this.opacity <= 0;
  }

  render() {
    if (this.opacity <= 0) return;

    if (this.isImageIdle) {
      this.renderIdleImage();
      return;
    }
    
    if (this.isIdle) {
      this.renderIdle();
      return;
    }
    
    if (this.isDetection) {
      this.renderDetection();
      return;
    }

    this.renderTitle();
    this.renderDate();
    this.renderComment();
  }

  renderTitle() {
    const x = app.screenWidth / 6;
    const y = app.screenHeight / 6;

    this.drawTextWithBackground(this.title, x, y, {
      fontSize: Config.display.titleFontSize,
      font: app.fontTitle,
      align: LEFT,
      baseline: CENTER,
    });
  }

  renderDate() {
    const x = app.screenWidth / 6 - 40;
    const y = app.screenHeight / 6 + 60;

    this.drawTextWithBackground(this.date, x, y, {
      fontSize: Config.display.titleFontSize,
      font: app.fontTitle,
      align: LEFT,
      baseline: CENTER,
    });
  }

  renderData() {
    const startX = app.screenWidth / 6 - 40;
    let y = app.screenHeight / 6 + 40;

    for (let line of this.dataLines) {
      this.drawTextWithBackground(line, startX, y, {
        fontSize: Config.display.titleFontSize,
        font: app.fontText,
        align: LEFT,
        baseline: TOP
      });
      y += 50;
    }
  }

  renderComment() {
    if (this.commentPhrases.length === 0) return;

    const comment = this.commentPhrases[this.commentIndex];
    const x = app.screenWidth / 2;
    const y = 5 * app.screenHeight / 6;

    this.drawTextWithBackground(comment, x, y, {
      fontSize: Config.display.commentFontSize,
      align: CENTER,
      baseline: CENTER
    });
  }

  renderIdle() {
    push();
    textAlign(CENTER, TOP);
    textSize(Config.display.commentFontSize);
    textFont(app.fontText);

    const lineHeight = 60;
    const startY = 200;

    for (let i = 0; i < this.commentPhrases.length; i++) {
      let line = this.commentPhrases[i];
      let y = startY + i * lineHeight;

      this.drawTextWithBackground(line, 75, y, {
        align: LEFT,
        baseline: CENTER,
        fontSize: Config.display.commentFontSize,
        font: app.fontText
      });
    }

    pop();
  }
  
  renderIdleImage() {
    if (!app.currentIdleImage) return;
    
    push();
    tint(255, this.opacity);
    
    const canvasW = app.screenWidth;
    const canvasH = app.screenHeight;
    
    const imgW = app.currentIdleImage.width;
    const imgH = app.currentIdleImage.height;
    
    const scale = min(canvasW / imgW, canvasH / imgH) * this.idleImageScale;
    const displayW = imgW * scale;
    const displayH = imgH * scale;
    
    const x = (canvasW - displayW) / 2;
    const y = (canvasH - displayH) / 2;
    
    image(app.currentIdleImage, x, y, displayW, displayH);
    
    noTint();
    pop();
  }
  
  renderDetection() {
    if (this.commentPhrases.length === 0) return;

    const comment = this.commentPhrases[this.commentIndex];
    const x = app.screenWidth / 2;
    const y = app.screenHeight / 2;

    this.drawTextWithBackground(comment, x, y, {
      fontSize: Config.display.commentFontSize,
      align: CENTER,
      baseline: CENTER,
      textColor: [255, this.opacity],
      bgColor: [0, this.opacity * 0.8],
      maxWidth: Config.display.maxTextWidth
    });
  }

  drawTextWithBackground(txt, x, y, options = {}) {
    const {
      align = CENTER,
      baseline = CENTER,
      fontSize = 32,
      font = app.fontText,
      textColor = [255, this.opacity],
      bgColor = [0, this.opacity],
      padding = 30,
      cornerRadius = 0,
      maxWidth = null
    } = options;

    push();
    textSize(fontSize);
    textFont(font);

    let lines = [txt];
    let w = textWidth(txt);
    let h = fontSize + 10;

    if (maxWidth && w > maxWidth) {
      lines = this.wrapText(txt, maxWidth);
      w = maxWidth;
      h = (fontSize + 10) * lines.length + (lines.length - 1) * 5;
    }

    let rectX, rectY, textX, textY;

    if (align === LEFT) {
      rectX = x;
      textX = x + padding / 2;
    } else if (align === RIGHT) {
      rectX = x - w - padding;
      textX = x - padding / 2;
    } else {
      rectX = x - (w + padding) / 2;
      textX = x;
    }

    if (baseline === TOP) {
      rectY = y;
      textY = y + (fontSize + 10) / 2;
    } else if (baseline === BOTTOM) {
      rectY = y - h;
      textY = y - h + (fontSize + 10) / 2;
    } else {
      rectY = y - h / 2;
      textY = y - h / 2 + (fontSize + 10) / 2;
    }

    noStroke();
    fill(...bgColor);
    rectMode(CORNER);
    rect(rectX, rectY, w + padding, h, cornerRadius);

    fill(...textColor);
    textAlign(align, CENTER);
    
    for (let i = 0; i < lines.length; i++) {
      let lineY = textY + i * (fontSize + 15);
      text(lines[i], textX, lineY);
    }
    
    pop();
  }

  wrapText(txt, maxWidth) {
    let words = txt.split(' ');
    let lines = [];
    let currentLine = '';

    for (let word of words) {
      let testLine = currentLine + (currentLine ? ' ' : '') + word;
      if (textWidth(testLine) <= maxWidth) {
        currentLine = testLine;
      } else {
        if (currentLine) {
          lines.push(currentLine);
          currentLine = word;
        } else {
          lines.push(word);
        }
      }
    }
    
    if (currentLine) {
      lines.push(currentLine);
    }
    
    return lines;
  }
}

function splitTestimonioIntoChunks(text, maxLen = 90) {
  return text
    .split('.')
    .map(s => s.trim())
    .filter(s => s.length > 0)
    .flatMap(sentence => {
      if (sentence.length <= maxLen) return [sentence];
      const words = sentence.split(' ');
      const chunks = [];
      let current = '';

      for (let word of words) {
        if ((current + ' ' + word).trim().length <= maxLen) {
          current += (current ? ' ' : '') + word;
        } else {
          chunks.push(current);
          current = word;
        }
      }
      if (current) chunks.push(current);

      return chunks;
    });
}
