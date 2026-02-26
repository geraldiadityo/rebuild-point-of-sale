import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Inject, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { Cache } from "cache-manager";
import { KEYV_INSTANCE } from "./keyv.provider";
import Keyv from "keyv";
export abstract class CacheRepository implements OnModuleInit, OnModuleDestroy {
    @Inject(KEYV_INSTANCE) protected keyv!: Keyv;

    protected cache!: Keyv;
    protected abstract getNamespace(): string;

    onModuleInit() {
        this.cache = new Keyv({
            store: this.keyv.opts.store,
            namespace: this.getNamespace()
        });
    }

    onModuleDestroy() {
        if(this.cache){
            this.cache.removeAllListeners();
        }
    }

    protected async invalidateNamespace(): Promise<void> {
        await this.cache.clear();
    }

    protected getCacheKey(args: any): string {
        // const queryHash = JSON.stringify(args || {});
        // return `${this.getNamespace()}:${queryHash}`;
        return JSON.stringify(args || {});
    }
}