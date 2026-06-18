import { createContext, useContext } from 'react';
import type { ChatSDK, ViewSDK } from '@salesforce/platform-sdk';

export interface SdkBundle {
    chat: ChatSDK;
    view: ViewSDK;
}

const SdkContext = createContext<SdkBundle | null>(null);

export const SdkProvider = SdkContext.Provider;

export function useSdk(): SdkBundle {
    const sdk = useContext(SdkContext);
    if (!sdk) {
        throw new Error('useSdk() called outside <SdkProvider>. Wrap your app at the root.');
    }
    return sdk;
}
