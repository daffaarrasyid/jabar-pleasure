'use client';

import React from 'react';
import SuggestDestinationCard from './SuggestDestinationCard';

interface SpatialRadarCardProps {
  title?: string;
  radiusLabel?: string;
  latitude?: string;
  longitude?: string;
  className?: string;
  onOpenForm?: () => void;
}

/**
 * Legacy wrapper: replaced by SuggestDestinationCard as per System Analyst recommendation.
 * Retained for backwards compatibility across existing imports.
 */
export default function SpatialRadarCard({
  className = '',
  onOpenForm,
}: SpatialRadarCardProps) {
  return <SuggestDestinationCard onOpenForm={onOpenForm} className={className} />;
}
