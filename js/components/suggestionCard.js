// Suggestion Card Component
import { formatPrice, copyToClipboard, generateId } from '../utils/helpers.js';

export class SuggestionCard {
    constructor(suggestion, index) {
        this.suggestion = suggestion;
        this.index = index;
        this.id = generateId();
        this.isSelected = false;
    }

    /**
     * Render the suggestion card
     * @returns {HTMLElement}
     */
    render() {
        const cardElement = document.createElement('div');
        cardElement.className = 'col-md-6 col-lg-4 mb-4';
        cardElement.innerHTML = this.getCardHTML();
        
        this.bindEvents(cardElement);
        return cardElement;
    }

    /**
     * Get card HTML template
     * @returns {string}
     */
    getCardHTML() {
        return `
            <div class="card suggestion-card h-100" data-suggestion-id="${this.id}">
                <div class="selection-indicator">
                    <i class="fas fa-check"></i>
                </div>
                
                <div class="card-header d-flex justify-content-between align-items-center">
                    <h6 class="mb-0 flex-grow-1">${this.suggestion.name}</h6>
                    <span class="price-tag ms-2">${formatPrice(this.suggestion.price)}</span>
                </div>
                
                <div class="card-body">
                    <p class="card-text text-muted mb-3">
                        ${this.suggestion.description}
                    </p>
                    
                    <div class="d-flex justify-content-between align-items-center">
                        <small class="text-muted">
                            <i class="fas fa-clock me-1"></i>
                            خدمة رقم ${this.index + 1}
                        </small>
                        
                        <div class="btn-group" role="group">
                            <button class="btn btn-sm btn-outline-primary copy-name-btn" title="نسخ الاسم">
                                <i class="fas fa-copy"></i>
                            </button>
                            <button class="btn btn-sm btn-outline-secondary copy-desc-btn" title="نسخ الوصف">
                                <i class="fas fa-file-alt"></i>
                            </button>
                        </div>
                    </div>
                </div>
                
                <div class="card-footer bg-transparent border-0">
                    <div class="form-check">
                        <input class="form-check-input selection-checkbox" type="checkbox" id="suggestion-${this.id}">
                        <label class="form-check-label fw-semibold" for="suggestion-${this.id}">
                            اختر للحصول على التفاصيل الكاملة
                        </label>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Bind event listeners to card elements
     * @param {HTMLElement} cardElement 
     */
    bindEvents(cardElement) {
        const card = cardElement.querySelector('.suggestion-card');
        const checkbox = cardElement.querySelector('.selection-checkbox');
        const copyNameBtn = cardElement.querySelector('.copy-name-btn');
        const copyDescBtn = cardElement.querySelector('.copy-desc-btn');

        // Card click to toggle selection
        card.addEventListener('click', (e) => {
            // Don't trigger if clicking on buttons or checkbox
            if (!e.target.closest('button') && !e.target.closest('.form-check')) {
                this.toggleSelection();
            }
        });

        // Checkbox change
        checkbox.addEventListener('change', () => {
            this.toggleSelection(checkbox.checked);
        });

        // Copy name button
        copyNameBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            copyToClipboard(this.suggestion.name, copyNameBtn);
        });

        // Copy description button
        copyDescBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            copyToClipboard(this.suggestion.description, copyDescBtn);
        });

        // Hover effects
        card.addEventListener('mouseenter', () => {
            if (!this.isSelected) {
                card.style.transform = 'translateY(-5px)';
            }
        });

        card.addEventListener('mouseleave', () => {
            if (!this.isSelected) {
                card.style.transform = 'translateY(0)';
            }
        });
    }

    /**
     * Toggle card selection state
     * @param {boolean} forceState 
     */
    toggleSelection(forceState = null) {
        this.isSelected = forceState !== null ? forceState : !this.isSelected;
        
        const cardElement = document.querySelector(`[data-suggestion-id="${this.id}"]`);
        const checkbox = cardElement.querySelector('.selection-checkbox');
        
        if (this.isSelected) {
            cardElement.classList.add('selected');
            cardElement.style.transform = 'translateY(-3px)';
            checkbox.checked = true;
        } else {
            cardElement.classList.remove('selected');
            cardElement.style.transform = 'translateY(0)';
            checkbox.checked = false;
        }

        // Dispatch custom event for parent component
        cardElement.dispatchEvent(new CustomEvent('selectionChanged', {
            detail: {
                suggestion: this.suggestion,
                isSelected: this.isSelected,
                cardId: this.id
            },
            bubbles: true
        }));
    }

    /**
     * Get suggestion data
     * @returns {Object}
     */
    getData() {
        return {
            ...this.suggestion,
            id: this.id,
            isSelected: this.isSelected
        };
    }

    /**
     * Set selection state programmatically
     * @param {boolean} selected 
     */
    setSelected(selected) {
        this.toggleSelection(selected);
    }

    /**
     * Update suggestion data
     * @param {Object} newData 
     */
    updateData(newData) {
        this.suggestion = { ...this.suggestion, ...newData };
        
        // Re-render if element exists
        const cardElement = document.querySelector(`[data-suggestion-id="${this.id}"]`);
        if (cardElement) {
            const parent = cardElement.parentElement;
            const newCard = this.render();
            parent.replaceChild(newCard, cardElement);
        }
    }

    /**
     * Remove card from DOM
     */
    remove() {
        const cardElement = document.querySelector(`[data-suggestion-id="${this.id}"]`);
        if (cardElement) {
            cardElement.remove();
        }
    }

    /**
     * Animate card entrance
     */
    animateIn() {
        const cardElement = document.querySelector(`[data-suggestion-id="${this.id}"]`);
        if (cardElement) {
            cardElement.style.opacity = '0';
            cardElement.style.transform = 'translateY(30px)';
            
            requestAnimationFrame(() => {
                cardElement.style.transition = 'all 0.5s ease-out';
                cardElement.style.opacity = '1';
                cardElement.style.transform = 'translateY(0)';
            });
        }
    }

    /**
     * Animate card exit
     * @returns {Promise}
     */
    animateOut() {
        return new Promise((resolve) => {
            const cardElement = document.querySelector(`[data-suggestion-id="${this.id}"]`);
            if (cardElement) {
                cardElement.style.transition = 'all 0.3s ease-in';
                cardElement.style.opacity = '0';
                cardElement.style.transform = 'translateY(-30px)';
                
                setTimeout(() => {
                    cardElement.remove();
                    resolve();
                }, 300);
            } else {
                resolve();
            }
        });
    }

    /**
     * Show loading state
     */
    showLoading() {
        const cardElement = document.querySelector(`[data-suggestion-id="${this.id}"]`);
        if (cardElement) {
            cardElement.classList.add('loading');
            const buttons = cardElement.querySelectorAll('button');
            buttons.forEach(btn => btn.disabled = true);
        }
    }

    /**
     * Hide loading state
     */
    hideLoading() {
        const cardElement = document.querySelector(`[data-suggestion-id="${this.id}"]`);
        if (cardElement) {
            cardElement.classList.remove('loading');
            const buttons = cardElement.querySelectorAll('button');
            buttons.forEach(btn => btn.disabled = false);
        }
    }
}

/**
 * Suggestion Cards Container
 */
export class SuggestionCardsContainer {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.cards = new Map();
        this.selectedCards = new Set();
        this.maxSelections = 5;
        
        this.bindEvents();
    }

    /**
     * Bind container events
     */
    bindEvents() {
        this.container.addEventListener('selectionChanged', (e) => {
            this.handleSelectionChange(e.detail);
        });
    }

    /**
     * Handle selection change
     * @param {Object} detail 
     */
    handleSelectionChange(detail) {
        if (detail.isSelected) {
            if (this.selectedCards.size < this.maxSelections) {
                this.selectedCards.add(detail.cardId);
            } else {
                // Prevent selection if max reached
                const card = this.cards.get(detail.cardId);
                if (card) {
                    card.setSelected(false);
                }
                return;
            }
        } else {
            this.selectedCards.delete(detail.cardId);
        }

        // Update button state
        this.updateGetDetailsButton();
        
        // Dispatch event to parent
        this.container.dispatchEvent(new CustomEvent('containerSelectionChanged', {
            detail: {
                selectedCount: this.selectedCards.size,
                maxSelections: this.maxSelections,
                selectedSuggestions: this.getSelectedSuggestions()
            },
            bubbles: true
        }));
    }

    /**
     * Add suggestions to container
     * @param {Array} suggestions 
     */
    addSuggestions(suggestions) {
        suggestions.forEach((suggestion, index) => {
            const card = new SuggestionCard(suggestion, this.cards.size + index);
            this.cards.set(card.id, card);
            
            const cardElement = card.render();
            this.container.appendChild(cardElement);
            
            // Animate in
            setTimeout(() => card.animateIn(), index * 100);
        });
    }

    /**
     * Clear all suggestions
     */
    async clearSuggestions() {
        const animationPromises = [];
        
        this.cards.forEach(card => {
            animationPromises.push(card.animateOut());
        });
        
        await Promise.all(animationPromises);
        
        this.cards.clear();
        this.selectedCards.clear();
        this.container.innerHTML = '';
        this.updateGetDetailsButton();
    }

    /**
     * Get selected suggestions
     * @returns {Array}
     */
    getSelectedSuggestions() {
        const selected = [];
        this.selectedCards.forEach(cardId => {
            const card = this.cards.get(cardId);
            if (card) {
                selected.push(card.getData());
            }
        });
        return selected;
    }

    /**
     * Update get details button state
     */
    updateGetDetailsButton() {
        const button = document.getElementById('getDetailsBtn');
        if (button) {
            button.disabled = this.selectedCards.size === 0;
            button.innerHTML = `
                <i class="fas fa-info-circle me-2"></i>
                الحصول على التفاصيل الكاملة (${this.selectedCards.size})
            `;
        }
    }

    /**
     * Select all suggestions
     */
    selectAll() {
        let count = 0;
        this.cards.forEach(card => {
            if (count < this.maxSelections) {
                card.setSelected(true);
                count++;
            }
        });
    }

    /**
     * Deselect all suggestions
     */
    deselectAll() {
        this.cards.forEach(card => {
            card.setSelected(false);
        });
    }

    /**
     * Get total suggestions count
     * @returns {number}
     */
    getTotalCount() {
        return this.cards.size;
    }

    /**
     * Get selected count
     * @returns {number}
     */
    getSelectedCount() {
        return this.selectedCards.size;
    }

    /**
     * Set max selections
     * @param {number} max 
     */
    setMaxSelections(max) {
        this.maxSelections = max;
        
        // If current selection exceeds new max, deselect excess
        if (this.selectedCards.size > max) {
            const excess = this.selectedCards.size - max;
            const selectedArray = Array.from(this.selectedCards);
            
            for (let i = 0; i < excess; i++) {
                const cardId = selectedArray[selectedArray.length - 1 - i];
                const card = this.cards.get(cardId);
                if (card) {
                    card.setSelected(false);
                }
            }
        }
    }
}
