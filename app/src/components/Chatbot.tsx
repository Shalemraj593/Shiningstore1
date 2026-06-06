import React, { useState, useRef, useEffect } from 'react';
import { Headset, Send, X, MessageSquare } from 'lucide-react';
import { products } from '@/data/products';
import type { Product } from '@/data/products';

interface Message {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  products?: Product[];
  typing?: boolean;
}

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'bot',
      text: 'Hi there! 👋 Welcome to Shining Store. How can I help you today? You can ask me about products, shipping, orders, or return policies!',
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping]);

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > 100);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const findProducts = (query: string): Product[] => {
    if (!products || products.length === 0) return [];
    const q = query.toLowerCase();

    const ignoreWords = [
      'show', 'me', 'i', 'want', 'need', 'looking', 'for', 'do', 'you',
      'have', 'any', 'some', 'the', 'a', 'an', 'is', 'are', 'there',
      'what', 'can', 'get', 'buy', 'purchase', 'find'
    ];
    const terms = q.split(/[\s,?!]+/).filter(w => w.trim() !== '' && !ignoreWords.includes(w));

    if (terms.length === 0) return [];

    const synonyms: Record<string, string[]> = {
      'top': ['shirt', 'blouse', 't-shirt', 'tank', 'fashion'],
      'tops': ['shirt', 'blouse', 't-shirt', 'tank', 'fashion', 'top'],
      'shoes': ['sneaker', 'boot', 'footwear', 'shoe'],
      'shoe': ['sneaker', 'boot', 'footwear', 'shoes'],
      'clothes': ['fashion', 'dress', 'shirt', 'wear'],
      'clothing': ['fashion', 'dress', 'shirt', 'wear'],
      'pets': ['dog', 'cat', 'feeder', 'toy', 'pet'],
      'pet': ['dog', 'cat', 'feeder', 'toy', 'pets'],
      'electronics': ['charger', 'earbud', 'cable', 'tech'],
      'tech': ['electronics', 'charger', 'earbud', 'cable'],
      'accessories': ['bag', 'case', 'cover', 'watch'],
      'dresses': ['dress', 'fashion', 'gown']
    };

    let expandedTerms = [...terms];
    terms.forEach(t => {
      if (synonyms[t]) expandedTerms.push(...synonyms[t]);
      if (t.endsWith('s') && t.length > 3) expandedTerms.push(t.slice(0, -1));
      if (t.endsWith('es') && t.length > 4) expandedTerms.push(t.slice(0, -2));
    });

    expandedTerms = [...new Set(expandedTerms)];

    return products.filter(p => {
      const searchStr = `${p.name} ${p.category}`.toLowerCase();
      return expandedTerms.some(t => searchStr.includes(t));
    });
  };

  const generateResponse = (text: string): { replyText: string; matchedProducts?: Product[] } => {
    const t = text.toLowerCase();

    // 1. Greetings & Identity
    if (/(who are you|what is this|what do you do|what do you sell)/i.test(t)) {
      return {
        replyText: 'I am the Shining Store AI Assistant! 🤖 I can help you find products (like "show me shoes"), track your orders, or answer questions about our shipping and return policies.'
      };
    }
    if (/(hi|hello|hey|greetings|morning|afternoon|evening)/i.test(t) && t.length < 15) {
      return {
        replyText: "Hello! 👋 I'm your Shining Store shopping assistant. How can I help you today?"
      };
    }

    // 2. Order Tracking
    if (/(track|order status|where is my order|where is my package|package tracking|has my order shipped)/i.test(t)) {
      return {
        replyText: 'You can easily track your order status in two ways:<br>1. Go to our <a href="tracking.html" style="color:var(--color-accent); font-weight:bold; text-decoration:underline;">Tracking Page</a> and enter your Order ID.<br>2. Log in to your account and check the "My Orders" tab.'
      };
    }

    // 3. Shipping, Delivery & Time
    if (/(shipping|delivery|deliver|how long|shipping cost|free shipping|when will i get|arrive)/i.test(t)) {
      return {
        replyText: '📦 <strong>Shipping Info:</strong><br>• We offer <strong>affordable worldwide shipping</strong> on all orders.<br>• Standard delivery takes <strong>3-5 business days</strong>.<br>• Express shipping (1-2 days) is available at checkout for $12.99.'
      };
    }

    // 4. Returns, Refunds & Guarantees
    if (/(return|refund|exchange|money back|send back|guarantee|warranty|broken|wrong size)/i.test(t)) {
      return {
        replyText: '↩️ <strong>Return Policy:</strong><br>We offer a <strong>30-day hassle-free return policy</strong>.<br>If you\'re not 100% satisfied, you can return unworn/unused items with tags attached.<br><br><a href="about.html" style="display:inline-block; background:var(--color-charcoal); color:white; font-size:11px; padding:6px 12px; border-radius:12px; margin-top:4px; text-decoration:none;">View Full Policy</a>'
      };
    }

    // 5. Payments, Security & Promo Codes
    if (/(payment|pay|credit card|paypal|cod|cash on delivery|safe|secure|promo|discount|coupon|code|sale)/i.test(t)) {
      return {
        replyText: '💳 <strong>Payments & Promos:</strong><br>• We accept Visa, MasterCard, Amex, PayPal, and Apple Pay.<br>• All transactions are 100% secure.<br>• <strong>Tip:</strong> Use code <strong>SHINE20</strong> at checkout for 20% off!'
      };
    }

    // 6. Contact Human/Support
    if (/(human|person|agent|support|customer service|call|phone|email|talk to someone|help desk)/i.test(t)) {
      return {
        replyText: '📞 <strong>Contact Us:</strong><br>Our support team is available 24/7.<br>• Email: support@shiningstore.com<br>• Phone: 1-800-SHINING (Mon-Fri, 9AM-6PM)<br>We\'ll be happy to help!'
      };
    }

    // 7. Cart & Wishlist
    if (/(cart|bag|wishlist|favorites|basket|checkout)/i.test(t)) {
      return {
        replyText: '🛒 You can view your shopping bag by clicking the bag icon in the top right corner. You can also view your saved items in your Wishlist.'
      };
    }

    // 8. Product Searching
    const matchedProducts = findProducts(text);
    if (matchedProducts.length > 0) {
      return {
        replyText: `I found some items you might love based on "${text}":`,
        matchedProducts
      };
    }

    // 9. Polite Fallback for empty search
    if (/(do you have|i want|looking for|show me|find)/i.test(t)) {
      return {
        replyText: 'I searched our catalog, but I couldn\'t find an exact match for what you\'re looking for right now. 😔<br><br>Could you try searching for broader terms like <strong>"fashion"</strong>, <strong>"electronics"</strong>, or <strong>"pets"</strong>?'
      };
    }

    // 10. Ultimate Fallback
    return {
      replyText: 'I\'m sorry, I didn\'t quite catch that. Could you try rephrasing? You can ask me about <strong>shipping</strong>, <strong>returns</strong>, <strong>tracking</strong>, or search for specific <strong>products</strong> (e.g., \'Do you have red dresses?\').'
    };
  };

  const handleSend = () => {
    if (!inputText.trim()) return;

    const userText = inputText;
    const userMsg: Message = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: userText,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      const { replyText, matchedProducts } = generateResponse(userText);
      const botMsg: Message = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: replyText,
        products: matchedProducts,
      };
      setMessages((prev) => [...prev, botMsg]);
    }, 800 + Math.random() * 600);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  return (
    <div className={`fixed bottom-20 right-6 z-[1000] md:bottom-6 md:right-6 flex flex-col items-end transition-all duration-300 pointer-events-none ${
      isVisible || isOpen ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'
    }`}>
      {/* Chat Window */}
      <div
        className={`w-[calc(100vw-48px)] sm:w-[320px] h-[60vh] sm:h-[420px] max-h-[calc(100vh-120px)] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-neutral-200 transition-all duration-300 origin-bottom-right mb-4 ${
          isOpen ? 'scale-100 opacity-100 pointer-events-auto' : 'scale-0 opacity-0 pointer-events-none'
        }`}
      >
        {/* Header */}
        <div
          className="p-4 flex justify-between items-center text-white"
          style={{ backgroundColor: 'var(--color-charcoal)' }}
        >
          <div className="flex items-center gap-2">
            <div className="relative">
              <Headset size={20} />
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-neutral-900 rounded-full"></span>
            </div>
            <div>
              <h4 className="text-sm font-semibold leading-none">Shining Support</h4>
              <span className="text-[10px] text-green-300">Online</span>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="text-white/80 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-3 bg-neutral-50/70">
          {messages.map((msg) => (
            <div key={msg.id} className="flex flex-col">
              <div
                className={`max-w-[85%] p-3 rounded-2xl text-xs leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-neutral-800 text-white self-end rounded-br-none'
                    : 'bg-white border border-neutral-200 text-neutral-800 self-start rounded-bl-none'
                }`}
                dangerouslySetInnerHTML={{ __html: msg.text }}
              />
              
              {/* Render matched products */}
              {msg.products && msg.products.length > 0 && (
                <div className="flex flex-col gap-2 mt-2 w-full max-w-[85%]">
                  {msg.products.slice(0, 3).map((p) => (
                    <a
                      key={p.id}
                      href={`product.html?id=${p.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex gap-2.5 bg-white border border-neutral-200 rounded-xl p-2 items-center hover:bg-neutral-50 transition-colors"
                    >
                      <img
                        src={p.image}
                        alt={p.name}
                        className="w-11 h-11 rounded-lg object-cover flex-shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="text-[11px] font-medium text-neutral-800 truncate">
                          {p.name}
                        </p>
                        <p className="text-[10px] font-bold text-neutral-900">
                          ₹{p.price.toLocaleString()}
                        </p>
                      </div>
                    </a>
                  ))}
                  {msg.products.length > 3 && (
                    <a
                      href="category.html"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] text-center font-medium mt-1 hover:underline"
                      style={{ color: 'var(--color-accent)' }}
                    >
                      View all {msg.products.length} results &rarr;
                    </a>
                  )}
                </div>
              )}
            </div>
          ))}
          {isTyping && (
            <div className="bg-white border border-neutral-200 text-neutral-400 self-start rounded-2xl rounded-bl-none p-3 text-xs italic">
              Typing...
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="flex p-3 bg-white border-t border-neutral-100 items-center">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Ask about products, shipping..."
            className="flex-1 border-none outline-none px-2 py-1 text-xs text-neutral-800 bg-transparent"
          />
          <button
            onClick={handleSend}
            className="p-1.5 rounded-full hover:bg-neutral-100 transition-colors"
            style={{ color: 'var(--color-accent)' }}
          >
            <Send size={14} />
          </button>
        </div>
      </div>

      {/* FAB */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-[52px] h-[52px] rounded-full text-white flex items-center justify-center shadow-lg transition-transform duration-300 hover:scale-105 pointer-events-auto"
        style={{ backgroundColor: 'var(--color-charcoal)' }}
        aria-label="Open support chat"
      >
        {isOpen ? <MessageSquare size={22} /> : <Headset size={22} />}
      </button>
    </div>
  );
}
