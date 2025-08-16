class JobRoleClassifier {
    constructor() {
        this.templateFile = null;
        this.realtimeFile = null;
        this.isProcessing = false;
        this.results = null;
        
        this.initializeElements();
        this.bindEvents();
        this.initializeFileUploads();
    }

    initializeElements() {
        this.templateUpload = document.getElementById('templateUpload') || null;
        this.realtimeUpload = document.getElementById('realtimeUpload') || null;
        this.templateFileInput = document.getElementById('templateFile') || null;
        this.realtimeFileInput = document.getElementById('realtimeFile') || null;
        this.templateInfo = document.getElementById('templateInfo') || null;
        this.realtimeInfo = document.getElementById('realtimeInfo') || null;
        this.trainButton = document.getElementById('trainButton') || null;
        this.downloadBtn = document.getElementById('downloadBtn') || null;
        this.viewBtn = document.getElementById('viewBtn') || null;
        this.resetButton = document.getElementById('resetButton') || null;
        this.closeModal = document.getElementById('closeModal') || null;
        this.uploadSection = document.getElementById('uploadSection') || null;
        this.processingSection = document.getElementById('processingSection') || null;
        this.resultsSection = document.getElementById('resultsSection') || null;
        this.resultsModal = document.getElementById('resultsModal') || null;
        this.progressFill = document.getElementById('progressFill') || null;
        this.processedCount = document.getElementById('processedCount') || null;
        this.accuracyRate = document.getElementById('accuracyRate') || null;
        this.totalClassifications = document.getElementById('totalClassifications') || null;
        this.confidenceScore = document.getElementById('confidenceScore') || null;
        this.processingTime = document.getElementById('processingTime') || null;
        this.jobCategories = document.getElementById('jobCategories') || null;
        this.resultsTableBody = document.getElementById('resultsTableBody') || null;
        this.steps = document.querySelectorAll('.step');

        // Debug: Verify elements
        console.log('templateUpload:', this.templateUpload);
        console.log('realtimeUpload:', this.realtimeUpload);
        console.log('templateFileInput:', this.templateFileInput);
        console.log('realtimeFileInput:', this.realtimeFileInput);
    }

    bindEvents() {
        if (this.trainButton) {
            this.trainButton.addEventListener('click', () => this.startTraining());
        }
        if (this.downloadBtn) {
            this.downloadBtn.addEventListener('click', () => this.downloadResults());
        }
        if (this.viewBtn) {
            this.viewBtn.addEventListener('click', () => this.showResultsModal());
        }
        if (this.resetButton) {
            this.resetButton.addEventListener('click', () => this.reset());
        }
        if (this.closeModal) {
            this.closeModal.addEventListener('click', () => this.hideResultsModal());
        }
        if (this.resultsModal) {
            this.resultsModal.addEventListener('click', (e) => {
                if (e.target === this.resultsModal) {
                    this.hideResultsModal();
                }
            });
        }
    }

    initializeFileUploads() {
        if (this.templateUpload && this.templateFileInput) {
            this.setupFileUpload(this.templateUpload, this.templateFileInput, 'template');
        }
        if (this.realtimeUpload && this.realtimeFileInput) {
            this.setupFileUpload(this.realtimeUpload, this.realtimeFileInput, 'realtime');
        }
    }

    setupFileUpload(uploadArea, fileInput, type) {
        uploadArea.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('Clicked upload area:', type, 'isProcessing:', this.isProcessing);
            if (!this.isProcessing) {
                fileInput.click();
                console.log('File input clicked for:', type);
            }
        });

        fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                this.handleFileSelect(file, type);
            }
        });

        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            if (!this.isProcessing) {
                uploadArea.classList.add('dragover');
            }
        });

        uploadArea.addEventListener('dragleave', () => {
            uploadArea.classList.remove('dragover');
        });

        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('dragover');
            if (!this.isProcessing) {
                const file = e.dataTransfer.files[0];
                if (file) {
                    this.handleFileSelect(file, type);
                }
            }
        });
    }

    handleFileSelect(file, type) {
        const validExtensions = type === 'template' ? ['.xlsx', '.xls'] : ['.csv'];
        const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
        
        if (!validExtensions.includes(fileExtension)) {
            this.showNotification(`Please select a valid ${validExtensions.join(' or ')} file`, 'error');
            return;
        }

        if (type === 'template') {
            this.templateFile = file;
            if (this.templateInfo && this.templateUpload) {
                this.updateFileInfo(this.templateInfo, this.templateUpload, file);
            }
        } else {
            this.realtimeFile = file;
            if (this.realtimeInfo && this.realtimeUpload) {
                this.updateFileInfo(this.realtimeInfo, this.realtimeUpload, file);
            }
        }

        this.updateTrainButton();
    }

    updateFileInfo(infoElement, uploadArea, file) {
        const fileSize = this.formatFileSize(file.size);
        infoElement.innerHTML = `
            <div class="file-tag">
                <span>✓</span>
                <span>${file.name}</span>
                <span>(${fileSize})</span>
            </div>
        `;
        uploadArea.classList.add('has-file');
    }

    updateTrainButton() {
        if (this.trainButton) {
            const canTrain = this.templateFile && this.realtimeFile && !this.isProcessing;
            this.trainButton.disabled = !canTrain;
        }
    }

    async startTraining() {
        if (this.isProcessing || !this.templateFile || !this.realtimeFile) return;

        this.isProcessing = true;
        if (this.trainButton) {
            this.trainButton.classList.add('loading');
        }
        this.updateTrainButton();
        
        this.updateStep(2);
        this.showSection('processing');
        
        await this.simulateProcessing();
        
        this.results = this.generateMockResults();
        
        this.showResults();
        
        this.isProcessing = false;
        if (this.trainButton) {
            this.trainButton.classList.remove('loading');
        }
    }

    async simulateProcessing() {
        const totalSteps = 100;
        const processingTime = 3000;
        const stepTime = processingTime / totalSteps;
        
        for (let i = 0; i <= totalSteps; i++) {
            await this.sleep(stepTime);
            
            if (this.progressFill) {
                this.progressFill.style.width = `${i}%`;
            }
            
            const processed = Math.floor((i / 100) * 150 + Math.random() * 10);
            const accuracy = Math.floor(85 + (i / 100) * 10 + Math.random() * 3);
            
            if (this.processedCount) {
                this.processedCount.textContent = processed;
            }
            if (this.accuracyRate) {
                this.accuracyRate.textContent = `${Math.min(accuracy, 98)}%`;
            }
        }
    }

    generateMockResults() {
        const jobTitles = [
            'Senior Software Engineer', 'Product Manager', 'Data Scientist', 'UX Designer',
            'Marketing Specialist', 'Sales Representative', 'DevOps Engineer', 'Business Analyst',
            'Frontend Developer', 'Backend Developer', 'QA Engineer', 'Project Manager',
            'Machine Learning Engineer', 'Technical Writer', 'Customer Success Manager'
        ];

        const departments = ['Engineering', 'Product', 'Marketing', 'Sales', 'Operations'];
        
        const categories = {
            'Technology': { count: 45, color: '#4f46e5' },
            'Management': { count: 28, color: '#06b6d4' },
            'Design': { count: 22, color: '#f59e0b' },
            'Sales & Marketing': { count: 35, color: '#10b981' },
            'Operations': { count: 20, color: '#ef4444' }
        };

        const results = [];
        let totalRecords = 150;

        for (let i = 1; i <= totalRecords; i++) {
            const jobTitle = jobTitles[Math.floor(Math.random() * jobTitles.length)];
            const department = departments[Math.floor(Math.random() * departments.length)];
            const categoryKeys = Object.keys(categories);
            const classifiedRole = categoryKeys[Math.floor(Math.random() * categoryKeys.length)];
            const confidence = Math.floor(Math.random() * 30) + 70;

            results.push({
                id: i,
                jobTitle,
                classifiedRole,
                confidence,
                department
            });
        }

        return {
            records: results,
            categories,
            totalRecords,
            averageConfidence: 92,
            processingTime: 3.2
        };
    }

    showResults() {
        this.updateStep(3);
        this.showSection('results');
        
        if (this.totalClassifications) {
            this.totalClassifications.textContent = this.results.totalRecords;
        }
        if (this.confidenceScore) {
            this.confidenceScore.textContent = `${this.results.averageConfidence}%`;
        }
        if (this.processingTime) {
            this.processingTime.textContent = `${this.results.processingTime}s`;
        }
        
        this.populateJobCategories();
        this.populateResultsTable();
    }

    populateJobCategories() {
        if (!this.jobCategories) return;
        const maxCount = Math.max(...Object.values(this.results.categories).map(cat => cat.count));
        
        this.jobCategories.innerHTML = Object.entries(this.results.categories)
            .map(([name, data]) => {
                const percentage = Math.round((data.count / maxCount) * 100);
                return `
                    <div class="category-card">
                        <div class="category-header">
                            <span class="category-name">${name}</span>
                            <span class="category-count">${data.count}</span>
                        </div>
                        <div class="category-bar">
                            <div class="category-fill" style="width: ${percentage}%; background: ${data.color};"></div>
                        </div>
                    </div>
                `;
            })
            .join('');
    }

    populateResultsTable() {
        if (!this.resultsTableBody) return;
        this.resultsTableBody.innerHTML = this.results.records
            .slice(0, 50)
            .map(record => {
                const confidenceClass = record.confidence >= 90 ? 'confidence-high' :
                                      record.confidence >= 75 ? 'confidence-medium' : 'confidence-low';
                
                return `
                    <tr>
                        <td>${record.id}</td>
                        <td>${record.jobTitle}</td>
                        <td>${record.classifiedRole}</td>
                        <td>
                            <span class="confidence-badge ${confidenceClass}">
                                ${record.confidence}%
                            </span>
                        </td>
                        <td>${record.department}</td>
                    </tr>
                `;
            })
            .join('');
    }

    showSection(sectionName) {
        if (this.uploadSection) this.uploadSection.classList.add('hidden');
        if (this.processingSection) this.processingSection.classList.add('hidden');
        if (this.resultsSection) this.resultsSection.classList.add('hidden');
        
        if (sectionName === 'upload' && this.uploadSection) {
            this.uploadSection.classList.remove('hidden');
        } else if (sectionName === 'processing' && this.processingSection) {
            this.processingSection.classList.remove('hidden');
        } else if (sectionName === 'results' && this.resultsSection) {
            this.resultsSection.classList.remove('hidden');
        }
    }

    updateStep(stepNumber) {
        this.steps.forEach((step, index) => {
            const stepNum = index + 1;
            step.classList.remove('active', 'completed');
            
            if (stepNum < stepNumber) {
                step.classList.add('completed');
            } else if (stepNum === stepNumber) {
                step.classList.add('active');
            }
        });
    }

    showResultsModal() {
        if (this.resultsModal) {
            this.resultsModal.classList.remove('hidden');
            document.body.style.overflow = 'hidden';
        }
    }

    hideResultsModal() {
        if (this.resultsModal) {
            this.resultsModal.classList.add('hidden');
            document.body.style.overflow = 'auto';
        }
    }

    downloadResults() {
        if (!this.results) return;

        const headers = ['ID', 'Job Title', 'Classified Role', 'Confidence', 'Department'];
        const csvContent = [
            headers.join(','),
            ...this.results.records.map(record => 
                [record.id, `"${record.jobTitle}"`, record.classifiedRole, `${record.confidence}%`, record.department].join(',')
            )
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `job_classification_results_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);

        this.showNotification('Results downloaded successfully!', 'success');
    }

    reset() {
        this.templateFile = null;
        this.realtimeFile = null;
        this.results = null;
        this.isProcessing = false;
        
        if (this.templateFileInput) this.templateFileInput.value = '';
        if (this.realtimeFileInput) this.realtimeFileInput.value = '';
        if (this.templateInfo) this.templateInfo.innerHTML = '';
        if (this.realtimeInfo) this.realtimeInfo.innerHTML = '';
        if (this.templateUpload) this.templateUpload.classList.remove('has-file');
        if (this.realtimeUpload) this.realtimeUpload.classList.remove('has-file');
        
        if (this.progressFill) this.progressFill.style.width = '0%';
        if (this.processedCount) this.processedCount.textContent = '0';
        if (this.accuracyRate) this.accuracyRate.textContent = '0%';
        
        this.updateTrainButton();
        this.updateStep(1);
        this.showSection('upload');
        
        this.showNotification('Ready for new classification!', 'info');
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        Object.assign(notification.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            padding: '12px 20px',
            borderRadius: '8px',
            color: 'white',
            fontWeight: '500',
            zIndex: '10000',
            animation: 'slideInRight 0.3s ease-out',
            maxWidth: '300px'
        });
        
        const colors = {
            success: '#10b981',
            error: '#ef4444',
            warning: '#f59e0b',
            info: '#3b82f6'
        };
        notification.style.backgroundColor = colors[type] || colors.info;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease-out';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            opacity: 0;
            transform: translateX(100%);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }

    @keyframes slideOutRight {
        from {
            opacity: 1;
            transform: translateX(0);
        }
        to {
            opacity: 0;
            transform: translateX(100%);
        }
    }

    .file-input-wrapper.dragover {
        border-color: rgba(255, 255, 255, 0.6);
        background: rgba(255, 255, 255, 0.2);
    }

    .file-input-wrapper.has-file {
        border-style: solid;
    }

    .file-tag {
        display: flex;
        gap: 10px;
        align-items: center;
        margin-top: 10px;
        color: var(--text-primary);
    }

    .train-button.loading {
        opacity: 0.7;
        cursor: not-allowed;
    }
`;
document.head.appendChild(style);

document.addEventListener('DOMContentLoaded', () => {
    new JobRoleClassifier();
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        const modal = document.getElementById('resultsModal');
        if (modal && !modal.classList.contains('hidden')) {
            modal.classList.add('hidden');
            document.body.style.overflow = 'auto';
        }
    }
});