import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { HabitProvider } from './context/HabitContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import DailyTracker from './pages/DailyTracker';
import WeeklyOverview from './pages/WeeklyOverview';
import MonthlyAnalytics from './pages/MonthlyAnalytics';
import YearOverview from './pages/YearOverview';
import Privacy from './pages/Privacy';

export default function App() {
  return (
    <HabitProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="tracker" element={<DailyTracker />} />
            <Route path="weekly" element={<WeeklyOverview />} />
            <Route path="monthly" element={<MonthlyAnalytics />} />
            <Route path="yearly" element={<YearOverview />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </HabitProvider>
  );
}
