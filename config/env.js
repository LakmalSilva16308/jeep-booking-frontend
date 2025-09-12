console.log('Frontend .env loading...');
console.log('REACT_APP_STRIPE_PUBLISHABLE_KEY:', process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

if (!process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY) {
  console.error('REACT_APP_STRIPE_PUBLISHABLE_KEY is not defined. Check frontend/.env file.');
} else {
  console.log('Frontend environment loaded successfully');
}

export {};