import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { AppShell } from '../components/layout/AppShell';
import { OverviewPage } from '../page/OverviewPage';
import { InvestmentListPage } from '../page/InvestmentListPage';
import { SavingGoalsListPage } from '../page/SavingGoalListPage';
import { TransactionsListPage } from '../page/TransactionListPage';
import { MonthlyTransactionsPage } from '../page/MonthDetailPage';
import { CategoryListPage } from '../page/CategoryListPage';
import { RecurringTransactionListPage } from '../page/RecurringTransactionListPage';
import { DefinicoesPage } from '../page/DefinicoesPage';

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<Navigate to="/inicio" replace />} />
        <Route path="/inicio" element={<OverviewPage />} />
        <Route path="/transactions" element={<TransactionsListPage />} />
        <Route path="/transactions/monthly" element={<MonthlyTransactionsPage />} />
        <Route path="/investments" element={<InvestmentListPage />} />
        <Route path="/saving-goals" element={<SavingGoalsListPage />} />
        <Route path="/categories" element={<CategoryListPage />} />
        <Route path="/recurring-transactions" element={<RecurringTransactionListPage />} />
        <Route path="/settings" element={<DefinicoesPage />} />
        <Route path="*" element={<Navigate to="/inicio" replace />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
