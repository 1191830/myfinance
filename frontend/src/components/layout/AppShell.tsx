import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { TransactionFormModal } from '../forms/TransactionFormModal';
import { PeriodProvider } from '../../context/PeriodContext';

export const AppShell = () => {
  const [addOpen, setAddOpen] = useState(false);

  return (
    <PeriodProvider>
      <div className="flex min-h-screen bg-canvas text-ink">
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <Topbar onAdd={() => setAddOpen(true)} />
          <main className="flex-1 p-6">
            <Outlet />
          </main>
        </div>
        <TransactionFormModal open={addOpen} onClose={() => setAddOpen(false)} />
      </div>
    </PeriodProvider>
  );
};
