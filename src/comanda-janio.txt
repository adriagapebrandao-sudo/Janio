
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
    <div className="min-h-screen bg-gray-100 flex justify-center font-sans">
      {/* Mobile App Container */}
      <div className="w-full max-w-md bg-white shadow-xl relative flex flex-col h-screen overflow-hidden">
        
        {/* Header */}
        <header className="bg-[#1e3a8a] text-white p-4 shadow-md z-30 shrink-0 relative">
          <div className="flex justify-between items-center mb-2">
            <div>
              <p className="text-xs uppercase tracking-widest text-blue-200">Restaurante</p>
              <h1 className="text-3xl font-serif italic font-bold">do Jânio</h1>
            </div>
            <div className="bg-white text-[#1e3a8a] rounded-lg p-2 flex flex-col items-center w-20 border-2 border-blue-300">
              <span className="text-[10px] font-bold uppercase">Mesa Nº</span>
              <input 
                type="text" 
                value={table}
                onChange={(e) => setTable(e.target.value)}
                className="w-full text-center text-xl font-bold bg-transparent outline-none border-b border-gray-300"
                maxLength="3"
              />
            </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto pb-44"> {/* Espaço para o menu PWA e carrinho */}
          {MENU.map((category, idx) => (
            <div key={idx} className="mb-6">
              {/* Category Header */}
              <div className="bg-[#2e52a8] text-white py-2 px-4 flex items-center justify-center sticky top-0 z-10 shadow-sm">
                <span className="font-bold tracking-widest text-sm uppercase">{category.category}</span>
              </div>
              
              {/* Items List */}
              <div className="divide-y divide-gray-100">
                {category.items.map((item) => {
                  const quantity = order[item.id] || 0;
                  const isSelected = quantity > 0;
                  
                  return (
                    <div 
                      key={item.id} 
                      className={`flex justify-between items-center p-3 transition-colors 
                        ${!item.available ? 'opacity-50 bg-gray-50' : isSelected ? 'bg-blue-50/70' : 'hover:bg-gray-50'}`}
                    >
                      <div className="flex-1 pr-4">
                        <h3 className={`text-sm font-medium ${isSelected ? 'text-[#1e3a8a] font-bold' : 'text-gray-700'} ${!item.available && 'line-through text-gray-400'}`}>
                          {item.name}
                        </h3>
                        {item.available ? (
                          <p className={`text-xs mt-1 ${isSelected ? 'text-blue-600 font-semibold' : 'text-gray-500'}`}>
                            {formatPrice(item.price)}
                          </p>
                        ) : (
                          <p className="text-xs font-bold text-red-500 mt-1 uppercase tracking-wide">Esgotado</p>
                        )}
                      </div>
                      
                      {/* Controls */}
                      <div className={`flex items-center space-x-3 bg-white border rounded-full p-1 shadow-sm ${!item.available ? 'border-gray-100 bg-gray-100' : 'border-gray-200'}`}>
                        <button 
                          onClick={() => updateQuantity(item.id, -1)}
                          className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors 
                            ${!item.available ? 'text-gray-300 cursor-not-allowed' : quantity > 0 ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-gray-50 text-gray-300 cursor-not-allowed'}`}
                          disabled={quantity === 0 || !item.available}
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        
                        <span className={`w-6 text-center font-bold ${!item.available ? 'text-gray-400' : 'text-gray-800'}`}>
                          {quantity}
                        </span>
                        
                        <button 
                          onClick={() => updateQuantity(item.id, 1)}
                          className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors
                            ${!item.available ? 'text-gray-300 cursor-not-allowed' : 'bg-[#1e3a8a] text-white hover:bg-blue-700'}`}
                          disabled={!item.available}
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Aviso Importante no final do cardápio */}
          <div className="mx-4 mb-8 mt-4 p-4 bg-amber-50 border border-amber-200 rounded-xl flex flex-col items-center justify-center text-center shadow-sm">
            <Utensils className="w-6 h-6 text-amber-600 mb-2" />
            <span className="font-bold text-amber-800 tracking-widest uppercase text-xs">Aviso</span>
            <span className="font-serif italic text-amber-900 font-bold text-lg mt-1">"PF e Marmitex Bem Servido!"</span>
          </div>

        </div>

        {/* Rodapé Fixo PWA (Glassmorphism) */}
        <div className="absolute bottom-0 w-full z-20 bg-white/85 backdrop-blur-md border-t border-gray-200/50 shadow-[0_-10px_25px_-5px_rgba(0,0,0,0.15)] flex flex-col transition-all duration-300">
          
          {/* Barra de Totais Visível */}
          {totalItems > 0 && (
            <div 
              onClick={() => setIsCartOpen(true)}
              className="flex justify-between items-center px-5 py-3 border-b border-gray-200/50 cursor-pointer hover:bg-white/50 active:bg-gray-100 transition-colors"
            >
              <div>
                <p className="text-[10px] font-extrabold text-gray-500 tracking-widest uppercase mb-0.5">Total (Mesa {table || '?'})</p>
                <p className="text-xl font-black text-[#1e3a8a] drop-shadow-sm leading-none">{formatPrice(totalAmount)}</p>
              </div>
              <div className="flex items-center space-x-2 bg-[#1e3a8a] px-3 py-1.5 rounded-full shadow-sm active:scale-95 transition-transform">
                <span className="text-sm font-bold text-white">
                  Ver Comanda
                </span>
                <ChevronRight className="w-4 h-4 text-white" />
              </div>
            </div>
          )}

          {/* Menu de Navegação Inferior */}
          <nav className="flex justify-around items-center px-2 py-3 pb-safe bg-white/95">
            <a 
              href="https://maps.app.goo.gl/VXJdMDwifi6PBTyT6" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="flex flex-col items-center w-1/3 text-gray-500 hover:text-blue-600 active:scale-95 transition-all"
            >
              <MapPin className="w-6 h-6 mb-1" />
              <span className="text-[10px] font-bold uppercase tracking-wider">Local</span>
            </a>

            <button 
              onClick={() => setIsCartOpen(true)} 
              className={`flex flex-col items-center w-1/3 transition-all active:scale-95 relative ${totalItems > 0 ? 'text-[#1e3a8a]' : 'text-gray-500 hover:text-[#1e3a8a]'}`}
            >
              <Receipt className="w-6 h-6 mb-1" />
              <span className="text-[10px] font-bold uppercase tracking-wider">Comanda</span>
              {totalItems > 0 && (
                <span className="absolute -top-1 right-[22%] bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-md animate-pulse">
                  {totalItems}
                </span>
              )}
            </button>

            <a 
              href="https://wa.me/5565992576461" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="flex flex-col items-center w-1/3 text-gray-500 hover:text-green-600 active:scale-95 transition-all"
            >
              <MessageCircle className="w-6 h-6 mb-1" />
              <span className="text-[10px] font-bold uppercase tracking-wider">WhatsApp</span>
            </a>
          </nav>
        </div>

        {/* Modal da Comanda / Carrinho */}
        {isCartOpen && (
          <div className="absolute inset-0 z-50 flex flex-col bg-gray-100 animate-in slide-in-from-bottom-full duration-300">
            <header className="bg-[#1e3a8a] text-white p-4 shadow-md flex justify-between items-center shrink-0">
              <div className="flex items-center space-x-2">
                <Receipt className="w-6 h-6" />
                <h2 className="text-xl font-bold uppercase tracking-wide">Comanda MESA {table}</h2>
              </div>
              <button 
                onClick={() => setIsCartOpen(false)}
                className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </header>

            <div className="flex-1 overflow-y-auto p-4 pb-10">
              <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-200 relative overflow-hidden">
                <div className="text-center mb-6 border-b border-dashed border-gray-300 pb-4">
                  <h3 className="font-serif italic text-2xl font-bold text-gray-800">Restaurante do Jânio</h3>
                  <p className="text-gray-500 mt-1">Conferência de Pedido</p>
                </div>

                {cartItems.length === 0 ? (
                  <div className="text-center py-6 text-gray-400">
                    <ShoppingCart className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>Sua comanda está vazia.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {cartItems.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-start text-sm">
                        <div className="flex-1">
                          <span className="font-bold text-gray-800 bg-gray-100 px-1.5 py-0.5 rounded">{item.quantity}x</span>
                          <span className="text-gray-600 ml-2 font-medium">{item.name}</span>
                        </div>
                        <span className="font-medium text-gray-800">
                          {formatPrice(item.price * item.quantity)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="mt-6 pt-4 border-t border-dashed border-gray-300 flex justify-between items-center bg-gray-50 -mx-5 px-5 pb-2">
                  <span className="text-lg font-bold text-gray-600">A PAGAR</span>
                  <span className="text-3xl font-black text-[#1e3a8a]">{formatPrice(totalAmount)}</span>
                </div>

                {/* Secção PIX com Gerador Real */}
                {totalAmount > 0 && (
                  <div className="mt-4 bg-green-50 p-4 rounded-xl border border-green-200 flex flex-col items-center relative overflow-hidden">
                    <div className="absolute -right-4 -top-4 opacity-10 text-green-600">
                      <QrCode className="w-24 h-24" />
                    </div>
                    
                    <span className="text-xs font-bold text-green-800 uppercase tracking-wider mb-3 flex items-center">
                      <QrCode className="w-4 h-4 mr-1" />
                      Pagar com PIX
                    </span>
                    
                    <div className="text-center mb-3">
                      <p className="text-xs text-green-700">O código gerado já inclui o valor exato de <b>{formatPrice(totalAmount)}</b> para o Restaurante.</p>
                    </div>

                    <button 
                      onClick={handleCopyPix}
                      className={`w-full py-3 rounded-lg font-bold flex items-center justify-center space-x-2 transition-all duration-300 ${
                        isCopied 
                        ? 'bg-green-600 text-white shadow-md' 
                        : 'bg-white text-green-700 border-2 border-green-600 hover:bg-green-100'
                      }`}
                    >
                      {isCopied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                      <span>{isCopied ? 'Código PIX Copiado!' : 'Copiar PIX Copia e Cola'}</span>
                    </button>
                    
                    <div className="mt-3 text-xs text-center text-gray-500 font-mono">
                      CNPJ: 09.561.018/0001-37
                    </div>
                  </div>
                )}

                {/* Informação de Contato */}
                <div className="mt-4 bg-gray-50 p-4 rounded-xl border border-gray-200 text-center">
                  <p className="text-xs text-gray-500 font-medium mb-3">Atendimento ao Cliente</p>
                  <div className="flex flex-col space-y-3">
                     <a href="https://wa.me/5565992576461" target="_blank" rel="noopener noreferrer" className="flex justify-center items-center text-sm font-bold text-green-600 hover:text-green-700 bg-green-50 py-2 rounded-lg border border-green-100">
                       <MessageCircle className="w-4 h-4 mr-2" />
                       (65) 99257-6461
                     </a>
                     <a href="https://maps.app.goo.gl/VXJdMDwifi6PBTyT6" target="_blank" rel="noopener noreferrer" className="flex justify-center items-center text-sm font-bold text-blue-600 hover:text-blue-700 bg-blue-50 py-2 rounded-lg border border-blue-100">
                       <MapPin className="w-4 h-4 mr-2" />
                       R. São João, 26 - Lixeira, Cuiabá
                     </a>
                  </div>
                </div>

              </div>
            </div>
            
            {/* Botão Flutuante de Fechamento via WhatsApp */}
            <div className="p-4 bg-white border-t border-gray-200 shrink-0 shadow-[0_-10px_15px_-3px_rgba(0,0,0,0.1)]">
              <button 
                onClick={handleWhatsAppOrder}
                disabled={cartItems.length === 0}
                className="w-full bg-green-600 text-white font-bold py-4 rounded-xl flex items-center justify-center space-x-2 hover:bg-green-700 transition-colors shadow-lg text-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <MessageCircle className="w-5 h-5" />
                <span>Enviar Pedido pelo WhatsApp</span>
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}




