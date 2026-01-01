'use client';
import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';

export default function ClaimPrize() {
    const params = useParams();
    const code = params.code as string;
    const [decoded, setDecoded] = useState<string>('');

    // On mount, just show confetti
    useEffect(() => {
        confetti({
            particleCount: 150,
            spread: 70,
            origin: { y: 0.6 }
        });

        // Try to decode just for our reference or if we want to show it, but user asked to SHOW ENCODED
        // Actually user said: "TELL THEM ITS BASE64 ENCODE YOU NEED TO DECODE IT"
        // So we won't show the decoded value, just the encoded one.
    }, []);

    return (
        <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-gradient-to-br from-green-900 to-red-900">
            {/* Snowflakes */}
            <div className="snowflakes pointer-events-none">
                {[...Array(10)].map((_, i) => (
                    <div key={i} className="snowflake">❅</div>
                ))}
            </div>

            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-white text-black max-w-lg w-full p-8 rounded-3xl shadow-2xl text-center z-10 border-4 border-[#ffb63c]"
            >
                <h1 className="text-4xl md:text-5xl font-[family-name:var(--font-berkshire)] text-[#156f3d] mb-6 drop-shadow-sm">
                    Merry Christmas!
                </h1>

                <div className="text-6xl mb-6 animate-bounce">🎁</div>

                <p className="text-lg font-bold text-gray-700 mb-2">You have found a secret treasure!</p>
                <p className="text-gray-600 mb-6">But wait... it's encrypted!</p>

                <div className="bg-gray-100 p-6 rounded-xl border-2 border-dashed border-gray-400 mb-6 relative">
                    <p className="text-xs text-gray-400 uppercase font-bold mb-2 tracking-wider">Your Secret Code</p>
                    <code className="block text-2xl md:text-3xl font-mono font-bold text-[#bf1e2e] break-all select-all">
                        {decodeURIComponent(code)}
                    </code>
                    <p className="text-xs text-blue-500 mt-2 italic">(Tap text to copy)</p>
                </div>

                <div className="space-y-4">
                    <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200 text-left text-sm">
                        <p className="font-bold text-yellow-800 mb-1">🎅 Santa's Instruction:</p>
                        <ul className="list-disc list-inside text-gray-700 space-y-1">
                            <li>This code is <strong>Base64 Encoded</strong>.</li>
                            <li>Go to a Base64 Decoder (search online).</li>
                            <li>Decode this string to reveal your prize!</li>
                        </ul>
                    </div>
                </div>

                <button
                    onClick={() => navigator.clipboard.writeText(decodeURIComponent(code))}
                    className="mt-8 w-full bg-[#bf1e2e] hover:bg-[#a01825] text-white px-6 py-3 rounded-full font-bold transition-transform transform hover:scale-105 shadow-lg"
                >
                    Copy Code
                </button>
            </motion.div>
        </div>
    );
}
