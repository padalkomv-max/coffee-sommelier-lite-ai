import React from 'react';
import { Recommendation } from '../types';
import { Coffee, Settings2, CalendarHeart } from 'lucide-react';

interface RecommendationCardProps {
  recommendation: Recommendation | null;
}

export function RecommendationCard({ recommendation }: RecommendationCardProps) {
  if (!recommendation) {
    return (
      <div className="w-full h-full bg-[#FDFBF7] border-l border-[#EFEBE0] p-6 flex flex-col hidden lg:flex">
        <h2 className="text-lg font-semibold text-[#4A3C31] mb-6">Ваша рекомендация</h2>
        <div className="flex-1 flex items-center justify-center text-center">
          <p className="text-[#8B7355] text-sm">
            Здесь появится рекомендация после уточнения Ваших предпочтений.
          </p>
        </div>
      </div>
    );
  }

  const getIcon = () => {
    const type = recommendation.type.toLowerCase();
    if (type.includes('оборудов') || type.includes('помол')) return <Settings2 className="w-6 h-6" />;
    if (type.includes('подписк')) return <CalendarHeart className="w-6 h-6" />;
    return <Coffee className="w-6 h-6" />;
  };

  return (
    <div className="w-full h-full bg-[#FDFBF7] lg:border-l border-[#EFEBE0] p-4 lg:p-6 flex flex-col overflow-y-auto">
      <h2 className="text-lg font-semibold text-[#4A3C31] mb-4 lg:mb-6">Ваша рекомендация</h2>
      
      <div className="bg-white rounded-2xl p-4 lg:p-5 border border-[#EFEBE0] shadow-sm space-y-4 lg:space-y-5">
        <div className="flex items-center space-x-3 text-[#8B7355]">
          <div className="bg-[#F4F0E6] p-2 rounded-lg">
            {getIcon()}
          </div>
          <span className="font-medium text-sm uppercase tracking-wide">{recommendation.type}</span>
        </div>

        <div>
          <h3 className="text-xl font-bold text-[#4A3C31] mb-2">{recommendation.name}</h3>
          <p className="text-sm text-[#5C4D41] leading-relaxed">
            {recommendation.description}
          </p>
        </div>

        {recommendation.flavorNotes && recommendation.flavorNotes.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {recommendation.flavorNotes.map((note, idx) => (
              <span key={idx} className="bg-[#F4F0E6] text-[#5C4D41] text-xs px-2.5 py-1 rounded-md font-medium border border-[#EFEBE0]">
                {note}
              </span>
            ))}
          </div>
        )}

        <div className="space-y-3 pt-4 border-t border-[#EFEBE0]">
          {recommendation.acidity && (
            <div className="flex justify-between text-sm">
              <span className="text-[#A89F91]">Кислотность</span>
              <span className="font-medium text-[#4A3C31]">{recommendation.acidity}</span>
            </div>
          )}
          {recommendation.sweetness && (
            <div className="flex justify-between text-sm">
              <span className="text-[#A89F91]">Сладость</span>
              <span className="font-medium text-[#4A3C31]">{recommendation.sweetness}</span>
            </div>
          )}
          {recommendation.body && (
            <div className="flex justify-between text-sm">
              <span className="text-[#A89F91]">Плотность</span>
              <span className="font-medium text-[#4A3C31]">{recommendation.body}</span>
            </div>
          )}
          {recommendation.brewingMethod && (
            <div className="flex justify-between text-sm">
              <span className="text-[#A89F91]">Способ</span>
              <span className="font-medium text-[#4A3C31]">{recommendation.brewingMethod}</span>
            </div>
          )}
          {recommendation.grindSize && (
            <div className="flex justify-between text-sm">
              <span className="text-[#A89F91]">Помол</span>
              <span className="font-medium text-[#4A3C31]">{recommendation.grindSize}</span>
            </div>
          )}
        </div>

        {recommendation.nextStep && (
          <div className="pt-4 mt-2">
            <button className="w-full bg-[#8B7355] text-white py-3 rounded-xl font-medium hover:bg-[#725C43] transition-colors shadow-sm">
              {recommendation.nextStep}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
