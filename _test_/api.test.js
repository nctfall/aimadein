import { fetchDataFromAPI } from '../src/api'; // Assuming your API function is in src/api/index.js
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

// Set up the mock adapter
const mock = new MockAdapter(axios);

describe('Backend Connectivity Test', () => {
  it('should successfully connect to the cloud database', async () => {
    const mockResponse = { success: true, data: { message: 'Connected to DB' } };

    // Mock the API request
    mock.onGet('/api/connect').reply(200, mockResponse);

    // Call your function
    const response = await fetchDataFromAPI('/api/connect');
    
    // Check if the response matches the mock data
    expect(response.success).toBe(true);
    expect(response.data.message).toBe('Connected to DB');
  });
});
