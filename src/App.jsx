import React, { useState } from 'react';
import { 
  Plus, 
  Minus, 
  ShoppingCart, 
  Utensils, 
  Coffee, 
  Beer, 
  Cookie,
  X,
  Receipt,
  Copy,
  Check,
  QrCode,
  MapPin,
  MessageCircle,
  ChevronRight
} from 'lucide-react';

// Cardápio completo
const MENU = [
  {
    category: 'PRATOS PRINCIPAIS',
    icon: <Utensils className="w-5 h-5" />,
    items: [
      { id: 'pp1', name: 'BIFE ACEBOLADO', price: 21.00, available: true },
      { id: 'pp15', name: 'BIFE DOBRADO', price: 13.00, available: true },
      { id: 'pp2', name: 'BIFE', price: 20.00, available: true },
      { id: 'pp3', name: 'BIFE COM OVO', price: 21.00, available: true },
      { id: 'pp4', name: 'CARNE DE PORCO FRITA', price: 20.00, available: true },
      { id: 'pp5', name: 'FRANGO AO MOLHO', price: 20.00, available: true },
      { id: 'pp6', name: 'FRANGO FRITO', price: 20.00, available: true },
      { id: 'pp7', name: 'MOELA AO MOLHO', price: 20.00, available: true },
      { id: 'pp8', name: 'STROGONOFF DE FRANGO', price: 20.00, available: true },
      { id: 'pp9', name: 'FEIJOADA', price: 20.00, available: true },
      // Itens indisponíveis
      { id: 'pp10', name: 'BIFE DE FÍGADO', price: 0, available: false },
      { id: 'pp11', name: 'ALMÔNDEGA AO MOLHO', price: 0, available: false },
      { id: 'pp12', name: 'GALINHA COM ARROZ', price: 0, available: false },
      { id: 'pp13', name: 'COSTELA COZIDA', price: 0, available: false },
      { id: 'pp14', name: 'MARIA ISABEL', price: 0, available: false },
    ]
  },
  {
    category: 'PORÇÕES / ACOMPANHAMENTOS',
    icon: <Plus className="w-5 h-5" />,
    items: [
      { id: 'pa1', name: 'BATATA FRITA', price: 10.00, available: true },
      { id: 'pa2', name: 'CALABRESA FRITA ACEBOLADA', price: 10.00, available: true },
      { id: 'pa3', name: 'TORRESMO', price: 12.00, available: true },
      { id: 'pa4', name: 'PURURUCA', price: 10.00, available: true },
      { id: 'pa5', name: 'OVO FRITO', price: 1.00, available: true },
      { id: 'pa6', name: 'AMENDOIM', price: 5.00, available: true },
    ]
  },
  {
    category: 'SOBREMESAS',
    icon: <Cookie className="w-5 h-5" />,
    items: [
      { id: 'sp1', name: 'BRIGADEIRO', price: 12.00, available: true },
      { id: 'sp3', name: 'PICOLÉS', price: 5.00, available: true },
      { id: 'sp4', name: 'SORVETE', price: 10.00, available: true },
      { id: 'sp5', name: 'GELADINHOS', price: 5.00, available: true },
    ]
  },
  {
    category: 'BEBIDAS',
    icon: <Coffee className="w-5 h-5" />,
    items: [
      { id: 'be1', name: 'COCA-COLA 1L', price: 10.00, available: true },
    ]
  },
  {
    category: 'CERVEJAS',
    icon: <Beer className="w-5 h-5" />,
    items: [
      { id: 'ce1', name: 'CERVEJA', price: 18.00, available: true },
    ]
  }
];

// Funções para geração do PIX
const calculateCRC16 = (payload) => {
  let crc = 0xFFFF;
  for (let i = 0; i < payload.length; i++) {
    crc ^= payload.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      if (crc & 0x8000) {
        crc = (crc << 1) ^ 0x1021;
      } else {
        crc = crc << 1;
      }
    }
  }
  crc = crc & 0xFFFF;
  return crc.toString(16).toUpperCase().padStart(4, '0');
};

