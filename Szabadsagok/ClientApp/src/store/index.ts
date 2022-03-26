import * as WeatherForecasts from './WeatherForecasts';
import * as Counter from './Counter';
import * as AppContext from './AppContextStore';
import * as UserStore from './UserStore';

// The top-level state object
export interface ApplicationState {
    counter: Counter.CounterState | undefined;
    appContext: AppContext.AppContextState | undefined;
    user: UserStore.UserState | undefined;
}

// Whenever an action is dispatched, Redux will update each top-level application state property using
// the reducer with the matching name. It's important that the names match exactly, and that the reducer
// acts on the corresponding ApplicationState property type.
export const reducers = {
    counter: Counter.reducer,
    appContext: AppContext.reducer,
    user: UserStore.reducer
};

// This type can be used as a hint on action creators so that its 'dispatch' and 'getState' params are
// correctly typed to match your store.
export interface AppThunkAction<TAction> {
    (dispatch: (action: TAction) => void, getState: () => ApplicationState): void;
}
