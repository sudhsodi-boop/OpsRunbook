import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRunbookStore } from '../../store/useRunbookStore';

export const PlaybookEditor = ({ playbook, onBack }: any) => {
  const { addPlaybook, updatePlaybook } = useRunbookStore();
  const [title, setTitle] = useState(playbook?.title || '');
  const [description, setDescription] = useState(playbook?.description || '');

  const handleSave = () => {
    if (!title.trim()) return;
    const item = { id: playbook?.id || `pb-${Date.now()}`, title, description, category: 'Infrastructure', severity: 'P2', tags: ['runbook'], estimatedTotalMinutes: 10, author: 'SRE', version: '1.0', updatedAt: new Date().toISOString(), steps: [] };
    playbook ? updatePlaybook(item as any) : addPlaybook(item as any);
    onBack();
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#0f172a', padding: 16 }}>
      <TouchableOpacity onPress={onBack} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}><Ionicons name="arrow-back" size={18} color="#94a3b8" /><Text style={{ color: '#94a3b8', marginLeft: 6 }}>Back</Text></TouchableOpacity>
      <Text style={{ color: '#ffffff', fontSize: 18, fontWeight: 'bold', marginBottom: 12 }}>{playbook ? 'Edit Playbook' : 'New Playbook'}</Text>
      <TextInput placeholder="Playbook Title" placeholderTextColor="#64748b" value={title} onChangeText={setTitle} style={{ backgroundColor: '#1e293b', color: '#fff', borderRadius: 8, padding: 10, marginBottom: 12 }} />
      <TextInput placeholder="Description" placeholderTextColor="#64748b" value={description} onChangeText={setDescription} multiline style={{ backgroundColor: '#1e293b', color: '#fff', borderRadius: 8, padding: 10, height: 80, marginBottom: 16 }} />
      <TouchableOpacity onPress={handleSave} style={{ backgroundColor: '#4f46e5', padding: 12, borderRadius: 8, alignItems: 'center' }}><Text style={{ color: '#fff', fontWeight: 'bold' }}>Save Playbook</Text></TouchableOpacity>
    </ScrollView>
  );
};
