import React from 'react';
import { Coffee, Settings, Package, Truck, RefreshCcw, Box } from 'lucide-react';

interface SidebarProps {
  onCategorySelect: (category: string, examples: string[]) => void;
}

const CATEGORIES = [
  {
    id: 'selection',
    name: 'Подбор кофе',
    icon: <Coffee className="w-5 h-5" />,
    examples: [
      'Посоветуй кофе с яркой кислотностью для фильтра',
      'Какой кофе лучше подойдет для капучино?',
      'Ищу сладкий кофе с шоколадными нотами',
    ],
  },
  {
    id: 'grind',
    name: 'Помол',
    icon: <Settings className="w-5 h-5" />,
    examples: [
      'Какой помол нужен для гейзерной кофеварки?',
      'Как смолоть кофе для френч-пресса?',
      'Почему кофе получается кислым? Это из-за помола?',
    ],
  },
  {
    id: 'subscription',
    name: 'Подписка',
    icon: <Package className="w-5 h-5" />,
    examples: [
      'Как работает кофейная подписка?',
      'Можно ли менять сорта кофе в подписке?',
      'Сколько стоит подписка на месяц?',
    ],
  },
  {
    id: 'storage',
    name: 'Хранение',
    icon: <Box className="w-5 h-5" />,
    examples: [
      'Как правильно хранить зерновой кофе?',
      'Можно ли хранить кофе в холодильнике?',
      'Сколько хранится молотый кофе?',
    ],
  },
  {
    id: 'delivery',
    name: 'Доставка и оплата',
    icon: <Truck className="w-5 h-5" />,
    examples: [
      'Сколько стоит доставка?',
      'Как я могу оплатить заказ?',
      'Отправляете ли вы кофе в другие города?',
    ],
  },
  {
    id: 'returns',
    name: 'Возврат',
    icon: <RefreshCcw className="w-5 h-5" />,
    examples: [
      'Можно ли вернуть кофе, если он не понравился?',
      'Что делать, если пришел не тот сорт?',
      'Каковы условия возврата оборудования?',
    ],
  },
];

export function Sidebar({ onCategorySelect }: SidebarProps) {
  return (
    <div className="w-full bg-[#FDFBF7] p-2 md:p-4 flex flex-col h-full overflow-y-auto overflow-x-auto md:overflow-x-hidden border-b md:border-b-0 md:border-r border-[#EFEBE0]">
      <h2 className="hidden md:block text-lg font-semibold text-[#4A3C31] mb-6 px-2">Категории</h2>
      <ul className="flex flex-row md:flex-col space-x-2 md:space-x-0 md:space-y-2">
        {CATEGORIES.map((cat) => (
          <li key={cat.id} className="shrink-0">
            <button
              onClick={() => onCategorySelect(cat.name, cat.examples)}
              className="w-full text-left flex items-center space-x-2 md:space-x-3 px-3 py-2 md:py-3 rounded-lg text-[#5C4D41] bg-white md:bg-transparent border border-[#EFEBE0] md:border-transparent hover:bg-[#F4F0E6] transition-colors focus:outline-none focus:ring-2 focus:ring-[#D4C3B3]"
            >
              <span className="text-[#8B7355]">{cat.icon}</span>
              <span className="font-medium text-sm whitespace-nowrap">{cat.name}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
