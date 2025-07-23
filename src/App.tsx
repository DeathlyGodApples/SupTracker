import React, { useState, useEffect } from 'react';
import { AuthWrapper } from './components/Auth/AuthWrapper';
import { TrialBanner } from './components/TrialBanner';
import { UpgradePrompt } from './components/UpgradePrompt';
import { Header } from './components/Header';
import { Calendar } from './components/Calendar';
import { MedicationCard } from './components/MedicationCard';
import { MedicationForm } from './components/MedicationForm';
import { Analytics } from './components/Analytics';
import { useAuth } from './contexts/AuthContext';
import { useSupabaseMedications } from './hooks/useSupabaseMedications';
import { useNotifications } from './hooks/useNotifications';
import type { Medication, MedicationLog, ViewMode } from './types';

export default function App() {
  const { user, loading: authLoading, isPremium, isTrialExpired } = useAuth();
  const { 
    medications, 
    logs, 
    loading: dataLoading,
    saveMedication,
    updateMedication,
    deleteMedication,
    logMedicationAction,
    undoMedicationAction
  } = useSupabaseMedications();
  const [viewMode, setViewMode] = useState<ViewMode>('medications');
  const [showForm, setShowForm] = useState(false);
  const [editingMedication, setEditingMedication] = useState<Medication | undefined>();
  const [upgradePrompt, setUpgradePrompt] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    feature: string;
  }>({
    isOpen: false,
    title: '',
    description: '',
    feature: ''
  });
  const { scheduleNotification } = useNotifications();

  // Show auth wrapper if not authenticated
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthWrapper />;
  }

  // Check if user can access analytics
  const canAccessAnalytics = isPremium || !isTrialExpired;
  
  // Check if user can add more medications
  const canAddMedication = isPremium || !isTrialExpired || medications.length === 0;

  // Prevent analytics access for free users
  useEffect(() => {
    if (viewMode === 'analytics' && !canAccessAnalytics) {
      setViewMode('medications');
    }
  }, [viewMode, canAccessAnalytics]);

  useEffect(() => {
    medications.forEach(scheduleNotification);
  }, [medications, scheduleNotification]);

  const showUpgradePrompt = (title: string, description: string, feature: string) => {
    setUpgradePrompt({
      isOpen: true,
      title,
      description,
      feature
    });
  };

  const handleEditMedication = (medication: Medication) => {
    setEditingMedication(medication);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingMedication(undefined);
  };

  const handleSaveMedication = async (medicationData: Omit<Medication, 'id' | 'createdAt'>) => {
    // Check medication limit for free users
    if (!canAddMedication && !editingMedication) {
      showUpgradePrompt(
        'Upgrade to Add More Medications',
        'Free users can only track 1 medication. Upgrade to premium to track unlimited medications.',
        'unlimited-medications'
      );
      return;
    }

    try {
    if (editingMedication) {
        await updateMedication(editingMedication.id, medicationData);
    } else {
        const newMedication = await saveMedication(medicationData);
        if (newMedication) {
          scheduleNotification(newMedication);
        }
    }
    handleCloseForm();
    } catch (error) {
      console.error('Error saving medication:', error);
      // TODO: Show error message to user
    }
  };

  const handleDeleteMedication = async (id: string) => {
    try {
      await deleteMedication(id);
    } catch (error) {
      console.error('Error deleting medication:', error);
    }
  };

  const handleTakeMedication = async (id: string) => {
    try {
      await logMedicationAction(id, 'taken');
    } catch (error) {
      console.error('Error taking medication:', error);
    }
  };

  const handleSkipMedication = async (id: string) => {
    try {
      await logMedicationAction(id, 'skipped');
    } catch (error) {
      console.error('Error skipping medication:', error);
    }
  };

  const handleUndoAction = async (logId: string) => {
    try {
      await undoMedicationAction(logId);
    } catch (error) {
      console.error('Error undoing action:', error);
    }
  };

  const handleAddMedication = () => {
    if (!canAddMedication) {
      showUpgradePrompt(
        'Upgrade to Add More Medications',
        'Free users can only track 1 medication. Upgrade to premium to track unlimited medications.',
        'unlimited-medications'
      );
      return;
    }
    setShowForm(true);
  };

  const handleViewModeChange = (mode: ViewMode) => {
    if (mode === 'analytics' && !canAccessAnalytics) {
      showUpgradePrompt(
        'Upgrade to Access Analytics',
        'View detailed insights and analytics about your medication adherence with a premium subscription.',
        'analytics'
      );
      return;
    }
    setViewMode(mode);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <TrialBanner />
      <Header
        viewMode={viewMode}
        setViewMode={handleViewModeChange}
        onAddMedication={handleAddMedication}
        canAccessAnalytics={canAccessAnalytics}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {dataLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading your medications...</p>
          </div>
        ) : (
        viewMode === 'medications' ? (
          <>
            <Calendar
              medications={medications}
              logs={logs}
              isPremium={isPremium}
              isTrialExpired={isTrialExpired}
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
                  logs={logs.filter(log => log.medication_id === medication.id)}
                />
              ))}
              {medications.length === 0 && (
                <div className="col-span-full text-center py-12">
                  <p className="text-gray-500 dark:text-gray-400">
                    No medications added yet.
                  </p>
                  <button
                    onClick={handleAddMedication}
                    className="mt-4 inline-flex items-center px-4 py-2 border 
                      border-transparent text-sm font-medium rounded-md shadow-sm 
                      text-white bg-indigo-600 hover:bg-indigo-700 
                      dark:bg-indigo-500 dark:hover:bg-indigo-600 
                      focus:outline-none focus:ring-2 focus:ring-offset-2 
                      focus:ring-indigo-500 dark:focus:ring-offset-gray-900 
                      transition-colors duration-200"
                  >
                    Add Your First Medication
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          <Analytics medications={medications} logs={logs} />
        )
        )}
      </main>

      {showForm && (
        <MedicationForm
          medication={editingMedication}
          onSave={handleSaveMedication}
          onClose={handleCloseForm}
        />
      )}

      <UpgradePrompt
        isOpen={upgradePrompt.isOpen}
        onClose={() => setUpgradePrompt(prev => ({ ...prev, isOpen: false }))}
        title={upgradePrompt.title}
        description={upgradePrompt.description}
        feature={upgradePrompt.feature}
      />
    </div>
  );
}