const fs = require('fs');
const path = require('path');

const carriersFilePath = path.join(__dirname, '../agents/logistics-agent/data/pincode_carriers.json');
const logFilePath = path.join(__dirname, '../agents/logistics-agent/data/update_log.json');

try {
    const carriersData = JSON.parse(fs.readFileSync(carriersFilePath, 'utf8'));
    const now = new Date();
    let updatedCount = 0;
    const logEntries = [];

    carriersData.forEach(carrier => {
        const lastUpdated = new Date(carrier.last_updated || '2026-01-01');
        const diffDays = (now - lastUpdated) / (1000 * 60 * 60 * 24);

        if (diffDays > 7) {
            const oldScore = carrier.performance_score;
            // Simulate slight random variation (-2 to +2, capped between 70 and 99)
            const variation = Math.floor(Math.random() * 5) - 2;
            carrier.performance_score = Math.min(99, Math.max(70, oldScore + variation));
            carrier.last_updated = now.toISOString().split('T')[0];
            
            updatedCount++;
            logEntries.push({
                timestamp: now.toISOString(),
                carrier_id: carrier.carrier_id,
                action: "score_refresh",
                old_score: oldScore,
                new_score: carrier.performance_score,
                message: `Refreshed score from ${oldScore} to ${carrier.performance_score}`
            });
        }
    });

    if (updatedCount > 0) {
        fs.writeFileSync(carriersFilePath, JSON.stringify(carriersData, null, 2), 'utf8');
        
        let existingLogs = [];
        if (fs.existsSync(logFilePath)) {
            existingLogs = JSON.parse(fs.readFileSync(logFilePath, 'utf8'));
        }
        const updatedLogs = [...logEntries, ...existingLogs];
        fs.writeFileSync(logFilePath, JSON.stringify(updatedLogs, null, 2), 'utf8');
        
        console.log(`Successfully updated ${updatedCount} carriers.`);
    } else {
        console.log('No carriers needed updates (>7 days old).');
    }
} catch (error) {
    console.error('Error updating carrier data:', error);
    process.exit(1);
}
