import { debug } from 'console';
import { Action, Reducer } from 'redux';

export interface UserState {
    token: string | undefined | null;
    loading: boolean;
}

const tokenStr = "userToken";

export const InitialState: UserState = {
    token: localStorage.getItem(tokenStr),
    loading: false
  }

  export interface SaveUserTokenAction { type: 'SAVETOKEN', token: '' }
  export interface RemoveUserTokenAction { type: 'REMOVETOKEN' }
  export interface SetLoadingStateAction { type: 'SETLOADINGSTATE', loading: false }

  export type KnownAction = SaveUserTokenAction | RemoveUserTokenAction | SetLoadingStateAction;

  
export const actionCreators = {
    saveToken: (token: string) => ({ type: 'SAVETOKEN', token: token } as SaveUserTokenAction),
    removeToken: () => ({ type: 'REMOVETOKEN' } as RemoveUserTokenAction),
    setLoadingState: (loading: boolean) => ({ type: 'SETLOADINGSTATE', loading: loading } as SetLoadingStateAction)
};

export const reducer: Reducer<UserState> = (state: UserState | undefined, incomingAction: Action): UserState => {
    if (state === undefined) {
        return { token: "", loading: false };
    }

    const action = incomingAction as KnownAction;
    switch (action.type) {
        case 'SAVETOKEN':
            localStorage.setItem(tokenStr, action.token);
            return { loading: state.loading, token: action.token };
        case 'REMOVETOKEN':
            localStorage.setItem(tokenStr, "");
            return {loading: state.loading, token: "" };
        case 'SETLOADINGSTATE':
            return { loading: action.loading, token: state.token};
        default:
            return state;
    }
};