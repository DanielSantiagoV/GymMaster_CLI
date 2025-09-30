/**
 * Servicio de Plantillas Nutricionales - Proporciona plantillas predefinidas
 * para diferentes tipos de planes nutricionales
 * 
 * PATRÓN: Service Layer - Capa de servicio que proporciona plantillas nutricionales
 * PATRÓN: Template Method - Define plantillas estándar para planes nutricionales
 * PATRÓN: Registry - Registra y organiza plantillas nutricionales
 * PATRÓN: Data Transfer Object (DTO) - Proporciona plantillas estructuradas
 * PRINCIPIO SOLID S: Responsabilidad Única - Se encarga únicamente de proporcionar plantillas nutricionales
 * PRINCIPIO SOLID O: Abierto/Cerrado - Extensible para nuevas plantillas sin modificar código existente
 * PRINCIPIO SOLID D: Inversión de Dependencias - No depende de implementaciones externas
 * 
 * NOTA: Este servicio NO maneja transacciones ya que solo proporciona plantillas estáticas
 * BUENA PRÁCTICA: Servicio especializado en plantillas nutricionales predefinidas
 */
class PlantillasNutricionService {
    /**
     * Constructor del servicio de plantillas nutricionales
     * 
     * PATRÓN: Registry - Inicializa el registro de plantillas
     * PATRÓN: Data Transfer Object (DTO) - Estructura plantillas como objetos
     * PRINCIPIO SOLID S: Responsabilidad de inicializar plantillas nutricionales
     * PRINCIPIO SOLID O: Extensible para nuevas plantillas
     * BUENA PRÁCTICA: Inicialización de plantillas predefinidas en constructor
     */
    constructor() {
        // ===== REGISTRO DE PLANTILLAS NUTRICIONALES =====
        // PATRÓN: Registry - Registra todas las plantillas disponibles
        // PATRÓN: Data Transfer Object (DTO) - Estructura plantillas como objetos
        // PRINCIPIO SOLID S: Responsabilidad de almacenar plantillas nutricionales
        // PRINCIPIO SOLID O: Fácil agregar nuevas plantillas sin modificar código existente
        this.plantillas = {
            // ===== PLANTILLA: PÉRDIDA DE PESO =====
            // PATRÓN: Template Method - Define plantilla estándar para pérdida de peso
            // PATRÓN: Data Transfer Object (DTO) - Estructura plantilla como objeto
            // PRINCIPIO SOLID S: Responsabilidad de proporcionar plantilla específica
            // PRINCIPIO SOLID O: Extensible para personalizaciones
            perdida_peso: {
                // Nombre descriptivo de la plantilla
                nombre: 'Pérdida de Peso',
                // Contenido detallado del plan nutricional
                // PATRÓN: Template Method - Plantilla estándar para pérdida de peso
                // PRINCIPIO SOLID S: Responsabilidad de proporcionar contenido específico
                detallePlan: `PLAN NUTRICIONAL PARA PÉRDIDA DE PESO

OBJETIVO: Reducir peso corporal de manera saludable y sostenible

DISTRIBUCIÓN CALÓRICA:
• Proteínas: 25-30% (1.6-2.2g por kg de peso)
• Carbohidratos: 40-45% (preferiblemente complejos)
• Grasas: 25-30% (grasas saludables)

HORARIOS DE COMIDAS:
• Desayuno: 7:00-8:00 AM
• Media mañana: 10:00-11:00 AM
• Almuerzo: 1:00-2:00 PM
• Merienda: 4:00-5:00 PM
• Cena: 7:00-8:00 PM

ALIMENTOS RECOMENDADOS:
• Proteínas: Pollo, pescado, huevos, legumbres, tofu
• Carbohidratos: Avena, quinoa, arroz integral, batata
• Grasas: Aguacate, frutos secos, aceite de oliva
• Vegetales: Espinacas, brócoli, zanahorias, tomates
• Frutas: Manzanas, bayas, cítricos

ALIMENTOS A EVITAR:
• Azúcares refinados y dulces
• Alimentos procesados
• Bebidas azucaradas
• Frituras y grasas trans
• Alcohol en exceso

HIDRATACIÓN:
• 2.5-3 litros de agua diarios
• Infusiones sin azúcar
• Evitar bebidas azucaradas

RECOMENDACIONES ADICIONALES:
• Comer cada 3-4 horas
• Masticar lentamente
• Controlar porciones
• Realizar actividad física regular
• Dormir 7-8 horas diarias`,
                evaluacionNutricional: `EVALUACIÓN NUTRICIONAL PARA PÉRDIDA DE PESO

ANÁLISIS INICIAL:
• Peso actual: ___ kg
• Altura: ___ cm
• IMC: ___
• Objetivo de peso: ___ kg
• Tiempo estimado: ___ meses

RECOMENDACIONES ESPECÍFICAS:
• Déficit calórico moderado (300-500 kcal/día)
• Enfoque en pérdida de grasa, no músculo
• Progresión gradual y sostenible
• Monitoreo semanal de peso

SUPLEMENTACIÓN (si es necesaria):
• Multivitamínico
• Omega-3
• Vitamina D
• Proteína en polvo (si es necesario)

SEGUIMIENTO:
• Peso semanal
• Medidas corporales mensuales
• Ajustes según progreso
• Revisión cada 4-6 semanas`
            },
            // ===== PLANTILLA: GANANCIA DE MASA MUSCULAR =====
            // PATRÓN: Template Method - Define plantilla estándar para ganancia de masa
            // PATRÓN: Data Transfer Object (DTO) - Estructura plantilla como objeto
            // PRINCIPIO SOLID S: Responsabilidad de proporcionar plantilla específica
            // PRINCIPIO SOLID O: Extensible para personalizaciones
            ganancia_masa: {
                // Nombre descriptivo de la plantilla
                nombre: 'Ganancia de Masa Muscular',
                // Contenido detallado del plan nutricional
                // PATRÓN: Template Method - Plantilla estándar para ganancia de masa
                // PRINCIPIO SOLID S: Responsabilidad de proporcionar contenido específico
                detallePlan: `PLAN NUTRICIONAL PARA GANANCIA DE MASA MUSCULAR

OBJETIVO: Aumentar masa muscular de manera eficiente y saludable

DISTRIBUCIÓN CALÓRICA:
• Proteínas: 30-35% (2.2-2.8g por kg de peso)
• Carbohidratos: 45-50% (para energía y recuperación)
• Grasas: 20-25% (grasas saludables)

HORARIOS DE COMIDAS:
• Desayuno: 7:00-8:00 AM
• Pre-entreno: 1 hora antes
• Post-entreno: 30 min después
• Almuerzo: 1:00-2:00 PM
• Merienda: 4:00-5:00 PM
• Cena: 7:00-8:00 PM
• Snack nocturno: 9:00-10:00 PM

ALIMENTOS RECOMENDADOS:
• Proteínas: Carne magra, pollo, pescado, huevos, lácteos
• Carbohidratos: Arroz, pasta, avena, quinoa, frutas
• Grasas: Frutos secos, aceite de oliva, aguacate
• Vegetales: Variedad de colores
• Frutas: Plátanos, manzanas, bayas

TIMING NUTRICIONAL:
• Pre-entreno: Carbohidratos + proteína ligera
• Post-entreno: Proteína + carbohidratos (ventana anabólica)
• Antes de dormir: Caseína o proteína lenta

SUPLEMENTACIÓN RECOMENDADA:
• Proteína en polvo (whey, caseína)
• Creatina monohidrato
• Beta-alanina
• Multivitamínico
• Omega-3

HIDRATACIÓN:
• 3-4 litros de agua diarios
• Electrolitos durante entrenamiento
• Bebidas isotónicas si es necesario

RECOMENDACIONES ADICIONALES:
• Superávit calórico de 300-500 kcal
• Comer cada 2-3 horas
• Enfoque en alimentos densos nutricionalmente
• Descanso adecuado para recuperación`,
                evaluacionNutricional: `EVALUACIÓN NUTRICIONAL PARA GANANCIA DE MASA

ANÁLISIS INICIAL:
• Peso actual: ___ kg
• Altura: ___ cm
• IMC: ___
• Objetivo de peso: ___ kg
• Tiempo estimado: ___ meses

RECOMENDACIONES ESPECÍFICAS:
• Superávit calórico controlado
• Enfoque en proteínas de alta calidad
• Timing nutricional optimizado
• Progresión gradual y consistente

SUPLEMENTACIÓN:
• Proteína: 1-2 batidos diarios
• Creatina: 3-5g diarios
• Multivitamínico completo
• Omega-3 para inflamación

SEGUIMIENTO:
• Peso semanal
• Medidas corporales mensuales
• Fuerza y rendimiento
• Ajustes según progreso`
            },
            // ===== PLANTILLA: MANTENIMIENTO =====
            // PATRÓN: Template Method - Define plantilla estándar para mantenimiento
            // PATRÓN: Data Transfer Object (DTO) - Estructura plantilla como objeto
            // PRINCIPIO SOLID S: Responsabilidad de proporcionar plantilla específica
            // PRINCIPIO SOLID O: Extensible para personalizaciones
            mantenimiento: {
                // Nombre descriptivo de la plantilla
                nombre: 'Mantenimiento',
                // Contenido detallado del plan nutricional
                // PATRÓN: Template Method - Plantilla estándar para mantenimiento
                // PRINCIPIO SOLID S: Responsabilidad de proporcionar contenido específico
                detallePlan: `PLAN NUTRICIONAL DE MANTENIMIENTO

OBJETIVO: Mantener peso y composición corporal actual

DISTRIBUCIÓN CALÓRICA:
• Proteínas: 25-30% (1.6-2.0g por kg de peso)
• Carbohidratos: 45-50% (balanceados)
• Grasas: 25-30% (grasas saludables)

HORARIOS DE COMIDAS:
• Desayuno: 7:00-8:00 AM
• Media mañana: 10:00-11:00 AM
• Almuerzo: 1:00-2:00 PM
• Merienda: 4:00-5:00 PM
• Cena: 7:00-8:00 PM

ALIMENTOS RECOMENDADOS:
• Proteínas: Variedad de fuentes animales y vegetales
• Carbohidratos: Integrales y naturales
• Grasas: Aceite de oliva, frutos secos, aguacate
• Vegetales: Variedad de colores y tipos
• Frutas: Estacionales y variadas

PRINCIPIOS BÁSICOS:
• Equilibrio en macronutrientes
• Variedad en alimentos
• Moderación en porciones
• Hidratación adecuada
• Actividad física regular

FLEXIBILIDAD:
• 80% alimentación estructurada
• 20% flexibilidad social
• Comidas ocasionales permitidas
• Enfoque en sostenibilidad

HIDRATACIÓN:
• 2-3 litros de agua diarios
• Infusiones y tés
• Evitar exceso de cafeína

RECOMENDACIONES ADICIONALES:
• Comer conscientemente
• Escuchar señales de hambre/saciedad
• Mantener rutinas regulares
• Monitoreo ocasional de peso`,
                evaluacionNutricional: `EVALUACIÓN NUTRICIONAL DE MANTENIMIENTO

ANÁLISIS ACTUAL:
• Peso: ___ kg
• Altura: ___ cm
• IMC: ___
• Objetivo: Mantener peso actual

RECOMENDACIONES ESPECÍFICAS:
• Balance calórico neutro
• Enfoque en calidad nutricional
• Mantenimiento de hábitos saludables
• Flexibilidad controlada

SUPLEMENTACIÓN (opcional):
• Multivitamínico
• Omega-3
• Vitamina D (si es necesario)

SEGUIMIENTO:
• Peso mensual
• Medidas corporales trimestrales
• Ajustes según cambios en estilo de vida
• Revisión cada 3-6 meses`
            },
            // ===== PLANTILLA: DEPORTIVO =====
            // PATRÓN: Template Method - Define plantilla estándar para deportistas
            // PATRÓN: Data Transfer Object (DTO) - Estructura plantilla como objeto
            // PRINCIPIO SOLID S: Responsabilidad de proporcionar plantilla específica
            // PRINCIPIO SOLID O: Extensible para personalizaciones
            deportivo: {
                // Nombre descriptivo de la plantilla
                nombre: 'Deportivo',
                // Contenido detallado del plan nutricional
                // PATRÓN: Template Method - Plantilla estándar para deportistas
                // PRINCIPIO SOLID S: Responsabilidad de proporcionar contenido específico
                detallePlan: `PLAN NUTRICIONAL DEPORTIVO

OBJETIVO: Optimizar rendimiento deportivo y recuperación

DISTRIBUCIÓN CALÓRICA:
• Proteínas: 25-30% (1.8-2.2g por kg de peso)
• Carbohidratos: 50-60% (para energía)
• Grasas: 20-25% (grasas saludables)

TIMING NUTRICIONAL:
• Pre-entreno (2-3h antes): Comida completa
• Pre-entreno (30-60min): Snack ligero
• Durante entreno: Hidratación + electrolitos
• Post-entreno (0-30min): Proteína + carbohidratos
• Post-entreno (1-2h): Comida completa

ALIMENTOS RECOMENDADOS:
• Proteínas: Carne magra, pollo, pescado, huevos, lácteos
• Carbohidratos: Arroz, pasta, avena, quinoa, frutas
• Grasas: Frutos secos, aceite de oliva, aguacate
• Vegetales: Variedad para micronutrientes
• Frutas: Plátanos, manzanas, bayas

HIDRATACIÓN DEPORTIVA:
• 3-4 litros de agua diarios
• Electrolitos durante ejercicio
• Bebidas isotónicas si es necesario
• Monitoreo de color de orina

SUPLEMENTACIÓN DEPORTIVA:
• Proteína en polvo
• Creatina monohidrato
• Beta-alanina
• Cafeína (pre-entreno)
• Multivitamínico
• Omega-3

RECOMENDACIONES ESPECÍFICAS:
• Carbohidratos según intensidad
• Proteínas para recuperación
• Hidratación antes, durante y después
• Sueño de calidad (7-9 horas)
• Descanso activo y pasivo`,
                evaluacionNutricional: `EVALUACIÓN NUTRICIONAL DEPORTIVA

ANÁLISIS DEPORTIVO:
• Deporte: ___
• Frecuencia entrenamiento: ___ veces/semana
• Duración sesiones: ___ minutos
• Intensidad: Baja/Media/Alta

RECOMENDACIONES ESPECÍFICAS:
• Calorías según gasto energético
• Carbohidratos según intensidad
• Proteínas para recuperación
• Hidratación optimizada

SUPLEMENTACIÓN:
• Proteína: 1-2 batidos diarios
• Creatina: 3-5g diarios
• Pre-entreno: Cafeína + beta-alanina
• Recuperación: Proteína + carbohidratos

SEGUIMIENTO:
• Peso corporal
• Rendimiento deportivo
• Recuperación entre sesiones
• Ajustes según temporada`
            },
            // ===== PLANTILLA: MÉDICO =====
            // PATRÓN: Template Method - Define plantilla estándar para condiciones médicas
            // PATRÓN: Data Transfer Object (DTO) - Estructura plantilla como objeto
            // PRINCIPIO SOLID S: Responsabilidad de proporcionar plantilla específica
            // PRINCIPIO SOLID O: Extensible para personalizaciones
            medico: {
                // Nombre descriptivo de la plantilla
                nombre: 'Médico',
                // Contenido detallado del plan nutricional
                // PATRÓN: Template Method - Plantilla estándar para condiciones médicas
                // PRINCIPIO SOLID S: Responsabilidad de proporcionar contenido específico
                detallePlan: `PLAN NUTRICIONAL MÉDICO

OBJETIVO: Tratamiento nutricional para condiciones médicas específicas

CONSIDERACIONES MÉDICAS:
• Condición médica: ___
• Medicamentos: ___
• Restricciones: ___
• Objetivos terapéuticos: ___

DISTRIBUCIÓN CALÓRICA:
• Proteínas: 20-25% (según condición)
• Carbohidratos: 45-55% (tipo según condición)
• Grasas: 25-30% (calidad según condición)

ALIMENTOS PERMITIDOS:
• Según condición médica específica
• Enfoque en alimentos antiinflamatorios
• Evitar alimentos que interfieran con medicamentos
• Priorizar alimentos frescos y naturales

ALIMENTOS A EVITAR:
• Según restricciones médicas
• Alimentos que interfieran con medicamentos
• Alimentos que empeoren la condición
• Procesados y ultraprocesados

HIDRATACIÓN:
• Según recomendaciones médicas
• Considerar restricciones de líquidos si aplica
• Monitoreo de electrolitos si es necesario

SUPLEMENTACIÓN:
• Solo bajo supervisión médica
• Evitar interacciones con medicamentos
• Enfoque en deficiencias específicas

RECOMENDACIONES ADICIONALES:
• Seguimiento médico regular
• Monitoreo de síntomas
• Ajustes según evolución
• Coordinación con equipo médico`,
                evaluacionNutricional: `EVALUACIÓN NUTRICIONAL MÉDICA

CONDICIÓN MÉDICA:
• Diagnóstico: ___
• Medicamentos actuales: ___
• Restricciones alimentarias: ___
• Objetivos terapéuticos: ___

RECOMENDACIONES ESPECÍFICAS:
• Plan personalizado según condición
• Consideración de interacciones medicamentosas
• Enfoque en síntomas y calidad de vida
• Coordinación con equipo médico

SUPLEMENTACIÓN:
• Solo bajo prescripción médica
• Evitar automedicación
• Considerar interacciones
• Monitoreo de efectos

SEGUIMIENTO:
• Consultas médicas regulares
• Monitoreo de síntomas
• Ajustes según evolución
• Coordinación multidisciplinaria`
            },
            // ===== PLANTILLA: PERSONALIZADO =====
            // PATRÓN: Template Method - Define plantilla estándar para planes personalizados
            // PATRÓN: Data Transfer Object (DTO) - Estructura plantilla como objeto
            // PRINCIPIO SOLID S: Responsabilidad de proporcionar plantilla específica
            // PRINCIPIO SOLID O: Extensible para personalizaciones
            personalizado: {
                // Nombre descriptivo de la plantilla
                nombre: 'Personalizado',
                // Contenido detallado del plan nutricional
                // PATRÓN: Template Method - Plantilla estándar para planes personalizados
                // PRINCIPIO SOLID S: Responsabilidad de proporcionar contenido específico
                detallePlan: `PLAN NUTRICIONAL PERSONALIZADO

OBJETIVO: Plan adaptado a necesidades específicas del cliente

INFORMACIÓN PERSONAL:
• Objetivos específicos: ___
• Preferencias alimentarias: ___
• Restricciones: ___
• Horarios disponibles: ___

DISTRIBUCIÓN CALÓRICA:
• Proteínas: ___% (___g por kg de peso)
• Carbohidratos: ___% (según preferencias)
• Grasas: ___% (calidad según objetivos)

HORARIOS PERSONALIZADOS:
• Desayuno: ___
• Media mañana: ___
• Almuerzo: ___
• Merienda: ___
• Cena: ___
• Snacks: ___

ALIMENTOS PERSONALIZADOS:
• Según preferencias del cliente
• Considerando restricciones
• Adaptado a horarios
• Enfoque en sostenibilidad

RECOMENDACIONES ESPECÍFICAS:
• Adaptado a estilo de vida
• Considerando presupuesto
• Enfoque en adherencia
• Flexibilidad según necesidades

HIDRATACIÓN:
• Según necesidades personales
• Considerando actividad
• Adaptado a preferencias

SEGUIMIENTO PERSONALIZADO:
• Según objetivos específicos
• Adaptado a disponibilidad
• Enfoque en adherencia
• Ajustes según progreso`,
                evaluacionNutricional: `EVALUACIÓN NUTRICIONAL PERSONALIZADA

OBJETIVOS ESPECÍFICOS:
• Meta principal: ___
• Tiempo estimado: ___
• Preferencias: ___
• Restricciones: ___

RECOMENDACIONES PERSONALIZADAS:
• Plan adaptado a necesidades
• Considerando estilo de vida
• Enfoque en adherencia
• Flexibilidad controlada

SUPLEMENTACIÓN:
• Según necesidades específicas
• Considerando presupuesto
• Enfoque en eficiencia

SEGUIMIENTO:
• Según objetivos específicos
• Adaptado a disponibilidad
• Enfoque en progreso personal
• Ajustes según evolución`
            }
        };
    }

