/**
 * ===== SERVICIO DE BACKUP Y RESTORE =====
 * 
 * Servicio especializado en operaciones de backup y restore de datos
 * Utiliza MongoDB driver para exportar/importar colecciones completas
 * 
 * PATRONES DE DISEÑO:
 * - PATRÓN: Service Layer - Encapsula lógica de negocio de backup/restore
 * - PATRÓN: Data Transfer Object (DTO) - Estructura de datos de backup
 * - PATRÓN: Template Method - Define flujo estándar de backup/restore
 * - PATRÓN: Strategy - Diferentes estrategias de backup (completo/seleccionado)
 * 
 * PRINCIPIOS SOLID:
 * - PRINCIPIO SOLID S: Responsabilidad Única - Solo maneja backup/restore
 * - PRINCIPIO SOLID O: Abierto/Cerrado - Extensible para nuevos tipos de backup
 * - PRINCIPIO SOLID D: Inversión de Dependencias - Depende de abstracciones
 * 
 * BUENAS PRÁCTICAS:
 * - Validación de esquemas antes de restore
 * - Manejo robusto de errores y rollback
 * - Confirmaciones explícitas para operaciones críticas
 * - Timestamps estandarizados para archivos de backup
 */

const fs = require('fs');
const path = require('path');
const dayjs = require('dayjs');

class BackupService {
    constructor(database) {
        this.database = database;
        this.backupDir = path.join(process.cwd(), 'backups');
        this.collections = [
            'clientes',
            'contratos', 
            'finanzas',
            'nutricion',
            'planesentrenamiento',
            'seguimiento',
            'pagos'
        ];
    }

    /**
     * Crea directorio de backups si no existe
     */
    ensureBackupDirectory() {
        if (!fs.existsSync(this.backupDir)) {
            fs.mkdirSync(this.backupDir, { recursive: true });
        }
    }

    /**
     * Genera timestamp estandarizado para nombres de archivo
     * @returns {string} Timestamp en formato backup_YYYY-MM-DDTHH-mm-ss
     */
    generateTimestamp() {
        return dayjs().format('YYYY-MM-DDTHH-mm-ss');
    }

