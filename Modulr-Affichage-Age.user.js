// ==UserScript==
// @name         Modulr – Affichage automatique de l’âge
// @namespace    https://github.com/BiggerThanTheMall/tampermonkey-ltoa
// @version      1.1.0
// @description  Affiche automatiquement l’âge à côté de la date de naissance sur les fiches clients Modulr
// @author       LTOA
// @match        https://courtage.modulr.fr/fr/scripts/clients/clients_card.php*
// @match        https://*.modulr.fr/fr/scripts/clients/clients_card.php*
// @run-at       document-idle
// @grant        none

// @updateURL    https://raw.githubusercontent.com/BiggerThanTheMall/tampermonkey-ltoa/main/Modulr-Affichage-Age.user.js
// @downloadURL  https://raw.githubusercontent.com/BiggerThanTheMall/tampermonkey-ltoa/main/Modulr-Affichage-Age.user.js
// ==/UserScript==

(function() {
    'use strict';

    // Fonction pour calculer l'âge avec la date/heure actuelle
    function calculateAge(birthDateStr) {
        // Parse la date au format jj/mm/aaaa
        const parts = birthDateStr.split('/');
        if (parts.length !== 3) return null;

        const day = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1; // Les mois commencent à 0 en JS
        const year = parseInt(parts[2], 10);

        const birthDate = new Date(year, month, day);
        const now = new Date(); // Date et heure actuelles au moment du calcul

        let age = now.getFullYear() - birthDate.getFullYear();
        const monthDiff = now.getMonth() - birthDate.getMonth();

        // Si l'anniversaire n'est pas encore passé cette année
        if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birthDate.getDate())) {
            age--;
        }

        return age;
    }

    // Fonction pour vérifier si c'est l'anniversaire aujourd'hui
    function isBirthdayToday(birthDateStr) {
        const parts = birthDateStr.split('/');
        if (parts.length !== 3) return false;

        const day = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1;

        const now = new Date();
        return now.getDate() === day && now.getMonth() === month;
    }

    // Fonction pour afficher l'âge
    function displayAge(birthDateElement) {
        const birthDateText = birthDateElement.textContent.trim();

        // Vérifier que c'est bien une date au format jj/mm/aaaa
        if (!/^\d{2}\/\d{2}\/\d{4}$/.test(birthDateText)) {
            return;
        }

        const age = calculateAge(birthDateText);
        if (age === null || age < 0) return;

        // Créer le badge d'âge
        const ageBadge = document.createElement('span');
        ageBadge.className = 'modulr-age-badge';

        // Vérifier si c'est l'anniversaire
        const isToday = isBirthdayToday(birthDateText);

        ageBadge.style.cssText = `
            display: inline-block;
            margin-left: 12px;
            padding: 3px 10px;
            background-color: ${isToday ? '#d6c491' : 'var(--color-main, #688396)'};
            color: ${isToday ? '#333' : 'white'};
            border-radius: 4px;
            font-weight: bold;
            font-size: 12px;
            vertical-align: middle;
        `;

        if (isToday) {
            ageBadge.innerHTML = `🎂 ${age} ans aujourd'hui !`;
            ageBadge.title = 'Joyeux anniversaire !';
        } else {
            ageBadge.textContent = `${age} ans`;
            ageBadge.title = `Âge calculé le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}`;
        }

        // Ajouter après la date
        birthDateElement.appendChild(ageBadge);
    }

    // Fonction principale
    function init() {
        // Trouver tous les labels "Date de naissance"
        const labels = document.querySelectorAll('.car_template_field p.normal_fade');

        labels.forEach(label => {
            if (label.textContent.trim() === 'Date de naissance') {
                const valueField = label.nextElementSibling;
                if (valueField && valueField.tagName === 'P' && !valueField.querySelector('.modulr-age-badge')) {
                    displayAge(valueField);
                }
            }
        });
    }

    // Attendre que la page soit chargée
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Observer les changements dynamiques (AJAX)
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.addedNodes.length) {
                init();
            }
        });
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

})();
