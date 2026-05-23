import { useState } from 'react';
import { Calendar, Users, MapPin, Stethoscope, LogOut, TrendingUp, BarChart3, Clock } from 'lucide-react';
import { format, parseISO, startOfDay, isBefore } from 'date-fns';
import { es } from 'date-fns/locale';
import AppointmentCalendar from './AppointmentCalendar';

interface Patient {
  id: string;
  name: string;
  email: string;
  phone: string;
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

interface AdminViewProps {
  user: any;
  onLogout: () => void;
  appointments: Appointment[];
  patients: Patient[];
  doctors: Doctor[];
}

const locations = [
  { id: '1', name: 'Centro Médico Norte', address: 'Av. Principal 123' },
  { id: '2', name: 'Consultorio Sur', address: 'Calle 45 #67-89' },
  { id: '3', name: 'Clínica Este', address: 'Carrera 12 #34-56' },
];

export default function AdminView({
  user,
  onLogout,
  appointments,
  patients,
  doctors,
}: AdminViewProps) {
  const [view, setView] = useState<'dashboard' | 'calendar' | 'patients' | 'doctors'>('dashboard');

  const today = format(new Date(), 'yyyy-MM-dd');
  const todayAppointments = appointments.filter(
    apt => apt.date === today && apt.status === 'scheduled'
  );
  const scheduledAppointments = appointments.filter(apt => apt.status === 'scheduled');
  const completedAppointments = appointments.filter(apt => apt.status === 'completed');
  const cancelledAppointments = appointments.filter(apt => apt.status === 'cancelled');

  const upcomingAppointments = appointments
    .filter(apt => apt.status === 'scheduled' && !isBefore(parseISO(apt.date), startOfDay(new Date())))
    .sort((a, b) => {
      const dateA = new Date(`${a.date}T${a.time}`);
      const dateB = new Date(`${b.date}T${b.time}`);
      return dateA.getTime() - dateB.getTime();
    })
    .slice(0, 10);

  const getPatientName = (patientId: string) => {
    return patients.find(p => p.id === patientId)?.name || 'Desconocido';
  };

  const getDoctorInfo = (doctorId: string) => {
    return doctors.find(d => d.id === doctorId);
  };

  const getLocationName = (locationId: string) => {
    return locations.find(loc => loc.id === locationId)?.name || 'Desconocida';
  };

  const appointmentsByLocation = locations.map(location => ({
    location: location.name,
    count: appointments.filter(apt => apt.locationId === location.id && apt.status === 'scheduled').length,
  }));

  const appointmentsByDoctor = doctors.map(doctor => ({
    doctor: doctor.name,
    count: appointments.filter(apt => apt.doctorId === doctor.id && apt.status === 'scheduled').length,
  }));

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white bg-opacity-20 p-2 rounded-lg">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-white">Panel Administrativo</h1>
                <p className="text-sm text-purple-100">Bienvenido, {user.name}</p>
              </div>
            </div>
            <button
              onClick={onLogout}
              className="flex items-center gap-2 px-4 py-2 bg-white bg-opacity-20 text-white hover:bg-opacity-30 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Cerrar Sesión
            </button>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex gap-1">
            <button
              onClick={() => setView('dashboard')}
              className={`px-4 py-3 border-b-2 transition-colors ${
                view === 'dashboard'
                  ? 'border-purple-600 text-purple-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setView('calendar')}
              className={`px-4 py-3 border-b-2 transition-colors ${
                view === 'calendar'
                  ? 'border-purple-600 text-purple-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Calendario
            </button>
            <button
              onClick={() => setView('patients')}
              className={`px-4 py-3 border-b-2 transition-colors ${
                view === 'patients'
                  ? 'border-purple-600 text-purple-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Pacientes
            </button>
            <button
              onClick={() => setView('doctors')}
              className={`px-4 py-3 border-b-2 transition-colors ${
                view === 'doctors'
                  ? 'border-purple-600 text-purple-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Médicos
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Dashboard View */}
        {view === 'dashboard' && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
                    <TrendingUp className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Programadas</div>
                    <div className="text-2xl font-semibold text-gray-900">
                      {scheduledAppointments.length}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="bg-purple-100 p-3 rounded-lg">
                    <Users className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Pacientes</div>
                    <div className="text-2xl font-semibold text-gray-900">{patients.length}</div>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="bg-orange-100 p-3 rounded-lg">
                    <Stethoscope className="w-6 h-6 text-orange-600" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Médicos</div>
                    <div className="text-2xl font-semibold text-gray-900">{doctors.length}</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Upcoming Appointments */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-4 border-b border-gray-200">
                  <h3 className="font-semibold text-gray-900">Próximas Citas</h3>
                </div>
                <div className="p-4">
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {upcomingAppointments.map(apt => {
                      const doctor = getDoctorInfo(apt.doctorId);
                      const appointmentDate = parseISO(apt.date);

                      return (
                        <div
                          key={apt.id}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                        >
                          <div className="flex-1">
                            <div className="font-medium text-gray-900">
                              {getPatientName(apt.patientId)}
                            </div>
                            <div className="text-sm text-gray-600">
                              {doctor?.name} • {format(appointmentDate, "d MMM", { locale: es })} •{' '}
                              {apt.time}
                            </div>
                          </div>
                          <div className="text-xs text-gray-500">
                            {getLocationName(apt.locationId)}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Stats by Location */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-4 border-b border-gray-200">
                  <h3 className="font-semibold text-gray-900">Citas por Sede</h3>
                </div>
                <div className="p-4">
                  <div className="space-y-4">
                    {appointmentsByLocation.map((item, idx) => {
                      const maxCount = Math.max(...appointmentsByLocation.map(i => i.count));
                      const percentage = maxCount > 0 ? (item.count / maxCount) * 100 : 0;

                      return (
                        <div key={idx}>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-700">
                              {item.location}
                            </span>
                            <span className="text-sm font-semibold text-gray-900">
                              {item.count}
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-purple-600 h-2 rounded-full transition-all"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Stats by Doctor */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 lg:col-span-2">
                <div className="p-4 border-b border-gray-200">
                  <h3 className="font-semibold text-gray-900">Citas por Médico</h3>
                </div>
                <div className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {appointmentsByDoctor.map((item, idx) => {
                      const maxCount = Math.max(...appointmentsByDoctor.map(i => i.count));
                      const percentage = maxCount > 0 ? (item.count / maxCount) * 100 : 0;

                      return (
                        <div key={idx}>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-700">
                              {item.doctor}
                            </span>
                            <span className="text-sm font-semibold text-gray-900">
                              {item.count}
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-green-600 h-2 rounded-full transition-all"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Summary Stats */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 lg:col-span-2">
                <div className="p-4 border-b border-gray-200">
                  <h3 className="font-semibold text-gray-900">Resumen de Citas</h3>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-3 gap-6">
                    <div className="text-center">
                      <div className="text-3xl font-semibold text-green-600">
                        {completedAppointments.length}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">Completadas</div>
                    </div>
                    <div className="text-center border-l border-r border-gray-200">
                      <div className="text-3xl font-semibold text-blue-600">
                        {scheduledAppointments.length}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">Programadas</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-semibold text-red-600">
                        {cancelledAppointments.length}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">Canceladas</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Calendar View */}
        {view === 'calendar' && (
          <div>
            <AppointmentCalendar isAdminView={true} />
          </div>
        )}

        {/* Patients View */}
        {view === 'patients' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-4 border-b border-gray-200">
              <h3 className="font-semibold text-gray-900">Lista de Pacientes</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Nombre
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Teléfono
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Citas
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {patients.map(patient => {
                    const patientAppointments = appointments.filter(
                      apt => apt.patientId === patient.id
                    );

                    return (
                      <tr key={patient.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-medium text-gray-900">{patient.name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {patient.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {patient.phone}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                            {patientAppointments.length} citas
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Doctors View */}
        {view === 'doctors' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-4 border-b border-gray-200">
              <h3 className="font-semibold text-gray-900">Lista de Médicos</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Nombre
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Especialidad
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Sede
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Citas Activas
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {doctors.map(doctor => {
                    const doctorAppointments = appointments.filter(
                      apt => apt.doctorId === doctor.id && apt.status === 'scheduled'
                    );

                    return (
                      <tr key={doctor.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-medium text-gray-900">{doctor.name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {doctor.specialty}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {getLocationName(doctor.locationId)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                            {doctorAppointments.length} citas
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
