import { useState } from 'react';
import { Calendar, Clock, MapPin, Stethoscope, User, LogOut, Plus, X, Check, Edit2, AlertCircle } from 'lucide-react';
import { format, addDays, parseISO, isBefore, startOfDay } from 'date-fns';
import { es } from 'date-fns/locale';

interface Location {
  id: string;
  name: string;
  address: string;
  city: string;
}

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  locationId: string;
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

interface PatientViewProps {
  user: any;
  onLogout: () => void;
  appointments: Appointment[];
  onCreateAppointment: (appointment: Omit<Appointment, 'id' | 'status'>) => void;
  onCancelAppointment: (id: string) => void;
  onRescheduleAppointment: (id: string, newDate: string, newTime: string) => void;
}

const locations: Location[] = [
  { id: '1', name: 'Centro Médico Norte', address: 'Av. Principal 123', city: 'Centro' },
  { id: '2', name: 'Consultorio Sur', address: 'Calle 45 #67-89', city: 'Sur' },
  { id: '3', name: 'Clínica Este', address: 'Carrera 12 #34-56', city: 'Este' },
];

const doctors: Doctor[] = [
  { id: '1', name: 'Dra. María González', specialty: 'Medicina General', locationId: '1' },
  { id: '2', name: 'Dr. Carlos Ruiz', specialty: 'Pediatría', locationId: '1' },
  { id: '3', name: 'Dra. Ana Martínez', specialty: 'Cardiología', locationId: '2' },
  { id: '4', name: 'Dr. Luis Fernández', specialty: 'Dermatología', locationId: '2' },
  { id: '5', name: 'Dra. Sofia Torres', specialty: 'Ginecología', locationId: '3' },
  { id: '6', name: 'Dr. Miguel Ángel Castro', specialty: 'Traumatología', locationId: '3' },
];

const timeSlots = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '12:00', '12:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30'
];

