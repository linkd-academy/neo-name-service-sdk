# Neo Name Service SDK for JavaScript

This is the JavaScript SDK for the Neo Name Service (NNS) on the Neo blockchain. It provides a simple way to interact with the NNS smart contract. The SDK is written in TypeScript and can be used in both TypeScript and JavaScript projects.

## Installation

To install the SDK, use the following command:

```bash
npm install @linkdacademy/neo-name-service-sdk
```

## Usage

### Client Initialization

Import the SDK and initialize the client:

```typescript
// Initialize the client using RPC address and an account (optional)
const client = new NNSClient();
await client.init("https://mainnet2.coz.io", testAccount)

// Alternatively, initialize an NeonInvoker instance and pass it to the client
const invoker = await NeonInvoker.init({ "https://mainnet2.coz.io", testAccount })
const client = new NNSClient(invoker);
```

### Using the SDK

Use the SDK to perform read operations on the NNS smart contract. The following examples demonstrate how to get the owner of a domain name and the resolver address of a domain name.

```typescript
const name = "linkdacademy.neo";
const owner = await client.getOwner(name);
console.log(`The owner of ${name} is ${owner}`); // Na4VGtfNcJmgAXyREZ4WfDqnRZor4woga5
```

The transaction is not sent to the blockchain, so it does not require a signature.

### Write Operations

Write operations require a signer parameter to sign the transaction. The account used as the signer must match the one used to initialize the client.

```typescript
let name = 'test999.neo';
const signer: Signer = { account: testAccount.scriptHash, scopes: 'CalledByEntry' };
let result = await client.buyName(name, testAccount.scriptHash, signer, false, false); // Returns the transaction hash
```

The last two parameters in write operations are optional. Send `true` for the fourth parameter to submit the transaction to the blockchain. Using false will return a test invocation result. The fifth parameter is used to specify whether the client should wait for the transaction to be confirmed.

### NNS Transaction Builder

The SDK provides a class to build NNS invocation scripts. Use it to create custom transactions or execute multiple operations in a single transaction.

```typescript
// Returns a ContractInvocation object with the script and parameters
const invocation = NNSTransactionBuilder.getPropertiesInvocation(name);

//Execute the transaction (test invocation)
const resp = await this.invoker?.testInvoke({
    invocations: [invocation],
    signers: []
});
```

## Documentation

For more information on Neo Name Service, visit the [official documentation](https://docs.neo.link/).

Made with ❤️ by [Linkd Academy](https://linkd.academy)
