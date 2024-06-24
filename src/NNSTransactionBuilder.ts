import { NeonParser } from "@cityofzion/neon-dappkit"
import { NNS_SCRIPT_HASH } from "./Constants"
import { ContractInvocation } from '@cityofzion/neon-dappkit-types'


export class NNSTransactionBuilder {

    static nnsScriptHash = NNS_SCRIPT_HASH

    /**
     * Get the registration price of a name
     * @param {*} nameLength The length of the name (letters)
     * @returns 
     */
    static getPriceInvocation(nameLength: number): ContractInvocation {
        return {
            scriptHash: this.nnsScriptHash,
            operation: 'getPrice',
            args: [

                { type: 'Integer', value: nameLength.toString() }
            ],
        }
    }

    /**
     * Get the NNS NFTs owned by an account
     * @param {Hash160} address 
     * @returns {ContractInvocation}
     */
    static getBalanceInvocation(address: string): ContractInvocation {
        return {
            scriptHash: this.nnsScriptHash,
            operation: 'balanceOf',
            args: [
                { type: 'Hash160', value: address }
            ],
        }
    }

    /**
     * Get the record of a name
     * @param {string} name - The name to query, e.g. "king.neo"
     * @param {number} type - Allowed Types: 1 - IPV4, 5 - CNAME, 16 - TXT, 28 - IPV6
     * @returns {Object} - The record invocation object
     */
    static getRecordInvocation(name: string, type: number): ContractInvocation {
        return {
            scriptHash: this.nnsScriptHash,
            operation: 'getRecord',
            args: [
                { type: 'String', value: name },
                { type: 'Integer', value: type.toString() }
            ],
        }
    }

    /**
     * Get all records of a name
     * @param {string} name - The name to check, e.g. "king.neo"
     * @returns {Object} - The invocation object
     */
    static getAllRecordsInvocation(name: string): ContractInvocation {
        return {
            scriptHash: this.nnsScriptHash,
            operation: 'getAllRecords',
            args: [
                { type: 'String', value: name }
            ],
        }
    }

    /**
     * Check if the name is available
     * @returns {Object} - The invocation object
     */
    static getIsAvailableInvocation(name: string): ContractInvocation {
        return {
            scriptHash: this.nnsScriptHash,
            operation: 'isAvailable',
            args: [
                { type: 'String', value: name }
            ],
        }
    }

    /**
     * Get the account that owns a name
     * @param {*} name - The name to query, e.g. "king.neo
     * @returns 
     */
    static getOwnerOfInvocation(name: string): ContractInvocation {
        return {
            scriptHash: this.nnsScriptHash,
            operation: 'ownerOf',
            args: [
                { type: 'String', value: name }
            ],
        }
    }

    /**
     * Get the properties of a name
     * @param {string} name - The name to query, e.g. "king.neo"
     */
    static getPropertiesInvocation(name: string): ContractInvocation {
        const hexTokenId = NeonParser.strToHex(name)

        return {
            scriptHash: this.nnsScriptHash,
            operation: 'properties',
            args: [
                { type: 'ByteArray', value: hexTokenId }
            ],
        }
    }

    static getRegisterInvocation(name: string, address: string): ContractInvocation {
        return {
            scriptHash: this.nnsScriptHash,
            operation: 'register',
            args: [
                { type: 'String', value: name },
                { type: 'Hash160', value: address }
            ],
        }
    }

    static getRenewInvocation(name: string, yearsToRenew: number): ContractInvocation {
        return {
            scriptHash: this.nnsScriptHash,
            operation: 'renew',
            args: [
                { type: 'String', value: name },
                { type: 'Integer', value: yearsToRenew.toString() }
            ],
        }
    }

    static getResolveInvocation(name: string, type: number): ContractInvocation {
        return {
            scriptHash: this.nnsScriptHash,
            operation: 'resolve',
            args: [
                { type: 'String', value: name },
                { type: 'Integer', value: type.toString() }
            ],
        }
    }

    static getRootNames(): ContractInvocation {
        return {
            scriptHash: this.nnsScriptHash,
            operation: 'roots',
            args: []
        }
    }

    static getTokensInvocation(): ContractInvocation {
        return {
            scriptHash: this.nnsScriptHash,
            operation: 'tokens',
            args: []
        }
    }

    static getSetNameAdminInvocation(name: string, address: string): ContractInvocation {
        return {
            scriptHash: this.nnsScriptHash,
            operation: 'setAdmin',
            args: [
                { type: 'String', value: name },
                { type: 'Hash160', value: address }
            ],
        }
    }

    static getSetRecordInvocation(name: string, type: number, data: string): ContractInvocation {
        return {
            scriptHash: this.nnsScriptHash,
            operation: 'setRecord',
            args: [
                { type: 'String', value: name },
                { type: 'Integer', value: type.toString() },
                { type: 'String', value: data }
            ],
        }
    }

    static getTokensOfInvocation(address: string): ContractInvocation {
        return {
            scriptHash: this.nnsScriptHash,
            operation: 'tokensOf',
            args: [
                { type: 'Hash160', value: address }
            ],
        }
    }

    static getNameTransferInvocation(to: string, name: string, optionalData: string): ContractInvocation {
        return {
            scriptHash: this.nnsScriptHash,
            operation: 'transfer',
            args: [
                { type: 'Hash160', value: to },
                { type: 'String', value: name },
                { type: 'Any', value: optionalData }
            ],
        }
    }

    static getDeleteRecordInvocation(name: string, type: number): ContractInvocation {
        return {
            scriptHash: this.nnsScriptHash,
            operation: 'deleteRecord',
            args: [
                { type: 'String', value: name },
                { type: 'Integer', value: type.toString() }
            ],
        }
    }
}