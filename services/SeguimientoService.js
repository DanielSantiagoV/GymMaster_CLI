const { ObjectId } = require('mongodb');
const { Seguimiento } = require('../models');
const SeguimientoRepository = require('../repositories/SeguimientoRepository');
const ClienteRepository = require('../repositories/ClienteRepository');
const ContratoRepository = require('../repositories/ContratoRepository');
const ProgresoService = require('./ProgresoService');

/**
 * Servicio para gestión de seguimientos físicos
 * Implementa lógica de negocio para seguimientos siguiendo principios SOLID
 * Maneja validaciones, transacciones y coordinación con otros módulos
 */
class SeguimientoService {
    constructor(db) {
        this.db = db;
        this.seguimientoRepository = new SeguimientoRepository(db);
        this.clienteRepository = new ClienteRepository(db);
        this.contratoRepository = new ContratoRepository(db);
        this.progresoService = new ProgresoService();
    }

    /**
     * Crea un nuevo seguimiento con validaciones de negocio
     * @param {Object} datosSeguimiento - Datos del seguimiento a crear
     * @returns {Promise<Object>} Resultado de la operación
     */
    async crearSeguimiento(datosSeguimiento) {
        try {
            // Validar que cliente y contrato existen y están activos
            const cliente = await this.clienteRepository.getById(datosSeguimiento.clienteId);
            if (!cliente) {
                throw new Error('Cliente no encontrado');
            }

            if (!cliente.activo) {
                throw new Error('Solo se pueden crear seguimientos para clientes activos');
            }

            // Validar que el contrato existe y está vigente
            const contrato = await this.contratoRepository.getById(datosSeguimiento.contratoId);
            if (!contrato) {
                throw new Error('Contrato no encontrado');
            }

            if (contrato.estado !== 'vigente') {
                throw new Error('Solo se pueden crear seguimientos para contratos vigentes');
            }

            // Validar que el contrato pertenece al cliente
            if (contrato.clienteId.toString() !== datosSeguimiento.clienteId.toString()) {
                throw new Error('El contrato no pertenece al cliente especificado');
            }

            // Validar fechas
            this.validarFechasSeguimiento(datosSeguimiento.fecha);

            // Validar datos físicos
            this.validarDatosFisicos(datosSeguimiento);

            // Crear instancia del seguimiento
            const seguimiento = new Seguimiento({
                clienteId: datosSeguimiento.clienteId,
                contratoId: datosSeguimiento.contratoId,
                fecha: datosSeguimiento.fecha,
                peso: datosSeguimiento.peso,
                grasaCorporal: datosSeguimiento.grasaCorporal,
                medidas: datosSeguimiento.medidas || {},
                fotos: datosSeguimiento.fotos || [],
                comentarios: datosSeguimiento.comentarios || ''
            });

            // Intentar usar transacciones si están disponibles
            try {
                const session = this.db.client.startSession();
                
                try {
                    let resultado;
                    
                    await session.withTransaction(async () => {
                        // 1. Crear el seguimiento
                        const seguimientoId = await this.seguimientoRepository.create(seguimiento);

                        // 2. Actualizar estadísticas del cliente si es necesario
                        await this.actualizarEstadisticasCliente(datosSeguimiento.clienteId);

                        resultado = {
                            success: true,
                            seguimientoId: seguimientoId,
                            mensaje: 'Seguimiento creado exitosamente'
                        };
                    });

                    return resultado;
                } finally {
                    await session.endSession();
                }
            } catch (transactionError) {
                // Si las transacciones no están disponibles, crear sin transacción
                console.log('⚠️ Transacciones no disponibles, creando sin transacción...');
                
                // 1. Crear el seguimiento
                const seguimientoId = await this.seguimientoRepository.create(seguimiento);

                // 2. Actualizar estadísticas del cliente si es necesario
                await this.actualizarEstadisticasCliente(datosSeguimiento.clienteId);

                return {
                    success: true,
                    seguimientoId: seguimientoId,
                    mensaje: 'Seguimiento creado exitosamente'
                };
            }

        } catch (error) {
            throw new Error(`Error al crear seguimiento: ${error.message}`);
        }
    }

