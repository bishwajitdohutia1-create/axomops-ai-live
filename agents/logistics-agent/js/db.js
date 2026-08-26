const DB = {
    async fetchCarriers() {
        try {
            const response = await fetch('data/pincode_carriers.json');
            if (!response.ok) throw new Error('Failed to load carriers data');
            return await response.json();
        } catch (error) {
            console.error(error);
            return [];
        }
    },

    async fetchShipments() {
        try {
            const response = await fetch('data/shipments.json');
            if (!response.ok) throw new Error('Failed to load shipments data');
            return await response.json();
        } catch (error) {
            console.error(error);
            return [];
        }
    },

    async fetchUpdateLogs() {
        try {
            const response = await fetch('data/update_log.json');
            if (!response.ok) throw new Error('Failed to load update logs');
            return await response.json();
        } catch (error) {
            console.error(error);
            return [];
        }
    }
};

// Initial loader on page load
document.addEventListener('DOMContentLoaded', () => {
    loadUpdateLogs();
});

async function loadUpdateLogs() {
    const logContainer = document.getElementById('logContainer');
    if (!logContainer) return;

    const logs = await DB.fetchUpdateLogs();
    if (logs.length === 0) {
        logContainer.innerHTML = '<span class="text-slate-500 italic">No automated updates recorded yet.</span>';
        return;
    }

    logContainer.innerHTML = logs.map(log => `
        <div class="border-b border-slate-800 pb-1 mb-1">
            <span class="text-cyan-400">[${new Date(log.timestamp).toLocaleString()}]</span> 
            <span class="text-slate-300">${log.carrier_id}:</span> 
            <span class="text-emerald-400">${log.message}</span>
        </div>
    `).join('');
}
