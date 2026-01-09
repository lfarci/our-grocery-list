import { useState, useRef, useEffect, useCallback } from 'react';
import { GroceryItem as GroceryItemType, ItemState } from '../types';

interface GroceryItemProps {
  item: GroceryItemType;
  onToggleChecked: (id: string, state: ItemState) => void;
  onDelete: (id: string) => void;
  onArchive: (id: string) => void;
  onOpenDetails?: (id: string) => void;
}

export function GroceryItem({ item, onToggleChecked, onDelete, onArchive, onOpenDetails }: GroceryItemProps) {
  const isChecked = item.state === 'checked';
  const hasQuantity = item.quantity !== undefined && item.quantity !== null;
  // Format quantity inline: "Chocolate (4)" or "Bananas (2 kg)"
  const quantityText = hasQuantity
    ? ` (${item.quantity}${item.quantityUnit ? ` ${item.quantityUnit}` : ''})`
    : '';
  const [translateX, setTranslateX] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const [hasMovedForSwipe, setHasMovedForSwipe] = useState(false);
  const startXRef = useRef(0);
  const startYRef = useRef(0);
  const currentXRef = useRef(0);
  const currentYRef = useRef(0);
  const gestureLockRef = useRef<'none' | 'horizontal' | 'vertical'>('none');
  const containerRef = useRef<HTMLDivElement>(null);

  const SWIPE_THRESHOLD = 100; // pixels to trigger action
  const MAX_SWIPE = 150; // maximum swipe distance
  const TAP_MOVEMENT_THRESHOLD = 10; // pixels - movement below this is considered a tap
  const INTENT_THRESHOLD = 24; // pixels - movement required to lock direction

  // Helper to check if target is an interactive element
  const isInteractiveElement = (target: HTMLElement): boolean => {
    return target.tagName === 'INPUT' || target.tagName === 'BUTTON';
  };

  // Shared function to update swipe position
  const updateSwipePosition = (clientX: number) => {
    currentXRef.current = clientX;
    const deltaX = currentXRef.current - startXRef.current;
    
    // If movement exceeds tap threshold, mark as swipe
    if (Math.abs(deltaX) > TAP_MOVEMENT_THRESHOLD) {
      setHasMovedForSwipe(true);
    }
    
    // Limit the swipe distance
    const limitedDeltaX = Math.max(-MAX_SWIPE, Math.min(MAX_SWIPE, deltaX));
    setTranslateX(limitedDeltaX);
  };

  // Shared function to complete swipe action
  const completeSwipe = useCallback(() => {
    if (!isSwiping) return;
    
    const deltaX = currentXRef.current - startXRef.current;
    
    // Only process swipe actions if the user actually moved enough
    if (hasMovedForSwipe) {
      // Swipe left → Delete (destructive)
      if (deltaX < -SWIPE_THRESHOLD) {
        onDelete(item.id);
      }
      // Swipe right → Archive (non-destructive)
      else if (deltaX > SWIPE_THRESHOLD) {
        onArchive(item.id);
      }
    } else {
      // This was a tap, not a swipe - open details if handler provided
      if (onOpenDetails) {
        onOpenDetails(item.id);
      }
    }
    
    // Reset position and state
    setTranslateX(0);
    setIsSwiping(false);
    setHasMovedForSwipe(false);
  }, [isSwiping, hasMovedForSwipe, item.id, onArchive, onDelete, onOpenDetails]);

  const handleTouchStart = (e: React.TouchEvent) => {
    // Don't start swipe if touching an interactive element
    const target = e.target as HTMLElement;
    if (isInteractiveElement(target)) {
      return;
    }
    
    startXRef.current = e.touches[0].clientX;
    currentXRef.current = e.touches[0].clientX;
    startYRef.current = e.touches[0].clientY;
    currentYRef.current = e.touches[0].clientY;
    gestureLockRef.current = 'none';
    setIsSwiping(true);
    setHasMovedForSwipe(false);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isSwiping) return;

    currentXRef.current = e.touches[0].clientX;
    currentYRef.current = e.touches[0].clientY;
    const deltaX = currentXRef.current - startXRef.current;
    const deltaY = currentYRef.current - startYRef.current;
    const absDeltaX = Math.abs(deltaX);
    const absDeltaY = Math.abs(deltaY);

    if (gestureLockRef.current === 'none') {
      if (absDeltaX < INTENT_THRESHOLD && absDeltaY < INTENT_THRESHOLD) {
        return;
      }

      if (absDeltaX > absDeltaY && absDeltaX >= INTENT_THRESHOLD) {
        gestureLockRef.current = 'horizontal';
      } else {
        gestureLockRef.current = 'vertical';
        setIsSwiping(false);
        setHasMovedForSwipe(false);
        setTranslateX(0);
        return;
      }
    }

    if (gestureLockRef.current === 'horizontal') {
      e.preventDefault();
      updateSwipePosition(currentXRef.current);
    }
  };

  const handleTouchEnd = () => {
    completeSwipe();
  };

  // Mouse events for desktop support
  const handleMouseDown = (e: React.MouseEvent) => {
    // Don't start swipe if clicking on an interactive element
    const target = e.target as HTMLElement;
    if (isInteractiveElement(target)) {
      return;
    }
    
    startXRef.current = e.clientX;
    currentXRef.current = e.clientX;
    gestureLockRef.current = 'horizontal';
    setIsSwiping(true);
    setHasMovedForSwipe(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isSwiping) return;
    updateSwipePosition(e.clientX);
  };

  // Add global mouse up listener when swiping
  const handleGlobalMouseUp = useCallback(() => {
    completeSwipe();
  }, [completeSwipe]);

  useEffect(() => {
    if (!isSwiping) return;
    
    window.addEventListener('mouseup', handleGlobalMouseUp);
    return () => window.removeEventListener('mouseup', handleGlobalMouseUp);
  }, [isSwiping, handleGlobalMouseUp]);

  const showArchiveHint = translateX > 30;
  const showDeleteHint = translateX < -30;

  return (
    <div
      className="relative overflow-hidden rounded-xl"
      data-testid={`item-container-${item.name}`}
      role="listitem"
    >
      {/* Background hints */}
      <div className="absolute inset-0 flex items-center justify-between px-6">
        <div className={`flex items-center gap-2 transition-opacity ${showArchiveHint ? 'opacity-100' : 'opacity-0'}`}>
          <svg className="w-6 h-6 text-freshgreen" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
          </svg>
          <span className="text-freshgreen font-semibold">Archive</span>
        </div>
        <div className={`flex items-center gap-2 transition-opacity ${showDeleteHint ? 'opacity-100' : 'opacity-0'}`}>
          <span className="text-mutedcoral font-semibold">Delete</span>
          <svg className="w-6 h-6 text-mutedcoral" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </div>
      </div>

      {/* Swipeable item content */}
      <div
        ref={containerRef}
        data-swipeable="true"
        className={`px-4 min-h-[56px] rounded-xl border shadow flex items-center gap-3 relative transition-all ${
          isChecked ? 'bg-softmint border-warmsand' : 'bg-softwhitecream border-warmsand hover:shadow-md hover:-translate-y-[1px]'
        } touch-pan-y ${onOpenDetails ? 'cursor-pointer' : ''}`}
        style={{
          transform: `translateX(${translateX}px)${!isSwiping && !isChecked ? ' translateY(0)' : ''}`,
          transition: isSwiping ? 'none' : 'transform 0.3s ease-out, box-shadow 0.2s ease-out',
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
      >
        {/* Done Toggle */}
        <input
          type="checkbox"
          checked={isChecked}
          onChange={() => onToggleChecked(item.id, isChecked ? 'active' : 'checked')}
          className="h-5 w-5 rounded-xl border-warmsand text-freshgreen focus:ring-softblue cursor-pointer flex-shrink-0"
          aria-label={`Mark ${item.name} as ${isChecked ? 'not checked' : 'checked'}`}
        />

        {/* Item Content - Single line with inline quantity */}
        <div className="flex-1 min-w-0 whitespace-nowrap overflow-hidden text-ellipsis">
          <span className={`font-semibold ${isChecked ? 'line-through text-softbrowngray' : 'text-warmcharcoal'}`}>
            {item.name}
          </span>
          {quantityText && (
            <span className="text-softbrowngray font-normal">
              {quantityText}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
