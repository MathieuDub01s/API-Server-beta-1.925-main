import * as utilities from './utilities.js';
import * as serverVariables from './serverVariables.js';
import {log} from './log.js';
//faire une mise en cache des requêtes GET
//mise en cache moins longue que celle du repository(2 à 3 fois moins longue)
let requestCacheExpirationTime = serverVariables.get("main.requestCache.expirationTime");

global.requestCaches = [];
global.cachedRequestsCleanerStarted = false;

export default class CachedRequestsManager{
    static startCachedRequestCleaner(){
        setInterval(CachedRequestsManager.flushExpired, requestCacheExpirationTime * 1000);
        console.log(BgWhite + FgBlue, "[Periodic request caches cleaning process started...]");
    }
    static add(url, content, ETag = ""){
        if(!cachedRequestsCleanerStarted){
            cachedRequestsCleanerStarted = true;
            CachedRequestsManager.startCachedRequestCleaner();
        }
        if(url != ""){
            CachedRequestsManager.clear(url);
            requestCaches.push({
                url,
                content,
                ETag,
                Expire_Time: utilities.nowInSeconds() + requestCacheExpirationTime
            });
            console.log(BgWhite + FgBlue, `[Data of ${url} request has been cached]`);
        }
    }
    static find(url){
        try{
            if(url != ""){
                for (let cache of requestCaches){
                    if(cache.url == url){
                        cache.Expire_Time = utilities.nowInSeconds() + requestCacheExpirationTime;
                        console.log(BgWhite + FgBlue, `[${cache.url} data retrieved from cache]`);
                        return cache;
                    }
                }
            }
        } catch(error){
            console.log(BgWhite + FgRed, "[url cache error!]", error);
        }
        return null;
    }
    static clear(url){
        if(url != ""){
            let indexToDelete = [];
            let index = 0;
            for(let cache of requestCaches){
                if(cache.url == url) indexToDelete.push(index);
                index++;
            }
            utilities.deleteByIndex(requestCaches, indexToDelete);
        }
    }
    static flushExpired(){
        let now = utilities.nowInSeconds();
        for (let cache of requestCaches){
            if(cache.Expire_Time <= now){
                console.log(BgWhite + FgBlue, "Cached url of " + cache.url + " expired");
            }
        }
        requestCaches = requestCaches.filter(cache =>cache.Expire_Time > now);
    }
    static get(HttpContext){
            let requestHttp = this.find(HttpContext.req.url);
            if(requestHttp != null){
                return HttpContext.response.JSON(requestHttp.content, requestHttp.ETag, true); 
            }
        return false;
    }
}