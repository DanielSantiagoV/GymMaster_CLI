/**
 * Índice de servicios - Exporta todas las clases de servicios
 * Facilita la importación de servicios en otras partes de la aplicación
 */

const ClienteService = require('./ClienteService');
const PlanClienteService = require('./PlanClienteService');
const PlanEntrenamientoService = require('./PlanEntrenamientoService');

module.exports = {
    ClienteService,
    PlanClienteService,
    PlanEntrenamientoService
};
