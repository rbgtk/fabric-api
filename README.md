# fabric-api
A simple REST API for Hyperledger Fabric

## how it works
This is an Express server, written in Typescript, that does two simple things:

1. Authenticate the user and their subsequent requests
2. CRUD of assets on the Hyperledger Fabric blockchain

The main goal is for it to be an open source server that any party in the consortium can run.
They can all use the same `./profile.json` file to set the relevant network addresses et al.

## how to use
First of all, network administrators need to register the accounts for the network users appropriately.
This means two identities for each user, for example `user1` also has a `user1-tls` identity for encrypting the traffic.

Each organization can run this same API at their discretion.

Either run the chaincode at this [example repo](https://github.com/rbgtk/fabric-chaincode) or run your own.
Shoud you run your own, you need to adjust the endpoints and functions accordingly in `./src/router.ts`.
