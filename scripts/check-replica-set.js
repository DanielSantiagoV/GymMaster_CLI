const DatabaseConfig = require('../config/database');

/**
 * Script para verificar el estado del replica set y las transacciones
 */
async function checkReplicaSet() {
    const dbConfig = new DatabaseConfig();
    
    try {
        console.log('🔌 Conectando a MongoDB...');
        await dbConfig.connect();
        
        console.log('🔍 Verificando disponibilidad de transacciones...');
        const transactionsAvailable = await dbConfig.areTransactionsAvailable();
        
        if (transactionsAvailable) {
            console.log('✅ Las transacciones están disponibles');
            
            try {
                console.log('📊 Información del replica set:');
                const replicaSetInfo = await dbConfig.getReplicaSetInfo();
                console.log(`   Nombre: ${replicaSetInfo.set}`);
                console.log(`   Estado: ${replicaSetInfo.myState === 1 ? 'Primario' : 'Secundario'}`);
                console.log(`   Miembros: ${replicaSetInfo.members.length}`);
                
                replicaSetInfo.members.forEach((member, index) => {
                    const state = member.state === 1 ? 'Primario' : 
                                 member.state === 2 ? 'Secundario' : 
                                 member.state === 7 ? 'Arbitro' : 'Desconocido';
                    console.log(`   Miembro ${index}: ${member.name} (${state})`);
                });
                
            } catch (error) {
                console.log('⚠️ No se pudo obtener información del replica set:', error.message);
            }
            
        } else {
            console.log('❌ Las transacciones NO están disponibles');
            console.log('💡 Para habilitar transacciones, ejecuta: node scripts/setup-replica-set.js');
        }
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await dbConfig.disconnect();
    }
}

// Ejecutar si se llama directamente
if (require.main === module) {
    checkReplicaSet()
        .then(() => {
            console.log('🎉 Verificación completada');
            process.exit(0);
        })
        .catch((error) => {
            console.error('💥 Error:', error.message);
            process.exit(1);
        });
}

module.exports = checkReplicaSet;
