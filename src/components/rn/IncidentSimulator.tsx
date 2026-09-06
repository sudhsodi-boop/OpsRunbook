import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { useRunbookStore } from '../../store/useRunbookStore';

export const IncidentSimulator = () => {
  const { alerts, createSimulatedAlert } = useRunbookStore();
  const [title, setTitle] = useState('');

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#0f172a', padding: 16 }}>
      <Text style={{ color: '#fff', fontSize: 18, fontWeight: 'bold', marginBottom: 12 }}>Alert Simulator</Text>
      <TextInput placeholder="Alert Title..." placeholderTextColor="#64748b" value={title} onChangeText={setTitle} style={{ backgroundColor: '#1e293b', color: '#fff', borderRadius: 8, padding: 10, marginBottom: 12 }} />
      <TouchableOpacity onPress={() => { if (title) { createSimulatedAlert({ title, description: 'Simulated alert', service: 'Core Database', severity: 'P1', source: 'Datadog' }); setTitle(''); } }} style={{ backgroundColor: '#4f46e5', padding: 12, borderRadius: 8, alignItems: 'center', marginBottom: 20 }}>
        <Text style={{ color: '#fff', fontWeight: 'bold' }}>Trigger Alert</Text>
      </TouchableOpacity>
      {alerts.map(a => (
        <View key={a.id} style={{ backgroundColor: '#1e293b', padding: 12, borderRadius: 8, marginBottom: 8 }}>
          <Text style={{ color: '#fff', fontWeight: 'bold' }}>{a.title}</Text>
          <Text style={{ color: '#94a3b8', fontSize: 12 }}>{a.service} • {a.severity}</Text>
        </View>
      ))}
    </ScrollView>
  );
};
