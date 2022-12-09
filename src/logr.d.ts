declare function l_LL_(obj: any, x: any): {};
declare function l_RR_(obj: any, x: any): {};
declare class BitLogr {
    constructor();
    set handler(fx: any);
    get labels(): any;
    set labels(obj: any);
    get toggled(): any;
    set toggled(obj: any);
	log(nr_logged: number, ...args: any[]): boolean;
}
export { BitLogr, l_LL_ as l_LL, l_RR_ as l_RR, };