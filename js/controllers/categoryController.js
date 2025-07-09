// Category Controller - handles category selection logic
import { 
    getAllMainCategories, 
    getAllSubCategories, 
    validateCategorySelection,
    getCategoryName,
    getSubCategoryName
} from '../data/categories.js';
import { showToast, logError } from '../utils/helpers.js';

export class CategoryController {
    constructor() {
        this.selectedMainCategory = null;
        this.selectedSubCategory = null;
        this.onSelectionChangeCallback = null;
        
        this.initializeElements();
        this.bindEvents();
        this.populateMainCategories();
    }

    /**
     * Initialize DOM elements
     */
    initializeElements() {
        this.mainCategorySelect = document.getElementById('mainCategory');
        this.subCategorySelect = document.getElementById('subCategory');
        this.generateBtn = document.getElementById('generateBtn');
        
        if (!this.mainCategorySelect || !this.subCategorySelect || !this.generateBtn) {
            logError('CategoryController: Required elements not found');
            throw new Error('Required category elements not found in DOM');
        }
    }

    /**
     * Bind event listeners
     */
    bindEvents() {
        this.mainCategorySelect.addEventListener('change', (e) => {
            this.handleMainCategoryChange(e.target.value);
        });

        this.subCategorySelect.addEventListener('change', (e) => {
            this.handleSubCategoryChange(e.target.value);
        });

        this.generateBtn.addEventListener('click', () => {
            this.handleGenerateClick();
        });
    }

    /**
     * Populate main categories dropdown
     */
    populateMainCategories() {
        try {
            const categories = getAllMainCategories();
            
            // Clear existing options except default
            this.mainCategorySelect.innerHTML = '<option value="">اختر التصنيف</option>';
            
            categories.forEach(category => {
                const option = document.createElement('option');
                option.value = category.key;
                option.textContent = category.name;
                option.setAttribute('data-icon', category.icon);
                this.mainCategorySelect.appendChild(option);
            });

            this.logDebug('Main categories populated', categories);
        } catch (error) {
            logError('Error populating main categories:', error);
            showToast('حدث خطأ في تحميل التصنيفات', 'error');
        }
    }

    /**
     * Handle main category selection change
     * @param {string} categoryKey 
     */
    handleMainCategoryChange(categoryKey) {
        try {
            this.selectedMainCategory = categoryKey;
            this.selectedSubCategory = null;
            
            if (categoryKey) {
                this.populateSubCategories(categoryKey);
                this.enableSubCategorySelect();
                this.logDebug('Main category selected', categoryKey);
            } else {
                this.clearSubCategories();
                this.disableSubCategorySelect();
                this.disableGenerateButton();
            }
            
            this.updateGenerateButtonState();
            this.notifySelectionChange();
        } catch (error) {
            logError('Error handling main category change:', error);
            showToast('حدث خطأ في اختيار التصنيف', 'error');
        }
    }

    /**
     * Handle sub category selection change
     * @param {string} subCategoryKey 
     */
    handleSubCategoryChange(subCategoryKey) {
        try {
            this.selectedSubCategory = subCategoryKey;
            
            this.logDebug('Sub category selected', subCategoryKey);
            this.updateGenerateButtonState();
            this.notifySelectionChange();
        } catch (error) {
            logError('Error handling sub category change:', error);
            showToast('حدث خطأ في اختيار الفئة الفرعية', 'error');
        }
    }

    /**
     * Handle generate button click
     */
    handleGenerateClick() {
        if (this.isValidSelection()) {
            this.logDebug('Generate button clicked with valid selection', {
                main: this.selectedMainCategory,
                sub: this.selectedSubCategory
            });
            
            this.onGenerateCallback?.(this.selectedMainCategory, this.selectedSubCategory);
        } else {
            showToast('يرجى اختيار التصنيف والفئة الفرعية أولاً', 'warning');
        }
    }

    /**
     * Populate sub categories dropdown
     * @param {string} mainCategoryKey 
     */
    populateSubCategories(mainCategoryKey) {
        try {
            const subCategories = getAllSubCategories(mainCategoryKey);
            
            // Clear existing options except default
            this.subCategorySelect.innerHTML = '<option value="">اختر الفئة الفرعية</option>';
            
            subCategories.forEach(subCategory => {
                const option = document.createElement('option');
                option.value = subCategory.key;
                option.textContent = subCategory.name;
                option.setAttribute('data-icon', subCategory.icon);
                this.subCategorySelect.appendChild(option);
            });

            this.logDebug('Sub categories populated', subCategories);
        } catch (error) {
            logError('Error populating sub categories:', error);
            showToast('حدث خطأ في تحميل الفئات الفرعية', 'error');
        }
    }

    /**
     * Clear sub categories dropdown
     */
    clearSubCategories() {
        this.subCategorySelect.innerHTML = '<option value="">اختر الفئة الفرعية</option>';
    }

    /**
     * Enable sub category select
     */
    enableSubCategorySelect() {
        this.subCategorySelect.disabled = false;
        this.subCategorySelect.classList.remove('disabled');
    }

    /**
     * Disable sub category select
     */
    disableSubCategorySelect() {
        this.subCategorySelect.disabled = true;
        this.subCategorySelect.classList.add('disabled');
        this.subCategorySelect.value = '';
    }

