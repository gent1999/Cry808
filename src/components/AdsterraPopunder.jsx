import { useEffect } from 'react';

/**
 * Adsterra Popunder Ad Component
 *
 * HIGHEST EARNING AD FORMAT!
 * Opens a new tab/window behind the current page when users click anywhere.
 *
 * Earnings: $5-$15 CPM (vs $1-3 for banners)
 *
 * Note: Can be annoying to users, but earns the most money.
 * The script handles frequency capping automatically (won't spam same user).
 */
const AdsterraPopunder = () => {
  useEffect(() => {
    // Load popunder script once when component mounts
    const popunderScript = document.createElement('script');
    popunderScript.type = 'text/javascript';
    popunderScript.src = '//pl27975874.effectivegatecpm.com/53/3d/bd/533dbde53575fb85cfb9de5f8527425c.js';

    // Append to body
    document.body.appendChild(popunderScript);

    // Cleanup on unmount
    return () => {
      if (document.body.contains(popunderScript)) {
        document.body.removeChild(popunderScript);
      }
    };
  }, []);

  // This component doesn't render anything visible
  return null;
};

export default AdsterraPopunder;
