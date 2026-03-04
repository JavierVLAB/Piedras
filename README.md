# Piedras 🪨

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![p5.js](https://img.shields.io/badge/p5.js-ED225D?style=flat&logo=p5.js&logoColor=white)](https://p5js.org/)
[![ml5.js](https://img.shields.io/badge/ml5.js-A154F2?style=flat)](https://ml5js.org/)

**Piedras** es una instalación interactiva desarrollada con **p5.js** y **ml5.js** que utiliza inteligencia artificial para reconocer objetos físicos y reaccionar visualmente ante ellos. A través de un modelo de **Teachable Machine**, el sistema identifica "piedras" (o cualquier objeto entrenado) y despliega una narrativa visual y textual única para cada una.

---

## 🌟 Motivación

Este proyecto nace de la exploración entre lo tangible y lo digital. Busca dar una "voz" o una identidad visual a objetos inertes como las piedras, creando una experiencia contemplativa donde la tecnología actúa como un puente de interpretación. 

La obra está diseñada para ser exhibida en espacios físicos, posiblemente utilizando monitores verticales o proyecciones, donde la interacción es directa y natural: el espectador coloca un objeto frente a la cámara y la pieza responde.

---

## 🛠️ Cómo funciona

El sistema se basa en tres pilares fundamentales detallados en las especificaciones del proyecto:

1.  **Detección de Imágenes (`image-detection`):** Utiliza la cámara web para capturar video en tiempo real. Un modelo de clasificación (Teachable Machine) procesa cada frame y determina con un alto nivel de confianza (>80%) qué objeto está presente.
2.  **Gestión de Escenas (`scene-management`):** El sistema transita dinámicamente entre diferentes estados:
    *   **Modo Activo:** Cuando se detecta un objeto conocido, se genera una escena específica con imágenes y textos asociados.
    *   **Modo Idle:** Si no hay interacción durante un tiempo determinado (configurable), el sistema entra en un estado de "reposo" mostrando imágenes aleatorias para mantener la pieza viva.
3.  **Renderizado Visual (`visual-rendering`):** Todo el contenido se anima con efectos de *fade-in* y *fade-out*. Además, el proyecto incluye soporte nativo para **rotación de pantalla global**, permitiendo su uso en monitores verticales sin necesidad de configurar el sistema operativo.

---

## Preparación de deteccion

### ML5.js con teachable machine

### YOLOv8/v11 con Ultralytics HUB

- Tomar las fotos de los objetos a detectar
- Subir las fotos a Label Studio
- Crear las etiquetas en Label Studio
- Colocar las etiquetas en las imagenes
- Exportar como Yolo con imagenes
- Crear un archivo data.yaml
```
path: /content/datasets/piedras_dataset

train: images/train
val: images/train

names:
  0: Blanca
  1: Piedras
```
es importante crear las carpetas train dentro de images y dentro de labels, y llenarlas con las imagenes y las etiquetas respectivamente

- Comprimir esto y subirlo a Ultralytics HUB
- Crear un modelo, Yolov8n , es el mas pequeño y rapido, ideal para web
- Entrenar el modelo conectando a google colab

### Notas

si conviertes imagines de HEIC a JPG, hay que hacer esto

```bash
mogrify -auto-orient -strip *.jpg
```

## 🚀 Instalación y Ejecución

Al ser un proyecto basado en tecnologías web estándar, no requiere compilación compleja.

### Requisitos previos
*   Un servidor web local (por ejemplo, la extensión "Live Server" de VS Code, Python `http.server`, o Node.js `http-server`).
*   Una cámara web conectada.

### Pasos
1.  Clona este repositorio:
    ```bash
    git clone https://github.com/tu-usuario/piedras.git
    cd piedras
    ```
2.  Asegúrate de tener la carpeta del modelo de IA en `public/tm-my-image-model/` (o ajusta la ruta en `sketch.js`).
3.  Inicia tu servidor local apuntando a la carpeta `public/`.
4.  Abre la dirección en tu navegador (ej. `http://localhost:5500`).

5. Usar en mac lo sieguiente para activar el modo kiosk: 

```bash
open -n -a "Google Chrome" --args --kiosk http://localhost:5500/public
```

---

## 🔬 Prueba de Detección YOLO (Ultralytics HUB)

Estamos migrando a un sistema de detección de objetos más robusto usando **YOLOv8/v11** exportado desde **Ultralytics HUB** en formato **TensorFlow.js**.

### Cómo probar el nuevo modelo:
1.  **Exportación:** Desde Ultralytics HUB, exporta tu modelo entrenado como `TensorFlow.js`.
2.  **Preparación:**
    *   Crea una carpeta llamada `public/yolo_model/`.
    *   Copia dentro los archivos generados: `model.json` y todos los archivos `.bin`.
3.  **Ejecución de la prueba:**
    *   Abre en tu navegador: `http://localhost:5500/test_yolo.html` (o la ruta correspondiente de tu servidor local).
4.  **Ajustes:**
    *   Si tus clases son diferentes a las de ejemplo, edita la variable `classNames` en `public/test_yolo.js`.
    *   Puedes ajustar el `CONFIDENCE_THRESHOLD` en `public/test_yolo.js` si el modelo no detecta bien o tiene muchos falsos positivos.

## ⚙️ Configuración

El comportamiento de la pieza se puede ajustar fácilmente modificando las variables al inicio de los archivos principales:

*   **Tiempos y Umbrales:** En `SceneManager.js` puedes ajustar el `idleThreshold` (tiempo de espera antes de entrar en reposo).
*   **Animaciones:** En `Scene.js` puedes cambiar `fadeInSpeed` y `fadeOutSpeed`.
*   **Orientación:** En `sketch.js` puedes activar `rotateScreen` para usar monitores verticales.

---

## 📸 Capturas de Pantalla / Demo

> [!TIP]
> *Inserta aquí imágenes o un GIF de la instalación funcionando.*

<!-- [PLACEHOLDER PARA IMÁGENES] -->

---

## 📝 Notas Personales

<!-- [ESPACIO PARA TUS REFLEXIONES, HISTORIA DEL PROYECTO O DESCRIPCIÓN ARTÍSTICA] -->

---

## 🤝 Créditos y Referencias

*   **Artista / Desarrollador:** Javier Villarroel y Ana Escalera
*   **Librerías:** [p5.js](https://p5js.org/), [ml5.js](https://ml5js.org/).
*   **IA:** Modelo entrenado con [Teachable Machine](https://teachablemachine.withgoogle.com/).

---

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - mira el archivo [LICENSE](LICENSE) para más detalles.
