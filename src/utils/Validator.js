/**
 * ============================================================================
 * Clase Validator — Validación de Datos de Entrada
 * ============================================================================
 * 
 * Proporciona métodos estáticos reutilizables para validar los datos
 * ingresados por el usuario en cada módulo de la aplicación.
 * 
 * Incluye validaciones para:
 * - Números positivos y enteros
 * - Campos vacíos o nulos
 * - Rangos permitidos
 * - Datos específicos de cada módulo (microservicios, grafos, coeficientes)
 * 
 * @author NexusCore Systems
 */
class Validator {
  /**
   * Verifica que un valor sea un número finito válido.
   * @param {*} value - Valor a verificar
   * @returns {boolean} true si es un número finito
   */
  static isValidNumber(value) {
    const num = Number(value);
    return !isNaN(num) && isFinite(num);
  }

  /**
   * Verifica que un valor sea un número entero positivo (> 0).
   * @param {*} value - Valor a verificar
   * @returns {boolean} true si es entero positivo
   */
  static isPositiveInteger(value) {
    const num = Number(value);
    return Number.isInteger(num) && num > 0;
  }

  /**
   * Verifica que un valor sea un número positivo (> 0), puede ser decimal.
   * @param {*} value - Valor a verificar
   * @returns {boolean} true si es positivo
   */
  static isPositiveNumber(value) {
    const num = Number(value);
    return Validator.isValidNumber(value) && num > 0;
  }

  /**
   * Verifica que un valor sea un número no negativo (≥ 0).
   * @param {*} value - Valor a verificar
   * @returns {boolean} true si es no negativo
   */
  static isNonNegativeNumber(value) {
    const num = Number(value);
    return Validator.isValidNumber(value) && num >= 0;
  }

  /**
   * Verifica que una cadena no esté vacía después de eliminar espacios.
   * @param {string} value - Cadena a verificar
   * @returns {boolean} true si no está vacía
   */
  static isNonEmptyString(value) {
    return typeof value === 'string' && value.trim().length > 0;
  }

  /**
   * Valida los datos de entrada para el Problema de la Mochila (Sub-problema A).
   * 
   * Verifica:
   * - Que exista al menos un microservicio
   * - Que cada microservicio tenga nombre, peso (entero positivo) y valor (entero positivo)
   * - Que la capacidad del servidor sea un entero positivo
   * 
   * @param {Array<Object>} items - Lista de microservicios [{name, weight, value}]
   * @param {number} capacity - Capacidad máxima del servidor
   * @returns {Object} { isValid: boolean, errors: string[] }
   */
  static validateKnapsackInput(items, capacity) {
    const errors = [];

    // Validar capacidad del servidor
    if (!Validator.isPositiveInteger(capacity)) {
      errors.push('La capacidad del servidor debe ser un número entero positivo.');
    }

    // Validar que existan ítems
    if (!Array.isArray(items) || items.length === 0) {
      errors.push('Debe ingresar al menos un microservicio.');
      return { isValid: false, errors };
    }

    // Validar cada microservicio
    items.forEach((item, index) => {
      const label = `Microservicio ${index + 1}`;

      if (!Validator.isNonEmptyString(item.name)) {
        errors.push(`${label}: El nombre no puede estar vacío.`);
      }
      if (!Validator.isPositiveInteger(item.weight)) {
        errors.push(`${label}: El requisito de RAM debe ser un entero positivo.`);
      }
      if (!Validator.isPositiveInteger(item.value)) {
        errors.push(`${label}: El valor de prioridad debe ser un entero positivo.`);
      }
    });

    return { isValid: errors.length === 0, errors };
  }

  /**
   * Valida los datos de entrada para la Red de Distribución (Sub-problema B).
   * 
   * Verifica:
   * - Que exista al menos una etapa
   * - Que cada etapa tenga al menos una arista
   * - Que las latencias sean números positivos
   * - Que los nodos origen y destino no estén vacíos
   * 
   * @param {Array<Object>} stages - Etapas con aristas [{edges: [{from, to, latency}]}]
   * @param {string} source - Nodo origen
   * @param {string} destination - Nodo destino
   * @returns {Object} { isValid: boolean, errors: string[] }
   */
  static validateGraphInput(stages, source, destination) {
    const errors = [];

    // Validar nodos de inicio y fin
    if (!Validator.isNonEmptyString(source)) {
      errors.push('El nodo de origen no puede estar vacío.');
    }
    if (!Validator.isNonEmptyString(destination)) {
      errors.push('El nodo de destino no puede estar vacío.');
    }

    // Validar etapas
    if (!Array.isArray(stages) || stages.length === 0) {
      errors.push('Debe definir al menos una etapa en la red.');
      return { isValid: false, errors };
    }

    stages.forEach((stage, sIndex) => {
      const label = `Etapa ${sIndex + 1}`;

      if (!Array.isArray(stage.edges) || stage.edges.length === 0) {
        errors.push(`${label}: Debe tener al menos una conexión.`);
        return;
      }

      stage.edges.forEach((edge, eIndex) => {
        const edgeLabel = `${label}, Conexión ${eIndex + 1}`;

        if (!Validator.isNonEmptyString(edge.from)) {
          errors.push(`${edgeLabel}: El nodo origen no puede estar vacío.`);
        }
        if (!Validator.isNonEmptyString(edge.to)) {
          errors.push(`${edgeLabel}: El nodo destino no puede estar vacío.`);
        }
        if (!Validator.isPositiveNumber(edge.latency)) {
          errors.push(`${edgeLabel}: La latencia debe ser un número positivo.`);
        }
      });
    });

    return { isValid: errors.length === 0, errors };
  }

  /**
   * Valida los datos de entrada para la Optimización No Lineal (Parte II).
   * 
   * Verifica:
   * - Que los coeficientes lineales (a, b) sean números válidos
   * - Que los coeficientes cuadráticos (c, d) sean positivos (para concavidad)
   * - Que el presupuesto sea un número positivo
   * 
   * @param {Object} coefficients - Coeficientes {a, b, c, d}
   * @param {number} budget - Presupuesto máximo
   * @returns {Object} { isValid: boolean, errors: string[] }
   */
  static validateOptimizerInput(coefficients, budget) {
    const errors = [];

    if (!Validator.isValidNumber(coefficients.a)) {
      errors.push('El coeficiente "a" (lineal x1) debe ser un número válido.');
    }
    if (!Validator.isValidNumber(coefficients.b)) {
      errors.push('El coeficiente "b" (lineal x2) debe ser un número válido.');
    }
    if (!Validator.isPositiveNumber(coefficients.c)) {
      errors.push('El coeficiente "c" (cuadrático x1²) debe ser un número positivo para garantizar concavidad.');
    }
    if (!Validator.isPositiveNumber(coefficients.d)) {
      errors.push('El coeficiente "d" (cuadrático x2²) debe ser un número positivo para garantizar concavidad.');
    }
    if (!Validator.isPositiveNumber(budget)) {
      errors.push('El presupuesto debe ser un número positivo.');
    }

    return { isValid: errors.length === 0, errors };
  }
}

export default Validator;
