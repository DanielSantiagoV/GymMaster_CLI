const { MongoClient } = require('mongodb');

/**
 * Script para configurar MongoDB como replica set
 * Esto es necesario para habilitar transacciones
 */
async function setupReplicaSet() {
    const client = new MongoClient('mongodb://localhost:27017');
    
    try {
        await client.connect();
        console.log('🔌 Conectado a MongoDB');
        
        const adminDb = client.db('admin');
        
        // Verificar si ya es un replica set
        try {
            const status = await adminDb.command({ replSetGetStatus: 1 });
            console.log('✅ MongoDB ya está configurado como replica set');
            console.log('Estado:', status.set);
            return;
        } catch (error) {
            console.log('⚠️ MongoDB no está configurado como replica set');
        }
        
        // Inicializar replica set
        console.log('🚀 Inicializando replica set...');
        
        const result = await adminDb.command({
            replSetInitiate: {
                _id: 'rs0',
                members: [
                    { _id: 0, host: 'localhost:27017' }
                ]
            }
        });
        
        console.log('✅ Replica set inicializado:', result);
        console.log('⏳ Esperando que el replica set esté listo...');
        
        // Esperar a que el replica set esté listo
        let attempts = 0;
        const maxAttempts = 30;
        
        while (attempts < maxAttempts) {
            try {
                const status = await adminDb.command({ replSetGetStatus: 1 });
                if (status.members && status.members.length > 0) {
                    const primary = status.members.find(m => m.state === 1);
                    if (primary) {
                        console.log('✅ Replica set está listo y funcionando');
                        console.log('Primario:', primary.name);
                        break;
                    }
                }
            } catch (error) {
                // Continuar esperando
            }
            
            attempts++;
            console.log(`⏳ Intento ${attempts}/${maxAttempts}...`);
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
        
        if (attempts >= maxAttempts) {
            console.log('⚠️ El replica set puede necesitar más tiempo para estar listo');
            console.log('Puedes verificar el estado manualmente con: rs.status()');
        }
        
    } catch (error) {
        console.error('❌ Error al configurar replica set:', error.message);
        throw error;
    } finally {
        await client.close();
    }
}

// Ejecutar si se llama directamente
if (require.main === module) {
    setupReplicaSet()
        .then(() => {
            console.log('🎉 Configuración completada');
            process.exit(0);
        })
        .catch((error) => {
            console.error('💥 Error:', error.message);
            process.exit(1);
        });
}

module.exports = setupReplicaSet;
