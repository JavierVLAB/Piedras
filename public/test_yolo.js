// Configuración del modelo y detección
const MODEL_PATH = './yolo_model/model.json';
const CONFIDENCE_THRESHOLD = 0.5;
const IOU_THRESHOLD = 0.45;
const INPUT_SIZE = 640; // Tamaño estándar de YOLOv8

// Nombres de las clases (ajusta esto según tu entrenamiento en Ultralytics HUB)
// Generalmente Ultralytics exporta un labels.json o similar
let classNames = ["Blanca", "Piedras"]; // Ejemplo

let model;
let video;
let detections = [];
let isModelLoaded = false;

async function setup() {
    // Configurar canvas de p5.js
    let canvas = createCanvas(640, 480);
    canvas.parent(document.body);
    
    // Captura de video
    video = createCapture(VIDEO);
    video.size(640, 480);
    video.hide();

    // Actualizar UI
    document.getElementById('model-status').innerText = "Cargando modelo YOLO...";

    try {
        // Cargar el modelo de TensorFlow.js
        model = await tf.loadGraphModel(MODEL_PATH);
        isModelLoaded = true;
        
        // Esperar a que el video tenga dimensiones válidas
        await new Promise((resolve) => {
            const checkVideo = () => {
                if (video.elt.readyState >= 2 && video.width > 0) {
                    resolve();
                } else {
                    setTimeout(checkVideo, 100);
                }
            };
            checkVideo();
        });

        // Calentar el modelo (Warm-up)
        const dummyInput = tf.zeros([1, INPUT_SIZE, INPUT_SIZE, 3]);
        model.execute(dummyInput); // Cambiado a execute (síncrono) para optimizar
        dummyInput.dispose();

        document.getElementById('model-status').innerText = "Modelo Listo";
        document.getElementById('model-status').className = "status";
        
        // Iniciar el loop de detección
        runDetection();
    } catch (error) {
        console.error("Error al cargar el modelo:", error);
        document.getElementById('model-status').innerText = "Error: No se encontró 'yolo_model/model.json'";
        document.getElementById('model-status').style.color = "red";
    }
}

async function runDetection() {
    if (!isModelLoaded) return;

    // Ejecutar detección en un loop eficiente
    await detectObjects();
    
    // Usar requestAnimationFrame para el siguiente frame
    requestAnimationFrame(runDetection);
}

async function detectObjects() {
    // 0. Verificar que el video esté listo para evitar error de textura 0x0
    if (!video || video.width === 0 || video.elt.readyState < 2) return;

    // 1. Pre-procesamiento de la imagen
    const [modelWidth, modelHeight] = [INPUT_SIZE, INPUT_SIZE];
    
    const input = tf.tidy(() => {
        return tf.browser.fromPixels(video.elt)
            .resizeNearestNeighbor([modelWidth, modelHeight])
            .toFloat()
            .div(tf.scalar(255.0))
            .expandDims(0);
    });

    // 2. Ejecución de la inferencia
    // YOLOv8 devuelve un solo tensor de salida
    const result = model.execute(input); // Cambiado a execute
    
    // 3. Post-procesamiento
    // El resultado suele tener forma [1, 84, 8400] (80 clases + 4 coords)
    // Transponer para tener [8400, 84]
    const predictions = tf.tidy(() => {
        const res = result.transpose([0, 2, 1]); // [1, 8400, 84]
        return res.reshape([res.shape[1], res.shape[2]]); // [8400, 84]
    });

    // Procesar las predicciones en la CPU para el filtrado NMS
    const outputData = await predictions.array();
    
    let boxes = [];
    let scores = [];
    let classIndices = [];

    // Iterar sobre las 8400 posibles detecciones
    for (let i = 0; i < outputData.length; i++) {
        const row = outputData[i];
        
        // Las primeras 4 columnas son x_center, y_center, width, height (normalizadas 0-1 o en px según export)
        // En YOLOv8 TFJS suelen venir escaladas al tamaño de entrada (640x640)
        const [x_center, y_center, w, h] = row.slice(0, 4);
        
        // El resto son los scores de las clases
        const classScores = row.slice(4);
        const maxScore = Math.max(...classScores);
        const classId = classScores.indexOf(maxScore);

        if (maxScore > CONFIDENCE_THRESHOLD) {
            // Convertir coordenadas center-XYWH a corner-XYWH para NMS
            const x1 = (x_center - w / 2) / INPUT_SIZE;
            const y1 = (y_center - h / 2) / INPUT_SIZE;
            const x2 = (x_center + w / 2) / INPUT_SIZE;
            const y2 = (y_center + h / 2) / INPUT_SIZE;

            boxes.push([y1, x1, y2, x2]); // TF.js NMS espera [y1, x1, y2, x2]
            scores.push(maxScore);
            classIndices.push(classId);
        }
    }

    // Aplicar Non-Maximum Suppression (NMS) para eliminar cajas duplicadas
    if (boxes.length > 0) {
        const boxesTensor = tf.tensor2d(boxes);
        const scoresTensor = tf.tensor1d(scores);
        
        const nmsIndices = await tf.image.nonMaxSuppressionAsync(
            boxesTensor,
            scoresTensor,
            20, // Máximo número de detecciones
            IOU_THRESHOLD,
            CONFIDENCE_THRESHOLD
        );

        const indices = await nmsIndices.array();
        
        // Filtrar detecciones finales
        detections = indices.map(idx => {
            const [y1, x1, y2, x2] = boxes[idx];
            return {
                bbox: [
                    x1 * width, 
                    y1 * height, 
                    (x2 - x1) * width, 
                    (y2 - y1) * height
                ],
                label: classNames[classIndices[idx]] || `Clase ${classIndices[idx]}`,
                score: scores[idx]
            };
        });

        // Limpiar tensores
        boxesTensor.dispose();
        scoresTensor.dispose();
        nmsIndices.dispose();
    } else {
        detections = [];
    }

    // Limpiar tensores de inferencia
    input.dispose();
    result.dispose();
    predictions.dispose();
}

function draw() {
    // Dibujar el video de fondo
    image(video, 0, 0, width, height);

    // Dibujar todas las detecciones
    for (let d of detections) {
        const [x, y, w, h] = d.bbox;

        // Estilo de la caja
        noFill();
        stroke(0, 255, 0);
        strokeWeight(3);
        rect(x, y, w, h);

        // Estilo del texto
        fill(0, 255, 0);
        noStroke();
        textSize(18);
        const info = `${d.label} (${Math.round(d.score * 100)}%)`;
        const textW = textWidth(info);
        
        // Fondo pequeño para el texto
        fill(0, 0, 0, 150);
        rect(x, y - 25, textW + 10, 25);
        
        fill(0, 255, 0);
        text(info, x + 5, y - 7);
    }
}
