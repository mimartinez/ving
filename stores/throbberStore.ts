import { defineStore } from 'pinia';

export const useThrobberStore = defineStore('throbber', {
    state: (): {
        counter: number,
        workers: number,
    } => ({
        counter: 0,
        workers: 0,
    }),
    actions: {
        working() {
            this.counter = 100;
            this.workers++;
        },
        done() {
            const self = this;
            self.workers--;
            if (self.workers < 1) {
                self.counter = 1;
                setTimeout(function () {
                    self.counter = 0;
                }, 200);
            }
        },
    },
});