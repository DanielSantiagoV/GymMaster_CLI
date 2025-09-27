@echo off
echo 🔧 CONFIGURANDO MONGODB CON REPLICA SET
echo =====================================
echo.

echo 🛑 Deteniendo MongoDB actual...
taskkill /F /IM mongod.exe 2>nul
if %errorlevel% neq 0 (
    echo ⚠️ No se encontró MongoDB ejecutándose
) else (
    echo ✅ MongoDB detenido
)

echo.
echo ⏳ Esperando 3 segundos...
timeout /t 3 /nobreak >nul

echo.
echo 🚀 Iniciando MongoDB con replica set...
echo 💡 Ejecutando: mongod --replSet rs0
echo.

start "MongoDB Replica Set" mongod --replSet rs0

echo ⏳ Esperando a que MongoDB esté listo...
timeout /t 5 /nobreak >nul

echo.
echo 🔧 Inicializando replica set...
mongosh --eval "rs.initiate({_id: 'rs0', members: [{_id: 0, host: 'localhost:27017'}]})" --quiet

echo.
echo ✅ CONFIGURACIÓN COMPLETADA
echo ============================
echo ✅ MongoDB ejecutándose con replica set
echo ✅ Transacciones habilitadas
echo.
echo 💡 Ahora puedes ejecutar: npm run check-replica
echo 💡 O ejecutar la aplicación: npm start
echo.

pause
