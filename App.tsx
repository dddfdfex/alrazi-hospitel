
import React, { useState, useEffect, useCallback } from 'react';
import { dbService } from './db';
import { User, UserRole, MedicalItem, Transaction } from './types';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Inventory from './components/Inventory';
import TransactionEntry from './components/TransactionEntry';
import TransactionsHistory from './components/TransactionsHistory';
import Reports from './components/Reports';
import Settings from './components/Settings';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Footer from './components/Footer';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [dbReady, setDbReady] = useState(false);
  const [items, setItems] = useState<MedicalItem[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    dbService.init().then(() => {
      setDbReady(true);
      refreshData();
    });
  }, []);

  const refreshData = async () => {
    const [fetchedItems, fetchedTxs] = await Promise.all([
      dbService.getItems(),
      dbService.getTransactions()
    ]);
    setItems(fetchedItems);
    setTransactions(fetchedTxs);
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  if (!dbReady) {
    return (
      <div className="flex items-center justify-center h-screen bg-medical-light">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-medical-blue mx-auto mb-4"></div>
          <p className="text-medical-darkBlue font-semibold">جاري تحميل النظام...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return <Login onLogin={setCurrentUser} />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 overflow-hidden" dir="rtl">
      <Header user={currentUser} onLogout={handleLogout} />
      
      <div className="flex flex-1 overflow-hidden">
        <Sidebar 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          role={currentUser.role} 
        />
        
        <main className="flex-1 p-6 overflow-y-auto">
          {activeTab === 'dashboard' && (
            <Dashboard 
              items={items} 
              transactions={transactions} 
              setActiveTab={setActiveTab}
            />
          )}
          {activeTab === 'inventory' && (
            <Inventory 
              items={items} 
              onUpdate={refreshData} 
              isAdmin={currentUser.role === UserRole.ADMIN} 
            />
          )}
          {activeTab === 'inbound' && (
            <TransactionEntry 
              items={items} 
              type="INBOUND" 
              user={currentUser} 
              onComplete={refreshData} 
            />
          )}
          {activeTab === 'outbound' && (
            <TransactionEntry 
              items={items} 
              type="OUTBOUND" 
              user={currentUser} 
              onComplete={refreshData} 
            />
          )}
          {activeTab === 'history' && (
            <TransactionsHistory 
              transactions={transactions} 
              onUpdate={refreshData}
              isAdmin={currentUser.role === UserRole.ADMIN} 
            />
          )}
          {activeTab === 'reports' && (
            <Reports items={items} transactions={transactions} />
          )}
          {activeTab === 'settings' && (
            <Settings user={currentUser} onUpdateUser={setCurrentUser} />
          )}
        </main>
      </div>

      <Footer />
    </div>
  );
};

export default App;
