const { ObjectId } = require('mongodb');
const { Nutricion } = require('../models');
const dayjs = require('dayjs');

/**
 * Repositorio para gestión de planes nutricionales
 * Implementa el patrón Repository para abstraer el acceso a datos
 * Maneja operaciones CRUD y métodos específicos para nutrición
 */
class NutricionRepository {
    constructor(db) {
        this.collection = db.collection('nutricion');
        this.db = db;
    }

    /**
     * Crea un nuevo registro nutricional
     * @param {Nutricion} nutricion - Instancia de Nutricion a crear
     * @returns {Promise<ObjectId>} ID del registro nutricional creado
     * @throws {Error} Si la validación falla o hay error en la inserción
     */
    async create(nutricion) {
        try {
            // Validar que sea una instancia de Nutricion
            if (!(nutricion instanceof Nutricion)) {
                throw new Error('El parámetro debe ser una instancia de Nutricion');
            }

            // Verificar que no exista un registro nutricional para el mismo cliente en la misma fecha
            const registroExistente = await this.collection.findOne({
                clienteId: nutricion.clienteId,
                fecha: {
                    $gte: new Date(nutricion.fecha.getFullYear(), nutricion.fecha.getMonth(), nutricion.fecha.getDate()),
                    $lt: new Date(nutricion.fecha.getFullYear(), nutricion.fecha.getMonth(), nutricion.fecha.getDate() + 1)
                }
            });

            if (registroExistente) {
                throw new Error('Ya existe un registro nutricional para este cliente en esta fecha');
            }

            // Convertir a objeto MongoDB
            const nutricionDoc = nutricion.toMongoObject();
            
            // Insertar en la base de datos
            const result = await this.collection.insertOne(nutricionDoc);
            return result.insertedId;
        } catch (error) {
            throw new Error(`Error al crear registro nutricional: ${error.message}`);
        }
    }

    /**
     * Obtiene un registro nutricional por su ID
     * @param {string|ObjectId} id - ID del registro nutricional
     * @returns {Promise<Nutricion|null>} Registro nutricional encontrado o null
     * @throws {Error} Si el ID no es válido
     */
    async getById(id) {
        try {
            if (!ObjectId.isValid(id)) {
                throw new Error('ID del registro nutricional no es válido');
            }

            const nutricionDoc = await this.collection.findOne({ _id: new ObjectId(id) });
            
            if (!nutricionDoc) {
                return null;
            }

            return Nutricion.fromMongoObject(nutricionDoc);
        } catch (error) {
            throw new Error(`Error al obtener registro nutricional: ${error.message}`);
        }
    }

    /**
     * Obtiene todos los registros nutricionales con filtro opcional
     * @param {Object} filter - Filtro de búsqueda
     * @param {Object} options - Opciones de consulta (limit, skip, sort)
     * @returns {Promise<Nutricion[]>} Array de registros nutricionales
     */
    async getAll(filter = {}, options = {}) {
        try {
            const { limit = 0, skip = 0, sort = { fecha: -1 } } = options;
            
            let query = this.collection.find(filter);
            
            if (sort) {
                query = query.sort(sort);
            }
            
            if (skip > 0) {
                query = query.skip(skip);
            }
            
            if (limit > 0) {
                query = query.limit(limit);
            }

            const nutricionDocs = await query.toArray();
            return nutricionDocs.map(doc => Nutricion.fromMongoObject(doc));
        } catch (error) {
            throw new Error(`Error al obtener registros nutricionales: ${error.message}`);
        }
    }

    /**
     * Actualiza un registro nutricional existente
     * @param {string|ObjectId} id - ID del registro nutricional a actualizar
     * @param {Object} updatedData - Datos actualizados
     * @returns {Promise<boolean>} True si se actualizó correctamente
     * @throws {Error} Si el ID no es válido o hay error en la actualización
     */
    async update(id, updatedData) {
        try {
            if (!ObjectId.isValid(id)) {
                throw new Error('ID del registro nutricional no es válido');
            }

            const result = await this.collection.updateOne(
                { _id: new ObjectId(id) },
                { $set: updatedData }
            );

            return result.modifiedCount > 0;
        } catch (error) {
            throw new Error(`Error al actualizar registro nutricional: ${error.message}`);
        }
    }

