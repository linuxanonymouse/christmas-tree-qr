'use client';

import React, { useState, useEffect } from 'react';

// Admin Key for demo. In real app, use auth cookie/session.
const DEFAULT_KEY = '';

export default function AdminPage() {
    const [key, setKey] = useState(DEFAULT_KEY);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [state, setState] = useState<any>(null);
    const [newCode, setNewCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Check login
    const login = async (pass: string) => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/config', {
                headers: { 'x-admin-key': pass }
            });
            if (res.ok) {
                setIsLoggedIn(true);
                setKey(pass);
                const data = await res.json();
                setState(data);
            } else {
                alert('Invalid Password');
            }
        } catch (e) {
            alert('Error connecting');
        }
        setLoading(false);
    };

    const refreshState = async (force = false) => {
        if (!key || (isSaving && !force)) return;
        try {
            const res = await fetch(`/api/admin/config?t=${Date.now()}`, {
                headers: { 'x-admin-key': key },
                cache: 'no-store'
            });
            if (res.ok) {
                const data = await res.json();
                setState(data);
            }
        } catch (e) {
            console.error("Refresh failed", e);
        }
    };

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isLoggedIn) {
            refreshState(true);
            interval = setInterval(() => refreshState(false), 3000);
        }
        return () => clearInterval(interval);
    }, [isLoggedIn, key, isSaving]);

    const updateState = async (updates: any) => {
        setLoading(true);
        setIsSaving(true);
        try {
            const res = await fetch(`/api/admin/config?t=${Date.now()}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-admin-key': key
                },
                body: JSON.stringify(updates),
                cache: 'no-store'
            });
            const data = await res.json();
            if (res.ok && data.state) {
                setState(data.state);
            } else {
                alert(`Save Failed: ${data.error || 'Unknown Error'}`);
                // Refresh to recover correct state
                await refreshState(true);
            }
        } catch (e) {
            alert('Network Error while saving');
        } finally {
            setLoading(false);
            setIsSaving(false);
        }
    };

    const addWinningCode = async () => {
        if (!newCode) return;
        // Encode to base64
        const b64 = btoa(newCode);
        await updateState({ addCode: b64 });
        setNewCode('');
    };

    const removeCode = async (codeToRemove: string) => {
        await updateState({ removeCode: codeToRemove });
    };

    const setEndTimeNow = () => {
        // Set to 5 seconds from now
        updateState({ targetDate: Date.now() + 5000 });
    };

    const resetGame = () => {
        // Christmas next year
        const now = new Date();
        const xmas = new Date(now.getFullYear(), 11, 25).getTime();
        updateState({ targetDate: xmas, claimedCodes: [], activeQrIndex: 0, status: 'IDLE' });
    };

    if (!isLoggedIn) {
        return (
            <div className="min-h-screen bg-black text-white flex items-center justify-center">
                <div className="p-8 border border-red-800 rounded-xl bg-gray-900 shadow-2xl w-full max-w-sm">
                    <h1 className="text-3xl mb-6 text-red-500 font-bold text-center">🎅 Admin Portal</h1>
                    <div className="space-y-4">
                        <input
                            type="password"
                            placeholder="Secret Password"
                            className="p-3 w-full bg-gray-800 border border-gray-700 rounded text-white focus:outline-none focus:border-red-500 transition-colors"
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') login(e.currentTarget.value);
                            }}
                            autoFocus
                        />
                        <button
                            className="w-full bg-red-600 hover:bg-red-700 p-3 rounded font-bold transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                            onClick={(e) => {
                                const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                                login(input.value);
                            }}
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    Verifying...
                                </>
                            ) : (
                                'Enter Workshop'
                            )}
                        </button>
                    </div>
                    <p className="mt-4 text-xs text-center text-gray-500">Hint: I'm just kidding no hints</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-900 text-white p-8">
            <div className="max-w-4xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-red-500">🎅 Admin Dashboard</h1>
                    <button onClick={() => setIsLoggedIn(false)} className="text-gray-400 hover:text-white">Logout</button>
                </div>

                {state && (
                    <div className="grid gap-6">
                        {/* Game Control */}
                        {/* Game Control */}
                        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                            <h2 className="text-xl font-bold mb-4">Game Control</h2>
                            <div className="flex flex-col gap-6">

                                <div className="flex flex-col sm:flex-row gap-4 items-stretch">
                                    {/* Status Indicator */}
                                    <div className="bg-black/20 p-4 rounded-lg flex-1 border border-gray-700 relative">
                                        <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-green-500 animate-pulse" title="Live Updates Active"></div>
                                        <label className="block text-gray-400 text-xs uppercase font-bold mb-2">Current Status</label>
                                        <div className={`text-2xl font-bold ${state.status === 'REVEALED' ? 'text-green-400' : state.status === 'COUNTDOWN' ? 'text-blue-400' : 'text-gray-400'}`}>
                                            {state.status || 'IDLE'}
                                        </div>
                                        {state.targetDate && state.status === 'COUNTDOWN' && (
                                            <div className="text-sm text-gray-500 mt-1 font-mono">
                                                Target: {new Date(state.targetDate).toLocaleTimeString()}
                                            </div>
                                        )}
                                    </div>

                                    {/* Round Indicator & Editor */}
                                    <div className="bg-black/20 p-4 rounded-lg flex-1 border border-gray-700">
                                        <label className="block text-gray-400 text-xs uppercase font-bold mb-2">Current Round</label>
                                        <div className="flex items-center flex-wrap gap-2">
                                            <span className="text-xl font-bold">#</span>
                                            <input
                                                type="number"
                                                className="bg-gray-900 border border-gray-600 rounded p-1 w-16 text-center font-bold text-lg"
                                                value={state.activeQrIndex !== null && state.activeQrIndex !== undefined ? state.activeQrIndex + 1 : 1}
                                                onChange={(e) => {
                                                    const val = parseInt(e.target.value);
                                                    if (!isNaN(val)) {
                                                        updateState({ activeQrIndex: Math.max(0, val - 1) });
                                                    }
                                                }}
                                            />
                                            <span className="text-gray-500 font-bold">/ {(state.winningCodes?.length || 0)}</span>

                                            {/* Warning if index >= length */}
                                            {state.activeQrIndex >= (state.winningCodes?.length || 0) && (
                                                <button
                                                    onClick={() => updateState({ activeQrIndex: 0 })}
                                                    className="ml-2 text-xs bg-red-600 px-2 py-1 rounded hover:bg-red-500 animate-pulse"
                                                    title="Round Index exceeds available codes!"
                                                >
                                                    Reset to 1
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="border-t border-gray-700 pt-6 flex flex-col sm:flex-row flex-wrap gap-4">
                                    {state.status === 'IDLE' && (
                                        <div className="flex items-center gap-2 bg-gray-700/50 p-2 rounded-lg w-full sm:w-auto">
                                            <input
                                                type="number"
                                                placeholder="Mins"
                                                defaultValue="5"
                                                className="w-16 sm:w-20 bg-gray-900 border border-gray-600 p-2 rounded text-white text-center font-bold"
                                                id="minutesInput"
                                            />
                                            <button
                                                onClick={(e) => {
                                                    const input = document.getElementById('minutesInput') as HTMLInputElement;
                                                    const mins = parseFloat(input.value) || 0.1; // Default to very short if 0
                                                    const target = Date.now() + (mins * 60 * 1000);
                                                    updateState({ targetDate: target, status: 'COUNTDOWN' });
                                                }}
                                                className="flex-1 sm:px-6 py-2 bg-green-600 hover:bg-green-500 rounded font-bold transition-all"
                                            >
                                                Start Countdown
                                            </button>
                                        </div>
                                    )}

                                    {state.status === 'COUNTDOWN' && (
                                        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                                            <button
                                                onClick={setEndTimeNow}
                                                className="px-6 py-2 bg-yellow-600 hover:bg-yellow-700 rounded font-bold transition-transform hover:scale-105"
                                            >
                                                End Immediately (Test)
                                            </button>
                                            <button
                                                onClick={() => updateState({ status: 'IDLE', targetDate: null })}
                                                className="px-6 py-2 bg-red-600 hover:bg-red-700 rounded font-bold"
                                            >
                                                Abort Countdown
                                            </button>
                                        </div>
                                    )}

                                    {state.status === 'REVEALED' && (
                                        <button
                                            onClick={() => {
                                                const nextIndex = (state.activeQrIndex || 0) + 1;
                                                updateState({
                                                    activeQrIndex: nextIndex,
                                                    targetDate: null,
                                                    status: 'IDLE'
                                                });
                                            }}
                                            className="w-full sm:w-auto px-8 py-3 bg-purple-600 hover:bg-purple-500 rounded font-bold shadow-lg text-lg animate-pulse"
                                        >
                                            Start Next Round &rarr;
                                        </button>
                                    )}

                                    <button onClick={resetGame} className="w-full sm:w-auto px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded text-sm font-bold sm:ml-auto">
                                        Reset Game State
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Winning Codes */}
                        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                            <h2 className="text-xl font-bold mb-4">Winning Codes</h2>
                            <div className="flex flex-col sm:flex-row gap-2 mb-6">
                                <input
                                    value={newCode}
                                    onChange={e => setNewCode(e.target.value)}
                                    placeholder="Enter prize key"
                                    className="flex-1 p-2 bg-gray-900 border border-gray-600 rounded text-white min-w-0"
                                />
                                <button onClick={addWinningCode} className="px-6 py-2 bg-green-600 hover:bg-green-700 rounded font-bold whitespace-nowrap">
                                    Add Code
                                </button>
                            </div>

                            <div className="space-y-2">
                                {state.winningCodes.map((code: string, i: number) => {
                                    const decoded = atob(code);
                                    const isClaimed = state.claimedCodes.includes(code);
                                    const isActive = i === state.activeQrIndex;

                                    return (
                                        <div key={i} className={`flex justify-between items-center p-3 rounded border ${isActive ? 'bg-purple-900 border-purple-500 shadow-xl scale-105' : 'bg-gray-900 border-transparent opacity-80'}`}>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-mono text-lg font-bold mr-3">{decoded}</span>
                                                    {isActive && <span className="bg-purple-600 text-xs px-2 py-0.5 rounded-full font-bold animate-pulse">ACTIVE ROUND</span>}
                                                </div>
                                                <span className="text-xs text-gray-500 font-mono">({code})</span>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                {isClaimed ? (
                                                    <span className="text-red-500 font-bold px-2 py-1 bg-red-900/20 rounded">CLAIMED</span>
                                                ) : (
                                                    <span className="text-green-500 text-sm">Available</span>
                                                )}
                                                <button
                                                    onClick={() => removeCode(code)}
                                                    className="text-red-400 hover:text-red-300"
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                                {state.winningCodes.length === 0 && (
                                    <p className="text-gray-500 text-center py-4">No winning codes added yet.</p>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
