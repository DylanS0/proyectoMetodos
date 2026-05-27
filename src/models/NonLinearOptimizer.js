/**
 * ============================================================================
 * Clase NonLinearOptimizer — Optimización No Lineal (Presupuesto de Marketing)
 * ============================================================================
 * 
 * Resuelve problemas de optimización no lineal con restricciones usando el
 * método de Gradiente Proyectado (Projected Gradient Ascent).
 * 
 * Contexto NexusCore: Optimizar la distribución del presupuesto de marketing
 * entre Campañas de Creadores de Contenido (x1) y Anuncios Programáticos (x2)
 * para maximizar la adquisición de usuarios, considerando rendimientos
 * decrecientes por saturación del mercado.
 * 
 * Modelo de referencia:
 *   Maximizar: f(x1, x2) = a·x1 + b·x2 - c·x1² - d·x2²
 *   Sujeto a:  x1 + x2 ≤ presupuesto,  x1 ≥ 0,  x2 ≥ 0
 * 
 * Algoritmo:
 *   1. Iniciar en un punto factible
 *   2. Calcular gradiente analíticamente
 *   3. Dar paso en dirección del gradiente (ascenso)
 *   4. Proyectar de vuelta a la región factible
 *   5. Repetir hasta convergencia
 * 
 * @author NexusCore Systems
 */
class NonLinearOptimizer {
  /**
   * Constructor de NonLinearOptimizer
   * @param {Object} coefficients - Coeficientes de la función objetivo {a, b, c, d}
   * @param {number} budget - Presupuesto máximo (restricción x1 + x2 ≤ budget)
   * @param {Object} options - Opciones del algoritmo (learningRate, tolerance, maxIterations)
   */
  constructor(coefficients = {}, budget = 10, options = {}) {
    // Coeficientes de la función objetivo: f(x1,x2) = a·x1 + b·x2 - c·x1² - d·x2²
    this.a = coefficients.a || 4;   // Coeficiente lineal de x1
    this.b = coefficients.b || 5;   // Coeficiente lineal de x2
    this.c = coefficients.c || 0.2; // Coeficiente cuadrático de x1²
    this.d = coefficients.d || 0.3; // Coeficiente cuadrático de x2²

    // Restricción de presupuesto
    this.budget = budget;

    // Parámetros del algoritmo de gradiente
    this.learningRate = options.learningRate || 0.1;    // Tamaño del paso (α)
    this.tolerance = options.tolerance || 1e-8;          // Tolerancia de convergencia (ε)
    this.maxIterations = options.maxIterations || 1000;  // Máximo de iteraciones
  }

  /**
   * Evalúa la función objetivo en un punto dado.
   * f(x1, x2) = a·x1 + b·x2 - c·x1² - d·x2²
   * 
   * @param {number} x1 - Inversión en Creadores de Contenido (miles de $)
   * @param {number} x2 - Inversión en Anuncios Programáticos (miles de $)
   * @returns {number} Valor de la función objetivo (usuarios adquiridos en miles)
   */
  evaluate(x1, x2) {
    return this.a * x1 + this.b * x2 - this.c * x1 ** 2 - this.d * x2 ** 2;
  }

  /**
   * Calcula el gradiente analítico de la función objetivo.
   * 
   * Derivadas parciales:
   *   ∂f/∂x1 = a - 2c·x1
   *   ∂f/∂x2 = b - 2d·x2
   * 
   * @param {number} x1 - Valor actual de x1
   * @param {number} x2 - Valor actual de x2
   * @returns {Array<number>} Vector gradiente [∂f/∂x1, ∂f/∂x2]
   */
  gradient(x1, x2) {
    const df_dx1 = this.a - 2 * this.c * x1;
    const df_dx2 = this.b - 2 * this.d * x2;
    return [df_dx1, df_dx2];
  }

