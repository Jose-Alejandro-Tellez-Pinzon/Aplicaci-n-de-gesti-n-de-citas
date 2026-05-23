import { useState } from 'react';
import { Calendar, Clock, User, LogOut, Phone, Mail, CheckCircle, XCircle } from 'lucide-react';
import { format, addDays, startOfWeek, isSameDay, parseISO, startOfDay, isBefore } from 'date-fns';
import { es } from 'date-fns/locale';

interface Patient {
  id: string;
  name: string;
  email: string;
  phone: string;
}

interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  locationId: string;
  date: string;
  time: string;
  reason: string;
  status: 'scheduled' | 'completed' | 'cancelled';
}

interface DoctorViewProps {
  user: any;
  onLogout: () => void;
  appointments: Appointment[];
  patients: Patient[];
  onCompleteAppointment: (id: string) => void;
}

const timeSlots = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '12:00', '12:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30'
];

const locations = [
  { id: '1', name: 'Centro Médico Norte' },
  { id: '2', name: 'Consultorio Sur' },
  { id: '3', name: 'Clínica Este' },
];

export default function DoctorView({
  user,
  onLogout,
  appointments,
  patients,
  onCompleteAppointment,
}: DoctorViewProps) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [view, setView] = useState<'calendar' | 'list'>('calendar');
  const [selectedAppointment, setSelectedAppointment] = useState<string | null>(null);

  const weekDays = Array.from({ length: 7 }, (_, i) =>
    addDays(startOfWeek(selectedDate, { weekStartsOn: 1 }), i)
  );

  const myAppointments = appointments.filter(apt => apt.doctorId === user.id);
  const todayAppointments = myAppointments.filter(
    apt => apt.date === format(new Date(), 'yyyy-MM-dd') && apt.status === 'scheduled'
  );
  const upcomingAppointments = myAppointments.filter(
    apt => apt.status === 'scheduled' && !isBefore(parseISO(apt.date), startOfDay(new Date()))
  );

  const getAppointmentForSlot = (date: Date, time: string) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return myAppointments.find(
      apt => apt.date === dateStr && apt.time === time && apt.status === 'scheduled'
    );
  };

  const getPatientInfo = (patientId: string) => {
    return patients.find(p => p.id === patientId);
  };

  const getLocationName = (locationId: string) => {
    return locations.find(loc => loc.id === locationId)?.name || 'Desconocida';
  };

  const appointmentDetails = selectedAppointment
    ? myAppointments.find(apt => apt.id === selectedAppointment)
    : null;
  const selectedPatient = appointmentDetails
    ? getPatientInfo(appointmentDetails.patientId)
    : null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-green-100 p-2 rounded-lg">
                <Calendar className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Portal del Médico</h1>
                <p className="text-sm text-gray-600">
                  {user.name} • {user.specialty}
                </p>
              </div>
            </div>
            <button
              onClick={onLogout}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Cerrar Sesión
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-3 rounded-lg">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <div className="text-sm text-gray-600">Citas Hoy</div>
                <div className="text-2xl font-semibold text-gray-900">
                  {todayAppointments.length}
                </div>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="bg-green-100 p-3 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <div className="text-sm text-gray-600">Próximas</div>
                <div className="text-2xl font-semibold text-gray-900">
                  {upcomingAppointments.length}
                </div>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="bg-purple-100 p-3 rounded-lg">
                <User className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <div className="text-sm text-gray-600">Total Pacientes</div>
                <div className="text-2xl font-semibold text-gray-900">
                  {new Set(myAppointments.map(apt => apt.patientId)).size}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* View Toggle */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="flex gap-2 p-2 border-b border-gray-200">
            <button
              onClick={() => setView('calendar')}
              className={`px-4 py-2 rounded-md transition-colors ${
                view === 'calendar'
                  ? 'bg-green-100 text-green-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Vista Calendario
            </button>
            <button
              onClick={() => setView('list')}
              className={`px-4 py-2 rounded-md transition-colors ${
                view === 'list'
                  ? 'bg-green-100 text-green-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Lista de Citas
            </button>
          </div>

          {/* Calendar View */}
          {view === 'calendar' && (
            <div>
              {/* Week Navigation */}
              <div className="bg-gray-50 p-4 border-b border-gray-200 flex items-center justify-between">
                <button
                  onClick={() => setSelectedDate(addDays(selectedDate, -7))}
                  className="px-3 py-1 text-gray-600 hover:bg-gray-200 rounded"
                >
                  ← Anterior
                </button>
                <div className="text-lg font-medium text-gray-900">
                  {format(weekDays[0], 'd MMM', { locale: es })} -{' '}
                  {format(weekDays[6], 'd MMM yyyy', { locale: es })}
                </div>
                <button
                  onClick={() => setSelectedDate(addDays(selectedDate, 7))}
                  className="px-3 py-1 text-gray-600 hover:bg-gray-200 rounded"
                >
                  Siguiente →
                </button>
              </div>

              {/* Calendar Grid */}
              <div className="overflow-x-auto">
                <div className="min-w-[900px]">
                  {/* Day Headers */}
                  <div className="grid grid-cols-8 border-b border-gray-200 bg-gray-50">
                    <div className="p-3 text-sm font-medium text-gray-600">Hora</div>
                    {weekDays.map((day, idx) => (
                      <div
                        key={idx}
                        className={`p-3 text-center border-l border-gray-200 ${
                          isSameDay(day, new Date()) ? 'bg-green-50' : ''
                        }`}
                      >
                        <div className="text-sm font-medium text-gray-900">
                          {format(day, 'EEE', { locale: es })}
                        </div>
                        <div
                          className={`text-lg ${
                            isSameDay(day, new Date())
                              ? 'text-green-600 font-semibold'
                              : 'text-gray-600'
                          }`}
                        >
                          {format(day, 'd')}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Time Slots */}
                  <div className="divide-y divide-gray-200">
                    {timeSlots.map(time => (
                      <div key={time} className="grid grid-cols-8 hover:bg-gray-50">
                        <div className="p-3 text-sm text-gray-600 font-medium border-r border-gray-200">
                          {time}
                        </div>
                        {weekDays.map((day, idx) => {
                          const apt = getAppointmentForSlot(day, time);
                          const patient = apt ? getPatientInfo(apt.patientId) : null;

                          return (
                            <div
                              key={idx}
                              className="border-l border-gray-200 p-2 min-h-[60px]"
                            >
                              {apt && patient && (
                                <button
                                  onClick={() => setSelectedAppointment(apt.id)}
                                  className="w-full bg-green-100 border-l-2 border-green-600 p-2 rounded text-left hover:bg-green-200 transition-colors"
                                >
                                  <div className="font-medium text-sm text-gray-900 truncate">
                                    {patient.name}
                                  </div>
                                  <div className="text-xs text-gray-600 truncate">
                                    {apt.reason}
                                  </div>
                                </button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* List View */}
          {view === 'list' && (
            <div className="p-6">
              {upcomingAppointments.length === 0 ? (
                <div className="text-center py-12">
                  <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600">No tienes citas programadas</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {upcomingAppointments
                    .sort((a, b) => {
                      const dateA = new Date(`${a.date}T${a.time}`);
                      const dateB = new Date(`${b.date}T${b.time}`);
                      return dateA.getTime() - dateB.getTime();
                    })
                    .map(apt => {
                      const patient = getPatientInfo(apt.patientId);
                      const appointmentDate = parseISO(apt.date);

                      return (
                        <div
                          key={apt.id}
                          className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-3">
                                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                                  {format(appointmentDate, "EEE, d 'de' MMM", { locale: es })}
                                </span>
                                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                                  {apt.time}
                                </span>
                              </div>
                              <div className="space-y-2">
                                <div className="flex items-center gap-2 text-gray-900">
                                  <User className="w-4 h-4 text-gray-400" />
                                  <span className="font-medium">{patient?.name}</span>
                                </div>
                                <div className="text-sm text-gray-600">
                                  Motivo: {apt.reason}
                                </div>
                                <div className="text-sm text-gray-600">
                                  Sede: {getLocationName(apt.locationId)}
                                </div>
                              </div>
                            </div>
                            <button
                              onClick={() => onCompleteAppointment(apt.id)}
                              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                            >
                              <CheckCircle className="w-4 h-4" />
                              Completar
                            </button>
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Appointment Detail Modal */}
      {selectedAppointment && appointmentDetails && selectedPatient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Detalle de la Cita</h3>
              <button
                onClick={() => setSelectedAppointment(null)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <XCircle className="w-6 h-6 text-gray-600" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <div className="bg-blue-100 p-3 rounded-full">
                  <User className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <div className="text-sm text-gray-600">Paciente</div>
                  <div className="font-semibold text-gray-900">{selectedPatient.name}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-600 mb-1">Fecha</div>
                  <div className="font-medium text-gray-900">
                    {format(parseISO(appointmentDetails.date), "d 'de' MMMM yyyy", {
                      locale: es,
                    })}
                  </div>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-600 mb-1">Hora</div>
                  <div className="font-medium text-gray-900">{appointmentDetails.time}</div>
                </div>
              </div>

              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-600 mb-1">Sede</div>
                <div className="font-medium text-gray-900">
                  {getLocationName(appointmentDetails.locationId)}
                </div>
              </div>

              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-600 mb-1">Motivo de consulta</div>
                <div className="font-medium text-gray-900">{appointmentDetails.reason}</div>
              </div>

              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-600 mb-2">Información de contacto</div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-900">{selectedPatient.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-900">{selectedPatient.email}</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => setSelectedAppointment(null)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cerrar
                </button>
                <button
                  onClick={() => {
                    onCompleteAppointment(appointmentDetails.id);
                    setSelectedAppointment(null);
                  }}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  Marcar como Completada
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
