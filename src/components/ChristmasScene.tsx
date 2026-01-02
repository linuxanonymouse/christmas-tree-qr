'use client';

import React, { useEffect, useState } from 'react';
import Reindeer from './Reindeer';
import Countdown from './Countdown';
import QRCode from 'qrcode';
import { motion, AnimatePresence } from 'framer-motion';

const ChristmasScene: React.FC = () => {
    const [lightsCount, setLightsCount] = useState(0);
    const [gameState, setGameState] = useState<{ targetDate: number; hasEnded?: boolean; status?: string } | null>(null);
    const [qrCodeData, setQrCodeData] = useState<string | null>(null);
    const [showQr, setShowQr] = useState(false);

    useEffect(() => {
        const fetchState = () => {
            fetch('/api/game-state')
                .then(res => res.json())
                .then(data => {
                    if (JSON.stringify(data) !== JSON.stringify(gameState)) {
                        setGameState(data);
                        if (data.status === 'IDLE' || data.status === 'COUNTDOWN') {
                            setShowQr(false);
                            setQrCodeData(null);
                        }
                        if (data.status === 'REVEALED' && !qrCodeData) {
                            fetchQrCoordinates();
                        }
                        setLightsCount(Math.ceil(window.innerWidth / 50));
                    }
                });
        };
        fetchState();
        const interval = setInterval(fetchState, 4000);
        return () => clearInterval(interval);
    }, [qrCodeData, gameState]);

    const fetchQrCoordinates = async () => {
        try {
            const res = await fetch('/api/get-qr');
            if (res.status === 403) return;
            const data = await res.json();
            if (data.code) {
                const claimUrl = `${window.location.origin}/claim/${data.code}`;
                const qrImage = await QRCode.toDataURL(claimUrl, { width: 300, margin: 2, color: { dark: '#711723', light: '#ffffff' } });
                setQrCodeData(qrImage);
                setShowQr(true);
            } else if (data.error) {
                setQrCodeData(null);
                alert(`Santa's Bag is Empty!\n${data.error}\n(${data.debug || 'Check Admin'})`);
            }
        } catch (err) {
            console.error("Failed to load QR", err);
        }
    };

    const handleCountdownComplete = () => {
        fetchQrCoordinates();
    };

    return (
        <div className="relative h-screen w-full overflow-hidden flex flex-col">
            {/* Santa Flying Background */}
            <div className="santa-container fixed inset-0 pointer-events-none z-0">
                <svg viewBox="0 0 350 400" className="w-[350px] h-[400px]">
                    <g className="plane">
                        <rect x="215.747" y="157.738" width="25.511" height="43.645" rx="12.755" ry="12.755" fill="#711723" />
                        <path fill="#f40009" d="M166.263 185.401h74.995v31.965h-74.995zM166.263 217.366h74.995a31.965 31.965 0 01-31.965 31.965h-43.03v-31.965z" />
                        <g className="hand">
                            <rect x="136.437" y="152.836" width="26.365" height="9.113" rx="4.557" ry="4.557" transform="rotate(-120 149.62 157.393)" fill="#f6bfb1" />
                            <path fill="#f40009" d="M144.906 163.746l11.978-6.916 20.407 35.346-11.978 6.916z" />
                            <rect x="139.226" y="154.214" width="20.172" height="6.973" rx="3.486" ry="3.486" transform="rotate(-30 149.312 157.7)" fill="#e6e6e6" />
                        </g>
                        <path fill="#f6bfb1" d="M171.488 155.28h37.805v23.974h-37.805z" />
                        <path d="M165.956 185.093v64.545h-12.602v-.024c-.406.015-.818.024-1.23.024a32.272 32.272 0 110-64.545c.412 0 .824.01 1.23.025v-.025z" fill="#711723" />
                        <path fill="#300403" d="M161.345 185.093h4.918v64.545h-4.918z" />
                        <path d="M113.376 210.296v11.987h-2.34v-.004a6.053 6.053 0 01-.23.004 5.993 5.993 0 110-11.987c.077 0 .154.002.23.005v-.005z" fill="#f40009" />
                        <g fill="#300403">
                            <circle cx="155.505" cy="244.106" r="2.459" />
                            <circle cx="155.505" cy="190.933" r="2.459" />
                            <circle cx="155.505" cy="208.452" r="2.459" />
                            <circle cx="155.505" cy="226.586" r="2.459" />
                        </g>
                        <rect className="blade" x="113.244" y="167.266" width="6.762" height="98.354" rx="3.381" ry="3.381" fill="#300403" />
                        <path d="M195.154 211.526h34.732a4.918 4.918 0 014.917 4.918 4.918 4.918 0 01-4.917 4.917h-34.732a4.918 4.918 0 01-4.917-4.917 4.918 4.918 0 014.917-4.918z" fill="#711723" />
                        <g fill="#fff">
                            <rect x="174.148" y="171.282" width="15.925" height="40.192" rx="7.963" ry="7.963" />
                            <rect x="188.824" y="171.282" width="15.925" height="40.192" rx="7.963" ry="7.963" />
                            <rect x="180.862" y="167.691" width="15.925" height="51.21" rx="7.963" ry="7.963" transform="rotate(-90 188.824 193.296)" />
                            <path d="M161.55 180.896a7.963 7.963 0 016.42-9.252l20.066-3.625a7.963 7.963 0 019.251 6.42 7.963 7.963 0 01-6.42 9.251l-20.066 3.626a7.963 7.963 0 01-9.251-6.42z" />
                            <path d="M183.122 174.543a7.963 7.963 0 019.251-6.42l19.491 3.521a7.963 7.963 0 016.42 9.252 7.963 7.963 0 01-9.251 6.42l-19.491-3.522a7.963 7.963 0 01-6.42-9.25z" />
                        </g>
                        <rect x="167.185" y="151.899" width="6.455" height="27.355" rx="3.227" ry="3.227" fill="#711723" />
                        <rect x="207.449" y="151.899" width="6.455" height="27.355" rx="3.227" ry="3.227" fill="#711723" />
                        <circle cx="190.083" cy="165.883" r="3.842" fill="#e76160" />
                        <circle cx="190.083" cy="179.868" r="6.454" />
                        <path fill="#f40009" d="M167.185 148.21h46.718v7.069h-46.718zM213.903 145.137h-46.718a10.757 10.757 0 0110.757-10.758h25.204a10.757 10.757 0 0110.757 10.758z" />
                        <path fill="#711723" d="M167.185 143.907h46.718v4.303h-46.718z" />
                        <circle cx="181.016" cy="146.059" r="7.377" fill="#711723" />
                        <circle cx="181.016" cy="146.059" r="5.62" fill="#300403" />
                        <circle cx="200.072" cy="146.059" r="7.377" fill="#711723" />
                        <circle cx="200.072" cy="146.059" r="5.62" fill="#300403" />
                        <path d="M176.713 165.422s2.459-3.995 6.454 0M197.306 165.422s2.459-3.995 6.454 0" fill="none" stroke="#000" strokeMiterlimit="10" strokeWidth="1.844" />
                    </g>
                </svg>
            </div>

            {/* Snowflakes */}
            <div className="snowflakes pointer-events-none">
                {[...Array(10)].map((_, i) => (
                    <div key={i} className="snowflake">❅</div>
                ))}
            </div>

            {/* Light Rope */}
            <ul className="lightrope fixed top-0 w-full z-10">
                {[...Array(lightsCount)].map((_, i) => (
                    <li key={i}></li>
                ))}
            </ul>

            {/* Title Area */}
            <div className="relative z-50 pt-8 md:pt-12 px-4 flex flex-col items-center flex-shrink-0">
                <h1 className="font-[family-name:var(--font-berkshire)] text-4xl sm:text-6xl md:text-8xl text-center drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)] text-white">
                    Merry Christmas!
                </h1>
            </div>

            {/* Main Stage (Flexible centered area for Tree & Reindeer) */}
            <div className="flex-1 relative flex items-center justify-center min-h-0 overflow-hidden">
                <div className="relative scale-[0.55] sm:scale-[0.8] md:scale-[0.9] lg:scale-100 transition-all duration-300 origin-center flex items-center justify-center">
                    <div className="relative w-[300px] h-[475px]">
                        {/* Reindeer - SNUGLY attached to the tree */}
                        <div className="absolute bottom-[20px] left-[-110px] z-20 hover:scale-105 transition-transform cursor-pointer">
                            <Reindeer />
                        </div>

                        {/* Tree Container */}
                        <div className="tree-container relative z-10 w-full h-full">
                            <div className="tree w-full h-full">
                                <div className="star"></div>
                                <div className="cone tree-cone1"></div>
                                <div className="cone tree-cone2"></div>
                                <div className="cone tree-cone3"></div>
                                <div className="trunk"></div>
                                <div className="ornament or1"><div className="shine" /></div>
                                <div className="ornament or2"><div className="shine" /></div>
                                <div className="ornament or3"><div className="shine" /></div>
                                <div className="ornament or4"><div className="shine" /></div>
                                <div className="ornament or5"><div className="shine" /></div>
                                <div className="ornament or6"><div className="shine" /></div>
                                <div className="bells-container">
                                    <div className="bell bell1"><div className="bell-top" /><div className="bell-bottom" /><div className="bell-mid" /></div>
                                    <div className="bell bell2"><div className="bell-top" /><div className="bell-bottom" /><div className="bell-mid" /></div>
                                    <div className="bow"><div className="b1" /><div className="b2" /><div className="b3" /></div>
                                </div>
                            </div>
                            <div className="gift" />
                            <div className="ribbon" />
                            <div className="gift2" />
                            <div className="ribbon2" />
                            <div className="shadow" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer Area (Countdown & QR) */}
            <div className="relative z-[100] pb-6 md:pb-10 flex flex-col items-center flex-shrink-0">
                {gameState && !showQr && gameState.status === 'COUNTDOWN' && (
                    <div className="scale-90 md:scale-100">
                        <Countdown targetDate={gameState.targetDate} onComplete={handleCountdownComplete} />
                    </div>
                )}
            </div>

            {/* QR Modal Overlay */}
            <AnimatePresence>
                {showQr && qrCodeData && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white/95 backdrop-blur-md p-8 rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.5)] z-[1000] text-center max-w-sm w-[90%] border-4 border-[#711723]"
                    >
                        <h2 className="text-[#bf1e2e] text-3xl font-[family-name:var(--font-berkshire)] mb-4">Scan for a Surprise!</h2>
                        <div className="bg-white p-2 rounded-xl inline-block shadow-inner mb-4">
                            <img src={qrCodeData} alt="Secret QR Code" className="w-full h-auto rounded" />
                        </div>
                        <p className="text-gray-700 font-bold mb-6">The countdown has ended!</p>
                        <button
                            onClick={() => setShowQr(false)}
                            className="w-full bg-[#156f3d] hover:bg-[#0f522e] text-white px-8 py-3 rounded-full font-bold text-lg transition-all active:scale-95 shadow-lg"
                        >
                            Close
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ChristmasScene;
