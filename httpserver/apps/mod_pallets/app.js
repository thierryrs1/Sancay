import { SancayPortal } from './portal.js';

// Entry point for the mod_pallets application
const portal = new SancayPortal();

function startPortal() {
    try {
        portal.init('app-container');
    } catch (error) {
        console.error('Failed to initialize portal:', error);
    }
}

// Ensure portal initializes after DOM is ready
if (document.readyState === 'complete' || document.readyState === 'interactive') {
    startPortal();
} else {
    document.addEventListener('DOMContentLoaded', startPortal);
}