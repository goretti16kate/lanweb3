import Head from 'next/head'
import { Contract, providers, utils } from "ethers";
import React, { useEffect, useRef, useState } from 'react';
import Web3Modal from "web3modal";
import { abi, NFT_CONTRACT_ADDRESS } from "../../constants";
import styles from '@/styles/Home.module.css'


export default function Home() {
  // walletConnected to keep track of whether the user's wallet is connected or not
  const [walletConnected, setWalletConnected] = useState(false);
  // presaleStarted to keep track of the presale status
  const [presaleStarted, setPresaleStarted] = useState(false);
  // presaleEnded keeps track of whether the presale has ended or not
  const [presaleEnded, setPresaleEnded] = useState(false);
  // sets the loading state
  const [loading, setLoading] = useState(false);
  // checks to see if the Metamask wallet connected belongs to the contract owner
  const [isOwner, setIsOwner] = useState(false);
  // keeps track of the number of tokenIds that have been minted
  const [tokenIdsMinted, setTokenIdsMinted] = useState("0");
  // create a reference to the web3Modal (used for connecting to Metamask)
  const web3ModalRef = useRef();


  // presaleMint: Minting an NFT during the presale

 const presaleMint = async () => {
  try {
    // we need a signer since it is a 'write' transaction
    const signer = await getProviderOrSigner(true);
    // Create a new instance of the Contract with a signer, allowing for methos updates
    const nftContract = new Contract(NFT_CONTRACT_ADDRESS, abi, signer);
    // call the presaleMint from the contract
    const tx = await nftContract.presaleMint({
      value: utils.parseEther("0.01"),
    });
    setLoading(true);
    // wait for the transaction
    await tx.wait();
    setLoading(false);
    window.alert("You successfully minted a Crypto Dev!");
  } catch (err) {
    console.error(err)
  }
 };

 // Mint an NFT after the presale

 const publicMint = async () => {
  try{
    // 'write' transaction
    const signer = await getProviderOrSigner(true);

    // create a new instance of the contract with a signer, allowing for method updates
    const nftContract = new Contract(NFT_CONTRACT_ADDRESS, abi, signer);
    // call the mint from the contract 
    const tx = await nftContract.mint({ value: utils.parseEther("0.01"), });
    setLoading(true);
    // wait for the transactin to get mined
    await tx.wait();
    setLoading(false);
    window.alert("You successfully minted a Crypto Dev!");
  }catch (err){
    console.error(err)
  }
 };

 // connectWallet: connects to the Metamask wallet
 const connectWallet = async () => {
  try {
    // Get the provider from web3Modal
    await getProviderOrSigner();
    setWalletConnected(true);
  } catch (err) {
    console.error(err);
  }
 };

 const startPresale = async () => {
  try {
    // 'write' transaction
    const signer = await getProviderOrSigner(true);
    // create a new instance of the contract with a signer to allow methods update
    const nftContract = new Contract(NFT_CONTRACT_ADDRESS, abi, signer);
    // call the startPresale from rhe contract

    const tx = await nftContract.startPresale();
    setLoading(true);
    // wait for the transaction to get mined
    await tx.wait();
    setLoading(false);
    // set the presale started to true
    await checkIfPresaleStarted();
  } catch (err) {
    console.error(err)
  }
 };

 // checks if the presale has started by querying the 'presaleStarted'
 const checkIfPresaleStarted = async () => {
  try {
    // No need for the signer as we are  reading state from the blockchain
    const provider = await getProviderOrSigner();
    const nftContract = new Contract(NFT_CONTRACT_ADDRESS, abi, provider)
    // call the presaleStarted from the contract
    const _presaleStarted = await nftContract.presaleStarted();

    if (!_presaleStarted) {
      await getOwner();
    }
    setPresaleStarted(_presaleStarted);
    return _presaleStarted;
  } catch (err) { 
    console.error (err);
    return false;
  }
 };

 // Checks if the presaleEnded 

 const checkIfPresaleEnded = async () => {
  try {

    const provider = await getProviderOrSigner();
    const nftContract = new Contract(NFT_CONTRACT_ADDRESS, abi, provider);
    const _presaleEnded = await nftContract.presaleEnded();

    const hasEnded = _presaleEnded.lt(Math.floor(Date.now()/ 1000));

    if (hasEnded) {
      setPresaleEnded(true);
    } else {
      setPresaleEnded(false);
    }
    return hasEnded;
  } catch (err) {
    console.error(err);
    return false;
  }
 };

 // getOwner: calls the contract to retrieve the owner

 const getOwner = async () => {
  try{
    const provider = await getProviderOrSigner();
    const nftContract = new Contract(NFT_CONTRACT_ADDRESS, abi, provider);
    // call the owner function from the contract
    const _owner = await nftContract.owner();
    // get the signer to extract the address of the currently connected Metamask account
    const signer = await getProviderOrSigner(true);
    // get the address associated to the signer which is connected to Metamask
    const address = await signer.getAddress();

    if (address.toLowerCase() === _owner.toLowerCase()){
      setIsOwner(true);
    }
  } catch (err) {
    console.error(err.message);
  }
 }; 

 // gets the number of tokenIds that have been minted

 const getTokenIdsMinted = async () => {
  try {
    const provider = await getProviderOrSigner();

    const nftContract = new Contract(NFT_CONTRACT_ADDRESS, abi, provider);
    // call the tokenIds from the contract
    const _tokenIds = await nftContract.tokenIds();
    setTokenIdsMinted(_tokenIds.toString());
  } catch (err) {
    console.error(err)
  }
 };


/**
   * Returns a Provider or Signer object representing the Ethereum RPC with or without the
   * signing capabilities of metamask attached
   *
   * A `Provider` is needed to interact with the blockchain - reading transactions, reading balances, reading state, etc.
   *
   * A `Signer` is a special type of Provider used in case a `write` transaction needs to be made to the blockchain, which involves the connected account
   * needing to make a digital signature to authorize the transaction being sent. Metamask exposes a Signer API to allow your website to
   * request signatures from the user using Signer functions.
   *
   * @param {*} needSigner - True if you need the signer, default false otherwise
   */
 const getProviderOrSigner = async (needSigner = false) => {
  // Connect to Metamask
  // Since we store `web3Modal` as a reference, we need to access the `current` value to get access to the underlying object
  const provider = await web3ModalRef.current.connect();
  const web3Provider = new providers.Web3Provider(provider);

  // If user is not connected to the Goerli network, let them know and throw an error
  const { chainId } = await web3Provider.getNetwork();
  if (chainId !== 5) {
    window.alert("Change the network to Goerli");
    throw new Error("Change network to Goerli");
  }

  if (needSigner) {
    const signer = web3Provider.getSigner();
    return signer;
  }
  return web3Provider;
};
// useEffects are used to react to changes in state of the website
  // The array at the end of function call represents what state changes will trigger this effect
  // In this case, whenever the value of `walletConnected` changes - this effect will be called
  useEffect(() => {
    // if wallet is not connected, create a new instance of Web3Modal and connect the MetaMask wallet
    if (!walletConnected) {
      // Assign the Web3Modal class to the reference object by setting it's `current` value
      // The `current` value is persisted throughout as long as this page is open
      web3ModalRef.current = new Web3Modal({
        network: "goerli",
        providerOptions: {},
        disableInjectedProvider: false,
      });
      connectWallet();

      // Check if presale has started and ended
      const _presaleStarted = checkIfPresaleStarted();
      if (_presaleStarted) {
        checkIfPresaleEnded();
      }

      getTokenIdsMinted();

      // Set an interval which gets called every 5 seconds to check presale has ended
      const presaleEndedInterval = setInterval(async function () {
        const _presaleStarted = await checkIfPresaleStarted();
        if (_presaleStarted) {
          const _presaleEnded = await checkIfPresaleEnded();
          if (_presaleEnded) {
            clearInterval(presaleEndedInterval);
          }
        }
      }, 5 * 1000);

      // set an interval to get the number of token Ids minted every 5 seconds
      setInterval(async function () {
        await getTokenIdsMinted();
      }, 5 * 1000);
    }
  }, [walletConnected]);

  /*
      renderButton: Returns a button based on the state of the dapp
    */
  const renderButton = () => {
    // If wallet is not connected, return a button which allows them to connect their wallet
    if (!walletConnected) {
      return (
        <button onClick={connectWallet} className={styles.button}>
          Connect your wallet
        </button>
      );
    }

    // If we are currently waiting for something, return a loading button
    if (loading) {
      return <button className={styles.button}>Loading...</button>;
    }

    // If connected user is the owner, and presale hasn't started yet, allow them to start the presale
    if (isOwner && !presaleStarted) {
      return (
        <button className={styles.button} onClick={startPresale}>
          Start Presale!
        </button>
      );
    }

    // If connected user is not the owner but presale hasn't started yet, tell them that
    if (!presaleStarted) {
      return (
        <div>
          <div className={styles.description}>Presale hasn&#39;t started!</div>
        </div>
      );
    }

    // If presale started, but hasn't ended yet, allow for minting during the presale period
    if (presaleStarted && !presaleEnded) {
      return (
        <div>
          <div className={styles.description}>
            Presale has started!!! If your address is whitelisted, Mint a Crypto
            Dev 🥳
          </div>
          <button className={styles.button} onClick={presaleMint}>
            Presale Mint 🚀
          </button>
        </div>
      );
    }

    // If presale started and has ended, it's time for public minting
    if (presaleStarted && presaleEnded) {
      return (
        <button className={styles.button} onClick={publicMint}>
          Public Mint 🚀
        </button>
      );
    }
  };
  return (
    <div>
      <Head>
        <title>Crypto Devs</title>
        <meta name="description" content="Whitelist-Dapp" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className={styles.main}>
        <div>
          <h1 className={styles.title}>Welcome to Crypto Devs!</h1>
          <div className={styles.description}>
            It&#39;s an NFT collection for developers in Crypto.
          </div>
          <div className={styles.description}>
            {tokenIdsMinted}/20 have been minted
          </div>
          {renderButton()}
        </div>
        <div>
          <img className={styles.image} src="./cryptodevs/0.svg" />
        </div>
      </div>

      <footer className={styles.footer}>
        Made with &#10084; by Crypto Devs
      </footer>
    </div>
  );

}