import { useRef, type PointerEvent, type ReactNode } from 'react';
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from 'framer-motion';
import { cn } from '@/utils/cn';

export interface TiltCardProps {
  children: ReactNode;
  className?: string;
  /** Classes for the perspective wrapper (use `h-full` inside grids). */
  wrapperClassName?: string;
  /** Maximum rotation in degrees on each axis. */
  maxTilt?: number;
  /** Show a soft light reflection that follows the pointer. */
  glare?: boolean;
}

const SPRING = { stiffness: 190, damping: 22, mass: 0.45 } as const;

/**
 * Wraps any card in a CSS 3D scene: the card leans toward the pointer with a
 * spring, and a light reflection follows the cursor. Touch input and users who
 * prefer reduced motion get the plain, static card.
 */
export function TiltCard({
  children,
  className,
  wrapperClassName,
  maxTilt = 7,
  glare = true,
}: TiltCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();

  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);
  const hover = useMotionValue(0);
  const sx = useSpring(px, SPRING);
  const sy = useSpring(py, SPRING);

  const rotateY = useTransform(sx, [0, 1], [-maxTilt, maxTilt]);
  const rotateX = useTransform(sy, [0, 1], [maxTilt, -maxTilt]);
  const gx = useTransform(sx, [0, 1], [0, 100]);
  const gy = useTransform(sy, [0, 1], [0, 100]);
  const glareBackground = useMotionTemplate`radial-gradient(380px circle at ${gx}% ${gy}%, rgba(255,255,255,0.20), transparent 55%)`;

  const handleMove = (event: PointerEvent<HTMLDivElement>) => {
    if (reduceMotion || event.pointerType !== 'mouse' || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    px.set((event.clientX - rect.left) / rect.width);
    py.set((event.clientY - rect.top) / rect.height);
    hover.set(1);
  };

  const handleLeave = () => {
    px.set(0.5);
    py.set(0.5);
    hover.set(0);
  };

  return (
    <div className={cn('perspective-near', wrapperClassName)}>
      <motion.div
        ref={ref}
        onPointerMove={handleMove}
        onPointerLeave={handleLeave}
        style={reduceMotion ? undefined : { rotateX, rotateY, transformStyle: 'preserve-3d' }}
        className={cn('will-transform relative', className)}
      >
        {children}
        {glare && !reduceMotion && (
          <motion.div
            aria-hidden="true"
            style={{ background: glareBackground, opacity: hover }}
            className="pointer-events-none absolute inset-0 z-10 rounded-[inherit] transition-opacity duration-300"
          />
        )}
      </motion.div>
    </div>
  );
}
