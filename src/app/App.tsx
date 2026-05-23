import { useState } from "react";
import AuthForm from "./components/AuthForm";
import PatientView from "./components/PatientView";
import DoctorView from "./components/DoctorView";
import AdminView from "./components/AdminView";
import { format } from "date-fns";

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: "patient" | "doctor" | "admin";
  specialty?: string;
}

interface Patient {
  id: string;
  name: string;
  email: string;
  phone: string;
}

interface Doctor {
  id: string;
  name: string;
  email: string;
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
  status: "scheduled" | "completed" | "cancelled";
}

const demoUsers: User[] = [
  {
    id: "p1",
    name: "Juan Pérez",
    email: "paciente@demo.com",
    phone: "555-0101",
    role: "patient",
  },
  {
    id: "d1",
    name: "Dra. María González",
    email: "medico@demo.com",
    phone: "555-0201",
    role: "doctor",
    specialty: "Medicina General",
  },
  {
    id: "a1",
    name: "Carlos Admin",
    email: "admin@demo.com",
    phone: "555-0301",
    role: "admin",
  },
];

const initialPatients: Patient[] = [
  {
    id: "p1",
    name: "Juan Pérez",
    email: "paciente@demo.com",
    phone: "555-0101",
  },
  {
    id: "p2",
    name: "Carmen López",
    email: "carmen@email.com",
    phone: "555-0102",
  },
  {
    id: "p3",
    name: "Roberto Silva",
    email: "roberto@email.com",
    phone: "555-0103",
  },
  {
    id: "p4",
    name: "María Torres",
    email: "maria@email.com",
    phone: "555-0104",
  },
  {
    id: "p5",
    name: "Pedro Gómez",
    email: "pedro@email.com",
    phone: "555-0105",
  },
];

const initialDoctors: Doctor[] = [
  {
    id: "d1",
    name: "Dra. María González",
    email: "medico@demo.com",
    specialty: "Medicina General",
    locationId: "1",
  },
  {
    id: "d2",
    name: "Dr. Carlos Ruiz",
    email: "carlos@medico.com",
    specialty: "Pediatría",
    locationId: "1",
  },
  {
    id: "d3",
    name: "Dra. Ana Martínez",
    email: "ana@medico.com",
    specialty: "Cardiología",
    locationId: "2",
  },
  {
    id: "d4",
    name: "Dr. Luis Fernández",
    email: "luis@medico.com",
    specialty: "Dermatología",
    locationId: "2",
  },
  {
    id: "d5",
    name: "Dra. Sofia Torres",
    email: "sofia@medico.com",
    specialty: "Ginecología",
    locationId: "3",
  },
  {
    id: "d6",
    name: "Dr. Miguel Castro",
    email: "miguel@medico.com",
    specialty: "Traumatología",
    locationId: "3",
  },
];

const initialAppointments: Appointment[] = [
  {
    id: "1",
    patientId: "p1",
    doctorId: "d1",
    locationId: "1",
    date: format(new Date(), "yyyy-MM-dd"),
    time: "09:00",
    reason: "Consulta general",
    status: "scheduled",
  },
  {
    id: "2",
    patientId: "p2",
    doctorId: "d2",
    locationId: "1",
    date: format(new Date(), "yyyy-MM-dd"),
    time: "10:00",
    reason: "Control pediátrico",
    status: "scheduled",
  },
  {
    id: "3",
    patientId: "p3",
    doctorId: "d3",
    locationId: "2",
    date: format(new Date(), "yyyy-MM-dd"),
    time: "11:00",
    reason: "Revisión cardiológica",
    status: "scheduled",
  },
];

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(
    null,
  );
  const [users, setUsers] = useState<User[]>(demoUsers);
  const [patients, setPatients] =
    useState<Patient[]>(initialPatients);
  const [doctors, setDoctors] =
    useState<Doctor[]>(initialDoctors);
  const [appointments, setAppointments] = useState<
    Appointment[]
  >(initialAppointments);

  const handleLogin = (
    email: string,
    password: string,
    role: string,
  ) => {
    const user = users.find((u) => u.email === email);

    if (user && password === "123456") {
      setCurrentUser(user);
    } else {
      alert(
        "Credenciales incorrectas. Usa las cuentas de demostración.",
      );
    }
  };

  const handleRegister = (userData: {
    name: string;
    email: string;
    password: string;
    phone: string;
    role: string;
    specialty?: string;
  }) => {
    const existingUser = users.find(
      (u) => u.email === userData.email,
    );

    if (existingUser) {
      alert("Este correo ya está registrado");
      return;
    }

    const newUser: User = {
      id: `${userData.role}${Date.now()}`,
      name: userData.name,
      email: userData.email,
      phone: userData.phone,
      role: userData.role as "patient" | "doctor" | "admin",
      specialty: userData.specialty,
    };

    setUsers([...users, newUser]);

    if (userData.role === "patient") {
      setPatients([
        ...patients,
        {
          id: newUser.id,
          name: userData.name,
          email: userData.email,
          phone: userData.phone,
        },
      ]);
    }

    if (userData.role === "doctor" && userData.specialty) {
      setDoctors([
        ...doctors,
        {
          id: newUser.id,
          name: userData.name,
          email: userData.email,
          specialty: userData.specialty,
          locationId: "1",
        },
      ]);
    }

    setCurrentUser(newUser);
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  const handleCreateAppointment = (
    appointment: Omit<Appointment, "id" | "status">,
  ) => {
    const newAppointment: Appointment = {
      ...appointment,
      id: Date.now().toString(),
      status: "scheduled",
    };

    setAppointments([...appointments, newAppointment]);
  };

  const handleCancelAppointment = (id: string) => {
    setAppointments(
      appointments.map((apt) =>
        apt.id === id
          ? { ...apt, status: "cancelled" as const }
          : apt,
      ),
    );
  };

  const handleCompleteAppointment = (id: string) => {
    setAppointments(
      appointments.map((apt) =>
        apt.id === id
          ? { ...apt, status: "completed" as const }
          : apt,
      ),
    );
  };

  const handleRescheduleAppointment = (
    id: string,
    newDate: string,
    newTime: string,
  ) => {
    setAppointments(
      appointments.map((apt) =>
        apt.id === id
          ? { ...apt, date: newDate, time: newTime }
          : apt,
      ),
    );
  };

  if (!currentUser) {
    return (
      <AuthForm
        onLogin={handleLogin}
        onRegister={handleRegister}
      />
    );
  }

  if (currentUser.role === "patient") {
    return (
      <PatientView
        user={currentUser}
        onLogout={handleLogout}
        appointments={appointments}
        onCreateAppointment={handleCreateAppointment}
        onCancelAppointment={handleCancelAppointment}
        onRescheduleAppointment={handleRescheduleAppointment}
      />
    );
  }

  if (currentUser.role === "doctor") {
    return (
      <DoctorView
        user={currentUser}
        onLogout={handleLogout}
        appointments={appointments}
        patients={patients}
        onCompleteAppointment={handleCompleteAppointment}
      />
    );
  }

  if (currentUser.role === "admin") {
    return (
      <AdminView
        user={currentUser}
        onLogout={handleLogout}
        appointments={appointments}
        patients={patients}
        doctors={doctors}
      />
    );
  }

  return null;
}