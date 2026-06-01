import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Activity, Dumbbell, CalendarCheck, ShieldCheck, ArrowRight } from 'lucide-react';
import { packageAPI, exerciseAPI } from '../api/apiService';

const Home = () => {
  const [packages, setPackages] = useState<any[]>([]);
  const [exercises, setExercises] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [pkgRes, exRes] = await Promise.all([packageAPI.getAll(), exerciseAPI.getAll()]);
        setPackages(pkgRes.data.packages?.slice(0, 3) || []);
        setExercises(exRes.data.exercises?.slice(0, 4) || []);
      } catch (error) {
        console.error('Failed to fetch data for home page', error);
      }
    };
    fetchData();
  }, []);

  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.6 }
  };

  return (
    <div className="bg-black text-white min-h-screen font-sans selection:bg-green-500 selection:text-black">
      
      {/* Navbar (Public) */}
      <nav className="fixed w-full z-50 bg-black/60 backdrop-blur-md border-b border-white/10 transition-all">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Dumbbell className="text-green-500 w-8 h-8" />
            <span className="text-2xl font-black tracking-tighter">GymFit<span className="text-green-500">Pro</span></span>
          </div>
          <div className="hidden md:flex gap-8 text-sm font-medium text-gray-300">
            <a href="#features" className="hover:text-green-400 transition-colors">Features</a>
            <a href="#packages" className="hover:text-green-400 transition-colors">Packages</a>
            <a href="#exercises" className="hover:text-green-400 transition-colors">Exercises</a>
          </div>
          <div className="flex gap-4">
            <Link to="/login" className="px-5 py-2 text-sm font-semibold rounded-full hover:bg-white/10 transition-colors">Log In</Link>
            <Link to="/register" className="px-5 py-2 text-sm font-bold bg-green-500 text-black rounded-full hover:bg-green-400 transition-all shadow-[0_0_20px_rgba(34,197,94,0.4)] hover:scale-105">Get Started</Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden min-h-[90vh] flex items-center">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent z-10" />
          <img src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2070&auto=format&fit=crop" alt="Gym" className="w-full h-full object-cover object-center opacity-40" />
        </div>
        
        <div className="max-w-7xl mx-auto px-6 relative z-10 w-full">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="max-w-2xl"
          >
            <h1 className="text-5xl md:text-7xl font-black leading-tight mb-6">
              Transform Your Body With <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-green-600">GymFit Pro</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-400 mb-10 leading-relaxed font-light">
              Experience the ultimate fitness ecosystem. Track workouts, follow premium gym packages, and achieve your dream physique with our cutting-edge SaaS platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/register" className="px-8 py-4 bg-green-500 text-black font-bold rounded-full text-lg hover:bg-green-400 transition-all flex items-center justify-center gap-2 group shadow-[0_0_30px_rgba(34,197,94,0.3)]">
                Start Your Journey <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <a href="#packages" className="px-8 py-4 bg-white/5 backdrop-blur-md border border-white/10 font-bold rounded-full text-lg hover:bg-white/10 transition-all flex items-center justify-center">
                View Packages
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-gray-950">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div {...fadeIn} className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Why Choose Us?</h2>
            <p className="text-gray-400">Everything you need to reach your fitness goals.</p>
          </motion.div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: <Activity className="w-8 h-8 text-green-500" />, title: "Workout Tracking", desc: "Log every rep and set with our intuitive interface." },
              { icon: <ShieldCheck className="w-8 h-8 text-green-500" />, title: "Premium Packages", desc: "Access curated gym plans designed by professionals." },
              { icon: <Dumbbell className="w-8 h-8 text-green-500" />, title: "Exercise Library", desc: "Hundreds of exercises with step-by-step guides." },
              { icon: <CalendarCheck className="w-8 h-8 text-green-500" />, title: "Progress Analytics", desc: "Visualize your growth with detailed weekly charts." }
            ].map((feat, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                whileHover={{ y: -5 }}
                className="p-8 rounded-2xl bg-white/5 border border-white/5 hover:border-green-500/30 hover:bg-white/10 transition-all group backdrop-blur-sm"
              >
                <div className="bg-green-500/10 w-16 h-16 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  {feat.icon}
                </div>
                <h3 className="text-xl font-bold mb-3">{feat.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{feat.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Packages Section */}
      <section id="packages" className="py-24 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-green-500/10 rounded-full blur-[120px] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <motion.div {...fadeIn} className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Elite Fitness Packages</h2>
            <p className="text-gray-400">Choose a plan that fits your goals.</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {packages.map((pkg, idx) => (
              <motion.div 
                key={pkg._id}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                whileHover={{ y: -10 }}
                className="bg-gray-900 rounded-3xl border border-gray-800 hover:border-green-500 overflow-hidden flex flex-col transition-all shadow-2xl relative group"
              >
                <div className="absolute inset-0 bg-gradient-to-b from-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                
                <div className="p-8 flex-1 relative z-10">
                  <h3 className="text-2xl font-bold mb-2">{pkg.name}</h3>
                  <div className="flex items-end gap-1 mb-4">
                    <span className="text-4xl font-black">${pkg.price}</span>
                    <span className="text-gray-400 mb-1">/{pkg.duration}</span>
                  </div>
                  <p className="text-gray-400 mb-8 h-12 line-clamp-2">{pkg.description}</p>
                  
                  <div className="space-y-3 mb-8">
                    {pkg.exercises?.slice(0, 4).map((ex: any) => (
                      <div key={ex._id} className="flex items-center gap-3">
                        <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center">
                          <div className="w-2 h-2 rounded-full bg-green-500" />
                        </div>
                        <span className="text-sm text-gray-300">{ex.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="p-8 pt-0 relative z-10">
                  <Link to="/login" className="w-full py-4 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center font-bold hover:bg-green-500 hover:text-black transition-all">
                    Purchase Plan
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Exercises Preview */}
      <section id="exercises" className="py-24 bg-gray-950">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div {...fadeIn} className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-4xl font-bold mb-4">Exercise Library</h2>
              <p className="text-gray-400">Master your form with professional guidance.</p>
            </div>
          </motion.div>

          <div className="grid md:grid-cols-4 gap-6">
            {exercises.map((ex, idx) => (
              <motion.div 
                key={ex._id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="group relative rounded-2xl overflow-hidden bg-gray-900 aspect-[4/5]"
              >
                <img src={ex.image} alt={ex.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-60 group-hover:opacity-40" />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                <div className="absolute bottom-0 left-0 p-6 w-full">
                  <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs font-bold rounded mb-2 inline-block uppercase tracking-wider backdrop-blur-md border border-green-500/20">{ex.muscleGroup}</span>
                  <h3 className="text-xl font-bold text-white">{ex.name}</h3>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>



      {/* Footer */}
      <footer className="bg-black py-12 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-4 gap-8">
          <div className="col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <Dumbbell className="text-green-500 w-6 h-6" />
              <span className="text-xl font-black tracking-tighter">GymFit<span className="text-green-500">Pro</span></span>
            </div>
            <p className="text-gray-500 text-sm max-w-sm">
              Empowering your fitness journey through cutting-edge technology and expertly crafted training programs.
            </p>
          </div>
          <div>
            <h4 className="font-bold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-gray-500 text-sm">
              <li><a href="#features" className="hover:text-green-400">Features</a></li>
              <li><a href="#packages" className="hover:text-green-400">Packages</a></li>
              <li><Link to="/login" className="hover:text-green-400">Sign In</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4">Contact</h4>
            <ul className="space-y-2 text-gray-500 text-sm">
              <li>support@gymfitpro.com</li>
              <li>1-800-GYM-FIT</li>
              <li>Los Angeles, CA</li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 mt-12 pt-8 border-t border-white/10 text-center text-gray-600 text-sm">
          &copy; {new Date().getFullYear()} GymFit Pro. All rights reserved.
        </div>
      </footer>

    </div>
  );
};

export default Home;
