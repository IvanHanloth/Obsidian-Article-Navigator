import type { TFile } from 'obsidian';

export interface NavData {
	prevFile: TFile | null;
	nextFile: TFile | null;
	seeAlsoFiles: TFile[];
}

export interface NavSnapshot {
	prev: unknown;
	next: unknown;
}

export type FloatingStyle = 'none' | 'circle' | 'tall';
export type SeeAlsoPosition = 'top' | 'bottom' | 'none';
export type ConflictMode = 'prompt' | 'auto-update' | 'skip';
