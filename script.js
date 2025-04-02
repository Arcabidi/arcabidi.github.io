document.addEventListener('DOMContentLoaded', function() {
    // --- Email Obfuscation ---
    // Replace with your actual email details
    const emailUser = 'arcabidi'; // Part before the @
    const emailDomain = 'gmail.com'; // Part after the @

    const emailLink = document.getElementById('email-link');

    if (emailLink) {
        const fullEmail = `${emailUser}@${emailDomain}`;
        emailLink.href = `mailto:${fullEmail}`;
        emailLink.textContent = fullEmail; // Display the email address as text
    } else {
        console.error("Could not find element with ID 'email-link'");
    }

    // --- Dynamic Year for Footer ---
    const yearSpan = document.getElementById('year');
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    } else {
         console.error("Could not find element with ID 'year'");
    }
});