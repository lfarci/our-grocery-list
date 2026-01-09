import type { ItemState } from '../types';

interface StatusBadgeProps {
  state: ItemState;
}

const stateStyles: Record<ItemState, string> = {
  checked: 'bg-softmint text-freshgreen border border-freshgreen/30',
  archived: 'bg-warmsand/50 text-softbrowngray border border-warmsand',
  active: 'bg-honey/50 text-warmcharcoal border border-basketbrown/30',
};

const stateLabels: Record<ItemState, string> = {
  active: 'To buy',
  checked: 'In basket',
  archived: 'In kitchen',
};

export function StatusBadge({ state }: StatusBadgeProps) {
  return (
    <span
      className={`shrink-0 px-3 py-1 rounded-full text-sm font-semibold ${stateStyles[state]}`}
    >
      {stateLabels[state]}
    </span>
  );
}
