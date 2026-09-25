import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import { TicketCard } from '../components/TicketCard';
import { SLAIndicator } from '../components/SLAIndicator';
import { LoginView } from '../components/LoginView';
import { CreateTicketModal } from '../components/CreateTicketModal';
import { AuthProvider } from '../context/AuthContext';

describe('UI & Functional Component Test Suite', () => {
  const sampleTicket = {
    _id: 'ticket-101',
    ticketNumber: 'TICK-26-9901',
    title: 'Duplicate Fee Payment Deduction',
    description: 'Amount deducted twice from HDFC bank account during portal enrollment.',
    category: 'Fees',
    priority: 'HIGH',
    status: 'IN_PROGRESS',
    department: 'Finance & Accounts',
    student: {
      name: 'Aarav Sharma',
      rollNumber: 'STU-2024-001',
    },
    sla: {
      responseDue: new Date(Date.now() + 10 * 3600 * 1000),
      resolutionDue: new Date(Date.now() + 20 * 3600 * 1000),
      isResolutionBreached: false,
    },
    ageHours: 4.5,
  };

  it('renders TicketCard with ticket number, title, category, and status', () => {
    const handleClick = vi.fn();
    render(<TicketCard ticket={sampleTicket} onClick={handleClick} />);

    expect(screen.getByText('TICK-26-9901')).toBeDefined();
    expect(screen.getByText('Duplicate Fee Payment Deduction')).toBeDefined();
    expect(screen.getByText('Fees')).toBeDefined();
    expect(screen.getByText('In Progress')).toBeDefined();
    expect(screen.getByText('HIGH')).toBeDefined();
    expect(screen.getByText(/Aarav Sharma/)).toBeDefined();
  });

  it('renders SLAIndicator with countdown timer', () => {
    render(<SLAIndicator ticket={sampleTicket} />);
    expect(screen.getByText(/remaining/i)).toBeDefined();
  });

  it('renders SLAIndicator with resolved status when ticket is completed', () => {
    const resolvedTicket = {
      ...sampleTicket,
      status: 'RESOLVED',
      resolution: { resolutionTimeHours: 12.4 },
    };
    render(<SLAIndicator ticket={resolvedTicket} />);
    expect(screen.getByText(/Resolved in 12.4h/i)).toBeDefined();
  });

  it('renders LoginView with One-Click Demo accounts for all roles', () => {
    render(
      <AuthProvider>
        <LoginView />
      </AuthProvider>
    );

    expect(screen.getByText(/ONE-CLICK TEST LOGINS/i)).toBeDefined();
    expect(screen.getByText(/Aarav Sharma \(Student\)/i)).toBeDefined();
    expect(screen.getByText(/Elena Gilbert \(Registrar Staff\)/i)).toBeDefined();
    expect(screen.getByText(/Dr. Rajesh Chawla \(System Admin\)/i)).toBeDefined();
    expect(screen.getByText(/Dean Arthur \(Executive Dean\)/i)).toBeDefined();
    expect(screen.getByText(/Zoya Khan \(Revoked Student\)/i)).toBeDefined();
  });

  it('renders CreateTicketModal with categories and image link input', () => {
    const handleClose = vi.fn();
    const handleSuccess = vi.fn();

    render(
      <CreateTicketModal onClose={handleClose} onSuccess={handleSuccess} />
    );

    expect(screen.getByText('Raise Support Ticket')).toBeDefined();
    expect(screen.getByPlaceholderText(/Paste public image link URL/i)).toBeDefined();
    expect(screen.getByText('Fee Receipt')).toBeDefined();
    expect(screen.getByText('Identity Card')).toBeDefined();
    expect(screen.getByText('Medical Document')).toBeDefined();
  });
});
