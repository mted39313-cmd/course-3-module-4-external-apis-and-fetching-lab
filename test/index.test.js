/**
 * @jest-environment jsdom
 */

// Corrected relative path to point to index.js in the root directory
const { fetchWeatherAlerts, displayAlerts, displayError } = require('../index.js');

// Mock global fetch
global.fetch = jest.fn();

describe('Weather App - External APIs and Fetching Lab', () => {
    
    beforeEach(() => {
        // Reset DOM elements before each test
        document.body.innerHTML = `
            <input type="text" id="state-input" value="NY">
            <button id="submit-btn">Get Weather Alerts</button>
            <div id="error-message" class="hidden"></div>
            <div id="alerts-container">
                <h2 id="alerts-title"></h2>
                <ul id="alerts-list"></ul>
            </div>
        `;
        jest.clearAllMocks();
    });

    test('The fetch request is made using the correct input state abbreviation', async () => {
        const mockResponse = {
            title: 'Current watches, warnings, and advisories for New York',
            features: [
                { properties: { headline: 'Flood Warning issued...' } }
            ]
        };

        fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => mockResponse
        });

        await fetchWeatherAlerts('NY');

        // Verify fetch was called with the correct URL endpoint
        expect(fetch).toHaveBeenCalledTimes(1);
        expect(fetch).toHaveBeenCalledWith('https://api.weather.gov/alerts/active?area=NY');
    });

    test('When a successful fetch request is made, the title and number of alerts are displayed', () => {
        const mockData = {
            title: 'Current watches, warnings, and advisories for New York',
            features: [
                { properties: { headline: 'Alert 1' } },
                { properties: { headline: 'Alert 2' } }
            ]
        };

        displayAlerts(mockData, 'NY');

        const alertsTitle = document.getElementById('alerts-title');
        const alertsList = document.getElementById('alerts-list');

        expect(alertsTitle.textContent).toBe('Current watches, warnings, and advisories for New York: 2');
        expect(alertsList.children.length).toBe(2);
        expect(alertsList.children[0].textContent).toBe('Alert 1');
    });

    test('When an unsuccessful request is made, the error message is displayed', () => {
        const mockError = new Error('Failed to fetch weather data. Status: 404');
        
        displayError(mockError);

        const errorMessageDiv = document.getElementById('error-message');
        expect(errorMessageDiv.classList.contains('hidden')).toBe(false);
        expect(errorMessageDiv.textContent).toBe('Failed to fetch weather data. Status: 404');
    });

    test('Error messages are cleared and hidden after a successful request', async () => {
        // Setup initial visible error state
        const errorMessageDiv = document.getElementById('error-message');
        errorMessageDiv.textContent = 'Previous Error';
        errorMessageDiv.classList.remove('hidden');

        const mockResponse = {
            title: 'Current watches, warnings, and advisories for CA',
            features: []
        };

        fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => mockResponse
        });

        await fetchWeatherAlerts('CA');

        // Check if error is hidden and cleared
        expect(errorMessageDiv.classList.contains('hidden')).toBe(true);
        expect(errorMessageDiv.textContent).toBe('');
    });
});