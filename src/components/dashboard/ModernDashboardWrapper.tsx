import React, { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface ModernDashboardWrapperProps {
  children: ReactNode;
  className?: string;
}

const ModernDashboardWrapper: React.FC<ModernDashboardWrapperProps> = ({ 
  children, 
  className = '' 
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={`min-h-screen bg-gradient-to-br from-gray-50 via-emerald-50/30 to-teal-50/30 ${className}`}
    >
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-emerald-200/20 to-teal-200/20 rounded-full blur-2xl animate-pulse"></div>
        <div className="absolute top-40 right-20 w-40 h-40 bg-gradient-to-br from-cyan-200/20 to-blue-200/20 rounded-full blur-2xl animate-pulse"></div>
        <div className="absolute bottom-20 left-1/4 w-24 h-24 bg-gradient-to-br from-green-200/20 to-emerald-200/20 rounded-full blur-2xl animate-pulse"></div>
        <div className="absolute bottom-40 right-1/3 w-36 h-36 bg-gradient-to-br from-teal-200/20 to-cyan-200/20 rounded-full blur-2xl animate-pulse"></div>
      </div>

      <div className="relative z-10">
        {children}
      </div>
    </motion.div>
  );
};

export default ModernDashboardWrapper;

