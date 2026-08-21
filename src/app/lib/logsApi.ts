import { supabase } from './supabase';

export interface LogEntry {
  id: string;
  event: string;
  message: string;
  user: string;
  createdAt: string;
}

function dbToLogEntry(row: any): LogEntry {
  return {
    id: row.id,
    event: row.event,
    message: row.message,
    user: row.user_name || 'System',
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
 * Records an event in a declaration's log. `user` should be whoever/whatever
 * actually caused this — a person's name (from Managed By), 'System' for
 * automatic checks, 'Tolletaten' for a (currently simulated) customs
 * response, or an external system's name (e.g. a future TMS integration
 * that creates declarations automatically). Fire-and-forget by design at
 * the call sites (a logging failure shouldn't block the actual user
 * action) — callers typically do `addLog(...).catch(console.error)`.
 */
export async function addLog(declarationId: string, event: string, message: string, user: string = 'System'): Promise<void> {
  const { error } = await supabase
    .from('declaration_logs')
    .insert({ declaration_id: declarationId, event, message, user_name: user });
  if (error) throw error;
}