    /**
     * Obtiene la plantilla para un tipo de plan específico
     * @param {string} tipoPlan - Tipo de plan
     * @returns {Object} Plantilla del plan
     * 
     * PATRÓN: Registry - Busca plantilla en el registro
     * PATRÓN: Data Transfer Object (DTO) - Retorna plantilla estructurada
     * PATRÓN: Null Object - Retorna null si no encuentra la plantilla
     * PRINCIPIO SOLID S: Responsabilidad Única - Solo se encarga de obtener plantillas
     * PRINCIPIO SOLID O: Abierto/Cerrado - Extensible para nuevas plantillas
     * PRINCIPIO SOLID L: Sustitución de Liskov - Comportamiento consistente
     * PRINCIPIO SOLID I: Segregación de Interfaces - Método específico para obtener plantilla
     * PRINCIPIO SOLID D: Inversión de Dependencias - No depende de implementaciones externas
     * 
     * NOTA: No hay transacciones ya que solo accede a datos estáticos
     * BUENA PRÁCTICA: Método simple y directo para obtener plantillas
     */
    getPlantilla(tipoPlan) {
        // ===== BÚSQUEDA DE PLANTILLA =====
        // PATRÓN: Registry - Busca plantilla en el registro
        // PATRÓN: Null Object - Retorna null si no encuentra la plantilla
        // PRINCIPIO SOLID S: Responsabilidad de obtener plantilla específica
        // PRINCIPIO SOLID L: Comportamiento consistente - siempre retorna plantilla o null
        return this.plantillas[tipoPlan] || null;
    }

