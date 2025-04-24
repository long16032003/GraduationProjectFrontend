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

// https://legendapp.com/open-source/state/v3/usage/observable/
const app$ = observable<AppStore>({
  preference: {
    theme: 'light',
  },
  setting: {},
});

// Persist state
// https://legendapp.com/open-source/state/v3/sync/persist-sync/
// https://legendapp.com/open-source/state/v3/sync/persist-sync/#indexeddb-react
// https://legendapp.com/open-source/state/v3/sync/persist-sync/#transform-data
syncObservable(app$, {
  persist: {
    name: 'app',
    plugin: ObservablePersistLocalStorage,
  },
});

export default app$;
