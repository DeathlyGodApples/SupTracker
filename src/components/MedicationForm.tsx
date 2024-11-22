import React, { useState } from 'react';
import { X } from 'lucide-react';
import type { Medication } from '../types';

interface MedicationFormProps {
  medication?: Medication;
  onSave: (medication: Omit<Medication, 'id' | 'createdAt'>) => void;
  onClose: () => void;
}

const MEDICATIONS = [
  { value: 'Iron', label: 'Iron' },
  { value: 'Vitamin D', label: 'Vitamin D' },
  { value: 'B12', label: 'B12' },
  { value: 'Magnesium', label: 'Magnesium' },
  { value: 'Zinc', label: 'Zinc' }
];

const DAYS_OF_WEEK = [
  { value: 0, label: 'Sunday' },
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' },
];

const MONTHS = [
  { value: 0, label: 'January' },
  { value: 1, label: 'February' },
  { value: 2, label: 'March' },
  { value: 3, label: 'April' },
  { value: 4, label: 'May' },
  { value: 5, label: 'June' },
  { value: 6, label: 'July' },
  { value: 7, label: 'August' },
  { value: 8, label: 'September' },
  { value: 9, label: 'October' },
  { value: 10, label: 'November' },
  { value: 11, label: 'December' },
];

const WEEKS = [
  { value: 1, label: 'First Week' },
  { value: 2, label: 'Second Week' },
  { value: 3, label: 'Third Week' },
  { value: 4, label: 'Fourth Week' },
];

