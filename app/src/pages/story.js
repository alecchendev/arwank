

import '../styles/home.css';
import { useState, useEffect } from 'react';
import { Link, useParams } from "react-router-dom";

import idl from '../data/idl.json';

import { Connection, PublicKey, clusterApiUrl} from '@solana/web3.js';
import {
  Program, Provider, web3
} from '@project-serum/anchor';
import kp from '../data/keypair.json'

// SystemProgram is a reference to the Solana runtime!
const { SystemProgram, Keypair } = web3;

// Create a keypair for the account that will hold the GIF data.
const arr = Object.values(kp._keypair.secretKey);
const secret = new Uint8Array(arr);
const baseAccount = web3.Keypair.fromSecretKey(secret);
// const baseAccount = web3.Keypair.generate();

// Get our program's id form the IDL file.
const programID = new PublicKey(idl.metadata.address);

// Set our network to devent.
const network = clusterApiUrl('devnet');
// const network = 'http://localhost:8899';

// Control's how we want to acknowledge when a trasnaction is "done".
const opts = {
  preflightCommitment: "processed" // can also "finalized"
}

const Story = ({ arweave }) => {

  const [ baseAccount, setBaseAccount ] = useState();
  const [ baseAccountBump, setBaseAccountBump ] = useState();

  const [ story, setStory ] = useState(null);

  const [ contributors, setContributors ] = useState(null);

  const [ hoveringContributor, setHoveringContributor ] = useState("");

  const [walletAddress, setWalletAddress] = useState(null);

  const { storyId } = useParams();

  const getProvider = () => {
    const connection = new Connection(network, opts.preflightCommitment);
    const provider = new Provider(
      connection, window.solana, opts.preflightCommitment,
    );
    return provider;
  }

   /*
   * This function holds the logic for deciding if a Phantom Wallet is
   * connected or not
   */
   const checkIfWalletIsConnected = async () => {
    try {
      const { solana } = window;

      if (solana) {
        if (solana.isPhantom) {
          console.log('Phantom wallet found!');
        }

        /*
         * The solana object gives us a function that will allow us to connect
         * directly with the user's wallet!
         */
        const response = await solana.connect({ onlyIfTrusted: true });
        console.log(
          'Connected with Public Key:',
          response.publicKey.toString()
        );

        /*
           * Set the user's publicKey in state to be used later!
           */
        setWalletAddress(response.publicKey.toString());

      } else {
        alert('Solana object not found! Get a Phantom Wallet 👻');
      }
    } catch (error) {
      console.error(error);
    }
  };

  /*
   * Let's define this method so our code doesn't break.
   * We will write the logic for this next!
   */
  const connectWallet = async () => {
    const { solana } = window;

    if (solana) {
      const response = await solana.connect();
      console.log('Connected with Public Key:', response.publicKey.toString());
      setWalletAddress(response.publicKey.toString());
    }
  };

  useEffect(async () => {

    const [ baseAccountTemp, baseAccountBumpTemp ] = await web3.PublicKey.findProgramAddress(
      [Buffer.from("base_account")],
      programID
    );
    setBaseAccount(baseAccountTemp);
    setBaseAccountBump(baseAccountBumpTemp);

    // Check wallet onload
    const onLoad = async () => {
      await checkIfWalletIsConnected();
    };
    window.addEventListener('load', onLoad);

    const dataStr = await arweave.transactions.getData(storyId, {decode: true, string: true});
    const data = JSON.parse(dataStr);
    console.log(data);
    setStory(data);
    setContributors(data.contributors); 
  }, [])

  return (
    <div className="app">

      <Link to="/">Home</Link>
      <Link to={"/edit/" + storyId}>Edit</Link>

      <div>
      {
        walletAddress
        ?
        <button>Connected</button>
        :
        <button onClick={connectWallet}>Connect Wallet</button>
      }
      </div>

      {
        story
        ?
        <div className="story-container">
          {
            contributors === null
            ?
            <p>Loading contributors...</p>
            :
            <div>
              <h3>Contributors:</h3>
              {Object.entries(contributors).map(([index, addr]) => <p className={hoveringContributor === (addr + index) ? "highlight" : ""} onMouseEnter={() => setHoveringContributor(addr + index)}
            onMouseLeave={() => setHoveringContributor("")}>{addr}</p>)}
            </div>
          }
          <h2>{story.title}</h2>
          {
            Object.entries(story.content).map(([index, section]) => {
              return (<p className={hoveringContributor === (section.contributor + index) ? "highlight" : ""} onMouseEnter={() => setHoveringContributor(section.contributor + index)} onMouseLeave={() => setHoveringContributor("")}>{section.text}</p>)
            })
          }
        </div>
        :
        <p>Loading...</p>
      }
      
    </div>
  );
}

export default Story;
