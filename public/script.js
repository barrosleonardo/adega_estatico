document.addEventListener('DOMContentLoaded', function() {
    // Smooth scrolling
    window.scrollToSection = function(sectionId) {
        const element = document.getElementById(sectionId);
        if (element) {
            window.dataLayer = window.dataLayer || [];
            window.dataLayer.push({
                'event': 'menu_click',
                'link_id': sectionId
            });
            element.scrollIntoView({ behavior: 'smooth' });
            const mobileMenu = document.getElementById('mobile-menu');
            if (mobileMenu) {
                mobileMenu.classList.remove('active');
            }
        }
    }

    // Mobile menu toggle
    window.toggleMobileMenu = function() {
        const mobileMenu = document.getElementById('mobile-menu');
        if (mobileMenu) {
            mobileMenu.classList.toggle('active');
        }
    }

    // FAQ toggle
    window.toggleFaq = function(index) {
        const content = document.getElementById('faq-' + index);
        if (content) {
            const isActive = content.classList.contains('active');
            const allContents = document.querySelectorAll('.faq-content');
            allContents.forEach(item => {
                if (item.id !== 'faq-' + index) {
                     item.classList.remove('active');
                }
            });
            if (!isActive) {
                content.classList.add('active');
            } else {
                content.classList.remove('active');
            }
        }
    }

    // Form submission
    const vipForm = document.getElementById('vip-form');
    if (vipForm) {
        vipForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            const submitButton = e.target.querySelector('button[type="submit"]');
            const messageDiv = document.getElementById('form-message');
            const token = grecaptcha.getResponse();
            if (token.length === 0) {
                messageDiv.textContent = "Por favor, marque a caixa 'Não sou um robô'.";
                messageDiv.style.color = 'var(--destructive)';
                return;
            }
            const data = {
                token: token,
                nome: document.getElementById('name').value,
                email: document.getElementById('email').value,
                whatsapp: document.getElementById('whatsapp').value,
                cidade_uf: document.getElementById('city').value,
                perfil: document.querySelector('input[name="perfil"]:checked').value,
                mensagem: document.getElementById('message').value,
                consentimento: document.getElementById('consent').checked
            };
            const hiddenInputs = e.target.querySelectorAll('input[type="hidden"]');
            hiddenInputs.forEach(input => {
                if (input.name !== '_honeypot') {
                    data[input.name] = input.value;
                }
            });
            submitButton.disabled = true;
            messageDiv.textContent = 'Enviando...';
            messageDiv.style.color = 'var(--muted-foreground)';
            try {
                const response = await fetch('/submit-form', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data),
                });
                const result = await response.json();
                if (response.ok) {
                    window.dataLayer = window.dataLayer || [];
                    window.dataLayer.push({ 'event': 'generate_lead', 'form_location': 'vip_signup' });
                    messageDiv.textContent = 'Obrigado! Seus dados foram enviados com sucesso.';
                    messageDiv.style.color = 'green';
                    e.target.reset();
                    grecaptcha.reset();
                } else {
                    throw new Error(result.message || 'Falha no envio.');
                }
            } catch (error) {
                 window.dataLayer = window.dataLayer || [];
                 window.dataLayer.push({ 'event': 'form_submission', 'event_category': 'error', 'event_label': 'vip-form-failure' });
                messageDiv.textContent = error.message || 'Ocorreu um erro ao enviar. Por favor, tente novamente.';
                messageDiv.style.color = 'var(--destructive)';
            } finally {
                submitButton.disabled = false;
            }
        });
    }

    // Scroll Reveal
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };
    function handleIntersect(entries, observer) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }
    const observer = new IntersectionObserver(handleIntersect, observerOptions);
    document.querySelectorAll('.fade-in').forEach(element => {
        observer.observe(element);
    });

    // URL parameters and form tracking
    const urlParams = new URLSearchParams(window.location.search);
    const hiddenFields = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'gclid'];
    const formForParams = document.getElementById('vip-form');
    if(formForParams){
        hiddenFields.forEach(field => {
            const value = urlParams.get(field);
            if (value) {
                const input = document.createElement('input');
                input.type = 'hidden';
                input.name = field;
                input.value = value;
                formForParams.appendChild(input);
            }
        });
        const pageInfoFields = [
            { name: 'page_url', value: window.location.href },
            { name: 'referrer', value: document.referrer },
            { name: 'user_agent', value: navigator.userAgent },
            { name: 'lead_source', value: 'site-estatico' },
            { name: 'tag', value: 'pre-lancamento' }
        ];
        pageInfoFields.forEach(field => {
            const input = document.createElement('input');
            input.type = 'hidden';
            input.name = field.name;
            input.value = field.value;
            formForParams.appendChild(input);
        });
    }

    // WhatsApp mask
    const whatsappInput = document.getElementById('whatsapp');
    if(whatsappInput){
        whatsappInput.addEventListener('input', function (e) {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length > 11) {
                value = value.substring(0, 11);
            }
            value = value.replace(/^(\d{2})(\d)/g, '($1) $2');
            if (value.length > 10) {
                value = value.replace(/(\d{5})(\d{4})$/, '$1-$2');
            } else {
                value = value.replace(/(\d{4})(\d{4})$/, '$1-$2');
            }
            e.target.value = value;
        });
    }
});
