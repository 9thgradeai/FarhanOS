import { useState, useEffect } from 'react';
import { motion } from 'motion/react';

interface LoopingTypewriterProps {
  text: string;
  speed?: number;
  holdTime?: number;
  loopDelay?: number;
  className?: string;
}

export default function LoopingTypewriter({
  text,
  speed = 65,
  holdTime = 2000,
  loopDelay = 400,
  className = ''
}: LoopingTypewriterProps) {
  const [displayed, setDisplayed] = useState('');
  const [isComplete, setIsComplete] = useState(false);
  const [isLooping, setIsLooping] = useState(false);
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
    let timeoutId: ReturnType<typeof setTimeout>;

    if (!isComplete && displayed.length < text.length) {
      timeoutId = setTimeout(
        () => setDisplayed(text.slice(0, displayed.length + 1)),
        speed
      );
    } else if (displayed.length === text.length && !isLooping) {
      setIsComplete(true);
      timeoutId = setTimeout(() => {
        setIsLooping(true);
        setDisplayed('');
      }, holdTime);
    } else if (isLooping && displayed.length < text.length) {
      timeoutId = setTimeout(
        () => setDisplayed(text.slice(0, displayed.length + 1)),
        speed
      );
    }

    return () => clearTimeout(timeoutId);
  }, [displayed, text, speed, isComplete, isLooping, holdTime]);

  if (reducedMotion) return <span className={`block w-full text-center ${className}`}>{text}</span>;

  const caretVisible = !isComplete || isLooping;

  return (
    // Full-width block + permanently reserved caret space: no drift while
    // typing, no jump when blinking or when the loop restarts.
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
          animate={{ opacity: caretVisible ? [1, 0] : 0 }}
          transition={{ duration: 0.55, repeat: caretVisible ? Infinity : 0, repeatDelay: 0.15 }}
          className="inline-block w-[0.6ex] h-[0.9em] ml-[0.15rem] bg-current align-middle rounded-sm"
        />
      </motion.span>
    </span>
  );
}
