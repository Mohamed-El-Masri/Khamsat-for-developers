// Main Application Entry Point
import { CategoryController } from './controllers/categoryController.js';
import { SuggestionController } from './controllers/suggestionController.js';
import { ServiceController } from './controllers/serviceController.js';
import { showToast, logError, scrollToElement } from './utils/helpers.js';
import { APP_CONFIG } from './config/api.js';

class KhamsatServiceGeneratorApp {
    constructor() {
        this.categoryController = null;
        this.suggestionController = null;
        this.serviceController = null;
        this.isInitialized = false;
        
        this.init();
    }

    /**
     * Initialize the application
     */
    async init() {
        try {
            this.logDebug('Initializing Khamsat Service Generator App...');
            
            // Show welcome message
            this.showWelcomeMessage();
            
            // Initialize controllers
            await this.initializeControllers();
            
            // Bind global events
            this.bindGlobalEvents();
            
            // Setup initial UI state
            this.setupInitialUIState();
            
            // Load any saved state
            await this.loadSavedState();
            
            this.isInitialized = true;
            this.logDebug('App initialized successfully');
            
        } catch (error) {
            logError('Error initializing app:', error);
            showToast('حدث خطأ في تشغيل التطبيق', 'error');
        }
    }

    /**
     * Show welcome message
     */
    showWelcomeMessage() {
        showToast(`مرحباً بك في منشئ خدمات خمسات بالذكاء الاصطناعي!<br>
                   تطوير: ${APP_CONFIG.PROJECT_INFO.DEVELOPER}<br>
                   إشراف: ${APP_CONFIG.PROJECT_INFO.SUPERVISOR}`, 'info', 8000);
    }

    /**
     * Initialize all controllers
     */
    async initializeControllers() {
        try {
            // Initialize Category Controller
            this.categoryController = new CategoryController();
            this.categoryController.onGenerate((mainCategory, subCategory) => {
                this.handleCategorySelection(mainCategory, subCategory);
            });

            // Initialize Suggestion Controller
            this.suggestionController = new SuggestionController();
            this.suggestionController.onGetDetails((selectedSuggestions, mainCategory, subCategory) => {
                this.handleGetServiceDetails(selectedSuggestions, mainCategory, subCategory);
            });

            // Initialize Service Controller
            this.serviceController = new ServiceController();
            this.serviceController.onAllServicesCreated((services, failures) => {
                this.handleServicesCreated(services, failures);
            });

            this.logDebug('All controllers initialized');
        } catch (error) {
            logError('Error initializing controllers:', error);
            throw error;
        }
    }

    /**
     * Bind global event listeners
     */
    bindGlobalEvents() {
        // Start button
        const startBtn = document.getElementById('startBtn');
        if (startBtn) {
            startBtn.addEventListener('click', () => {
                this.handleStartClick();
            });
        }

        // Window events
        window.addEventListener('beforeunload', () => {
            this.handleBeforeUnload();
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            this.handleKeyboardShortcuts(e);
        });

        // Scroll events for animations
        window.addEventListener('scroll', () => {
            this.handleScroll();
        });

        this.logDebug('Global events bound');
    }

    /**
     * Setup initial UI state
     */
    setupInitialUIState() {
        // Hide all sections except hero
        this.hideAllSections();
        
        // Set focus on start button
        const startBtn = document.getElementById('startBtn');
        if (startBtn) {
            startBtn.focus();
        }

        this.logDebug('Initial UI state set');
    }

    /**
     * Load any saved state from session storage
     */
    async loadSavedState() {
        try {
            // Check if there's saved state
            const hasCategories = sessionStorage.getItem('suggestionControllerState');
            const hasServices = sessionStorage.getItem('generatedServices');

            if (hasCategories || hasServices) {
                const shouldRestore = confirm('تم العثور على بيانات محفوظة من جلسة سابقة. هل تريد استعادتها؟');
                
                if (shouldRestore) {
                    await this.suggestionController.loadStateFromSession();
                    await this.serviceController.loadServicesFromSession();
                    
                    // Show appropriate sections
                    if (hasCategories) {
                        this.showCategorySection();
                        this.suggestionController.showSuggestionsSection();
                    }
                    
                    if (hasServices) {
                        this.serviceController.showServiceDetailsSection();
                    }
                    
                    showToast('تم استعادة البيانات المحفوظة بنجاح', 'success');
                } else {
                    this.clearAllSavedState();
                }
            }
        } catch (error) {
            logError('Error loading saved state:', error);
        }
    }

    /**
     * Handle start button click
     */
    handleStartClick() {
        this.logDebug('Start button clicked');
        
        // Hide hero section and show category selection
        this.hideHeroSection();
        this.showCategorySection();
        
        // Scroll to category section
        scrollToElement('#categorySection', 100);
    }

