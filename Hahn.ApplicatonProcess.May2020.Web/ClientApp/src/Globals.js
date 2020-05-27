/**
 * Contains global isomorphic session.
 */
import { fetchData } from './utils';
export default class Globals 
{    
    // static isInitialized = false;
    // static session = {};

    static reset(key) 
    {
        localStorage.removeItem(key);
        this.user = { id: '', firstName: '', lastName: '', email: '', isAuthenticated: false, code: -1, userName: '', role: '', message: '' };
    }

    static init(user) 
    {     
        this.user = (user || { id: '', firstName: '', lastName: '', email: '', isAuthenticated: false, code: -1, userName: '', role: '', message: '' });
        this.isInitialized = true;
    }

    static throwIfNotInitialized() 
    {
        if (!this.isInitialized)
        {
            throw Error("'Globals' is not initialized. You have to call 'Globals.init' before.");
        }
    }

    static async getSession(key) 
    {      
        let data = localStorage.getItem(key);
        
        if (data === undefined || data === null)
        {
            if (key === 'user')
            {
                data = await fetchData('/api/Account/getSession');
                localStorage.removeItem('user');
                localStorage.setItem('user', JSON.stringify(data));
            }            
        }
        else
        {
            data = JSON.parse(data);
        }

        return data;
    }

    static setSession(key, value) 
    {
        localStorage.setItem(key, JSON.stringify(value));
    }

    static async getUser() 
    {
        let user = await this.getSession('user');
        return user;   
    }

    static setUser(user) 
    {
        localStorage.setItem('user', JSON.stringify(user));
    }

    static get isAuthenticated() 
    {
        let user = localStorage.getItem("user");
        return user != null && user.isAuthenticated === true;
    }
}