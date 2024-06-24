
import { assert } from 'console';
import { NNSClient } from '../NNSClient';
import { Signer } from '@cityofzion/neon-dappkit-types';
import { wallet } from '@cityofzion/neon-core';
import { DEFAULT_RPC_ADDRESS } from '../Constants';


describe('testNNSSdk', () => {
    let client: NNSClient;
    let testAccount = new wallet.Account()

    beforeAll(async () => {
        client = new NNSClient();
        await client.init(DEFAULT_RPC_ADDRESS, testAccount);
    });

    it('should create the get the correct price', async () => {
        let name = 'aaa.neo';
        let price = await client.getNamePrice(name);
        expect(price).toBe(200);

        name = 'aaaa.neo';
        price = await client.getNamePrice(name);
        expect(price).toBe(70);

        name = 'aaaaa.neo';
        price = await client.getNamePrice(name);
        expect(price).toBe(2);

        name = 'aaaaaa.neo';
        price = await client.getNamePrice(name);
        expect(price).toBe(2);
    });

    it('should throw error if domain name is invalid', async () => {
        let name = 'aa.neo';
        try {
            await client.getNamePrice(name);
            assert(false, 'Should have thrown error');
        } catch (e: any) {
            expect(e.message).toBe('Domain name should be at least 3 characters long');
        }
    });

    it('should get the owner of neo.neo', async () => {
        let name = 'linkdacademy.neo';
        let owner = await client.getOwnerOf(name);
        expect(owner).toBe('Na4VGtfNcJmgAXyREZ4WfDqnRZor4woga5');
    });

    it('should get NNS balance', async () => {
        let address = 'Nfc23YfxGgKbAiwTNe77FFi8DCkhbWmJyz';

        let balance = await client.getNNSBalance(address);
        expect(balance).toBe(0);

        address = 'Na4VGtfNcJmgAXyREZ4WfDqnRZor4woga5';
        balance = await client.getNNSBalance(address);
        expect(balance).toBeGreaterThan(0);
    });

    it('should get the correct record', async () => {
        let name = 'superboy.neo';
        let record = await client.getNameRecords(name);
        expect(record.length).toBe(3);
        expect(record[0]).toBe('superboy.neo');
    });

    it('should check if a name is available', async () => {
        const isAvailable = await client.isNameAvailable('test999.neo');
        expect(isAvailable).toBe(true);

        const notAvailable = await client.isNameAvailable('superboy.neo');
        expect(notAvailable).toBe(false);
    });

    it('should get the properties of a name', async () => {
        const properties = await client.getNameProperties('superboy.neo');
        expect(properties).toBeDefined();
        const name = properties.name;
        expect(name).toBe('superboy.neo');
    });

    it('shoud buy a name', async () => {
        let name = 'test999.neo';
        const signer: Signer = { account: testAccount.scriptHash, scopes: 'CalledByEntry' };
        let result = await client.buyName(name, testAccount.scriptHash, signer, false, false);
        expect(result).toBeDefined();
    })

    it('should renew a name', async () => {
        const signer: Signer = { account: testAccount.scriptHash, scopes: 'CalledByEntry' };
        const response = await client.renewName('superboy.neo', 1, signer);
        expect(response).toBeDefined();
    });

    it('should resolve a name', async () => {
        const resolved = await client.resolveName('superboy.neo', 1);
        expect(resolved).toBeDefined();
    });

    it('should get all root names', async () => {
        const activeNames = await client.getRootNames();
        expect(activeNames).toHaveLength(1);
        expect(activeNames[0]).toBe('neo');
    });

    it('should get all names', async () => {
        const allNames = await client.getAllNames();
        expect(allNames).toBeDefined();
    });


    it('should set the admin of a name', async () => {
        const signer: Signer = { account: testAccount.scriptHash, scopes: 'CalledByEntry' };
        const response = await client.setNameAdmin('superboy.neo', testAccount.address, signer, false);
        expect(response).toBeDefined();
    });

    it('should get tokens of an address', async () => {
        const linkdacademy = await client.getOwnerOf('linkdacademy.neo');
        const tokens = await client.getTokensOf(linkdacademy);
        expect(tokens).toBeDefined();
        expect(tokens.length).toBeGreaterThan(0);
    });

    it('should set a record for a name', async () => {
        const signer: Signer = { account: testAccount.scriptHash, scopes: 'CalledByEntry' };
        const response = await client.setRecord('superboy.neo', 1, 'data', signer, false);
        expect(response).toBeDefined();
    });

    it('should delete a record', async () => {
        const signer: Signer = { account: testAccount.scriptHash, scopes: 'CalledByEntry' };
        const response = await client.deleteRecord('superboy.neo', 1, signer, false);
        expect(response).toBeDefined();
    });
});

