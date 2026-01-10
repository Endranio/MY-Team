import React, { ReactNode } from 'react';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { cn } from '@/lib/utils';

type AnimationType =
    | 'fade-up'
    | 'fade-down'
    | 'fade-left'
    | 'fade-right'
    | 'scale-in'
    | 'blur-in'
    | 'zoom-fade';

// Batasi hanya ke elemen HTML yang umum digunakan untuk section/container
type AllowedElements = 'div' | 'section' | 'article' | 'aside' | 'main' | 'header' | 'footer' | 'nav' | 'span';

interface AnimatedSectionProps {
    children: ReactNode;
    animation?: AnimationType;
    delay?: number;
    className?: string;
    as?: AllowedElements;
    threshold?: number;
    speed?: 'fast' | 'normal' | 'slow';
}

/**
 * AnimatedSection - Wrapper component untuk animasi scroll-reveal
 * Best Practice: Menggunakan Intersection Observer untuk performa optimal
 */
const AnimatedSection: React.FC<AnimatedSectionProps> = ({
    children,
    animation = 'fade-up',
    delay = 0,
    className = '',
    as = 'div',
    threshold = 0.1,
    speed = 'normal',
}) => {
    const { ref, isVisible } = useScrollAnimation<HTMLElement>({ threshold });

    const animationClass = `animate-${animation}`;
    const speedClass = speed === 'fast' ? 'scroll-animate-fast' : speed === 'slow' ? 'scroll-animate-slow' : '';

    return React.createElement(
        as,
        {
            ref: ref,
            className: cn(
                'scroll-animate',
                animationClass,
                speedClass,
                isVisible && 'is-visible',
                className
            ),
            style: { transitionDelay: delay ? `${delay}ms` : undefined }
        },
        children
    );
};

export default AnimatedSection;
