// Suggestion Controller - handles suggestion generation and management
import { SuggestionCardsContainer } from '../components/suggestionCard.js';
import AIService from '../services/aiService.js';
import { showToast, logError, scrollToElement } from '../utils/helpers.js';
import { APP_CONFIG } from '../config/api.js';

export class SuggestionController {
    constructor() {
        this.container = null;
        this.isLoading = false;
        this.currentCategory = null;
        this.currentSubCategory = null;
        this.generationCount = 0;
        this.onSelectionChangeCallback = null;
        this.onGetDetailsCallback = null;
        
        this.initializeElements();
        this.bindEvents();
    }

    /**
     * Initialize DOM elements and components
     */
    initializeElements() {
        this.suggestionsSection = document.getElementById('suggestionsSection');
        this.moreBtn = document.getElementById('moreBtn');
        this.getDetailsBtn = document.getElementById('getDetailsBtn');
        
        if (!this.suggestionsSection) {
            logError('SuggestionController: suggestionsSection not found');
            throw new Error('Suggestions section not found in DOM');
        }
        
        // Initialize suggestions container
        this.container = new SuggestionCardsContainer('suggestionsContainer');
    }

    /**
     * Bind event listeners
     */
    bindEvents() {
        // More suggestions button
        this.moreBtn?.addEventListener('click', () => {
            this.handleMoreSuggestions();
        });

        // Get details button
        this.getDetailsBtn?.addEventListener('click', () => {
            this.handleGetDetails();
        });

        // Container selection change
        document.getElementById('suggestionsContainer')?.addEventListener('containerSelectionChanged', (e) => {
            this.handleContainerSelectionChange(e.detail);
        });
    }

    /**
     * Generate suggestions for given category
     * @param {string} mainCategory 
     * @param {string} subCategory 
     * @param {boolean} append - whether to append to existing suggestions
     */
    async generateSuggestions(mainCategory, subCategory, append = false) {
        if (this.isLoading) {
            showToast('عملية إنشاء أخرى قيد التنفيذ، يرجى الانتظار', 'warning');
            return;
        }

        try {
            this.setLoadingState(true);
            
            // Store current category info
            this.currentCategory = mainCategory;
            this.currentSubCategory = subCategory;
            
            if (!append) {
                this.generationCount = 0;
                await this.clearSuggestions();
            }

            this.logDebug('Generating suggestions', { mainCategory, subCategory, append });

            // Generate suggestions using AI service
            const suggestions = await AIService.generateSuggestions(
                mainCategory, 
                subCategory, 
                APP_CONFIG.SUGGESTIONS.DEFAULT_COUNT
            );

            if (suggestions && suggestions.length > 0) {
                this.generationCount++;
                
                // Add suggestions to container
                this.container.addSuggestions(suggestions.map(suggestion => ({
                    ...suggestion,
                    category: subCategory,
                    mainCategory: mainCategory
                })));

                // Show suggestions section
                this.showSuggestionsSection();
                
                // Scroll to suggestions
                setTimeout(() => {
                    scrollToElement(this.suggestionsSection, 100);
                }, 500);

                this.logDebug('Suggestions generated successfully', {
                    count: suggestions.length,
                    generationCount: this.generationCount
                });

                showToast(`تم إنشاء ${suggestions.length} اقتراح بنجاح!`, 'success');
            } else {
                throw new Error('No suggestions received from AI service');
            }

        } catch (error) {
            logError('Error generating suggestions:', error);
            showToast('حدث خطأ في إنشاء الاقتراحات. يرجى المحاولة مرة أخرى.', 'error');
        } finally {
            this.setLoadingState(false);
        }
    }

    /**
     * Handle more suggestions button click
     */
    async handleMoreSuggestions() {
        if (!this.currentCategory || !this.currentSubCategory) {
            showToast('يرجى اختيار التصنيف والفئة الفرعية أولاً', 'warning');
            return;
        }

        await this.generateSuggestions(this.currentCategory, this.currentSubCategory, true);
    }

