import { useState, useEffect } from 'react';
import { motion } from 'motion/react';

interface OneTimeTypewriterProps {
  text: string;
  speed?: number;
  className?: string;
}

export default function OneTimeTypewriter({
  text,
  speed = 65,
  className = ''
}: OneTimeTypewriterProps) {
  const [displayed, setDisplayed] = useState('');
  const [isComplete, setIsComplete] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = () => setReducedMotion(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  useEffect(() => {
    if (!isComplete && displayed.length < text.length) {
      const timer = setTimeout(
        () => setDisplayed(text.slice(0, displayed.length + 1)),
        speed
      );
      return () => clearTimeout(timer);
    }
    if (displayed.length === text.length) {
      setIsComplete(true);
    }
  }, [displayed, text, speed, isComplete]);

  if (reducedMotion) return <span className={`block w-full text-center ${className}`}>{text}</span>;

  return (
    // Full-width block: the box never shrink-wraps, so the line cannot drift
    // while typing. The caret always reserves space (transparent when done) so
    // blinking/completion never shifts the centered text by half a caret.
    <span className={`block w-full text-center ${className}`}>
      {/* Screen readers get the complete sentence immediately */}
      <span className="sr-only">{text}</span>
      <motion.span
        aria-hidden="true"
        className="inline-block max-w-full"
        animate={{ opacity: 1 }}
        transition={{ duration: 0.25 }}
      >
        {displayed}
        <motion.span
          aria-hidden="true"
          animate={{ opacity: isComplete ? 0 : [1, 0] }}
          transition={{ duration: 0.55, repeat: isComplete ? 0 : Infinity, repeatDelay: 0.15 }}
          className="inline-block w-[0.6ex] h-[0.9em] ml-[0.15rem] bg-current align-middle rounded-sm"
        />
      </motion.span>
    </span>
  );
}
