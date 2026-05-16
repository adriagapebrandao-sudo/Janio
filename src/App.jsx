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
    <div className="min-h-screen bg-[#F5F3F0] flex justify-center font-sans text-zinc-800">
      {/* Mobile App Container */}
      <div className="w-full max-w-md relative flex flex-col h-screen overflow-hidden">
        
        {/* Header Vibe Design */}
        <header className="pt-8 pb-4 px-6 shrink-0 relative z-30">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1">Restaurante</p>
              <h1 className="text-3xl font-serif italic font-black text-zinc-900 tracking-tight leading-none">do Jânio</h1>
            </div>
            <div className="bg-white rounded-2xl p-2 px-3 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col items-center min-w-[72px]">
              <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-400">Mesa</span>
              <input 
                type="text" 
                value={table}
                onChange={(e) => setTable(e.target.value)}
                className="w-full text-center text-xl font-black text-orange-500 bg-transparent outline-none mt-0.5"
                maxLength="3"
              />
            </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-6 pb-40 hide-scrollbar">
          {MENU.map((category, idx) => (
            <div key={idx} className="mb-10">
              {/* Category Header */}
              <div className="mb-4 flex items-center">
                <span className="font-bold tracking-widest text-[11px] uppercase text-zinc-400">{category.category}</span>
              </div>
              
              {/* Items List - Vibe Design Cards */}
              <div className="flex flex-col gap-4">
                {category.items.map((item) => {
                  const quantity = order[item.id] || 0;
                  const isSelected = quantity > 0;
                  
                  return (
                    <div 
                      key={item.id} 
                      className={`bg-white rounded-[28px] p-5 shadow-[0_8px_20px_rgb(0,0,0,0.03)] transition-all duration-300
                        ${!item.available ? 'opacity-60 grayscale-[0.2]' : isSelected ? 'ring-2 ring-orange-500/20' : 'hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)]'}`}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1 pr-4">
                          <h3 className={`text-[15px] leading-tight font-black ${isSelected ? 'text-zinc-900' : 'text-zinc-800'}`}>
                            {item.name}
                          </h3>
                          {item.available ? (
                            <p className="text-[13px] mt-1.5 font-bold text-orange-500">
                              {formatPrice(item.price)}
                            </p>
                          ) : (
                            <div className="mt-2 inline-block bg-zinc-100 text-zinc-500 text-[10px] uppercase font-bold tracking-wider py-1 px-2 rounded-full">
                              Indisponível
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Controls - Vibe Pill */}
                      <div className="flex justify-end">
                        <div className={`flex items-center space-x-1 p-1 rounded-full ${!item.available ? 'bg-zinc-100/50' : 'bg-zinc-100'}`}>
                          <button 
                            onClick={() => updateQuantity(item.id, -1)}
                            className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 
                              ${!item.available ? 'text-zinc-300 cursor-not-allowed' : quantity > 0 ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-400 cursor-not-allowed'}`}
                            disabled={quantity === 0 || !item.available}
                          >
                            <Minus className="w-4 h-4" strokeWidth={3} />
                          </button>
                          
                          <span className={`w-6 text-center text-sm font-black ${!item.available ? 'text-zinc-300' : 'text-zinc-900'}`}>
                            {quantity}
                          </span>
                          
                          <button 
                            onClick={() => updateQuantity(item.id, 1)}
                            className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200
                              ${!item.available ? 'text-zinc-300 cursor-not-allowed' : 'bg-zinc-900 text-white shadow-sm hover:scale-105 active:scale-95'}`}
                            disabled={!item.available}
                          >
                            <Plus className="w-4 h-4" strokeWidth={3} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Aviso Importante no final do cardápio */}
          <div className="mb-12 p-6 bg-white rounded-[32px] flex flex-col items-center justify-center text-center shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            <Utensils className="w-6 h-6 text-orange-400 mb-3" strokeWidth={1.5} />
            <span className="font-bold text-zinc-400 tracking-widest uppercase text-[10px]">Aviso</span>
            <span className="font-serif italic text-zinc-800 font-bold text-lg mt-1">"PF e Marmitex Bem Servido!"</span>
          </div>

        </div>

        {/* Rodapé Flutuante Vibe Design */}
        <div className="absolute bottom-6 left-0 right-0 px-6 z-20 flex flex-col pointer-events-none">
          
          {/* Barra de Totais Visível */}
          {totalItems > 0 && (
            <div 
              onClick={() => setIsCartOpen(true)}
              className="bg-orange-500 text-white rounded-3xl p-4 mb-4 shadow-[0_8px_30px_rgba(232,123,81,0.3)] flex justify-between items-center cursor-pointer pointer-events-auto active:scale-95 transition-transform duration-300"
            >
              <div>
                <p className="text-[10px] font-bold tracking-widest uppercase text-white/80 mb-0.5">Total (Mesa {table || '?'})</p>
                <p className="text-xl font-black leading-none">{formatPrice(totalAmount)}</p>
              </div>
              <div className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                <span className="text-xs font-bold text-white tracking-wide">
                  Ver Comanda
                </span>
                <ChevronRight className="w-4 h-4 text-white" strokeWidth={3} />
              </div>
            </div>
          )}

          {/* Menu de Navegação Inferior */}
          <nav className="bg-zinc-900 text-zinc-400 rounded-[32px] p-2 flex justify-between items-center shadow-2xl pointer-events-auto backdrop-blur-md">
            <a 
              href="https://maps.app.goo.gl/VXJdMDwifi6PBTyT6" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="flex flex-col items-center justify-center w-1/3 py-3 hover:text-white transition-colors"
            >
              <MapPin className="w-6 h-6 mb-1" strokeWidth={1.5} />
              <span className="text-[9px] font-bold uppercase tracking-wider">Local</span>
            </a>

            <button 
              onClick={() => setIsCartOpen(true)} 
              className={`flex flex-col items-center justify-center w-1/3 py-3 relative transition-colors ${totalItems > 0 ? 'text-white' : 'hover:text-white'}`}
            >
              <Receipt className={`w-6 h-6 mb-1 ${totalItems > 0 ? 'text-orange-500' : ''}`} strokeWidth={1.5} />
              <span className="text-[9px] font-bold uppercase tracking-wider">Comanda</span>
              {totalItems > 0 && (
                <span className="absolute top-2 right-[25%] bg-orange-500 text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
                  {totalItems}
                </span>
              )}
            </button>

            <a 
              href="https://wa.me/5565992576461" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="flex flex-col items-center justify-center w-1/3 py-3 hover:text-white transition-colors"
            >
              <MessageCircle className="w-6 h-6 mb-1" strokeWidth={1.5} />
              <span className="text-[9px] font-bold uppercase tracking-wider">WhatsApp</span>
            </a>
          </nav>
        </div>

        {/* Modal da Comanda / Carrinho */}
        {isCartOpen && (
          <div className="absolute inset-0 z-50 flex flex-col bg-[#F5F3F0] animate-in slide-in-from-bottom-full duration-300">
            <header className="pt-8 pb-4 px-6 shrink-0 relative flex justify-between items-center bg-[#F5F3F0]">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
                  <Receipt className="w-5 h-5 text-zinc-900" strokeWidth={2} />
                </div>
                <h2 className="text-xl font-black text-zinc-900 tracking-tight">Comanda</h2>
              </div>
              <button 
                onClick={() => setIsCartOpen(false)}
                className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm text-zinc-400 hover:text-zinc-900 transition-colors"
              >
                <X className="w-5 h-5" strokeWidth={2.5} />
              </button>
            </header>

            <div className="flex-1 overflow-y-auto px-6 pb-32 hide-scrollbar">
              <div className="bg-white rounded-[32px] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.03)] relative overflow-hidden mt-2">
                <div className="text-center mb-8">
                  <h3 className="font-serif italic text-3xl font-black text-zinc-900 tracking-tight">do Jânio</h3>
                  <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-1">Conferência de Pedido</p>
                  <div className="mt-4 inline-block bg-orange-50 text-orange-600 font-black px-4 py-1.5 rounded-full text-sm">
                    Mesa {table}
                  </div>
                </div>

                {cartItems.length === 0 ? (
                  <div className="text-center py-10">
                    <div className="w-16 h-16 bg-zinc-50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <ShoppingCart className="w-8 h-8 text-zinc-300" strokeWidth={1.5} />
                    </div>
                    <p className="text-zinc-400 font-medium">Sua comanda está vazia.</p>
                  </div>
                ) : (
                  <div className="space-y-5">
                    {cartItems.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-start text-sm group">
                        <div className="flex-1">
                          <span className="font-black text-zinc-900 bg-zinc-100 px-2 py-0.5 rounded-lg text-xs mr-3 inline-block min-w-[28px] text-center">{item.quantity}x</span>
                          <span className="text-zinc-700 font-bold leading-tight">{item.name}</span>
                        </div>
                        <span className="font-black text-zinc-900 mt-0.5">
                          {formatPrice(item.price * item.quantity)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="mt-8 pt-6 border-t border-dashed border-zinc-200 flex justify-between items-end">
                  <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1">A Pagar</span>
                  <span className="text-3xl font-black text-orange-500 leading-none">{formatPrice(totalAmount)}</span>
                </div>

                {/* Secção PIX com Gerador Real */}
                {totalAmount > 0 && (
                  <div className="mt-8 bg-zinc-900 p-5 rounded-[24px] flex flex-col items-center relative overflow-hidden">
                    <div className="absolute -right-4 -top-4 opacity-10 text-white">
                      <QrCode className="w-32 h-32" />
                    </div>
                    
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-4 flex items-center">
                      Pagar com PIX
                    </span>
                    
                    <div className="text-center mb-4 z-10">
                      <p className="text-xs text-zinc-300 font-medium">O código já inclui o valor exato de <b className="text-white">{formatPrice(totalAmount)}</b>.</p>
                    </div>

                    <button 
                      onClick={handleCopyPix}
                      className={`w-full py-4 rounded-[16px] font-black text-sm flex items-center justify-center space-x-2 transition-all duration-300 z-10 ${
                        isCopied 
                        ? 'bg-green-500 text-white shadow-[0_8px_20px_rgba(34,197,94,0.3)]' 
                        : 'bg-white text-zinc-900 hover:scale-[1.02] active:scale-[0.98]'
                      }`}
                    >
                      {isCopied ? <Check className="w-4 h-4" strokeWidth={3} /> : <Copy className="w-4 h-4" strokeWidth={2.5} />}
                      <span>{isCopied ? 'PIX Copiado!' : 'Copiar PIX Copia e Cola'}</span>
                    </button>
                    
                    <div className="mt-4 text-[10px] text-center text-zinc-500 font-mono tracking-widest z-10">
                      CNPJ: 09.561.018/0001-37
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Botão Flutuante de Fechamento via WhatsApp */}
            <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-[#F5F3F0] via-[#F5F3F0] to-transparent pt-12">
              <button 
                onClick={handleWhatsAppOrder}
                disabled={cartItems.length === 0}
                className="w-full bg-[#25D366] text-white font-black text-[15px] py-4 rounded-[24px] flex items-center justify-center space-x-3 transition-transform shadow-[0_8px_30px_rgba(37,211,102,0.3)] active:scale-[0.98] disabled:opacity-50 disabled:shadow-none disabled:active:scale-100 disabled:cursor-not-allowed"
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
