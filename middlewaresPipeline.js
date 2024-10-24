/////////////////////////////////////////////////////////////////////
// Use this class to insert into middlewares into the pipeline
// 
/////////////////////////////////////////////////////////////////////
// Author : Nicolas Chourot
// Lionel-Groulx College
/////////////////////////////////////////////////////////////////////
import CachedRequestsManager from "./cachedRequestsManager.js";

export default class MiddlewaresPipeline {
    constructor() {
        this.middlewares = [];
    }
    add(middleware) {
        this.middlewares.push(middleware);
    }
    async handleHttpRequest(HttpContext) {
        if (await CachedRequestsManager.get(HttpContext)) {
            return true;
        }
        for (let middleware of this.middlewares) {
            if (await middleware(HttpContext)) 
                return true;
        }
        return false;
    }
}