const generatePixPayload = (amount) => {
  const pixKey = '09561018000137'; // CNPJ
  const merchantName = 'RESTAURANTE DO JANIO';
  const merchantCity = 'CUIABA';
  const txid = 'COMANDA';

  let payload = '000201'; // Payload Format Indicator
  let mai = `0014br.gov.bcb.pix01${String(pixKey.length).padStart(2, '0')}${pixKey}`;
  payload += `26${String(mai.length).padStart(2, '0')}${mai}`;
  payload += '52040000'; // Merchant Category Code
  payload += '5303986'; // Transaction Currency (BRL)
  
  if (amount > 0) {
    const amountStr = amount.toFixed(2);
    payload += `54${String(amountStr.length).padStart(2, '0')}${amountStr}`;
  }
  
  payload += '5802BR'; // Country Code
  payload += `59${String(merchantName.length).padStart(2, '0')}${merchantName}`; // Merchant Name
  payload += `60${String(merchantCity.length).padStart(2, '0')}${merchantCity}`; // Merchant City
  
  let adf = `05${String(txid.length).padStart(2, '0')}${txid}`;
  payload += `62${String(adf.length).padStart(2, '0')}${adf}`;
  payload += '6304'; // CRC16 prefix
  payload += calculateCRC16(payload); // Add CRC
  
  return payload;
};