    /**
     * Handle category selection and suggestion generation
     * @param {string} mainCategory 
     * @param {string} subCategory 
     */
    async handleCategorySelection(mainCategory, subCategory) {
        try {
            this.logDebug('Category selected, generating suggestions', { mainCategory, subCategory });
            
            // Show loading state
            this.categoryController.showLoading();
            
            // Generate suggestions
            await this.suggestionController.generateSuggestions(mainCategory, subCategory);
            
        } catch (error) {
            logError('Error handling category selection:', error);
            showToast('حدث خطأ في إنشاء الاقتراحات', 'error');
        } finally {
            this.categoryController.hideLoading();
        }
    }

    /**
     * Handle get service details request
     * @param {Array} selectedSuggestions 
     * @param {string} mainCategory 
     * @param {string} subCategory 
     */
    async handleGetServiceDetails(selectedSuggestions, mainCategory, subCategory) {
        try {
            this.logDebug('Getting service details', { 
                count: selectedSuggestions.length, 
                mainCategory, 
                subCategory 
            });
            
            // Set service count for progress tracking
            this.serviceController.setCurrentServiceCount(selectedSuggestions.length);
            
            // Generate service details
            await this.serviceController.generateServiceDetails(
                selectedSuggestions, 
                mainCategory, 
                subCategory
            );
            
        } catch (error) {
            logError('Error handling service details request:', error);
            showToast('حدث خطأ في إنشاء تفاصيل الخدمات', 'error');
        }
    }

    /**
     * Handle services creation completion
     * @param {Array} services 
     * @param {Array} failures 
     */
    handleServicesCreated(services, failures) {
        this.logDebug('Services created', { 
            successCount: services.length, 
            failureCount: failures.length 
        });

        // Show completion statistics
        this.showCompletionStatistics(services, failures);
        
        // Auto-save state
        this.autoSaveState();
    }

    /**
     * Show completion statistics
     * @param {Array} services 
     * @param {Array} failures 
     */
    showCompletionStatistics(services, failures) {
        const stats = this.serviceController.getStatistics();
        
        let message = `🎉 تم إنشاء ${services.length} خدمة بنجاح!<br>`;
        message += `📊 إجمالي المميزات: ${stats.totalFeatures}<br>`;
        message += `📦 إجمالي المخرجات: ${stats.totalDeliverables}<br>`;
        message += `🏷️ إجمالي الكلمات المفتاحية: ${stats.totalKeywords}<br>`;
        message += `💰 متوسط السعر: $${stats.averagePrice.toFixed(2)}`;
        
        if (failures.length > 0) {
            message += `<br>⚠️ فشل في إنشاء ${failures.length} خدمة`;
        }

        showToast(message, 'success', 10000);
    }

    /**
     * Hide all sections
     */
    hideAllSections() {
        const sections = [
            'categorySection',
            'loadingSection', 
            'suggestionsSection',
            'serviceDetailsSection'
        ];
        
        sections.forEach(sectionId => {
            const section = document.getElementById(sectionId);
            if (section) {
                section.classList.add('d-none');
            }
        });
    }

    /**
     * Hide hero section
     */
    hideHeroSection() {
        const heroSection = document.querySelector('.hero-section');
        if (heroSection) {
            heroSection.style.display = 'none';
        }
    }

    /**
     * Show category section
     */
    showCategorySection() {
        const categorySection = document.getElementById('categorySection');
        if (categorySection) {
            categorySection.classList.remove('d-none');
            categorySection.classList.add('animate-fade-in');
        }
    }

    /**
     * Handle keyboard shortcuts
     * @param {KeyboardEvent} e 
     */
    handleKeyboardShortcuts(e) {
        // Ctrl+R: Reset application
        if (e.ctrlKey && e.key === 'r') {
            e.preventDefault();
            this.resetApplication();
        }
        
        // Ctrl+S: Save current state
        if (e.ctrlKey && e.key === 's') {
            e.preventDefault();
            this.saveCurrentState();
        }
        
        // Ctrl+E: Export all services
        if (e.ctrlKey && e.key === 'e') {
            e.preventDefault();
            this.exportAllServices();
        }
        
        // Escape: Clear current selection
        if (e.key === 'Escape') {
            this.clearCurrentSelection();
        }
    }

    /**
     * Handle scroll events for animations
     */
    handleScroll() {
        // Add scroll-based animations here if needed
        const sections = document.querySelectorAll('.section-transition');
        sections.forEach(section => {
            if (this.isElementInViewport(section)) {
                section.classList.add('active');
            }
        });
    }

    /**
     * Check if element is in viewport
     * @param {HTMLElement} element 
     * @returns {boolean}
     */
    isElementInViewport(element) {
        const rect = element.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    }

    /**
     * Handle before unload event
     */
    handleBeforeUnload() {
        // Auto-save state before closing
        this.autoSaveState();
    }