    /**
     * Lista seguimientos con filtros opcionales
     * @param {Object} filtros - Filtros de búsqueda
     * @param {Object} opciones - Opciones de paginación
     * @returns {Promise<Object>} Lista de seguimientos
     */
    async listarSeguimientos(filtros = {}, opciones = {}) {
        try {
            const seguimientos = await this.seguimientoRepository.getAll(filtros, opciones);
            
            // Enriquecer con información de cliente y contrato
            const seguimientosEnriquecidos = await Promise.all(
                seguimientos.map(async (seguimiento) => {
                    const cliente = await this.clienteRepository.getById(seguimiento.clienteId);
                    const contrato = await this.contratoRepository.getById(seguimiento.contratoId);
                    
                    return {
                        ...seguimiento,
                        cliente: cliente ? {
                            nombre: cliente.nombre,
                            apellido: cliente.apellido,
                            email: cliente.email
                        } : null,
                        contrato: contrato ? {
                            contratoId: contrato.contratoId,
                            estado: contrato.estado,
                            fechaInicio: contrato.fechaInicio,
                            fechaFin: contrato.fechaFin
                        } : null
                    };
                })
            );

            return {
                success: true,
                data: seguimientosEnriquecidos,
                total: seguimientosEnriquecidos.length
            };
        } catch (error) {
            throw new Error(`Error al listar seguimientos: ${error.message}`);
        }
    }

    /**
     * Obtiene un seguimiento por ID con información completa
     * @param {string|ObjectId} seguimientoId - ID del seguimiento
     * @returns {Promise<Object>} Seguimiento con información completa
     */
    async obtenerSeguimiento(seguimientoId) {
        try {
            const seguimiento = await this.seguimientoRepository.getById(seguimientoId);
            if (!seguimiento) {
                throw new Error('Seguimiento no encontrado');
            }

            // Obtener información del cliente y contrato
            const cliente = await this.clienteRepository.getById(seguimiento.clienteId);
            const contrato = await this.contratoRepository.getById(seguimiento.contratoId);

            return {
                success: true,
                data: {
                    _id: seguimiento.seguimientoId,
                    seguimientoId: seguimiento.seguimientoId,
                    clienteId: seguimiento.clienteId,
                    contratoId: seguimiento.contratoId,
                    fecha: seguimiento.fecha,
                    peso: seguimiento.peso,
                    grasaCorporal: seguimiento.grasaCorporal,
                    medidas: seguimiento.medidas,
                    fotos: seguimiento.fotos,
                    comentarios: seguimiento.comentarios,
                    cliente: cliente ? {
                        nombre: cliente.nombre,
                        apellido: cliente.apellido,
                        email: cliente.email,
                        telefono: cliente.telefono
                    } : null,
                    contrato: contrato ? {
                        contratoId: contrato.contratoId,
                        estado: contrato.estado,
                        fechaInicio: contrato.fechaInicio,
                        fechaFin: contrato.fechaFin,
                        precio: contrato.precio
                    } : null
                }
            };
        } catch (error) {
            throw new Error(`Error al obtener seguimiento: ${error.message}`);
        }
    }

