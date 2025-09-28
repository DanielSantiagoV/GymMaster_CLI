const { ObjectId } = require('mongodb');
const { Nutricion } = require('../models');
const NutricionRepository = require('../repositories/NutricionRepository');
const ClienteRepository = require('../repositories/ClienteRepository');
const ContratoRepository = require('../repositories/ContratoRepository');

/**
 * Servicio Nutrición - Lógica de negocio para planes nutricionales
 * Implementa principios SOLID y maneja validaciones de negocio
 */
class NutricionService {
    constructor(db) {
        this.db = db;
        this.nutricionRepository = new NutricionRepository(db);
        this.clienteRepository = new ClienteRepository(db);
        this.contratoRepository = new ContratoRepository(db);
    }

    /**
     * Crea un nuevo plan nutricional
     * @param {Object} datosNutricion - Datos del plan nutricional
     * @returns {Promise<Object>} Resultado de la operación
     */
    async crearPlanNutricional(datosNutricion) {
        try {
            // Validar que el cliente existe
            const cliente = await this.clienteRepository.getById(datosNutricion.clienteId);
            if (!cliente) {
                throw new Error('Cliente no encontrado');
            }

            // Validar contrato si se proporciona
            if (datosNutricion.contratoId) {
                const contrato = await this.contratoRepository.getById(datosNutricion.contratoId);
                if (!contrato) {
                    throw new Error('Contrato no encontrado');
                }
            }

            // Verificar si ya existe un plan activo para el cliente
            const planActivo = await this.nutricionRepository.getActiveByClient(datosNutricion.clienteId);
            if (planActivo && datosNutricion.estado === 'activo') {
                throw new Error('El cliente ya tiene un plan nutricional activo');
            }

            // Crear el plan nutricional
            const nutricion = new Nutricion(datosNutricion);
            const nutricionId = await this.nutricionRepository.create(nutricion);

            return {
                success: true,
                nutricionId: nutricionId,
                mensaje: 'Plan nutricional creado exitosamente'
            };
        } catch (error) {
            throw new Error(`Error al crear plan nutricional: ${error.message}`);
        }
    }

    /**
     * Obtiene un plan nutricional por ID
     * @param {string} nutricionId - ID del plan
     * @returns {Promise<Object>} Plan nutricional
     */
    async obtenerPlanNutricional(nutricionId) {
        try {
            const nutricion = await this.nutricionRepository.getById(nutricionId);
            if (!nutricion) {
                throw new Error('Plan nutricional no encontrado');
            }

            // Obtener información del cliente
            const cliente = await this.clienteRepository.getById(nutricion.clienteId);
            
            // Obtener información del contrato si existe
            let contrato = null;
            if (nutricion.contratoId) {
                contrato = await this.contratoRepository.getById(nutricion.contratoId);
            }

            return {
                success: true,
                data: {
                    nutricion: nutricion,
                    cliente: cliente ? cliente.getResumen() : null,
                    contrato: contrato ? {
                        contratoId: contrato.contratoId,
                        fechaInicio: contrato.fechaInicio,
                        fechaFin: contrato.fechaFin,
                        precio: contrato.precio
                    } : null
                }
            };
        } catch (error) {
            throw new Error(`Error al obtener plan nutricional: ${error.message}`);
        }
    }

    /**
     * Lista planes nutricionales con filtros
     * @param {Object} filtros - Filtros opcionales
     * @returns {Promise<Object>} Lista de planes
     */
    async listarPlanesNutricionales(filtros = {}) {
        try {
            const planes = await this.nutricionRepository.getAll(filtros);
            
            return {
                success: true,
                data: planes.map(plan => plan.getResumen()),
                total: planes.length
            };
        } catch (error) {
            throw new Error(`Error al listar planes nutricionales: ${error.message}`);
        }
    }

    /**
     * Actualiza un plan nutricional
     * @param {string} nutricionId - ID del plan
     * @param {Object} datosActualizados - Datos a actualizar
     * @returns {Promise<Object>} Resultado de la operación
     */
    async actualizarPlanNutricional(nutricionId, datosActualizados) {
        try {
            const nutricion = await this.nutricionRepository.getById(nutricionId);
            if (!nutricion) {
                throw new Error('Plan nutricional no encontrado');
            }

            // Validar datos si se actualizan
            if (datosActualizados.tipoPlan) {
                this.validarTipoPlan(datosActualizados.tipoPlan);
            }

            if (datosActualizados.estado) {
                this.validarEstado(datosActualizados.estado);
            }

            // Si se está activando un plan, verificar que no haya otro activo
            if (datosActualizados.estado === 'activo') {
                const planActivo = await this.nutricionRepository.getActiveByClient(nutricion.clienteId);
                if (planActivo && planActivo.nutricionId.toString() !== nutricionId) {
                    throw new Error('El cliente ya tiene un plan nutricional activo');
                }
            }

            const resultado = await this.nutricionRepository.update(nutricionId, datosActualizados);
            
            if (resultado) {
                return {
                    success: true,
                    mensaje: 'Plan nutricional actualizado exitosamente'
                };
            } else {
                throw new Error('No se pudo actualizar el plan nutricional');
            }
        } catch (error) {
            throw new Error(`Error al actualizar plan nutricional: ${error.message}`);
        }
    }

