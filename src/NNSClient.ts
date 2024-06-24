import { wallet, tx, u } from '@cityofzion/neon-core'
import { NeonInvoker, NeonParser, NeonEventListener } from '@cityofzion/neon-dappkit';
import { Signer } from '@cityofzion/neon-dappkit-types';
import { NNSTransactionBuilder } from './NNSTransactionBuilder';
import { DEFAULT_RPC_ADDRESS } from './Constants';

export interface NNSTokenProperties {
    name: string;
    expiration: number;
    admin: string | undefined;
    image: string;
}

export class NNSClient {
    invoker: NeonInvoker | null = null;

    constructor(invoker: NeonInvoker | null = null) {
        this.invoker = invoker;
    }

    async init(rpcAddress = DEFAULT_RPC_ADDRESS, account: wallet.Account | wallet.Account[] = []) {
        if (this.invoker) {
            throw new Error('NNSClient already initialized')
        }
        this.invoker = await NeonInvoker.init({ rpcAddress, account })
    }

    async getNamePrice(name: string) {
        if (!name.endsWith('.neo')) {
            throw new Error('Domain name should not end with ".neo"')
        }

        const nameLength = name.length - 4

        if (nameLength < 3) {
            throw new Error('Domain name should be at least 3 characters long')
        }

        const invocation = NNSTransactionBuilder.getPriceInvocation(nameLength)

        const resp = await this.invoker?.testInvoke({
            invocations: [invocation],
        })

        if (!resp) {
            throw new Error('Failed to get domain price')
        }

        if (resp.stack.length === 0) {
            throw new Error('Failed to get domain price')
        }

        let price = NeonParser.parseRpcResponse(resp?.stack[0])

        if (price === -1) {
            throw new Error('Invalid domain name')
        }

        price = u.BigInteger.fromNumber(price).toDecimal(8)

        return Number.parseFloat(price)
    }

    async getNNSBalance(address: string) {
        const scriptHash = NeonParser.accountInputToScripthash(address)
        const invocation = NNSTransactionBuilder.getBalanceInvocation(scriptHash)

        const resp = await this.invoker?.testInvoke({
            invocations: [invocation],
        })

        if (!resp) {
            throw new Error('Failed to get NNS balance')
        }

        if (resp.stack.length === 0) {
            throw new Error('Failed to get NNS balance')
        }

        return NeonParser.parseRpcResponse(resp?.stack[0])
    }

    async getOwnerOf(name: string) {
        const invocation = NNSTransactionBuilder.getOwnerOfInvocation(name)

        const resp = await this.invoker?.testInvoke({
            invocations: [invocation],
        })

        if (!resp) {
            throw new Error('Failed to get owner of domain: Empty response')
        }

        if (resp.stack.length === 0) {
            throw new Error('Failed to get owner of domain')
        }

        const base64Account: any = resp.stack[0]
        const hexData = u.base642hex(base64Account.value)
        const scriptHash = NeonParser.reverseHex(hexData)
        const address = NeonParser.accountInputToAddress(scriptHash)

        return address
    }

    async getRecord(name: string, type: number) {
        const invocation = NNSTransactionBuilder.getRecordInvocation(name, type)

        const resp = await this.invoker?.testInvoke({
            invocations: [invocation],
            signers: []
        })

        if (!resp) {
            throw new Error('Failed to get record')
        }

        if (resp.stack.length === 0) {
            throw new Error('Failed to get record')
        }

        return NeonParser.parseRpcResponse(resp?.stack[0])
    }

    async getNameRecords(name: string) {
        const invocation = NNSTransactionBuilder.getAllRecordsInvocation(name)

        const resp = await this.invoker?.testInvoke({
            invocations: [invocation],
            signers: []
        })

        if (!resp) {
            throw new Error('Failed to get records')
        }

        if (resp.stack.length === 0) {
            throw new Error('Failed to get records')
        }

        const records: string[] = []

        const respType = resp.stack[0].type;
        if (respType === 'InteropInterface') {
            // @ts-ignore
            const interop = resp.stack[0].iterator;

            for (const item of interop) {
                const parsedItem = NeonParser.parseRpcResponse(item)
                records.push(...parsedItem)
            }
        }

        return records
    }

    async isNameAvailable(name: string) {
        const invocation = NNSTransactionBuilder.getIsAvailableInvocation(name);

        const resp = await this.invoker?.testInvoke({
            invocations: [invocation],
            signers: []
        });

        if (!resp || resp.stack.length === 0) {
            throw new Error('Failed to check name availability');
        }

        return NeonParser.parseRpcResponse(resp.stack[0]);
    }