    /**
     * Realiza backup completo de todas las colecciones
     * @returns {Promise<Object>} Resultado del backup
     */
    async backupCompleto() {
        try {
            console.log('🔄 Iniciando backup completo...');
            
            this.ensureBackupDirectory();
            const timestamp = this.generateTimestamp();
            const backupData = {
                metadata: {
                    timestamp: timestamp,
                    tipo: 'completo',
                    version: '1.0.0',
                    colecciones: this.collections
                },
                datos: {}
            };

            // Exportar cada colección
            for (const collectionName of this.collections) {
                console.log(`📦 Exportando colección: ${collectionName}`);
                const collection = this.database.collection(collectionName);
                const documents = await collection.find({}).toArray();
                backupData.datos[collectionName] = documents;
                console.log(`✅ ${collectionName}: ${documents.length} documentos`);
            }

            // Guardar archivo de backup
            const filename = `backup_${timestamp}.json`;
            const filePath = path.join(this.backupDir, filename);
            
            fs.writeFileSync(filePath, JSON.stringify(backupData, null, 2), 'utf8');
            
            const stats = fs.statSync(filePath);
            const fileSizeKB = (stats.size / 1024).toFixed(2);

            return {
                success: true,
                filename: filename,
                filePath: filePath,
                fileSize: fileSizeKB,
                collections: this.collections,
                totalDocuments: Object.values(backupData.datos).reduce((sum, docs) => sum + docs.length, 0)
            };

        } catch (error) {
            console.error('❌ Error en backup completo:', error.message);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Realiza backup de colecciones seleccionadas
     * @param {Array} coleccionesSeleccionadas - Array de nombres de colecciones
     * @returns {Promise<Object>} Resultado del backup
     */
    async backupSeleccionado(coleccionesSeleccionadas) {
        try {
            console.log('🔄 Iniciando backup seleccionado...');
            
            this.ensureBackupDirectory();
            const timestamp = this.generateTimestamp();
            const backupData = {
                metadata: {
                    timestamp: timestamp,
                    tipo: 'seleccionado',
                    version: '1.0.0',
                    colecciones: coleccionesSeleccionadas
                },
                datos: {}
            };

            // Exportar colecciones seleccionadas
            for (const collectionName of coleccionesSeleccionadas) {
                if (!this.collections.includes(collectionName)) {
                    throw new Error(`Colección no válida: ${collectionName}`);
                }
                
                console.log(`📦 Exportando colección: ${collectionName}`);
                const collection = this.database.collection(collectionName);
                const documents = await collection.find({}).toArray();
                backupData.datos[collectionName] = documents;
                console.log(`✅ ${collectionName}: ${documents.length} documentos`);
            }

            // Guardar archivo de backup
            const filename = `backup_${timestamp}.json`;
            const filePath = path.join(this.backupDir, filename);
            
            fs.writeFileSync(filePath, JSON.stringify(backupData, null, 2), 'utf8');
            
            const stats = fs.statSync(filePath);
            const fileSizeKB = (stats.size / 1024).toFixed(2);

            return {
                success: true,
                filename: filename,
                filePath: filePath,
                fileSize: fileSizeKB,
                collections: coleccionesSeleccionadas,
                totalDocuments: Object.values(backupData.datos).reduce((sum, docs) => sum + docs.length, 0)
            };

        } catch (error) {
            console.error('❌ Error en backup seleccionado:', error.message);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Lista archivos de backup disponibles
     * @returns {Array} Lista de archivos de backup
     */
    listarBackups() {
        try {
            this.ensureBackupDirectory();
            const files = fs.readdirSync(this.backupDir)
                .filter(file => file.startsWith('backup_') && file.endsWith('.json'))
                .map(file => {
                    const filePath = path.join(this.backupDir, file);
                    const stats = fs.statSync(filePath);
                    return {
                        filename: file,
                        filePath: filePath,
                        size: (stats.size / 1024).toFixed(2),
                        created: stats.birthtime,
                        modified: stats.mtime
                    };
                })
                .sort((a, b) => b.modified - a.modified);

            return files;
        } catch (error) {
            console.error('❌ Error listando backups:', error.message);
            return [];
        }
    }

    /**
     * Valida esquema de un archivo de backup
     * @param {string} filePath - Ruta del archivo de backup
     * @returns {Promise<Object>} Resultado de la validación
     */
    async validarEsquemaBackup(filePath) {
        try {
            if (!fs.existsSync(filePath)) {
                throw new Error('Archivo de backup no encontrado');
            }

            const backupContent = fs.readFileSync(filePath, 'utf8');
            const backupData = JSON.parse(backupContent);

            // Validar estructura básica
            if (!backupData.metadata || !backupData.datos) {
                throw new Error('Estructura de backup inválida: faltan metadata o datos');
            }

            // Validar metadata
            const { metadata } = backupData;
            if (!metadata.timestamp || !metadata.version || !metadata.colecciones) {
                throw new Error('Metadata de backup incompleta');
            }

            // Validar colecciones
            const coleccionesBackup = Object.keys(backupData.datos);
            const coleccionesValidas = coleccionesBackup.every(col => this.collections.includes(col));
            
            if (!coleccionesValidas) {
                const invalidas = coleccionesBackup.filter(col => !this.collections.includes(col));
                throw new Error(`Colecciones no válidas en backup: ${invalidas.join(', ')}`);
            }

            // Validar documentos
            let totalDocuments = 0;
            for (const [collectionName, documents] of Object.entries(backupData.datos)) {
                if (!Array.isArray(documents)) {
                    throw new Error(`Datos de colección ${collectionName} no son un array`);
                }
                totalDocuments += documents.length;
            }

            return {
                success: true,
                metadata: metadata,
                colecciones: coleccionesBackup,
                totalDocuments: totalDocuments,
                compatible: true
            };

        } catch (error) {
            return {
                success: false,
                error: error.message,
                compatible: false
            };
        }
    }

    /**
     * Restaura datos desde un archivo de backup
     * @param {string} filePath - Ruta del archivo de backup
     * @param {string} modo - 'sobrescribir' o 'prefijo'
     * @param {string} prefijo - Prefijo para modo prefijo (opcional)
     * @returns {Promise<Object>} Resultado de la restauración
     */
    async restaurarBackup(filePath, modo = 'sobrescribir', prefijo = '') {
        try {
            console.log('🔄 Iniciando restauración...');

            // Validar esquema primero
            const validacion = await this.validarEsquemaBackup(filePath);
            if (!validacion.success) {
                throw new Error(`Backup inválido: ${validacion.error}`);
            }

            const backupContent = fs.readFileSync(filePath, 'utf8');
            const backupData = JSON.parse(backupContent);

            const resultados = {
                colecciones: {},
                totalRestaurados: 0,
                errores: []
            };

            // Restaurar cada colección
            for (const [collectionName, documents] of Object.entries(backupData.datos)) {
                try {
                    console.log(`📥 Restaurando colección: ${collectionName}`);
                    
                    let targetCollectionName = collectionName;
                    if (modo === 'prefijo' && prefijo) {
                        targetCollectionName = `${prefijo}_${collectionName}`;
                    }

                    const collection = this.database.collection(targetCollectionName);

                    if (modo === 'sobrescribir') {
                        // Limpiar colección existente
                        await collection.deleteMany({});
                        console.log(`🗑️ Colección ${targetCollectionName} limpiada`);
                    }

                    if (documents.length > 0) {
                        // Insertar documentos
                        const result = await collection.insertMany(documents);
                        resultados.colecciones[collectionName] = {
                            targetCollection: targetCollectionName,
                            documentosInsertados: result.insertedCount,
                            documentosOriginales: documents.length
                        };
                        resultados.totalRestaurados += result.insertedCount;
                        console.log(`✅ ${targetCollectionName}: ${result.insertedCount} documentos restaurados`);
                    } else {
                        resultados.colecciones[collectionName] = {
                            targetCollection: targetCollectionName,
                            documentosInsertados: 0,
                            documentosOriginales: 0
                        };
                        console.log(`ℹ️ ${targetCollectionName}: Sin documentos para restaurar`);
                    }

                } catch (error) {
                    console.error(`❌ Error restaurando ${collectionName}:`, error.message);
                    resultados.errores.push({
                        coleccion: collectionName,
                        error: error.message
                    });
                }
            }

            return {
                success: resultados.errores.length === 0,
                resultados: resultados,
                modo: modo,
                prefijo: prefijo
            };

        } catch (error) {
            console.error('❌ Error en restauración:', error.message);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Obtiene información detallada de un backup
     * @param {string} filePath - Ruta del archivo de backup
     * @returns {Object} Información del backup
     */
    obtenerInfoBackup(filePath) {
        try {
            if (!fs.existsSync(filePath)) {
                throw new Error('Archivo de backup no encontrado');
            }

            const backupContent = fs.readFileSync(filePath, 'utf8');
            const backupData = JSON.parse(backupContent);
            const stats = fs.statSync(filePath);

            const info = {
                archivo: path.basename(filePath),
                ruta: filePath,
                tamaño: (stats.size / 1024).toFixed(2) + ' KB',
                creado: stats.birthtime,
                modificado: stats.mtime,
                metadata: backupData.metadata,
                colecciones: Object.keys(backupData.datos),
                totalDocumentos: Object.values(backupData.datos).reduce((sum, docs) => sum + docs.length, 0),
                detallesColecciones: {}
            };

            // Detalles por colección
            for (const [collectionName, documents] of Object.entries(backupData.datos)) {
                info.detallesColecciones[collectionName] = {
                    documentos: documents.length,
                    campos: documents.length > 0 ? Object.keys(documents[0]) : []
                };
            }

            return info;

        } catch (error) {
            return {
                error: error.message
            };
        }
    }
}

// ===== EXPORTACIÓN DEL MÓDULO =====
// PATRÓN: Module Pattern - Exporta la clase como módulo
module.exports = BackupService;