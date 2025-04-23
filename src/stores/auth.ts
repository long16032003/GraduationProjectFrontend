import { observable } from '@legendapp/state';
import { syncObservable } from '@legendapp/state/sync';
import { ObservablePersistLocalStorage } from '@legendapp/state/persist-plugins/local-storage';
import app$ from '@/stores/app.ts';

export interface User {
  uuid: string;
  email: string;
}

interface AuthStore {
  user: User | null;
  isAuthenticated: boolean;
}

const auth$ = observable<AuthStore>({
  user: null,
  // Computeds
  isAuthenticated: (): boolean => !!auth$.user.get(),
})

syncObservable(app$, {
  persist: {
    name: 'auth',
    plugin: ObservablePersistLocalStorage,
  },
});

export default auth$;