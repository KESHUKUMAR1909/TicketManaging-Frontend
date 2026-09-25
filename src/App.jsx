import React, { useState } from 'react';
import { useAuth } from './context/AuthContext';
import { LoginView } from './components/LoginView';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { TicketListView } from './components/TicketListView';
import { AnalyticsDashboardView } from './components/AnalyticsDashboardView';
import { UserManagementView } from './components/UserManagementView';
import { CreateTicketModal } from './components/CreateTicketModal';
import { api } from './services/api';
import { RefreshCw } from 'lucide-react';

export function App() {
  const { user, loading, isAuthenticated, isStudent, isStaff, isAdmin, isManagement } = useAuth();
  const [currentView, setCurrentView] = useState('all-tickets');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Set default view on user login
  React.useEffect(() => {
    if (isStudent) {
      setCurrentView('my-tickets');
    } else if (isManagement) {
      setCurrentView('analytics');
    } else if (isAdmin) {
      setCurrentView('all-tickets');
    } else if (isStaff) {
      setCurrentView('all-tickets');
    }
  }, [user]);

  const handleExportExcel = async () => {
    try {
      const token = localStorage.getItem('campus_token');
      const response = await fetch('/api/users/export-excel', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Download failed');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'Campus_Support_20_Students_5_Admins_Records.xlsx';
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err) {
      alert(`Excel export failed: ${err.message}`);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
        <RefreshCw className="spin" size={32} />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginView />;
  }

  return (
    <div className="app-container">
      <Sidebar
        currentView={currentView}
        setCurrentView={setCurrentView}
        onOpenCreateModal={() => setShowCreateModal(true)}
        onExportExcel={handleExportExcel}
      />

      <div className="main-content">
        <Navbar currentView={currentView} setCurrentView={setCurrentView} />

        <main className="page-body">
          {/* Student My Tickets View */}
          {currentView === 'my-tickets' && (
            <TicketListView
              key={`my-tickets-${refreshTrigger}`}
              title="My Support Tickets"
              subtitle="Track live status, SLAs, and communicate with institutional staff"
              defaultStatus="ALL"
              onOpenCreateModal={() => setShowCreateModal(true)}
            />
          )}

          {/* Student / Staff Pending Action View */}
          {currentView === 'pending-action' && (
            <TicketListView
              key={`pending-${refreshTrigger}`}
              title="Action Required & Pending Student Clarification"
              subtitle="Tickets on hold waiting for supporting document links or student replies"
              onlyPendingAction={true}
              onOpenCreateModal={isStudent ? () => setShowCreateModal(true) : null}
            />
          )}

          {/* Student Resolution History View */}
          {currentView === 'resolved-history' && (
            <TicketListView
              key={`resolved-${refreshTrigger}`}
              title="Resolved & Closed Support Tickets"
              subtitle="Historical archive of addressed student matters and feedback ratings"
              defaultStatus="RESOLVED"
            />
          )}

          {/* Staff Assigned to Me */}
          {currentView === 'assigned-me' && (
            <TicketListView
              key={`assigned-${refreshTrigger}`}
              title="Assigned to Me"
              subtitle="Your active workload across campus departments"
              onlyAssignedToMe={true}
            />
          )}

          {/* Enterprise / All Tickets Queue */}
          {currentView === 'all-tickets' && (
            <TicketListView
              key={`all-${refreshTrigger}`}
              title={isAdmin || isManagement ? 'Enterprise Support Tickets' : 'Institutional Queue'}
              subtitle="Unified triage board for fees, attendance, ID cards, certificates, and administration"
              defaultStatus="ALL"
              onOpenCreateModal={isStudent ? () => setShowCreateModal(true) : null}
            />
          )}

          {/* Escalations and SLA Breaches */}
          {currentView === 'escalated' && (
            <TicketListView
              key={`escalated-${refreshTrigger}`}
              title="Escalated & SLA Breached Tickets"
              subtitle="Priority matters flagged for senior management intervention"
              onlyEscalated={true}
            />
          )}

          {/* Management / Staff Analytics View */}
          {currentView === 'analytics' && <AnalyticsDashboardView />}

          {/* Admin User Management View */}
          {currentView === 'users' && (
            <UserManagementView onExportExcel={handleExportExcel} />
          )}
        </main>
      </div>

      {showCreateModal && (
        <CreateTicketModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => setRefreshTrigger((prev) => prev + 1)}
        />
      )}
    </div>
  );
}

export default App;