    /**
     * Elimina un plan nutricional
     * @param {string} nutricionId - ID del plan
     * @returns {Promise<Object>} Resultado de la operación
     */
    async eliminarPlanNutricional(nutricionId) {
        try {
            const nutricion = await this.nutricionRepository.getById(nutricionId);
            if (!nutricion) {
                throw new Error('Plan nutricional no encontrado');
            }

            // Verificar si el plan está activo
            if (nutricion.estaActivo()) {
                throw new Error('No se puede eliminar un plan nutricional activo. Primero debe pausarlo o finalizarlo');
            }

            const resultado = await this.nutricionRepository.delete(nutricionId);
            
            if (resultado) {
                return {
                    success: true,
                    mensaje: 'Plan nutricional eliminado exitosamente'
                };
            } else {
                throw new Error('No se pudo eliminar el plan nutricional');
            }
        } catch (error) {
            throw new Error(`Error al eliminar plan nutricional: ${error.message}`);
        }
    }

    /**
     * Obtiene planes nutricionales de un cliente
     * @param {string} clienteId - ID del cliente
     * @returns {Promise<Object>} Lista de planes del cliente
     */
    async obtenerPlanesPorCliente(clienteId) {
        try {
            const planes = await this.nutricionRepository.getByClient(clienteId);
            
            return {
                success: true,
                data: planes.map(plan => plan.getResumen()),
                total: planes.length
            };
        } catch (error) {
            throw new Error(`Error al obtener planes del cliente: ${error.message}`);
        }
    }

    /**
     * Obtiene el plan activo de un cliente
     * @param {string} clienteId - ID del cliente
     * @returns {Promise<Object>} Plan activo
     */
    async obtenerPlanActivo(clienteId) {
        try {
            const planActivo = await this.nutricionRepository.getActiveByClient(clienteId);
            
            if (!planActivo) {
                return {
                    success: true,
                    data: null,
                    mensaje: 'El cliente no tiene un plan nutricional activo'
                };
            }

            return {
                success: true,
                data: planActivo.getResumen()
            };
        } catch (error) {
            throw new Error(`Error al obtener plan activo: ${error.message}`);
        }
    }

    /**
     * Busca planes nutricionales
     * @param {string} termino - Término de búsqueda
     * @returns {Promise<Object>} Resultados de búsqueda
     */
    async buscarPlanes(termino) {
        try {
            const planes = await this.nutricionRepository.search(termino);
            
            return {
                success: true,
                data: planes.map(plan => plan.getResumen()),
                total: planes.length
            };
        } catch (error) {
            throw new Error(`Error al buscar planes: ${error.message}`);
        }
    }

    /**
     * Obtiene estadísticas de planes nutricionales
     * @returns {Promise<Object>} Estadísticas
     */
    async obtenerEstadisticas() {
        try {
            const stats = await this.nutricionRepository.getStats();
            
            return {
                success: true,
                data: stats
            };
        } catch (error) {
            throw new Error(`Error al obtener estadísticas: ${error.message}`);
        }
    }

    /**
     * Valida el tipo de plan
     * @param {string} tipoPlan - Tipo de plan
     */
    validarTipoPlan(tipoPlan) {
        const tiposValidos = [
            'perdida_peso',
            'ganancia_masa',
            'mantenimiento',
            'deportivo',
            'medico',
            'personalizado'
        ];
        
        if (!tiposValidos.includes(tipoPlan)) {
            throw new Error(`Tipo de plan debe ser uno de: ${tiposValidos.join(', ')}`);
        }
    }

    /**
     * Valida el estado del plan
     * @param {string} estado - Estado del plan
     */
    validarEstado(estado) {
        const estadosValidos = ['activo', 'pausado', 'finalizado', 'cancelado'];
        
        if (!estadosValidos.includes(estado)) {
            throw new Error(`Estado debe ser uno de: ${estadosValidos.join(', ')}`);
        }
    }
}

module.exports = NutricionService;