    /**
     * Actualiza un seguimiento existente
     * @param {string|ObjectId} seguimientoId - ID del seguimiento
     * @param {Object} datosActualizados - Datos a actualizar
     * @returns {Promise<Object>} Resultado de la operación
     */
    async actualizarSeguimiento(seguimientoId, datosActualizados) {
        try {
            const seguimiento = await this.seguimientoRepository.getById(seguimientoId);
            if (!seguimiento) {
                throw new Error('Seguimiento no encontrado');
            }

            // Validar fechas si se actualizan
            if (datosActualizados.fecha) {
                this.validarFechasSeguimiento(datosActualizados.fecha);
            }

            // Validar datos físicos si se actualizan
            if (datosActualizados.peso || datosActualizados.grasaCorporal || datosActualizados.medidas) {
                this.validarDatosFisicos(datosActualizados);
            }

            const resultado = await this.seguimientoRepository.update(seguimientoId, datosActualizados);
            
            if (resultado) {
                // Actualizar estadísticas del cliente
                await this.actualizarEstadisticasCliente(seguimiento.clienteId);
                
                // Analizar progreso si se actualizaron datos físicos
                let analisisProgreso = null;
                if (datosActualizados.peso || datosActualizados.grasaCorporal || datosActualizados.medidas) {
                    analisisProgreso = await this.analizarProgresoActualizacion(seguimientoId, seguimiento, datosActualizados);
                }
                
                return {
                    success: true,
                    mensaje: 'Seguimiento actualizado exitosamente',
                    data: resultado,
                    analisisProgreso: analisisProgreso
                };
            }
            
            return {
                success: true,
                mensaje: 'Seguimiento actualizado exitosamente',
                data: resultado
            };
        } catch (error) {
            throw new Error(`Error al actualizar seguimiento: ${error.message}`);
        }
    }

    /**
     * Analiza el progreso de una actualización de seguimiento
     * @param {string} seguimientoId - ID del seguimiento
     * @param {Object} seguimientoAnterior - Datos anteriores del seguimiento
     * @param {Object} datosActualizados - Datos actualizados
     * @returns {Promise<Object>} Análisis de progreso
     */
    async analizarProgresoActualizacion(seguimientoId, seguimientoAnterior, datosActualizados) {
        try {
            // Obtener todos los seguimientos del mismo cliente
            const seguimientosAnteriores = await this.seguimientoRepository.getFollowUpsByClient(seguimientoAnterior.clienteId);
            
            // Filtrar seguimientos anteriores (excluyendo el actual) y ordenar por fecha
            const seguimientosParaComparar = seguimientosAnteriores
                .filter(s => {
                    const idActual = s.seguimientoId ? s.seguimientoId.toString() : null;
                    return idActual && idActual !== seguimientoId.toString();
                })
                .sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

            if (seguimientosParaComparar.length === 0) {
                return {
                    mensaje: "📊 Necesitas al menos 2 seguimientos para analizar el progreso. ¡Sigue registrando tus datos!",
                    tipo: "primera_actualizacion"
                };
            }

            // Usar el seguimiento anterior más reciente para comparar
            const seguimientoComparar = seguimientosParaComparar[0];

            if (!seguimientoComparar) {
                return {
                    mensaje: "📊 No hay suficientes datos para comparar. ¡Sigue registrando tu progreso!",
                    tipo: "sin_comparacion"
                };
            }

            // Crear objeto con datos actualizados para comparación
            const seguimientoActual = {
                peso: datosActualizados.peso !== undefined ? datosActualizados.peso : seguimientoAnterior.peso,
                grasaCorporal: datosActualizados.grasaCorporal !== undefined ? datosActualizados.grasaCorporal : seguimientoAnterior.grasaCorporal,
                medidas: {
                    ...seguimientoAnterior.medidas,
                    ...datosActualizados.medidas
                }
            };

            // Analizar progreso
            const analisis = this.progresoService.analizarProgreso(seguimientoActual, seguimientoComparar);
            
            return {
                analisis: analisis,
                resumen: this.progresoService.generarResumenMotivacional(analisis),
                tipo: "analisis_completo"
            };

        } catch (error) {
            console.log('⚠️ Error al analizar progreso:', error.message);
            return {
                mensaje: "📊 No se pudo analizar el progreso en este momento",
                tipo: "error_analisis"
            };
        }
    }

