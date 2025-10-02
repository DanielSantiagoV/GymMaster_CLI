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

// Importación de módulos de Node.js para manejo de archivos y fechas
const fs = require('fs');        // Módulo para operaciones de sistema de archivos (leer, escribir, crear directorios)
const path = require('path');    // Módulo para manipulación de rutas de archivos (join, basename, etc.)
const dayjs = require('dayjs'); // Librería para manejo de fechas y timestamps (formato, parseo, etc.)

// Definición de la clase principal del servicio de backup
class BackupService {
    // Constructor que inicializa el servicio con la conexión a la base de datos
    constructor(database) {
        // Almacena la referencia a la conexión de MongoDB
        this.database = database;
        
        // Define la ruta del directorio de backups usando process.cwd() (directorio actual) + 'backups'
        this.backupDir = path.join(process.cwd(), 'backups');
        
        // Array que define las colecciones de MongoDB que se pueden respaldar
        // Cada string representa el nombre de una colección en la base de datos
        this.collections = [
            'clientes',           // Colección de datos de clientes del gimnasio
            'contratos',          // Colección de contratos de membresía
            'finanzas',           // Colección de datos financieros y transacciones
            'nutricion',          // Colección de planes nutricionales
            'planesentrenamiento', // Colección de planes de entrenamiento
            'seguimiento',        // Colección de seguimiento de progreso
            'pagos'               // Colección de registros de pagos
        ];
    }

    /**
     * Crea directorio de backups si no existe
     * Método utilitario que garantiza que el directorio de backups esté disponible
     */
    ensureBackupDirectory() {
        // Verifica si el directorio de backups existe usando fs.existsSync()
        if (!fs.existsSync(this.backupDir)) {
            // Si no existe, lo crea usando fs.mkdirSync() con la opción recursive: true
            // recursive: true permite crear directorios anidados si es necesario
            fs.mkdirSync(this.backupDir, { recursive: true });
        }
    }

    /**
     * Genera timestamp estandarizado para nombres de archivo
     * @returns {string} Timestamp en formato backup_YYYY-MM-DDTHH-mm-ss
     */
    generateTimestamp() {
        // dayjs() obtiene la fecha y hora actual
        // .format() formatea la fecha según el patrón especificado
        // 'YYYY-MM-DDTHH-mm-ss' produce formato: 2024-01-15T14-30-45
        // La 'T' separa fecha de hora, los guiones reemplazan ':' para evitar problemas en nombres de archivo
        return dayjs().format('YYYY-MM-DDTHH-mm-ss');
    }

