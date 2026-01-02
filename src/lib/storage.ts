import fs from 'fs';
import path from 'path';
import { kv } from '@vercel/kv';

export type GameStatus = 'IDLE' | 'COUNTDOWN' | 'REVEALED';

export type GameState = {
    targetDate: number | null; // Timestamp (Launch Date) of current round
    status: GameStatus;
    winningCodes: string[]; // Raw strings (no longer Base64)
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

    async update(updates: Partial<GameState>) {
        const currentState = await this.getSnapshot();

        // Logical copy
        let newState: GameState = {
            ...currentState,
            ...updates
        };

        // Auto-status logic
        if (updates.targetDate !== undefined) {
            if (updates.targetDate === null) {
                if (!updates.status) newState.status = 'IDLE';
            } else if (Date.now() < updates.targetDate) {
                newState.status = 'COUNTDOWN';
            }
        }

        // Sanitize activeQrIndex
        if (updates.activeQrIndex !== undefined) {
            const index = Number(updates.activeQrIndex);
            newState.activeQrIndex = isNaN(index) ? 0 : index;
        }

        await this.save(newState);
        return newState;
    }
}

export const storage = new GameStorage();
