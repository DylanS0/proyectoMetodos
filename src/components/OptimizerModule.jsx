import { useState } from 'react';
import NonLinearOptimizer from '../models/NonLinearOptimizer';
import Validator from '../utils/Validator';
import { DEFAULT_OPTIMIZER_DATA } from '../data/defaultData';

/**
 * ============================================================================
 * Componente OptimizerModule — Optimización de Marketing (Parte II)
 * ============================================================================
 * 
 * Interfaz para la Optimización No Lineal del presupuesto de marketing.
 * Permite al usuario configurar:
 * - Coeficientes de la función objetivo (a, b, c, d)
 * - Presupuesto máximo
 * - Ver resultados: punto óptimo, valor máximo, historial de convergencia
 * 
 * Modelo: f(x1, x2) = a·x1 + b·x2 - c·x1² - d·x2²
 * Restricción: x1 + x2 ≤ presupuesto, x1 ≥ 0, x2 ≥ 0
 * 
 * @param {Function} onResult - Callback para enviar resultados al componente padre
 */
function OptimizerModule({ onResult }) {
  // === ESTADOS DEL FORMULARIO ===
  const [coefficients, setCoefficients] = useState({
    a: DEFAULT_OPTIMIZER_DATA.coefficients.a,
    b: DEFAULT_OPTIMIZER_DATA.coefficients.b,
    c: DEFAULT_OPTIMIZER_DATA.coefficients.c,
    d: DEFAULT_OPTIMIZER_DATA.coefficients.d
  });
  const [budget, setBudget] = useState(DEFAULT_OPTIMIZER_DATA.budget);

  // === ESTADOS DE RESULTADOS Y UI ===
  const [result, setResult] = useState(null);
  const [errors, setErrors] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  /**
   * Actualiza un coeficiente específico de la función objetivo
   * @param {string} key - Nombre del coeficiente ('a', 'b', 'c', 'd')
   * @param {string} value - Nuevo valor del coeficiente
   */
  const updateCoefficient = (key, value) => {
    setCoefficients(prev => ({ ...prev, [key]: value }));
  };

  /**
   * Carga los datos por defecto del enunciado
   */
  const loadDefaults = () => {
    setCoefficients({ ...DEFAULT_OPTIMIZER_DATA.coefficients });
    setBudget(DEFAULT_OPTIMIZER_DATA.budget);
    setResult(null);
    setErrors([]);
  };

  /**
   * Ejecuta el algoritmo de Gradiente Proyectado
   */
  const solve = () => {
    // Parsear coeficientes a números
    const parsedCoeffs = {
      a: parseFloat(coefficients.a),
      b: parseFloat(coefficients.b),
      c: parseFloat(coefficients.c),
      d: parseFloat(coefficients.d)
    };
    const parsedBudget = parseFloat(budget);

    // Validar entrada
    const validation = Validator.validateOptimizerInput(parsedCoeffs, parsedBudget);
    if (!validation.isValid) {
      setErrors(validation.errors);
      setResult(null);
      return;
    }

    setErrors([]);

    // Crear instancia del optimizador y ejecutar
    const optimizer = new NonLinearOptimizer(parsedCoeffs, parsedBudget);
    const optimizerResult = optimizer.solve();

    setResult(optimizerResult);
    setShowHistory(false);

    // Notificar al componente padre
    if (onResult) {
      onResult(optimizerResult);
    }
  };

  /**
   * Genera la representación en texto de la función objetivo
   * para mostrar en la interfaz
   */
  const getFunctionString = () => {
    const { a, b, c, d } = coefficients;
    return `f(x₁, x₂) = ${a}·x₁ + ${b}·x₂ - ${c}·x₁² - ${d}·x₂²`;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* === SECCIÓN: ENTRADA DE DATOS === */}
      <div className="glass-card">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-lg font-bold text-nexus-text flex items-center gap-2">
              📊 Optimización de Marketing
            </h2>
            <p className="text-xs text-nexus-text-dim mt-1">
              Distribución óptima del presupuesto entre canales de marketing
            </p>
          </div>
          <button
            onClick={loadDefaults}
            className="nexus-btn nexus-btn-secondary text-xs"
            id="btn-load-optimizer-defaults"
          >
            📋 Cargar Ejemplo
          </button>
        </div>

        {/* Modelo matemático visual */}
        <div className="nexus-alert nexus-alert-info mb-5">
          <span className="shrink-0">📐</span>
          <div>
            <p className="font-semibold text-sm mb-1">Modelo de Optimización</p>
            <p className="font-mono text-xs">
              Maximizar: {getFunctionString()}
            </p>
            <p className="font-mono text-xs mt-1">
              Sujeto a: x₁ + x₂ ≤ {budget}, &nbsp; x₁ ≥ 0, &nbsp; x₂ ≥ 0
            </p>
          </div>
        </div>

        {/* Coeficientes de la función */}
        <div className="mb-5">
          <span className="nexus-label">Coeficientes de la Función Objetivo</span>
          <p className="text-xs text-nexus-text-dim mb-3">
            f(x₁, x₂) = a·x₁ + b·x₂ - c·x₁² - d·x₂²
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {/* Coeficiente a */}
            <div>
              <label className="nexus-label" htmlFor="coeff-a">
                a (lineal x₁)
              </label>
              <input
                id="coeff-a"
                type="number"
                step="0.1"
                value={coefficients.a}
                onChange={(e) => updateCoefficient('a', e.target.value)}
                className="nexus-input"
                placeholder="4"
              />
            </div>

            {/* Coeficiente b */}
            <div>
              <label className="nexus-label" htmlFor="coeff-b">
                b (lineal x₂)
              </label>
              <input
                id="coeff-b"
                type="number"
                step="0.1"
                value={coefficients.b}
                onChange={(e) => updateCoefficient('b', e.target.value)}
                className="nexus-input"
                placeholder="5"
              />
            </div>

            {/* Coeficiente c */}
            <div>
              <label className="nexus-label" htmlFor="coeff-c">
                c (cuadrático x₁²)
              </label>
              <input
                id="coeff-c"
                type="number"
                step="0.01"
                min="0.01"
                value={coefficients.c}
                onChange={(e) => updateCoefficient('c', e.target.value)}
                className="nexus-input"
                placeholder="0.2"
              />
            </div>

            {/* Coeficiente d */}
            <div>
              <label className="nexus-label" htmlFor="coeff-d">
                d (cuadrático x₂²)
              </label>
              <input
                id="coeff-d"
                type="number"
                step="0.01"
                min="0.01"
                value={coefficients.d}
                onChange={(e) => updateCoefficient('d', e.target.value)}
                className="nexus-input"
                placeholder="0.3"
              />
            </div>
          </div>
        </div>

        {/* Presupuesto */}
        <div className="mb-5">
          <label className="nexus-label" htmlFor="marketing-budget">
            Presupuesto Máximo (x₁ + x₂ ≤)
          </label>
          <p className="text-xs text-nexus-text-dim mb-2">
            Cada unidad representa $1,000 — Ej: 10 = $10,000
          </p>
          <input
            id="marketing-budget"
            type="number"
            min="1"
            step="1"
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            className="nexus-input max-w-xs"
            placeholder="10"
          />
        </div>

        {/* Variables de decisión */}
        <div className="nexus-alert nexus-alert-info mb-5">
          <span className="shrink-0">💡</span>
          <div className="text-xs">
            <p><strong>x₁</strong> = Inversión en Campañas de Creadores de Contenido (miles de $)</p>
            <p><strong>x₂</strong> = Inversión en Anuncios Programáticos (miles de $)</p>
          </div>
        </div>

        {/* Botón ejecutar */}
        <button
          onClick={solve}
          className="nexus-btn nexus-btn-primary w-full sm:w-auto"
          id="btn-solve-optimizer"
        >
          ⚡ Optimizar Distribución de Marketing
        </button>
      </div>

      {/* === SECCIÓN: ERRORES === */}
      {errors.length > 0 && (
        <div className="nexus-alert nexus-alert-error animate-fade-in">
          <span className="shrink-0">⚠️</span>
          <div>
            <p className="font-semibold mb-1">Errores de validación:</p>
            <ul className="list-disc list-inside space-y-0.5">
              {errors.map((error, i) => (
                <li key={i}>{error}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* === SECCIÓN: RESULTADOS === */}
      {result && (
        <div className="space-y-6 animate-fade-in">
          {/* Resumen de la solución */}
          <div className="glass-card">
            <h3 className="text-base font-bold text-nexus-text mb-4 flex items-center gap-2">
              ✅ Solución Óptima de Marketing
            </h3>

            {/* Métricas principales */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <div className="result-highlight">
                <div className="result-value">{result.maxValue}</div>
                <div className="result-label">Usuarios Adquiridos (miles)</div>
              </div>
              <div className="result-highlight">
                <div className="result-value">${(result.optimalX1 * 1000).toLocaleString()}</div>
                <div className="result-label">Creadores de Contenido (x₁)</div>
              </div>
              <div className="result-highlight">
                <div className="result-value">${(result.optimalX2 * 1000).toLocaleString()}</div>
                <div className="result-label">Anuncios Programáticos (x₂)</div>
              </div>
            </div>

            {/* Detalle de la solución */}
            <div className="overflow-x-auto rounded-lg border border-nexus-border mb-4">
              <table className="nexus-table">
                <thead>
                  <tr>
                    <th>Variable</th>
                    <th>Valor Óptimo</th>
                    <th>Inversión ($)</th>
                    <th>Descripción</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><span className="nexus-badge nexus-badge-cyan">x₁</span></td>
                    <td className="highlight-cell">{result.optimalX1}</td>
                    <td>${(result.optimalX1 * 1000).toLocaleString()}</td>
                    <td className="font-sans text-nexus-text-dim">Campañas de Creadores</td>
                  </tr>
                  <tr>
                    <td><span className="nexus-badge nexus-badge-purple">x₂</span></td>
                    <td className="highlight-cell">{result.optimalX2}</td>
                    <td>${(result.optimalX2 * 1000).toLocaleString()}</td>
                    <td className="font-sans text-nexus-text-dim">Anuncios Programáticos</td>
                  </tr>
                  <tr className="border-t-2 border-nexus-cyan/30">
                    <td className="font-sans font-bold text-nexus-cyan">Total</td>
                    <td className="font-bold text-nexus-cyan">
                      {(result.optimalX1 + result.optimalX2).toFixed(4)}
                    </td>
                    <td className="font-bold text-nexus-cyan">
                      ${((result.optimalX1 + result.optimalX2) * 1000).toLocaleString()}
                    </td>
                    <td className="font-sans text-nexus-text-dim">
                      Presupuesto max: ${result.model.budget * 1000}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Info de convergencia */}
            <div className="flex gap-4 text-xs">
              <span className={`nexus-badge ${result.converged ? 'nexus-badge-green' : 'nexus-badge-purple'}`}>
                {result.converged ? '✓ Convergencia alcanzada' : '⚠ Máx. iteraciones'}
              </span>
              <span className="text-nexus-text-dim">
                Iteraciones: {result.iterations}
              </span>
              <span className="text-nexus-text-dim">
                f(x₁*, x₂*) = {result.maxValue}
              </span>
            </div>
          </div>

          {/* Historial de iteraciones */}
          <div className="glass-card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-nexus-text flex items-center gap-2">
                📈 Historial de Convergencia
              </h3>
              <button
                onClick={() => setShowHistory(!showHistory)}
                className="nexus-btn nexus-btn-secondary text-xs"
                id="btn-toggle-history"
              >
                {showHistory ? '▲ Ocultar' : '▼ Mostrar'} Iteraciones
              </button>
            </div>

            {showHistory && (
              <div className="dp-table-container animate-fade-in">
                <table className="nexus-table">
                  <thead>
                    <tr>
                      <th>Iteración</th>
                      <th>x₁</th>
                      <th>x₂</th>
                      <th>f(x₁, x₂)</th>
                      <th>∂f/∂x₁</th>
                      <th>∂f/∂x₂</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.history
                      .filter((_, i) =>
                        // Mostrar las primeras 20, últimas 5, y cada 10ma
                        i < 20 || i >= result.history.length - 5 || i % 10 === 0
                      )
                      .map((entry, i) => (
                        <tr key={i}>
                          <td>{entry.iteration}</td>
                          <td>{entry.x1}</td>
                          <td>{entry.x2}</td>
                          <td className={
                            entry.iteration === result.iterations ? 'highlight-cell' : ''
                          }>
                            {entry.fValue}
                          </td>
                          <td>{entry.gradient[0]}</td>
                          <td>{entry.gradient[1]}</td>
                        </tr>
                      ))
                    }
                  </tbody>
                </table>
              </div>
            )}
            {!showHistory && (
              <p className="text-xs text-nexus-text-dim">
                El algoritmo convergió en {result.iterations} iteraciones.
                Haga clic en &quot;Mostrar&quot; para ver el detalle.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default OptimizerModule;
