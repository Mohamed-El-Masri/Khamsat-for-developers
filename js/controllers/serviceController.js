// Service Controller - handles service details generation and management
import { ServiceDetails, ServiceDetailsContainer } from '../components/serviceDetails.js';
import AIService from '../services/aiService.js';
import { showToast, logError, scrollToElement } from '../utils/helpers.js';

export class ServiceController {
    constructor() {
        this.container = null;
        this.isLoading = false;
        this.currentServices = new Map();
        this.onServiceCreatedCallback = null;
        this.onAllServicesCreatedCallback = null;
        
        this.initializeElements();
    }

    /**
     * Initialize DOM elements and components
     */
    initializeElements() {
        this.serviceDetailsSection = document.getElementById('serviceDetailsSection');
        
        if (!this.serviceDetailsSection) {
            logError('ServiceController: serviceDetailsSection not found');
            throw new Error('Service details section not found in DOM');
        }
        
        // Initialize service details container
        this.container = new ServiceDetailsContainer('serviceDetailsContainer');
    }

    /**
     * Generate detailed service information
     * @param {Array} selectedSuggestions 
     * @param {string} mainCategory 
     * @param {string} subCategory 
     */
    async generateServiceDetails(selectedSuggestions, mainCategory, subCategory) {
        if (this.isLoading) {
            showToast('عملية إنشاء تفاصيل أخرى قيد التنفيذ، يرجى الانتظار', 'warning');
            return;
        }

        if (!selectedSuggestions || selectedSuggestions.length === 0) {
            showToast('لا توجد خدمات مختارة لإنشاء التفاصيل', 'warning');
            return;
        }

        try {
            this.setLoadingState(true);
            
            // Clear existing services
            this.clearServices();
            
            this.logDebug('Generating service details', {
                count: selectedSuggestions.length,
                mainCategory,
                subCategory
            });

            // Show loading section
            this.showLoadingSection();

            const servicePromises = selectedSuggestions.map((suggestion, index) => 
                this.generateSingleServiceDetail(suggestion, mainCategory, subCategory, index)
            );

            // Wait for all services to be generated
            const serviceDetails = await Promise.allSettled(servicePromises);
            
            // Process results
            const successfulServices = [];
            const failedServices = [];

            serviceDetails.forEach((result, index) => {
                if (result.status === 'fulfilled' && result.value) {
                    successfulServices.push(result.value);
                } else {
                    failedServices.push({
                        suggestion: selectedSuggestions[index],
                        error: result.reason
                    });
                }
            });

            // Hide loading and show results
            this.hideLoadingSection();
            
            if (successfulServices.length > 0) {
                this.showServiceDetailsSection();
                
                // Add successful services to container
                for (const serviceDetail of successfulServices) {
                    await this.container.addServiceDetail(serviceDetail);
                    this.currentServices.set(serviceDetail.id, serviceDetail);
                }

                // Scroll to service details
                setTimeout(() => {
                    scrollToElement(this.serviceDetailsSection, 100);
                }, 500);

                const successMessage = `تم إنشاء تفاصيل ${successfulServices.length} خدمة بنجاح!`;
                const failureMessage = failedServices.length > 0 
                    ? ` فشل في إنشاء ${failedServices.length} خدمة.`
                    : '';
                
                showToast(successMessage + failureMessage, 'success');

                // Notify about completion
                if (this.onAllServicesCreatedCallback) {
                    this.onAllServicesCreatedCallback(successfulServices, failedServices);
                }
            } else {
                showToast('فشل في إنشاء تفاصيل أي من الخدمات المختارة', 'error');
            }

            // Log failed services
            if (failedServices.length > 0) {
                logError('Failed to generate some services:', failedServices);
            }

        } catch (error) {
            logError('Error generating service details:', error);
            showToast('حدث خطأ في إنشاء تفاصيل الخدمات', 'error');
            this.hideLoadingSection();
        } finally {
            this.setLoadingState(false);
        }
    }

    /**
     * Generate single service detail
     * @param {Object} suggestion 
     * @param {string} mainCategory 
     * @param {string} subCategory 
     * @param {number} index 
     * @returns {Promise<ServiceDetails>}
     */
    async generateSingleServiceDetail(suggestion, mainCategory, subCategory, index) {
        try {
            this.logDebug(`Generating service ${index + 1}`, suggestion);

            // Update loading progress
            this.updateLoadingProgress(index + 1, suggestion.name);

            // Generate basic service details
            const details = await AIService.generateServiceDetails(suggestion, mainCategory, subCategory);
            
            if (!details) {
                throw new Error('No details received from AI service');
            }

            // Generate gallery examples
            const galleryExamples = await AIService.generateGalleryExamples(
                { ...suggestion, title: details.title }, 
                subCategory
            );

            // Create service details component
            const serviceDetail = new ServiceDetails(suggestion, {
                ...details,
                galleryExamples
            });

            this.logDebug(`Service ${index + 1} generated successfully`, serviceDetail.getData());

            // Notify about individual service creation
            if (this.onServiceCreatedCallback) {
                this.onServiceCreatedCallback(serviceDetail, index);
            }

            return serviceDetail;

        } catch (error) {
            logError(`Error generating service ${index + 1}:`, error);
            throw error;
        }
    }