    /**
     * Obtiene todas las plantillas disponibles
     * @returns {Object} Todas las plantillas
     * 
     * PATRÓN: Registry - Retorna todo el registro de plantillas
     * PATRÓN: Data Transfer Object (DTO) - Retorna plantillas estructuradas
     * PRINCIPIO SOLID S: Responsabilidad Única - Solo se encarga de obtener todas las plantillas
     * PRINCIPIO SOLID O: Abierto/Cerrado - Extensible para nuevas plantillas
     * PRINCIPIO SOLID L: Sustitución de Liskov - Comportamiento consistente
     * PRINCIPIO SOLID I: Segregación de Interfaces - Método específico para obtener todas las plantillas
     * PRINCIPIO SOLID D: Inversión de Dependencias - No depende de implementaciones externas
     * 
     * NOTA: No hay transacciones ya que solo accede a datos estáticos
     * BUENA PRÁCTICA: Método simple para obtener todas las plantillas
     */
    getAllPlantillas() {
        // ===== RETORNO DE TODAS LAS PLANTILLAS =====
        // PATRÓN: Registry - Retorna todo el registro de plantillas
        // PATRÓN: Data Transfer Object (DTO) - Retorna plantillas estructuradas
        // PRINCIPIO SOLID S: Responsabilidad de obtener todas las plantillas
        // PRINCIPIO SOLID L: Comportamiento consistente - siempre retorna el objeto de plantillas
        return this.plantillas;
    }

