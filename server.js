const express = require('express');
const path = require('path');
const fetch = require('node-fetch');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Replace with your actual API_KEY and DANA_NUMBER
const API_KEY = 'sk-u9di3e6xidkwqe'; // Replace with a valid API key
const DANA_NUMBER = '0895402567224';

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// --- API Endpoints ---
app.get('/api/depositMethods', async (req, res) => {
    try {
        const depositMethods = await getDepositMethods();
        if (!depositMethods || depositMethods.status !== 'success') {
            return res.status(500).json({ error: 'Failed to fetch deposit methods.' });
        }
        res.json(depositMethods.data);
    } catch (error) {
        console.error('Error fetching deposit methods:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/api/createDeposit', async (req, res) => {
    const { nominal, method } = req.body;

    if (!nominal || !method) {
        return res.status(400).json({ error: 'Nominal and Method are required.' });
    }

    try {
        const deposit = await createDeposit(nominal, method);
        if (!deposit || deposit.status !== 'success') {
            return res.status(500).json({ error: 'Failed to create deposit.' });
        }
        res.json(deposit.data);
    } catch (error) {
        console.error('Error creating deposit:', error);
        res.status(500).json({ error: 'Internal server error.' });
    }
});

app.get('/api/transferMethods', async (req, res) => {
    try {
        const transferMethods = await getTransferMethods();
        if (!transferMethods || !transferMethods.data) {
            return res.status(500).json({ error: 'Failed to fetch transfer methods.' });
        }
        res.json(transferMethods.data);
    } catch (error) {
        console.error('Error fetching transfer methods:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/api/createTransfer', async (req, res) => {
    const { nominal, accountNumber, method } = req.body;

    if (!nominal || !accountNumber || !method) {
        return res.status(400).json({ error: 'Nominal, Account Number, and Method are required.' });
    }

    try {
        const transferResult = await createTransfer(nominal, accountNumber, method);
        if (!transferResult || transferResult.status !== 'success') {
            return res.status(500).json({ error: 'Failed to create transfer.' });
        }
        res.json(transferResult.data);
    } catch (error) {
        console.error('Error creating transfer:', error);
        res.status(500).json({ error: 'Internal server error.' });
    }
});

app.get('/api/products', async (req, res) => {
    try {
        const products = await getStoreList();
        if (!products || !products.data) {
            return res.status(500).json({ error: 'Failed to fetch product list.' });
        }
        res.json(products.data);
    } catch (error) {
        console.error('Error fetching product list:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/api/createTransaction', async (req, res) => {
    const { target, productCode } = req.body;

    if (!target || !productCode) {
        return res.status(400).json({ error: 'Target and Product Code are required.' });
    }

    try {
        const transactionResult = await createTransaction(target, productCode);
        if (!transactionResult || transactionResult.status !== 'success') {
            return res.status(500).json({ error: 'Failed to create transaction.' });
        }
        res.json(transactionResult.data);
    } catch (error) {
        console.error('Error creating transaction:', error);
        res.status(500).json({ error: 'Internal server error.' });
    }
});

// --- API Functions (from your original code) ---
async function getDepositMethods() {
    try {
        const response = await fetch('https://forestapi.web.id/api/h2h/deposit/methods', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ api_key: API_KEY })
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error('Gagal mendapatkan metode deposit:', error);
        return null;
    }
}

async function createDeposit(nominal, method, phoneNumber = '') {
    const DEPOSIT_URL = 'https://forestapi.web.id/api/h2h/deposit/create';
    const reffId = `deposit-${Math.random().toString(36).substring(2, 10)}`;
    try {
        const response = await fetch(DEPOSIT_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phone_number: phoneNumber, nominal: nominal, method: method, reff_id: reffId, api_key: API_KEY })
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error('Gagal membuat deposit:', error);
        return null;
    }
}

async function getTransferMethods() {
    try {
        const response = await fetch('https://forestapi.web.id/api/h2h/transfer/methods', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: 'forestapi', api_key: API_KEY })
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error('Gagal mendapatkan metode transfer:', error);
        return null;
    }
}

async function createTransfer(nominal, accountNumber, method) {
    try {
        const response = await fetch('https://forestapi.web.id/api/h2h/transfer/create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nominal: nominal, account_number: accountNumber, method: method, reff_id: `transfer-${Math.random().toString(36).substring(2, 10)}`, api_key: API_KEY })
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error('Gagal membuat permintaan transfer:', error);
        return null;
    }
}

async function createTransaction(target, productCode) {
    try {
        const url = `https://forestapi.web.id/api/h2h/transaction/create?api_key=${API_KEY}&reff_id=transaction-${Math.random().toString(36).substring(2, 10)}&target=${target}&product_code=${productCode}`;
        const response = await fetch(url, { method: 'GET' });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error('Gagal membuat transaksi:', error);
        return null;
    }
}

async function getStoreList() {
    try {
        const response = await fetch('https://forestapi.web.id/api/h2h/price-list/all', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ profit_percent: "1", filter_status: "true", api_key: API_KEY })
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error('Gagal mendapatkan daftar produk:', error);
        return null;
    }
}

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
