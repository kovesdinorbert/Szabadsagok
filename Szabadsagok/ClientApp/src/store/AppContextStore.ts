import { Action, Reducer } from 'redux';

export interface AppContextState {
    loading: boolean;
}

  export interface SetLoadingStateAction { type: 'SETLOADINGSTATE', loading: false }

  export type KnownAction = SetLoadingStateAction;

  
export const actionCreators = {
    setLoadingState: (loading: boolean) => ({ type: 'SETLOADINGSTATE', loading: loading } as SetLoadingStateAction)
};

export const reducer: Reducer<AppContextState> = (state: AppContextState | undefined, incomingAction: Action): AppContextState => {
    if (state === undefined) {
        return { loading: false };
    }

    const action = incomingAction as KnownAction;
    switch (action.type) {
        case 'SETLOADINGSTATE':
            return { loading: action.loading };
        default:
            return state;
    }
};