    /**
     * Handle get details button click
     */
    handleGetDetails() {
        const selectedSuggestions = this.container.getSelectedSuggestions();
        
        if (selectedSuggestions.length === 0) {
            showToast('يرجى اختيار خدمة واحدة على الأقل للحصول على التفاصيل', 'warning');
            return;
        }

        this.logDebug('Getting details for selected suggestions', selectedSuggestions);
        
        if (this.onGetDetailsCallback) {
            this.onGetDetailsCallback(selectedSuggestions, this.currentCategory, this.currentSubCategory);
        }
    }

    /**
     * Handle container selection change
     * @param {Object} detail 
     */
    handleContainerSelectionChange(detail) {
        this.logDebug('Container selection changed', detail);
        
        // Update more button text
        this.updateMoreButtonText();
        
        // Notify parent controller
        if (this.onSelectionChangeCallback) {
            this.onSelectionChangeCallback(detail);
        }
    }

    /**
     * Show suggestions section
     */
    showSuggestionsSection() {
        this.suggestionsSection.classList.remove('d-none');
        this.suggestionsSection.classList.add('animate-fade-in');
    }

    /**
     * Hide suggestions section
     */
    hideSuggestionsSection() {
        this.suggestionsSection.classList.add('d-none');
        this.suggestionsSection.classList.remove('animate-fade-in');
    }

    /**
     * Clear all suggestions
     */
    async clearSuggestions() {
        await this.container.clearSuggestions();
        this.generationCount = 0;
        this.updateMoreButtonText();
    }

    /**
     * Update more button text
     */
    updateMoreButtonText() {
        if (this.moreBtn) {
            const totalCount = this.container.getTotalCount();
            this.moreBtn.innerHTML = `
                <i class="fas fa-plus me-2"></i>
                10 اقتراحات أخرى ${totalCount > 0 ? `(المجموع: ${totalCount})` : ''}
            `;
        }
    }

    /**
     * Set loading state
     * @param {boolean} loading 
     */
    setLoadingState(loading) {
        this.isLoading = loading;
        
        if (this.moreBtn) {
            this.moreBtn.disabled = loading;
            if (loading) {
                this.moreBtn.innerHTML = `
                    <div class="spinner-border spinner-border-sm me-2" role="status">
                        <span class="visually-hidden">جاري التحميل...</span>
                    </div>
                    جاري الإنشاء...
                `;
            } else {
                this.updateMoreButtonText();
            }
        }

        if (this.getDetailsBtn) {
            this.getDetailsBtn.disabled = loading || this.container.getSelectedCount() === 0;
        }
    }

    /**
     * Get current statistics
     * @returns {Object}
     */
    getStatistics() {
        return {
            totalSuggestions: this.container.getTotalCount(),
            selectedSuggestions: this.container.getSelectedCount(),
            generationCount: this.generationCount,
            currentCategory: this.currentCategory,
            currentSubCategory: this.currentSubCategory,
            maxSelections: this.container.maxSelections
        };
    }

    /**
     * Set maximum selections allowed
     * @param {number} max 
     */
    setMaxSelections(max) {
        this.container.setMaxSelections(max);
    }

    /**
     * Select all suggestions
     */
    selectAllSuggestions() {
        this.container.selectAll();
        showToast('تم اختيار جميع الاقتراحات المتاحة', 'info');
    }

    /**
     * Deselect all suggestions
     */
    deselectAllSuggestions() {
        this.container.deselectAll();
        showToast('تم إلغاء اختيار جميع الاقتراحات', 'info');
    }

    /**
     * Filter suggestions by criteria
     * @param {Function} filterFn 
     */
    filterSuggestions(filterFn) {
        // This would require additional implementation in the container
        // For now, we'll show a message
        showToast('ميزة التصفيق ستكون متاحة قريباً', 'info');
    }

