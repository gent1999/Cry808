import { useEffect, useRef } from 'react';

const SCRIPT_SRC = 'https://pl27975526.profitablecpmratenetwork.com/09bd789febed0d52285f37d4273b028e/invoke.js';
const CONTAINER_ID = 'container-09bd789febed0d52285f37d4273b028e';

const AdsterraNative = ({ className = '' }) => {
  const loaded = useRef(false);

  useEffect(() => {
    if (loaded.current) return;
    loaded.current = true;

    if (document.querySelector(`script[src="${SCRIPT_SRC}"]`)) return;

    const script = document.createElement('script');
    script.async = true;
    script.setAttribute('data-cfasync', 'false');
    script.src = SCRIPT_SRC;
    document.body.appendChild(script);
  }, []);

  return (
    <div className={className}>
      <div className="text-xs text-white/40 mb-2 text-center">Advertisement</div>
      <div id={CONTAINER_ID} />
    </div>
  );
};

export default AdsterraNative;
