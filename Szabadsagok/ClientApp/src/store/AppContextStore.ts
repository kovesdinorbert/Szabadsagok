import { ToastMessage } from 'primereact/toast';
import { Action, Reducer } from 'redux';

export interface AppContextState {
    token: string | undefined | null;
    loading: boolean;
    message: ToastMessage | undefined;
}

const tokenStr = "userToken";

export const InitialState: AppContextState = {
    token: localStorage.getItem(tokenStr),
    loading: false,
    message: undefined
  }

  export interface SaveUserTokenAction { type: 'SAVETOKEN', token: '' }
  export interface RemoveUserTokenAction { type: 'REMOVETOKEN' }
  export interface SetLoadingStateAction { type: 'SETLOADINGSTATE', loading: false }
  export interface ShowToastrStateAction { type: 'SHOWTOASTRMESSAGE', message: ToastMessage }

  export type KnownAction = SaveUserTokenAction | RemoveUserTokenAction | SetLoadingStateAction | ShowToastrStateAction;

  
export const actionCreators = {
    saveToken: (token: string) => ({ type: 'SAVETOKEN', token: token } as SaveUserTokenAction),
    removeToken: () => ({ type: 'REMOVETOKEN' } as RemoveUserTokenAction),
    setLoadingState: (loading: boolean) => ({ type: 'SETLOADINGSTATE', loading: loading } as SetLoadingStateAction),
    showToastrMessage: (message: ToastMessage) => ({ type: 'SHOWTOASTRMESSAGE', message: message } as ShowToastrStateAction)
};

export const reducer: Reducer<AppContextState> = (state: AppContextState | undefined, incomingAction: Action): AppContextState => {
    if (state === undefined) {
        return { token: "", loading: false, message: undefined };
    }

    const action = incomingAction as KnownAction;
    switch (action.type) {
        case 'SAVETOKEN':
            localStorage.setItem(tokenStr, action.token);
            return { loading: state.loading, token: action.token, message: undefined };
        case 'REMOVETOKEN':
            localStorage.setItem(tokenStr, "");
            return {loading: state.loading, token: "", message: undefined };
        case 'SETLOADINGSTATE':
            return { loading: action.loading, token: state.token, message: undefined };
        case 'SHOWTOASTRMESSAGE':
            return { message: action.message, token: state.token, loading: state.loading};
        default:
            return state;
    }
};