    /**
     * Obtiene la lista de tipos de planes disponibles
     * @returns {Array} Lista de tipos de planes
     * 
     * PATRÓN: Registry - Obtiene claves del registro de plantillas
     * PATRÓN: Data Transfer Object (DTO) - Retorna lista estructurada
     * PATRÓN: Mapper - Transforma claves a objetos con value y name
     * PRINCIPIO SOLID S: Responsabilidad Única - Solo se encarga de obtener tipos de planes
     * PRINCIPIO SOLID O: Abierto/Cerrado - Extensible para nuevas plantillas
     * PRINCIPIO SOLID L: Sustitución de Liskov - Comportamiento consistente
     * PRINCIPIO SOLID I: Segregación de Interfaces - Método específico para obtener tipos
     * PRINCIPIO SOLID D: Inversión de Dependencias - No depende de implementaciones externas
     * 
     * NOTA: No hay transacciones ya que solo accede a datos estáticos
     * BUENA PRÁCTICA: Método que transforma claves a formato útil para UI
     */
    getTiposPlanes() {
        // ===== TRANSFORMACIÓN DE CLAVES A OBJETOS =====
        // PATRÓN: Registry - Obtiene claves del registro de plantillas
        // PATRÓN: Mapper - Transforma claves a objetos con value y name
        // PATRÓN: Data Transfer Object (DTO) - Retorna lista estructurada
        // PRINCIPIO SOLID S: Responsabilidad de transformar claves a formato útil
        // PRINCIPIO SOLID L: Comportamiento consistente - siempre retorna array de objetos
        return Object.keys(this.plantillas).map(key => ({
            value: key, // Clave de la plantilla
            name: this.plantillas[key].nombre // Nombre descriptivo de la plantilla
        }));
    }
}

// ===== EXPORTACIÓN DEL MÓDULO =====
// PATRÓN: Module Pattern - Exporta la clase como módulo
// PRINCIPIO SOLID S: Responsabilidad de proporcionar la interfaz pública del servicio
module.exports = PlantillasNutricionService;