    async getNameProperties(name: string): Promise<NNSTokenProperties> {
        const invocation = NNSTransactionBuilder.getPropertiesInvocation(name);

        const resp = await this.invoker?.testInvoke({
            invocations: [invocation],
            signers: []
        });

        if (!resp || resp.stack.length === 0) {
            throw new Error('Failed to get name properties');
        }

        return NeonParser.parseRpcResponse(resp.stack[0]) as NNSTokenProperties;
    }

    async buyName(name: string, owner: string, signer: Signer, execute: boolean = false, waitConfirmation: boolean = false) {
        const invocation = NNSTransactionBuilder.getRegisterInvocation(name, owner);

        const resp = await this.invoker?.testInvoke({
            invocations: [invocation],
            signers: [signer]
        },);

        if (!resp) {
            throw new Error('Failed to buy name');
        }

        // @ts-ignore
        let success = resp.state === 'HALT' && resp.notifications.length > 0;

        if (success && execute) {
            const txId = await this.invoker?.invokeFunction({
                invocations: [invocation],
                signers: [signer]
            });

            if (!txId) {
                throw new Error('Failed to buy name');
            }

            if (waitConfirmation) {
                const listener = new NeonEventListener(DEFAULT_RPC_ADDRESS)
                const log = await listener.waitForApplicationLog(txId)
                listener.confirmTransaction(log, undefined, true)
            }
        }

        return resp
    }

    async renewName(name: string, yearsToRenew: number, signer: Signer, execute: boolean = false, waitConfirmation: boolean = false) {
        const invocation = NNSTransactionBuilder.getRenewInvocation(name, yearsToRenew);

        const resp = await this.invoker?.testInvoke({
            invocations: [invocation],
            signers: [signer]
        });

        if (!resp) {
            throw new Error('Failed to renew name');
        }

        // @ts-ignore
        let success = resp.state === 'HALT' && resp.notifications.length > 0;

        if (success && execute) {
            const txId = await this.invoker?.invokeFunction({
                invocations: [invocation],
                signers: [signer]
            });

            if (!txId) {
                throw new Error('Failed to renew name');
            }

            if (waitConfirmation) {
                const listener = new NeonEventListener(DEFAULT_RPC_ADDRESS)
                const log = await listener.waitForApplicationLog(txId)
                listener.confirmTransaction(log, undefined, true)
            }
        }

        return resp;
    }

    async resolveName(name: string, type: number) {
        const invocation = NNSTransactionBuilder.getResolveInvocation(name, 16);

        const resp = await this.invoker?.testInvoke({
            invocations: [invocation],
            signers: []
        });

        if (!resp || resp.stack.length === 0) {
            throw new Error('Failed to resolve name');
        }

        return NeonParser.parseRpcResponse(resp.stack[0]);
    }

    async getRootNames(): Promise<string[]> {
        const invocation = NNSTransactionBuilder.getRootNames();

        const resp = await this.invoker?.testInvoke({
            invocations: [invocation],
            signers: []
        });

        if (!resp || resp.stack.length === 0) {
            throw new Error('Failed to get active names');
        }

        const activeNames: string[] = []

        const respType = resp.stack[0].type;
        if (respType === 'InteropInterface') {
            // @ts-ignore
            const interop = resp.stack[0].iterator;

            for (const item of interop) {
                const parsedItem = NeonParser.parseRpcResponse(item)
                activeNames.push(parsedItem)
            }
        }

        return activeNames;
    }

    async getAllNames() {
        const invocation = NNSTransactionBuilder.getTokensInvocation();

        const resp = await this.invoker?.testInvoke({
            invocations: [invocation],
            signers: []
        });


        if (!resp || resp.stack.length === 0) {
            throw new Error('Failed to get all names');
        }

        const activeNames: string[] = []

        const respType = resp.stack[0].type;
        if (respType === 'InteropInterface') {
            // @ts-ignore
            const interop = resp.stack[0].iterator;

            for (const item of interop) {
                const parsedItem = NeonParser.parseRpcResponse(item)
                activeNames.push(parsedItem)
            }
            //TO DO: Must be fixed once the teams agree/fix the iterator response
        }

        return activeNames
    }

