import Vue from 'vue';
import { Enforcer, newEnforcer} from 'casbin.js';
import { AUTHORIZER_KEY } from './useAuthorizer';

export interface CasbinPluginOptions {
    useGlobalProperties?: boolean;
    customProperties?: Array<string>;
}

const install = function (vue: Vue, enforcer: Enforcer, options?: CasbinPluginOptions) {
    if (options == undefined){
        options = {
            useGlobalProperties: false,
        }
    }
    const availableProperties = [
        'addPolicy',
        'removePolicy',
        'enforceEx'
    ];

    if (!Enforcer || !(enforcer instanceof Enforcer)) {
        throw new Error('Please provide an enforcer instance to plugin.');
    }

    if (options) {
        if (options.useGlobalProperties) {
            Vue.prototype.$enforcer = enforcer

            if (options.customProperties) {
                const targetProperties = availableProperties.filter((property: string) => {
                    return (options.customProperties as string[]).indexOf(property) !== -1;
                });

                targetProperties.forEach((propertyStr: string) => {
                    const property = Object.getPrototypeOf(enforcer)[propertyStr]
                    if (property) {
                        const propertyKey = `$${propertyStr}`
                        // app.config.globalProperties[propertyKey] = property;
                        Object.defineProperty(Vue.prototype,propertyKey,{
                            enumerable: true,
                            configurable: true,
                            writable: true,
                            value: property
                        })
                    } else {
                        throw new Error('Unexpected Error.');
                    }
                });
            } else {
                Vue.prototype.$enforce = enforcer.enforce;
            }
        }
    }
};

export { install };