    /**
     * Update generate button state
     */
    updateGenerateButtonState() {
        const isValid = this.isValidSelection();
        
        this.generateBtn.disabled = !isValid;
        
        if (isValid) {
            this.enableGenerateButton();
        } else {
            this.disableGenerateButton();
        }
    }

    /**
     * Enable generate button
     */
    enableGenerateButton() {
        this.generateBtn.disabled = false;
        this.generateBtn.classList.remove('disabled');
        this.generateBtn.innerHTML = `
            <i class="fas fa-magic me-2"></i>
            إنشاء الاقتراحات
        `;
    }

    /**
     * Disable generate button
     */
    disableGenerateButton() {
        this.generateBtn.disabled = true;
        this.generateBtn.classList.add('disabled');
        this.generateBtn.innerHTML = `
            <i class="fas fa-magic me-2"></i>
            اختر التصنيف والفئة أولاً
        `;
    }

    /**
     * Validate current selection
     * @returns {boolean}
     */
    isValidSelection() {
        return this.selectedMainCategory && 
               this.selectedSubCategory && 
               validateCategorySelection(this.selectedMainCategory, this.selectedSubCategory);
    }

    /**
     * Get current selection
     * @returns {Object}
     */
    getCurrentSelection() {
        return {
            mainCategory: this.selectedMainCategory,
            subCategory: this.selectedSubCategory,
            mainCategoryName: this.selectedMainCategory ? getCategoryName(this.selectedMainCategory) : null,
            subCategoryName: this.selectedSubCategory ? getSubCategoryName(this.selectedMainCategory, this.selectedSubCategory) : null,
            isValid: this.isValidSelection()
        };
    }

    /**
     * Set selection programmatically
     * @param {string} mainCategory 
     * @param {string} subCategory 
     */
    setSelection(mainCategory, subCategory = null) {
        try {
            // Set main category
            this.mainCategorySelect.value = mainCategory;
            this.handleMainCategoryChange(mainCategory);
            
            // Set sub category if provided
            if (subCategory) {
                // Wait for sub categories to populate
                setTimeout(() => {
                    this.subCategorySelect.value = subCategory;
                    this.handleSubCategoryChange(subCategory);
                }, 100);
            }
        } catch (error) {
            logError('Error setting selection:', error);
            showToast('حدث خطأ في تحديد الاختيار', 'error');
        }
    }

    /**
     * Clear current selection
     */
    clearSelection() {
        this.mainCategorySelect.value = '';
        this.handleMainCategoryChange('');
    }

    /**
     * Set callback for selection changes
     * @param {Function} callback 
     */
    onSelectionChange(callback) {
        this.onSelectionChangeCallback = callback;
    }

    /**
     * Set callback for generate button click
     * @param {Function} callback 
     */
    onGenerate(callback) {
        this.onGenerateCallback = callback;
    }

    /**
     * Notify about selection change
     */
    notifySelectionChange() {
        if (this.onSelectionChangeCallback) {
            this.onSelectionChangeCallback(this.getCurrentSelection());
        }
    }

    /**
     * Show loading state
     */
    showLoading() {
        this.generateBtn.disabled = true;
        this.generateBtn.innerHTML = `
            <div class="spinner-border spinner-border-sm me-2" role="status">
                <span class="visually-hidden">جاري التحميل...</span>
            </div>
            جاري الإنشاء...
        `;
        
        this.mainCategorySelect.disabled = true;
        this.subCategorySelect.disabled = true;
    }

    /**
     * Hide loading state
     */
    hideLoading() {
        this.mainCategorySelect.disabled = false;
        
        if (this.selectedMainCategory) {
            this.subCategorySelect.disabled = false;
        }
        
        this.updateGenerateButtonState();
    }

    /**
     * Reset controller state
     */
    reset() {
        this.clearSelection();
        this.hideLoading();
    }

    /**
     * Debug logging
     * @param {string} message 
     * @param {any} data 
     */
    logDebug(message, data = null) {
        if (window.ENV && window.ENV.isDev()) {
            console.log(`[CategoryController] ${message}`, data);
        }
    }

    /**
     * Get validation errors
     * @returns {Array}
     */
    getValidationErrors() {
        const errors = [];
        
        if (!this.selectedMainCategory) {
            errors.push('يجب اختيار التصنيف الرئيسي');
        }
        
        if (!this.selectedSubCategory) {
            errors.push('يجب اختيار الفئة الفرعية');
        }
        
        if (this.selectedMainCategory && this.selectedSubCategory && 
            !validateCategorySelection(this.selectedMainCategory, this.selectedSubCategory)) {
            errors.push('الاختيار غير صحيح');
        }
        
        return errors;
    }

    /**
     * Display validation errors
     */
    displayValidationErrors() {
        const errors = this.getValidationErrors();
        if (errors.length > 0) {
            showToast(errors.join('<br>'), 'warning');
        }
    }

    /**
     * Destroy controller and cleanup
     */
    destroy() {
        // Remove event listeners
        this.mainCategorySelect.removeEventListener('change', this.handleMainCategoryChange);
        this.subCategorySelect.removeEventListener('change', this.handleSubCategoryChange);
        this.generateBtn.removeEventListener('click', this.handleGenerateClick);
        
        // Clear references
        this.onSelectionChangeCallback = null;
        this.onGenerateCallback = null;
        
        this.logDebug('Controller destroyed');
    }
}
