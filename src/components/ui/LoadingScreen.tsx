import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { logo } from '../../assets';

interface LoadingScreenProps {
  minLoadingTime?: number; // Minimum time to show the loading screen in ms
  onLoadingComplete?: (isComplete: boolean) => void; // Callback when loading is complete
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ minLoadingTime = 2000, onLoadingComplete }) => {
  const [isLoading, setIsLoading] = useState(true);
  const tagline = "Hire so you don't have to fire";

  useEffect(() => {
    // Start loading timer
    const timer = setTimeout(() => {
      setIsLoading(false);
      if (onLoadingComplete) {
        onLoadingComplete(true);
      }
    }, minLoadingTime);

    // Cleanup
    return () => clearTimeout(timer);
  }, [minLoadingTime, onLoadingComplete]);

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div 
          initial={{ opacity: 1 }}
          exit={{ 
            opacity: 0,
            transition: { duration: 0.6, ease: "easeInOut" }
          }}
          className="fixed inset-0 bg-dark-900 flex flex-col items-center justify-center z-50"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="w-40 h-40 mb-8"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" className="w-full h-full">
              <motion.path 
                initial={{ pathLength: 0, fill: "rgba(99, 102, 241, 0)" }}
                animate={{ 
                  pathLength: 1,
                  fill: "rgba(99, 102, 241, 1)"
                }}
                transition={{ 
                  pathLength: { duration: 2, ease: "easeInOut" },
                  fill: { delay: 1.5, duration: 1, ease: "easeInOut" }
                }}
                stroke="#6366f1"
                strokeWidth="3"
                d="M96.49649 103.5349C94.317464 107.44894 91.53465299999999 111.0252 89.873611 115.21530999999999C83.058902 132.40616999999997 107.41146 134.95591 105.2919 119.70778999999999C104.94348 117.20169999999999 103.9493 114.75995999999999 102.80172999999999 112.51981999999998C101.13350999999999 109.26313999999998 99.01830999999999 106.16811999999999 96.49649 103.53489999999998zM80.323623 125.99722C81.86939699999999 132.11212 85.242888 135.49681 91.105535 137.67763C89.578384 131.63986 86.088058 128.21289 80.323623 125.99722zM113.56787 126.89572C107.94275 127.98485 104.51737 131.37192 102.78594 136.77917C108.41099 135.6901 111.83646 132.3029 113.56787 126.89572zM75.641606 134.22405C69.29319699999999 134.19395 63.048271 139.29384000000002 57.86127499999999 142.17011L57.86127499999999 143.96713C63.76212099999999 147.23922 72.10509099999999 154.23748 79.339125 151.24981C86.731915 148.19654 85.448319 135.84450999999999 77.61409499999999 134.4048C76.95621799999999 134.28381 76.29835399999999 134.227 75.641606 134.22399zM118.2481 134.22405C117.59137999999999 134.22705 116.93348999999999 134.28385 116.27564 134.40487000000002C108.44140999999999 135.84458 107.15778 148.19661000000002 114.55060999999999 151.24988000000002C121.78464 154.23755000000003 130.12932999999998 147.23929 136.03019 143.96720000000002L136.03019 142.17017C130.84318000000002 139.2939 124.59656000000001 134.19508000000002 118.24810000000001 134.22412000000003zM96.98962 138.47963000000001C96.84089 138.47893000000002 96.68871 138.48663000000002 96.53158 138.49973000000003C91.580782 138.96534000000003 92.501964 146.77359000000004 97.35814 146.24220000000003C102.02469 145.73147000000003 101.59626 138.49986 96.98962 138.47870000000003zM102.78594 148.45958000000002C104.33171999999999 154.57441000000003 107.70521 157.95917000000003 113.56787 160.13998C112.02022 154.02097 108.4701 150.91422 102.78594 148.45958000000002zM91.105535 149.35807000000003C85.480535 150.44711000000004 82.055002 153.83427000000003 80.323623 159.24149000000003C85.948626 158.15238000000002 89.374156 154.76529000000002 91.105535 149.35807000000003zM97.59152 156.34593000000004C91.963654 156.27303000000003 85.976059 161.43079000000003 89.738491 170.92193000000003C91.39711299999999 175.10612000000003 94.318484 178.69027000000003 96.49649 182.60234000000003C99.02655999999999 179.96076000000002 101.13319999999999 176.84656000000004 102.87369 173.61738000000003C104.08700999999999 171.36601000000002 105.00744999999999 168.98146000000003 105.31295 166.42945000000003C106.12769 159.62327000000002 101.96875 156.40255000000002 97.59152 156.34593000000004z" 
              />
            </svg>
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.7 }}
            className="text-3xl font-bold text-white"
          >
            First Reference
          </motion.h1>
          
          {/* Tagline with sliding vertical line reveal animation */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.5 }}
            className="relative mt-2 h-8 w-72 overflow-hidden"
          >
            {/* Static tagline */}
            <div className="absolute inset-0 flex items-center justify-center text-lg text-primary-300">
              {tagline}
            </div>
            
            {/* Sliding mask with vertical line */}
            <motion.div
              initial={{ left: "0%" }}
              animate={{ left: "100%" }}
              transition={{ 
                duration: 0.8, 
                delay: 1.2,
                ease: "easeInOut"
              }}
              className="absolute inset-y-0 bg-dark-900 flex items-center"
              style={{ width: "101%" }}
            >
              {/* Vertical line */}
              <div className="absolute h-full w-0.5 right-0 bg-primary-400"></div>
            </motion.div>
          </motion.div>
          
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: "180px" }}
            transition={{ 
              delay: 0.7, 
              duration: 1.5,
              ease: "easeOut" 
            }}
            className="h-1 bg-primary-500 mt-4 rounded-full"
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LoadingScreen; 