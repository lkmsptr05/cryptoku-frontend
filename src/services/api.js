// src/services/api.js
const API_BASE_URL = 'http://192.168.100.131:3000/api'; // Sesuaikan dengan URL backend Anda

/**
 * Memanggil endpoint backend untuk membuat quote transaksi.
 * (Tidak berubah)
 */
export async function createQuote(quoteDetails) {
  try {
    console.log("Creating quote with details:", quoteDetails);
    const response = await fetch(`${API_BASE_URL}/quote/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(quoteDetails),
    });

    

    const data = await response.json();
    console.log("Response from createQuote:", data);
    if (!response.ok) {
      throw new Error(data.error || 'Gagal membuat penawaran harga.');
    }

    return data; 
  } catch (error) {
    console.error("API Error (createQuote):", error);
    throw error;
  }
}

// ----------------------------------------------------
// FUNGSI BARU: Mengambil SEMUA data harga
// ----------------------------------------------------

/**
 * Mengambil SEMUA data harga token dari endpoint /api/prices
 * @returns {Promise<Array>} Array data harga token
 */
export async function getAllPrices() {
    try {
        const response = await fetch(`${API_BASE_URL}/prices`); // 🎯 Perubahan endpoint di sini
        const data = await response.json();
        
        if (!response.ok || data.error) {
            throw new Error(data.error?.message || `Gagal mengambil semua harga.`);
        }
        
        // Asumsi data.data adalah array of price objects
        return data.data; 
    } catch (error) {
        console.error("API Error (getAllPrices):", error);
        throw error;
    }
}


/**
 * Mengambil harga token tunggal. 
 * (Tetap dipertahankan, asumsikan endpoint-nya /api/price/:symbol jika diperlukan)
 * @param {string} symbol - Simbol token (misalnya 'bnbusdt')
 * @returns {Promise<object>} Data harga
 */
export async function getPrice(symbol) {
    try {
        // Asumsi: Jika Anda ingin mengambil harga tunggal, Anda tetap menggunakan endpoint /api/price/:symbol
        const response = await fetch(`${API_BASE_URL}/price/${symbol}`); 
        const data = await response.json();
        
        if (!response.ok || data.error) {
            throw new Error(data.error?.message || `Gagal mengambil harga untuk ${symbol}`);
        }
        return data.data;
    } catch (error) {
        console.error("API Error (getPrice):", error);
        throw error;
    }
}

export async function getNetworks() {
    try {
        const response = await fetch(`${API_BASE_URL}/networks`);
        const data = await response.json();
        if (!response.ok || data.error) {
            throw new Error(data.error?.message || 'Gagal mengambil jaringan yang tersedia.');
        }
        return data.data;
    }
    catch (error) {
        console.error("API Error (getNetworks):", error);
        throw error;
    }
}

export async function getTokensByNetwork(networkKey) {
    try {
        const response = await fetch(`${API_BASE_URL}/tokens?network=${networkKey}`);
        const data = await response.json();
        if (!response.ok || data.error) {
            throw new Error(data.error?.message || `Gagal mengambil token untuk jaringan ${networkKey}.`);
        }
        return data.data;
    }
    catch (error) {
        console.error("API Error (getTokensByNetwork):", error);
        throw error;
    } 
}

export async function getSystemHealth(){
    try {
    
        const response = await fetch(`${API_BASE_URL}/health`); 
        const data = await response.json();
        
        if (!response.ok || data.error) {
            throw new Error(data.error?.message || `Error mendaptkan data system health`);
        }
        return data;
    } catch (error) {
        console.error("Error (getSystemHealth):", error);
        throw error;
    }
}

// estimate gas fee
export async function getGas(network_key, to, tokenAddress = null, amount) {
    try {
        const response = await fetch(`${API_BASE_URL}/estimate-gas?network_key=${network_key}&to=${to}?from=0xAb5801a7D398351b8bE11C439e05C5B3259aeC9B&tokenAddress=${tokenAddress}`)
        const data = await response.json();
        if (!response.ok || data.error) {
                throw new Error(data.error?.message || `Error mendaptkan data gas fee`);
        }
        console.log(data)
        return data;
    } catch (error) {
        console.error("Error (getGas):", error);
        throw error;
    }
}