    /**
     * Sort suggestions by criteria
     * @param {string} criteria - 'price', 'name', 'popularity'
     * @param {string} order - 'asc', 'desc'
     */
    sortSuggestions(criteria, order = 'asc') {
        // This would require additional implementation in the container
        showToast('ميزة الترتيب ستكون متاحة قريباً', 'info');
    }

    /**
     * Export suggestions as JSON
     * @returns {string}
     */
    exportSuggestionsAsJSON() {
        const suggestions = Array.from(this.container.cards.values()).map(card => card.getData());
        const exportData = {
            suggestions,
            category: {
                main: this.currentCategory,
                sub: this.currentSubCategory
            },
            statistics: this.getStatistics(),
            exportedAt: new Date().toISOString(),
            developer: 'المهندس محمد سامح المصري',
            supervisor: 'ITI - فرع سوهاج'
        };
        
        return JSON.stringify(exportData, null, 2);
    }

    /**
     * Export suggestions as CSV
     * @returns {string}
     */
    exportSuggestionsAsCSV() {
        const suggestions = Array.from(this.container.cards.values()).map(card => card.getData());
        
        let csv = 'اسم الخدمة,السعر,الوصف,مختارة\n';
        suggestions.forEach(suggestion => {
            csv += `"${suggestion.name}","${suggestion.price}","${suggestion.description}","${suggestion.isSelected ? 'نعم' : 'لا'}"\n`;
        });
        
        return csv;
    }

    /**
     * Import suggestions from JSON
     * @param {string} jsonData 
     */
    async importSuggestionsFromJSON(jsonData) {
        try {
            const data = JSON.parse(jsonData);
            
            if (data.suggestions && Array.isArray(data.suggestions)) {
                await this.clearSuggestions();
                
                // Set category info if available
                if (data.category) {
                    this.currentCategory = data.category.main;
                    this.currentSubCategory = data.category.sub;
                }
                
                this.container.addSuggestions(data.suggestions);
                this.showSuggestionsSection();
                
                showToast(`تم استيراد ${data.suggestions.length} اقتراح بنجاح`, 'success');
            } else {
                throw new Error('Invalid JSON format');
            }
        } catch (error) {
            logError('Error importing suggestions:', error);
            showToast('حدث خطأ في استيراد الاقتراحات', 'error');
        }
    }

    /**
     * Set callback for selection changes
     * @param {Function} callback 
     */
    onSelectionChange(callback) {
        this.onSelectionChangeCallback = callback;
    }

    /**
     * Set callback for get details action
     * @param {Function} callback 
     */
    onGetDetails(callback) {
        this.onGetDetailsCallback = callback;
    }

    /**
     * Reset controller state
     */
    async reset() {
        await this.clearSuggestions();
        this.hideSuggestionsSection();
        this.currentCategory = null;
        this.currentSubCategory = null;
        this.generationCount = 0;
        this.setLoadingState(false);
    }

    /**
     * Debug logging
     * @param {string} message 
     * @param {any} data 
     */
    logDebug(message, data = null) {
        if (window.ENV && window.ENV.isDev()) {
            console.log(`[SuggestionController] ${message}`, data);
        }
    }

    /**
     * Validate suggestions data
     * @param {Array} suggestions 
     * @returns {boolean}
     */
    validateSuggestions(suggestions) {
        if (!Array.isArray(suggestions)) {
            return false;
        }

        return suggestions.every(suggestion => 
            suggestion.name && 
            typeof suggestion.price === 'number' && 
            suggestion.description
        );
    }

    /**
     * Get selected suggestions for export
     * @returns {Array}
     */
    getSelectedSuggestionsForExport() {
        const selected = this.container.getSelectedSuggestions();
        return selected.map(suggestion => ({
            ...suggestion,
            selectedAt: new Date().toISOString()
        }));
    }