    /**
     * Elimina un registro nutricional por su ID
     * @param {string|ObjectId} id - ID del registro nutricional a eliminar
     * @returns {Promise<boolean>} True si se eliminó correctamente
     * @throws {Error} Si el ID no es válido
     */
    async delete(id) {
        try {
            if (!ObjectId.isValid(id)) {
                throw new Error('ID del registro nutricional no es válido');
            }

            const result = await this.collection.deleteOne({ _id: new ObjectId(id) });
            return result.deletedCount > 0;
        } catch (error) {
            throw new Error(`Error al eliminar registro nutricional: ${error.message}`);
        }
    }

    /**
     * Obtiene el plan nutricional de un cliente por fecha
     * @param {string|ObjectId} clienteId - ID del cliente
     * @param {Date} fecha - Fecha del registro
     * @returns {Promise<Nutricion|null>} Registro nutricional encontrado o null
     */
    async getNutritionPlanByClientAndDate(clienteId, fecha) {
        try {
            if (!ObjectId.isValid(clienteId)) {
                throw new Error('ID del cliente no es válido');
            }

            if (!(fecha instanceof Date)) {
                throw new Error('La fecha debe ser un objeto Date válido');
            }

            const inicioDia = new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate());
            const finDia = new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate() + 1);

            const nutricionDoc = await this.collection.findOne({
                clienteId: new ObjectId(clienteId),
                fecha: {
                    $gte: inicioDia,
                    $lt: finDia
                }
            });

