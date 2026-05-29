import { useState } from 'react';
import KnapsackModule from './components/KnapsackModule';
import GraphModule from './components/GraphModule';
import OptimizerModule from './components/OptimizerModule';
import StrategicAnalysis from './components/StrategicAnalysis'; // <-- Nuevo Import

function App() {
  const [activeTab, setActiveTab] = useState('knapsack');

  const [results, setResults] = useState({
    knapsack: null,
    graph: null,
    optimizer: null
  });

  // ... (Mantenemos tus tabs y handleResultUpdate igual) ...
  const tabs = [
    { id: 'knapsack', label: 'Carga de Servidores', icon: '🖥️', description: 'Programación Dinámica — Mochila 0/1' },
    { id: 'graph', label: 'Red de Distribución', icon: '🌐', description: 'PD Backward — Grafos por Etapas' },
    { id: 'optimizer', label: 'Marketing', icon: '📊', description: 'Optimización No Lineal' },
    { id: 'ai', label: 'Análisis IA', icon: '🤖', description: 'Conclusiones Estratégicas' }
  ];

  const handleResultUpdate = (module, result) => {
    setResults(prev => ({ ...prev, [module]: result }));
  };

  const renderActiveModule = () => {
    switch (activeTab) {
      case 'knapsack':
        return <KnapsackModule onResult={(result) => handleResultUpdate('knapsack', result)} />;
      case 'graph':
        return <GraphModule onResult={(result) => handleResultUpdate('graph', result)} />;
      case 'optimizer':
        return <OptimizerModule onResult={(result) => handleResultUpdate('optimizer', result)} />;
      case 'ai':
        // Reemplazamos el placeholder por el componente real de IA, pasándole el estado global de resultados
        return <StrategicAnalysis results={results} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-nexus-bg">
      {/* === HEADER === */}
      <header className="border-b border-nexus-border bg-nexus-surface/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo y título */}
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-nexus-cyan to-nexus-purple flex items-center justify-center font-bold text-white text-sm">
                NC
              </div>
              <div>
                <h1 className="text-base font-bold text-nexus-text tracking-tight">
                  NexusCore Systems
                </h1>
                <p className="text-[10px] text-nexus-text-dim -mt-0.5">
                  Sistema de Optimización Operacional
                </p>
              </div>
            </div>
            {/* Badge de estado */}
            <div className="nexus-badge nexus-badge-cyan">
              ● Operacional
            </div>
          </div>
        </div>
      </header>

      {/* === NAVEGACIÓN POR PESTAÑAS === */}
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="flex gap-1 border-b border-nexus-border overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`nav-tab whitespace-nowrap ${activeTab === tab.id ? 'active' : ''}`}
              id={`tab-${tab.id}`}
            >
              <span className="mr-1.5">{tab.icon}</span>
              <span className="hidden sm:inline">{tab.label}</span>
              <span className="sm:hidden">{tab.icon}</span>
            </button>
          ))}
        </div>
        {/* Subtítulo del módulo activo */}
        <div className="mt-3 mb-4">
          <p className="text-xs text-nexus-text-dim">
            {tabs.find(t => t.id === activeTab)?.description}
          </p>
        </div>
      </nav>

      {/* === CONTENIDO PRINCIPAL === */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        {renderActiveModule()}
      </main>

      {/* === FOOTER === */}
      <footer className="border-t border-nexus-border py-4 mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-xs text-nexus-text-dim">
            © 2026 NexusCore Systems — Plataforma de Optimización Operacional
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
