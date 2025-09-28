const ClienteRepository = require('../repositories/ClienteRepository');
const ContratoRepository = require('../repositories/ContratoRepository');

/**
 * Servicio de Búsqueda - Facilita búsqueda de clientes y contratos
 * Implementa búsqueda por nombre, ID y otros criterios
 */
class BusquedaService {
    constructor(db) {
        this.db = db;
        this.clienteRepository = new ClienteRepository(db);
        this.contratoRepository = new ContratoRepository(db);
    }

    /**
     * Busca clientes por nombre o ID
     * @param {string} termino - Término de búsqueda
     * @returns {Promise<Array>} Lista de clientes encontrados
     */
    async buscarClientes(termino) {
        try {
            if (!termino || termino.trim() === '') {
                throw new Error('Término de búsqueda es requerido');
            }

            const terminoLimpio = termino.trim().toLowerCase();
            
            // Buscar por ID exacto primero
            if (terminoLimpio.match(/^[0-9a-fA-F]{24}$/)) {
                const cliente = await this.clienteRepository.getById(terminoLimpio);
                if (cliente) {
                    return [cliente];
                }
            }

            // Buscar por nombre
            const clientes = await this.clienteRepository.searchClients(terminoLimpio);
            return clientes;
        } catch (error) {
            throw new Error(`Error al buscar clientes: ${error.message}`);
        }
    }

    /**
     * Busca contratos por nombre o ID
     * @param {string} termino - Término de búsqueda
     * @returns {Promise<Array>} Lista de contratos encontrados
     */
    async buscarContratos(termino) {
        try {
            if (!termino || termino.trim() === '') {
                throw new Error('Término de búsqueda es requerido');
            }

            const terminoLimpio = termino.trim().toLowerCase();
            
            // Buscar por ID exacto primero
            if (terminoLimpio.match(/^[0-9a-fA-F]{24}$/)) {
                const contrato = await this.contratoRepository.getById(terminoLimpio);
                if (contrato) {
                    return [contrato];
                }
            }

            // Buscar por texto
            const contratos = await this.contratoRepository.search(terminoLimpio);
            return contratos;
        } catch (error) {
            throw new Error(`Error al buscar contratos: ${error.message}`);
        }
    }

    /**
     * Obtiene un resumen de cliente para selección
     * @param {Object} cliente - Cliente encontrado
     * @returns {Object} Resumen del cliente
     */
    getResumenCliente(cliente) {
        // Construir nombre completo
        let nombreCompleto = 'Nombre no disponible';
        
        if (cliente.nombreCompleto) {
            nombreCompleto = cliente.nombreCompleto;
        } else if (cliente.nombre && cliente.apellido) {
            nombreCompleto = `${cliente.nombre} ${cliente.apellido}`;
        } else if (cliente.nombre) {
            nombreCompleto = cliente.nombre;
        } else if (cliente.email) {
            nombreCompleto = cliente.email.split('@')[0];
        }
        
        return {
            id: cliente.clienteId ? cliente.clienteId.toString() : cliente._id.toString(),
            nombre: nombreCompleto,
            email: cliente.email || 'No registrado',
            telefono: cliente.telefono || 'No registrado',
            activo: cliente.activo ? 'Sí' : 'No'
        };
    }

    /**
     * Obtiene un resumen de contrato para selección
     * @param {Object} contrato - Contrato encontrado
     * @returns {Object} Resumen del contrato
     */
    getResumenContrato(contrato) {
        return {
            id: contrato.contratoId.toString(),
            cliente: contrato.clienteId.toString(),
            plan: contrato.planId.toString(),
            fechaInicio: contrato.fechaInicio,
            fechaFin: contrato.fechaFin,
            precio: contrato.precio,
            estado: contrato.estado
        };
    }
}

module.exports = BusquedaService;
