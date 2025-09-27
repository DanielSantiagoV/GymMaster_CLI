@echo off
echo 🔧 CONFIGURANDO MONGODB COMO REPLICA SET
echo =========================================
echo.

echo 🛑 Deteniendo MongoDB...
net stop MongoDB

echo.
echo ⏳ Esperando 3 segundos...
timeout /t 3 /nobreak >nul

echo.
echo 🚀 Iniciando MongoDB con replica set...
echo 💡 Ejecutando: mongod --replSet rs0
echo.

start "MongoDB Replica Set" /min mongod --replSet rs0

echo ⏳ Esperando a que MongoDB esté listo...
timeout /t 8 /nobreak >nul

echo.
echo 🔧 Inicializando replica set...
mongosh --eval "rs.initiate({_id: 'rs0', members: [{_id: 0, host: 'localhost:27017'}]})" --quiet

echo.
echo ✅ CONFIGURACIÓN COMPLETADA
echo ============================
echo ✅ MongoDB ejecutándose con replica set
echo ✅ Transacciones habilitadas
echo.
echo 💡 Ahora puedes ejecutar: npm start
echo.

pause
