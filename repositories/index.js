/**
 * Índice de repositorios - Exporta todas las clases de repositorios
 * Facilita la importación de repositorios en otras partes de la aplicación
 */

const ClienteRepository = require('./ClienteRepository');
const PlanEntrenamientoRepository = require('./PlanEntrenamientoRepository');
const SeguimientoRepository = require('./SeguimientoRepository');
const NutricionRepository = require('./NutricionRepository');
const ContratoRepository = require('./ContratoRepository');
const FinanzasRepository = require('./FinanzasRepository');
const PagoRepository = require('./PagoRepository');

module.exports = {
    ClienteRepository,
    PlanEntrenamientoRepository,
    SeguimientoRepository,
    NutricionRepository,
    ContratoRepository,
    FinanzasRepository,
    PagoRepository
};
