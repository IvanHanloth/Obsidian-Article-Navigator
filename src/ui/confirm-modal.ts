import { App, Modal } from 'obsidian';

export interface ConfirmModalOptions {
	title: string;
	message: string;
	confirmText: string;
	cancelText: string;
	onResolve: (confirmed: boolean) => void;
}

export class ConfirmModal extends Modal {
	private resolved = false;

	constructor(app: App, private readonly opts: ConfirmModalOptions) {
		super(app);
	}

	onOpen(): void {
		const { contentEl } = this;
		contentEl.empty();
		contentEl.createEl('h3', { text: this.opts.title });

		const p = contentEl.createEl('p', { text: this.opts.message });
		p.addClass('article-nav-confirm-message');

		const buttonRow = contentEl.createDiv({
			cls: 'modal-button-container article-nav-confirm-buttons',
		});

		const cancelBtn = buttonRow.createEl('button', { text: this.opts.cancelText });
		cancelBtn.addEventListener('click', () => {
			this.resolve(false);
			this.close();
		});

		const confirmBtn = buttonRow.createEl('button', {
			text: this.opts.confirmText,
			cls: 'mod-cta',
		});
		confirmBtn.addEventListener('click', () => {
			this.resolve(true);
			this.close();
		});
	}

	onClose(): void {
		this.resolve(false);
		this.contentEl.empty();
	}

	private resolve(value: boolean): void {
		if (this.resolved) return;
		this.resolved = true;
		this.opts.onResolve(value);
	}
}
