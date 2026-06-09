'use client';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/hooks/useAuth';
import { ChefHat, Eye, EyeOff, User, Lock, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

const loginSchema = z.object({
  username: z.string().min(1, 'Username wajib diisi'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true);
    try {
      await login(data.username, data.password);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Username atau password salah', {
        position: 'top-right',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-[#f8fafc]">
      {/* Kiri - Bagian Visual / Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-[#0f172a]">
        {/* Latar Belakang Gambar Autentik - Spesial Nasi Pedas */}
        <div 
          className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat transition-transform duration-[10000ms] hover:scale-105"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&q=80&w=2000')" }}
        />
        {/* Overlay Gradasi Khas Merah/Gelap */}
        <div className="absolute inset-0 z-10 bg-gradient-to-t from-red-950/95 via-gray-950/80 to-black/30" />
        
        <div className="relative z-20 flex flex-col justify-end w-full p-16 pb-24 text-white">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="inline-flex items-center justify-center p-2 bg-red-600/20 backdrop-blur-md rounded-2xl mb-6 border border-red-500/30 shadow-[0_0_30px_rgba(220,38,38,0.3)]">
              <img 
                src="/basman.png" 
                alt="Logo Sego Pedes Basman" 
                className="h-12 w-auto object-contain pointer-events-none select-none" 
                draggable="false" 
                onContextMenu={(e) => e.preventDefault()}
              />
            </div>
            <h1 className="text-5xl font-extrabold tracking-tight mb-4 leading-tight">
              Sego Pedes <span className="text-red-500">Basman</span>
            </h1>
            <p className="text-lg text-gray-300 max-w-md leading-relaxed font-light mb-6">
              Kenikmatan sejati paket nasi hangat dengan berbagai lauk ayam dan ikan super pedas khas bumbu rempah nusantara.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Kanan - Bagian Form Auth */}
      <div className="flex-1 flex flex-col justify-center items-center p-8 sm:p-12 lg:p-16 relative">
        {/* Ornamen Latar Tipis */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-red-100 rounded-full blur-[100px] opacity-60 pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-yellow-50 rounded-full blur-[120px] opacity-60 pointer-events-none" />

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md relative z-10"
        >
          {/* Logo Mobile */}
          <div className="lg:hidden flex items-center justify-center mb-10">
            <div className="bg-gradient-to-br from-red-600 to-red-800 p-2.5 rounded-2xl shadow-lg border border-red-500">
              <img 
                src="/basman.png" 
                alt="Logo Sego Pedes Basman" 
                className="h-10 w-auto object-contain pointer-events-none select-none brightness-0 invert" 
                draggable="false" 
                onContextMenu={(e) => e.preventDefault()}
              />
            </div>
            <div className="ml-4">
              <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight leading-none">Sego Pedes</h1>
              <p className="text-red-600 font-bold text-sm tracking-widest uppercase">Basman</p>
            </div>
          </div>

          <div className="mb-10 text-center lg:text-left">
            <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Selamat Datang! 👋</h2>
            <p className="text-gray-500 mt-2 font-medium">Masuk untuk mengelola pesanan & antrian.</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5 ml-1">Username</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400 group-focus-within:text-red-600 transition-colors" />
                </div>
                <input
                  {...register('username')}
                  type="text"
                  placeholder="Masukkan username"
                  className={`w-full bg-white border ${errors.username ? 'border-red-500 ring-4 ring-red-500/10' : 'border-gray-200 focus:border-red-500'} rounded-xl pl-11 pr-4 py-3.5 text-gray-900 font-medium placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-red-500/10 transition-all shadow-sm`}
                />
              </div>
              {errors.username && (
                <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="text-red-500 text-sm mt-1.5 ml-1 font-medium">
                  {errors.username.message}
                </motion.p>
              )}
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5 ml-1 mr-1">
                <label className="block text-sm font-bold text-gray-700">Password</label>
              </div>
              <div className="relative group">
                 <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-red-600 transition-colors" />
                </div>
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className={`w-full bg-white border ${errors.password ? 'border-red-500 ring-4 ring-red-500/10' : 'border-gray-200 focus:border-red-500'} rounded-xl pl-11 pr-12 py-3.5 text-gray-900 font-medium placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-red-500/10 transition-all shadow-sm`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.password && (
                <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="text-red-500 text-sm mt-1.5 ml-1 font-medium">
                  {errors.password.message}
                </motion.p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="group w-full relative flex items-center justify-center gap-2 bg-gradient-to-r from-red-600 to-red-700 text-white font-bold py-3.5 rounded-xl hover:from-red-700 hover:to-red-800 disabled:opacity-70 transition-all shadow-[0_8px_20px_rgba(220,38,38,0.25)] hover:shadow-[0_12px_25px_rgba(220,38,38,0.35)] overflow-hidden"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Mengautentikasi...
                </span>
              ) : (
                <>
                  Masuk Sekarang
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
