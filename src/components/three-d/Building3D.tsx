import { useMemo, useRef, type CSSProperties, type PointerEvent } from 'react';
import { motion, useAnimationFrame, useMotionValue, useReducedMotion } from 'framer-motion';
import { cn } from '@/utils/cn';

/* -------------------------------------------------------------------------- */
/* Geometry                                                                    */
/* -------------------------------------------------------------------------- */
interface TowerSpec {
  /** Footprint width / depth and height in px. */
  w: number;
  d: number;
  h: number;
  /** Position on the ground plane (px from the centre). */
  x: number;
  z: number;
  /** Window grid per face. */
  cols: number;
  rows: number;
  /** Accent beacon on the roof. */
  beacon?: boolean;
  seed: number;
}

const TOWERS: TowerSpec[] = [
  { w: 118, d: 118, h: 330, x: 0, z: 0, cols: 5, rows: 15, beacon: true, seed: 3 },
  { w: 96, d: 96, h: 214, x: -158, z: 72, cols: 4, rows: 10, seed: 7 },
  { w: 104, d: 90, h: 262, x: 156, z: -54, cols: 4, rows: 12, seed: 11 },
  { w: 78, d: 78, h: 132, x: -92, z: -150, cols: 3, rows: 6, seed: 19 },
  { w: 84, d: 84, h: 168, x: 112, z: 148, cols: 3, rows: 8, seed: 23 },
];

/** Deterministic pseudo random so lit windows are stable between renders. */
function pseudo(seed: number): number {
  const x = Math.sin(seed * 9301 + 49297) * 233280;
  return x - Math.floor(x);
}

type FaceName = 'front' | 'back' | 'left' | 'right';

const FACE_TONE: Record<FaceName, string> = {
  front: 'from-brand-500 via-brand-600 to-brand-800',
  right: 'from-brand-600 via-brand-700 to-brand-900',
  back: 'from-brand-600 via-brand-700 to-brand-900',
  left: 'from-brand-700 via-brand-800 to-brand-950',
};

function WindowGrid({ cols, rows, seed, face }: { cols: number; rows: number; seed: number; face: number }) {
  const cells = useMemo(
    () =>
      Array.from({ length: cols * rows }, (_, index) => {
        const roll = pseudo(seed * 131 + face * 17 + index);
        return roll > 0.62 ? 'lit' : roll > 0.9 ? 'warm' : 'dark';
      }),
    [cols, rows, seed, face],
  );

  return (
    <div
      className="absolute inset-2 grid gap-[3px]"
      style={{ gridTemplateColumns: `repeat(${cols}, 1fr)`, gridTemplateRows: `repeat(${rows}, 1fr)` }}
    >
      {cells.map((state, index) => (
        <span
          key={index}
          className={cn(
            'rounded-[2px]',
            state === 'lit'
              ? 'bg-accent-300 shadow-[0_0_10px_rgba(249,203,87,0.75)]'
              : 'bg-brand-300/20',
          )}
        />
      ))}
    </div>
  );
}

function Tower({ spec }: { spec: TowerSpec }) {
  const { w, d, h, x, z, cols, rows, beacon, seed } = spec;

  const face = (name: FaceName, transform: string, width: number, height: number, left: number, index: number) => (
    <div
      className={cn(
        'backface-hidden absolute border border-white/10 bg-gradient-to-b',
        FACE_TONE[name],
      )}
      style={{ width, height, left, top: 0, transform }}
    >
      <WindowGrid cols={name === 'front' || name === 'back' ? cols : Math.max(3, cols - 1)} rows={rows} seed={seed} face={index} />
    </div>
  );

  const box: CSSProperties = {
    width: w,
    height: h,
    marginLeft: -w / 2,
    marginTop: -h / 2,
    transform: `translate3d(${x}px, ${-h / 2}px, ${z}px)`,
  };

  return (
    <div className="preserve-3d absolute left-1/2 top-1/2" style={box}>
      {face('front', `translateZ(${d / 2}px)`, w, h, 0, 0)}
      {face('back', `rotateY(180deg) translateZ(${d / 2}px)`, w, h, 0, 1)}
      {face('right', `rotateY(90deg) translateZ(${w / 2}px)`, d, h, (w - d) / 2, 2)}
      {face('left', `rotateY(-90deg) translateZ(${w / 2}px)`, d, h, (w - d) / 2, 3)}
      {/* Roof */}
      <div
        className="backface-hidden absolute bg-brand-400 ring-1 ring-white/20"
        style={{ width: w, height: d, left: 0, top: (h - d) / 2, transform: `rotateX(90deg) translateZ(${h / 2}px)` }}
      />
      {beacon && (
        <div
          className="preserve-3d absolute"
          style={{ width: 8, height: 46, left: w / 2 - 4, top: -46, transform: 'translateZ(0)' }}
        >
          <span className="absolute inset-0 rounded-full bg-gradient-to-t from-accent-500 to-accent-200 shadow-[0_0_24px_rgba(245,183,46,0.9)]" />
        </div>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Scene                                                                       */
/* -------------------------------------------------------------------------- */
export interface Building3DProps {
  className?: string;
  /** Accessible description of the illustration. */
  label: string;
}

/**
 * Interactive 3D city block built from real CSS 3D transforms (no WebGL and no
 * extra dependency). It idles with a slow turn, can be dragged to rotate, and
 * stays still for users who prefer reduced motion.
 */
export function Building3D({ className, label }: Building3DProps) {
  const reduceMotion = useReducedMotion();
  const rotation = useMotionValue(-32);
  const dragging = useRef(false);
  const lastX = useRef(0);

  useAnimationFrame((_, delta) => {
    if (reduceMotion || dragging.current) return;
    rotation.set(rotation.get() + delta * 0.0075);
  });

  const handleDown = (event: PointerEvent<HTMLDivElement>) => {
    dragging.current = true;
    lastX.current = event.clientX;
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handleMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!dragging.current) return;
    rotation.set(rotation.get() + (event.clientX - lastX.current) * 0.45);
    lastX.current = event.clientX;
  };

  const handleUp = (event: PointerEvent<HTMLDivElement>) => {
    dragging.current = false;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  return (
    <div
      role="img"
      aria-label={label}
      onPointerDown={handleDown}
      onPointerMove={handleMove}
      onPointerUp={handleUp}
      onPointerCancel={handleUp}
      className={cn('relative cursor-grab touch-pan-y select-none active:cursor-grabbing', className)}
      style={{ perspective: 1700 }}
    >
      {/* Soft glow behind the scene */}
      <div
        aria-hidden="true"
        className="absolute left-1/2 top-[58%] h-[70%] w-[90%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent-400/20 blur-3xl"
      />

      <motion.div
        className="preserve-3d absolute left-1/2 top-[64%] h-0 w-0"
        style={{ rotateX: -22, rotateY: rotation }}
      >
        {/* Ground plane */}
        <div
          aria-hidden="true"
          className="absolute rounded-[40px] border border-white/15 bg-brand-900/70 shadow-[0_0_80px_rgba(245,183,46,0.12)]"
          style={{
            width: 560,
            height: 560,
            marginLeft: -280,
            marginTop: -280,
            transform: 'rotateX(90deg)',
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.07) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />
        {TOWERS.map((tower) => (
          <Tower key={`${tower.x}-${tower.z}`} spec={tower} />
        ))}
      </motion.div>
    </div>
  );
}
