const { ObjectId } = require('mongodb');
const { Cliente } = require('../models');

/**
 * Repositorio para gestión de clientes
 * Implementa el patrón Repository para abstraer el acceso a datos
 * Maneja operaciones CRUD y métodos específicos para clientes
 */
class ClienteRepository {
    constructor(db) {
        this.collection = db.collection('clientes');
        this.db = db;
    }

    /**
     * Crea un nuevo cliente en la base de datos
     * @param {Cliente} cliente - Instancia de Cliente a crear
     * @returns {Promise<ObjectId>} ID del cliente creado
     * @throws {Error} Si la validación falla o hay error en la inserción
     */
    async create(cliente) {
        try {
            // Validar que sea una instancia de Cliente
            if (!(cliente instanceof Cliente)) {
                throw new Error('El parámetro debe ser una instancia de Cliente');
            }

            // Convertir a objeto MongoDB
            const clienteDoc = cliente.toMongoObject();
            
            // Verificar que no exista un cliente con el mismo email
            const clienteExistente = await this.collection.findOne({ email: clienteDoc.email });
            if (clienteExistente) {
                throw new Error('Ya existe un cliente con este email');
            }

            // Insertar en la base de datos
            const result = await this.collection.insertOne(clienteDoc);
            return result.insertedId;
        } catch (error) {
            throw new Error(`Error al crear cliente: ${error.message}`);
        }
    }

    /**
     * Obtiene un cliente por su ID
     * @param {string|ObjectId} id - ID del cliente
     * @returns {Promise<Cliente|null>} Cliente encontrado o null
     * @throws {Error} Si el ID no es válido
     */
    async getById(id) {
        try {
            if (!ObjectId.isValid(id)) {
                throw new Error('ID del cliente no es válido');
            }

            const clienteDoc = await this.collection.findOne({ _id: new ObjectId(id) });
            
            if (!clienteDoc) {
                return null;
            }

            return Cliente.fromMongoObject(clienteDoc);
        } catch (error) {
            throw new Error(`Error al obtener cliente: ${error.message}`);
        }
    }

    /**
     * Obtiene un cliente por su email
     * @param {string} email - Email del cliente
     * @returns {Promise<Cliente|null>} Cliente encontrado o null
     * @throws {Error} Si el email no es válido
     */
    async getByEmail(email) {
        try {
            if (!email || typeof email !== 'string') {
                throw new Error('Email debe ser una string válida');
            }

            const clienteDoc = await this.collection.findOne({ email: email.toLowerCase().trim() });
            
            if (!clienteDoc) {
                return null;
            }

            return Cliente.fromMongoObject(clienteDoc);
        } catch (error) {
            throw new Error(`Error al obtener cliente por email: ${error.message}`);
        }
    }

    /**
     * Cuenta el número de clientes que coinciden con el filtro
     * @param {Object} filter - Filtro de búsqueda
     * @returns {Promise<number>} Número de clientes que coinciden
     */
    async countClientes(filter = {}) {
        try {
            return await this.collection.countDocuments(filter);
        } catch (error) {
            throw new Error(`Error al contar clientes: ${error.message}`);
        }
    }

    /**
     * Obtiene todos los clientes con filtro opcional
     * @param {Object} filter - Filtro de búsqueda
     * @param {Object} options - Opciones de consulta (limit, skip, sort)
     * @returns {Promise<Cliente[]>} Array de clientes
     */
    async getAll(filter = {}, options = {}) {
        try {
            const { limit = 0, skip = 0, sort = { fechaRegistro: -1 } } = options;
            
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

            const clientesDocs = await query.toArray();
            return clientesDocs.map(doc => Cliente.fromMongoObject(doc));
        } catch (error) {
            throw new Error(`Error al obtener clientes: ${error.message}`);
        }
    }