    /**
     * Elimina un seguimiento
     * @param {string|ObjectId} seguimientoId - ID del seguimiento
     * @returns {Promise<Object>} Resultado de la operación
     */
    async eliminarSeguimiento(seguimientoId) {
        try {
            const seguimiento = await this.seguimientoRepository.getById(seguimientoId);
            if (!seguimiento) {
                throw new Error('Seguimiento no encontrado');
            }

            // Intentar usar transacciones si están disponibles
            try {
                const session = this.db.client.startSession();
                
                try {
                    let resultado;
                    
                    await session.withTransaction(async () => {
                        // 1. Eliminar el seguimiento con rollback
                        const eliminado = await this.seguimientoRepository.deleteFollowUpWithRollback(seguimientoId);

                        if (!eliminado) {
                            throw new Error('No se pudo eliminar el seguimiento');
                        }

                        // 2. Actualizar estadísticas del cliente
                        await this.actualizarEstadisticasCliente(seguimiento.clienteId);

                        resultado = {
                            success: true,
                            mensaje: 'Seguimiento eliminado exitosamente'
                        };
                    });

                    return resultado;
                } finally {
                    await session.endSession();
                }
            } catch (transactionError) {
                // Si las transacciones no están disponibles, eliminar sin transacción
                console.log('⚠️ Transacciones no disponibles, eliminando sin transacción...');
                
                // 1. Eliminar el seguimiento
                const eliminado = await this.seguimientoRepository.delete(seguimientoId);

                if (!eliminado) {
                    throw new Error('No se pudo eliminar el seguimiento');
                }

                // 2. Actualizar estadísticas del cliente
                await this.actualizarEstadisticasCliente(seguimiento.clienteId);

                return {
                    success: true,
                    mensaje: 'Seguimiento eliminado exitosamente'
                };
            }

        } catch (error) {
            throw new Error(`Error al eliminar seguimiento: ${error.message}`);
        }
    }

    /**
     * Obtiene seguimientos por cliente
     * @param {string|ObjectId} clienteId - ID del cliente
     * @param {Object} opciones - Opciones de consulta
     * @returns {Promise<Object>} Seguimientos del cliente
     */
    async obtenerSeguimientosPorCliente(clienteId, opciones = {}) {
        try {
            const cliente = await this.clienteRepository.getById(clienteId);
            if (!cliente) {
                throw new Error('Cliente no encontrado');
            }

            const seguimientos = await this.seguimientoRepository.getFollowUpsByClient(clienteId, opciones);
            
            return {
                success: true,
                data: seguimientos,
                total: seguimientos.length,
                cliente: {
                    nombre: cliente.nombre,
                    apellido: cliente.apellido,
                    email: cliente.email
                }
            };
        } catch (error) {
            throw new Error(`Error al obtener seguimientos del cliente: ${error.message}`);
        }
    }

    /**
     * Obtiene el progreso de peso de un cliente
     * @param {string|ObjectId} clienteId - ID del cliente
     * @returns {Promise<Object>} Progreso de peso del cliente
     */
    async obtenerProgresoPeso(clienteId) {
        try {
            const cliente = await this.clienteRepository.getById(clienteId);
            if (!cliente) {
                throw new Error('Cliente no encontrado');
            }

            const progreso = await this.seguimientoRepository.getWeightProgress(clienteId);
            
            return {
                success: true,
                data: {
                    cliente: {
                        nombre: cliente.nombre,
                        apellido: cliente.apellido
                    },
                    ...progreso
                }
            };
        } catch (error) {
            throw new Error(`Error al obtener progreso de peso: ${error.message}`);
        }
    }

    /**
     * Obtiene estadísticas de seguimientos por cliente
     * @param {string|ObjectId} clienteId - ID del cliente
     * @returns {Promise<Object>} Estadísticas del cliente
     */
    async obtenerEstadisticasCliente(clienteId) {
        try {
            const cliente = await this.clienteRepository.getById(clienteId);
            if (!cliente) {
                throw new Error('Cliente no encontrado');
            }

            const stats = await this.seguimientoRepository.getClientFollowUpStats(clienteId);
            
            return {
                success: true,
                data: {
                    cliente: {
                        nombre: cliente.nombre,
                        apellido: cliente.apellido,
                        email: cliente.email
                    },
                    ...stats
                }
            };
        } catch (error) {
            throw new Error(`Error al obtener estadísticas del cliente: ${error.message}`);
        }
    }