  /**
   * Proyecta un punto sobre la región factible definida por las restricciones:
   *   x1 + x2 ≤ presupuesto
   *   x1 ≥ 0
   *   x2 ≥ 0
   * 
   * Proceso:
   * 1. Asegurar no-negatividad (x1 ≥ 0, x2 ≥ 0)
   * 2. Si x1 + x2 > presupuesto, proyectar al hiperplano x1 + x2 = presupuesto
   * 3. Re-verificar no-negatividad después de la proyección
   * 
   * @param {number} x1 - Coordenada x1 (posiblemente infactible)
   * @param {number} x2 - Coordenada x2 (posiblemente infactible)
   * @returns {Array<number>} Punto proyectado [x1, x2] dentro de la región factible
   */
  project(x1, x2) {
    // Paso 1: Garantizar no-negatividad
    x1 = Math.max(0, x1);
    x2 = Math.max(0, x2);

    // Paso 2: Proyectar sobre la restricción de presupuesto si se excede
    if (x1 + x2 > this.budget) {
      // Proyección ortogonal al hiperplano x1 + x2 = presupuesto
      // Se distribuye el exceso equitativamente entre ambas variables
      const excess = (x1 + x2 - this.budget) / 2;
      x1 -= excess;
      x2 -= excess;

      // Paso 3: Re-garantizar no-negatividad post-proyección
      if (x1 < 0) {
        x2 = Math.min(this.budget, x2 + Math.abs(x1)); // Transferir a x2
        x1 = 0;
      }
      if (x2 < 0) {
        x1 = Math.min(this.budget, x1 + Math.abs(x2)); // Transferir a x1
        x2 = 0;
      }
    }

    return [x1, x2];
  }

  /**
   * Ejecuta el algoritmo de Gradiente Proyectado para encontrar el máximo
   * de la función objetivo dentro de la región factible.
   * 
   * Algoritmo:
   *   1. x = punto_inicial_factible (0, 0)
   *   2. Repetir hasta convergencia o max_iteraciones:
   *      a. g = gradiente(f, x)
   *      b. x_new = x + α · g   (paso en dirección del gradiente — ascenso)
   *      c. x_new = proyectar(x_new)  (regreso a región factible)
   *      d. Si ||x_new - x|| < ε, detener (convergencia alcanzada)
   *      e. x = x_new
   * 
   * @returns {Object} Resultado de la optimización
   */
  solve() {
    // Punto inicial factible: origen (0, 0)
    let x1 = 0;
    let x2 = 0;
    const history = []; // Historial de iteraciones para visualización

    for (let iter = 0; iter < this.maxIterations; iter++) {
      // Calcular gradiente en el punto actual
      const [g1, g2] = this.gradient(x1, x2);

      // Paso de ascenso por gradiente: x_new = x + α · ∇f(x)
      let newX1 = x1 + this.learningRate * g1;
      let newX2 = x2 + this.learningRate * g2;

      // Proyectar sobre la región factible
      [newX1, newX2] = this.project(newX1, newX2);

      // Evaluar función objetivo en el nuevo punto
      const fValue = this.evaluate(newX1, newX2);

      // Registrar iteración en el historial
      history.push({
        iteration: iter + 1,
        x1: parseFloat(newX1.toFixed(6)),
        x2: parseFloat(newX2.toFixed(6)),
        fValue: parseFloat(fValue.toFixed(6)),
        gradient: [
          parseFloat(g1.toFixed(6)),
          parseFloat(g2.toFixed(6))
        ]
      });

      // Verificar criterio de convergencia: ||x_new - x|| < ε
      const deltaX = Math.sqrt((newX1 - x1) ** 2 + (newX2 - x2) ** 2);
      if (deltaX < this.tolerance) {
        x1 = newX1;
        x2 = newX2;
        break; // Convergencia alcanzada
      }

      // Actualizar punto actual
      x1 = newX1;
      x2 = newX2;
    }

    // Resultado final de la optimización
    return {
      optimalX1: parseFloat(x1.toFixed(6)),
      optimalX2: parseFloat(x2.toFixed(6)),
      maxValue: parseFloat(this.evaluate(x1, x2).toFixed(6)),
      iterations: history.length,
      converged: history.length < this.maxIterations,
      history,
      // Información del modelo para el reporte
      model: {
        a: this.a,
        b: this.b,
        c: this.c,
        d: this.d,
        budget: this.budget
      }
    };
  }
}

export default NonLinearOptimizer;
