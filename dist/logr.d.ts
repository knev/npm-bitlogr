declare function l_length_(obj_labels: any): number;
declare function l_array_(arr_labels: any, start?: number): any;
declare function l_concat_(obj_labels: any, arg: any): any;
declare function l_merge_(obj_labels1: any, obj_labels2: any): any;
declare function l_LL_(obj: any, x: any): Readonly<{}>;
declare function l_RR_(obj: any, x: any): Readonly<{}>;
declare const LOGR: {
    get_instance(): any;
};
export { LOGR, l_length_ as l_length, l_array_ as l_array, l_concat_ as l_concat, l_merge_ as l_merge, l_LL_ as l_LL, l_RR_ as l_RR, };
