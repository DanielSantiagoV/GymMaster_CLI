/**
 * Script de prueba para funcionalidad de Backup y Restore
 * Verifica que los servicios funcionen correctamente
 */

const { MongoClient } = require('mongodb');
const BackupService = require('../services/BackupService');
require('dotenv').config();

async function testBackupFunctionality() {
    let client = null;
    
    try {
        console.log('🧪 Iniciando pruebas de Backup y Restore...\n');
        
        // Conectar a MongoDB
        const mongoUrl = process.env.MONGODB_URI || 'mongodb://localhost:27017/gymmaster';
        client = new MongoClient(mongoUrl);
        await client.connect();
        const db = client.db('gymmaster');
        
        console.log('✅ Conexión a MongoDB establecida');
        
        // Crear instancia del servicio
        const backupService = new BackupService(db);
        
        // Test 1: Listar backups (debería estar vacío inicialmente)
        console.log('\n📋 Test 1: Listar backups disponibles');
        const backups = backupService.listarBackups();
        console.log(`Backups encontrados: ${backups.length}`);
        
        // Test 2: Crear backup completo
        console.log('\n📦 Test 2: Crear backup completo');
        const resultadoBackup = await backupService.backupCompleto();
        
        if (resultadoBackup.success) {
            console.log('✅ Backup completo exitoso');
            console.log(`   Archivo: ${resultadoBackup.filename}`);
            console.log(`   Tamaño: ${resultadoBackup.fileSize} KB`);
            console.log(`   Colecciones: ${resultadoBackup.collections.length}`);
            console.log(`   Documentos: ${resultadoBackup.totalDocuments}`);
        } else {
            console.log('❌ Error en backup completo:', resultadoBackup.error);
        }
        
        // Test 3: Listar backups después del backup
        console.log('\n📋 Test 3: Listar backups después del backup');
        const backupsDespues = backupService.listarBackups();
        console.log(`Backups encontrados: ${backupsDespues.length}`);
        
        if (backupsDespues.length > 0) {
            const ultimoBackup = backupsDespues[0];
            console.log(`   Último backup: ${ultimoBackup.filename}`);
            console.log(`   Tamaño: ${ultimoBackup.size} KB`);
        }
        
        // Test 4: Validar esquema del backup
        if (backupsDespues.length > 0) {
            console.log('\n🔍 Test 4: Validar esquema del backup');
            const validacion = await backupService.validarEsquemaBackup(backupsDespues[0].filePath);
            
            if (validacion.success) {
                console.log('✅ Esquema válido');
                console.log(`   Colecciones: ${validacion.colecciones.join(', ')}`);
                console.log(`   Documentos: ${validacion.totalDocuments}`);
            } else {
                console.log('❌ Esquema inválido:', validacion.error);
            }
        }
        
        // Test 5: Obtener información del backup
        if (backupsDespues.length > 0) {
            console.log('\n📊 Test 5: Información del backup');
            const info = backupService.obtenerInfoBackup(backupsDespues[0].filePath);
            
            if (info.error) {
                console.log('❌ Error obteniendo información:', info.error);
            } else {
                console.log('✅ Información obtenida');
                console.log(`   Archivo: ${info.archivo}`);
                console.log(`   Tamaño: ${info.tamaño}`);
                console.log(`   Tipo: ${info.metadata.tipo}`);
                console.log(`   Colecciones: ${info.colecciones.join(', ')}`);
                console.log(`   Total documentos: ${info.totalDocumentos}`);
            }
        }
        
        // Test 6: Crear backup seleccionado
        console.log('\n🎯 Test 6: Crear backup seleccionado');
        const resultadoSeleccionado = await backupService.backupSeleccionado(['clientes', 'contratos']);
        
        if (resultadoSeleccionado.success) {
            console.log('✅ Backup seleccionado exitoso');
            console.log(`   Archivo: ${resultadoSeleccionado.filename}`);
            console.log(`   Tamaño: ${resultadoSeleccionado.fileSize} KB`);
            console.log(`   Colecciones: ${resultadoSeleccionado.collections.join(', ')}`);
            console.log(`   Documentos: ${resultadoSeleccionado.totalDocuments}`);
        } else {
            console.log('❌ Error en backup seleccionado:', resultadoSeleccionado.error);
        }
        
        console.log('\n🎉 Pruebas completadas exitosamente!');
        
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
    testBackupFunctionality().catch(console.error);
}

module.exports = testBackupFunctionality;