// Conversational State Machine for the AI Agent
let chatState = {
    step: 'GREETING', // Steps: GREETING, ASK_NAME, ASK_LOCATION, ASK_INTENT, READY
    userName: '',
    userLocation: '',
    userIntent: ''
};

async function handleChatQuery() {
    const chatInput = document.getElementById('chatInput');
    const chatBox = document.getElementById('chatBox');
    const query = chatInput.value.trim();

    if (!query) return;

    // Append user message to chat box
    chatBox.innerHTML += `
        <div class="bg-cyan-950 text-cyan-200 p-2 rounded max-w-[85%] text-xs self-end">
            ${escapeHtml(query)}
        </div>
    `;
    chatInput.value = '';
    chatBox.scrollTop = chatBox.scrollHeight;

    // Process conversational flow based on AI agent steps
    setTimeout(async () => {
        const reply = await generateAdvancedAgentResponse(query);
        chatBox.innerHTML += `
            <div class="bg-slate-800 text-slate-300 p-2 rounded max-w-[85%] text-xs self-start">
                ${reply}
            </div>
        `;
        chatBox.scrollTop = chatBox.scrollHeight;
    }, 400);
}

async function generateAdvancedAgentResponse(query) {
    const upperQuery = query.toUpperCase();

    // Step 1: Capturing User Name
    if (chatState.step === 'ASK_NAME') {
        chatState.userName = query.trim();
        chatState.step = 'ASK_LOCATION';
        return `Nice to meet you, <strong>${escapeHtml(chatState.userName)}</strong>! May I know your current location or city?`;
    }

    // Step 2: Capturing User Location
    if (chatState.step === 'ASK_LOCATION') {
        chatState.userLocation = query.trim();
        chatState.step = 'ASK_INTENT';
        return `Got it, from <strong>${escapeHtml(chatState.userLocation)}</strong>. What is the main purpose of your visit today? (e.g., checking a shipment status like SHIP001, verifying pincode delivery, or route optimization)`;
    }

    // Step 3: Capturing User Intent / Ready State
    if (chatState.step === 'ASK_INTENT') {
        chatState.userIntent = query.trim();
        chatState.step = 'READY';
        return `Thank you for sharing, ${escapeHtml(chatState.userName)}. I'm ready to assist you! You can now ask me about any tracking ID (like <strong>SHIP001</strong>, <strong>SHIP002</strong>, <strong>SHIP003</strong>) or delivery pincodes.`;
    }

    // Step 4: Standard AI Logistics Agent Capabilities (Tracking & Pincode check)
    if (upperQuery.includes('SHIP')) {
        const shipments = await DB.fetchShipments();
        const found = shipments.find(s => upperQuery.includes(s.tracking_id.toUpperCase()));
        
        if (found) {
            return `📦 <strong>Shipment Details for ${escapeHtml(chatState.userName)} (${found.tracking_id}):</strong><br>
                Status: <span class="text-cyan-400">${found.status}</span><br>
                Carrier: ${found.carrier_id}<br>
                Current Location: ${found.current_location}<br>
                Est. Delivery: ${found.estimated_delivery}`;
        } else {
            return `❌ Sorry ${escapeHtml(chatState.userName)}, I couldn't find tracking details matching that ID. Try asking for <strong>SHIP001</strong>, <strong>SHIP002</strong>, or <strong>SHIP003</strong>.`;
        }
    }

    if (/\d{6}/.test(query)) {
        const pinMatch = query.match(/\d{6}/)[0];
        const carriers = await DB.fetchCarriers();
        const servicing = carriers.filter(c => c.serviced_pincodes.includes(pinMatch));

        if (servicing.length > 0) {
            const names = servicing.map(c => c.carrier_name).join(', ');
            return `✅ Pincode <strong>${pinMatch}</strong> is actively serviced by: <span class="text-emerald-400">${names}</span>.`;
        } else {
            return `⚠️ Pincode <strong>${pinMatch}</strong> currently has limited or no direct carrier coverage in our database.`;
        }
    }

    // General fallback once conversational setup is complete
    return `How else can I help you today, ${escapeHtml(chatState.userName)}? Feel free to ask about shipment tracking or pincodes!`;
}

// Initial time-based greeting when page loads
document.addEventListener('DOMContentLoaded', () => {
    const chatBox = document.getElementById('chatBox');
    if (chatBox) {
        const hour = new Date().getHours();
        let timeGreeting = "Hello";
        if (hour < 12) timeGreeting = "Good Morning";
        else if (hour < 18) timeGreeting = "Good Afternoon";
        else timeGreeting = "Good Evening";

        setTimeout(() => {
            chatBox.innerHTML += `
                <div class="bg-slate-800 text-slate-300 p-2 rounded max-w-[85%] text-xs self-start">
                    🤖 ${timeGreeting}! Welcome to AxomOps AI Logistics Assistant. May I know your name please?
                </div>
            `;
            chatState.step = 'ASK_NAME';
        }, 500);
    }
});

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
