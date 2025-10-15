import { useState } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import Atletas from './components/Atletas';
import Planilhas from './components/Planilhas';
import Treinos from './components/Treinos';
import Eventos from './components/Eventos';
import Ranking from './components/Ranking';
import Avaliacoes from './components/Avaliacoes';

type View = 'dashboard' | 'alunos' | 'planilhas' | 'treinos' | 'eventos' | 'ranking' | 'avaliacoes';

function App() {
  const [currentView, setCurrentView] = useState<View>('dashboard');

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard />;
      case 'alunos':
        return <Atletas />;
      case 'planilhas':
        return <Planilhas />;
      case 'treinos':
        return <Treinos />;
      case 'eventos':
        return <Eventos />;
      case 'ranking':
        return <Ranking />;
      case 'avaliacoes':
        return <Avaliacoes />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <Layout onNavigate={setCurrentView}>
      {renderView()}
    </Layout>
  );
}

export default App;
