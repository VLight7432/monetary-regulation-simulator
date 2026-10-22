import React from 'react';
import Header from './components/Header.jsx';
import Footer from './components/Footer.jsx';
import MonetaryRegulationSimulator from './components/MonetaryRegulationSimulator.jsx';
import Glossary from './components/Glossary.jsx';
import FAQ from './components/FAQ.jsx';

function App() {
  return (
    <div className="App min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30">
      <Header />
      <main className="relative">
        <MonetaryRegulationSimulator />
        <div className="bg-white/30 backdrop-blur-sm">
          <Glossary />
          <FAQ />
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default App;