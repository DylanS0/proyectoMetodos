import { useState } from 'react';
import KnapsackSolver from '../models/KnapsackSolver';
import Validator from '../utils/Validator';
import { DEFAULT_KNAPSACK_DATA } from '../data/defaultData';

/**
 * ============================================================================
 * Componente KnapsackModule — Módulo de Carga de Servidores (Parte I-A)
 * ============================================================================
 * 
 * Interfaz completa para el Sub-problema A: Problema de la Mochila 0/1.
 * Permite al usuario:
 * - Agregar/eliminar microservicios con nombre, RAM y prioridad
 * - Establecer la capacidad máxima del servidor
 * - Cargar datos de ejemplo del enunciado
 * - Ejecutar el algoritmo y visualizar resultados (tabla DP, ítems seleccionados)
 * 
 * @param {Function} onResult - Callback para enviar resultados al componente padre
 */
function KnapsackModule({ onResult }) {
  // === ESTADOS DEL FORMULARIO ===
  const [capacity, setCapacity] = useState(DEFAULT_KNAPSACK_DATA.capacity);
  const [items, setItems] = useState(
    DEFAULT_KNAPSACK_DATA.items.map(item => ({ ...item }))
  );

  // === ESTADOS DE RESULTADOS Y UI ===
  const [result, setResult] = useState(null);
  const [errors, setErrors] = useState([]);
  const [showDPTable, setShowDPTable] = useState(false);

  /**
   * Agrega un nuevo microservicio vacío al formulario
   */
  const addItem = () => {
    setItems([...items, { name: '', weight: '', value: '' }]);
  };

  /**
   * Elimina un microservicio del formulario por su índice
   * @param {number} index - Índice del ítem a eliminar
   */
  const removeItem = (index) => {
    if (items.length <= 1) return; // Mantener al menos un ítem
    setItems(items.filter((_, i) => i !== index));
  };

  /**
   * Actualiza un campo específico de un microservicio
   * @param {number} index - Índice del ítem a actualizar
   * @param {string} field - Campo a modificar ('name', 'weight', 'value')
   * @param {*} value - Nuevo valor del campo
   */
  const updateItem = (index, field, value) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };
    setItems(updated);
  };

  /**
   * Carga los datos por defecto del enunciado en el formulario
   */
  const loadDefaults = () => {
    setCapacity(DEFAULT_KNAPSACK_DATA.capacity);
    setItems(DEFAULT_KNAPSACK_DATA.items.map(item => ({ ...item })));
    setResult(null);
    setErrors([]);
  };

  /**
   * Ejecuta el algoritmo de la Mochila 0/1 con los datos del formulario
   */
  const solve = () => {
    // Preparar datos numéricos
    const parsedItems = items.map(item => ({
      name: item.name,
      weight: parseInt(item.weight, 10),
      value: parseInt(item.value, 10)
    }));
    const parsedCapacity = parseInt(capacity, 10);

    // Validar entrada
    const validation = Validator.validateKnapsackInput(parsedItems, parsedCapacity);
    if (!validation.isValid) {
      setErrors(validation.errors);
      setResult(null);
      return;
    }

    setErrors([]);

    // Crear instancia del solver y ejecutar el algoritmo
    const solver = new KnapsackSolver(parsedItems, parsedCapacity);
    const solverResult = solver.solve();

    setResult(solverResult);
    setShowDPTable(false);

    // Notificar al componente padre
    if (onResult) {
      onResult(solverResult);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* === SECCIÓN: ENTRADA DE DATOS === */}
      <div className="glass-card">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-lg font-bold text-nexus-text flex items-center gap-2">
              🖥️ Configuración del Servidor Maestro
            </h2>
            <p className="text-xs text-nexus-text-dim mt-1">
              Ingrese los microservicios a evaluar y la capacidad máxima de RAM
            </p>
          </div>
          <button
            onClick={loadDefaults}
            className="nexus-btn nexus-btn-secondary text-xs"
            id="btn-load-knapsack-defaults"
          >
            📋 Cargar Ejemplo
          </button>
        </div>

        {/* Capacidad del servidor */}
        <div className="mb-5">
          <label className="nexus-label" htmlFor="server-capacity">
            Capacidad Máxima del Servidor (GB de RAM)
          </label>
          <input
            id="server-capacity"
            type="number"
            min="1"
            value={capacity}
            onChange={(e) => setCapacity(e.target.value)}
            className="nexus-input max-w-xs"
            placeholder="Ej: 16"
          />
        </div>

        {/* Lista de microservicios */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="nexus-label mb-0">Microservicios</span>
            <button
              onClick={addItem}
              className="nexus-btn nexus-btn-secondary text-xs"
              id="btn-add-microservice"
            >
              + Agregar
            </button>
          </div>

          {items.map((item, index) => (
            <div
              key={index}
              className="flex items-end gap-3 p-3 rounded-lg bg-nexus-bg/50 border border-nexus-border/50 animate-slide-in"
            >
              {/* Número del microservicio */}
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-nexus-purple/20 text-nexus-purple text-xs font-bold shrink-0">
                {index + 1}
              </div>

              {/* Nombre */}
              <div className="flex-1 min-w-0">
                <label className="nexus-label" htmlFor={`item-name-${index}`}>
                  Nombre
                </label>
                <input
                  id={`item-name-${index}`}
                  type="text"
                  value={item.name}
                  onChange={(e) => updateItem(index, 'name', e.target.value)}
                  className="nexus-input"
                  placeholder="Ej: Autenticación"
                />
              </div>

              {/* RAM (peso) */}
              <div className="w-24">
                <label className="nexus-label" htmlFor={`item-weight-${index}`}>
                  RAM (GB)
                </label>
                <input
                  id={`item-weight-${index}`}
                  type="number"
                  min="1"
                  value={item.weight}
                  onChange={(e) => updateItem(index, 'weight', e.target.value)}
                  className="nexus-input"
                  placeholder="GB"
                />
              </div>

              {/* Prioridad (valor) */}
              <div className="w-24">
                <label className="nexus-label" htmlFor={`item-value-${index}`}>
                  Prioridad
                </label>
                <input
                  id={`item-value-${index}`}
                  type="number"
                  min="1"
                  value={item.value}
                  onChange={(e) => updateItem(index, 'value', e.target.value)}
                  className="nexus-input"
                  placeholder="Valor"
                />
              </div>

              {/* Botón eliminar */}
              <button
                onClick={() => removeItem(index)}
                className="nexus-btn nexus-btn-danger shrink-0"
                disabled={items.length <= 1}
                title="Eliminar microservicio"
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        {/* Botón ejecutar */}
        <div className="mt-6">
          <button
            onClick={solve}
            className="nexus-btn nexus-btn-primary w-full sm:w-auto"
            id="btn-solve-knapsack"
          >
            ⚡ Resolver Problema de la Mochila
          </button>
        </div>
      </div>

      {/* === SECCIÓN: ERRORES DE VALIDACIÓN === */}
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
              ✅ Solución Óptima
            </h3>

            {/* Métricas principales */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <div className="result-highlight">
                <div className="result-value">{result.maxValue}</div>
                <div className="result-label">Valor de Prioridad Total</div>
              </div>
              <div className="result-highlight">
                <div className="result-value">{result.totalWeight}/{result.capacity}</div>
                <div className="result-label">RAM Utilizada (GB)</div>
              </div>
              <div className="result-highlight">
                <div className="result-value">{result.selectedItems.length}/{result.totalItems}</div>
                <div className="result-label">Microservicios Seleccionados</div>
              </div>
            </div>

            {/* Microservicios seleccionados */}
            <h4 className="text-sm font-semibold text-nexus-text-dim mb-3 uppercase tracking-wider">
              Microservicios Desplegados en el Servidor
            </h4>
            <div className="overflow-x-auto rounded-lg border border-nexus-border">
              <table className="nexus-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Microservicio</th>
                    <th>RAM (GB)</th>
                    <th>Prioridad</th>
                  </tr>
                </thead>
                <tbody>
                  {result.selectedItems.map((item, i) => (
                    <tr key={i}>
                      <td>
                        <span className="nexus-badge nexus-badge-green">{item.index}</span>
                      </td>
                      <td className="font-sans font-medium text-nexus-text">{item.name}</td>
                      <td>{item.weight} GB</td>
                      <td className="highlight-cell">{item.value}</td>
                    </tr>
                  ))}
                  {/* Fila de totales */}
                  <tr className="border-t-2 border-nexus-cyan/30">
                    <td colSpan="2" className="font-sans font-bold text-nexus-cyan text-right">
                      TOTAL
                    </td>
                    <td className="font-bold text-nexus-cyan">{result.totalWeight} GB</td>
                    <td className="font-bold text-nexus-cyan">{result.maxValue}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Tabla de Programación Dinámica */}
          <div className="glass-card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-nexus-text flex items-center gap-2">
                📐 Tabla de Programación Dinámica
              </h3>
              <button
                onClick={() => setShowDPTable(!showDPTable)}
                className="nexus-btn nexus-btn-secondary text-xs"
                id="btn-toggle-dp-table"
              >
                {showDPTable ? '▲ Ocultar' : '▼ Mostrar'} Tabla DP
              </button>
            </div>

            {showDPTable && (
              <div className="dp-table-container animate-fade-in">
                <table className="nexus-table">
                  <thead>
                    <tr>
                      <th>Item \ Cap.</th>
                      {Array.from({ length: result.capacity + 1 }, (_, w) => (
                        <th key={w}>{w}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {result.dpTable.map((row, i) => (
                      <tr key={i}>
                        <td className="font-sans font-medium text-nexus-text-dim whitespace-nowrap">
                          {i === 0 ? 'Ø (vacío)' : `${i}. ${items[i - 1]?.name || ''}`}
                        </td>
                        {row.map((val, w) => (
                          <td
                            key={w}
                            className={
                              i === result.dpTable.length - 1 && w === result.capacity
                                ? 'highlight-cell'
                                : ''
                            }
                          >
                            {val}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {!showDPTable && (
              <p className="text-xs text-nexus-text-dim">
                La tabla DP tiene dimensiones ({result.dpTable.length} × {result.capacity + 1}).
                Haga clic en &quot;Mostrar&quot; para verla completa.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default KnapsackModule;
