async function handleOptimizeRoute() {
    const pickupPin = document.getElementById('pickupPin').value.trim();
    const deliveryPin = document.getElementById('deliveryPin').value.trim();
    const resultsContainer = document.getElementById('routeResults');

    if (!pickupPin || !deliveryPin) {
        resultsContainer.innerHTML = '<span class="text-rose-400">Please enter both pickup and delivery pincodes.</span>';
        return;
    }

    resultsContainer.innerHTML = '<span class="text-slate-400 italic">Analyzing carrier network...</span>';

    const carriers = await DB.fetchCarriers();
    
    // Find carriers servicing both pincodes or at least the delivery/pickup
    const eligibleCarriers = carriers.filter(c => 
        c.serviced_pincodes.includes(pickupPin) || c.serviced_pincodes.includes(deliveryPin)
    );

    if (eligibleCarriers.length === 0) {
        resultsContainer.innerHTML = '<span class="text-amber-400">No direct carriers found matching these specific pincodes. Try standard regional codes (e.g., 786125, 781001).</span>';
        return;
    }

    // Heuristic scoring: Estimate distance roughly (mock calculation for demo)
    const evaluated = eligibleCarriers.map(carrier => {
        // Mock distance heuristic (e.g., 300 km fixed average for demonstration)
        const estDistanceKm = 320; 
        const estCost = Math.round(estDistanceKm * carrier.avg_cost_per_km);
        const estHours = Math.round((estDistanceKm / carrier.avg_speed_kmph) * 10) / 10;
        
        // Composite score: performance score weighted against cost/speed
        const score = Math.round((carrier.performance_score * 0.5) + ((100 - estHours) * 0.3) + ((100 - (estCost / 50)) * 0.2));

        return {
            ...carrier,
            estCost,
            estHours,
            score
        };
    });

    // Sort by best score descending
    evaluated.sort((a, b) => b.score - a.score);

    resultsContainer.innerHTML = evaluated.map((c, index) => `
        <div class="bg-slate-900 border ${index === 0 ? 'border-cyan-500' : 'border-slate-800'} p-3 rounded space-y-1">
            <div class="flex justify-between items-center">
                <span class="font-semibold text-cyan-300">${c.carrier_name}</span>
                ${index === 0 ? '<span class="bg-cyan-500 text-slate-950 text-[10px] font-bold px-1.5 py-0.5 rounded">RECOMMENDED</span>' : ''}
            </div>
            <div class="grid grid-cols-3 gap-2 text-[11px] text-slate-300 pt-1">
                <div>⚡ Speed: <span class="text-slate-100">${c.estHours} hrs</span></div>
                <div>💰 Est Cost: <span class="text-slate-100">₹${c.estCost}</span></div>
                <div>⭐ Perf Score: <span class="text-slate-100">${c.performance_score}/100</span></div>
            </div>
        </div>
    `).join('');
}
