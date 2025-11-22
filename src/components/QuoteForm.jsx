// src/components/QuoteForm.jsx
import React, { useState } from 'react';
import { createQuote } from '../services/api';

function QuoteForm() {
  const [amountIdr, setAmountIdr] = useState(50000); 
  const [wallet, setWallet] = useState('');
  const [selectedToken, setSelectedToken] = useState('BNB'); 
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [transactionStatus, setTransactionStatus] = useState(null); // State untuk status transaksi

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTransactionStatus(null); // Reset status
    
    if (amountIdr < 10000) { 
        setError("Minimal pembelian Rp 10.000.");
        return;
    }
    if (wallet.length < 40) {
        setError("Alamat wallet tidak valid.");
        return;
    }
    
    setLoading(true);
    setError(null);
    
    const quoteDetails = {
      telegram_user_id: 12345, 
      network_key: 'bsc',      
      token_symbol: selectedToken,     
      amount_idr: amountIdr,
      // PENTING: Pastikan backend Anda menerima field buyer_wallet
      buyer_wallet: wallet, 
    };

    try {
      const result = await createQuote(quoteDetails);
      
      const midtransToken = result.midtrans.token;
      console.log("Received Midtrans token:", midtransToken);
      if (midtransToken) {
          // 🎯 LOGIKA POPUP MIDTRANS SNAP
          if (window.snap) {
              window.snap.pay(midtransToken, {
                  onSuccess: function(res){
                      console.log('Payment success:', res);
                      setTransactionStatus({ type: 'success', message: '✅ Pembayaran Berhasil! Pesanan Anda sedang diproses.' });
                      // Biasanya, Anda akan melakukan callback ke backend di sini
                  },
                  onPending: function(res){
                      console.log('Payment pending:', res);
                      setTransactionStatus({ type: 'pending', message: `⏳ Pembayaran Pending. Silakan selesaikan pembayaran melalui ${res.payment_type}.` });
                  },
                  onError: function(res){
                      console.error('Payment error:', res);
                      setTransactionStatus({ type: 'error', message: '❌ Pembayaran Gagal. Silakan coba lagi.' });
                  },
                  onClose: function(){
                      console.log('Snap popup closed.');
                      // Hanya set error jika belum ada status lain (misalnya, pending)
                      if (!transactionStatus) {
                         setTransactionStatus({ type: 'info', message: 'Anda menutup jendela pembayaran.' });
                      }
                  }
              });
          } else {
              // Fallback untuk Miniapp/Browser jika Snap JS GAGAL dimuat
              const redirectUrl = result.midtrans_redirect_url;
              if (window.Telegram && window.Telegram.WebApp) {
                  window.Telegram.WebApp.openLink(redirectUrl);
              } else {
                  window.location.href = redirectUrl;
              }
          }
      } else {
          throw new Error("Midtrans token tidak diterima dari server.");
      }

    } catch (err) {
      setError(err.message || "Terjadi kesalahan saat membuat quote.");
    } finally {
      setLoading(false);
    }
  };
  
  // Helper untuk styling status transaksi
  const getStatusStyle = (type) => {
    switch (type) {
        case 'success': return 'bg-green-600 border-green-400';
        case 'pending': return 'bg-yellow-600 border-yellow-400';
        case 'error': return 'bg-red-600 border-red-400';
        default: return 'bg-blue-600 border-blue-400';
    }
  }

  return (
    <div className="p-4 bg-gray-800 rounded-xl shadow-2xl border border-teal-500/30">
      <h2 className="text-xl font-bold mb-4 text-center text-teal-400">🛒 Beli Kripto Instan</h2>
      {error && <div className="p-3 mb-4 text-sm text-red-400 bg-gray-700 rounded-lg">{error}</div>}
      
      {/* Tampilan Status Transaksi */}
      {transactionStatus && (
          <div className={`p-3 mb-4 text-sm text-white rounded-lg font-semibold border ${getStatusStyle(transactionStatus.type)}`}>
              {transactionStatus.message}
          </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        
        {/* Input Pilihan Token (tidak diubah) */}
        <div className="p-3 bg-gray-700 rounded-lg">
          <label className="block text-xs font-semibold text-gray-300 mb-1">
            Pilih Koin
          </label>
          <select 
            value={selectedToken}
            onChange={(e) => setSelectedToken(e.target.value)}
            className="w-full p-2 border border-gray-600 rounded-lg text-white bg-gray-800 appearance-none"
          >
            <option value="BNB">BNB (Binance Smart Chain)</option>
          </select>
        </div>

        {/* Input Jumlah IDR (tidak diubah) */}
        <div>
          <label className="block text-sm font-semibold text-gray-300 mb-1">
            Bayar Tepat Sejumlah
          </label>
          <div className="relative">
             <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-lg font-bold text-gray-500">
                Rp
             </span>
             <input
                type="number"
                value={amountIdr}
                onChange={(e) => setAmountIdr(parseInt(e.target.value))}
                min="10000"
                className="w-full p-3 pl-10 border-2 border-pink-400 rounded-lg text-lg font-bold text-pink-400 bg-gray-900 focus:ring-pink-500 focus:border-pink-500"
                placeholder="Min. 10.000"
                required
            />
          </div>
        </div>
        
        {/* Input Wallet (tidak diubah) */}
        <div>
          <label className="block text-sm font-semibold text-gray-300 mb-1">
            Alamat Wallet Tujuan (BSC)
          </label>
          <input
            type="text"
            value={wallet}
            onChange={(e) => setWallet(e.target.value)}
            className="w-full p-3 border border-gray-600 rounded-lg text-sm font-mono text-white bg-gray-900 focus:ring-teal-400 focus:border-teal-400"
            placeholder="0x..."
            required
          />
        </div>
        
        {/* Tombol Submit */}
        <button
          type="submit"
          disabled={loading || amountIdr < 10000 || !wallet}
          className={`w-full py-3 rounded-lg text-white font-extrabold text-lg transition duration-200 shadow-xl ${
            loading ? 'bg-gray-600 cursor-not-allowed' : 'bg-teal-500 hover:bg-teal-400 shadow-teal-500/50'
          }`}
        >
          {loading ? 'Membuat Quote...' : `BAYAR SEKARANG`}
        </button>
        
        <p className="text-center text-xs text-gray-500 pt-2">
            Biaya dipotong dari koin. Anda membayar tepat Rp {amountIdr.toLocaleString('id-ID')}.
        </p>
      </form>
    </div>
  );
}

export default QuoteForm;