import { useState } from 'react';
import { User, Mail, Lock, Calendar, UserCircle, Stethoscope, Shield } from 'lucide-react';

interface AuthFormProps {
  onLogin: (email: string, password: string, role: string) => void;
  onRegister: (userData: {
    name: string;
    email: string;
    password: string;
    phone: string;
    role: string;
    specialty?: string;
  }) => void;
}

export default function AuthForm({ onLogin, onRegister }: AuthFormProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'patient',
    specialty: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (isLogin) {
      if (!formData.email || !formData.password) {
        alert('Por favor completa todos los campos');
        return;
      }
      onLogin(formData.email, formData.password, formData.role);
    } else {
      if (!formData.name || !formData.email || !formData.password || !formData.phone) {
        alert('Por favor completa todos los campos');
        return;
      }
      if (formData.role === 'doctor' && !formData.specialty) {
        alert('Por favor indica tu especialidad');
        return;
      }
      onRegister(formData);
    }
  };

  const roles = [
    { value: 'patient', label: 'Paciente', icon: UserCircle, color: 'bg-blue-100 text-blue-600' },
    { value: 'doctor', label: 'Médico', icon: Stethoscope, color: 'bg-green-100 text-green-600' },
    { value: 'admin', label: 'Administrador', icon: Shield, color: 'bg-purple-100 text-purple-600' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-8 text-white">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-white bg-opacity-20 p-3 rounded-lg">
              <Calendar className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold">MediCitas</h1>
              <p className="text-blue-100">Sistema de Gestión de Citas</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="p-8">
          <div className="flex gap-2 mb-6 bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2 rounded-md transition-all ${
                isLogin
                  ? 'bg-white shadow-sm text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Iniciar Sesión
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2 rounded-md transition-all ${
                !isLogin
                  ? 'bg-white shadow-sm text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Registrarse
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Role Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de usuario
              </label>
              <div className="grid grid-cols-3 gap-2">
                {roles.map((role) => {
                  const Icon = role.icon;
                  return (
                    <button
                      key={role.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, role: role.value })}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        formData.role === role.value
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className={`${role.color} w-10 h-10 rounded-lg flex items-center justify-center mx-auto mb-2`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="text-xs text-gray-700">{role.label}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre completo
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ingresa tu nombre"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Correo electrónico
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="ejemplo@correo.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {!isLogin && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Teléfono
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="555-0000"
                  />
                </div>

                {formData.role === 'doctor' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Especialidad
                    </label>
                    <select
                      value={formData.specialty}
                      onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Seleccionar especialidad</option>
                      <option value="Medicina General">Medicina General</option>
                      <option value="Pediatría">Pediatría</option>
                      <option value="Cardiología">Cardiología</option>
                      <option value="Dermatología">Dermatología</option>
                      <option value="Ginecología">Ginecología</option>
                      <option value="Oftalmología">Oftalmología</option>
                      <option value="Traumatología">Traumatología</option>
                      <option value="Psicología">Psicología</option>
                    </select>
                  </div>
                )}
              </>
            )}

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg"
            >
              {isLogin ? 'Iniciar Sesión' : 'Registrarse'}
            </button>
          </form>

          {/* Demo Accounts Info */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-xs text-blue-900 font-medium mb-2">Cuentas de demostración:</p>
            <div className="space-y-1 text-xs text-blue-700">
              <div>• Paciente: paciente@demo.com / 123456</div>
              <div>• Médico: medico@demo.com / 123456</div>
              <div>• Admin: admin@demo.com / 123456</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
