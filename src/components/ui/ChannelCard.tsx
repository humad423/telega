import React from 'react';
import { Users, Bot, MessageCircle } from 'lucide-react';
import Link from 'next/link';

interface ChannelProps {
  id: string;
  title: string;
  desc: string;
  type: string;
  members?: string;
}

export function ChannelCard({ data, isFeatured = false }: { data: ChannelProps, isFeatured?: boolean }) {
  // Map Type to Icon
  const Icon = data.type === 'bot' ? Bot : data.type === 'group' ? Users : MessageCircle;
  
  // As per "The Digital Conduit" design instructions:
  // - No 1px borders. Use background shift (surface-container-high)
  // - If featured, add a "neon pulse" or gradient glow hover using pseudo elements 
  // - Padding spacing-6
  
  return (
    <div className={`relative flex flex-col p-6 rounded-md bg-surface-container-high transition-transform duration-300 hover:-translate-y-1 ${isFeatured ? 'featured-card-hover' : ''}`}>
      <div className="flex justify-between items-start mb-4">
        <div className="flex gap-4 items-center">
          {/* Mock Avatar with Gradient to create "soul" */}
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary-container flex items-center justify-center text-primary-foreground shadow-lg">
            <Icon size={20} />
          </div>
          <div>
            <h3 className="text-xl font-bold leading-tight">{data.title}</h3>
            {/* Pill shaped tag based on Type */}
            <span className="inline-block mt-1 px-3 py-1 text-xs font-semibold uppercase tracking-wider rounded-full bg-surface-container-highest text-outline-variant">
              {data.type}
            </span>
          </div>
        </div>
      </div>
      
      <p className="text-outline-variant text-sm flex-grow mb-4 leading-relaxed">
        {data.desc}
      </p>
      
      <div className="flex items-center justify-between text-xs font-medium text-outline pt-3 border-t border-surface-container-highest/50">
        <span className="flex items-center gap-1.5"><Users size={14}/> {data.members || 'N/A'}</span>
        
        {/* Simple Link using primary gradient approach */}
        <Link 
          href={`/channel/${data.id}`} 
          className="text-primary hover:text-primary-container transition-colors font-bold tracking-wide"
        >
          VIEW &rarr;
        </Link>
      </div>
    </div>
  );
}
