# Merkle Airdrop Contracts

Forked from Richard Moore's repo https://github.com/ricmoo/ethers-airdrop

Original Blog: https://blog.ricmoo.com/merkle-air-drops-e6406945584d

## Build

```
npm run build
```

## Test

```
npm run test
```

## Generate Proofs

```
npm run generate-proofs
```


  ## Flow 
   from prepare folder 
   * ```ts-node getData.ts```
   from root 
   * ```ts-node merkle/sanatizeData.ts```
   * ```ts-node merkle/merkle.ts```
   * ```ts-node merkle/prepDrop.ts```

   launch
    * redo token and treasury address
    * ```yarn test```
    * ```yarn deploy:mainnet```
