import { useState } from 'react';
import { Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRunbookStore } from '../../store/useRunbookStore';
import type { Playbook, RunbookStep, Severity } from '../../types/runbook';

interface PlaybookEditorProps { playbook?: Playbook; onBack: () => void; }

export const PlaybookEditor = ({ playbook, onBack }: PlaybookEditorProps) => {
  const { addPlaybook, updatePlaybook } = useRunbookStore();
  const [title, setTitle] = useState(playbook?.title || '');
  const [description, setDescription] = useState(playbook?.description || '');
  const [category] = useState<Playbook['category']>(playbook?.category || 'Infrastructure');
  const [severity] = useState<Severity>(playbook?.severity || 'P2');
  const [serviceName, setServiceName] = useState(playbook?.serviceName || '');
  const [author, setAuthor] = useState(playbook?.author || 'Site Reliability Engineer');

  const [steps, setSteps] = useState<RunbookStep[]>(
    playbook?.steps || [
      { id: 'step-1', order: 1, title: 'Initial Healthcheck & Verification', description: 'Verify system symptoms and review active metrics.', estimatedMinutes: 3, isRequired: true, commands: [{ id: 'cmd-1', label: 'Check Status', command: 'curl -I https://internal.service/health', environment: 'Production' }] }
    ]
  );

  const handleAddStep = () => {
    const newStep: RunbookStep = { id: `step-${Date.now()}`, order: steps.length + 1, title: 'New Recovery Step', description: 'Describe the action required in this step.', estimatedMinutes: 5, isRequired: true, commands: [] };
    setSteps([...steps, newStep]);
  };

  const handleRemoveStep = (index: number) => {
    if (steps.length <= 1) { Alert.alert('Error', 'Playbook must contain at least one step.'); return; }
    const updated = steps.filter((_, i) => i !== index).map((s, idx) => ({ ...s, order: idx + 1 }));
    setSteps(updated);
  };

  const handleSave = () => {
    if (!title.trim()) { Alert.alert('Error', 'Please enter a playbook title.'); return; }
    const estimatedTotalMinutes = steps.reduce((sum, s) => sum + (Number(s.estimatedMinutes) || 0), 0);
    const savedPlaybook: Playbook = { id: playbook?.id || `pb-${Date.now()}`, title, description, category, severity, tags: ['production', 'runbook'], serviceName, estimatedTotalMinutes, author, version: playbook?.version || '1.0.0', updatedAt: new Date().toISOString(), steps };
    playbook ? updatePlaybook(savedPlaybook) : addPlaybook(savedPlaybook);
    onBack();
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <ScrollView horizontal style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}><Ionicons name="arrow-back" size={18} color="#94a3b8" /><Text style={styles.backBtnText}>Catalog</Text></TouchableOpacity>
        <TouchableOpacity style={styles.saveBtn} onPress={handleSave}><Ionicons name="save-outline" size={16} color="#ffffff" /><Text style={styles.saveBtnText}>Save</Text></TouchableOpacity>
      </ScrollView>

      <Text style={styles.pageTitle}>{playbook ? 'Edit Playbook' : 'New Playbook'}</Text>

      <ScrollView style={styles.formSection}>
        <Text style={styles.label}>Playbook Title *</Text>
        <TextInput style={styles.input} placeholder="e.g. Database Failover Response" placeholderTextColor="#64748b" value={title} onChangeText={setTitle} />
        <Text style={styles.label}>Description</Text>
        <TextInput style={[styles.input, { height: 60 }]} multiline placeholder="Summary of operational procedure..." placeholderTextColor="#64748b" value={description} onChangeText={setDescription} />

        <ScrollView horizontal style={styles.row}>
          <ScrollView style={styles.halfCol}>
            <Text style={styles.label}>Service Target</Text>
            <TextInput style={styles.input} placeholder="e.g. Core Database" placeholderTextColor="#64748b" value={serviceName} onChangeText={setServiceName} />
          </ScrollView>
          <ScrollView style={styles.halfCol}>
            <Text style={styles.label}>Author / Team</Text>
            <TextInput style={styles.input} placeholder="e.g. SRE Team" placeholderTextColor="#64748b" value={author} onChangeText={setAuthor} />
          </ScrollView>
        </ScrollView>
      </ScrollView>

      <ScrollView style={styles.stepsHeader}>
        <Text style={styles.sectionTitle}>Procedure Steps ({steps.length})</Text>
        <TouchableOpacity style={styles.addStepBtn} onPress={handleAddStep}><Ionicons name="add" size={14} color="#818cf8" /><Text style={styles.addStepText}>Add Step</Text></TouchableOpacity>
      </ScrollView>

      {steps.map((step, idx) => (
        <ScrollView key={step.id} style={styles.stepCard}>
          <ScrollView style={styles.stepCardHeader}>
            <Text style={styles.stepNumber}>Step {idx + 1}</Text>
            <TouchableOpacity onPress={() => handleRemoveStep(idx)}><Ionicons name="trash-outline" size={16} color="#ef4444" /></TouchableOpacity>
          </ScrollView>
          <TextInput style={styles.stepTitleInput} placeholder="Step Title..." placeholderTextColor="#64748b" value={step.title} onChangeText={(val) => { const updated = [...steps]; updated[idx].title = val; setSteps(updated); }} />
          <TextInput style={styles.stepDescInput} multiline placeholder="Step Description..." placeholderTextColor="#64748b" value={step.description} onChangeText={(val) => { const updated = [...steps]; updated[idx].description = val; setSteps(updated); }} />
        </ScrollView>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  content: { padding: 16, paddingBottom: 40 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  backBtnText: { color: '#94a3b8', fontSize: 14 },
  saveBtn: { backgroundColor: '#4f46e5', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8, gap: 6 },
  saveBtnText: { color: '#ffffff', fontSize: 13, fontWeight: 'bold' },
  pageTitle: { color: '#ffffff', fontSize: 20, fontWeight: 'bold', marginBottom: 16 },
  formSection: { backgroundColor: '#1e293b', borderRadius: 12, padding: 14, marginBottom: 20, gap: 12 },
  label: { color: '#94a3b8', fontSize: 12, fontWeight: '500' },
  input: { backgroundColor: '#0f172a', borderRadius: 8, borderWidth: 1, borderColor: '#334155', color: '#ffffff', paddingHorizontal: 10, paddingVertical: 8, fontSize: 13 },
  row: { flexDirection: 'row', gap: 10 },
  halfCol: { flex: 1, gap: 4 },
  stepsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { color: '#ffffff', fontSize: 16, fontWeight: 'bold' },
  addStepBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  addStepText: { color: '#818cf8', fontSize: 13, fontWeight: 'bold' },
  stepCard: { backgroundColor: '#1e293b', borderRadius: 10, padding: 12, marginBottom: 10, borderWidth: 1, borderColor: '#334155', gap: 8 },
  stepCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  stepNumber: { color: '#818cf8', fontSize: 12, fontWeight: 'bold' },
  stepTitleInput: { backgroundColor: '#0f172a', borderRadius: 6, color: '#ffffff', paddingHorizontal: 10, paddingVertical: 6, fontSize: 13, fontWeight: 'bold' },
  stepDescInput: { backgroundColor: '#0f172a', borderRadius: 6, color: '#94a3b8', paddingHorizontal: 10, paddingVertical: 6, fontSize: 12, height: 50 }
});
