async function handleChatQuery() {
    const chatInput = document.getElementById('chatInput');
    const chatBox = document.getElementById('chatBox');
    const query = chatInput.value.trim();

    if (!query) return;

    // Append user message
    chatBox.innerHTML += `
        <div class="bg-cyan-950 text-cyan-200 p-2 rounded max-w-[85%] text-xs self-end">
            ${escapeHtml(query)}
        </div>
    `;
    chatInput.value = '';
    chatBox.scrollTop = chatBox.scrollHeight;

    // Process query via keyword matching
    setTimeout(async () => {
        const reply = await generateAgentResponse(query);
        chatBox.innerHTML += `
            <div class="bg-slate-800 text-slate-300 p-2 rounded max-w-[85%] text-xs self-start">
                ${reply}
            </div>
        `;
        chatBox.scrollTop = chatBox.scrollHeight;
    }, 400);
}

async function generateAgentResponse(query) {
    const upperQuery = query.toUpperCase();

    // Check for tracking IDs like SHIP001
    if (upperQuery.includes('SHIP')) {
        const shipments = await DB.fetchShipments();
        const found = shipments.find(s => upperQuery.includes(s.tracking_id.toUpperCase()));
        
        if (found) {
            return `📦 <strong>Shipment Found (${found.tracking_id}):</strong><br>
                Status: <span class="text-cyan-400">${found.status}</span><br>
                Carrier: ${found.carrier_id}<br>
                Current Location: ${found.current_location}<br>
                Est. Delivery: ${found.estimated_delivery}`;
        } else {
            return `❌ Sorry, I couldn't find active tracking details matching that ID. Try asking for <strong>SHIP001</strong>, <strong>SHIP002</strong>, or <strong>SHIP003</strong>.`;
        }
    }

    // Check for pincode queries
    if (/\d{6}/.test(query)) {
        const pinMatch = query.match(/\d{6}/)[0];
        const carriers = await DB.fetchCarriers();
        const servicing = carriers.filter(c => c.serviced_pincodes.includes(pinMatch));

        if (servicing.length > 0) {
            const names = servicing.map(c => c.carrier_name).join(', ');
            return `✅ Pincode <strong>${pinMatch}</strong> is actively serviced by: <span class="text-emerald-400">${names}</span>.`;
        } else {
            return `⚠️ Pincode <strong>${pinMatch}</strong> currently has limited or no direct carrier coverage in our sample database.`;
        }
    }

    // General fallback FAQ response
    return `I can help you check tracking statuses (e.g., "Where is SHIP001?") or verify pincode coverage (e.g., "Do you deliver to 786125?"). Try asking about one of those!`;
}

function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, function(m) { return map[m]; });
}
