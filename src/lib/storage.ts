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
                return {
                    targetDate: parsed.targetDate ?? null,
                    status: parsed.status ?? 'IDLE',
                    winningCodes: Array.isArray(parsed.winningCodes) ? parsed.winningCodes : [],
                    claimedCodes: Array.isArray(parsed.claimedCodes) ? parsed.claimedCodes : [],
                    activeQrIndex: typeof parsed.activeQrIndex === 'number' ? parsed.activeQrIndex : 0
                };
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

        // Start with current state and apply specific logic for code additions/removals
        let winningCodes = [...currentState.winningCodes];
        let activeQrIndex = currentState.activeQrIndex;
        let claimedCodes = [...currentState.claimedCodes];
        let status = currentState.status;
        let targetDate = currentState.targetDate;

        if (updates.addCode) {
            if (!winningCodes.includes(updates.addCode)) {
                winningCodes.push(updates.addCode);
            }
        }

        if (updates.removeCode) {
            const indexToRemove = winningCodes.indexOf(updates.removeCode);
            if (indexToRemove !== -1) {
                winningCodes = winningCodes.filter(c => c !== updates.removeCode);
                // Adjust index if we removed the current round or something before it
                if (indexToRemove <= activeQrIndex) {
                    activeQrIndex = Math.max(0, activeQrIndex - 1);
                }
            }
        }

        // Apply standard updates if provided
        if (updates.status !== undefined) status = updates.status;
        if (updates.targetDate !== undefined) targetDate = updates.targetDate;
        if (updates.activeQrIndex !== undefined) {
            const index = Number(updates.activeQrIndex);
            activeQrIndex = isNaN(index) ? 0 : index;
        }
        if (updates.claimedCodes !== undefined) claimedCodes = updates.claimedCodes;
        if (updates.winningCodes !== undefined) winningCodes = updates.winningCodes;

        // Auto-status logic based on targetDate
        if (updates.targetDate !== undefined) {
            if (updates.targetDate === null) {
                if (!updates.status) status = 'IDLE';
            } else if (Date.now() < updates.targetDate) {
                status = 'COUNTDOWN';
            }
        }

        const newState: GameState = {
            targetDate,
            status,
            winningCodes,
            claimedCodes,
            activeQrIndex
        };

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
