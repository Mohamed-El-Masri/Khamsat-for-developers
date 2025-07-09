/**
 * Environment Configuration
 * يدير إعدادات البيئة للتطبيق في المتصفح
 */

(function() {
    'use strict';

    class Environment {
        constructor() {
            // تحديد البيئة بناءً على URL أو localStorage
            this.isDevelopment = this.detectEnvironment();
            this.isProduction = !this.isDevelopment;
        }

        /**
         * كشف البيئة الحالية
         * @returns {boolean} true إذا كانت بيئة التطوير
         */
        detectEnvironment() {
            // فحص localStorage أولاً
            const storedEnv = localStorage.getItem('app_environment');
            if (storedEnv) {
                return storedEnv === 'development';
            }

            // فحص URL
            const hostname = window.location.hostname;
            const isDev = hostname === 'localhost' || 
                         hostname === '127.0.0.1' || 
                         hostname.includes('dev') ||
                         hostname.includes('test') ||
                         window.location.port !== '';

            return isDev;
        }

        /**
         * تحديد البيئة يدوياً
         * @param {'development'|'production'} env 
         */
        setEnvironment(env) {
            this.isDevelopment = env === 'development';
            this.isProduction = !this.isDevelopment;
            localStorage.setItem('app_environment', env);
        }

        /**
         * الحصول على اسم البيئة
         * @returns {string}
         */
        getEnvironment() {
            return this.isDevelopment ? 'development' : 'production';
        }

        /**
         * فحص إذا كانت بيئة التطوير
         * @returns {boolean}
         */
        isDev() {
            return this.isDevelopment;
        }

        /**
         * فحص إذا كانت بيئة الإنتاج
         * @returns {boolean}
         */
        isProd() {
            return this.isProduction;
        }
    }

    // إنشاء instance واحد للاستخدام في التطبيق
    window.ENV = new Environment();

    // طباعة البيئة الحالية في console
    console.log(`%c🚀 Khamsat AI Service Generator`, 'color: #4CAF50; font-weight: bold; font-size: 16px;');
    console.log(`%cEnvironment: ${window.ENV.getEnvironment()}`, `color: ${window.ENV.isDev() ? '#FF9800' : '#2196F3'}; font-weight: bold;`);
    
})();
