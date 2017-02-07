export default class Utils {

    public static compare(o1: any, o2: any): number {
        if (o1 > o2) {
            return 1;
        }
        else if (o1 < o2) {
            return -1;
        }
        else {
            return 0;
        }
    }

    public static getLastName(name: string): string {
        let arr: string[] = name.split(' ');
        return arr[arr.length - 1].toUpperCase();
    }
}