    /**
     * Actualiza un cliente existente
     * @param {string|ObjectId} id - ID del cliente a actualizar
     * @param {Object} updatedData - Datos actualizados
     * @returns {Promise<boolean>} True si se actualizó correctamente
     * @throws {Error} Si el ID no es válido o hay error en la actualización
     */
    async update(id, updatedData) {
        try {
            if (!ObjectId.isValid(id)) {
                throw new Error('ID del cliente no es válido');
            }

            // Si se está actualizando el email, verificar que no exista otro cliente con el mismo email
            if (updatedData.email) {
                const clienteExistente = await this.collection.findOne({ 
                    email: updatedData.email, 
                    _id: { $ne: new ObjectId(id) } 
                });
                if (clienteExistente) {
                    throw new Error('Ya existe otro cliente con este email');
                }
            }

            const result = await this.collection.updateOne(
                { _id: new ObjectId(id) },
                { $set: updatedData }
            );

            return result.modifiedCount > 0;
        } catch (error) {
            throw new Error(`Error al actualizar cliente: ${error.message}`);
        }
    }

    /**
     * Elimina un cliente por su ID
     * @param {string|ObjectId} id - ID del cliente a eliminar
     * @returns {Promise<boolean>} True si se eliminó correctamente
     * @throws {Error} Si el ID no es válido o hay dependencias
     */
    async delete(id) {
        try {
            if (!ObjectId.isValid(id)) {
                throw new Error('ID del cliente no es válido');
            }

            // Verificar si el cliente tiene planes activos
            const cliente = await this.getById(id);
            if (cliente && cliente.tienePlanes()) {
                throw new Error('No se puede eliminar un cliente que tiene planes asignados');
            }

            // Verificar si tiene contratos activos
            const contratosCollection = this.db.collection('contratos');
            const contratosActivos = await contratosCollection.countDocuments({
                clienteId: new ObjectId(id),
                estado: 'vigente'
            });

            if (contratosActivos > 0) {
                throw new Error('No se puede eliminar un cliente con contratos activos');
            }

            const result = await this.collection.deleteOne({ _id: new ObjectId(id) });
            return result.deletedCount > 0;
        } catch (error) {
            throw new Error(`Error al eliminar cliente: ${error.message}`);
        }
    }

    /**
     * Obtiene todos los clientes activos
     * @returns {Promise<Cliente[]>} Array de clientes activos
     */
    async getActiveClients() {
        try {
            return await this.getAll({ activo: true });
        } catch (error) {
            throw new Error(`Error al obtener clientes activos: ${error.message}`);
        }
    }

    /**
     * Obtiene clientes que tienen planes asignados
     * @returns {Promise<Cliente[]>} Array de clientes con planes
     */
    async getClientsWithActivePlans() {
        try {
            return await this.getAll({ 
                activo: true, 
                planes: { $exists: true, $ne: [] } 
            });
        } catch (error) {
            throw new Error(`Error al obtener clientes con planes: ${error.message}`);
        }
    }

    /**
     * Obtiene clientes por nivel de plan
     * @param {string} nivel - Nivel del plan (principiante, intermedio, avanzado)
     * @returns {Promise<Cliente[]>} Array de clientes con planes del nivel especificado
     */
    async getClientsByPlanLevel(nivel) {
        try {
            const planesCollection = this.db.collection('planes');
            const planes = await planesCollection.find({ nivel }).toArray();
            const planIds = planes.map(plan => plan._id);

            return await this.getAll({ 
                activo: true, 
                planes: { $in: planIds } 
            });
        } catch (error) {
            throw new Error(`Error al obtener clientes por nivel: ${error.message}`);
        }
    }

