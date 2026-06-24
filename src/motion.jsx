/* RV X motion primitives — 3D depth on the design system's clock.
   TiltCard follows the pointer with a spring (pattern adapted from 21st.dev's
   "Interactive Card" inspiration); Reveal is a scroll-triggered rise with a
   slight rotateX so sections settle in with depth. Both go inert under
   prefers-reduced-motion, and TiltCard also on touch (coarse) pointers. */
import React from 'react';
import { motion, useMotionValue, useSpring, useTransform, useReducedMotion } from 'framer-motion';

const SPRING = { stiffness: 320, damping: 28, mass: 0.6 };

export function TiltCard({ children, max = 5, className = '', ...rest }) {
  const reduce = useReducedMotion();
  const coarse = typeof window !== 'undefined'
    && window.matchMedia && window.matchMedia('(pointer: coarse)').matches;
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, SPRING);
  const sy = useSpring(y, SPRING);
  const rotateX = useTransform(sy, [-0.5, 0.5], [`${max}deg`, `-${max}deg`]);
  const rotateY = useTransform(sx, [-0.5, 0.5], [`-${max}deg`, `${max}deg`]);

  if (reduce || coarse) {
    return <div className={className} {...rest}>{children}</div>;
  }

  const move = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    x.set((e.clientX - r.left) / r.width - 0.5);
    y.set((e.clientY - r.top) / r.height - 0.5);
  };
  const leave = () => { x.set(0); y.set(0); };

  return (
    <motion.div
      className={className}
      onMouseMove={move}
      onMouseLeave={leave}
      style={{ rotateX, rotateY, transformStyle: 'preserve-3d', transformPerspective: 900 }}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

/* Reveal v2 — sections wipe in from left to right, like road lines streaming
   past. Framer drives opacity + x; the wipe itself is a CSS clip-path
   transition (.rvx-wipe in site.css) toggled by onViewportEnter — framer 11
   silently drops whole animation batches that keyframe clipPath, so the wipe
   must not go through it. The resting clip is inset by negative margins so
   overhanging slider arrows and glows aren't cut off. */
export function Reveal({ children, delay = 0, x = -32, className = '', once = true, ...rest }) {
  const reduce = useReducedMotion();
  const [entered, setEntered] = React.useState(false);
  if (reduce) {
    return (
      <motion.div className={className}
        initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
        viewport={{ once, margin: '-60px' }} transition={{ duration: 0.4 }} {...rest}>
        {children}
      </motion.div>
    );
  }
  return (
    <motion.div
      className={`${className ? `${className} ` : ''}rvx-wipe${entered ? ' rvx-wipe--in' : ''}`}
      initial={{ opacity: 0, x }}
      whileInView={{ opacity: 1, x: 0 }}
      onViewportEnter={() => setEntered(true)}
      viewport={{ once, margin: '-60px' }}
      transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1], delay }}
      style={{ '--wipe-delay': `${delay}s` }}
      {...rest}
    >
      {children}
    </motion.div>
  );
}
