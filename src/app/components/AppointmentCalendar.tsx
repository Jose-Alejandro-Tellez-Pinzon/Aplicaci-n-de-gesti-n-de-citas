import { useState } from 'react';
import { Calendar, Clock, User, Stethoscope, Plus, X, Check } from 'lucide-react';
import { format, addDays, startOfWeek, isSameDay, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  color: string;
}

interface Patient {
  id: string;
  name: string;
  phone: string;
  email: string;
}

interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  date: string;
  time: string;
  reason: string;
  status: 'scheduled' | 'completed' | 'cancelled';
}

const initialDoctors: Doctor[] = [
  { id: '1', name: 'Dra. María González', specialty: 'Medicina General', color: 'bg-blue-500' },
  { id: '2', name: 'Dr. Carlos Ruiz', specialty: 'Pediatría', color: 'bg-green-500' },
  { id: '3', name: 'Dra. Ana Martínez', specialty: 'Cardiología', color: 'bg-purple-500' },
  { id: '4', name: 'Dr. Luis Fernández', specialty: 'Dermatología', color: 'bg-orange-500' },
];

const initialPatients: Patient[] = [
  { id: '1', name: 'Juan Pérez', phone: '555-0101', email: 'juan@email.com' },
  { id: '2', name: 'Carmen López', phone: '555-0102', email: 'carmen@email.com' },
  { id: '3', name: 'Roberto Silva', phone: '555-0103', email: 'roberto@email.com' },
  { id: '4', name: 'María Torres', phone: '555-0104', email: 'maria@email.com' },
  { id: '5', name: 'Pedro Gómez', phone: '555-0105', email: 'pedro@email.com' },
];

const timeSlots = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
  '16:00', '16:30', '17:00', '17:30', '18:00'
];

