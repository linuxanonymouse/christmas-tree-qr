import fs from 'fs';
import path from 'path';
import { kv } from '@vercel/kv';

export type GameStatus = 'IDLE' | 'COUNTDOWN' | 'REVEALED';

export type GameState = {
    targetDate: number | null; // Timestamp (Launch Date) of current round
    status: GameStatus;
    winningCodes: string[]; // Base64 strings
    claimedCodes: string[];
    activeQrIndex: number; // Which QR to show (if multiple)
};

const DB_PATH = path.join(process.cwd(), 'game-db.json');
const IS_VERCEL = !!process.env.KV_REST_API_URL;

class GameStorage {
    private defaultState(): GameState {
        return {
            targetDate: null,
            status: 'IDLE',
            winningCodes: [],
            claimedCodes: [],
            activeQrIndex: 0
        };
    }

    async getSnapshot(): Promise<GameState> {
        let state: GameState;

        if (IS_VERCEL) {
            try {
                const data = await kv.get<GameState>('game_state');
                state = data || this.defaultState();
            } catch (e) {
                console.error("Failed to load from KV", e);
                state = this.defaultState();
            }
        } else {
            try {
                if (fs.existsSync(DB_PATH)) {
                    const data = fs.readFileSync(DB_PATH, 'utf-8');
                    state = JSON.parse(data);
                } else {
                    state = this.defaultState();
                }
            } catch (e) {
                console.error("Failed to load from Disk", e);
                state = this.defaultState();
            }
        }

        // Sanitize
        state = { ...this.defaultState(), ...state };
        if (typeof state.activeQrIndex !== 'number' || isNaN(state.activeQrIndex)) {
            state.activeQrIndex = 0;
        }

        // Handle auto-transition from COUNTDOWN to REVEALED
        if (state.status === 'COUNTDOWN' && state.targetDate && Date.now() >= state.targetDate) {
            state.status = 'REVEALED';
            await this.save(state);
        }

        return state;
    }

    private async save(state: GameState) {
        if (IS_VERCEL) {
            try {
                await kv.set('game_state', state);
            } catch (e) {
                console.error("Failed to save to KV", e);
            }
        } else {
            try {
                fs.writeFileSync(DB_PATH, JSON.stringify(state, null, 2));
            } catch (e) {
                console.error("Failed to save to Disk", e);
            }
        }
    }

    async update(updates: any) {
        const currentState = await this.getSnapshot();

        // Logical copy
        let newState: GameState = { ...currentState };

        // Handle the user's preferred "addCode" / "removeCode" shorthand if they keep sending it
        if (updates.addCode) {
            if (!newState.winningCodes.includes(updates.addCode)) {
                newState.winningCodes = [...newState.winningCodes, updates.addCode];
            }
        }
        if (updates.removeCode) {
            newState.winningCodes = newState.winningCodes.filter(c => c !== updates.removeCode);
        }

        // Core field updates
        if (updates.status !== undefined) newState.status = updates.status;
        if (updates.targetDate !== undefined) newState.targetDate = updates.targetDate;
        if (updates.claimedCodes !== undefined) newState.claimedCodes = updates.claimedCodes;
        if (updates.winningCodes !== undefined) newState.winningCodes = updates.winningCodes;

        if (updates.activeQrIndex !== undefined) {
            const index = Number(updates.activeQrIndex);
            newState.activeQrIndex = isNaN(index) ? 0 : index;
        }

        // Auto-status logic
        if (updates.targetDate !== undefined) {
            if (updates.targetDate === null) {
                if (!updates.status) newState.status = 'IDLE';
            } else if (Date.now() < updates.targetDate) {
                newState.status = 'COUNTDOWN';
            }
        }

        await this.save(newState);
        return newState;
    }

    async attemptClaim(code: string): Promise<{ success: boolean; message: string }> {
        const state = await this.getSnapshot();
        const activeCode = state.winningCodes[state.activeQrIndex];

        if (code !== activeCode) {
            return { success: false, message: 'This code is expired or invalid for the current round.' };
        }

        if (state.claimedCodes.includes(code)) {
            return { success: false, message: 'This code has already been claimed!' };
        }

        state.claimedCodes = [...state.claimedCodes, code];
        await this.save(state);

        return { success: true, message: 'Congratulations! You won a prize!' };
    }
}

export const storage = new GameStorage();
