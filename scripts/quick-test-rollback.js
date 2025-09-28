#!/usr/bin/env node

/**
 * Prueba Rápida - Rollback de Seguimientos
 * Script simple para verificar que el rollback funciona
 */

const { MongoClient, ObjectId } = require('mongodb');
const chalk = require('chalk');

async function pruebaRapidaRollback() {
    let client;
    
    try {
        console.log(chalk.cyan('🧪 PRUEBA RÁPIDA - ROLLBACK DE SEGUIMIENTOS'));
        console.log(chalk.gray('==========================================\n'));

        // 1. Conectar a MongoDB
        console.log(chalk.yellow('⏳ Conectando a MongoDB...'));
        client = new MongoClient('mongodb://localhost:27017');
        await client.connect();
        const db = client.db('gymmaster');
        console.log(chalk.green('✅ Conectado a MongoDB'));

        // 2. Limpiar datos de prueba anteriores
        console.log(chalk.yellow('🧹 Limpiando datos de prueba anteriores...'));
        await db.collection('seguimientos').deleteMany({ comentarios: /Test Rollback/ });
        console.log(chalk.green('✅ Datos limpiados'));

        // 3. Crear datos de prueba
        console.log(chalk.yellow('📝 Creando datos de prueba...'));
        
        const clienteId = new ObjectId();
        const contratoId = new ObjectId();
        
        // Crear seguimientos de prueba
        const seguimientos = [
            {
                _id: new ObjectId(),
                clienteId: clienteId,
                contratoId: contratoId,
                fecha: new Date(),
                peso: 70,
                grasaCorporal: 15,
                medidas: { cintura: 80, brazo: 30, pecho: 100 },
                comentarios: 'Test Rollback Seguimiento 1',
                fotos: [],
                fechaCreacion: new Date()
            },
            {
                _id: new ObjectId(),
                clienteId: clienteId,
                contratoId: contratoId,
                fecha: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
                peso: 71,
                grasaCorporal: 16,
                medidas: { cintura: 81, brazo: 31, pecho: 101 },
                comentarios: 'Test Rollback Seguimiento 2',
                fotos: [],
                fechaCreacion: new Date()
            }
        ];

        await db.collection('seguimientos').insertMany(seguimientos);
        console.log(chalk.green('✅ Seguimientos de prueba creados'));

        // 4. Verificar seguimientos iniciales
        const iniciales = await db.collection('seguimientos').countDocuments({ 
            comentarios: /Test Rollback/ 
        });
        console.log(chalk.blue(`📊 Seguimientos iniciales: ${iniciales}`));

        // 5. Probar rollback por contrato
        console.log(chalk.yellow('🔄 Probando rollback por contrato...'));
        
        const SeguimientoRepository = require('../repositories/SeguimientoRepository');
        const seguimientoRepo = new SeguimientoRepository(db);
        
        const rollbackResult = await seguimientoRepo.deleteFollowUpsByContractWithRollback(
            contratoId,
            'Test Rollback - Cancelación de contrato'
        );

        console.log(chalk.green(`✅ Rollback completado: ${rollbackResult.eliminados} seguimientos eliminados`));

        // 6. Verificar seguimientos finales
        const finales = await db.collection('seguimientos').countDocuments({ 
            comentarios: /Test Rollback/ 
        });
        console.log(chalk.blue(`📊 Seguimientos finales: ${finales}`));

        // 7. Generar reporte
        console.log(chalk.cyan('\n📋 REPORTE DE PRUEBA RÁPIDA'));
        console.log(chalk.gray('============================'));
        console.log(chalk.white(`Fecha: ${new Date().toLocaleString()}`));
        console.log(chalk.white(`Seguimientos iniciales: ${iniciales}`));
        console.log(chalk.white(`Seguimientos eliminados: ${rollbackResult.eliminados}`));
        console.log(chalk.white(`Seguimientos finales: ${finales}`));
        console.log('');

        const exito = finales === 0 && rollbackResult.eliminados > 0;
        
        if (exito) {
            console.log(chalk.green('✅ ESTADO: ROLLBACK FUNCIONANDO CORRECTAMENTE'));
            console.log(chalk.green('✅ Todos los seguimientos fueron eliminados'));
            console.log(chalk.green('✅ El rollback está funcionando como se esperaba'));
        } else {
            console.log(chalk.red('❌ ESTADO: ROLLBACK NO FUNCIONA CORRECTAMENTE'));
            console.log(chalk.red('❌ Algunos seguimientos no fueron eliminados'));
            console.log(chalk.red('❌ Revisar la implementación del rollback'));
        }

        // 8. Limpiar datos de prueba
        console.log(chalk.yellow('\n🧹 Limpiando datos de prueba...'));
        await db.collection('seguimientos').deleteMany({ comentarios: /Test Rollback/ });
        console.log(chalk.green('✅ Datos de prueba limpiados'));

        console.log(chalk.cyan('\n🎉 PRUEBA RÁPIDA COMPLETADA'));
        
        if (exito) {
            console.log(chalk.green('✅ El rollback de seguimientos está funcionando correctamente'));
            console.log(chalk.blue('💡 Puedes ejecutar la aplicación y probar manualmente con: npm start'));
        } else {
            console.log(chalk.red('❌ El rollback de seguimientos necesita revisión'));
        }

    } catch (error) {
        console.log(chalk.red('❌ Error durante la prueba:', error.message));
        console.log(chalk.red('❌ Stack trace:', error.stack));
    } finally {
        if (client) {
            await client.close();
            console.log(chalk.gray('🔌 Conexión a MongoDB cerrada'));
        }
    }
}

// Ejecutar si se llama directamente
if (require.main === module) {
    pruebaRapidaRollback();
}

module.exports = pruebaRapidaRollback;
