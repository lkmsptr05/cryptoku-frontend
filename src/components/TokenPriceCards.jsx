// src/components/TokenPriceCards.jsx
import React, { useState, useEffect } from 'react';
import { getAllPrices } from '../services/api';

function TokenPriceCards() {
  const [prices, setPrices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Logika fetch harga (tidak berubah)
  useEffect(() => {
    const fetchAllPrices = async () => {
      try {
        const data = await getAllPrices(); 
        
        if (data && Array.isArray(data) && data.length > 0) {
            setPrices(data);
            setError(null);
        } else {
            setError("Tidak ada data harga yang tersedia.");
        }
      } catch (err) {
        setError(err.message || "Gagal memuat semua harga dari server.");
      } finally {
        setLoading(false);
      }
    };
    fetchAllPrices();
    const interval = setInterval(fetchAllPrices, 30000); 
    return () => clearInterval(interval);
  }, []);

  // Warna cerah untuk tema gelap (tidak berubah)
  const getChangeColor = (change) => {
      if (!change) return 'text-gray-500';
      const parsedChange = parseFloat(change);
      if (parsedChange > 0) return 'text-green-400 bg-green-900/50 px-2 py-0.5 rounded-sm';
      if (parsedChange < 0) return 'text-red-400 bg-red-900/50 px-2 py-0.5 rounded-sm';
      return 'text-gray-500';
  };
  
  const formatChange = (change) => {
      if (!change) return '0.00%';
      return parseFloat(change).toFixed(2) + '%';
  }

  if (loading) {
    return (
      <div className="text-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-400 mx-auto mb-2"></div>
        <p className="text-gray-400 text-sm">Memuat harga...</p>
      </div>
    );
  }
    
  if (error) {
    return (
      <div className="p-3 text-red-400 bg-gray-800 rounded-lg border border-red-700 text-sm">
        <p>❌ Gagal memuat harga: {error}</p>
      </div>
    );
  }

  return (
    <div className="p-4 bg-gray-800 rounded-xl shadow-2xl">
      <h2 className="text-xl font-bold mb-4 text-white border-b border-gray-700 pb-2">Market Harga Terkini</h2>
      
      {/* ⬇️ PERUBAHAN UTAMA UNTUK 3 COL SCROLL HORIZONTAL ⬇️ */}
      <div 
        // 1. Container flex untuk deretan horizontal
        className="flex space-x-4 pb-2"
        // 2. Memungkinkan scroll horizontal dan menyembunyikan scrollbar
        style={{ overflowX: 'auto', scrollbarWidth: 'none' }} 
      >
        {prices.map((token, index) => (
          <div 
            key={index} 
            // Setiap card mengambil sekitar 1/3 dari lebar container (misalnya w-40 atau w-1/3)
            // Menggunakan w-40 agar lebih konsisten di berbagai ukuran mobile
            className="flex-shrink-0 w-40 p-3 bg-gray-700 rounded-lg border border-gray-600 hover:border-teal-400 transition shadow-lg"
          >
                {/* Judul Token */}
                <div className="border-b border-gray-600 pb-2 mb-2">
                    <span className="text-lg font-bold text-teal-400 block truncate">
                        {token.symbol.toUpperCase().replace('USDT', '')}
                    </span>
                    <span className="text-xs text-gray-500">{token.symbol.toUpperCase()}</span>
                </div>

                {/* Harga IDR (Row 1) */}
                <div className="py-1">
                    <span className="text-sm font-semibold text-gray-400 block">IDR Price:</span>
                    <span className="text-lg font-bold text-pink-400">
                        Rp {parseInt(token.price_idr).toLocaleString('id-ID')}
                    </span>
                </div>
                
                {/* Harga USD (Row 2) */}
                <div className="py-1">
                    <span className="text-xs font-semibold text-gray-500 block">USD Price:</span>
                    <span className="text-base font-medium text-gray-300">
                        $ {parseFloat(token.price_usd).toFixed(4)}
                    </span>
                </div>

                {/* Perubahan 24J (Row 3) */}
                <div className="pt-2 border-t border-gray-600 mt-2">
                    <span className="text-xs text-gray-400 block mb-1">24H Change:</span>
                    <span className={`text-sm font-bold ${getChangeColor(token.priceChangePercent)}`}>
                        {formatChange(token.priceChangePercent)}
                    </span>
                </div>
                
          </div>
        ))}
      </div>
    </div>
  );
}

export default TokenPriceCards;