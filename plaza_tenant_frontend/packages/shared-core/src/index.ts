// Export HTTP Auth Client Factory
export { createAuthHttpClient } from './api/createAuthHttpClient';
export type { IAuthHttpClientOptions } from './api/createAuthHttpClient';

// Export Safe JWT Utilities
export { safeDecodeJwt, isTokenExpiringSoon } from './utils/jwtUtils';
export type { IJwtPayload } from './utils/jwtUtils';

// Export Auth Hydration Hook
export { useAuthHydration } from './hooks/useAuthHydration';
export type { IUseAuthHydrationOptions } from './hooks/useAuthHydration';

// Export Shared Core Business Allocator
export { allocatePaymentFIFO, calculateBillStatus } from './utils/fifoAllocator';

// Export Shared API Transport & Transaction Model
export { httpClient, apiClient, mockDelay } from './api/client';
export { MockTransactionAdapter, transactionPort } from './api/transactions';