export function MedicationForm({ medication, onSave, onClose }: MedicationFormProps) {
  const [formData, setFormData] = useState({
    name: medication?.name ?? '',
    dosage: {
      amount: medication?.dosage.amount ?? 1,
      unit: medication?.dosage.unit ?? 'pill',
      concentration: medication?.dosage.concentration ?? 0
    },
    frequency: medication?.schedule?.frequency ?? 'daily',
    times: medication?.schedule?.times?.[0] ?? '09:00',
    daysOfWeek: medication?.schedule?.daysOfWeek ?? [],
    months: medication?.schedule?.months ?? [],
    weeksOfMonth: medication?.schedule?.weeksOfMonth ?? [],
    daysOfMonth: medication?.schedule?.daysOfMonth ?? [],
    inventory: medication?.inventory ?? 0,
    notes: medication?.notes ?? ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    onSave({
      name: formData.name,
      dosage: {
        amount: formData.dosage.amount,
        unit: formData.dosage.unit as 'pill' | 'ml' | 'mg',
        concentration: formData.dosage.concentration
      },
      schedule: {
        frequency: formData.frequency as 'daily' | 'weekly' | 'monthly',
        times: [formData.times],
        daysOfWeek: formData.frequency === 'weekly' ? formData.daysOfWeek : undefined,
        months: formData.frequency === 'monthly' ? formData.months : undefined,
        weeksOfMonth: formData.frequency === 'monthly' ? formData.weeksOfMonth : undefined,
        daysOfMonth: formData.frequency === 'monthly' ? formData.daysOfMonth : undefined
      },
      inventory: Number(formData.inventory),
      notes: formData.notes
    });
  };

  const toggleSelection = (value: number, array: number[], setter: (values: number[]) => void) => {
    const newValues = array.includes(value)
      ? array.filter(v => v !== value)
      : [...array, value];
    setter(newValues);
  };

  const isFormValid = () => {
    if (formData.frequency === 'weekly' && formData.daysOfWeek.length === 0) {
      return false;
    }
    if (formData.frequency === 'monthly') {
      if (formData.months.length === 0) return false;
      if (formData.weeksOfMonth.length === 0) return false;
      if (formData.daysOfMonth.length === 0) return false;
    }
    return true;
  };

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            {medication ? 'Edit' : 'Add'} Medication
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Medication</label>
            <input
              list="medications"
              value={formData.name}
              onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
              placeholder="Select or type medication name"
            />
            <datalist id="medications">
              {MEDICATIONS.map(med => (
                <option key={med.value} value={med.value}>{med.label}</option>
              ))}
            </datalist>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Amount</label>
              <input
                type="number"
                value={formData.dosage.amount}
                onChange={e => setFormData(prev => ({
                  ...prev,
                  dosage: { ...prev.dosage, amount: Number(e.target.value) }
                }))}
                className="mt-1 block w-full rounded-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                min="0.5"
                step="0.5"
                required
                placeholder="Enter amount"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Unit</label>
              <select
                value={formData.dosage.unit}
                onChange={e => setFormData(prev => ({
                  ...prev,
                  dosage: { ...prev.dosage, unit: e.target.value }
                }))}
                className="mt-1 block w-full rounded-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
              >
                <option value="pill">Pills</option>
                <option value="ml">ML</option>
                <option value="mg">MG</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Concentration (IU)</label>
              <input
                type="number"
                value={formData.dosage.concentration}
                onChange={e => setFormData(prev => ({
                  ...prev,
                  dosage: { ...prev.dosage, concentration: Number(e.target.value) }
                }))}
                className="mt-1 block w-full rounded-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                min="0"
                step="any"
                required
                placeholder="Enter IU value"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Frequency</label>
            <select
              value={formData.frequency}
              onChange={e => setFormData(prev => ({
                ...prev,
                frequency: e.target.value,
                daysOfWeek: [],
                months: [],
                weeksOfMonth: [],
                daysOfMonth: []
              }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>

          {formData.frequency === 'weekly' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Days of Week</label>
              <div className="grid grid-cols-7 gap-2">
                {DAYS_OF_WEEK.map(day => (
                  <button
                    key={day.value}
                    type="button"
                    onClick={() => toggleSelection(
                      day.value,
                      formData.daysOfWeek,
                      (values) => setFormData(prev => ({ ...prev, daysOfWeek: values }))
                    )}
                    className={`p-2 text-xs rounded-md ${
                      formData.daysOfWeek.includes(day.value)
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {day.label.slice(0, 3)}
                  </button>
                ))}
              </div>
              {formData.daysOfWeek.length === 0 && (
                <p className="mt-2 text-sm text-red-600">Please select at least one day</p>
              )}
            </div>
          )}

          {formData.frequency === 'monthly' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Months</label>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {MONTHS.map(month => (
                    <button
                      key={month.value}
                      type="button"
                      onClick={() => toggleSelection(
                        month.value,
                        formData.months,
                        (values) => setFormData(prev => ({ ...prev, months: values }))
                      )}
                      className={`p-2 text-xs rounded-md ${
                        formData.months.includes(month.value)
                          ? 'bg-indigo-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {month.label.slice(0, 3)}
                    </button>
                  ))}
                </div>
                {formData.months.length === 0 && (
                  <p className="mt-2 text-sm text-red-600">Please select at least one month</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Weeks</label>
                <div className="grid grid-cols-2 gap-2">
                  {WEEKS.map(week => (
                    <button
                      key={week.value}
                      type="button"
                      onClick={() => toggleSelection(
                        week.value,
                        formData.weeksOfMonth,
                        (values) => setFormData(prev => ({ ...prev, weeksOfMonth: values }))
                      )}
                      className={`p-2 text-xs rounded-md ${
                        formData.weeksOfMonth.includes(week.value)
                          ? 'bg-indigo-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {week.label}
                    </button>
                  ))}
                </div>
                {formData.weeksOfMonth.length === 0 && (
                  <p className="mt-2 text-sm text-red-600">Please select at least one week</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Days</label>
                <div className="grid grid-cols-7 gap-2">
                  {DAYS_OF_WEEK.map(day => (
                    <button
                      key={day.value}
                      type="button"
                      onClick={() => toggleSelection(
                        day.value,
                        formData.daysOfMonth,
                        (values) => setFormData(prev => ({ ...prev, daysOfMonth: values }))
                      )}
                      className={`p-2 text-xs rounded-md ${
                        formData.daysOfMonth.includes(day.value)
                          ? 'bg-indigo-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {day.label.slice(0, 3)}
                    </button>
                  ))}
                </div>
                {formData.daysOfMonth.length === 0 && (
                  <p className="mt-2 text-sm text-red-600">Please select at least one day</p>
                )}
              </div>
            </>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700">Time</label>
            <input
              type="time"
              value={formData.times}
              onChange={e => setFormData(prev => ({ ...prev, times: e.target.value }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Inventory</label>
            <input
              type="number"
              value={formData.inventory}
              onChange={e => setFormData(prev => ({ ...prev, inventory: Number(e.target.value) }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              min="0"
              required
            />
          </div>

          <div className="pt-4 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!isFormValid()}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}