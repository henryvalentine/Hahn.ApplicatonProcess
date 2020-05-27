import { Action, Reducer } from 'redux';
import { AppThunkAction } from './';

// -----------------
// STATE - This defines the type of data maintained in the Redux store.

export interface AuthState
{    
    appUser: AppUser;
    login: LoginUser;
    isLoading: boolean;
    show: boolean;
}

export interface AppUser
{
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    isAuthenticated: boolean;
    code: number;
    userName: string;
    role: string;
    message: string
}

export interface LoginUser
{
    email: string;
    password: string
}


// -----------------
// ACTIONS - These are serializable (hence replayable) descriptions of state transitions.
// They do not themselves have any side-effects; they just describe something that is going to happen.

interface LogoutAction
{
    type: 'LOG_OUT_SUCCESS';
    appUser: AppUser;
}

interface LoginAction
{
    type: 'LOG_IN';
    loginUser: LoginUser;
}

interface LoginSuccessAction
{
    type: 'LOG_IN_SUCCESS';
    appUser: AppUser;    
}

interface GetUserSession
{
    type: 'GET_SESSION';
}

interface LoginFailedAction
{
    type: 'LOG_IN_FAILURE';
    appUser: AppUser;
}

// Declare a 'discriminated union' type. This guarantees that all references to 'type' properties contain one of the
// declared type strings (and not any other arbitrary string).
type KnownAction = LoginAction | LogoutAction | LoginSuccessAction | LoginFailedAction | GetUserSession;

// ----------------
// ACTION CREATORS - These are functions exposed to UI components that will trigger a state transition.
// They don't directly mutate state, but they can have external side-effects (such as loading data).

export const actionCreators =
{
    login: (loginUser: LoginUser): AppThunkAction<KnownAction> => (dispatch, getState) =>
    {
        const appState = getState();
        if (loginUser != null && loginUser.email.length > 0 && loginUser.password.length > 0)
        {
            fetch("api/Account/login",
                {
                    method: "POST",
                    headers:
                    {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(loginUser)
                })
                .then(response => response.json() as Promise<AppUser>)
                .then(data =>
                {
                    if (data.code > 0 && data.isAuthenticated)
                    {
                        localStorage.removeItem('user');
                        localStorage.setItem('user', JSON.stringify(data));
                        dispatch({ type: 'LOG_IN_SUCCESS', appUser: data });
                    }
                    else
                    {
                        dispatch({ type: 'LOG_IN_FAILURE', appUser: data });
                    }
                    
                });

                dispatch({ type: 'LOG_IN', loginUser: loginUser });
        }
    },
    getUserSession: (): AppThunkAction<KnownAction> => (dispatch, getState) =>
    {
        dispatch({ type: 'GET_SESSION' });
        //let user = localStorage.getItem('user');

        //if (user === undefined || user === null)
        //{
            fetch("api/Account/getSession",
                {
                    method: "GET",
                    headers:
                    {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    }
                })
                .then(response => response.json() as Promise<AppUser>)
                .then(data =>
                {
                    if (data.code > 0 && data.isAuthenticated)
                    {
                        dispatch({ type: 'LOG_IN_SUCCESS', appUser: data });                        
                    }
                    else
                    {
                        dispatch({ type: 'LOG_IN_FAILURE', appUser: data });
                    }

                });
     
    },
    logOut: (): AppThunkAction<KnownAction> => (dispatch, getState) =>
    {
        fetch("api/Account/logout",
            {
                method: "POST",
                headers:
                {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            })
            .then(response => response.json() as Promise<number>)
            .then(data =>
            {
                localStorage.removeItem('user');
                dispatch({ type: 'LOG_OUT_SUCCESS', appUser: { id: '', firstName: '', lastName: '', email: '', isAuthenticated: false, code: -1, userName: '', role: '', message: '' }});
            });
    },
    refreshSession: (): AppThunkAction<KnownAction> => (dispatch, getState) =>
    {
        fetch("api/Account/refreshSession",
            {
                method: "GET",
                headers:
                {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            })
            .then(response => response.json() as Promise<number>)
            .then(data =>
            {
                console.log('session refreshed');
            });
    }
};

// ----------------
// REDUCER - For a given state and action, returns the new state. To support time travel, this must not mutate the old state.

const unloadedState: AuthState =
{
    login: { email: '', password: '' }, isLoading: false, show: false,
    appUser: { id: '', firstName: '', lastName: '', email: '', isAuthenticated: false, code: -1, userName: '', role: '', message: '' }
    
};

export const reducer: Reducer<AuthState> = (state: AuthState | undefined, incomingAction: Action): AuthState =>
{
    if (state === undefined)
    {
        return unloadedState;
    }

    const action = incomingAction as KnownAction;
    switch (action.type)
    {
        case 'LOG_IN':
            return { login: action.loginUser, appUser: state.appUser, isLoading: true, show: false };
            
        case 'LOG_IN_SUCCESS':
            return { appUser: action.appUser, login: { email: '', password: '' }, isLoading: false, show: false };

        case 'GET_SESSION':
            return { login: state.login, appUser: state.appUser, isLoading: false, show: true };

        case 'LOG_IN_FAILURE':   
            return { login: state.login, appUser: action.appUser, isLoading: false, show: false };

        case 'LOG_OUT_SUCCESS':
            return { login: state.login, appUser: unloadedState.appUser, isLoading: false, show: false };
        default:
            return state;
    }

};
