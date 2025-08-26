import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';

const poetBars = [
  'Code takes flight through drones we steer',
  'React and Mapbox make paths clear',
  'Mapping skies with logic near.',
];

export default function HeroSection() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prevIndex) => (prevIndex + 1) % poetBars.length);
    }, 10000); // 10 seconds per line

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="flex h-[70vh] w-full flex-col items-center justify-center px-4 py-8">
      <div className="flex w-full max-w-7xl items-center justify-center">
        <AnimatePresence mode="wait">
          <Header key={index}>{poetBars[index]}</Header>
        </AnimatePresence>
      </div>
    </section>
  );
}

const duration = 0.25;
const stagger = 0.025;

const Header = ({ children }: { children: string }) => {
  return (
    <motion.h1
      initial="initial"
      animate="animate"
      exit="exit"
      className="text-center font-bold uppercase leading-tight text-white"
      style={{
        fontSize: 'clamp(2rem, 8vw, 8rem)',
        wordSpacing: 'clamp(0.5rem, 2vw, 2rem)',
      }}
    >
      <div className="flex flex-wrap items-center justify-center gap-x-2 sm:gap-x-4">
        {children.split(' ').map((word, wordIndex) => (
          <div key={wordIndex} className="overflow-hidden">
            {word.split('').map((letter, letterIndex) => {
              const globalIndex = children.split(' ').slice(0, wordIndex).join('').length + wordIndex + letterIndex;
              return (
                <motion.span
                  variants={{
                    initial: { y: '100%', opacity: 0 },
                    animate: { y: 0, opacity: 1 },
                    exit: { y: '-100%', opacity: 0 },
                  }}
                  key={letterIndex}
                  className="inline-block"
                  transition={{
                    duration: duration,
                    ease: 'easeInOut',
                    delay: stagger * globalIndex,
                  }}
                >
                  {letter}
                </motion.span>
              );
            })}
          </div>
        ))}
      </div>
    </motion.h1>
  );
};