export default function PatientView({
  user,
  onLogout,
  appointments,
  onCreateAppointment,
  onCancelAppointment,
  onRescheduleAppointment,
}: PatientViewProps) {
  const [view, setView] = useState<'appointments' | 'new'>('appointments');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [reason, setReason] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [rescheduleData, setRescheduleData] = useState<{
    appointmentId: string;
    newDate: string;
    newTime: string;
  } | null>(null);

  const myAppointments = appointments.filter(apt => apt.patientId === user.id);
  const upcomingAppointments = myAppointments.filter(
    apt => apt.status === 'scheduled' && !isBefore(parseISO(apt.date), startOfDay(new Date()))
  );
  const pastAppointments = myAppointments.filter(
    apt => apt.status === 'completed' || isBefore(parseISO(apt.date), startOfDay(new Date()))
  );

  const availableDoctors = selectedLocation
    ? doctors.filter(doc => doc.locationId === selectedLocation)
    : [];

  const getOccupiedSlots = (date: string, doctorId: string) => {
    return appointments
      .filter(apt => apt.date === date && apt.doctorId === doctorId && apt.status === 'scheduled')
      .map(apt => apt.time);
  };

  const occupiedSlots = selectedDate && selectedDoctor
    ? getOccupiedSlots(selectedDate, selectedDoctor)
    : [];

  const handleCreateAppointment = () => {
    if (!selectedLocation || !selectedDoctor || !selectedDate || !selectedTime || !reason) {
      alert('Por favor completa todos los campos');
      return;
    }

    onCreateAppointment({
      patientId: user.id,
      doctorId: selectedDoctor,
      locationId: selectedLocation,
      date: selectedDate,
      time: selectedTime,
      reason,
    });

    setShowConfirmation(true);
    setTimeout(() => {
      setShowConfirmation(false);
      setView('appointments');
      setSelectedLocation('');
      setSelectedDoctor('');
      setSelectedDate('');
      setSelectedTime('');
      setReason('');
    }, 2000);
  };

  const handleReschedule = (appointmentId: string) => {
    const appointment = appointments.find(apt => apt.id === appointmentId);
    if (!appointment) return;

    setRescheduleData({
      appointmentId,
      newDate: appointment.date,
      newTime: appointment.time,
    });
  };

  const confirmReschedule = () => {
    if (!rescheduleData) return;

    onRescheduleAppointment(
      rescheduleData.appointmentId,
      rescheduleData.newDate,
      rescheduleData.newTime
    );

    setRescheduleData(null);
  };

  const getLocationName = (locationId: string) => {
    return locations.find(loc => loc.id === locationId)?.name || 'Desconocida';
  };

  const getDoctorInfo = (doctorId: string) => {
    return doctors.find(doc => doc.id === doctorId);
  };

  const minDate = format(new Date(), 'yyyy-MM-dd');
  const maxDate = format(addDays(new Date(), 60), 'yyyy-MM-dd');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-2 rounded-lg">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Portal del Paciente</h1>
                <p className="text-sm text-gray-600">Bienvenido, {user.name}</p>
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

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* View Toggle */}
        <div className="flex gap-3 mb-6">
          <button
            onClick={() => setView('appointments')}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
              view === 'appointments'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            Mis Citas
          </button>
          <button
            onClick={() => setView('new')}
            className={`flex-1 py-3 px-4 rounded-lg font-medium flex items-center justify-center gap-2 transition-all ${
              view === 'new'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Plus className="w-5 h-5" />
            Nueva Cita
          </button>
        </div>

        {/* My Appointments View */}
        {view === 'appointments' && (
          <div className="space-y-6">
            {/* Upcoming Appointments */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
                <h2 className="text-lg font-semibold text-white">Citas Programadas</h2>
              </div>
              <div className="p-6">
                {upcomingAppointments.length === 0 ? (
                  <div className="text-center py-12">
                    <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600">No tienes citas programadas</p>
                    <button
                      onClick={() => setView('new')}
                      className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Agendar nueva cita
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {upcomingAppointments.map(apt => {
                      const doctor = getDoctorInfo(apt.doctorId);
                      const location = locations.find(loc => loc.id === apt.locationId);
                      const appointmentDate = parseISO(apt.date);

                      return (
                        <div
                          key={apt.id}
                          className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-3">
                                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                                  {format(appointmentDate, "EEEE, d 'de' MMMM yyyy", { locale: es })}
                                </span>
                                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                                  {apt.time}
                                </span>
                              </div>
                              <div className="space-y-2">
                                <div className="flex items-center gap-2 text-gray-700">
                                  <Stethoscope className="w-4 h-4 text-gray-400" />
                                  <span className="font-medium">{doctor?.name}</span>
                                  <span className="text-gray-500">•</span>
                                  <span className="text-gray-600">{doctor?.specialty}</span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-600">
                                  <MapPin className="w-4 h-4 text-gray-400" />
                                  {location?.name} - {location?.address}
                                </div>
                                <div className="flex items-center gap-2 text-gray-600">
                                  <User className="w-4 h-4 text-gray-400" />
                                  {apt.reason}
                                </div>
                              </div>
                            </div>
                            <div className="flex flex-col gap-2">
                              <button
                                onClick={() => handleReschedule(apt.id)}
                                className="px-4 py-2 text-sm bg-amber-100 text-amber-700 rounded-lg hover:bg-amber-200 transition-colors flex items-center gap-2"
                              >
                                <Edit2 className="w-4 h-4" />
                                Reagendar
                              </button>
                              <button
                                onClick={() => onCancelAppointment(apt.id)}
                                className="px-4 py-2 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors flex items-center gap-2"
                              >
                                <X className="w-4 h-4" />
                                Cancelar
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Past Appointments */}
            {pastAppointments.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="bg-gray-100 px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">Historial de Citas</h2>
                </div>
                <div className="p-6">
                  <div className="space-y-3">
                    {pastAppointments.slice(0, 5).map(apt => {
                      const doctor = getDoctorInfo(apt.doctorId);
                      const appointmentDate = parseISO(apt.date);

                      return (
                        <div key={apt.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                          <div>
                            <div className="font-medium text-gray-900">{doctor?.name}</div>
                            <div className="text-sm text-gray-600">
                              {format(appointmentDate, "d 'de' MMM yyyy", { locale: es })} • {apt.time}
                            </div>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            apt.status === 'completed'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-gray-100 text-gray-700'
                          }`}>
                            {apt.status === 'completed' ? 'Completada' : 'Cancelada'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* New Appointment View */}
        {view === 'new' && (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
              <h2 className="text-lg font-semibold text-white">Agendar Nueva Cita</h2>
            </div>
            <div className="p-6">
              <div className="space-y-6">
                {/* Step 1: Location */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-3">
                    1. Selecciona la sede
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {locations.map(location => (
                      <button
                        key={location.id}
                        onClick={() => {
                          setSelectedLocation(location.id);
                          setSelectedDoctor('');
                        }}
                        className={`p-4 rounded-lg border-2 text-left transition-all ${
                          selectedLocation === location.id
                            ? 'border-blue-600 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <MapPin className={`w-5 h-5 mt-0.5 ${
                            selectedLocation === location.id ? 'text-blue-600' : 'text-gray-400'
                          }`} />
                          <div>
                            <div className="font-medium text-gray-900">{location.name}</div>
                            <div className="text-sm text-gray-600">{location.address}</div>
                            <div className="text-sm text-gray-500">{location.city}</div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Step 2: Doctor */}
                {selectedLocation && (
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-3">
                      2. Selecciona el médico
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {availableDoctors.map(doctor => (
                        <button
                          key={doctor.id}
                          onClick={() => setSelectedDoctor(doctor.id)}
                          className={`p-4 rounded-lg border-2 text-left transition-all ${
                            selectedDoctor === doctor.id
                              ? 'border-blue-600 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`p-2 rounded-lg ${
                              selectedDoctor === doctor.id ? 'bg-blue-100' : 'bg-gray-100'
                            }`}>
                              <Stethoscope className={`w-5 h-5 ${
                                selectedDoctor === doctor.id ? 'text-blue-600' : 'text-gray-400'
                              }`} />
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">{doctor.name}</div>
                              <div className="text-sm text-gray-600">{doctor.specialty}</div>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Step 3: Date & Time */}
                {selectedDoctor && (
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-3">
                      3. Selecciona fecha y hora
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-gray-700 mb-2">Fecha</label>
                        <input
                          type="date"
                          value={selectedDate}
                          onChange={(e) => setSelectedDate(e.target.value)}
                          min={minDate}
                          max={maxDate}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-700 mb-2">Hora disponible</label>
                        <select
                          value={selectedTime}
                          onChange={(e) => setSelectedTime(e.target.value)}
                          disabled={!selectedDate}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                        >
                          <option value="">Seleccionar hora</option>
                          {timeSlots.map(time => (
                            <option
                              key={time}
                              value={time}
                              disabled={occupiedSlots.includes(time)}
                            >
                              {time} {occupiedSlots.includes(time) ? '(Ocupado)' : ''}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 4: Reason */}
                {selectedTime && (
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-3">
                      4. Motivo de la consulta
                    </label>
                    <textarea
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Describe el motivo de tu consulta"
                    />
                  </div>
                )}

                {/* Submit Button */}
                {reason && (
                  <div className="flex gap-3 pt-4 border-t border-gray-200">
                    <button
                      onClick={() => setView('appointments')}
                      className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleCreateAppointment}
                      className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg"
                    >
                      Confirmar Cita
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">¡Cita Confirmada!</h3>
            <p className="text-gray-600">Tu cita médica ha sido agendada exitosamente</p>
          </div>
        </div>
      )}

      {/* Reschedule Modal */}
      {rescheduleData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-amber-100 p-2 rounded-lg">
                <Edit2 className="w-6 h-6 text-amber-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Reagendar Cita</h3>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nueva Fecha</label>
                <input
                  type="date"
                  value={rescheduleData.newDate}
                  onChange={(e) => setRescheduleData({ ...rescheduleData, newDate: e.target.value })}
                  min={minDate}
                  max={maxDate}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nueva Hora</label>
                <select
                  value={rescheduleData.newTime}
                  onChange={(e) => setRescheduleData({ ...rescheduleData, newTime: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {timeSlots.map(time => (
                    <option key={time} value={time}>
                      {time}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setRescheduleData(null)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={confirmReschedule}
                className="flex-1 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
