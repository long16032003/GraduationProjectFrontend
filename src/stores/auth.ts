import { observable } from '@legendapp/state';
import { syncObservable } from '@legendapp/state/sync';
import { ObservablePersistLocalStorage } from '@legendapp/state/persist-plugins/local-storage';
import type { User } from '@/types.ts';

interface AuthStore {
  user: User | null;
  isAuthenticated: boolean;
}

const auth$ = observable<AuthStore>({
  user: null,
  // Computeds
  isAuthenticated: (): boolean => !!auth$.user.get(),
})

// Persist state
// https://legendapp.com/open-source/state/v3/sync/persist-sync/
// https://legendapp.com/open-source/state/v3/sync/persist-sync/#indexeddb-react
// https://legendapp.com/open-source/state/v3/sync/persist-sync/#transform-data
syncObservable(auth$, {
  persist: {
    name: 'auth',
    plugin: ObservablePersistLocalStorage,
  },
});

export default auth$;