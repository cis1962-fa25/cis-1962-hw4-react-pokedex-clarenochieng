import type { Pokemon, BoxEntry, InsertBoxEntry, UpdateBoxEntry, ApiError } from '../types/types';

const BASE_URL = 'https://hw4.cis1962.esinx.net/api';

export class PokemonAPI {
  private token: string | null = null;

  setToken(token: string): void {
    this.token = token;
  }

  getToken(): string | null {
    return this.token;
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      let errorMessage = 'An error occurred';
      let errorCode = 'UNKNOWN';
      try {
        const error: ApiError = await response.json();
        errorMessage = error.message || errorMessage;
        errorCode = error.code || errorCode;
      } catch {
        const errorText = await response.text();
        errorMessage = errorText || response.statusText || errorMessage;
      }

      const error = new Error(errorMessage);
      (error as Error & { status?: number; code?: string }).status = response.status;
      (error as Error & { status?: number; code?: string }).code = errorCode;
      throw error;
    }

    if (response.status === 204) {
      return undefined as T;
    }

    return response.json();
  }

  async listPokemon(limit: number, offset: number): Promise<Pokemon[]> {
    const response = await fetch(`${BASE_URL}/pokemon/?limit=${limit}&offset=${offset}`);
    return this.handleResponse<Pokemon[]>(response);
  }

  async getPokemonByName(name: string): Promise<Pokemon> {
    const response = await fetch(`${BASE_URL}/pokemon/${encodeURIComponent(name)}`);
    return this.handleResponse<Pokemon>(response);
  }

  async listBoxEntryIds(): Promise<string[]> {
    if (!this.token) throw new Error('Authentication token required');

    const response = await fetch(`${BASE_URL}/box/`, {
      headers: { Authorization: `Bearer ${this.token.trim()}` },
    });

    return this.handleResponse<string[]>(response);
  }

  async getBoxEntry(id: string): Promise<BoxEntry> {
    if (!this.token) throw new Error('Authentication token required');

    const response = await fetch(`${BASE_URL}/box/${id}`, {
      headers: { Authorization: `Bearer ${this.token}` },
    });

    return this.handleResponse<BoxEntry>(response);
  }

  async createBoxEntry(entry: InsertBoxEntry): Promise<BoxEntry> {
    if (!this.token) throw new Error('Authentication token required');

    const response = await fetch(`${BASE_URL}/box/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.token}`,
      },
      body: JSON.stringify(entry),
    });

    return this.handleResponse<BoxEntry>(response);
  }

  async updateBoxEntry(id: string, entry: UpdateBoxEntry): Promise<BoxEntry> {
    if (!this.token) throw new Error('Authentication token required');

    const response = await fetch(`${BASE_URL}/box/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.token}`,
      },
      body: JSON.stringify(entry),
    });

    return this.handleResponse<BoxEntry>(response);
  }

  async deleteBoxEntry(id: string): Promise<void> {
    if (!this.token) throw new Error('Authentication token required');

    const response = await fetch(`${BASE_URL}/box/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${this.token}` },
    });

    return this.handleResponse<void>(response);
  }
}