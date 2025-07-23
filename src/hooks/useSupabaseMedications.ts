import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import type { Medication, MedicationLog } from '../types'

export function useSupabaseMedications() {
  const { user } = useAuth()
  const [medications, setMedications] = useState<Medication[]>([])
  const [logs, setLogs] = useState<MedicationLog[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchMedications()
      fetchLogs()
    } else {
      setMedications([])
      setLogs([])
      setLoading(false)
    }
  }, [user])

  const fetchMedications = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('medications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching medications:', error)
      } else {
        setMedications(data || [])
      }
    } catch (error) {
      console.error('Error in fetchMedications:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchLogs = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('medication_logs')
        .select('*')
        .eq('user_id', user.id)
        .order('timestamp', { ascending: false })

      if (error) {
        console.error('Error fetching logs:', error)
      } else {
        setLogs(data || [])
      }
    } catch (error) {
      console.error('Error in fetchLogs:', error)
    }
  }

  const saveMedication = async (medicationData: Omit<Medication, 'id' | 'createdAt'>) => {
    if (!user) return

    try {
      const newMedication = {
        ...medicationData,
        user_id: user.id,
        id: crypto.randomUUID(),
        created_at: new Date().toISOString()
      }

      const { error } = await supabase
        .from('medications')
        .insert(newMedication)

      if (error) {
        console.error('Error saving medication:', error)
        throw error
      }

      await fetchMedications()
      return newMedication
    } catch (error) {
      console.error('Error in saveMedication:', error)
      throw error
    }
  }

  const updateMedication = async (id: string, medicationData: Omit<Medication, 'id' | 'createdAt'>) => {
    if (!user) return

    try {
      const { error } = await supabase
        .from('medications')
        .update({
          ...medicationData,
          user_id: user.id
        })
        .eq('id', id)
        .eq('user_id', user.id)

      if (error) {
        console.error('Error updating medication:', error)
        throw error
      }

      await fetchMedications()
    } catch (error) {
      console.error('Error in updateMedication:', error)
      throw error
    }
  }

  const deleteMedication = async (id: string) => {
    if (!user) return

    try {
      // Delete associated logs first
      await supabase
        .from('medication_logs')
        .delete()
        .eq('medication_id', id)
        .eq('user_id', user.id)

      // Delete medication
      const { error } = await supabase
        .from('medications')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)

      if (error) {
        console.error('Error deleting medication:', error)
        throw error
      }

      await fetchMedications()
      await fetchLogs()
    } catch (error) {
      console.error('Error in deleteMedication:', error)
      throw error
    }
  }

  const logMedicationAction = async (medicationId: string, status: 'taken' | 'skipped') => {
    if (!user) return

    try {
      const log = {
        id: crypto.randomUUID(),
        user_id: user.id,
        medication_id: medicationId,
        timestamp: new Date().toISOString(),
        status
      }

      const { error } = await supabase
        .from('medication_logs')
        .insert(log)

      if (error) {
        console.error('Error logging medication action:', error)
        throw error
      }

      // Update inventory if taken
      if (status === 'taken') {
        const medication = medications.find(med => med.id === medicationId)
        if (medication) {
          await supabase
            .from('medications')
            .update({ inventory: Math.max(0, medication.inventory - 1) })
            .eq('id', medicationId)
            .eq('user_id', user.id)
        }
      }

      await fetchMedications()
      await fetchLogs()
      return log
    } catch (error) {
      console.error('Error in logMedicationAction:', error)
      throw error
    }
  }

  const undoMedicationAction = async (logId: string) => {
    if (!user) return

    try {
      // Get the log to undo
      const { data: logData, error: logError } = await supabase
        .from('medication_logs')
        .select('*')
        .eq('id', logId)
        .eq('user_id', user.id)
        .single()

      if (logError || !logData) {
        console.error('Error fetching log to undo:', logError)
        return
      }

      // Delete the log
      const { error: deleteError } = await supabase
        .from('medication_logs')
        .delete()
        .eq('id', logId)
        .eq('user_id', user.id)

      if (deleteError) {
        console.error('Error deleting log:', deleteError)
        throw deleteError
      }

      // If it was a 'taken' action, restore inventory
      if (logData.status === 'taken') {
        const medication = medications.find(med => med.id === logData.medication_id)
        if (medication) {
          await supabase
            .from('medications')
            .update({ inventory: medication.inventory + 1 })
            .eq('id', logData.medication_id)
            .eq('user_id', user.id)
        }
      }

      await fetchMedications()
      await fetchLogs()
    } catch (error) {
      console.error('Error in undoMedicationAction:', error)
      throw error
    }
  }

  return {
    medications,
    logs,
    loading,
    saveMedication,
    updateMedication,
    deleteMedication,
    logMedicationAction,
    undoMedicationAction,
    refetch: () => {
      fetchMedications()
      fetchLogs()
    }
  }
}