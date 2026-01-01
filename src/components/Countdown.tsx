'use client';

import React, { useEffect, useState, useMemo } from 'react';

interface CountdownProps {
    targetDate: number;
    onComplete: () => void;
}

const Countdown: React.FC<CountdownProps> = ({ targetDate, onComplete }) => {
    const [timeLeft, setTimeLeft] = useState(0);
    const [hasEnded, setHasEnded] = useState(false);

    useEffect(() => {
        const interval = setInterval(() => {
            const now = Date.now();
            const diff = targetDate - now;

            if (diff <= 0) {
                clearInterval(interval);
                setTimeLeft(0);
                if (!hasEnded) {
                    setHasEnded(true);
                    onComplete();
                }
            } else {
                setTimeLeft(diff);
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [targetDate, hasEnded, onComplete]);

    const { days, hours, minutes, seconds } = useMemo(() => {
        const d = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
        const h = Math.floor((timeLeft / (1000 * 60 * 60)) % 24);
        const m = Math.floor((timeLeft / 1000 / 60) % 60);
        const s = Math.floor((timeLeft / 1000) % 60);
        return { days: d, hours: h, minutes: m, seconds: s };
    }, [timeLeft]);

    const TimeUnit = ({ value, label }: { value: number; label: string }) => (
        <div className="flex flex-col items-center mx-2">
            <div className="relative bg-[#151515] text-white rounded-lg p-3 w-16 h-20 md:w-20 md:h-24 flex items-center justify-center text-3xl md:text-5xl font-bold shadow-lg border-b-2 border-[#333]">
                {value.toString().padStart(2, '0')}
                <div className="absolute top-1/2 left-0 w-full h-[1px] bg-[#000] opacity-50"></div>
            </div>
            <span className="text-white mt-2 text-sm uppercase font-bold tracking-wider opacity-80">{label}</span>
        </div>
    );

    return (
        <div className="flex justify-center flex-wrap z-50 relative mt-10" id="components-countdown">
            <TimeUnit value={days} label="Days" />
            <TimeUnit value={hours} label="Hours" />
            <TimeUnit value={minutes} label="Minutes" />
            <TimeUnit value={seconds} label="Seconds" />
        </div>
    );
};

export default Countdown;
