
import { initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey: "AIzaSyAgFgIDuVQwydCfZPQB52hZH_vdIpaPX3I",
  authDomain: "promoview1-2c2f9.firebaseapp.com",
  projectId: "promoview1-2c2f9",
  storageBucket: "promoview1-2c2f9.appspot.com",  // <- corrigé
  messagingSenderId: "256954827065",
  appId: "1:256954827065:web:abe4885320bebc51da28e8",
};

const app = initializeApp(firebaseConfig);

export default app;
