/**
 * Copyright Howest University College of Applied Computer Sciences
 *
 * Author: Robby Goetinck
 * Date: 2023/01/23
 *
 */

import * as fs from "fs";
import * as network from "fabric-network";
import FabricCAServices from "fabric-ca-client";

const profile = JSON.parse(fs.readFileSync("profile.json", "utf-8").toString());

/**
 * Read the profile and build the CA client for authentication
 * @param msp the msp you're trying to authenticate with
 * @returns fabric CA client
 */
function buildCAClient(msp: string): FabricCAServices {
  const tlscacert = profile.certificateAuthorities[msp].tlsCACerts.pem;
  const caHostname = profile.certificateAuthorities[msp].url;
  const tlsoptions = { trustedRoots: tlscacert, verify: false };

  return new FabricCAServices(caHostname, tlsoptions);
}

/**
 * Attempts to enroll the user and add their identity to the msp's wallet
 * @param msp MSP ID for which the request is attempted
 * @param username a registered user on the MSP - not enrolled!
 * @param password the secret for the registered user
 */
export async function enrollUser(
  msp: string,
  username: string,
  password: string
): Promise<void> {
  const client = buildCAClient(msp);

  const enrollment = await client.enroll({
    enrollmentID: username,
    enrollmentSecret: password,
  });

  const wallet = await network.Wallets.newFileSystemWallet(`wallets/${msp}`);
  const identity = {
    credentials: {
      certificate: enrollment.certificate,
      privateKey: enrollment.key.toBytes(),
    },
    mspId: msp,
    type: "X.509",
  };

  wallet.put(username, identity);
}

/**
 * Connect to the organization as an enrolled user
 * @param msp the organization to which you want to connect
 * @param username the identity as whom you attempt the connection, must be enrolled in the wallet
 * @returns a connection to the organization as the enrolled user
 */
export async function connect(
  msp: string,
  username: string
): Promise<network.Gateway> {
  const gateway = new network.Gateway();
  const wallet = await network.Wallets.newFileSystemWallet(`wallets/${msp}`);

  profile.client.organization = msp;

  const options: network.GatewayOptions = {
    wallet,
    identity: username,
    clientTlsIdentity: "",
    discovery: {
      enabled: true,
      asLocalhost: false,
    },
    tlsInfo: {
      certificate: JSON.parse(
        fs.readFileSync(`wallets/${msp}/${username}-tls.id`, "utf8").toString()
      ).credentials.certificate,
      key: JSON.parse(
        fs.readFileSync(`wallets/${msp}/${username}-tls.id`, "utf8").toString()
      ).credentials.privateKey,
    },
  };

  await gateway.connect(profile, options);

  return gateway;
}
