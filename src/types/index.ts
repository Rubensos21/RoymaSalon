export type Status = 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';

export interface Appointment {
  id: string;
  client_name: string;
  client_phone: string;
  appointment_date: string;
  service: string;
  status?: Status;
  created_at?: string;
  event_quote_id?: string | null;
}

export interface AppointmentCardProps {
  apt: Appointment;
  status: Status;
  isNew: boolean;
  onSetStatus: (id: string, status: Status) => void;
  onReschedule: (id: string, date: string, time: string) => void;
  onDelete: (id: string) => void;
}
