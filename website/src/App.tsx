import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { HomePage } from './pages/HomePage';
import { GettingStartedPage } from './pages/GettingStartedPage';
import { APIPage } from './pages/APIPage';
import { PluginsPage } from './pages/PluginsPage';
import { CLIPage } from './pages/CLIPage';
import { ExamplesPage } from './pages/ExamplesPage';

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/getting-started" element={<GettingStartedPage />} />
          <Route path="/api" element={<APIPage />} />
          <Route path="/plugins" element={<PluginsPage />} />
          <Route path="/cli" element={<CLIPage />} />
          <Route path="/examples" element={<ExamplesPage />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
};

export default App;
