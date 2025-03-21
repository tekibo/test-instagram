document.addEventListener('DOMContentLoaded', () => {
    const updatesContainer = document.getElementById('updates-container');
    const allBtn = document.getElementById('all-btn');
    const facebookBtn = document.getElementById('facebook-btn');
    const instagramBtn = document.getElementById('instagram-btn');
    const threadsBtn = document.getElementById('threads-btn');

    let currentFilter = 'all';

    // Filter buttons click handlers
    allBtn.addEventListener('click', () => filterUpdates('all'));
    facebookBtn.addEventListener('click', () => filterUpdates('facebook'));
    instagramBtn.addEventListener('click', () => filterUpdates('instagram'));
    threadsBtn.addEventListener('click', () => filterUpdates('threads'));

    function filterUpdates(type) {
        currentFilter = type;
        const updates = document.querySelectorAll('.update-card');
        
        updates.forEach(update => {
            if (type === 'all' || update.dataset.type === type) {
                update.classList.remove('hidden');
            } else {
                update.classList.add('hidden');
            }
        });

        // Update button states
        [allBtn, facebookBtn, instagramBtn, threadsBtn].forEach(btn => {
            btn.classList.remove('ring-2');
        });
        document.getElementById(`${type}-btn`).classList.add('ring-2');
    }

    function formatTimestamp(timestamp) {
        return new Date(timestamp).toLocaleString();
    }

    function createUpdateCard(update, type) {
        const card = document.createElement('div');
        card.className = `update-card ${type}-update bg-white rounded-lg shadow p-4 mb-4`;
        card.dataset.type = type;
        
        const timestamp = new Date().toISOString();
        
        card.innerHTML = `
            <div class="flex justify-between items-start mb-2">
                <h3 class="text-lg font-medium capitalize">${type} Update</h3>
                <span class="timestamp">${formatTimestamp(timestamp)}</span>
            </div>
            <div class="json-viewer">${JSON.stringify(update, null, 2)}</div>
        `;

        if (currentFilter !== 'all' && currentFilter !== type) {
            card.classList.add('hidden');
        }

        return card;
    }

    // Function to fetch updates
    async function fetchUpdates() {
        try {
            const response = await fetch('/updates');
            const updates = await response.json();
            
            updatesContainer.innerHTML = '';
            
            if (updates.length === 0) {
                updatesContainer.innerHTML = `
                    <div class="text-gray-500 text-center py-8">
                        No updates received yet...
                    </div>
                `;
                return;
            }

            updates.forEach(update => {
                let type = 'facebook';
                if (update.instagram) type = 'instagram';
                if (update.threads) type = 'threads';
                
                const card = createUpdateCard(update, type);
                updatesContainer.appendChild(card);
            });
        } catch (error) {
            console.error('Error fetching updates:', error);
            updatesContainer.innerHTML = `
                <div class="text-red-500 text-center py-8">
                    Error loading updates. Please try again later.
                </div>
            `;
        }
    }

    // Initial fetch
    fetchUpdates();

    // Fetch updates every 30 seconds
    setInterval(fetchUpdates, 30000);
}); 