    /**
     * Obtiene seguimientos por rango de fechas
     * @param {Date} fechaInicio - Fecha de inicio
     * @param {Date} fechaFin - Fecha de fin
     * @param {string|ObjectId} clienteId - ID del cliente (opcional)
     * @returns {Promise<Object>} Seguimientos en el rango
     */
    async obtenerSeguimientosPorFechas(fechaInicio, fechaFin, clienteId = null) {
        try {
            this.validarFechasSeguimiento(fechaInicio);
            this.validarFechasSeguimiento(fechaFin);

            if (fechaInicio >= fechaFin) {
                throw new Error('La fecha de inicio debe ser anterior a la fecha de fin');
            }

            const seguimientos = await this.seguimientoRepository.getFollowUpsByDateRange(
                fechaInicio, 
                fechaFin, 
                clienteId
            );
            
            return {
                success: true,
                data: seguimientos,
                total: seguimientos.length,
                rango: {
                    fechaInicio,
                    fechaFin
                }
            };
        } catch (error) {
            throw new Error(`Error al obtener seguimientos por fechas: ${error.message}`);
        }
    }

    /**
     * Valida las fechas de un seguimiento
     * @param {Date} fecha - Fecha del seguimiento
     * @throws {Error} Si la fecha no es válida
     */
    validarFechasSeguimiento(fecha) {
        if (!(fecha instanceof Date)) {
            throw new Error('Fecha debe ser un objeto Date');
        }

        const mañana = new Date();
        mañana.setDate(mañana.getDate() + 1);
        
        if (fecha > mañana) {
            throw new Error('Fecha del seguimiento no puede ser más de 1 día en el futuro');
        }

        // Verificar que no sea muy antigua (más de 1 año)
        const unAnoAtras = new Date();
        unAnoAtras.setFullYear(unAnoAtras.getFullYear() - 1);
        
        if (fecha < unAnoAtras) {
            throw new Error('Fecha del seguimiento no puede ser anterior a 1 año');
        }
    }

    /**
     * Valida los datos físicos del seguimiento
     * @param {Object} datos - Datos físicos a validar
     * @throws {Error} Si los datos no son válidos
     */
    validarDatosFisicos(datos) {
        // Validar peso
        if (datos.peso !== null && datos.peso !== undefined) {
            if (typeof datos.peso !== 'number' || datos.peso <= 0 || datos.peso > 500) {
                throw new Error('Peso debe ser un número entre 0 y 500 kg');
            }
        }

        // Validar grasa corporal
        if (datos.grasaCorporal !== null && datos.grasaCorporal !== undefined) {
            if (typeof datos.grasaCorporal !== 'number' || datos.grasaCorporal < 0 || datos.grasaCorporal > 100) {
                throw new Error('Grasa corporal debe ser un número entre 0 y 100%');
            }
        }

        // Validar medidas
        if (datos.medidas && typeof datos.medidas === 'object') {
            const medidasValidas = ['cintura', 'brazo', 'pierna', 'pecho', 'cadera'];
            
            for (const [medida, valor] of Object.entries(datos.medidas)) {
                if (!medidasValidas.includes(medida)) {
                    throw new Error(`Medida '${medida}' no es válida`);
                }
                
                if (typeof valor !== 'number' || valor <= 0 || valor > 200) {
                    throw new Error(`Valor de ${medida} debe ser un número entre 0 y 200 cm`);
                }
            }
        }
    }

    /**
     * Actualiza las estadísticas del cliente
     * @param {string|ObjectId} clienteId - ID del cliente
     * @private
     */
    async actualizarEstadisticasCliente(clienteId) {
        try {
            // Esta función podría actualizar estadísticas calculadas del cliente
            // Por ejemplo, último peso registrado, progreso, etc.
            // Por ahora solo registramos que se actualizó
            console.log(`📊 Estadísticas actualizadas para cliente ${clienteId}`);
        } catch (error) {
            console.error('Error al actualizar estadísticas del cliente:', error.message);
        }
    }
}

module.exports = SeguimientoService;
