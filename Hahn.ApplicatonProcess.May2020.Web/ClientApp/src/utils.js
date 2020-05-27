
//This file helps to define utility functions that can be re-used many times

export function clone(object) {
    return JSON.parse(JSON.stringify(object));
}

/**
 * Is server prerendering by Node.js.
 * There can't be any DOM: window, document, etc.
 */
export function isNode() {
    return typeof process === 'object' && process.versions && !!process.versions.node;
}

export const isServer = typeof window === 'undefined';

export const fetchData = async (path) =>
    fetch(path,
        {
            method: "GET",
            headers:
            {
                Accept: 'application/json', 'Content-Type': 'application/json'
            }
        }).then(data => data.json());

export const fetchExternal = async (url) =>
    fetch(url,
        {
            method: "GET",
            mode: 'cors',
            headers:
            {
                'Access-Control-Allow-Origin': 'localhost'
            }
        }).then(data => data.json());

export const postQuery = async (path, body) =>
    fetch(path,
        {
            method: "POST",
            headers:
            {
                'Accept': 'application/json', 
                'Content-Type': 'application/json'
            },
            body: body
        }).then(data => data.json());

export const putQuery = async (path, body) =>
    fetch(path,
        {
            method: "PUT",
            headers:
            {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: body
        }).then(data => data.json());

export const deleteData = async (path) =>
    fetch(path,
        {
            method: "DELETE",
            headers:
            {
                Accept: 'application/json', 'Content-Type': 'application/json'
            }
        }).then(data => data.json());