    /**
     * Show loading section
     */
    showLoadingSection() {
        const loadingSection = document.getElementById('loadingSection');
        if (loadingSection) {
            loadingSection.classList.remove('d-none');
            loadingSection.classList.add('animate-fade-in');
        }
    }

    /**
     * Hide loading section
     */
    hideLoadingSection() {
        const loadingSection = document.getElementById('loadingSection');
        if (loadingSection) {
            loadingSection.classList.add('d-none');
            loadingSection.classList.remove('animate-fade-in');
        }
    }

    /**
     * Update loading progress
     * @param {number} current 
     * @param {string} serviceName 
     */
    updateLoadingProgress(current, serviceName) {
        const loadingSection = document.getElementById('loadingSection');
        if (loadingSection) {
            const cardBody = loadingSection.querySelector('.card-body');
            if (cardBody) {
                cardBody.innerHTML = `
                    <div class="text-center p-5">
                        <div class="spinner-border text-primary mb-4" role="status" style="width: 4rem; height: 4rem;">
                            <span class="visually-hidden">جاري التحميل...</span>
                        </div>
                        <h3 class="text-primary mb-3">جاري إنشاء التفاصيل...</h3>
                        <p class="text-muted mb-3">العمل على خدمة: ${serviceName}</p>
                        <div class="progress mb-3">
                            <div class="progress-bar bg-primary" role="progressbar" style="width: ${(current / this.getCurrentServiceCount()) * 100}%" aria-valuenow="${current}" aria-valuemin="0" aria-valuemax="${this.getCurrentServiceCount()}"></div>
                        </div>
                        <small class="text-muted">خدمة ${current} من ${this.getCurrentServiceCount()}</small>
                    </div>
                `;
            }
        }
    }

    /**
     * Show service details section
     */
    showServiceDetailsSection() {
        this.serviceDetailsSection.classList.remove('d-none');
        this.serviceDetailsSection.classList.add('animate-fade-in');
    }

    /**
     * Hide service details section
     */
    hideServiceDetailsSection() {
        this.serviceDetailsSection.classList.add('d-none');
        this.serviceDetailsSection.classList.remove('animate-fade-in');
    }

    /**
     * Clear all services
     */
    clearServices() {
        this.container.clear();
        this.currentServices.clear();
    }

    /**
     * Set loading state
     * @param {boolean} loading 
     */
    setLoadingState(loading) {
        this.isLoading = loading;
    }

    /**
     * Get current service count for progress calculation
     * @returns {number}
     */
    getCurrentServiceCount() {
        // This would be set when starting generation
        return this._currentServiceCount || 1;
    }

    /**
     * Set current service count
     * @param {number} count 
     */
    setCurrentServiceCount(count) {
        this._currentServiceCount = count;
    }

    /**
     * Get service by ID
     * @param {string} serviceId 
     * @returns {ServiceDetails}
     */
    getServiceById(serviceId) {
        return this.currentServices.get(serviceId);
    }

    /**
     * Get all services
     * @returns {Array<ServiceDetails>}
     */
    getAllServices() {
        return Array.from(this.currentServices.values());
    }

    /**
     * Update service details
     * @param {string} serviceId 
     * @param {Object} newDetails 
     */
    updateService(serviceId, newDetails) {
        const service = this.getServiceById(serviceId);
        if (service) {
            service.updateDetails(newDetails);
            this.logDebug('Service updated', { serviceId, newDetails });
        }
    }

    /**
     * Remove service
     * @param {string} serviceId 
     */
    removeService(serviceId) {
        const service = this.getServiceById(serviceId);
        if (service) {
            service.cleanup();
            this.currentServices.delete(serviceId);
            
            // Remove from DOM
            const element = document.querySelector(`[data-service-id="${serviceId}"]`);
            if (element) {
                element.remove();
            }
            
            this.logDebug('Service removed', serviceId);
        }
    }

    /**
     * Export all services
     * @param {string} format - 'json' or 'text'
     * @returns {string}
     */
    exportAllServices(format = 'json') {
        return this.container.exportAll(format);
    }

    /**
     * Export single service
     * @param {string} serviceId 
     * @param {string} format 
     * @returns {string}
     */
    exportService(serviceId, format = 'json') {
        const service = this.getServiceById(serviceId);
        if (service) {
            return format === 'json' ? service.exportAsJSON() : service.exportAsText();
        }
        return null;
    }

    /**
     * Download service export
     * @param {string} serviceId 
     * @param {string} format 
     */
    downloadServiceExport(serviceId, format = 'json') {
        const service = this.getServiceById(serviceId);
        if (service) {
            const content = this.exportService(serviceId, format);
            const filename = `${service.details.title}-export.${format}`;
            const mimeType = format === 'json' ? 'application/json' : 'text/plain';
            
            this.downloadFile(content, filename, mimeType);
        }
    }

