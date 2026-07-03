import { Plugin, Notice } from 'obsidian';

export default class NotificationAggregatorPlugin extends Plugin {
	private observer: MutationObserver | null = null;
	private aggregatedNotice: Notice | null = null;
	private noticeMessages: string[] = [];
	private isExpanded = false;

	async onload() {
		console.log('Loading Notification Aggregator plugin');

		// Set up mutation observer to watch for new notices
		this.observer = new MutationObserver((mutations) => {
			for (const mutation of mutations) {
				if (mutation.type === 'childList') {
					mutation.addedNodes.forEach((node) => {
						if (node instanceof HTMLElement) {
							// If a new notice-container is added, we should observe it too
							if (node.classList.contains('notice-container')) {
								this.observeNoticeContainer(node);
							}
							
							// If a new notice is added directly
							if (node.classList.contains('notice') && !node.classList.contains('aggregated-notice')) {
								this.handleNewNotice(node);
							}
						}
					});
				}
			}
		});

		// Start observing the body for notice-container creation
		this.observer.observe(document.body, { childList: true });

		// Also observe existing notice-container if it's already there
		const existingContainer = document.querySelector('.notice-container');
		if (existingContainer) {
			this.observeNoticeContainer(existingContainer as HTMLElement);
		}
	}

	observeNoticeContainer(container: HTMLElement) {
		if (this.observer) {
			this.observer.observe(container, { childList: true });
		}
	}

	handleNewNotice(noticeEl: HTMLElement) {
		// Hide the original notice immediately
		noticeEl.style.display = 'none';

		// Extract text content
		const text = noticeEl.innerText || noticeEl.textContent || '';
		
		if (text.trim()) {
			this.noticeMessages.push(text.trim());
			this.updateAggregatedNotice();
		}
	}

	updateAggregatedNotice() {
		const count = this.noticeMessages.length;
		if (count === 0) return;

		let summaryText = `You have ${count} notification${count > 1 ? 's' : ''}`;

		if (!this.aggregatedNotice || !this.aggregatedNotice.noticeEl.isConnected) {
			// Create a new aggregated notice
			this.aggregatedNotice = new Notice(summaryText, 0); // 0 means it stays until clicked/dismissed
			this.aggregatedNotice.noticeEl.classList.add('aggregated-notice');
			this.isExpanded = false;

			// Add click handler to toggle expansion
			this.aggregatedNotice.noticeEl.addEventListener('click', (e) => {
				// Prevent default notice click-to-close behavior
				e.stopPropagation(); 
				this.toggleExpand();
			});
		}
		
		// Update existing notice text and render
		this.renderAggregatedNoticeContent();
	}

	renderAggregatedNoticeContent() {
		if (!this.aggregatedNotice) return;
		
		const noticeEl = this.aggregatedNotice.noticeEl;
		const count = this.noticeMessages.length;
		let summaryText = `You have ${count} notification${count > 1 ? 's' : ''}`;

		// Clear previous inner content
		noticeEl.innerHTML = '';
		
		const contentDiv = document.createElement('div');
		contentDiv.className = 'aggregated-notice-content';
		
		const summaryDiv = document.createElement('div');
		summaryDiv.className = 'aggregated-notice-summary';
		summaryDiv.innerText = summaryText;
		contentDiv.appendChild(summaryDiv);

		if (this.isExpanded) {
			const listDiv = document.createElement('div');
			listDiv.className = 'aggregated-notice-list';
			
			// We iterate backwards to show newest first, or forwards for oldest first. Forward is fine.
			this.noticeMessages.forEach(msg => {
				const item = document.createElement('div');
				item.className = 'aggregated-notice-item';
				item.innerText = msg;
				listDiv.appendChild(item);
			});
			contentDiv.appendChild(listDiv);
			noticeEl.classList.add('is-expanded');
		} else {
			noticeEl.classList.remove('is-expanded');
		}

		noticeEl.appendChild(contentDiv);

		// Add a close button
		const closeBtn = document.createElement('div');
		closeBtn.className = 'aggregated-close-btn';
		// Using a simple X character
		closeBtn.innerHTML = '&#10006;'; 
		closeBtn.addEventListener('click', (e) => {
			e.stopPropagation();
			this.clearNotices();
		});
		noticeEl.appendChild(closeBtn);
	}

	toggleExpand() {
		this.isExpanded = !this.isExpanded;
		this.renderAggregatedNoticeContent();
	}

	clearNotices() {
		if (this.aggregatedNotice) {
			// Some versions of obsidian may not have hide(), but all notices can be removed from DOM
			if (typeof this.aggregatedNotice.hide === 'function') {
				this.aggregatedNotice.hide();
			} else if (this.aggregatedNotice.noticeEl && this.aggregatedNotice.noticeEl.parentElement) {
				this.aggregatedNotice.noticeEl.remove();
			}
			this.aggregatedNotice = null;
		}
		this.noticeMessages = [];
		this.isExpanded = false;
	}

	onunload() {
		console.log('Unloading Notification Aggregator plugin');
		if (this.observer) {
			this.observer.disconnect();
			this.observer = null;
		}
		this.clearNotices();
		
		// Reveal any hidden notices (optional cleanup)
		document.querySelectorAll('.notice').forEach(el => {
			if (el instanceof HTMLElement && el.style.display === 'none' && !el.classList.contains('aggregated-notice')) {
				el.style.display = '';
			}
		});
	}
}
