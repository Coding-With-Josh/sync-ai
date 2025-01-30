"use client"

import { useState } from "react";

import { SendIcon, Loader2, BotIcon, UserIcon } from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";

import Navbar from "@/components/Navbar";
import Spotlight from "@/components/Spotlight";

interface Message {
    role: 'user' | 'assistant';
    content: string;
}

export default function ChatPage() {
    const [messages, setMessages] = useState<Message[]>([
        {
            role: 'assistant',
            content: 'Hi! I can help you create your token. What kind of token would you like to create?'
        }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { scrollYProgress } = useScroll();
    const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

    return (
        <div className="min-h-screen bg-black text-white cursor-default">
            <Navbar />
            <Spotlight />
            
            <div className="max-w-4xl mx-auto pt-32 px-4 pb-20 cursor-default">
                {/* Header */}
                <motion.div 
                    style={{ opacity }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-12"
                >
                    <h1 className="text-7xl md:text-8xl font-bold mb-4 tracking-tighter">AI TOKEN</h1>
                    <p className="text-2xl text-gray-400">Chat with our AI to create your custom token</p>
                </motion.div>

                {/* Chat Container */}
                <div className="bg-gradient-to-br from-white/5 to-white/10 rounded-3xl p-6 backdrop-blur-xl min-h-[60vh] flex flex-col">
                    {/* Messages */}
                    <div className="flex-1 space-y-4 mb-4 overflow-auto">
                        {messages.map((message, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, x: message.role === 'user' ? 20 : -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className={`flex items-start gap-3 ${
                                    message.role === 'user' ? 'flex-row-reverse' : ''
                                }`}
                            >
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                    message.role === 'user' ? 'bg-blue-500' : 'bg-purple-500'
                                }`}>
                                    {message.role === 'user' ? <UserIcon size={14} /> : <BotIcon size={14} />}
                                </div>
                                <motion.div 
                                    className={`p-4 rounded-xl max-w-[80%] ${
                                        message.role === 'user' 
                                            ? 'bg-blue-500/20 rounded-tr-none' 
                                            : 'bg-white/10 rounded-tl-none'
                                    }`}
                                    initial={{ scale: 0.95 }}
                                    animate={{ scale: 1 }}
                                >
                                    {message.content}
                                </motion.div>
                            </motion.div>
                        ))}
                        
                        {isLoading && (
                            <motion.div 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="flex items-center gap-2 text-gray-400"
                            >
                                <Loader2 className="w-4 h-4 animate-spin" />
                                AI is thinking...
                            </motion.div>
                        )}
                    </div>

                    {/* Input Area */}
                    <div className="border-t border-white/10 pt-4">
                        <form className="flex gap-4" onSubmit={(e) => e.preventDefault()}>
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Tell me about your token idea..."
                                className="flex-1 bg-white/5 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="bg-blue-500 rounded-xl px-6 py-3 flex items-center gap-2"
                            >
                                Send
                                <SendIcon size={16} />
                            </motion.button>
                        </form>
                    </div>
                </div>

                {/* Suggestions */}
                <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 gap-8">
                    <motion.button
                        whileHover={{ scale: 0.98 }}
                        className="p-8 bg-gradient-to-br from-white/5 to-white/10 rounded-3xl text-left hover:bg-white/10 backdrop-blur-xl"
                    >
                        <h3 className="text-2xl font-bold mb-2">Governance Token</h3>
                        <p className="text-gray-400">For DAOs and community projects</p>
                    </motion.button>
                    <motion.button
                        whileHover={{ scale: 0.98 }}
                        className="p-8 bg-gradient-to-br from-white/5 to-white/10 rounded-3xl text-left hover:bg-white/10 backdrop-blur-xl"
                    >
                        <h3 className="text-2xl font-bold mb-2">GameFi Token</h3>
                        <p className="text-gray-400">For gaming and NFT projects</p>
                    </motion.button>
                </div>
            </div>
        </div>
    );
}