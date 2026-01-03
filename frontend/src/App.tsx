import { useState, useEffect } from 'react';
import { GroceryList, ItemDetailsPage } from './components';
import { useGroceryList } from './hooks';

function App() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  const { items, loading } = useGroceryList();

  // Listen for browser back/forward navigation
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Navigate to a new path
  const navigateTo = (path: string) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
  };

  // Parse the current path to determine what to render
  const itemIdMatch = currentPath.match(/^\/items\/([^/]+)$/);
  
  if (itemIdMatch) {
    const itemId = itemIdMatch[1];
    // Wait for items to load before determining if item exists
    // This prevents showing "not found" during initial load for deep links
    const item = loading ? undefined : (items.find(i => i.id === itemId) || null);
    
    return (
      <ItemDetailsPage 
        item={item} 
        onBack={() => navigateTo('/')} 
        loading={loading}
      />
    );
  }

  // Default: render the main list
  return <GroceryList onOpenDetails={(id) => navigateTo(`/items/${id}`)} />;
}

export default App;
