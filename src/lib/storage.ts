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
    private state: GameState;

    constructor() {
        this.state = this.load();
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

    private save() {
        try {
            fs.writeFileSync(DB_PATH, JSON.stringify(this.state, null, 2));
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

    // Check for auto-transitions before returning state
    get State() {
        if (this.state.status === 'COUNTDOWN' && this.state.targetDate && Date.now() >= this.state.targetDate) {
            this.state.status = 'REVEALED';
            this.save(); // Persist the transition!
        }
        return this.state;
    }

    update(newState: Partial<GameState>) {
        if (newState.targetDate !== undefined) {
            if (newState.targetDate === null) {
                // Reset
                if (!newState.status) this.state.status = 'IDLE';
            } else if (Date.now() < newState.targetDate) {
                this.state.status = 'COUNTDOWN';
            }
        }

        // Sanitize activeQrIndex
        if (newState.activeQrIndex !== undefined) {
            const index = Number(newState.activeQrIndex);
            this.state.activeQrIndex = isNaN(index) ? 0 : index;
        }

        const { activeQrIndex, ...otherUpdates } = newState;
        this.state = { ...this.state, ...otherUpdates };
        this.save();
    }

    attemptClaim(code: string): { success: boolean; message: string } {
        const activeCode = this.state.winningCodes[this.state.activeQrIndex];

        if (code !== activeCode) {
            return { success: false, message: 'This code is expired or invalid for the current round.' };
        }

        if (this.state.claimedCodes.includes(code)) {
            return { success: false, message: 'This code has already been claimed!' };
        }

        // Mark as claimed
        this.state = {
            ...this.state,
            claimedCodes: [...this.state.claimedCodes, code]
        };
        this.save();

        return { success: true, message: 'Congratulations! You won a prize!' };
    }
}

// NextJS caches modules, so this singleton persists in dev/prod usually (until restart)
// For a real app, use a database.
const globalForStorage = global as unknown as { storage: GameStorage };

export const storage = globalForStorage.storage || new GameStorage();

if (process.env.NODE_ENV !== 'production') globalForStorage.storage = storage;
