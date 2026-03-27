import { TurboModuleRegistry } from "react-native";
import type { TurboModule } from 'react-native';

interface Spec extends TurboModule {
    getConstants?(): {};
    zipEpubFolder(folder: string, path: string): Promise<boolean>;
    isBase64Async(str: string): Promise<boolean>;
    isBase64(str: string): boolean;
    decode(input: string): string;
    encode(input: string): string;
    decodeAsync(input: string): Promise<string>;
    encodeAsync(input: string): Promise<string>;
}
const EpubZipper = TurboModuleRegistry.getEnforcing<Spec>('EpubZipper');

export class EpubModule {
    static async zipEpubFolder(folder: string, path: string) {
        return await EpubZipper.zipEpubFolder(folder, path);
    }

    static async isBase64Async(str: string) {
        return await EpubZipper.isBase64Async(str);
    }

    static isBase64(str: string) {
        return EpubZipper.isBase64(str);
    }

    // base64
    static decode(base64Input: string) {
        try {
            return EpubZipper.decode(base64Input);
        } catch (e) {
            console.error(e);
            return base64Input;
        }
    }

    // base64
    static encode(input: string) {
        try {
            return EpubZipper.encode(input);
        } catch (e) {
            console.error(e);
            return input;
        }
    }


    // base64
    static async decodeAsync(base64Input: string) {
        try {
            return await EpubZipper.decodeAsync(base64Input);
        } catch (e) {
            console.error(e);
            return base64Input;
        }
    }

    // base64
    static async encodeAsync(input: string) {
        try {
            return await EpubZipper.encodeAsync(input);
        } catch (e) {
            console.error(e);
            return input;
        }
    }
}
