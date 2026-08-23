/* ==========================================================================
   BLIV Concierge - Chatbot Logic Engine
   ========================================================================== */

(function() {
    // Safe initialization wrapper
    try {
        document.addEventListener('DOMContentLoaded', () => {
            initConcierge();
        });
    } catch (e) {
        console.error("BLIV Concierge failed to bind page load event: ", e);
    }

    // Chatbot State
    const state = {
        isOpen: false,
        currentPropertyId: null,
        activeFlow: null, // null or 'booking'
        bookingStep: 0,
        bookingData: {
            property: null,
            roomType: null,
            checkIn: null,
            checkOut: null,
            guests: null,
            name: null,
            whatsapp: null
        }
    };

    // DOM References
    let launcherEl, panelEl, messagesEl, repliesEl, formEl, inputEl;

    // Initialization
    function initConcierge() {
        // Detect current page context property
        state.currentPropertyId = detectPropertyContext();

        // 1. Build and Inject DOM Elements
        injectChatbotDOM();

        // 2. Bind DOM Elements
        launcherEl = document.getElementById('concierge-launcher');
        panelEl = document.getElementById('concierge-panel');
        messagesEl = document.getElementById('concierge-messages');
        repliesEl = document.getElementById('concierge-replies');
        formEl = document.getElementById('concierge-form');
        inputEl = document.getElementById('concierge-input');

        if (!launcherEl || !panelEl || !messagesEl || !repliesEl || !formEl || !inputEl) {
            console.error("BLIV Concierge: Failed to bind DOM components.");
            return;
        }

        // 3. Bind Event Listeners
        launcherEl.addEventListener('click', toggleChat);
        document.getElementById('concierge-close').addEventListener('click', toggleChat);
        formEl.addEventListener('submit', handleFormSubmit);

        // Accessability key bindings
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && state.isOpen) {
                toggleChat();
            }
        });

        // 4. Send Initial Message
        sendWelcomeGreeting();
    }

    // Context detection using pathname
    function detectPropertyContext() {
        const path = window.location.pathname.toLowerCase();
        if (path.includes('abbasi-tower')) return 'abbasi-tower';
        if (path.includes('baitu-l-amaan')) return 'baitu-l-amaan';
        if (path.includes('banjara-hills')) return 'banjara-hills';
        if (path.includes('hill-plaza-shaikhpet')) return 'hill-plaza-shaikhpet';
        return null;
    }

    // Dynamic Injection of UI elements
    function injectChatbotDOM() {
        if (document.getElementById('concierge-launcher')) return; // already injected

        // Launcher
        const launcher = document.createElement('button');
        launcher.id = 'concierge-launcher';
        launcher.className = 'concierge-launcher';
        launcher.setAttribute('aria-haspopup', 'dialog');
        launcher.setAttribute('aria-expanded', 'false');
        launcher.setAttribute('aria-label', 'Open BLIV Concierge');
        launcher.innerHTML = `
            <span class="launcher-icon">✦</span>
            <div class="concierge-launcher-pulse"></div>
        `;
        document.body.appendChild(launcher);

        // Panel
        const panel = document.createElement('div');
        panel.id = 'concierge-panel';
        panel.className = 'concierge-panel';
        panel.setAttribute('role', 'dialog');
        panel.setAttribute('aria-modal', 'false');
        panel.setAttribute('aria-labelledby', 'concierge-title');
        panel.setAttribute('aria-hidden', 'true');
        panel.innerHTML = `
            <div class="concierge-header">
                <div>
                    <h3 class="concierge-brand-title" id="concierge-title">BLIV Concierge</h3>
                    <p class="concierge-brand-tagline">Your stay. Your city. Your concierge.</p>
                </div>
                <button class="concierge-close-btn" id="concierge-close" aria-label="Close concierge">✕</button>
            </div>
            <div class="concierge-chat-body" id="concierge-messages"></div>
            <div class="concierge-quick-replies-container" id="concierge-replies"></div>
            <form class="concierge-input-area" id="concierge-form">
                <input type="text" class="concierge-input" id="concierge-input" placeholder="Type your question..." aria-label="Type your message to concierge">
                <button type="submit" class="concierge-send-btn" aria-label="Send message">➤</button>
            </form>
        `;
        document.body.appendChild(panel);
    }

    // Toggle panel view state
    function toggleChat() {
        state.isOpen = !state.isOpen;
        if (state.isOpen) {
            panelEl.classList.add('active');
            panelEl.setAttribute('aria-hidden', 'false');
            launcherEl.setAttribute('aria-expanded', 'true');
            if (window.innerWidth <= 768) {
                document.body.classList.add('concierge-active');
            }
            setTimeout(() => inputEl.focus(), 300);
            trackLocalEvent('chat_opened');
        } else {
            panelEl.classList.remove('active');
            panelEl.setAttribute('aria-hidden', 'true');
            launcherEl.setAttribute('aria-expanded', 'false');
            document.body.classList.remove('concierge-active');
        }
    }

    // Send Welcome Message
    function sendWelcomeGreeting() {
        const config = window.BLIV_DATA.config;
        let greeting = config.greetingDefault;

        if (state.currentPropertyId) {
            const property = findPropertyById(state.currentPropertyId);
            if (property) {
                greeting = config.greetingContextual.replace('{propertyName}', property.name);
            }
        }

        addBotMessage(greeting);
        renderQuickReplies(["Explore Properties", "Plan My Stay", "What's Nearby?", "Contact Reservations"]);
    }

    // Render quick replies buttons row
    function renderQuickReplies(replies) {
        repliesEl.innerHTML = '';
        replies.forEach(reply => {
            const btn = document.createElement('button');
            btn.className = 'concierge-reply-btn';
            btn.textContent = reply;
            btn.addEventListener('click', () => {
                handleUserMsg(reply);
            });
            repliesEl.appendChild(btn);
        });
    }

    // Add message element to chat body
    function addMessage(sender, content, isHtml = false) {
        const msg = document.createElement('div');
        msg.className = `concierge-msg ${sender}`;
        if (isHtml) {
            msg.innerHTML = content;
        } else {
            const p = document.createElement('p');
            p.textContent = content;
            msg.appendChild(p);
        }
        messagesEl.appendChild(msg);
        messagesEl.scrollTop = messagesEl.scrollHeight;
    }

    // Add user message directly
    function addUserMessage(text) {
        addMessage('user', text);
    }

    // Add bot message with optional short typing delay (for hospitality feel)
    function addBotMessage(text, isHtml = false, callback = null) {
        // Render typing indicator
        const typing = document.createElement('div');
        typing.className = 'concierge-typing';
        typing.textContent = 'BLIV Concierge is typing...';
        messagesEl.appendChild(typing);
        messagesEl.scrollTop = messagesEl.scrollHeight;

        setTimeout(() => {
            typing.remove();
            addMessage('bot', text, isHtml);
            if (callback) callback();
        }, 350); // Natural 350ms delay
    }

    // Handle Form Submit (typing message)
    function handleFormSubmit(e) {
        e.preventDefault();
        const text = inputEl.value.trim();
        if (!text) return;

        inputEl.value = '';
        handleUserMsg(text);
    }

    // Handle User input message
    function handleUserMsg(text) {
        addUserMessage(text);

        // If in booking flow, delegate to booking controller
        if (state.activeFlow === 'booking') {
            handleBookingFlow(text);
            return;
        }

        // Delegate to rule-based parser
        parseUserIntent(text);
    }

    // Find Property helper
    function findPropertyById(id) {
        const props = window.BLIV_DATA.properties || [];
        return props.find(p => p.id === id) || null;
    }

    /* ==========================================================================
       Rule-Based Intent Detection & Response Parser
       ========================================================================== */
    function parseUserIntent(text) {
        const query = text.toLowerCase().trim();

        // 1. Simple Keyword matches
        // HELP
        if (matchesAny(query, ['help', 'menu', 'guide', 'can you', 'what can'])) {
            sendHelpResponse();
            return;
        }
        
        // GREETING
        if (matchesAny(query, ['hello', 'hi', 'hey', 'welcome', 'greet', 'good morning', 'good evening'])) {
            sendGreetingResponse();
            return;
        }

        // CONTACT / WHATSAPP / CALL
        if (matchesAny(query, ['contact', 'phone', 'number', 'whatsapp', 'call', 'email', 'desk', 'reach'])) {
            sendContactResponse();
            return;
        }

        // BOOKING / RESERVATIONS
        if (matchesAny(query, ['book', 'reserve', 'stay', 'price', 'rate', 'tariff', 'rent', 'cost', 'pricing'])) {
            state.activeFlow = 'booking';
            state.bookingStep = 0;
            handleBookingFlow('');
            return;
        }

        // PROPERTIES LIST
        if (matchesAny(query, ['property', 'properties', 'residence', 'portfolio', 'list', 'locations'])) {
            sendPropertiesList();
            return;
        }

        // AMENITIES
        if (matchesAny(query, ['amenit', 'wifi', 'ac', 'kitchen', 'laundry', 'parking', 'fridge', 'refrigerator', 'tv', 'microwave'])) {
            sendAmenitiesResponse(query);
            return;
        }

        // METRO
        if (matchesAny(query, ['metro', 'train', 'station'])) {
            sendNearbyResponse('metro');
            return;
        }

        // HOSPITALS
        if (matchesAny(query, ['hospital', 'medical', 'eye', 'rainbow', 'star', 'apollo', 'aig', 'lv prasad'])) {
            sendNearbyResponse('hospitals');
            return;
        }

        // SHOPPING
        if (matchesAny(query, ['shopping', 'mall', 'malls', 'shop'])) {
            sendNearbyResponse('shopping');
            return;
        }

        // RESTAURANTS
        if (matchesAny(query, ['eat', 'restaurant', 'restaurants', 'cafes', 'cafe', 'food'])) {
            sendNearbyResponse('restaurants');
            return;
        }

        // HYDERABAD ATTRACTIVES
        if (matchesAny(query, ['tourist', 'visit', 'see', 'hyderabad', 'charminar', 'hussain sagar', 'fort', 'attraction'])) {
            sendHyderabadGuideResponse(query);
            return;
        }

        // NEARBY GENERAL
        if (matchesAny(query, ['nearby', 'walk', 'close by', 'around', 'surround'])) {
            sendNearbyGeneralMenu();
            return;
        }

        // SPECIFIC PROPERTIES DETECTOR
        if (matchesAny(query, ['abbasi', 'irram manzil'])) {
            sendPropertyDetails('abbasi-tower');
            return;
        }
        if (matchesAny(query, ['baitu', 'amaan'])) {
            sendPropertyDetails('baitu-l-amaan');
            return;
        }
        if (matchesAny(query, ['banjara'])) {
            sendPropertyDetails('banjara-hills');
            return;
        }
        if (matchesAny(query, ['hill', 'shaikhpet', 'sheikhpet'])) {
            sendPropertyDetails('hill-plaza-shaikhpet');
            return;
        }

        // SPECIFIC ROOM CATEGORIES
        if (matchesAny(query, ['1bhk', '1 bhk', 'one bhk'])) {
            sendRoomMatchResponse('1 BHK');
            return;
        }
        if (matchesAny(query, ['2bhk', '2 bhk', 'two bhk', 'two bedroom'])) {
            sendRoomMatchResponse('2 BHK');
            return;
        }
        if (matchesAny(query, ['3bhk', '3 bhk', 'three bhk', 'three bedroom'])) {
            sendRoomMatchResponse('3 BHK');
            return;
        }
        if (matchesAny(query, ['single', 'single room'])) {
            sendRoomMatchResponse('Single Room');
            return;
        }

        // THANK YOU
        if (matchesAny(query, ['thanks', 'thank you', 'awesome', 'great', 'cool'])) {
            addBotMessage("You're very welcome! Let me know if there's anything else I can assist you with.");
            renderQuickReplies(["Explore Properties", "Plan My Stay", "Contact Reservations"]);
            return;
        }

        // Default Unknown response (Safety: do not hallucinate)
        sendUnknownResponse();
    }

    // Helper matcher
    function matchesAny(query, keywords) {
        return keywords.some(keyword => query.includes(keyword));
    }

    // Unknown handler (API-free fallback)
    function sendUnknownResponse() {
        addBotMessage("I'm sorry, I don't have verified information for that yet. I can help you with:\n\n• BLIV properties\n• Room options\n• Amenities\n• Nearby facilities\n• Hyderabad attractions\n• Booking enquiries\n• WhatsApp reservations");
        renderQuickReplies(["Explore Properties", "Plan My Stay", "Contact Reservations"]);
    }

    // Greeting response
    function sendGreetingResponse() {
        addBotMessage("Hello 👋 Glad to connect! I'm here to help you explore our premium residences, look up room availability, nearby attractions, or help you book a stay.");
        renderQuickReplies(["Explore Properties", "Plan My Stay", "Contact Reservations"]);
    }

    // Help response
    function sendHelpResponse() {
        addBotMessage("I am the BLIV Concierge widget. You can ask me questions like:\n\n• 'Show properties'\n• 'What is near Abbasi Tower?'\n• 'Check amenities'\n• 'What tourist places are in Hyderabad?'\n• 'How to book'");
        renderQuickReplies(["Explore Properties", "Plan My Stay", "What's Nearby?", "Contact Reservations"]);
    }

    // Properties List Card Renderer
    function sendPropertiesList() {
        const props = window.BLIV_DATA.properties;
        let htmlContent = `<div class="chat-property-cards">`;
        
        props.forEach(p => {
            // Get subtitle configurations
            let configTxt = p.roomTypes.map(rt => rt.name).join(' / ');
            
            htmlContent += `
                <div class="chat-property-card">
                    <span class="prop-subtitle">${p.location.toUpperCase()}</span>
                    <h4>${p.name}</h4>
                    <p>${configTxt}</p>
                    <div class="prop-actions">
                        <a href="${p.route}" class="prop-btn">View Route</a>
                        <button class="prop-btn" onclick="window.BLIV_CONCIERGE_TRIGGER('${p.id}')">Select</button>
                    </div>
                </div>
            `;
        });
        htmlContent += `</div>`;

        addBotMessage("Here is the BLIV Serviced Apartments portfolio in Hyderabad:", true);
        setTimeout(() => {
            addMessage('bot', htmlContent, true);
            renderQuickReplies(["Plan My Stay", "What's Nearby?", "Contact Reservations"]);
        }, 400);
    }

    // Property selection callback
    window.BLIV_CONCIERGE_TRIGGER = function(propertyId) {
        addUserMessage(`Show details for ${propertyId.replace('-', ' ')}`);
        sendPropertyDetails(propertyId);
    };

    // Property details renderer
    function sendPropertyDetails(propertyId) {
        const p = findPropertyById(propertyId);
        if (!p) {
            addBotMessage("I don't have verified details for that property yet. Please consult our reservations team.");
            return;
        }

        trackLocalEvent('property_selected');

        const card = `
            <div class="chat-property-card">
                <span class="prop-subtitle">${p.location.toUpperCase()}</span>
                <h4>${p.name}</h4>
                <p>${p.description}</p>
                <div class="prop-actions">
                    <a href="${p.route}" class="prop-btn">Visit Route Page</a>
                </div>
            </div>
        `;

        addBotMessage(`Here is the verified information for **${p.name}**:`);
        setTimeout(() => {
            addMessage('bot', card, true);
            renderQuickReplies([`${p.name} Amenities`, `${p.name} Nearby`, "Plan My Stay", "Contact Reservations"]);
        }, 400);
    }

    // Room Matcher
    function sendRoomMatchResponse(roomType) {
        const props = window.BLIV_DATA.properties;
        const matches = [];

        props.forEach(p => {
            p.roomTypes.forEach(rt => {
                if (rt.name.toLowerCase().includes(roomType.toLowerCase())) {
                    matches.push({ prop: p, room: rt });
                }
            });
        });

        if (matches.length > 0) {
            let reply = `Based on our verified portfolio records, the following property offers **${roomType}** configurations:\n\n`;
            matches.forEach(m => {
                reply += `• **${m.prop.name}** (${m.prop.location})\n`;
            });
            addBotMessage(reply);
            renderQuickReplies(["Plan My Stay", "Explore Properties", "Contact Reservations"]);
        } else {
            addBotMessage(`I don't have verified records showing active **${roomType}** rooms in our properties right now. Please contact reservations for custom availability.`);
            renderQuickReplies(["Contact Reservations", "Explore Properties"]);
        }
    }

    // Amenities Response
    function sendAmenitiesResponse(query) {
        let propertyId = state.currentPropertyId;

        // check if property name mentioned in query
        if (query.includes('abbasi')) propertyId = 'abbasi-tower';
        else if (query.includes('baitu')) propertyId = 'baitu-l-amaan';
        else if (query.includes('banjara')) propertyId = 'banjara-hills';
        else if (query.includes('hill')) propertyId = 'hill-plaza-shaikhpet';

        if (propertyId) {
            const p = findPropertyById(propertyId);
            if (p) {
                let tags = p.amenities.map(a => `<span class="tag-badge" style="display:inline-block; margin:2px; font-size:11px; padding:3px 6px;">${a}</span>`).join('');
                let replyHtml = `
                    <div style="background-color:rgba(255,255,255,0.02); padding:1rem; border-radius:4px; border-left:2px solid var(--color-sand);">
                        <h4 style="margin-bottom:0.5rem; font-size:13px; color:var(--color-white);">${p.name.toUpperCase()} AMENITIES</h4>
                        <div>${tags}</div>
                    </div>
                `;
                addBotMessage(`Here are the verified amenities available at **${p.name}**:`);
                setTimeout(() => {
                    addMessage('bot', replyHtml, true);
                    renderQuickReplies(["What's Nearby?", "Plan My Stay", "Contact Reservations"]);
                }, 400);
                return;
            }
        }

        // Generic amenities info
        addBotMessage("Which property's amenities are you interested in?");
        renderQuickReplies(["Abbasi Tower Amenities", "Baitu-l-Amaan Amenities", "Banjara Hills Amenities", "Hill Plaza Amenities"]);
    }

    // Nearby facilities renderer
    function sendNearbyGeneralMenu() {
        let propertyId = state.currentPropertyId;
        if (propertyId) {
            const p = findPropertyById(propertyId);
            addBotMessage(`What category of nearby amenities near **${p.name}** would you like to explore?`);
            renderQuickReplies(["Metro Station", "Hospitals", "Shopping Malls", "Restaurants & Cafes", "Contact Reservations"]);
        } else {
            addBotMessage("Please select a property to view its nearby locations:");
            renderQuickReplies(["Abbasi Tower", "Baitu-l-Amaan", "Banjara Hills", "Hill Plaza"]);
        }
    }

    function sendNearbyResponse(category) {
        let propertyId = state.currentPropertyId;

        // If not on property page, ask them to pick or check if we can infer it
        if (!propertyId) {
            addBotMessage("Please pick a property first to explore its nearby facilities:");
            renderQuickReplies(["Abbasi Tower", "Baitu-l-Amaan", "Banjara Hills", "Hill Plaza"]);
            return;
        }

        const p = findPropertyById(propertyId);
        const nearbyDb = window.BLIV_DATA.nearbyPlaces[propertyId] || {};
        const places = nearbyDb[category] || [];

        if (places.length > 0) {
            let reply = `Here are the verified **${category}** facilities near **${p.name}**:\n\n`;
            places.forEach(item => {
                reply += `• **${item.name}**`;
                if (item.description) reply += ` — ${item.description}`;
                reply += `\n`;
            });
            // Append safety notice
            reply += `\n*Travel times/distances are approximate and depend on traffic routes.*`;
            addBotMessage(reply);
            renderQuickReplies(["Hospitals", "Metro Station", "Shopping Malls", "Restaurants & Cafes", "Plan My Stay"]);
        } else {
            // Safety: do not hallucinate
            addBotMessage(`I don't have verified nearby-location records for **${category}** near **${p.name}** yet. Please contact our reservation team for local navigation help.`);
            renderQuickReplies(["Contact Reservations", "Plan My Stay"]);
        }
    }

    // Tourist Guide
    function sendHyderabadGuideResponse(query) {
        const guide = window.BLIV_DATA.hyderabadGuide;
        
        // Check if specific destination asked
        if (query.includes('charminar')) {
            addBotMessage(`**Charminar & Laad Bazaar**:\n\n${guide[0].description}`);
            renderQuickReplies(["Hussain Sagar", "Golconda Fort", "Plan My Stay"]);
            return;
        }
        if (query.includes('hussain sagar') || query.includes('lake')) {
            addBotMessage(`**Hussain Sagar Lake**:\n\n${guide[2].description}`);
            renderQuickReplies(["Charminar", "Golconda Fort", "Plan My Stay"]);
            return;
        }
        if (query.includes('golconda') || query.includes('fort') || query.includes('tombs')) {
            addBotMessage(`**Golconda Fort**:\n\n${guide[1].description}`);
            renderQuickReplies(["Charminar", "Hussain Sagar", "Plan My Stay"]);
            return;
        }

        // Generic guide list
        let reply = "Here are some top attractions to experience in Hyderabad:\n\n";
        guide.forEach(g => {
            reply += `• **${g.name}**: ${g.description}\n\n`;
        });
        addBotMessage(reply);
        renderQuickReplies(["Charminar Info", "Hussain Sagar Info", "Golconda Fort Info", "Plan My Stay"]);
    }

    // Contact menu
    function sendContactResponse() {
        const c = window.BLIV_DATA.config.contactDetails;
        let html = `
            <div style="background-color:rgba(255,255,255,0.02); padding:1rem; border-radius:4px; border:1px solid rgba(255,255,255,0.05); font-size:13px;">
                <p style="margin-bottom:0.8rem; color:var(--color-grey-light);">Contact our 24/7 reservations team directly:</p>
                <div style="margin-bottom:0.8rem;">
                    <strong style="color:var(--color-white);">Desk A:</strong> ${c.deskA.phone}<br>
                    <a href="${c.deskA.wa}" target="_blank" rel="noopener noreferrer" style="color:var(--color-sand); text-decoration:underline; font-size:11px; margin-right:8px;">WhatsApp</a>
                    <a href="${c.deskA.link}" style="color:var(--color-sand); text-decoration:underline; font-size:11px;">Call</a>
                </div>
                <div style="margin-bottom:0.8rem;">
                    <strong style="color:var(--color-white);">Desk B:</strong> ${c.deskB.phone}<br>
                    <a href="${c.deskB.wa}" target="_blank" rel="noopener noreferrer" style="color:var(--color-sand); text-decoration:underline; font-size:11px; margin-right:8px;">WhatsApp</a>
                    <a href="${c.deskB.link}" style="color:var(--color-sand); text-decoration:underline; font-size:11px;">Call</a>
                </div>
                <div>
                    <strong style="color:var(--color-white);">Email:</strong><br>
                    <a href="mailto:${c.email}" style="color:var(--color-sand); text-decoration:underline;">${c.email}</a>
                </div>
            </div>
        `;
        addBotMessage("Here are the official BLIV contact channels:", true);
        setTimeout(() => {
            addMessage('bot', html, true);
            renderQuickReplies(["Plan My Stay", "Explore Properties"]);
        }, 400);
    }


    /* ==========================================================================
       Plan My Stay - State Machine Guided Flow
       ========================================================================== */
    function handleBookingFlow(userInput) {
        trackLocalEvent('booking_started');
        const input = userInput.trim();

        switch (state.bookingStep) {
            case 0:
                // Step 0: Welcome to flow, ask for property
                addBotMessage("I can help you build an enquiry details summary to send directly on WhatsApp. Let's start:\n\n**Which BLIV property are you interested in?**");
                renderQuickReplies(["Abbasi Tower", "Baitu-l-Amaan", "Banjara Hills", "Hill Plaza", "Cancel"]);
                state.bookingStep = 1;
                break;

            case 1:
                // Step 1: Capture property, ask for room type
                if (input.toLowerCase() === 'cancel') {
                    cancelBookingFlow();
                    return;
                }

                // Check which property they picked
                let matchedProp = null;
                if (input.toLowerCase().includes('abbasi')) matchedProp = findPropertyById('abbasi-tower');
                else if (input.toLowerCase().includes('baitu') || input.toLowerCase().includes('amaan')) matchedProp = findPropertyById('baitu-l-amaan');
                else if (input.toLowerCase().includes('banjara')) matchedProp = findPropertyById('banjara-hills');
                else if (input.toLowerCase().includes('hill') || input.toLowerCase().includes('shaikhpet')) matchedProp = findPropertyById('hill-plaza-shaikhpet');

                if (!matchedProp) {
                    addBotMessage("I didn't recognize that property. Please select one from the options below:");
                    renderQuickReplies(["Abbasi Tower", "Baitu-l-Amaan", "Banjara Hills", "Hill Plaza", "Cancel"]);
                    return;
                }

                state.bookingData.property = matchedProp;
                addBotMessage(`Excellent. **${matchedProp.name}** selected.\n\n**What type of accommodation would you like?**`);
                
                // Show room type quick replies based on property database
                const roomReplies = matchedProp.roomTypes.map(rt => rt.name);
                roomReplies.push("Cancel");
                renderQuickReplies(roomReplies);
                state.bookingStep = 2;
                break;

            case 2:
                // Step 2: Capture room type, ask for check-in date
                if (input.toLowerCase() === 'cancel') {
                    cancelBookingFlow();
                    return;
                }

                state.bookingData.roomType = input;
                
                // Render custom HTML date pickers for smooth UX
                const dateForm = `
                    <div style="background-color:rgba(255,255,255,0.02); padding:1rem; border-radius:4px; border:1px solid rgba(255,255,255,0.05); display:flex; flex-direction:column; gap:0.8rem; width:100%;">
                        <div class="chat-date-picker-row">
                            <div style="flex:1;">
                                <label style="display:block; font-size:10px; color:var(--color-grey-light); margin-bottom:4px;">CHECK-IN DATE</label>
                                <input type="date" class="chat-date-input" id="chat-in-date" required>
                            </div>
                            <div style="flex:1;">
                                <label style="display:block; font-size:10px; color:var(--color-grey-light); margin-bottom:4px;">CHECK-OUT DATE</label>
                                <input type="date" class="chat-date-input" id="chat-out-date" required>
                            </div>
                        </div>
                        <button type="button" class="chat-form-btn" id="btn-submit-dates">Confirm Dates</button>
                    </div>
                `;

                addBotMessage("Please pick your check-in and check-out dates:");
                setTimeout(() => {
                    addMessage('bot', dateForm, true);
                    
                    // Bind listener to submit dates button
                    const submitBtn = document.getElementById('btn-submit-dates');
                    if (submitBtn) {
                        submitBtn.addEventListener('click', () => {
                            const checkIn = document.getElementById('chat-in-date').value;
                            const checkOut = document.getElementById('chat-out-date').value;
                            
                            if (!checkIn || !checkOut) {
                                addBotMessage("Please complete both check-in and check-out dates before confirming.");
                                return;
                            }
                            
                            // Validate date order
                            if (new Date(checkIn) >= new Date(checkOut)) {
                                addBotMessage("The check-out date must be after the check-in date.");
                                return;
                            }

                            // Capture dates
                            state.bookingData.checkIn = checkIn;
                            state.bookingData.checkOut = checkOut;
                            
                            // Simulate user message to trigger next step
                            addUserMessage(`Dates: ${checkIn} to ${checkOut}`);
                            state.bookingStep = 3;
                            handleBookingFlow('');
                        });
                    }
                }, 450);
                break;

            case 3:
                // Step 3: Ask for guests count
                addBotMessage("**How many guests will be staying?**");
                renderQuickReplies(["1 Guest", "2 Guests", "3 Guests", "4+ Guests", "Cancel"]);
                state.bookingStep = 4;
                break;

            case 4:
                // Step 4: Capture guests, ask for name
                if (input.toLowerCase() === 'cancel') {
                    cancelBookingFlow();
                    return;
                }

                state.bookingData.guests = input;
                addBotMessage("**May I have your name, please?**");
                renderQuickReplies(["Cancel"]);
                state.bookingStep = 5;
                break;

            case 5:
                // Step 5: Capture name, ask for whatsapp
                if (input.toLowerCase() === 'cancel') {
                    cancelBookingFlow();
                    return;
                }

                state.bookingData.name = input;
                addBotMessage("**What is the best WhatsApp number to reach you?**");
                renderQuickReplies(["Cancel"]);
                state.bookingStep = 6;
                break;

            case 6:
                // Step 6: Capture whatsapp, present summary
                if (input.toLowerCase() === 'cancel') {
                    cancelBookingFlow();
                    return;
                }

                state.bookingData.whatsapp = input;
                renderBookingSummary();
                break;
        }
    }

    // Render summary card
    function renderBookingSummary() {
        const d = state.bookingData;
        const c = window.BLIV_DATA.config.contactDetails;
        
        // Build whatsapp encoded message
        const baseMsg = `Hello BLIV Service Apartments, I would like to enquire about ${d.property.name}.\n\n` +
                        `Room: ${d.roomType}\n` +
                        `Check-in: ${d.checkIn}\n` +
                        `Check-out: ${d.checkOut}\n` +
                        `Guests: ${d.guests}\n` +
                        `Name: ${d.name}\n` +
                        `WhatsApp: ${d.whatsapp}`;
        
        const encMsg = encodeURIComponent(baseMsg);
        
        // Dynamic link targets
        const waLinkA = `${c.deskA.wa}?text=${encMsg}`;
        const waLinkB = `${c.deskB.wa}?text=${encMsg}`;

        const summaryHtml = `
            <div class="chat-summary-card">
                <div class="chat-summary-title">Stay Summary</div>
                <div class="chat-summary-item"><span>Property:</span> <span>${d.property.name}</span></div>
                <div class="chat-summary-item"><span>Apartment:</span> <span>${d.roomType}</span></div>
                <div class="chat-summary-item"><span>Check-in:</span> <span>${d.checkIn}</span></div>
                <div class="chat-summary-item"><span>Check-out:</span> <span>${d.checkOut}</span></div>
                <div class="chat-summary-item"><span>Guests:</span> <span>${d.guests}</span></div>
                <div class="chat-summary-item"><span>Name:</span> <span>${d.name}</span></div>
                <div class="chat-summary-item"><span>WhatsApp:</span> <span>${d.whatsapp}</span></div>
            </div>
            <div style="margin-top:0.8rem; display:flex; flex-direction:column; gap:0.5rem; width:100%;">
                <a href="${waLinkA}" target="_blank" rel="noopener noreferrer" class="chat-form-btn" style="text-align:center; text-decoration:none; display:block;" onclick="window.BLIV_TRACK_WA_CLICK()">Send Enquiry via Desk A</a>
                <a href="${waLinkB}" target="_blank" rel="noopener noreferrer" class="chat-form-btn" style="text-align:center; text-decoration:none; display:block;" onclick="window.BLIV_TRACK_WA_CLICK()">Send Enquiry via Desk B</a>
                <button type="button" class="chat-form-btn" style="background:transparent; color:var(--color-grey-light); border-color:rgba(255,255,255,0.15);" id="btn-booking-restart">Start Over</button>
            </div>
        `;

        addBotMessage("Here is your completed stay enquiry summary. Ready to submit to our reservations desk?");
        setTimeout(() => {
            addMessage('bot', summaryHtml, true);
            
            // Bind restart button
            const restartBtn = document.getElementById('btn-booking-restart');
            if (restartBtn) {
                restartBtn.addEventListener('click', () => {
                    state.activeFlow = 'booking';
                    state.bookingStep = 0;
                    handleBookingFlow('');
                });
            }
            renderQuickReplies(["Explore Properties", "Close Chat"]);
        }, 450);

        // Reset flow
        state.activeFlow = null;
        state.bookingStep = 0;
    }

    // Cancel flow
    function cancelBookingFlow() {
        state.activeFlow = null;
        state.bookingStep = 0;
        addBotMessage("Stay planning cancelled. What else can I help you with?");
        renderQuickReplies(["Explore Properties", "Plan My Stay", "What's Nearby?", "Contact Reservations"]);
    }

    // local analytics click tracker
    window.BLIV_TRACK_WA_CLICK = function() {
        trackLocalEvent('whatsapp_clicked');
    };

    // Session storage event tracker
    function trackLocalEvent(eventName) {
        try {
            const events = JSON.parse(sessionStorage.getItem('bliv_concierge_events') || '[]');
            events.push({ event: eventName, timestamp: new Date().toISOString() });
            sessionStorage.setItem('bliv_concierge_events', JSON.stringify(events));
        } catch (e) {
            // fail silently
        }
    }
})();
