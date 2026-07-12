import { useEffect } from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { Trophy, HelpCircle } from "lucide-react";

interface StatCardProps {
  title: string;
  value: number;
  suffix?: string;
  description: string;
  icon?: React.ComponentType<any>;
  isHero?: boolean;
  isPB?: boolean;
  pbDate?: string;
  isDarkMode: boolean;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  suffix = "",
  description,
  icon: Icon = HelpCircle,
  isHero = false,
  isPB = false,
  pbDate,
  isDarkMode
}) => {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => Math.round(latest).toLocaleString());

  useEffect(() => {
    // Reset and animate the counter when value changes
    const controls = animate(count, value, {
      duration: 1.5,
      ease: "easeOut",
    });
    return () => controls.stop();
  }, [value, count]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, scale: 1.01 }}
      transition={{ duration: 0.4 }}
      className={`relative rounded-3xl p-8 flex flex-col justify-between overflow-hidden shadow-2xl transition-all duration-300 ${
        isHero
          ? isDarkMode
            ? "glass-panel bg-gradient-to-br from-emerald-950/20 via-[#0c0c0c] to-[#0c0c0c] border-emerald-500/20 col-span-1 md:col-span-2 lg:col-span-3 min-h-[220px]"
            : "glass-panel-light bg-gradient-to-br from-emerald-50 via-white to-white border-emerald-200/50 col-span-1 md:col-span-2 lg:col-span-3 min-h-[220px]"
          : isDarkMode
          ? "glass-panel border-white/5 min-h-[190px]"
          : "glass-panel-light border-slate-200 min-h-[190px]"
      }`}
    >
      {/* Visual glow overlay for Hero Card */}
      {isHero && (
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none" />
      )}

      <div className="flex items-start justify-between">
        <div>
          <p className={`text-xs font-semibold uppercase tracking-widest ${
            isHero ? "text-emerald-400" : isDarkMode ? "text-slate-400" : "text-slate-500"
          }`}>
            {title}
          </p>
          <h3 className={`font-heading font-black mt-3 tracking-tight ${
            isHero 
              ? "text-4xl md:text-5xl lg:text-6xl text-white" 
              : isDarkMode 
              ? "text-3xl text-white" 
              : "text-3xl text-slate-800"
          }`}>
            <motion.span>{rounded}</motion.span>
            <span className={`text-base font-normal ml-1 ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>
              {suffix}
            </span>
          </h3>
        </div>

        <div className={`p-3 rounded-2xl ${
          isHero
            ? "bg-emerald-500/10 text-emerald-400"
            : isPB
            ? "bg-yellow-500/10 text-yellow-400"
            : isDarkMode
            ? "bg-white/5 text-slate-400"
            : "bg-slate-100 text-slate-500"
        }`}>
          {isPB ? <Trophy className="w-6 h-6 animate-bounce" /> : <Icon className="w-6 h-6" />}
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-1">
        <p className={`text-sm ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}>
          {description}
        </p>
        {isPB && pbDate && (
          <span className="text-[10px] text-yellow-500/80 font-mono">
            Achieved: {pbDate}
          </span>
        )}
      </div>
    </motion.div>
  );
};
