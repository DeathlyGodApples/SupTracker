import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Calendar } from './components/Calendar';
import { MedicationCard } from './components/MedicationCard';
import { MedicationForm } from './components/MedicationForm';
import { Analytics } from './components/Analytics';
import { useLocalStorage } from './hooks/useLocalStorage';
import { useNotifications } from './hooks/useNotifications';
import type { Medication, MedicationLog, ViewMode } from './types';

export default function App() {
  const [medications, setMedications] = useLocalStorage<Medication[]>('medications', []);
  const [logs, setLogs] = useLocalStorage<MedicationLog[]>('medication-logs', []);
  const [viewMode, setViewMode] = useState<ViewMode>('medications');
  const [showForm, setShowForm] = useState(false);
  const [editingMedication, setEditingMedication] = useState<Medication | undefined>();
  const { scheduleNotification } = useNotifications();

  useEffect(() => {
    medications.forEach(scheduleNotification);
  }, [medications, scheduleNotification]);

  const handleEditMedication = (medication: Medication) => {
    setEditingMedication(medication);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingMedication(undefined);
  };

  const handleSaveMedication = (medicationData: Omit<Medication, 'id' | 'createdAt'>) => {
    if (editingMedication) {
      setMedications(medications.map(med =>
        med.id === editingMedication.id
          ? { ...medicationData, id: med.id, createdAt: med.createdAt }
          : med
      ));
    } else {
      const newMedication: Medication = {
        ...medicationData,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString()
      };
      setMedications([...medications, newMedication]);
      scheduleNotification(newMedication);
    }
    handleCloseForm();
  };

  const handleDeleteMedication = (id: string) => {
    setMedications(medications.filter(med => med.id !== id));
    setLogs(logs.filter(log => log.medicationId !== id));
  };

  const handleTakeMedication = (id: string) => {
    const log: MedicationLog = {
      id: crypto.randomUUID(),
      medicationId: id,
      timestamp: new Date().toISOString(),
      status: 'taken'
    };
    setLogs([...logs, log]);

    setMedications(medications.map(med =>
      med.id === id
        ? { ...med, inventory: Math.max(0, med.inventory - 1) }
        : med
    ));
  };

  const handleSkipMedication = (id: string) => {
    const log: MedicationLog = {
      id: crypto.randomUUID(),
      medicationId: id,
      timestamp: new Date().toISOString(),
      status: 'skipped'
    };
    setLogs([...logs, log]);
  };

  const handleUndoAction = (logId: string) => {
    const logToUndo = logs.find(log => log.id === logId);
    if (!logToUndo) return;

    setLogs(logs.filter(log => log.id !== logId));

    if (logToUndo.status === 'taken') {
      setMedications(medications.map(med =>
        med.id === logToUndo.medicationId
          ? { ...med, inventory: med.inventory + 1 }
          : med
      ));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        viewMode={viewMode}
        setViewMode={setViewMode}
        onAddMedication={() => setShowForm(true)}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {viewMode === 'medications' ? (
          <>
            <Calendar
              medications={medications}
              logs={logs}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {medications.map(medication => (
                <MedicationCard
                  key={medication.id}
                  medication={medication}
                  onTake={handleTakeMedication}
                  onSkip={handleSkipMedication}
                  onEdit={handleEditMedication}
                  onDelete={handleDeleteMedication}
                  onUndo={handleUndoAction}
                  logs={logs.filter(log => log.medicationId === medication.id)}
                />
              ))}
              {medications.length === 0 && (
                <div className="col-span-full text-center py-12">
                  <p className="text-gray-500">No medications added yet.</p>
                  <button
                    onClick={() => setShowForm(true)}
                    className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
                  >
                    Add Your First Medication
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          <Analytics medications={medications} logs={logs} />
        )}
      </main>

      {showForm && (
        <MedicationForm
          medication={editingMedication}
          onSave={handleSaveMedication}
          onClose={handleCloseForm}
        />
      )}
    </div>
  );
}