    /**
     * Save current state to session storage
     */
    saveStateToSession() {
        try {
            const state = {
                currentCategory: this.currentCategory,
                currentSubCategory: this.currentSubCategory,
                generationCount: this.generationCount,
                suggestions: Array.from(this.container.cards.values()).map(card => card.getData()),
                selectedSuggestions: this.container.getSelectedSuggestions().map(s => s.id)
            };
            
            sessionStorage.setItem('suggestionControllerState', JSON.stringify(state));
        } catch (error) {
            logError('Error saving state to session:', error);
        }
    }

    /**
     * Load state from session storage
     */
    async loadStateFromSession() {
        try {
            const stateData = sessionStorage.getItem('suggestionControllerState');
            if (stateData) {
                const state = JSON.parse(stateData);
                
                this.currentCategory = state.currentCategory;
                this.currentSubCategory = state.currentSubCategory;
                this.generationCount = state.generationCount;
                
                if (state.suggestions && state.suggestions.length > 0) {
                    this.container.addSuggestions(state.suggestions);
                    this.showSuggestionsSection();
                    
                    // Restore selections
                    if (state.selectedSuggestions) {
                        state.selectedSuggestions.forEach(id => {
                            const card = Array.from(this.container.cards.values())
                                .find(card => card.getData().id === id);
                            if (card) {
                                card.setSelected(true);
                            }
                        });
                    }
                }
            }
        } catch (error) {
            logError('Error loading state from session:', error);
        }
    }

    /**
     * Clear session state
     */
    clearSessionState() {
        try {
            sessionStorage.removeItem('suggestionControllerState');
        } catch (error) {
            logError('Error clearing session state:', error);
        }
    }

    /**
     * Destroy controller and cleanup
     */
    destroy() {
        // Save current state before destroying
        this.saveStateToSession();
        
        // Remove event listeners
        this.moreBtn?.removeEventListener('click', this.handleMoreSuggestions);
        this.getDetailsBtn?.removeEventListener('click', this.handleGetDetails);
        
        // Clear references
        this.onSelectionChangeCallback = null;
        this.onGetDetailsCallback = null;
        
        this.logDebug('Controller destroyed');
    }

    /**
     * Get fallback suggestion count (for comparison)
     * @returns {number}
     */
    getFallbackSuggestionCount() {
        return 5; // Number of fallback suggestions
    }

    /**
     * Get fallback suggestions
     * @param {string} mainCategory 
     * @param {string} subCategory 
     * @returns {Array}
     */
    getFallbackSuggestions(mainCategory, subCategory) {
        const fallbackSuggestions = [
            {
                id: 'fallback-1',
                name: 'اقتراح تجريبي 1',
                description: 'وصف الاقتراح التجريبي 1',
                price: 100,
                category: subCategory,
                mainCategory: mainCategory,
                isSelected: false
            },
            {
                id: 'fallback-2',
                name: 'اقتراح تجريبي 2',
                description: 'وصف الاقتراح التجريبي 2',
                price: 200,
                category: subCategory,
                mainCategory: mainCategory,
                isSelected: false
            },
            {
                id: 'fallback-3',
                name: 'اقتراح تجريبي 3',
                description: 'وصف الاقتراح التجريبي 3',
                price: 300,
                category: subCategory,
                mainCategory: mainCategory,
                isSelected: false
            },
            {
                id: 'fallback-4',
                name: 'اقتراح تجريبي 4',
                description: 'وصف الاقتراح التجريبي 4',
                price: 400,
                category: subCategory,
                mainCategory: mainCategory,
                isSelected: false
            },
            {
                id: 'fallback-5',
                name: 'اقتراح تجريبي 5',
                description: 'وصف الاقتراح التجريبي 5',
                price: 500,
                category: subCategory,
                mainCategory: mainCategory,
                isSelected: false
            }
        ];
        
        return fallbackSuggestions;
    }
}
