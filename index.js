// Select DOM elements (wrapped safely if loaded in test environment)
const stateInput = document.getElementById('state-input');
const submitBtn = document.getElementById('submit-btn');
const errorMessageDiv = document.getElementById('error-message');
const alertsTitle = document.getElementById('alerts-title');
const alertsList = document.getElementById('alerts-list');

// Event listener for button click (only runs if element exists in DOM)
if (submitBtn) {
    submitBtn.addEventListener('click', () => {
        const stateAbbr = stateInput.value.trim().toUpperCase();
        
        // Validate input before making request
        if (!stateAbbr || stateAbbr.length !== 2) {
            displayError(new Error("Please enter a valid 2-letter state abbreviation (e.g., NY, CA)."));
            return;
        }

        fetchWeatherAlerts(stateAbbr);
    });
}

// Function to fetch weather alerts from National Weather Service API
async function fetchWeatherAlerts(state) {
    const url = `https://api.weather.gov/alerts/active?area=${state}`;

    try {
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`Failed to fetch weather data. Status: ${response.status}`);
        }

        const data = await response.json();
        console.log(data); // Log data for testing/debugging

        // Clear input and hide any previous errors on success
        if (stateInput) stateInput.value = '';
        hideError();

        // Update DOM with weather data
        displayAlerts(data, state);

    } catch (errorObject) {
        console.log(errorObject.message);
        displayError(errorObject);
    }
}

// Function to dynamically update DOM with weather information
function displayAlerts(data, state) {
    const titleEl = document.getElementById('alerts-title');
    const listEl = document.getElementById('alerts-list');

    if (!titleEl || !listEl) return;

    // Clear previous alerts
    titleEl.textContent = '';
    listEl.innerHTML = '';

    const title = data.title || `Current watches, warnings, and advisories for ${state}`;
    const features = data.features || [];
    const count = features.length;

    // Display summary message (e.g., "Current watches, warnings, and advisories for Minnesota: 11")
    titleEl.textContent = `${title}: ${count}`;

    // Populate list of alert headlines
    if (count === 0) {
        const li = document.createElement('li');
        li.textContent = "No active weather alerts for this area.";
        listEl.appendChild(li);
    } else {
        features.forEach(alert => {
            const headline = alert.properties && alert.properties.headline 
                ? alert.properties.headline 
                : "Weather Alert (Headline unavailable)";
            
            const li = document.createElement('li');
            li.textContent = headline;
            listEl.appendChild(li);
        });
    }
}

// Function to display error messages in the DOM
function displayError(errorObject) {
    const errorDiv = document.getElementById('error-message');
    const titleEl = document.getElementById('alerts-title');
    const listEl = document.getElementById('alerts-list');

    if (errorDiv) {
        errorDiv.textContent = errorObject.message;
        errorDiv.classList.remove('hidden');
    }
    
    // Clear previous results when an error occurs
    if (titleEl) titleEl.textContent = '';
    if (listEl) listEl.innerHTML = '';
}

// Function to hide error message
function hideError() {
    const errorDiv = document.getElementById('error-message');
    if (errorDiv) {
        errorDiv.textContent = '';
        errorDiv.classList.add('hidden');
    }
}

// Export functions for unit testing (Jest)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { fetchWeatherAlerts, displayAlerts, displayError };
}