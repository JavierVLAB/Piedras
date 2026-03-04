#!/bin/bash

# --- 1. Configuración de Pantalla ---
# Desactivar el protector de pantalla y la gestión de energía
# para que la pantalla nunca se apague.
xset s noblank
xset s off
xset -dpms

# NUEVO: Ejecuta unclutter en segundo plano para ocultar el cursor
unclutter -idle 5 -display :0 -noevents &

# --- 2. Iniciar el Servidor Local ---
# Navega a la carpeta de tu proyecto
# CAMBIA ESTA RUTA por la real de tu proyecto:
cd /home/javi/Documentos/GitHub/Piedras/public

# Ejecutamos http-server en el puerto 8000 en segundo plano (&)
# -p 8000: Define el puerto (debe coincidir con la URL de Chrome abajo)
# -c-1: Desactiva el caché (muy recomendado para desarrollo/kioscos para ver siempre los cambios)
# --silent: (Opcional) Para que no llene el log de texto, quítalo si quieres ver errores
/home/javi/.nvm/versions/node/v24.11.0/bin/node /home/javi/.nvm/versions/node/v24.11.0/bin/http-server . 8020 -c-1 &

# Guardamos el ID del proceso
SERVER_PID=$!

# --- 3. Esperar al Servidor ---
# Esperamos 10 segundos para asegurar que Node ha arrancado
sleep 22

# --- 4. Lanza Google Chrome en modo Kiosco ---
export DISPLAY=:0
google-chrome --kiosk  "http://localhost:8080"
