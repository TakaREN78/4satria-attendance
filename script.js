// Configuration
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwAQl37P2RVo2oEbb_gSfFbn9dmwxM5AU_l_PyGB64J_HZoj_QcRnEigC2-50vpuDGnxQ/exec';

// Global variables
let studentsData = [];

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', function () {
    loadStudentData();
    initializeEventListeners();
    setMinDate();
});

// Load student data from CSV
async function loadStudentData() {
    try {
        const response = await fetch('murid4Satria.csv');
        const csvText = await response.text();

        // Parse CSV - use single backslash for newline
        const lines = csvText.split('\n');
        const studentSelect = document.getElementById('studentName');

        // Skip only the header line (index 0), start from line 2 (index 1)
        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (line) {
                // Split by comma and get the name (second column)
                const parts = line.split(',');
                if (parts.length >= 2 && parts[1]) {
                    const studentName = parts[1].trim();
                    if (studentName) {
                        studentsData.push(studentName);
                        const option = document.createElement('option');
                        option.value = studentName;
                        option.textContent = studentName;
                        studentSelect.appendChild(option);
                    }
                }
            }
        }
    } catch (error) {
        console.error('Error loading student data:', error);
        alert('Ralat memuatkan senarai pelajar. Sila refresh halaman.');
    }
}

// Initialize all event listeners
function initializeEventListeners() {
    // Reason selection change
    document.getElementById('reason').addEventListener('change', handleReasonChange);

    // Illness type change
    document.getElementById('illnessType').addEventListener('change', handleIllnessTypeChange);

    // Date changes
    document.getElementById('startDate').addEventListener('change', calculateDuration);
    document.getElementById('endDate').addEventListener('change', calculateDuration);

    // File uploads
    document.getElementById('mcUpload').addEventListener('change', handleFilePreview);
    document.getElementById('letterUpload').addEventListener('change', handleFilePreview);

    // Form submission
    document.getElementById('attendanceForm').addEventListener('submit', handleSubmit);
}

// Set minimum date to today
function setMinDate() {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('startDate').setAttribute('min', today);
    document.getElementById('endDate').setAttribute('min', today);
}

// Handle reason selection change
function handleReasonChange(e) {
    const reason = e.target.value;
    const illnessTypeGroup = document.getElementById('illnessTypeGroup');
    const otherIllnessGroup = document.getElementById('otherIllnessGroup');
    const otherReasonGroup = document.getElementById('otherReasonGroup');
    const mcUploadGroup = document.getElementById('mcUploadGroup');
    const letterUploadGroup = document.getElementById('letterUploadGroup');

    // Reset visibility
    illnessTypeGroup.style.display = 'none';
    otherIllnessGroup.style.display = 'none';
    otherReasonGroup.style.display = 'none';
    mcUploadGroup.style.display = 'none';
    letterUploadGroup.style.display = 'none';

    // Reset required attributes - files are now optional
    document.getElementById('illnessType').removeAttribute('required');
    document.getElementById('otherIllness').removeAttribute('required');
    document.getElementById('otherReason').removeAttribute('required');

    if (reason === 'Sakit') {
        // Show illness type and MC upload
        illnessTypeGroup.style.display = 'block';
        illnessTypeGroup.classList.add('slide-down');
        mcUploadGroup.style.display = 'block';
        mcUploadGroup.classList.add('slide-down');

        document.getElementById('illnessType').setAttribute('required', 'required');
    } else if (reason === 'Lain-Lain') {
        // Show custom reason input and letter upload
        otherReasonGroup.style.display = 'block';
        otherReasonGroup.classList.add('slide-down');
        letterUploadGroup.style.display = 'block';
        letterUploadGroup.classList.add('slide-down');

        document.getElementById('otherReason').setAttribute('required', 'required');
    } else if (reason) {
        // Show letter upload for other reasons
        letterUploadGroup.style.display = 'block';
        letterUploadGroup.classList.add('slide-down');
    }
}

// Handle illness type change
function handleIllnessTypeChange(e) {
    const illnessType = e.target.value;
    const otherIllnessGroup = document.getElementById('otherIllnessGroup');

    if (illnessType === 'Lain-lain') {
        otherIllnessGroup.style.display = 'block';
        otherIllnessGroup.classList.add('slide-down');
        document.getElementById('otherIllness').setAttribute('required', 'required');
    } else {
        otherIllnessGroup.style.display = 'none';
        document.getElementById('otherIllness').removeAttribute('required');
    }
}