            return nutricionDoc ? Nutricion.fromMongoObject(nutricionDoc) : null;
        } catch (error) {
            throw new Error(`Error al obtener plan nutricional: ${error.message}`);
        }
    }

    /**
     * Obtiene el reporte nutricional semanal de un cliente
     * @param {string|ObjectId} clienteId - ID del cliente
     * @param {Object} weekRange - Rango de la semana { inicio, fin }
     * @returns {Promise<Object>} Reporte nutricional semanal
     */
    async getWeeklyNutritionReport(clienteId, weekRange) {
        try {
            if (!ObjectId.isValid(clienteId)) {
                throw new Error('ID del cliente no es válido');
            }

            if (!weekRange.inicio || !weekRange.fin) {
                throw new Error('Rango de semana debe tener inicio y fin');
            }

            if (!(weekRange.inicio instanceof Date) || !(weekRange.fin instanceof Date)) {
                throw new Error('Las fechas del rango deben ser objetos Date válidos');
            }

            const registros = await this.getAll({
                clienteId: new ObjectId(clienteId),
                fecha: {
                    $gte: weekRange.inicio,
                    $lte: weekRange.fin
                }
            });

            // Calcular estadísticas semanales
            const totalCalorias = registros.reduce((total, registro) => total + registro.getTotalCalorias(), 0);
            const promedioCalorias = registros.length > 0 ? totalCalorias / registros.length : 0;
            const totalAlimentos = registros.reduce((total, registro) => total + registro.getCantidadAlimentos(), 0);

            // Obtener alimentos más consumidos
            const alimentosConsumidos = {};
            registros.forEach(registro => {
                registro.alimentos.forEach(alimento => {
                    const nombre = alimento.nombre.toLowerCase();
                    if (alimentosConsumidos[nombre]) {
                        alimentosConsumidos[nombre].veces++;
                        alimentosConsumidos[nombre].calorias += alimento.calorias;
                    } else {
                        alimentosConsumidos[nombre] = {
                            veces: 1,
                            calorias: alimento.calorias
                        };
                    }
                });
            });

            const alimentosMasConsumidos = Object.entries(alimentosConsumidos)
                .map(([nombre, data]) => ({
                    nombre,
                    veces: data.veces,
                    calorias: data.calorias
                }))
                .sort((a, b) => b.veces - a.veces)
                .slice(0, 5);

            return {
                clienteId,
                rangoSemana: {
                    inicio: weekRange.inicio,
                    fin: weekRange.fin
                },
                totalDias: registros.length,
                totalCalorias,
                promedioCalorias: Math.round(promedioCalorias * 100) / 100,
                totalAlimentos,
                promedioAlimentosPorDia: registros.length > 0 ? Math.round(totalAlimentos / registros.length * 100) / 100 : 0,
                alimentosMasConsumidos,
                registros: registros.map(registro => registro.getResumen())
            };
        } catch (error) {
            throw new Error(`Error al obtener reporte nutricional semanal: ${error.message}`);
        }
    }

    /**
     * Obtiene registros nutricionales por cliente
     * @param {string|ObjectId} clienteId - ID del cliente
     * @param {Object} options - Opciones de consulta
     * @returns {Promise<Nutricion[]>} Array de registros nutricionales del cliente
     */
    async getNutritionRecordsByClient(clienteId, options = {}) {
        try {
            if (!ObjectId.isValid(clienteId)) {
                throw new Error('ID del cliente no es válido');
            }

            const { limit = 0, skip = 0, sort = { fecha: -1 } } = options;
            
            return await this.getAll(
                { clienteId: new ObjectId(clienteId) },
                { limit, skip, sort }
            );
        } catch (error) {
            throw new Error(`Error al obtener registros nutricionales del cliente: ${error.message}`);
        }
    }

    /**
     * Obtiene registros nutricionales por rango de fechas
     * @param {Date} fechaInicio - Fecha de inicio
     * @param {Date} fechaFin - Fecha de fin
     * @param {string|ObjectId} clienteId - ID del cliente (opcional)
     * @returns {Promise<Nutricion[]>} Array de registros en el rango
     */
    async getNutritionRecordsByDateRange(fechaInicio, fechaFin, clienteId = null) {
        try {
            if (!(fechaInicio instanceof Date) || !(fechaFin instanceof Date)) {
                throw new Error('Las fechas deben ser objetos Date válidos');
            }

            const filter = {
                fecha: {
                    $gte: fechaInicio,
                    $lte: fechaFin
                }
            };

            if (clienteId && ObjectId.isValid(clienteId)) {
                filter.clienteId = new ObjectId(clienteId);
            }

            return await this.getAll(filter);
        } catch (error) {
            throw new Error(`Error al obtener registros por rango de fechas: ${error.message}`);
        }
    }

    /**
     * Obtiene registros nutricionales con calorías en un rango específico
     * @param {number} caloriasMin - Calorías mínimas
     * @param {number} caloriasMax - Calorías máximas
     * @param {string|ObjectId} clienteId - ID del cliente (opcional)
     * @returns {Promise<Nutricion[]>} Array de registros en el rango de calorías
     */
    async getRecordsByCalorieRange(caloriasMin, caloriasMax, clienteId = null) {
        try {
            if (typeof caloriasMin !== 'number' || typeof caloriasMax !== 'number') {
                throw new Error('Los rangos de calorías deben ser números');
            }

            if (caloriasMin < 0 || caloriasMax < 0) {
                throw new Error('Los rangos de calorías no pueden ser negativos');
            }

            if (caloriasMin > caloriasMax) {
                throw new Error('Calorías mínimas no pueden ser mayores a las máximas');
            }

            const filter = {
                'alimentos.calorias': {
                    $gte: caloriasMin,
                    $lte: caloriasMax
                }
            };

            if (clienteId && ObjectId.isValid(clienteId)) {
                filter.clienteId = new ObjectId(clienteId);
            }

            return await this.getAll(filter);
        } catch (error) {
            throw new Error(`Error al obtener registros por rango de calorías: ${error.message}`);
        }
    }

    /**
     * Busca registros nutricionales por nombre de alimento
     * @param {string} nombreAlimento - Nombre del alimento a buscar
     * @param {string|ObjectId} clienteId - ID del cliente (opcional)
     * @returns {Promise<Nutricion[]>} Array de registros que contienen el alimento
     */
    async searchRecordsByFood(nombreAlimento, clienteId = null) {
        try {
            if (!nombreAlimento || typeof nombreAlimento !== 'string') {
                throw new Error('Nombre del alimento debe ser una string válida');
            }

            const regex = new RegExp(nombreAlimento, 'i');
            const filter = {
                'alimentos.nombre': regex
            };

            if (clienteId && ObjectId.isValid(clienteId)) {
                filter.clienteId = new ObjectId(clienteId);
            }

            return await this.getAll(filter);
        } catch (error) {
            throw new Error(`Error al buscar registros por alimento: ${error.message}`);
        }
    }

    /**
     * Obtiene estadísticas nutricionales de un cliente
     * @param {string|ObjectId} clienteId - ID del cliente
     * @returns {Promise<Object>} Estadísticas nutricionales del cliente
     */
    async getClientNutritionStats(clienteId) {
        try {
            if (!ObjectId.isValid(clienteId)) {
                throw new Error('ID del cliente no es válido');
            }

            const pipeline = [
                { $match: { clienteId: new ObjectId(clienteId) } },
                {
                    $group: {
                        _id: null,
                        totalRegistros: { $sum: 1 },
                        totalCalorias: { $sum: { $sum: "$alimentos.calorias" } },
                        promedioCalorias: { $avg: { $sum: "$alimentos.calorias" } },
                        totalAlimentos: { $sum: { $size: "$alimentos" } },
                        promedioAlimentosPorDia: { $avg: { $size: "$alimentos" } },
                        diasConRegistro: { $sum: 1 }
                    }
                }
            ];

            const stats = await this.collection.aggregate(pipeline).toArray();
            return stats.length > 0 ? stats[0] : {
                totalRegistros: 0,
                totalCalorias: 0,
                promedioCalorias: 0,
                totalAlimentos: 0,
                promedioAlimentosPorDia: 0,
                diasConRegistro: 0
            };
        } catch (error) {
            throw new Error(`Error al obtener estadísticas nutricionales: ${error.message}`);
        }
    }

    /**
     * Obtiene el progreso nutricional de un cliente
     * @param {string|ObjectId} clienteId - ID del cliente
     * @param {number} dias - Número de días hacia atrás para el análisis
     * @returns {Promise<Object>} Progreso nutricional del cliente
     */
    async getNutritionProgress(clienteId, dias = 30) {
        try {
            if (!ObjectId.isValid(clienteId)) {
                throw new Error('ID del cliente no es válido');
            }

            const fechaInicio = new Date();
            fechaInicio.setDate(fechaInicio.getDate() - dias);

            const registros = await this.getNutritionRecordsByDateRange(fechaInicio, new Date(), clienteId);

            if (registros.length === 0) {
                return {
                    progreso: [],
                    caloriasPromedio: 0,
                    tendencia: 'sin_datos',
                    diasConRegistro: 0,
                    totalDias: dias
                };
            }

            const progreso = registros.map(registro => ({
                fecha: registro.fecha,
                calorias: registro.getTotalCalorias(),
                alimentos: registro.getCantidadAlimentos()
            }));

            const caloriasPromedio = registros.reduce((total, registro) => total + registro.getTotalCalorias(), 0) / registros.length;

            // Calcular tendencia (comparar primera mitad vs segunda mitad)
            const mitad = Math.floor(registros.length / 2);
            const primeraMitad = registros.slice(0, mitad);
            const segundaMitad = registros.slice(mitad);

            const promedioPrimeraMitad = primeraMitad.reduce((total, registro) => total + registro.getTotalCalorias(), 0) / primeraMitad.length;
            const promedioSegundaMitad = segundaMitad.reduce((total, registro) => total + registro.getTotalCalorias(), 0) / segundaMitad.length;

            let tendencia = 'estable';
            if (promedioSegundaMitad > promedioPrimeraMitad * 1.1) {
                tendencia = 'aumento';
            } else if (promedioSegundaMitad < promedioPrimeraMitad * 0.9) {
                tendencia = 'disminucion';
            }

            return {
                progreso,
                caloriasPromedio: Math.round(caloriasPromedio * 100) / 100,
                tendencia,
                diasConRegistro: registros.length,
                totalDias: dias
            };
        } catch (error) {
            throw new Error(`Error al obtener progreso nutricional: ${error.message}`);
        }
    }

    /**
     * Obtiene los alimentos más consumidos por un cliente
     * @param {string|ObjectId} clienteId - ID del cliente
     * @param {number} limit - Límite de resultados
     * @returns {Promise<Array>} Array de alimentos más consumidos
     */
    async getMostConsumedFoods(clienteId, limit = 10) {
        try {
            if (!ObjectId.isValid(clienteId)) {
                throw new Error('ID del cliente no es válido');
            }

            const pipeline = [
                { $match: { clienteId: new ObjectId(clienteId) } },
                { $unwind: "$alimentos" },
                {
                    $group: {
                        _id: "$alimentos.nombre",
                        veces: { $sum: 1 },
                        caloriasTotales: { $sum: "$alimentos.calorias" },
                        caloriasPromedio: { $avg: "$alimentos.calorias" }
                    }
                },
                { $sort: { veces: -1 } },
                { $limit: limit }
            ];

            return await this.collection.aggregate(pipeline).toArray();
        } catch (error) {
            throw new Error(`Error al obtener alimentos más consumidos: ${error.message}`);
        }
    }
}

module.exports = NutricionRepository;
