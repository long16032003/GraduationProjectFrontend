import { observable } from '@legendapp/state';
import { syncObservable } from '@legendapp/state/sync';
import { ObservablePersistLocalStorage } from '@legendapp/state/persist-plugins/local-storage';

export interface Preference {
  theme: 'light' | 'dark';
}

export interface Setting {
  [key: string]: unknown;
}

interface AppStore {
  preference: Preference;
  setting: Setting;
}

const app$ = observable<AppStore>({
  preference: {
    theme: 'light',
  },
  setting: {},
});

// Persist state
syncObservable(app$, {
  persist: {
    name: 'app',
    plugin: ObservablePersistLocalStorage,
  },
});

export default app$;
