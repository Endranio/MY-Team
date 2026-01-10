import { useEffect, useRef, useState, useCallback } from 'react';

interface UseScrollAnimationOptions {
    threshold?: number;
    rootMargin?: string;
    triggerOnce?: boolean;
}

/**
 * Custom hook untuk mendeteksi visibilitas elemen dan memicu animasi
 * Best practice: Menggunakan Intersection Observer API untuk performa optimal
 */
export const useScrollAnimation = <T extends HTMLElement = HTMLDivElement>(
    options: UseScrollAnimationOptions = {}
) => {
    const { threshold = 0.1, rootMargin = '0px 0px -50px 0px', triggerOnce = true } = options;
    const ref = useRef<T>(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const element = ref.current;
        if (!element) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    if (triggerOnce) {
                        observer.unobserve(element);
                    }
                } else if (!triggerOnce) {
                    setIsVisible(false);
                }
            },
            { threshold, rootMargin }
        );

        observer.observe(element);

        return () => {
            observer.unobserve(element);
        };
    }, [threshold, rootMargin, triggerOnce]);

    return { ref, isVisible };
};

/**
 * Hook untuk animasi stagger pada children elements
 */
export const useStaggerAnimation = <T extends HTMLElement = HTMLDivElement>(
    itemCount: number,
    options: UseScrollAnimationOptions = {}
) => {
    const { ref, isVisible } = useScrollAnimation<T>(options);

    const getStaggerDelay = (index: number) => ({
        transitionDelay: `${index * 100}ms`,
    });

    return { ref, isVisible, getStaggerDelay };
};

/**
 * Hook untuk counter animation (angka naik dari 0)
 * Best practice: Menggunakan easing function untuk animasi yang smooth
 */
interface UseCounterAnimationOptions {
    duration?: number;
    delay?: number;
    easing?: 'easeOut' | 'easeInOut' | 'spring';
}

export const useCounterAnimation = (
    endValue: number,
    isVisible: boolean,
    options: UseCounterAnimationOptions = {}
) => {
    const { duration = 2000, delay = 0, easing = 'easeOut' } = options;
    const [count, setCount] = useState(0);
    const countRef = useRef(0);
    const frameRef = useRef<number>();

    // Easing functions untuk animasi yang lebih smooth
    const easingFunctions = {
        easeOut: (t: number) => 1 - Math.pow(1 - t, 3),
        easeInOut: (t: number) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,
        spring: (t: number) => {
            const c4 = (2 * Math.PI) / 3;
            return t === 0 ? 0 : t === 1 ? 1 : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
        }
    };

    useEffect(() => {
        if (!isVisible) return;

        const startTime = performance.now() + delay;
        const easeFn = easingFunctions[easing];

        const animate = (currentTime: number) => {
            if (currentTime < startTime) {
                frameRef.current = requestAnimationFrame(animate);
                return;
            }

            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easedProgress = easeFn(progress);

            countRef.current = Math.round(easedProgress * endValue);
            setCount(countRef.current);

            if (progress < 1) {
                frameRef.current = requestAnimationFrame(animate);
            }
        };

        frameRef.current = requestAnimationFrame(animate);

        return () => {
            if (frameRef.current) {
                cancelAnimationFrame(frameRef.current);
            }
        };
    }, [isVisible, endValue, duration, delay, easing]);

    return count;
};

/**
 * Hook untuk counter dengan suffix (seperti "700+", "50+", "24/7")
 */
export const useFormattedCounter = (
    value: string,
    isVisible: boolean,
    options: UseCounterAnimationOptions = {}
) => {
    // Parse angka dan suffix dari string
    const match = value.match(/^(\d+)(.*)$/);
    const numericValue = match ? parseInt(match[1], 10) : 0;
    const suffix = match ? match[2] : '';

    const animatedCount = useCounterAnimation(numericValue, isVisible, options);

    return `${animatedCount}${suffix}`;
};

export default useScrollAnimation;
