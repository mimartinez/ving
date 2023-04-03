import { defineStore } from 'pinia';
import type { Describe, ModelName, VingRecord, VingRecordParams, QueryParams, VRUpdateOptions, VRCreateOptions, VRDeleteOptions, ModelSelect, vingOption } from '~/types';
import type { UnwrapRef } from 'vue'
import { ouch } from '~/server/helpers';
import { v4 } from 'uuid';
import _ from 'lodash';
const notify = useNotifyStore();

export default <T extends ModelName>(behavior: VingRecordParams<T>) => {

    const throbber = useThrobberStore();

    const onRequest = async (context: any) => {
        throbber.working();
    }

    const onRequestError = async (context: any) => {
        throbber.done();
    }

    const onResponse = async (context: any) => {
        throbber.done();
    }

    const onResponseError = async (context: any) => {
        throbber.done();
        console.dir(context)
        if (!behavior.suppressErrorNotifications)
            notify.error(context.response._data.message);
    }

    const generate = defineStore(behavior.key || v4(), {
        state: (): {
            props?: Describe<T>['props'],
            meta?: Describe<T>['meta'],
            options?: Describe<T>['options'],
            links?: Describe<T>['links'],
            related?: Describe<T>['related'],
            warnings?: Describe<T>['warnings'],
            query?: QueryParams,
            behavior: VingRecordParams<T>,
        } => ({
            props: {},
            meta: {},
            options: {},
            links: {},
            related: {},
            warnings: [],
            query: { includeLinks: true, ...behavior.query },
            behavior,
        }),
        actions: {

            setState(result: Describe<T>) {
                this.props = result.props as UnwrapRef<Partial<ModelSelect<T>>>;
                this.links = result.links;
                this.meta = result.meta;
                this.options = result.options as UnwrapRef<{ [property in keyof Partial<ModelSelect<T>>]?: vingOption[] | undefined; }>;
                this.related = result.related;
                this.warnings = result.warnings;
                this.dispatchWarnings();
            },

            dispatchWarnings() {
                if (this.warnings) {
                    for (const warning of this.warnings) {
                        document.dispatchEvent(
                            new CustomEvent("wing_warn", {
                                // @ts-ignore
                                message: warning.message,
                            })
                        );
                        notify.warn(warning.message);
                    }
                }
            },

            getCreateApi(): string {
                if (this.behavior.createApi) {
                    return this.behavior.createApi;
                }
                else if (this.behavior.links?.base) {
                    return this.behavior.links.base;
                }
                notify.error('No createApi');
                throw ouch(401, 'No createApi');
            },

            getFetchApi() {
                if (this.behavior.fetchApi) {
                    return this.behavior.fetchApi;
                }
                else if (this.behavior.links?.self) {
                    return this.behavior.links.self;
                }
                notify.error('No fetchApi');
                throw ouch(401, 'No fetchApi');
            },

            fetch() {
                const self = this;
                const promise = useFetch(this.getFetchApi(), {
                    query: this.query,
                    onRequest,
                    onRequestError,
                    onResponse,
                    onResponseError,
                });
                promise.then((response) => {
                    const data: Describe<T> = response.data.value as Describe<T>;
                    self.setState(data);
                    if (behavior?.onFetch)
                        behavior.onFetch(data);
                })
                    .catch((response) => {
                        const data: Describe<T> = response.data.value as Describe<T>;
                        if (behavior?.onError)
                            behavior.onError(data);
                    });
                return promise;
            },

            _partialUpdate(props?: Describe<T>['props'], options: VRUpdateOptions<T> = {}) {
                // if we were calling formatPropsBodyData here is where we would call it
                const self = this;

                const promise = useFetch(this.getSelfApi, {
                    query: this.query,
                    method: 'put',
                    body: props,
                    onRequest,
                    onRequestError,
                    onResponse,
                    onResponseError,
                });

                promise.then((response) => {
                    const data: Describe<T> = response.data.value as Describe<T>;
                    self.setState(data);
                    if (options?.onUpdate)
                        options.onUpdate(data);
                    if (behavior?.onUpdate)
                        behavior.onUpdate(data);
                })
                    .catch((response) => {
                        const data: Describe<T> = response.data.value as Describe<T>;
                        if (options?.onError)
                            options.onError(data);
                        if (behavior?.onError)
                            behavior.onError(data);
                    });
                return promise;
            },

            partialUpdate: _.debounce(function (props, options) {
                // @ts-ignore - i think the nature of the construction of this method makes ts think there is a problem when there isn't
                return this._partialUpdate(props, options);
            }, 200),

            save: _.debounce(function (name, value) {
                // @ts-ignore - i think the nature of the construction of this method makes ts think there is a problem when there isn't
                return this._save(name, value);
            }, 200),

            _save: function <K extends keyof Describe<T>['props']>(name: K, value?: Describe<T>['props'][K]) {
                const self = this;
                const update: Describe<T>['props'] = {};
                if (self.props && value === undefined) {
                    //@ts-expect-error
                    update[name] = self.props[name];
                }
                else if (value !== undefined) {
                    // @ts-ignore - not sure why this is a problem since it is properly typed in the interface
                    update[name] = value;
                }
                return self._partialUpdate(update);
            },

            update(options?: {}) {
                return this.partialUpdate(this.props, options);
            },

            create(props?: Describe<T>['props'], options?: VRCreateOptions<T>) {
                const self = this;
                const newProps = _.extend({}, this.props, props);

                const promise = useFetch(this.getCreateApi(), {
                    query: this.query,
                    method: 'post',
                    body: newProps,
                    onRequest,
                    onRequestError,
                    onResponse,
                    onResponseError,
                });

                promise.then((response) => {
                    const data: Describe<T> = response.data.value as Describe<T>;
                    self.setState(data);
                    if (options?.onCreate)
                        options.onCreate(data);
                    if (behavior?.onCreate)
                        behavior.onCreate(data);
                })
                    .catch((response) => {
                        const data: Describe<T> = response.data.value as Describe<T>;
                        if (options?.onError)
                            options.onError(data);
                        if (behavior?.onError)
                            behavior.onError(data);
                    });
                return promise;
            },

            getSelfApi() {
                if (this.links?.self) {
                    return this.links.self;
                }
                notify.error('No links.self');
                throw ouch(400, 'No links.self');
            },

            delete(options: VRDeleteOptions<T> = {}) {
                const self = this;
                let message = "Are you sure?";
                if (this.props && typeof this.props == 'object' && "name" in this.props) {
                    message = "Are you sure you want to delete " + this.props.name + "?";
                }
                if (options.skipConfirm || confirm(message)) {
                    const promise = useFetch(this.getSelfApi(), {
                        query: self.query,
                        method: 'delete',
                        onRequest,
                        onRequestError,
                        onResponse,
                        onResponseError,
                    });
                    promise.then((response) => {
                        const data: Describe<T> = response.data.value as Describe<T>;
                        if (options?.onDelete)
                            options.onDelete(data);
                        if (behavior?.onDelete)
                            behavior.onDelete(data);
                    })
                        .catch((response) => {
                            const data: Describe<T> = response.data.value as Describe<T>;
                            if (options?.onError)
                                options.onError(data);
                            if (behavior?.onError)
                                behavior.onError(data);
                        });
                    return promise
                }

            }
        }
    });

    const VingRecord = generate();
    VingRecord.setState(behavior as Describe<T>);
    return VingRecord;
}