// Calculate duration between dates
function calculateDuration() {
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;
    const durationDisplay = document.getElementById('durationDisplay');

    if (startDate && endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);

        // Validate end date is not before start date
        if (end < start) {
            durationDisplay.textContent = 'Tarikh tidak sah';
            durationDisplay.style.background = 'linear-gradient(135deg, #ef4444, #dc2626)';
            document.getElementById('endDate').setCustomValidity('Tarikh tamat mesti selepas tarikh mula');
            return;
        } else {
            document.getElementById('endDate').setCustomValidity('');
        }

        // Calculate difference in days (inclusive)
        const diffTime = Math.abs(end - start);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

        durationDisplay.textContent = `${diffDays} hari`;
        durationDisplay.style.background = 'linear-gradient(135deg, #2563eb, #10b981)';
    } else {
        durationDisplay.textContent = '-';
        durationDisplay.style.background = 'linear-gradient(135deg, #2563eb, #10b981)';
    }
}

// Handle file preview
function handleFilePreview(e) {
    const file = e.target.files[0];
    const previewId = e.target.id === 'mcUpload' ? 'mcPreview' : 'letterPreview';
    const preview = document.getElementById(previewId);

    if (file) {
        // Check if it's an image
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = function (event) {
                preview.innerHTML = `
                    <img src="${event.target.result}" alt="Preview">
                    <span class="file-name">${file.name}</span>
                `;
            };
            reader.readAsDataURL(file);
        } else {
            preview.innerHTML = `<span class="file-name">${file.name}</span>`;
        }
    } else {
        preview.innerHTML = '';
    }
}

// Validate form
function validateForm() {
    const form = document.getElementById('attendanceForm');

    if (!form.checkValidity()) {
        form.reportValidity();
        return false;
    }

    return true;
}

// Format date to Malaysian format
function formatDate(dateString) {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
}

// Handle form submission
async function handleSubmit(e) {
    e.preventDefault();

    if (!validateForm()) {
        return;
    }

    // Show loading indicator
    const loadingIndicator = document.getElementById('loadingIndicator');
    const submitBtn = document.getElementById('submitBtn');

    loadingIndicator.style.display = 'block';
    submitBtn.disabled = true;

    try {
        // Prepare form data
        const formData = await prepareFormData();

        // Submit to Google Sheets
        await submitToGoogleSheets(formData);

        // Show simple success message
        alert('Maklumat berjaya dihantar!\\n\\nTerima kasih.');

        // Reset form
        document.getElementById('attendanceForm').reset();
        document.getElementById('durationDisplay').textContent = '-';

    } catch (error) {
        console.error('Error submitting form:', error);
        alert('Ralat menghantar maklumat. Sila cuba lagi atau hubungi pentadbir.');
    } finally {
        loadingIndicator.style.display = 'none';
        submitBtn.disabled = false;
    }
}

// Prepare form data for submission
async function prepareFormData() {
    const formData = new FormData();

    // Basic information
    formData.append('studentName', document.getElementById('studentName').value);

    // Handle reason - use custom reason if Lain-Lain
    let reason = document.getElementById('reason').value;
    if (reason === 'Lain-Lain') {
        reason = document.getElementById('otherReason').value;
    }
    formData.append('reason', reason);

    formData.append('startDate', document.getElementById('startDate').value);
    formData.append('endDate', document.getElementById('endDate').value);
    formData.append('duration', document.getElementById('durationDisplay').textContent);

    // Illness type if applicable
    const reasonSelect = document.getElementById('reason').value;
    if (reasonSelect === 'Sakit') {
        const illnessType = document.getElementById('illnessType').value;
        if (illnessType === 'Lain-lain') {
            formData.append('illnessType', document.getElementById('otherIllness').value);
        } else {
            formData.append('illnessType', illnessType);
        }

        // MC file (optional)
        const mcFile = document.getElementById('mcUpload').files[0];
        if (mcFile) {
            formData.append('document', mcFile);
            formData.append('documentType', 'MC');
        }
    } else {
        formData.append('illnessType', '-');

        // Letter file (optional)
        const letterFile = document.getElementById('letterUpload').files[0];
        if (letterFile) {
            formData.append('document', letterFile);
            formData.append('documentType', 'Surat');
        }
    }

    return formData;
}

// Submit to Google Sheets
async function submitToGoogleSheets(formData) {
    // Convert FormData to JSON for Google Apps Script
    const data = {};
    for (let [key, value] of formData.entries()) {
        if (key === 'document') {
            // Convert file to base64
            data[key] = await fileToBase64(value);
            data['fileName'] = value.name;
            data['fileType'] = value.type;
        } else {
            data[key] = value;
        }
    }

    // Add timestamp
    data.timestamp = new Date().toISOString();

    // Submit to Google Apps Script
    const response = await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
    });

    // Also log for debugging
    console.log('Data submitted:', data);
}

// Convert file to base64
function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}
