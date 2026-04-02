import React from 'react';
import { useAppContext } from '../context/AppContext';
import { 
  Moon, 
  Sun, 
  Bell, 
  Shield, 
  User, 
  Globe, 
  CreditCard,
  ChevronRight,
  LogOut
} from 'lucide-react';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';

export const Settings: React.FC = () => {
  const { settings, setSettings } = useAppContext();

  const toggleDarkMode = () => {
    setSettings(prev => ({ ...prev, darkMode: !prev.darkMode }));
  };

  const toggleNotifications = () => {
    setSettings(prev => ({ ...prev, notifications: !prev.notifications }));
  };

  const sections = [
    {
      title: 'Appearance',
      items: [
        { 
          label: 'Dark Mode', 
          description: 'Adjust the theme of your dashboard', 
          icon: settings.darkMode ? Moon : Sun,
          action: (
            <button 
              onClick={toggleDarkMode}
              className={cn(
                "w-12 h-6 rounded-full transition-all relative",
                settings.darkMode ? "bg-emerald-500" : "bg-slate-200 dark:bg-slate-800"
              )}
            >
              <motion.div 
                animate={{ x: settings.darkMode ? 24 : 4 }}
                className="absolute top-1 left-0 w-4 h-4 bg-white rounded-full shadow-sm" 
              />
            </button>
          )
        },
        { 
          label: 'Language', 
          description: 'Select your preferred language', 
          icon: Globe,
          action: <span className="text-sm text-slate-500 font-medium">English (US)</span>
        }
      ]
    },
    {
      title: 'Preferences',
      items: [
        { 
          label: 'Notifications', 
          description: 'Manage your alert preferences', 
          icon: Bell,
          action: (
            <button 
              onClick={toggleNotifications}
              className={cn(
                "w-12 h-6 rounded-full transition-all relative",
                settings.notifications ? "bg-emerald-500" : "bg-slate-200 dark:bg-slate-800"
              )}
            >
              <motion.div 
                animate={{ x: settings.notifications ? 24 : 4 }}
                className="absolute top-1 left-0 w-4 h-4 bg-white rounded-full shadow-sm" 
              />
            </button>
          )
        },
        { 
          label: 'Currency', 
          description: 'Set your primary trading currency', 
          icon: CreditCard,
          action: <span className="text-sm text-slate-500 font-medium">INR (₹)</span>
        }
      ]
    },
    {
      title: 'Account & Security',
      items: [
        { 
          label: 'Profile Settings', 
          description: 'Update your personal information', 
          icon: User,
          action: <ChevronRight className="w-5 h-5 text-slate-400" />
        },
        { 
          label: 'Security', 
          description: 'Password and authentication', 
          icon: Shield,
          action: <ChevronRight className="w-5 h-5 text-slate-400" />
        }
      ]
    }
  ];

  return (
    <div className="max-w-2xl mx-auto space-y-12">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Settings</h1>
        <p className="text-slate-500 dark:text-slate-400">Manage your account preferences and application settings.</p>
      </div>

      <div className="space-y-10">
        {sections.map((section) => (
          <div key={section.title} className="space-y-6">
            <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] px-2">{section.title}</h2>
            <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
              {section.items.map((item, i) => (
                <div 
                  key={item.label}
                  className={cn(
                    "flex items-center justify-between p-6 sm:p-8 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors",
                    i !== section.items.length - 1 && "border-b border-slate-100 dark:border-slate-800"
                  )}
                >
                  <div className="flex items-center gap-5">
                    <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl text-slate-600 dark:text-slate-400">
                      <item.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-white">{item.label}</h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400">{item.description}</p>
                    </div>
                  </div>
                  <div>{item.action}</div>
                </div>
              ))}
            </div>
          </div>
        ))}

        <button className="w-full flex items-center justify-center gap-2 p-6 bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 font-bold rounded-[2rem] border border-red-100 dark:border-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/20 transition-all">
          <LogOut className="w-5 h-5" />
          Sign Out
        </button>
      </div>
    </div>
  );
};
