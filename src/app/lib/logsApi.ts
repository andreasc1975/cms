import { supabase } from './supabase';

export interface LogEntry {
  id: string;
  event: string;
  message: string;
  createdAt: string;
}

function dbToLogEntry(row: any): LogEntry {
  return {
    id: row.id,
    event: row.event,
    message: row.message,
    createdAt: row.created_at
  };
}

export async function fetchLogs(declarationId: string): Promise<LogEntry[]> {
  const { data, error } = await supabase
    .from('declaration_logs')
    .select('*')
    .eq('declaration_id', declarationId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []).map(dbToLogEntry);
}

/**
 * Records an event in a declaration's log. Fire-and-forget by design at the
 * call sites (a logging failure shouldn't block the actual user action) —
 * callers typically do `addLog(...).catch(console.error)`.
 */
export async function addLog(declarationId: string, event: string, message: string): Promise<void> {
  const { error } = await supabase
    .from('declaration_logs')
    .insert({ declaration_id: declarationId, event, message });
  if (error) throw error;
}