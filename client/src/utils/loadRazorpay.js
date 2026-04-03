let razorpayScriptPromise = null;

const loadRazorpay = () => {
  return new Promise((resolve, reject) => {
    // Razorpay already present (e.g., hot reload / previous checkout)
    if (typeof window !== 'undefined' && window.Razorpay) {
      resolve(true);
      return;
    }

    // De-dupe in-flight loads
    if (razorpayScriptPromise) {
      razorpayScriptPromise.then(resolve).catch(reject);
      return;
    }

    razorpayScriptPromise = new Promise((innerResolve, innerReject) => {
      if (typeof document === 'undefined') {
        innerReject(new Error('Razorpay script can only be loaded in the browser.'));
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;

      script.onload = () => {
        if (window.Razorpay) innerResolve(true);
        else innerReject(new Error('Razorpay SDK loaded but Razorpay constructor is missing.'));
      };

      script.onerror = () => {
        innerReject(new Error('Failed to load Razorpay SDK'));
      };

      document.body.appendChild(script);
    });

    razorpayScriptPromise.then(resolve).catch(reject);
  });
};

export default loadRazorpay;

