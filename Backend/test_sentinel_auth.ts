import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config({ path: 'd:/Forest Inventory/Backend/.env' });

const SENTINEL_AUTH_URL = "https://services.sentinel-hub.com/oauth/token";

async function testAuth() {
    const clientId = process.env.SENTINEL_CLIENT_ID;
    const clientSecret = process.env.SENTINEL_CLIENT_SECRET;

    console.log('Testing with Client ID:', clientId);

    const params = new URLSearchParams();
    params.append('grant_type', 'client_credentials');
    params.append('client_id', clientId!);
    params.append('client_secret', clientSecret!);

    try {
        const response = await axios.post(SENTINEL_AUTH_URL, params, {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });
        console.log('SUCCESS: Token obtained.');
    } catch (err: any) {
        console.log('FAILURE:', err.response?.data || err.message);
    }
}

testAuth();
