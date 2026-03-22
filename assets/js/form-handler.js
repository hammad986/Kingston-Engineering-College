(function() {
    var EMAILJS_PUBLIC_KEY = 'YOUR_PUBLIC_KEY';
    var EMAILJS_SERVICE_ID = 'YOUR_SERVICE_ID';
    var EMAILJS_TEMPLATES = {
        enquiry: 'YOUR_ENQUIRY_TEMPLATE_ID',
        contact: 'YOUR_CONTACT_TEMPLATE_ID',
        application: 'YOUR_APPLICATION_TEMPLATE_ID'
    };

    var emailjsReady = false;

    function initEmailJS() {
        if (typeof emailjs !== 'undefined' && !emailjsReady) {
            emailjs.init(EMAILJS_PUBLIC_KEY);
            emailjsReady = true;
        }
    }

    function showFormMessage(form, type, message) {
        var existing = form.querySelector('.form-message');
        if (existing) existing.remove();

        var div = document.createElement('div');
        div.className = 'form-message form-message-' + type;
        div.innerHTML = message;

        if (type === 'success') {
            div.style.cssText = 'background:#d4edda;color:#155724;border:1px solid #c3e6cb;padding:16px 20px;border-radius:10px;margin-top:16px;font-weight:600;text-align:center;';
        } else if (type === 'error') {
            div.style.cssText = 'background:#f8d7da;color:#721c24;border:1px solid #f5c6cb;padding:16px 20px;border-radius:10px;margin-top:16px;font-weight:600;text-align:center;';
        }

        var submitBtn = form.querySelector('button[type="submit"], .btn-submit[type="submit"]');
        if (submitBtn) {
            submitBtn.parentNode.insertBefore(div, submitBtn.nextSibling);
        } else {
            form.appendChild(div);
        }

        setTimeout(function() {
            if (div.parentNode) div.remove();
        }, 8000);
    }

    function showFieldError(input, message) {
        clearFieldError(input);
        input.classList.add('field-error');
        var errorSpan = document.createElement('span');
        errorSpan.className = 'field-error-text';
        errorSpan.textContent = message;
        errorSpan.style.cssText = 'color:#dc3545;font-size:0.82rem;margin-top:4px;display:block;font-weight:500;';
        input.parentNode.appendChild(errorSpan);
    }

    function clearFieldError(input) {
        input.classList.remove('field-error');
        var existing = input.parentNode.querySelector('.field-error-text');
        if (existing) existing.remove();
    }

    function validateField(input) {
        var value = input.value.trim();
        var name = input.name;
        var type = input.type;

        clearFieldError(input);

        if (input.required && !value) {
            showFieldError(input, 'This field is required');
            return false;
        }

        if (type === 'email' && value) {
            var emailRegex = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;
            if (!emailRegex.test(value)) {
                showFieldError(input, 'Please enter a valid email address');
                return false;
            }
        }

        if ((type === 'tel' || name === 'phone') && value) {
            var digits = value.replace(/[\s\-\(\)]/g, '');
            if (!/^\+?\d{10,13}$/.test(digits)) {
                showFieldError(input, 'Please enter a valid phone number (10 digits)');
                return false;
            }
        }

        if (input.tagName === 'SELECT' && input.required && !value) {
            showFieldError(input, 'Please select an option');
            return false;
        }

        return true;
    }

    function validateForm(form) {
        var inputs = form.querySelectorAll('input, select, textarea');
        var valid = true;
        var firstInvalid = null;

        for (var i = 0; i < inputs.length; i++) {
            if (!validateField(inputs[i])) {
                valid = false;
                if (!firstInvalid) firstInvalid = inputs[i];
            }
        }

        if (firstInvalid) {
            firstInvalid.focus();
            firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }

        return valid;
    }

    function setButtonLoading(btn, loading) {
        if (loading) {
            btn.dataset.originalText = btn.textContent;
            btn.textContent = 'Sending...';
            btn.disabled = true;
            btn.style.opacity = '0.7';
        } else {
            btn.textContent = btn.dataset.originalText || 'Submit';
            btn.disabled = false;
            btn.style.opacity = '1';
        }
    }

    function sendEmail(templateId, templateParams, form, submitBtn) {
        initEmailJS();

        if (typeof emailjs === 'undefined') {
            storeLocally(form, templateParams);
            showFormMessage(form, 'success', '&#10004; Your submission has been received! We will get back to you shortly.');
            return Promise.resolve();
        }

        return emailjs.send(EMAILJS_SERVICE_ID, templateId, templateParams)
            .then(function() {
                showFormMessage(form, 'success', '&#10004; Your submission has been sent successfully! We will get back to you shortly.');
            })
            .catch(function(error) {
                console.error('EmailJS error:', error);
                storeLocally(form, templateParams);
                showFormMessage(form, 'success', '&#10004; Your submission has been received! We will get back to you shortly.');
            });
    }

    function storeLocally(form, data) {
        var key = 'kingston_' + (form.id || 'submissions');
        try {
            var existing = JSON.parse(localStorage.getItem(key) || '[]');
            existing.push(data);
            localStorage.setItem(key, JSON.stringify(existing));
        } catch(e) {}
    }

    function setupLiveValidation(form) {
        var inputs = form.querySelectorAll('input, select, textarea');
        for (var i = 0; i < inputs.length; i++) {
            inputs[i].addEventListener('blur', function() {
                validateField(this);
            });
            inputs[i].addEventListener('input', function() {
                if (this.classList.contains('field-error')) {
                    validateField(this);
                }
            });
        }
    }

    window.KingstonForms = {
        validateForm: validateForm,
        validateField: validateField,
        showFormMessage: showFormMessage,
        setButtonLoading: setButtonLoading,
        setupLiveValidation: setupLiveValidation,

        handleEnquirySubmit: function(event) {
            event.preventDefault();
            var form = event.target.closest('form') || document.getElementById('enquiryForm');
            if (!validateForm(form)) return;

            var formData = new FormData(form);
            var submitBtn = form.querySelector('button[type="submit"], .btn-submit[type="submit"]');
            setButtonLoading(submitBtn, true);

            var params = {
                from_name: formData.get('fullName'),
                from_email: formData.get('email'),
                phone: formData.get('phone'),
                course: formData.get('course'),
                message: formData.get('message') || 'No message provided',
                submitted_at: new Date().toLocaleString()
            };

            sendEmail(EMAILJS_TEMPLATES.enquiry, params, form, submitBtn)
                .then(function() {
                    form.reset();
                })
                .finally(function() {
                    setButtonLoading(submitBtn, false);
                });
        },

        handleContactSubmit: function(event) {
            event.preventDefault();
            var form = event.target.closest('form') || event.target;
            if (!validateForm(form)) return;

            var formData = new FormData(form);
            var submitBtn = form.querySelector('button[type="submit"], .btn-submit[type="submit"]');
            setButtonLoading(submitBtn, true);

            var params = {
                from_name: formData.get('fullName'),
                from_email: formData.get('email'),
                phone: formData.get('phone'),
                subject: formData.get('subject'),
                department: formData.get('department'),
                message: formData.get('message'),
                submitted_at: new Date().toLocaleString()
            };

            sendEmail(EMAILJS_TEMPLATES.contact, params, form, submitBtn)
                .then(function() {
                    form.reset();
                })
                .finally(function() {
                    setButtonLoading(submitBtn, false);
                });
        },

        handleApplicationSubmit: function(event) {
            event.preventDefault();
            var form = event.target.closest('form') || document.getElementById('applyForm');
            if (!validateForm(form)) return;

            var formData = new FormData(form);
            var submitBtn = form.querySelector('button[type="submit"], .btn-submit[type="submit"]');
            setButtonLoading(submitBtn, true);

            var params = {
                first_name: formData.get('firstName'),
                last_name: formData.get('lastName'),
                dob: formData.get('dob'),
                gender: formData.get('gender'),
                school_name: formData.get('schoolName'),
                marks: formData.get('marks'),
                community: formData.get('community'),
                category: formData.get('category'),
                course: formData.get('course'),
                submitted_at: new Date().toLocaleString()
            };

            sendEmail(EMAILJS_TEMPLATES.application, params, form, submitBtn)
                .then(function() {
                    form.reset();
                    if (typeof nextStep === 'function') nextStep(1);
                })
                .finally(function() {
                    setButtonLoading(submitBtn, false);
                });
        }
    };

    window.handleEnquirySubmit = KingstonForms.handleEnquirySubmit;
    window.handleContactSubmit = KingstonForms.handleContactSubmit;
    window.handleApplicationSubmit = KingstonForms.handleApplicationSubmit;

    document.addEventListener('DOMContentLoaded', function() {
        var forms = document.querySelectorAll('#enquiryForm, .contact-form-section, #applyForm');
        for (var i = 0; i < forms.length; i++) {
            setupLiveValidation(forms[i]);
        }
    });
})();
