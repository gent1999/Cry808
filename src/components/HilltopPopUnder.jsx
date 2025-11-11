import { useEffect } from 'react';

/**
 * Hilltop Ads Pop-Under Component
 * Pop-under ad that opens in background
 */
const HilltopPopUnder = () => {
  useEffect(() => {
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = "//narrowdrawing.com/b.3/VJ0/Pt3XpNvvbemCVkJIZxDM0Y2oN/zgAKw_NpTxcpz/L/T_Yg3KMwDUAs1UNKzIQR";
    script.async = true;
    script.setAttribute('data-cfasync', 'false');

    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  return null; // Pop-under runs in background, no visible element
};

export default HilltopPopUnder;