    /**
     * Auto-save current state
     */
    autoSaveState() {
        try {
            this.suggestionController.saveStateToSession();
            this.serviceController.saveServicesToSession();
            this.logDebug('State auto-saved');
        } catch (error) {
            logError('Error auto-saving state:', error);
        }
    }

    /**
     * Save current state manually
     */
    saveCurrentState() {
        this.autoSaveState();
        showToast('تم حفظ الحالة الحالية', 'info');
    }

    /**
     * Reset application
     */
    resetApplication() {
        const confirmReset = confirm('هل أنت متأكد من إعادة تعيين التطبيق؟ سيتم فقدان جميع البيانات الحالية.');
        
        if (confirmReset) {
            this.clearAllSavedState();
            this.categoryController.reset();
            this.suggestionController.reset();
            this.serviceController.reset();
            this.hideAllSections();
            
            // Show hero section again
            const heroSection = document.querySelector('.hero-section');
            if (heroSection) {
                heroSection.style.display = 'block';
            }
            
            showToast('تم إعادة تعيين التطبيق بنجاح', 'info');
            
            // Scroll to top
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }

    /**
     * Clear all saved state
     */
    clearAllSavedState() {
        this.suggestionController.clearSessionState();
        this.serviceController.clearSessionStorage();
    }

    /**
     * Clear current selection
     */
    clearCurrentSelection() {
        this.suggestionController.deselectAllSuggestions();
        showToast('تم إلغاء جميع الاختيارات', 'info');
    }

    /**
     * Export all services
     */
    exportAllServices() {
        const services = this.serviceController.getAllServices();
        if (services.length === 0) {
            showToast('لا توجد خدمات لتصديرها', 'warning');
            return;
        }

        const format = confirm('اختر تنسيق التصدير:\nموافق = JSON\nإلغاء = نص') ? 'json' : 'text';
        this.serviceController.downloadAllServicesExport(format);
        
        showToast(`تم تصدير ${services.length} خدمة بتنسيق ${format.toUpperCase()}`, 'success');
    }

    /**
     * Get application statistics
     * @returns {Object}
     */
    getApplicationStatistics() {
        const suggestionStats = this.suggestionController.getStatistics();
        const serviceStats = this.serviceController.getStatistics();
        
        return {
            suggestions: suggestionStats,
            services: serviceStats,
            appInfo: {
                version: APP_CONFIG.PROJECT_INFO.VERSION,
                developer: APP_CONFIG.PROJECT_INFO.DEVELOPER,
                supervisor: APP_CONFIG.PROJECT_INFO.SUPERVISOR,
                initialized: this.isInitialized,
                timestamp: new Date().toISOString()
            }
        };
    }

    /**
     * Debug logging
     * @param {string} message 
     * @param {any} data 
     */
    logDebug(message, data = null) {
        if (window.ENV && window.ENV.isDev()) {
            console.log(`[KhamsatApp] ${message}`, data);
        }
    }

    /**
     * Show application info
     */
    showApplicationInfo() {
        const stats = this.getApplicationStatistics();
        
        let info = `📱 منشئ خدمات خمسات بالذكاء الاصطناعي\n`;
        info += `🔧 الإصدار: ${stats.appInfo.version}\n`;
        info += `👨‍💻 المطور: ${stats.appInfo.developer}\n`;
        info += `🏛️ الإشراف: ${stats.appInfo.supervisor}\n\n`;
        info += `📊 الإحصائيات:\n`;
        info += `• الاقتراحات: ${stats.suggestions.totalSuggestions}\n`;
        info += `• الخدمات المُنشأة: ${stats.services.totalServices}\n`;
        info += `• المميزات: ${stats.services.totalFeatures}\n`;
        info += `• المخرجات: ${stats.services.totalDeliverables}`;

        alert(info);
    }

    /**
     * Destroy application and cleanup
     */
    destroy() {
        try {
            // Save final state
            this.autoSaveState();
            
            // Destroy controllers
            if (this.categoryController) {
                this.categoryController.destroy();
            }
            
            if (this.suggestionController) {
                this.suggestionController.destroy();
            }
            
            if (this.serviceController) {
                this.serviceController.destroy();
            }
            
            // Remove global event listeners
            window.removeEventListener('beforeunload', this.handleBeforeUnload);
            window.removeEventListener('scroll', this.handleScroll);
            document.removeEventListener('keydown', this.handleKeyboardShortcuts);
            
            this.logDebug('Application destroyed');
            
        } catch (error) {
            logError('Error destroying application:', error);
        }
    }
}

// Initialize application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.khamsatApp = new KhamsatServiceGeneratorApp();
});

// Add global keyboard shortcut info
document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key === 'h') {
        e.preventDefault();
        if (window.khamsatApp) {
            window.khamsatApp.showApplicationInfo();
        }
    }
});

// Export for potential external use
export default KhamsatServiceGeneratorApp;
