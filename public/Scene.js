class Scene {
  constructor(data) {

    this.title = data.title;
    this.date = data.recepcion || "";
    this.dataLines = data.recepcion || [];
    this.commentPhrases = data.comments || data.Testimonio || [];
    
    this.opacity = 0;
    this.fadeDirection = 0; // 1: fade-in, -1: fade-out

    // ========================================
    // ⏰ TIEMPOS DE ANIMACIÓN CONFIGURABLES
    // ========================================
    
    // Velocidad de fade-in (cuanto más alto, más rápido aparece)
    this.fadeInSpeed = 10; // Cambiar aquí para pruebas
    
    // Velocidad de fade-out (cuanto más alto, más rápido desaparece)  
    this.fadeOutSpeed = 2; // Cambiar aquí para pruebas
    
    // Tiempo entre cambios de frases en texto (en frames a 60fps)
    this.commentInterval = 180; // 180 frames = 3 segundos (cambiar aquí para pruebas)
    
    // Escala de las imágenes en modo idle (1.0 = tamaño de pantalla, 0.8 = con margen)
    this.idleImageScale = 1.2; // Cambiar aquí para pruebas de tamaño de imágenes
    
    // ========================================

    // Subtítulos frase por frase
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
    // Fade usando velocidades configurables
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

    // Avance de frases
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
    //this.renderData();
    this.renderComment();
  }

  renderTitle() {
    const x = screenWidth / 6;
    const y = screenHeight / 6;

    this.drawTextWithBackground(this.title, x, y, {
      fontSize: 40,
      font: fontTitle,
      align: LEFT,
      baseline: CENTER,
    });
  }

  renderDate() {
    const x = screenWidth / 6 - 40;
    const y = screenHeight / 6 + 60;
    //console.log(this.date);
    this.drawTextWithBackground(this.date, x, y, {
      fontSize: 40,
      font: fontTitle,
      align: LEFT,
      baseline: CENTER,
    });
  }

  renderData() {
    const startX = screenWidth / 6 - 40;
    let y = screenHeight / 6 + 40;

    for (let line of this.dataLines) {
      this.drawTextWithBackground(line, startX, y, {
        fontSize: 40,
        font: fontText,
        align: LEFT,
        baseline: TOP
      });
      y += 50; // espacio entre líneas
    }
  }

  renderComment() {
    if (this.commentPhrases.length === 0) return;

    const comment = this.commentPhrases[this.commentIndex];
    const x = screenWidth / 2;
    const y = 5 * screenHeight / 6;

    this.drawTextWithBackground(comment, x, y, {
      fontSize: 35,
      align: CENTER,
      baseline: CENTER
    });
  }

  fadeOut() {
    if (this.opacity > 0) {
      this.opacity -= this.fadeSpeed;
    }
  }

  renderIdle() {
    push();
    textAlign(CENTER, TOP);
    textSize(35);
    textFont(fontText);

    let lineHeight = 60;
    let startY = 200;

    for (let i = 0; i < this.commentPhrases.length; i++) {
      let line = this.commentPhrases[i];
      let y = startY + i * lineHeight;

      this.drawTextWithBackground(line, 75, y, {
        align: LEFT,
        baseline: CENTER,
        fontSize: 35,
        font: fontText
      });
    }

    pop();
  }
  
  renderIdleImage() {
    if (!currentIdleImage) return;
    
    push();
    tint(255, this.opacity); // Aplicar fade a la imagen
    
    // La rotación global ya se aplica en draw(), aquí solo centramos
    let canvasW = screenWidth;
    let canvasH = screenHeight;
    
    // Calcular escala para ajustar la imagen al canvas
    let imgW = currentIdleImage.width;
    let imgH = currentIdleImage.height;
    
    // Calcular escala para ajustar la imagen al canvas usando el parámetro configurable
    let scale = min(canvasW / imgW, canvasH / imgH) * this.idleImageScale; 
    let displayW = imgW * scale;
    let displayH = imgH * scale;
    
    // Centrar la imagen
    let x = (canvasW - displayW) / 2;
    let y = (canvasH - displayH) / 2;
    
    image(currentIdleImage, x, y, displayW, displayH);
    
    noTint(); // Quitar tint
    pop();
  }
  
  renderDetection() {
    // Renderizar el texto de detección igual que los comentarios normales
    if (this.commentPhrases.length === 0) return;

    const comment = this.commentPhrases[this.commentIndex];
    
    // La rotación global ya se aplica en draw(), aquí solo centramos
    const x = screenWidth / 2;
    const y = screenHeight / 2;

    this.drawTextWithBackground(comment, x, y, {
      fontSize: 35,
      align: CENTER,
      baseline: CENTER,
      textColor: [255, this.opacity],
      bgColor: [0, this.opacity * 0.8], // Fondo semi-transparente
      maxWidth: 600 // Limitar ancho del texto
    });
  }


  drawTextWithBackground(txt, x, y, options = {}) {
    const {
      align = CENTER,
      baseline = CENTER,
      fontSize = 32,
      font = fontText,
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

    // Si hay maxWidth y el texto es más ancho, dividir en líneas
    if (maxWidth && w > maxWidth) {
      lines = this.wrapText(txt, maxWidth);
      w = maxWidth;
      h = (fontSize + 10) * lines.length + (lines.length - 1) * 5; // 5px entre líneas
    }

    let rectX, rectY, textX, textY;

    // === Horizontal alignment ===
    if (align === LEFT) {
      rectX = x;
      textX = x + padding / 2;
    } else if (align === RIGHT) {
      rectX = x - w - padding;
      textX = x - padding / 2;
    } else { // CENTER
      rectX = x - (w + padding) / 2;
      textX = x;
    }

    // === Vertical alignment ===
    if (baseline === TOP) {
      rectY = y;
      textY = y + (fontSize + 10) / 2;
    } else if (baseline === BOTTOM) {
      rectY = y - h;
      textY = y - h + (fontSize + 10) / 2;
    } else { // CENTER
      rectY = y - h / 2;
      textY = y - h / 2 + (fontSize + 10) / 2;
    }

    // Fondo
    noStroke();
    fill(...bgColor);
    rectMode(CORNER);
    rect(rectX, rectY, w + padding, h, cornerRadius);

    // Texto multilínea
    fill(...textColor);
    textAlign(align, CENTER);
    
    for (let i = 0; i < lines.length; i++) {
      let lineY = textY + i * (fontSize + 15); // 15px entre líneas
      text(lines[i], textX, lineY);
    }
    
    pop();
  }

  // Método auxiliar para dividir texto en líneas
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
          // Palabra muy larga, la agregamos tal como está
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
      // Si es muy larga, dividir sin romper palabras
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
