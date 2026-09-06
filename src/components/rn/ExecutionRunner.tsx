import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useRunbookStore } from '../../store/useRunbookStore';

export const ExecutionRunner = () => {
  const { activeSessions, completedSessions, selectedSessionId, completeExecutionSession } = useRunbookStore();
  const session = [...activeSessions, ...completedSessions].find(s => s.id === selectedSessionId) || activeSessions[0] || completedSessions[0];

  if (!session) return <View style={{ flex: 1, backgroundColor: '#0f172a', justifyContent: 'center', alignItems: 'center' }}><Text style={{ color: '#fff', fontSize: 16 }}>No Active Sessions</Text></View>;

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#0f172a', padding: 16 }}>
      <View style={{ backgroundColor: '#1e293b', borderRadius: 12, padding: 16, marginBottom: 16 }}>
        <Text style={{ color: '#f87171', fontWeight: 'bold', fontSize: 12 }}>SEV-{session.severity}</Text>
        <Text style={{ color: '#fff', fontSize: 18, fontWeight: 'bold', marginTop: 4 }}>{session.playbookTitle}</Text>
        {session.status === 'active' && (
          <TouchableOpacity onPress={() => completeExecutionSession(session.id, 'Resolved', 'Manual resolution')} style={{ backgroundColor: '#10b981', padding: 10, borderRadius: 8, marginTop: 12, alignItems: 'center' }}>
            <Text style={{ color: '#fff', fontWeight: 'bold' }}>Resolve Incident</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
};
