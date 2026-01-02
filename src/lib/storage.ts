import fs from 'fs';
import path from 'path';

export type GameStatus = 'IDLE' | 'COUNTDOWN' | 'REVEALED';

export type GameState = {
    targetDate: number | null; // Timestamp (Launch Date) of current round
    status: GameStatus;
    winningCodes: string[]; // Base64 strings
    claimedCodes: string[];
    activeQrIndex: number; // Which QR to show (if multiple)
};

const DB_PATH = path.join(process.cwd(), 'game-db.json');

class GameStorage {
    constructor() {
        // Just ensure file exists on startup
        this.load();
    }

    private load(): GameState {
        try {
            if (fs.existsSync(DB_PATH)) {
                const data = fs.readFileSync(DB_PATH, 'utf-8');
                const parsed = JSON.parse(data);
                // Ensure activeQrIndex is a number
                if (typeof parsed.activeQrIndex !== 'number' || isNaN(parsed.activeQrIndex)) {
                    parsed.activeQrIndex = 0;
                }
                return { ...this.defaultState(), ...parsed };
            }
        } catch (e) {
            console.error("Failed to load DB", e);
        }
        return this.defaultState();
    }

    private save(state: GameState) {
        try {
            fs.writeFileSync(DB_PATH, JSON.stringify(state, null, 2));
        } catch (e) {
            console.error("Failed to save DB", e);
        }
    }

    private defaultState(): GameState {
        return {
            targetDate: null,
            status: 'IDLE',
            winningCodes: [],
            claimedCodes: [],
            activeQrIndex: 0
        };
    }

    // Always reload from disk to ensure we have the freshest data
    get State() {
        const state = this.load();
        if (state.status === 'COUNTDOWN' && state.targetDate && Date.now() >= state.targetDate) {
            state.status = 'REVEALED';
            this.save(state); // Persist the transition!
        }
        return state;
    }

    update(updates: any) {
        // RELOAD FIRST to prevent overwriting newer disk data with stale memory
        const currentState = this.load();
        let newState = { ...currentState };

        // Handle Atomic List Updates first (to prevent stale array overwrites)
        if (updates.addCode) {
            if (!newState.winningCodes.includes(updates.addCode)) {
                newState.winningCodes = [...newState.winningCodes, updates.addCode];
            }
        }

        if (updates.removeCode) {
            const indexToRemove = newState.winningCodes.indexOf(updates.removeCode);
            if (indexToRemove !== -1) {
                newState.winningCodes = newState.winningCodes.filter(c => c !== updates.removeCode);
                // Adjust index if we removed the current round or something before it
                if (indexToRemove <= newState.activeQrIndex) {
                    newState.activeQrIndex = Math.max(0, newState.activeQrIndex - 1);
                }
            }
        }

        // Apply standard updates
        const { addCode, removeCode, ...standardUpdates } = updates;
        newState = { ...newState, ...standardUpdates };

        // Auto-status logic based on targetDate
        if (standardUpdates.targetDate !== undefined) {
            if (standardUpdates.targetDate === null) {
                if (!standardUpdates.status) newState.status = 'IDLE';
            } else if (Date.now() < standardUpdates.targetDate) {
                newState.status = 'COUNTDOWN';
            }
        }

        // Sanitize activeQrIndex if directly provided
        if (standardUpdates.activeQrIndex !== undefined) {
            const index = Number(standardUpdates.activeQrIndex);
            newState.activeQrIndex = isNaN(index) ? 0 : index;
        }

        this.save(newState);
    }

    attemptClaim(code: string): { success: boolean; message: string } {
        // RELOAD FIRST
        const state = this.load();
        const activeCode = state.winningCodes[state.activeQrIndex];

        if (code !== activeCode) {
            return { success: false, message: 'This code is expired or invalid for the current round.' };
        }

        if (state.claimedCodes.includes(code)) {
            return { success: false, message: 'This code has already been claimed!' };
        }

        // Mark as claimed
        state.claimedCodes = [...state.claimedCodes, code];
        this.save(state);

        return { success: true, message: 'Congratulations! You won a prize!' };
    }
}

// NextJS caches modules, so this singleton persists in dev/prod usually (until restart)
// For a real app, use a database.
const globalForStorage = global as unknown as { storage: GameStorage };

export const storage = globalForStorage.storage || new GameStorage();

if (process.env.NODE_ENV !== 'production') globalForStorage.storage = storage;
