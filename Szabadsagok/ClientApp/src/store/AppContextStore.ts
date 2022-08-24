import { stat } from 'fs';
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
  export interface FetchAction { type: 'FETCH', url: string, data: any, successCb: any, failCb: any }

  export type KnownAction = SaveUserTokenAction | RemoveUserTokenAction | SetLoadingStateAction | ShowToastrStateAction | FetchAction;

  
export const actionCreators = {
    saveToken: (token: string) => ({ type: 'SAVETOKEN', token: token } as SaveUserTokenAction),
    removeToken: () => ({ type: 'REMOVETOKEN' } as RemoveUserTokenAction),
    setLoadingState: (loading: boolean) => ({ type: 'SETLOADINGSTATE', loading: loading } as SetLoadingStateAction),
    showToastrMessage: (message: ToastMessage) => ({ type: 'SHOWTOASTRMESSAGE', message: message } as ShowToastrStateAction),
    fetchService: (url: string, data: any, successCb: any, failCb: any) => ({ type: 'FETCH', 
                                                                              url: url, 
                                                                              data: data, 
                                                                              successCb: successCb, 
                                                                              failCb: failCb } as FetchAction)
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
        case 'FETCH':
            let requestOptions: any = {};
            requestOptions.method = 'PUT';
            requestOptions.headers = {
                  'Content-Type': 'application/json',
                  'Authorization': 'Bearer ' +  state.token
                };
                if (action.data) {
                  requestOptions.body = JSON.stringify(action.data)
                }
                fetch(action.url, requestOptions)
                  .then(async response => {
                    if (response.status == 401) {
                        localStorage.setItem(tokenStr, "");
                        state.token = '';
                    } else if (!response.ok) {
                        state.message = {severity: 'error', summary:'Sikertelen művelet', detail: 'response. .message'};
                        action.failCb(response);
                    } else {
                        action.successCb(await response.json());
                    };
                  })
                  .catch(error => {
                    state.message = {severity: 'error', summary:'Sikertelen művelet', detail: error.message};
                  });
            return { message: state.message, token: state.token, loading: state.loading};
        default:
            return state;
    }
};