    async setNameAdmin(name: string, address: string, signer: Signer, execute: boolean = false, waitConfirmation: boolean = false) {
        const scriptHash = NeonParser.accountInputToScripthash(address);
        const invocation = NNSTransactionBuilder.getSetNameAdminInvocation(name, scriptHash);

        const resp = await this.invoker?.testInvoke({
            invocations: [invocation],
            signers: [signer]
        });

        if (!resp) {
            throw new Error('Failed to set name admin');
        }

        // @ts-ignore
        let success = resp.state === 'HALT' && resp.notifications.length > 0;

        if (success && execute) {
            const txId = await this.invoker?.invokeFunction({
                invocations: [invocation],
                signers: [signer]
            });

            if (!txId) {
                throw new Error('Failed to set name admin');
            }

            if (waitConfirmation) {
                const listener = new NeonEventListener(DEFAULT_RPC_ADDRESS)
                const log = await listener.waitForApplicationLog(txId)
                listener.confirmTransaction(log, undefined, true)
            }
        }

        return resp;
    }

    async getTokensOf(address: string) {
        const scriptHash = NeonParser.accountInputToScripthash(address);
        const invocation = NNSTransactionBuilder.getTokensOfInvocation(scriptHash);

        const resp = await this.invoker?.testInvoke({
            invocations: [invocation],
            signers: []
        });

        if (!resp || resp.stack.length === 0) {
            throw new Error('Failed to get tokens of address');
        }

        const tokens: string[] = [];

        const respType = resp.stack[0].type;
        if (respType === 'InteropInterface') {
            // @ts-ignore
            const interop = resp.stack[0].iterator;

            for (const item of interop) {
                const parsedItem = NeonParser.parseRpcResponse(item);
                tokens.push(parsedItem);
            }
            // TO DO: Must be fixed once the teams agree/fix the iterator response
        }

        return tokens;
    }

    async setRecord(name: string, type: number, data: string, signer: Signer, execute: boolean = false, waitConfirmation: boolean = false) {
        const invocation = NNSTransactionBuilder.getSetRecordInvocation(name, type, data);

        const resp = await this.invoker?.testInvoke({
            invocations: [invocation],
            signers: [signer]
        });

        if (!resp) {
            throw new Error('Failed to set record');
        }

        // @ts-ignore
        let success = resp.state === 'HALT' && resp.notifications.length > 0;

        if (success && execute) {
            const txId = await this.invoker?.invokeFunction({
                invocations: [invocation],
                signers: [signer]
            });

            if (!txId) {
                throw new Error('Failed to set record');
            }

            if (waitConfirmation) {
                const listener = new NeonEventListener(DEFAULT_RPC_ADDRESS)
                const log = await listener.waitForApplicationLog(txId)
                listener.confirmTransaction(log, undefined, true)
            }
        }

        return resp;
    }

    async transferName(to: string, name: string, optionalData: string, signer: Signer, execute: boolean = false, waitConfirmation: boolean = false) {
        const scriptHash = NeonParser.accountInputToScripthash(to);
        const invocation = NNSTransactionBuilder.getNameTransferInvocation(scriptHash, name, optionalData);

        const resp = await this.invoker?.testInvoke({
            invocations: [invocation],
            signers: [signer]
        });

        if (!resp) {
            throw new Error('Failed to transfer name');
        }

        // @ts-ignore
        let success = resp.state === 'HALT' && resp.notifications.length > 0;

        if (success && execute) {
            const txId = await this.invoker?.invokeFunction({
                invocations: [invocation],
                signers: [signer]
            });

            if (!txId) {
                throw new Error('Failed to transfer name');
            }

            if (waitConfirmation) {
                const listener = new NeonEventListener(DEFAULT_RPC_ADDRESS);
                const log = await listener.waitForApplicationLog(txId);
                listener.confirmTransaction(log, undefined, true);
            }
        }

        return resp;
    }

    async deleteRecord(name: string, type: number, signer: Signer, execute: boolean = false, waitConfirmation: boolean = false) {
        const invocation = NNSTransactionBuilder.getDeleteRecordInvocation(name, type);

        const resp = await this.invoker?.testInvoke({
            invocations: [invocation],
            signers: [signer]
        });

        if (!resp) {
            throw new Error('Failed to delete record');
        }

        // @ts-ignore
        let success = resp.state === 'HALT' && resp.notifications.length > 0;

        if (success && execute) {
            const txId = await this.invoker?.invokeFunction({
                invocations: [invocation],
                signers: [signer]
            });

            if (!txId) {
                throw new Error('Failed to delete record');
            }

            if (waitConfirmation) {
                const listener = new NeonEventListener(DEFAULT_RPC_ADDRESS);
                const log = await listener.waitForApplicationLog(txId);
                listener.confirmTransaction(log, undefined, true);
            }
        }

        return resp;
    }
}