export default function App() {
  const [order, setOrder] = useState({});
  const [table, setTable] = useState('11'); 
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const cartItems = Object.entries(order).map(([id, quantity]) => {
    let foundItem = null;
    for (const cat of MENU) {
      const item = cat.items.find(i => i.id === id);
      if (item) { foundItem = item; break; }
    }
    return { ...foundItem, quantity };
  });

  const totalAmount = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const handleCopyPix = () => {
    const pixCode = generatePixPayload(totalAmount);
    const textArea = document.createElement("textarea");
    textArea.value = pixCode;
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand('copy');
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Falha ao copiar PIX', err);
    }
    document.body.removeChild(textArea);
  };

  const handleWhatsAppOrder = () => {
    const whatsAppNumber = "5565992576461";
    let message = `*NOVO PEDIDO - RESTAURANTE DO JÂNIO*\n`;
    message += `📍 *Mesa:* ${table}\n\n`;
    message += `*Itens:*\n`;
    
    cartItems.forEach(item => {
      message += `${item.quantity}x ${item.name} - ${formatPrice(item.price * item.quantity)}\n`;
    });
    
    message += `\n💰 *Total:* ${formatPrice(totalAmount)}\n`;
    message += `\n_Pedido enviado via Comanda Digital_`;

    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/${whatsAppNumber}?text=${encodedMessage}`, '_blank');
  };

  const updateQuantity = (itemId, delta) => {
    setOrder(prev => {
      const currentQuantity = prev[itemId] || 0;
      const newQuantity = Math.max(0, currentQuantity + delta);
      
      if (newQuantity === 0) {
        const newOrder = { ...prev };
        delete newOrder[itemId];
        return newOrder;
      }
      return { ...prev, [itemId]: newQuantity };
    });
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(price);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-200 via-blue-50 to-indigo-100 flex justify-center font-sans text-slate-800">
      
      {/* Círculos decorativos de background para potencializar o Glassmorphism */}
      <div className="fixed top-[-10%] left-[-10%] w-[300px] h-[300px] bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 pointer-events-none"></div>
      <div className="fixed top-[40%] right-[-10%] w-[400px] h-[400px] bg-indigo-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 pointer-events-none"></div>
      <div className="fixed bottom-[-10%] left-[20%] w-[350px] h-[350px] bg-cyan-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 pointer-events-none"></div>

      {/* Mobile App Container */}
      <div className="w-full max-w-md relative flex flex-col h-screen overflow-hidden z-10">
        
        {/* Header Glassmorphism */}
        <header className="pt-6 px-4 pb-2 shrink-0 relative z-30">
          <div className="bg-white/60 backdrop-blur-xl border border-white/50 shadow-[0_8px_32px_rgba(30,58,138,0.08)] rounded-[32px] p-5 flex justify-between items-center">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-blue-600/80 mb-0.5">Restaurante</p>
              <h1 className="text-3xl font-serif italic font-black text-blue-950 tracking-tight leading-none">do Jânio</h1>
            </div>
            <div className="bg-white/70 backdrop-blur-md rounded-[20px] p-2 px-3 shadow-inner border border-white/60 flex flex-col items-center min-w-[72px]">
              <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Mesa</span>
              <input 
                type="text" 
                value={table}
                onChange={(e) => setTable(e.target.value)}
                className="w-full text-center text-xl font-black text-blue-700 bg-transparent outline-none mt-0.5 placeholder-slate-300"
                maxLength="3"
                placeholder="00"
              />
            </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-4 pb-48 hide-scrollbar">
          {MENU.map((category, idx) => (
            <div key={idx} className="mb-8 mt-4">
              {/* Category Header */}
              <div className="mb-4 text-center">
                <span className="inline-block bg-white/40 backdrop-blur-md border border-white/50 shadow-[0_4px_16px_rgba(0,0,0,0.03)] px-4 py-1.5 rounded-full font-bold tracking-widest text-[10px] uppercase text-blue-800">
                  {category.category}
                </span>
              </div>
              
              {/* Items List - Glass Cards */}
              <div className="flex flex-col gap-3">
                {category.items.map((item) => {
                  const quantity = order[item.id] || 0;
                  const isSelected = quantity > 0;
                  
                  return (
                    <div 
                      key={item.id} 
                      className={`bg-white/60 backdrop-blur-lg border border-white/60 rounded-[28px] p-4 shadow-[0_8px_32px_rgba(30,58,138,0.04)] transition-all duration-300
                        ${!item.available ? 'opacity-50 grayscale-[0.3]' : isSelected ? 'ring-2 ring-blue-400/40 bg-white/80' : 'hover:shadow-[0_12px_40px_rgba(30,58,138,0.08)]'}`}
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex-1 pr-3">
                          <h3 className={`text-[15px] leading-tight font-black ${isSelected ? 'text-blue-950' : 'text-slate-800'}`}>
                            {item.name}
                          </h3>
                          {item.available ? (
                            <p className="text-[14px] mt-1 font-bold text-blue-700">
                              {formatPrice(item.price)}
                            </p>
                          ) : (
                            <div className="mt-2 inline-block bg-slate-200/50 backdrop-blur-sm border border-slate-300/30 text-slate-500 text-[9px] uppercase font-bold tracking-wider py-1 px-2.5 rounded-full">
                              Indisponível
                            </div>
                          )}
                        </div>
                        
                        {/* Controls - Glass Pill */}
                        <div className="shrink-0">
                          <div className={`flex items-center space-x-1 p-1 rounded-full border border-white/60 shadow-inner ${!item.available ? 'bg-slate-100/30' : 'bg-white/50 backdrop-blur-sm'}`}>
                            <button 
                              onClick={() => updateQuantity(item.id, -1)}
                              className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 
                                ${!item.available ? 'text-slate-300 cursor-not-allowed' : quantity > 0 ? 'bg-white text-slate-700 shadow-[0_2px_10px_rgba(0,0,0,0.05)]' : 'text-slate-400 cursor-not-allowed'}`}
                              disabled={quantity === 0 || !item.available}
                            >
                              <Minus className="w-4 h-4" strokeWidth={2.5} />
                            </button>
                            
                            <span className={`w-5 text-center text-sm font-black ${!item.available ? 'text-slate-300' : 'text-slate-800'}`}>
                              {quantity}
                            </span>
                            
                            <button 
                              onClick={() => updateQuantity(item.id, 1)}
                              className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200
                                ${!item.available ? 'text-slate-300 cursor-not-allowed' : 'bg-blue-600 text-white shadow-[0_4px_12px_rgba(37,99,235,0.3)] hover:scale-105 active:scale-95'}`}
                              disabled={!item.available}
                            >
                              <Plus className="w-4 h-4" strokeWidth={2.5} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Aviso Importante no final do cardápio */}
          <div className="mb-4 mt-8 p-6 bg-white/50 backdrop-blur-md border border-white/60 rounded-[32px] flex flex-col items-center justify-center text-center shadow-[0_8px_32px_rgba(30,58,138,0.04)]">
            <Utensils className="w-6 h-6 text-blue-500 mb-2" strokeWidth={1.5} />
            <span className="font-bold text-slate-400 tracking-widest uppercase text-[10px]">Aviso</span>
            <span className="font-serif italic text-blue-900 font-bold text-lg mt-1">"PF e Marmitex Bem Servido!"</span>
          </div>

        </div>

        {/* Rodapé Flutuante Glassmorphism */}
        <div className="absolute bottom-6 left-0 right-0 px-4 z-40 flex flex-col pointer-events-none">
          
          {/* Barra de Totais Visível */}
          {totalItems > 0 && (
            <div 
              onClick={() => setIsCartOpen(true)}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white border border-white/20 rounded-[28px] p-4 mb-4 shadow-[0_12px_32px_rgba(37,99,235,0.3)] backdrop-blur-md flex justify-between items-center cursor-pointer pointer-events-auto active:scale-95 transition-all duration-300"
            >
              <div>
                <p className="text-[10px] font-bold tracking-widest uppercase text-blue-100 mb-0.5 drop-shadow-sm">Total (Mesa {table || '?'})</p>
                <p className="text-xl font-black leading-none drop-shadow-md">{formatPrice(totalAmount)}</p>
              </div>
              <div className="flex items-center space-x-2 bg-white/20 backdrop-blur-lg border border-white/10 px-4 py-2 rounded-full shadow-inner">
                <span className="text-xs font-bold text-white tracking-wide">
                  Ver Comanda
                </span>
                <ChevronRight className="w-4 h-4 text-white" strokeWidth={2.5} />
              </div>
            </div>
          )}

          {/* Menu de Navegação Inferior */}
          <nav className="bg-white/70 backdrop-blur-xl border border-white/60 text-slate-500 rounded-[32px] p-2 flex justify-between items-center shadow-[0_16px_40px_rgba(30,58,138,0.1)] pointer-events-auto">
            <a 
              href="https://maps.app.goo.gl/VXJdMDwifi6PBTyT6" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="flex flex-col items-center justify-center w-1/3 py-2 hover:text-blue-600 transition-colors"
            >
              <MapPin className="w-6 h-6 mb-1" strokeWidth={1.5} />
              <span className="text-[9px] font-bold uppercase tracking-wider">Local</span>
            </a>

            <button 
              onClick={() => setIsCartOpen(true)} 
              className={`flex flex-col items-center justify-center w-1/3 py-2 relative transition-colors ${totalItems > 0 ? 'text-blue-600' : 'hover:text-blue-600'}`}
            >
              <Receipt className={`w-6 h-6 mb-1 ${totalItems > 0 ? 'text-blue-600' : ''}`} strokeWidth={1.5} />
              <span className="text-[9px] font-bold uppercase tracking-wider">Comanda</span>
              {totalItems > 0 && (
                <span className="absolute top-1 right-[25%] bg-indigo-500 text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center animate-pulse shadow-md border border-white/50">
                  {totalItems}
                </span>
              )}
            </button>

            <a 
              href="https://wa.me/5565992576461" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="flex flex-col items-center justify-center w-1/3 py-2 hover:text-green-500 transition-colors"
            >
              <MessageCircle className="w-6 h-6 mb-1" strokeWidth={1.5} />
              <span className="text-[9px] font-bold uppercase tracking-wider">WhatsApp</span>
            </a>
          </nav>
        </div>

        {/* Modal da Comanda / Carrinho */}
        {isCartOpen && (
          <div className="absolute inset-0 z-50 flex flex-col bg-slate-50/90 backdrop-blur-3xl animate-in slide-in-from-bottom-full duration-300">
            <header className="pt-8 pb-4 px-6 shrink-0 relative flex justify-between items-center border-b border-white/50 bg-white/40 shadow-sm">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white rounded-[14px] flex items-center justify-center shadow-[0_4px_12px_rgba(0,0,0,0.05)] border border-white/60">
                  <Receipt className="w-5 h-5 text-blue-600" strokeWidth={2} />
                </div>
                <h2 className="text-xl font-black text-slate-800 tracking-tight">Sua Comanda</h2>
              </div>
              <button 
                onClick={() => setIsCartOpen(false)}
                className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm text-slate-400 hover:text-slate-800 border border-white/60 transition-colors"
              >
                <X className="w-5 h-5" strokeWidth={2.5} />
              </button>
            </header>

            <div className="flex-1 overflow-y-auto px-6 pb-32 hide-scrollbar relative">
              <div className="bg-white/70 backdrop-blur-xl border border-white/60 rounded-[32px] p-6 shadow-[0_16px_40px_rgba(30,58,138,0.05)] relative overflow-hidden mt-6">
                
                <div className="text-center mb-8">
                  <h3 className="font-serif italic text-3xl font-black text-blue-950 tracking-tight">do Jânio</h3>
                  <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mt-1">Conferência de Pedido</p>
                  <div className="mt-4 inline-block bg-blue-50/80 backdrop-blur-sm border border-blue-100 text-blue-700 font-black px-4 py-1.5 rounded-full text-sm shadow-sm">
                    Mesa {table}
                  </div>
                </div>

                {cartItems.length === 0 ? (
                  <div className="text-center py-10">
                    <div className="w-16 h-16 bg-white/50 border border-white/60 shadow-inner rounded-[20px] flex items-center justify-center mx-auto mb-4">
                      <ShoppingCart className="w-8 h-8 text-slate-300" strokeWidth={1.5} />
                    </div>
                    <p className="text-slate-400 font-medium">Sua comanda está vazia.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {cartItems.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center text-sm group p-2 rounded-xl hover:bg-white/40 transition-colors">
                        <div className="flex-1 flex items-center">
                          <span className="font-black text-blue-800 bg-blue-100/50 border border-blue-200/50 px-2 py-1 rounded-lg text-xs mr-3 inline-block min-w-[28px] text-center">{item.quantity}x</span>
                          <span className="text-slate-700 font-bold leading-tight">{item.name}</span>
                        </div>
                        <span className="font-black text-slate-800">
                          {formatPrice(item.price * item.quantity)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="mt-8 pt-6 border-t border-dashed border-slate-300 flex justify-between items-end">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">A Pagar</span>
                  <span className="text-3xl font-black text-blue-600 leading-none">{formatPrice(totalAmount)}</span>
                </div>

                {/* Secção PIX com Gerador Real */}
                {totalAmount > 0 && (
                  <div className="mt-8 bg-gradient-to-br from-indigo-900 to-blue-900 p-5 rounded-[24px] flex flex-col items-center relative overflow-hidden shadow-[0_12px_32px_rgba(30,58,138,0.2)] border border-blue-800/50">
                    <div className="absolute -right-4 -top-4 opacity-10 text-white">
                      <QrCode className="w-32 h-32" />
                    </div>
                    
                    <span className="text-[10px] font-bold text-blue-200 uppercase tracking-widest mb-4 flex items-center">
                      Pagar com PIX
                    </span>
                    
                    <div className="text-center mb-4 z-10">
                      <p className="text-xs text-blue-100/80 font-medium">O código já inclui o valor exato de <b className="text-white">{formatPrice(totalAmount)}</b>.</p>
                    </div>

                    <button 
                      onClick={handleCopyPix}
                      className={`w-full py-4 rounded-[16px] font-black text-sm flex items-center justify-center space-x-2 transition-all duration-300 z-10 ${
                        isCopied 
                        ? 'bg-[#25D366] text-white shadow-[0_8px_20px_rgba(37,211,102,0.3)] border border-[#25D366]' 
                        : 'bg-white/10 backdrop-blur-md text-white hover:bg-white/20 active:scale-[0.98] border border-white/20 shadow-inner'
                      }`}
                    >
                      {isCopied ? <Check className="w-4 h-4" strokeWidth={3} /> : <Copy className="w-4 h-4" strokeWidth={2.5} />}
                      <span>{isCopied ? 'PIX Copiado!' : 'Copiar PIX Copia e Cola'}</span>
                    </button>
                    
                    <div className="mt-4 text-[10px] text-center text-blue-300/50 font-mono tracking-widest z-10">
                      CNPJ: 09.561.018/0001-37
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Botão Flutuante de Fechamento via WhatsApp */}
            <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-slate-50 via-slate-50/90 to-transparent pt-12">
              <button 
                onClick={handleWhatsAppOrder}
                disabled={cartItems.length === 0}
                className="w-full bg-[#25D366] text-white font-black text-[15px] py-4 rounded-[24px] flex items-center justify-center space-x-3 transition-transform shadow-[0_12px_32px_rgba(37,211,102,0.25)] active:scale-[0.98] disabled:opacity-50 disabled:shadow-none disabled:active:scale-100 disabled:cursor-not-allowed border border-[#25D366]/50"
              >
                <MessageCircle className="w-6 h-6" strokeWidth={2.5} />
                <span>Enviar pelo WhatsApp</span>
              </button>
            </div>
          </div>
        )}

      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}} />
    </div>
  );
}