    /**
     * Download all services export
     * @param {string} format 
     */
    downloadAllServicesExport(format = 'json') {
        const content = this.exportAllServices(format);
        const filename = `خدمات-خمسات-تصدير-${new Date().toISOString().split('T')[0]}.${format}`;
        const mimeType = format === 'json' ? 'application/json' : 'text/plain';
        
        this.downloadFile(content, filename, mimeType);
    }

    /**
     * Download file
     * @param {string} content 
     * @param {string} filename 
     * @param {string} mimeType 
     */
    downloadFile(content, filename, mimeType) {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Cleanup
        URL.revokeObjectURL(url);
    }

    /**
     * Get service statistics
     * @returns {Object}
     */
    getStatistics() {
        const services = this.getAllServices();
        const totalFeatures = services.reduce((sum, service) => 
            sum + (service.details.features?.length || 0), 0);
        const totalDeliverables = services.reduce((sum, service) => 
            sum + (service.details.deliverables?.length || 0), 0);
        const totalKeywords = services.reduce((sum, service) => 
            sum + (service.details.keywords?.length || 0), 0);

        return {
            totalServices: services.length,
            totalFeatures,
            totalDeliverables,
            totalKeywords,
            averagePrice: services.length > 0 
                ? services.reduce((sum, service) => sum + service.service.price, 0) / services.length 
                : 0,
            createdAt: new Date().toISOString()
        };
    }

    /**
     * Regenerate service details
     * @param {string} serviceId 
     * @param {string} mainCategory 
     * @param {string} subCategory 
     */
    async regenerateService(serviceId, mainCategory, subCategory) {
        const service = this.getServiceById(serviceId);
        if (!service) {
            showToast('الخدمة غير موجودة', 'error');
            return;
        }

        try {
            this.setLoadingState(true);
            showToast('جاري إعادة إنشاء تفاصيل الخدمة...', 'info');

            const newDetails = await AIService.generateServiceDetails(
                service.service, 
                mainCategory, 
                subCategory
            );

            if (newDetails) {
                service.updateDetails(newDetails);
                showToast('تم إعادة إنشاء تفاصيل الخدمة بنجاح', 'success');
            } else {
                throw new Error('No details received');
            }

        } catch (error) {
            logError('Error regenerating service:', error);
            showToast('حدث خطأ في إعادة إنشاء تفاصيل الخدمة', 'error');
        } finally {
            this.setLoadingState(false);
        }
    }

    /**
     * Set callback for service created
     * @param {Function} callback 
     */
    onServiceCreated(callback) {
        this.onServiceCreatedCallback = callback;
    }

    /**
     * Set callback for all services created
     * @param {Function} callback 
     */
    onAllServicesCreated(callback) {
        this.onAllServicesCreatedCallback = callback;
    }

    /**
     * Reset controller state
     */
    reset() {
        this.clearServices();
        this.hideServiceDetailsSection();
        this.hideLoadingSection();
        this.setLoadingState(false);
        this._currentServiceCount = 0;
    }

    /**
     * Debug logging
     * @param {string} message 
     * @param {any} data 
     */
    logDebug(message, data = null) {
        if (window.ENV && window.ENV.isDev()) {
            console.log(`[ServiceController] ${message}`, data);
        }
    }

    /**
     * Validate service data
     * @param {Object} serviceData 
     * @returns {boolean}
     */
    validateServiceData(serviceData) {
        return serviceData && 
               serviceData.title && 
               serviceData.description && 
               Array.isArray(serviceData.features) && 
               Array.isArray(serviceData.deliverables);
    }

    /**
     * Save services to session storage
     */
    saveServicesToSession() {
        try {
            const servicesData = this.getAllServices().map(service => service.getData());
            sessionStorage.setItem('generatedServices', JSON.stringify(servicesData));
        } catch (error) {
            logError('Error saving services to session:', error);
        }
    }

    /**
     * Load services from session storage
     */
    async loadServicesFromSession() {
        try {
            const servicesData = sessionStorage.getItem('generatedServices');
            if (servicesData) {
                const services = JSON.parse(servicesData);
                
                for (const serviceData of services) {
                    const serviceDetail = new ServiceDetails(serviceData.service, serviceData.details);
                    await this.container.addServiceDetail(serviceDetail);
                    this.currentServices.set(serviceDetail.id, serviceDetail);
                }
                
                if (services.length > 0) {
                    this.showServiceDetailsSection();
                }
            }
        } catch (error) {
            logError('Error loading services from session:', error);
        }
    }

    /**
     * Clear session storage
     */
    clearSessionStorage() {
        try {
            sessionStorage.removeItem('generatedServices');
        } catch (error) {
            logError('Error clearing session storage:', error);
        }
    }

    /**
     * Destroy controller and cleanup
     */
    destroy() {
        // Save current state
        this.saveServicesToSession();
        
        // Cleanup all services
        this.getAllServices().forEach(service => service.cleanup());
        
        // Clear references
        this.onServiceCreatedCallback = null;
        this.onAllServicesCreatedCallback = null;
        
        this.logDebug('Controller destroyed');
    }
}