    /**
     * Busca clientes por nombre o email
     * @param {string} searchTerm - Término de búsqueda
     * @returns {Promise<Cliente[]>} Array de clientes que coinciden
     */
    async searchClients(searchTerm) {
        try {
            if (!searchTerm || typeof searchTerm !== 'string') {
                throw new Error('Término de búsqueda debe ser una string válida');
            }

            const regex = new RegExp(searchTerm, 'i');
            return await this.getAll({
                $or: [
                    { nombre: regex },
                    { apellido: regex },
                    { email: regex }
                ]
            });
        } catch (error) {
            throw new Error(`Error al buscar clientes: ${error.message}`);
        }
    }

    /**
     * Obtiene estadísticas de clientes
     * @returns {Promise<Object>} Estadísticas de clientes
     */
    async getClientStats() {
        try {
            const totalClientes = await this.collection.countDocuments();
            const clientesActivos = await this.collection.countDocuments({ activo: true });
            const clientesConPlanes = await this.collection.countDocuments({ 
                planes: { $exists: true, $ne: [] } 
            });

            // Obtener distribución por mes de registro
            const pipeline = [
                {
                    $group: {
                        _id: {
                            year: { $year: "$fechaRegistro" },
                            month: { $month: "$fechaRegistro" }
                        },
                        count: { $sum: 1 }
                    }
                },
                { $sort: { "_id.year": -1, "_id.month": -1 } },
                { $limit: 12 }
            ];

            const registrosPorMes = await this.collection.aggregate(pipeline).toArray();

            return {
                totalClientes,
                clientesActivos,
                clientesInactivos: totalClientes - clientesActivos,
                clientesConPlanes,
                clientesSinPlanes: clientesActivos - clientesConPlanes,
                registrosPorMes
            };
        } catch (error) {
            throw new Error(`Error al obtener estadísticas: ${error.message}`);
        }
    }

    /**
     * Agrega un plan a un cliente
     * @param {string|ObjectId} clienteId - ID del cliente
     * @param {string|ObjectId} planId - ID del plan
     * @returns {Promise<boolean>} True si se agregó correctamente
     */
    async addPlanToClient(clienteId, planId) {
        try {
            if (!ObjectId.isValid(clienteId) || !ObjectId.isValid(planId)) {
                throw new Error('IDs deben ser ObjectIds válidos');
            }

            const result = await this.collection.updateOne(
                { _id: new ObjectId(clienteId) },
                { $addToSet: { planes: new ObjectId(planId) } }
            );

            return result.modifiedCount > 0;
        } catch (error) {
            throw new Error(`Error al agregar plan al cliente: ${error.message}`);
        }
    }

    /**
     * Remueve un plan de un cliente
     * @param {string|ObjectId} clienteId - ID del cliente
     * @param {string|ObjectId} planId - ID del plan
     * @returns {Promise<boolean>} True si se removió correctamente
     */
    async removePlanFromClient(clienteId, planId) {
        try {
            if (!ObjectId.isValid(clienteId) || !ObjectId.isValid(planId)) {
                throw new Error('IDs deben ser ObjectIds válidos');
            }

            const result = await this.collection.updateOne(
                { _id: new ObjectId(clienteId) },
                { $pull: { planes: new ObjectId(planId) } }
            );

            return result.modifiedCount > 0;
        } catch (error) {
            throw new Error(`Error al remover plan del cliente: ${error.message}`);
        }
    }

    /**
     * Obtiene clientes registrados en un rango de fechas
     * @param {Date} fechaInicio - Fecha de inicio
     * @param {Date} fechaFin - Fecha de fin
     * @returns {Promise<Cliente[]>} Array de clientes en el rango
     */
    async getClientsByDateRange(fechaInicio, fechaFin) {
        try {
            if (!(fechaInicio instanceof Date) || !(fechaFin instanceof Date)) {
                throw new Error('Las fechas deben ser objetos Date válidos');
            }

            return await this.getAll({
                fechaRegistro: {
                    $gte: fechaInicio,
                    $lte: fechaFin
                }
            });
        } catch (error) {
            throw new Error(`Error al obtener clientes por rango de fechas: ${error.message}`);
        }
    }
}

module.exports = ClienteRepository;