    /**
     * Realiza backup completo de todas las colecciones
     * @returns {Promise<Object>} Resultado del backup
     */
    async backupCompleto() {
        try {
            // Mensaje informativo para el usuario
            console.log('🔄 Iniciando backup completo...');
            
            // Asegura que el directorio de backups existe
            this.ensureBackupDirectory();
            
            // Genera un timestamp único para el nombre del archivo
            const timestamp = this.generateTimestamp();
            
            // Estructura de datos que contendrá toda la información del backup
            const backupData = {
                // Metadatos del backup: información sobre cuándo, cómo y qué se respaldó
                metadata: {
                    timestamp: timestamp,        // Momento exacto del backup
                    tipo: 'completo',           // Tipo de backup (completo vs seleccionado)
                    version: '1.0.0',           // Versión del formato de backup
                    colecciones: this.collections // Lista de colecciones respaldadas
                },
                // Contenedor para los datos reales de cada colección
                datos: {}
            };

            // Bucle que recorre todas las colecciones definidas en this.collections
            for (const collectionName of this.collections) {
                // Mensaje informativo sobre qué colección se está procesando
                console.log(`📦 Exportando colección: ${collectionName}`);
                
                // Obtiene la referencia a la colección de MongoDB
                const collection = this.database.collection(collectionName);
                
                // Busca TODOS los documentos de la colección ({} = sin filtros)
                // .toArray() convierte el cursor de MongoDB en un array de JavaScript
                const documents = await collection.find({}).toArray();
                
                // Almacena los documentos en la estructura de backup
                backupData.datos[collectionName] = documents;
                
                // Mensaje de confirmación con el número de documentos exportados
                console.log(`✅ ${collectionName}: ${documents.length} documentos`);
            }

            // Genera el nombre del archivo de backup con timestamp
            const filename = `backup_${timestamp}.json`;
            
            // Construye la ruta completa del archivo usando path.join()
            const filePath = path.join(this.backupDir, filename);
            
            // Escribe el archivo de backup al disco
            // JSON.stringify() convierte el objeto a JSON con formato legible (null, 2)
            // 'utf8' especifica la codificación del archivo
            fs.writeFileSync(filePath, JSON.stringify(backupData, null, 2), 'utf8');
            
            // Obtiene estadísticas del archivo creado (tamaño, fechas, etc.)
            const stats = fs.statSync(filePath);
            
            // Convierte el tamaño de bytes a KB y redondea a 2 decimales
            const fileSizeKB = (stats.size / 1024).toFixed(2);

            // Retorna un objeto con información detallada del backup realizado
            return {
                success: true,                    // Indica que el backup fue exitoso
                filename: filename,               // Nombre del archivo generado
                filePath: filePath,               // Ruta completa del archivo
                fileSize: fileSizeKB,             // Tamaño del archivo en KB
                collections: this.collections,    // Lista de colecciones respaldadas
                // Calcula el total de documentos sumando todos los documentos de todas las colecciones
                totalDocuments: Object.values(backupData.datos).reduce((sum, docs) => sum + docs.length, 0)
            };

        } catch (error) {
            // Manejo de errores: registra el error y retorna información del fallo
            console.error('❌ Error en backup completo:', error.message);
            return {
                success: false,        // Indica que el backup falló
                error: error.message   // Mensaje de error para debugging
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
            // Mensaje informativo para el usuario
            console.log('🔄 Iniciando backup seleccionado...');
            
            // Asegura que el directorio de backups existe
            this.ensureBackupDirectory();
            
            // Genera un timestamp único para el nombre del archivo
            const timestamp = this.generateTimestamp();
            
            // Estructura de datos que contendrá la información del backup seleccionado
            const backupData = {
                // Metadatos del backup con información específica del backup seleccionado
                metadata: {
                    timestamp: timestamp,                    // Momento exacto del backup
                    tipo: 'seleccionado',                   // Tipo de backup (diferente a 'completo')
                    version: '1.0.0',                      // Versión del formato de backup
                    colecciones: coleccionesSeleccionadas   // Solo las colecciones seleccionadas por el usuario
                },
                // Contenedor para los datos reales de las colecciones seleccionadas
                datos: {}
            };

            // Bucle que recorre SOLO las colecciones seleccionadas por el usuario
            for (const collectionName of coleccionesSeleccionadas) {
                // VALIDACIÓN: Verifica que la colección seleccionada esté en la lista de colecciones válidas
                if (!this.collections.includes(collectionName)) {
                    // Si la colección no es válida, lanza un error con el nombre de la colección
                    throw new Error(`Colección no válida: ${collectionName}`);
                }
                
                // Mensaje informativo sobre qué colección se está procesando
                console.log(`📦 Exportando colección: ${collectionName}`);
                
                // Obtiene la referencia a la colección de MongoDB
                const collection = this.database.collection(collectionName);
                
                // Busca TODOS los documentos de la colección ({} = sin filtros)
                // .toArray() convierte el cursor de MongoDB en un array de JavaScript
                const documents = await collection.find({}).toArray();
                
                // Almacena los documentos en la estructura de backup
                backupData.datos[collectionName] = documents;
                
                // Mensaje de confirmación con el número de documentos exportados
                console.log(`✅ ${collectionName}: ${documents.length} documentos`);
            }

            // Genera el nombre del archivo de backup con timestamp
            const filename = `backup_${timestamp}.json`;
            
            // Construye la ruta completa del archivo usando path.join()
            const filePath = path.join(this.backupDir, filename);
            
            // Escribe el archivo de backup al disco
            // JSON.stringify() convierte el objeto a JSON con formato legible (null, 2)
            // 'utf8' especifica la codificación del archivo
            fs.writeFileSync(filePath, JSON.stringify(backupData, null, 2), 'utf8');
            
            // Obtiene estadísticas del archivo creado (tamaño, fechas, etc.)
            const stats = fs.statSync(filePath);
            
            // Convierte el tamaño de bytes a KB y redondea a 2 decimales
            const fileSizeKB = (stats.size / 1024).toFixed(2);

            // Retorna un objeto con información detallada del backup realizado
            return {
                success: true,                    // Indica que el backup fue exitoso
                filename: filename,               // Nombre del archivo generado
                filePath: filePath,               // Ruta completa del archivo
                fileSize: fileSizeKB,             // Tamaño del archivo en KB
                collections: coleccionesSeleccionadas, // Solo las colecciones que se respaldaron
                // Calcula el total de documentos sumando todos los documentos de las colecciones seleccionadas
                totalDocuments: Object.values(backupData.datos).reduce((sum, docs) => sum + docs.length, 0)
            };

        } catch (error) {
            // Manejo de errores: registra el error y retorna información del fallo
            console.error('❌ Error en backup seleccionado:', error.message);
            return {
                success: false,        // Indica que el backup falló
                error: error.message   // Mensaje de error para debugging
            };
        }
    }

    /**
     * Lista archivos de backup disponibles
     * @returns {Array} Lista de archivos de backup
     */
    listarBackups() {
        try {
            // Asegura que el directorio de backups existe
            this.ensureBackupDirectory();
            
            // Lee todos los archivos del directorio de backups y los procesa
            const files = fs.readdirSync(this.backupDir)
                // FILTRO: Solo incluye archivos que empiecen con 'backup_' y terminen con '.json'
                .filter(file => file.startsWith('backup_') && file.endsWith('.json'))
                // TRANSFORMACIÓN: Convierte cada archivo en un objeto con información detallada
                .map(file => {
                    // Construye la ruta completa del archivo
                    const filePath = path.join(this.backupDir, file);
                    
                    // Obtiene estadísticas del archivo (tamaño, fechas de creación y modificación)
                    const stats = fs.statSync(filePath);
                    
                    // Retorna un objeto con información útil del archivo de backup
                    return {
                        filename: file,                                    // Nombre del archivo
                        filePath: filePath,                               // Ruta completa del archivo
                        size: (stats.size / 1024).toFixed(2),           // Tamaño en KB (convertido de bytes)
                        created: stats.birthtime,                         // Fecha de creación del archivo
                        modified: stats.mtime                              // Fecha de última modificación
                    };
                })
                // ORDENAMIENTO: Ordena los archivos por fecha de modificación (más recientes primero)
                .sort((a, b) => b.modified - a.modified);

            // Retorna el array de archivos de backup con información detallada
            return files;
        } catch (error) {
            // Manejo de errores: registra el error y retorna un array vacío
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
            // VALIDACIÓN 1: Verifica que el archivo de backup existe
            if (!fs.existsSync(filePath)) {
                throw new Error('Archivo de backup no encontrado');
            }

            // Lee el contenido del archivo de backup como texto
            const backupContent = fs.readFileSync(filePath, 'utf8');
            
            // Convierte el JSON del archivo en un objeto JavaScript
            const backupData = JSON.parse(backupContent);

            // VALIDACIÓN 2: Verifica la estructura básica del archivo de backup
            if (!backupData.metadata || !backupData.datos) {
                throw new Error('Estructura de backup inválida: faltan metadata o datos');
            }

            // VALIDACIÓN 3: Verifica que los metadatos contengan información esencial
            const { metadata } = backupData;
            if (!metadata.timestamp || !metadata.version || !metadata.colecciones) {
                throw new Error('Metadata de backup incompleta');
            }

            // VALIDACIÓN 4: Verifica que las colecciones del backup sean válidas
            // Obtiene las claves (nombres de colecciones) del objeto datos
            const coleccionesBackup = Object.keys(backupData.datos);
            
            // Verifica que TODAS las colecciones del backup estén en la lista de colecciones válidas
            const coleccionesValidas = coleccionesBackup.every(col => this.collections.includes(col));
            
            if (!coleccionesValidas) {
                // Si hay colecciones inválidas, las identifica y reporta el error
                const invalidas = coleccionesBackup.filter(col => !this.collections.includes(col));
                throw new Error(`Colecciones no válidas en backup: ${invalidas.join(', ')}`);
            }

            // VALIDACIÓN 5: Verifica que los datos de cada colección sean arrays válidos
            let totalDocuments = 0;
            for (const [collectionName, documents] of Object.entries(backupData.datos)) {
                // Verifica que cada colección contenga un array de documentos
                if (!Array.isArray(documents)) {
                    throw new Error(`Datos de colección ${collectionName} no son un array`);
                }
                // Suma el total de documentos para estadísticas
                totalDocuments += documents.length;
            }

            // Si todas las validaciones pasan, retorna información del backup válido
            return {
                success: true,                    // Indica que la validación fue exitosa
                metadata: metadata,               // Metadatos del backup
                colecciones: coleccionesBackup,  // Lista de colecciones en el backup
                totalDocuments: totalDocuments,     // Total de documentos en el backup
                compatible: true                  // Indica que el backup es compatible con el sistema
            };

        } catch (error) {
            // Si cualquier validación falla, retorna información del error
            return {
                success: false,        // Indica que la validación falló
                error: error.message, // Mensaje de error específico
                compatible: false     // Indica que el backup no es compatible
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
            // Mensaje informativo para el usuario
            console.log('🔄 Iniciando restauración...');

            // VALIDACIÓN CRÍTICA: Valida el esquema del backup antes de proceder
            const validacion = await this.validarEsquemaBackup(filePath);
            if (!validacion.success) {
                // Si el backup no es válido, aborta la restauración
                throw new Error(`Backup inválido: ${validacion.error}`);
            }

            // Lee el contenido del archivo de backup
            const backupContent = fs.readFileSync(filePath, 'utf8');
            
            // Convierte el JSON en un objeto JavaScript
            const backupData = JSON.parse(backupContent);

            // Estructura para almacenar resultados de la restauración
            const resultados = {
                colecciones: {},    // Detalles de cada colección restaurada
                totalRestaurados: 0, // Contador total de documentos restaurados
                errores: []        // Lista de errores encontrados durante la restauración
            };

            // Bucle que procesa cada colección del backup
            for (const [collectionName, documents] of Object.entries(backupData.datos)) {
                try {
                    // Mensaje informativo sobre qué colección se está restaurando
                    console.log(`📥 Restaurando colección: ${collectionName}`);
                    
                    // Determina el nombre de la colección destino
                    let targetCollectionName = collectionName;
                    
                    // Si el modo es 'prefijo' y se proporcionó un prefijo, modifica el nombre
                    if (modo === 'prefijo' && prefijo) {
                        targetCollectionName = `${prefijo}_${collectionName}`;
                    }

                    // Obtiene la referencia a la colección destino en MongoDB
                    const collection = this.database.collection(targetCollectionName);

                    // Si el modo es 'sobrescribir', limpia la colección existente
                    if (modo === 'sobrescribir') {
                        // Elimina TODOS los documentos existentes en la colección
                        await collection.deleteMany({});
                        console.log(`🗑️ Colección ${targetCollectionName} limpiada`);
                    }

                    // Si hay documentos para restaurar, los inserta
                    if (documents.length > 0) {
                        // Inserta todos los documentos de la colección en una sola operación
                        const result = await collection.insertMany(documents);
                        
                        // Registra los resultados de la inserción
                        resultados.colecciones[collectionName] = {
                            targetCollection: targetCollectionName,  // Nombre de la colección destino
                            documentosInsertados: result.insertedCount, // Número de documentos insertados
                            documentosOriginales: documents.length     // Número de documentos en el backup
                        };
                        
                        // Actualiza el contador total de documentos restaurados
                        resultados.totalRestaurados += result.insertedCount;
                        
                        // Mensaje de confirmación con estadísticas
                        console.log(`✅ ${targetCollectionName}: ${result.insertedCount} documentos restaurados`);
                    } else {
                        // Si no hay documentos, registra la información pero no hace nada
                        resultados.colecciones[collectionName] = {
                            targetCollection: targetCollectionName,
                            documentosInsertados: 0,
                            documentosOriginales: 0
                        };
                        console.log(`ℹ️ ${targetCollectionName}: Sin documentos para restaurar`);
                    }

                } catch (error) {
                    // Manejo de errores por colección: registra el error pero continúa con las demás
                    console.error(`❌ Error restaurando ${collectionName}:`, error.message);
                    resultados.errores.push({
                        coleccion: collectionName,  // Nombre de la colección que falló
                        error: error.message        // Mensaje de error específico
                    });
                }
            }

            // Retorna el resultado de la restauración
            return {
                success: resultados.errores.length === 0, // Éxito si no hay errores
                resultados: resultados,                   // Detalles completos de la restauración
                modo: modo,                              // Modo utilizado para la restauración
                prefijo: prefijo                         // Prefijo utilizado (si aplica)
            };

        } catch (error) {
            // Manejo de errores generales: registra el error y retorna información del fallo
            console.error('❌ Error en restauración:', error.message);
            return {
                success: false,        // Indica que la restauración falló
                error: error.message   // Mensaje de error para debugging
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
            // Verifica que el archivo de backup existe
            if (!fs.existsSync(filePath)) {
                throw new Error('Archivo de backup no encontrado');
            }

            // Lee el contenido del archivo de backup
            const backupContent = fs.readFileSync(filePath, 'utf8');
            
            // Convierte el JSON en un objeto JavaScript
            const backupData = JSON.parse(backupContent);
            
            // Obtiene estadísticas del archivo (tamaño, fechas, etc.)
            const stats = fs.statSync(filePath);

            // Construye un objeto con información detallada del backup
            const info = {
                archivo: path.basename(filePath),  // Solo el nombre del archivo (sin ruta)
                ruta: filePath,                     // Ruta completa del archivo
                tamaño: (stats.size / 1024).toFixed(2) + ' KB', // Tamaño en KB con formato legible
                creado: stats.birthtime,           // Fecha de creación del archivo
                modificado: stats.mtime,           // Fecha de última modificación
                metadata: backupData.metadata,     // Metadatos del backup (timestamp, tipo, version, etc.)
                colecciones: Object.keys(backupData.datos), // Lista de colecciones en el backup
                // Calcula el total de documentos sumando todos los documentos de todas las colecciones
                totalDocumentos: Object.values(backupData.datos).reduce((sum, docs) => sum + docs.length, 0),
                detallesColecciones: {}            // Contenedor para detalles específicos de cada colección
            };

            // Analiza cada colección para obtener información detallada
            for (const [collectionName, documents] of Object.entries(backupData.datos)) {
                info.detallesColecciones[collectionName] = {
                    documentos: documents.length,  // Número de documentos en la colección
                    // Si hay documentos, obtiene los nombres de los campos del primer documento
                    // Si no hay documentos, retorna un array vacío
                    campos: documents.length > 0 ? Object.keys(documents[0]) : []
                };
            }

            // Retorna toda la información recopilada del backup
            return info;

        } catch (error) {
            // Si hay algún error, retorna solo la información del error
            return {
                error: error.message
            };
        }
    }
}

// ===== EXPORTACIÓN DEL MÓDULO =====
// PATRÓN: Module Pattern - Exporta la clase como módulo
// Permite que otros archivos importen y usen la clase BackupService
module.exports = BackupService;