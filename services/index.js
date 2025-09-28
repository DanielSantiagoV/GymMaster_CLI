/**
 * Índice de servicios - Exporta todas las clases de servicios
 * Facilita la importación de servicios en otras partes de la aplicación
 */

const ClienteService = require('./ClienteService');
const PlanClienteService = require('./PlanClienteService');
const PlanEntrenamientoService = require('./PlanEntrenamientoService');
const ContratoService = require('./ContratoService');
const SeguimientoService = require('./SeguimientoService');
const ProgresoService = require('./ProgresoService');
const NutricionService = require('./NutricionService');
const BusquedaService = require('./BusquedaService');
const PlantillasNutricionService = require('./PlantillasNutricionService');
const ClienteIntegradoService = require('./ClienteIntegradoService');

module.exports = {
    ClienteService,
    PlanClienteService,
    PlanEntrenamientoService,
    ContratoService,
    SeguimientoService,
    ProgresoService,
    NutricionService,
    BusquedaService,
    PlantillasNutricionService,
    ClienteIntegradoService
};
