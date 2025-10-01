/**
 * Script de prueba para funcionalidad de Restore
 * Verifica que la restauración funcione correctamente
 */

const { MongoClient } = require('mongodb');
const BackupService = require('../services/BackupService');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function testRestoreFunctionality() {
    let client = null;
    
    try {
        console.log('🧪 Iniciando pruebas de Restore...\n');
        
        // Conectar a MongoDB
        const mongoUrl = process.env.MONGODB_URI || 'mongodb://localhost:27017/gymmaster';
        client = new MongoClient(mongoUrl);
        await client.connect();
        const db = client.db('gymmaster');
        
        console.log('✅ Conexión a MongoDB establecida');
        
        // Crear instancia del servicio
        const backupService = new BackupService(db);
        
        // Buscar un archivo de backup para probar
        const backups = backupService.listarBackups();
        if (backups.length === 0) {
            console.log('❌ No hay backups disponibles para probar restore');
            return;
        }
        
        const backupFile = backups[0];
        console.log(`📁 Usando backup: ${backupFile.filename}`);
        
        // Test 1: Validar esquema antes de restore
        console.log('\n🔍 Test 1: Validar esquema del backup');
        const validacion = await backupService.validarEsquemaBackup(backupFile.filePath);
        
        if (validacion.success) {
            console.log('✅ Esquema válido');
            console.log(`   Colecciones: ${validacion.colecciones.join(', ')}`);
            console.log(`   Documentos: ${validacion.totalDocuments}`);
        } else {
            console.log('❌ Esquema inválido:', validacion.error);
            return;
        }
        
        // Test 2: Restaurar con prefijo (modo seguro)
        console.log('\n🔄 Test 2: Restaurar con prefijo (modo seguro)');
        const resultadoPrefijo = await backupService.restaurarBackup(
            backupFile.filePath, 
            'prefijo', 
            'test'
        );
        
        if (resultadoPrefijo.success) {
            console.log('✅ Restore con prefijo exitoso');
            console.log(`   Total documentos restaurados: ${resultadoPrefijo.resultados.totalRestaurados}`);
            console.log(`   Modo: ${resultadoPrefijo.modo}`);
            console.log(`   Prefijo: ${resultadoPrefijo.prefijo}`);
            
            console.log('\n📋 Detalles por colección:');
            for (const [collectionName, details] of Object.entries(resultadoPrefijo.resultados.colecciones)) {
                console.log(`   ${collectionName}:`);
                console.log(`     Documentos insertados: ${details.documentosInsertados}`);
                console.log(`     Colección destino: ${details.targetCollection}`);
            }
            
            if (resultadoPrefijo.resultados.errores.length > 0) {
                console.log('\n⚠️ Errores parciales:');
                resultadoPrefijo.resultados.errores.forEach(error => {
                    console.log(`   ${error.coleccion}: ${error.error}`);
                });
            }
        } else {
            console.log('❌ Error en restore con prefijo:', resultadoPrefijo.error);
        }
        
        // Test 3: Verificar que las colecciones con prefijo existen
        console.log('\n🔍 Test 3: Verificar colecciones con prefijo');
        for (const collectionName of validacion.colecciones) {
            const prefixedCollectionName = `test_${collectionName}`;
            const collection = db.collection(prefixedCollectionName);
            const count = await collection.countDocuments();
            console.log(`   ${prefixedCollectionName}: ${count} documentos`);
        }
        
        // Test 4: Limpiar colecciones de prueba
        console.log('\n🧹 Test 4: Limpiar colecciones de prueba');
        for (const collectionName of validacion.colecciones) {
            const prefixedCollectionName = `test_${collectionName}`;
            const collection = db.collection(prefixedCollectionName);
            const result = await collection.drop().catch(() => null);
            if (result !== null) {
                console.log(`   ✅ Colección ${prefixedCollectionName} eliminada`);
            }
        }
        
        console.log('\n🎉 Pruebas de restore completadas exitosamente!');
        
    } catch (error) {
        console.error('❌ Error en las pruebas:', error.message);
        console.error(error.stack);
    } finally {
        if (client) {
            await client.close();
            console.log('\n🔌 Conexión cerrada');
        }
    }
}

// Ejecutar pruebas
if (require.main === module) {
    testRestoreFunctionality().catch(console.error);
}

module.exports = testRestoreFunctionality;