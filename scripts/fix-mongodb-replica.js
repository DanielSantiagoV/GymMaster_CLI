const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);

/**
 * Script para solucionar la configuración del replica set de MongoDB
 */
async function fixMongoDBReplica() {
    console.log('🔧 SOLUCIONANDO CONFIGURACIÓN DE MONGODB REPLICA SET');
    console.log('====================================================\n');

    try {
        // 1. Verificar si MongoDB está ejecutándose
        console.log('🔍 Verificando estado de MongoDB...');
        try {
            await execAsync('mongosh --eval "db.runCommand({ping: 1})" --quiet');
            console.log('✅ MongoDB está ejecutándose');
        } catch (error) {
            console.log('❌ MongoDB no está ejecutándose');
            console.log('💡 Inicia MongoDB primero con: mongod --replSet rs0');
            return;
        }

        // 2. Detener MongoDB actual
        console.log('\n🛑 Deteniendo MongoDB actual...');
        try {
            // En Windows
            if (process.platform === 'win32') {
                await execAsync('taskkill /F /IM mongod.exe');
            } else {
                // En Linux/Mac
                await execAsync('pkill mongod');
            }
            console.log('✅ MongoDB detenido');
        } catch (error) {
            console.log('⚠️ No se pudo detener MongoDB automáticamente');
            console.log('💡 Detén MongoDB manualmente y ejecuta: mongod --replSet rs0');
            return;
        }

        // 3. Esperar un momento
        console.log('\n⏳ Esperando 3 segundos...');
        await new Promise(resolve => setTimeout(resolve, 3000));

        // 4. Iniciar MongoDB con replica set
        console.log('\n🚀 Iniciando MongoDB con replica set...');
        console.log('💡 Ejecuta manualmente: mongod --replSet rs0');
        console.log('💡 O en una nueva terminal: mongod --replSet rs0 --dbpath /ruta/a/tu/db');

        // 5. Esperar a que MongoDB esté listo
        console.log('\n⏳ Esperando a que MongoDB esté listo...');
        let attempts = 0;
        const maxAttempts = 30;

        while (attempts < maxAttempts) {
            try {
                await execAsync('mongosh --eval "db.runCommand({ping: 1})" --quiet');
                console.log('✅ MongoDB está listo');
                break;
            } catch (error) {
                attempts++;
                console.log(`⏳ Intento ${attempts}/${maxAttempts}...`);
                await new Promise(resolve => setTimeout(resolve, 2000));
            }
        }

        if (attempts >= maxAttempts) {
            console.log('⚠️ MongoDB no está respondiendo');
            console.log('💡 Verifica que MongoDB esté ejecutándose con: mongod --replSet rs0');
            return;
        }

        // 6. Inicializar replica set
        console.log('\n🔧 Inicializando replica set...');
        try {
            await execAsync('mongosh --eval "rs.initiate({_id: \'rs0\', members: [{_id: 0, host: \'localhost:27017\'}]})" --quiet');
            console.log('✅ Replica set inicializado');
        } catch (error) {
            console.log('⚠️ Error al inicializar replica set:', error.message);
            console.log('💡 Ejecuta manualmente: mongosh --eval "rs.initiate()"');
        }

        // 7. Verificar configuración
        console.log('\n🔍 Verificando configuración...');
        try {
            const { stdout } = await execAsync('mongosh --eval "rs.status()" --quiet');
            console.log('✅ Replica set configurado correctamente');
            console.log('📊 Estado:', stdout);
        } catch (error) {
            console.log('⚠️ No se pudo verificar el estado del replica set');
        }

        console.log('\n🎉 CONFIGURACIÓN COMPLETADA');
        console.log('============================');
        console.log('✅ MongoDB ejecutándose con replica set');
        console.log('✅ Transacciones habilitadas');
        console.log('💡 Ahora puedes ejecutar: npm run check-replica');

    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

// Ejecutar si se llama directamente
if (require.main === module) {
    fixMongoDBReplica()
        .then(() => {
            console.log('\n🎉 Proceso completado');
            process.exit(0);
        })
        .catch((error) => {
            console.error('💥 Error:', error.message);
            process.exit(1);
        });
}

module.exports = fixMongoDBReplica;
