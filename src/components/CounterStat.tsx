import React from 'react';
import { useScrollAnimation, useCounterAnimation } from '@/hooks/useScrollAnimation';
import { cn } from '@/lib/utils';

interface CounterStatProps {
    value: number;
    suffix?: string;
    label: string;
    delay?: number;
    duration?: number;
    className?: string;
}

/**
 * CounterStat - Komponen untuk menampilkan angka dengan animasi counting
 * Best practice: Menggunakan requestAnimationFrame untuk animasi yang smooth
 */
const CounterStat: React.FC<CounterStatProps> = ({
    value,
    suffix = '',
    label,
    delay = 0,
    duration = 2000,
    className = '',
}) => {
    const { ref, isVisible } = useScrollAnimation<HTMLDivElement>({ threshold: 0.3 });
    const animatedValue = useCounterAnimation(value, isVisible, {
        duration,
        delay,
        easing: 'easeOut'
    });

    return (
        <div
            ref={ref}
            className={cn(
                "text-center space-y-1 sm:space-y-2 scroll-animate animate-fade-up",
                isVisible && "is-visible",
                className
            )}
            style={{ transitionDelay: `${delay}ms` }}
        >
            <div className="text-2xl sm:text-4xl font-bold text-primary counter-number">
                {animatedValue}{suffix}
            </div>
            <div className="text-xs sm:text-base text-muted-foreground">{label}</div>
        </div>
    );
};

export default CounterStat;
