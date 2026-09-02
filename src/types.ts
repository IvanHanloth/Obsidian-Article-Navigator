import type { TFile } from 'obsidian';

/**
 * A resolved See Also entry. Entries either point at a note inside the vault
 * or at an external URL; both carry the text to render for the link.
 */
export type SeeAlsoTarget =
	| { kind: 'internal'; file: TFile; display: string }
	| { kind: 'external'; url: string; display: string };

export interface NavData {
	prevFile: TFile | null;
	nextFile: TFile | null;
	seeAlsoTargets: SeeAlsoTarget[];
}

export interface NavSnapshot {
	prev: unknown;
	next: unknown;
}

export type FloatingStyle = 'none' | 'circle' | 'tall';
export type SeeAlsoPosition = 'top' | 'bottom' | 'none';
export type ConflictMode = 'prompt' | 'auto-update' | 'skip';