export default function AppointmentCalendar({ isAdminView = false }: { isAdminView?: boolean }) {
  const [appointments, setAppointments] = useState<Appointment[]>([
    {
      id: '1',
      patientId: '1',
      doctorId: '1',
      date: format(new Date(), 'yyyy-MM-dd'),
      time: '09:00',
      reason: 'Consulta general',
      status: 'scheduled'
    },
    {
      id: '2',
      patientId: '2',
      doctorId: '2',
      date: format(new Date(), 'yyyy-MM-dd'),
      time: '10:00',
      reason: 'Control pediátrico',
      status: 'scheduled'
    },
    {
      id: '3',
      patientId: '3',
      doctorId: '3',
      date: format(addDays(new Date(), 1), 'yyyy-MM-dd'),
      time: '11:00',
      reason: 'Revisión cardiológica',
      status: 'scheduled'
    },
  ]);

  const [doctors] = useState<Doctor[]>(initialDoctors);
  const [patients] = useState<Patient[]>(initialPatients);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showNewAppointment, setShowNewAppointment] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<string>('');
  const [view, setView] = useState<'calendar' | 'list'>('calendar');

  const [newAppointment, setNewAppointment] = useState({
    patientId: '',
    doctorId: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    time: '09:00',
    reason: '',
  });

  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(startOfWeek(selectedDate, { weekStartsOn: 1 }), i));

  const getAppointmentsForDay = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return appointments.filter(apt => apt.date === dateStr);
  };

  const getAppointmentForSlot = (date: Date, time: string, doctorId: string) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return appointments.find(apt =>
      apt.date === dateStr &&
      apt.time === time &&
      apt.doctorId === doctorId &&
      apt.status === 'scheduled'
    );
  };

  const handleCreateAppointment = () => {
    if (!newAppointment.patientId || !newAppointment.doctorId || !newAppointment.reason) {
      alert('Por favor completa todos los campos');
      return;
    }

    const exists = appointments.find(apt =>
      apt.date === newAppointment.date &&
      apt.time === newAppointment.time &&
      apt.doctorId === newAppointment.doctorId &&
      apt.status === 'scheduled'
    );

    if (exists) {
      alert('Ya existe una cita en este horario');
      return;
    }

    const appointment: Appointment = {
      id: Date.now().toString(),
      ...newAppointment,
      status: 'scheduled'
    };

    setAppointments([...appointments, appointment]);
    setShowNewAppointment(false);
    setNewAppointment({
      patientId: '',
      doctorId: '',
      date: format(new Date(), 'yyyy-MM-dd'),
      time: '09:00',
      reason: '',
    });
  };

  const handleCancelAppointment = (id: string) => {
    setAppointments(appointments.map(apt =>
      apt.id === id ? { ...apt, status: 'cancelled' as const } : apt
    ));
  };

  const handleCompleteAppointment = (id: string) => {
    setAppointments(appointments.map(apt =>
      apt.id === id ? { ...apt, status: 'completed' as const } : apt
    ));
  };

  const getPatientName = (patientId: string) => {
    return patients.find(p => p.id === patientId)?.name || 'Desconocido';
  };

  const getDoctorInfo = (doctorId: string) => {
    return doctors.find(d => d.id === doctorId);
  };

  return (
    <div className={isAdminView ? '' : 'min-h-screen bg-gray-50 p-6'}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        {!isAdminView && (
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-3 rounded-lg">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">Sistema de Citas Médicas</h1>
                <p className="text-gray-600">Gestiona las citas de tu consultorio</p>
              </div>
            </div>
            <button
              onClick={() => setShowNewAppointment(true)}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Nueva Cita
            </button>
          </div>

          {/* View Toggle */}
          <div className="flex gap-2 border-b border-gray-200">
            <button
              onClick={() => setView('calendar')}
              className={`px-4 py-2 border-b-2 transition-colors ${
                view === 'calendar'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Vista Calendario
            </button>
            <button
              onClick={() => setView('list')}
              className={`px-4 py-2 border-b-2 transition-colors ${
                view === 'list'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Lista de Citas
            </button>
          </div>
        </div>
        )}

        {/* Calendar View */}
        {view === 'calendar' && (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            {/* Week Navigation */}
            <div className="bg-gray-50 p-4 border-b border-gray-200 flex items-center justify-between">
              <button
                onClick={() => setSelectedDate(addDays(selectedDate, -7))}
                className="px-3 py-1 text-gray-600 hover:bg-gray-200 rounded"
              >
                ← Anterior
              </button>
              <div className="text-lg font-medium text-gray-900">
                {format(weekDays[0], 'd MMM', { locale: es })} - {format(weekDays[6], 'd MMM yyyy', { locale: es })}
              </div>
              <button
                onClick={() => setSelectedDate(addDays(selectedDate, 7))}
                className="px-3 py-1 text-gray-600 hover:bg-gray-200 rounded"
              >
                Siguiente →
              </button>
            </div>

            {/* Doctor Filter */}
            <div className="p-4 border-b border-gray-200 bg-white">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm text-gray-600">Filtrar por doctor:</span>
                <button
                  onClick={() => setSelectedDoctor('')}
                  className={`px-3 py-1 rounded-full text-sm ${
                    selectedDoctor === ''
                      ? 'bg-gray-900 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Todos
                </button>
                {doctors.map(doctor => (
                  <button
                    key={doctor.id}
                    onClick={() => setSelectedDoctor(doctor.id)}
                    className={`px-3 py-1 rounded-full text-sm flex items-center gap-2 ${
                      selectedDoctor === doctor.id
                        ? 'bg-gray-900 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    <div className={`w-2 h-2 rounded-full ${doctor.color}`} />
                    {doctor.name}
                  </button>
                ))}
              </div>
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
                        isSameDay(day, new Date()) ? 'bg-blue-50' : ''
                      }`}
                    >
                      <div className="text-sm font-medium text-gray-900">
                        {format(day, 'EEE', { locale: es })}
                      </div>
                      <div className={`text-lg ${
                        isSameDay(day, new Date()) ? 'text-blue-600 font-semibold' : 'text-gray-600'
                      }`}>
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
                      {weekDays.map((day, idx) => (
                        <div key={idx} className="border-l border-gray-200 p-1 min-h-[60px]">
                          <div className="space-y-1">
                            {(selectedDoctor ? [doctors.find(d => d.id === selectedDoctor)!] : doctors)
                              .filter(Boolean)
                              .map(doctor => {
                                const apt = getAppointmentForSlot(day, time, doctor.id);
                                if (!apt) return null;

                                const patient = patients.find(p => p.id === apt.patientId);

                                return (
                                  <div
                                    key={apt.id}
                                    className={`${doctor.color} bg-opacity-20 border-l-2 border-current p-1.5 rounded text-xs cursor-pointer hover:bg-opacity-30 transition-all`}
                                    title={`${patient?.name} - ${apt.reason}`}
                                  >
                                    <div className="font-medium truncate">{patient?.name}</div>
                                    <div className="text-gray-600 truncate">{apt.reason}</div>
                                  </div>
                                );
                              })}
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* List View */}
        {view === 'list' && (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Todas las Citas</h2>
            </div>
            <div className="divide-y divide-gray-200">
              {appointments
                .filter(apt => apt.status === 'scheduled')
                .sort((a, b) => {
                  const dateA = new Date(`${a.date}T${a.time}`);
                  const dateB = new Date(`${b.date}T${b.time}`);
                  return dateA.getTime() - dateB.getTime();
                })
                .map(apt => {
                  const patient = patients.find(p => p.id === apt.patientId);
                  const doctor = getDoctorInfo(apt.doctorId);
                  const appointmentDate = parseISO(apt.date);

                  return (
                    <div key={apt.id} className="p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <div className={`w-3 h-3 rounded-full ${doctor?.color}`} />
                            <h3 className="font-semibold text-gray-900">{patient?.name}</h3>
                            <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                              {format(appointmentDate, 'dd MMM yyyy', { locale: es })}
                            </span>
                          </div>
                          <div className="space-y-1 text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4" />
                              {apt.time}
                            </div>
                            <div className="flex items-center gap-2">
                              <Stethoscope className="w-4 h-4" />
                              {doctor?.name} - {doctor?.specialty}
                            </div>
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4" />
                              {apt.reason}
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleCompleteAppointment(apt.id)}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="Marcar como completada"
                          >
                            <Check className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleCancelAppointment(apt.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Cancelar cita"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="text-sm text-gray-600 mb-1">Citas Hoy</div>
            <div className="text-2xl font-semibold text-gray-900">
              {appointments.filter(apt =>
                apt.date === format(new Date(), 'yyyy-MM-dd') &&
                apt.status === 'scheduled'
              ).length}
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="text-sm text-gray-600 mb-1">Pendientes</div>
            <div className="text-2xl font-semibold text-blue-600">
              {appointments.filter(apt => apt.status === 'scheduled').length}
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="text-sm text-gray-600 mb-1">Completadas</div>
            <div className="text-2xl font-semibold text-green-600">
              {appointments.filter(apt => apt.status === 'completed').length}
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="text-sm text-gray-600 mb-1">Canceladas</div>
            <div className="text-2xl font-semibold text-red-600">
              {appointments.filter(apt => apt.status === 'cancelled').length}
            </div>
          </div>
        </div>
      </div>

      {/* New Appointment Modal */}
      {showNewAppointment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Nueva Cita</h2>
              <button
                onClick={() => setShowNewAppointment(false)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Paciente
                </label>
                <select
                  value={newAppointment.patientId}
                  onChange={(e) => setNewAppointment({ ...newAppointment, patientId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Seleccionar paciente</option>
                  {patients.map(patient => (
                    <option key={patient.id} value={patient.id}>
                      {patient.name} - {patient.phone}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Doctor
                </label>
                <select
                  value={newAppointment.doctorId}
                  onChange={(e) => setNewAppointment({ ...newAppointment, doctorId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Seleccionar doctor</option>
                  {doctors.map(doctor => (
                    <option key={doctor.id} value={doctor.id}>
                      {doctor.name} - {doctor.specialty}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fecha
                  </label>
                  <input
                    type="date"
                    value={newAppointment.date}
                    onChange={(e) => setNewAppointment({ ...newAppointment, date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Hora
                  </label>
                  <select
                    value={newAppointment.time}
                    onChange={(e) => setNewAppointment({ ...newAppointment, time: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {timeSlots.map(time => (
                      <option key={time} value={time}>{time}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Motivo de consulta
                </label>
                <textarea
                  value={newAppointment.reason}
                  onChange={(e) => setNewAppointment({ ...newAppointment, reason: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Describe el motivo de la consulta"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowNewAppointment(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreateAppointment}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Crear Cita
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
