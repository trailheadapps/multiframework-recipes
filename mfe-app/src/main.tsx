// Side-effect import: registers the sf-embedding bootstrap listener at
// module-load time, before any createXxxSDK() call below. Required when
// the app is loaded inside a <lightning-embedding> iframe; harmless when
// the app runs standalone in a plain browser tab.
import '@salesforce/platform-sdk/sf-embedding';

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createChatSDK, createViewSDK } from '@salesforce/platform-sdk';
import './index.css';
import App from './App.tsx';
import { SdkProvider } from './sdk-context.tsx';

const [chat, view] = await Promise.all([createChatSDK(), createViewSDK()]);

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <SdkProvider value={{ chat, view }}>
            <App />
        </SdkProvider>
    </StrictMode>,
);
