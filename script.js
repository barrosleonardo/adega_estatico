var submitted = false;
// Smooth scrolling
function scrollToSection(sectionId) {
    const element = document.getElementById(sectionId);
    if (element) {
        // Envia o evento para o Google Analytics
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({
            'event': 'menu_click',
            'link_id': sectionId
        });

        element.scrollIntoView({ behavior: 'smooth' });
        
        // Fecha o menu mobile se estiver aberto
        const mobileMenu = document.getElementById('mobile-menu');
        if (mobileMenu) {
            mobileMenu.classList.remove('active');
        }
    }
}

// Mobile menu toggle
function toggleMobileMenu() {
    const mobileMenu = document.getElementById('mobile-menu');
    if (mobileMenu) {
        mobileMenu.classList.toggle('active');
    }
}

// FAQ toggle
function toggleFaq(index) {
    const content = document.getElementById('faq-' + index);
    if (content) {
        const isActive = content.classList.contains('active');
        // Close all FAQ items
        const allContents = document.querySelectorAll('.faq-content');
        allContents.forEach(item => {
            if (item.id !== 'faq-' + index) {
                 item.classList.remove('active');
            }
        });
        
        // Toggle current item
        if (!isActive) {
            content.classList.add('active');
        } else {
            content.classList.remove('active');
        }
    }
}

// Form submission
document.getElementById('vip-form').addEventListener('submit', async function(e) {
    e.preventDefault();

    const submitButton = e.target.querySelector('button[type="submit"]');
    const messageDiv = document.getElementById('form-message');
    
    // Pega o token do reCAPTCHA
    const token = grecaptcha.getResponse();
    if (token.length === 0) {
        messageDiv.textContent = "Por favor, marque a caixa 'Não sou um robô'.";
        messageDiv.style.color = 'var(--destructive)';
        return;
    }

    // Monta o objeto de dados manualmente para garantir a estrutura correta
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
    
    // Adiciona campos UTM se existirem
    const hiddenInputs = e.target.querySelectorAll('input[type="hidden"]');
    hiddenInputs.forEach(input => {
        if (input.name !== '_honeypot') { // Ignora o honeypot
            data[input.name] = input.value;
        }
    });

    submitButton.disabled = true;
    messageDiv.textContent = 'Enviando...';
    messageDiv.style.color = 'var(--muted-foreground)';

    try {
        const response = await fetch('/submit-form', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        const result = await response.json();

        if (response.ok) {
            window.dataLayer = window.dataLayer || [];
            window.dataLayer.push({
                'event': 'generate_lead',
                'form_location': 'vip_signup'
            });

            messageDiv.textContent = 'Obrigado! Seus dados foram enviados com sucesso.';
            messageDiv.style.color = 'green';
            e.target.reset();
            grecaptcha.reset(); // Reseta o reCAPTCHA
        } else {
            throw new Error(result.message || 'Falha no envio.');
        }
    } catch (error) {
         window.dataLayer = window.dataLayer || [];
         window.dataLayer.push({
            'event': 'form_submission',
            'event_category': 'error',
            'event_label': 'vip-form-failure'
        });
        messageDiv.textContent = error.message || 'Ocorreu um erro ao enviar. Por favor, tente novamente.';
        messageDiv.style.color = 'var(--destructive)';
    } finally {
        submitButton.disabled = false;
    }
});

// --- NOVO CÓDIGO PARA SCROLL REVEAL (FADE-IN ON SCROLL) ---
document.addEventListener('DOMContentLoaded', function() {
    // Lógica de Scroll Reveal
    const observerOptions = {
        root: null, // O viewport (área visível da tela)
        rootMargin: '0px',
        threshold: 0.1 // O elemento deve estar 10% visível para acionar a animação
    };

    function handleIntersect(entries, observer) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Quando o elemento está visível, adiciona a classe 'visible'
                entry.target.classList.add('visible');
                // Para de observar o elemento
                observer.unobserve(entry.target);
            }
        });
    }

    const observer = new IntersectionObserver(handleIntersect, observerOptions);

    // Seleciona todos os elementos que devem ter o fade-in
    document.querySelectorAll('.fade-in').forEach(element => {
        observer.observe(element);
    });
    
    
    // Lógica existente para URL parameters e form tracking
    const urlParams = new URLSearchParams(window.location.search);
    const hiddenFields = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'gclid'];
    
    hiddenFields.forEach(field => {
        const value = urlParams.get(field);
        if (value) {
            const input = document.createElement('input');
            input.type = 'hidden';
            input.name = field;
            input.value = value;
            document.getElementById('vip-form').appendChild(input);
        }
    });
    
    // Add page info
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
        document.getElementById('vip-form').appendChild(input);
    });

    // WhatsApp mask
    const whatsappInput = document.getElementById('whatsapp');
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
});
// --- FIM DO NOVO CÓDIGO ---
