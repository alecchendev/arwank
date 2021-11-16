const anchor = require('@project-serum/anchor');
const { BN } = require('bn.js');

const { SystemProgram } = anchor.web3;

// describe('arwank', () => {
const main = () => {
  // Configure the client to use the local cluster.
  const provider = anchor.Provider.env();
  anchor.setProvider(provider);

  it('Is initialized!', async () => {
    // Add your test here.
    // const program = anchor.workspace.Arwank;
    const idl = JSON.parse(require('fs').readFileSync('./target/idl/arwank.json', 'utf8'));

    // Address of the deployed program.
    const programIdLiteral = '4drqYMg65f9Rwy8fZPFqZY8EKT5vASG9UDShizaym9MS';
    const programId = new anchor.web3.PublicKey(programIdLiteral);

    // Generate the program client from IDL.
    const program = new anchor.Program(idl, programId);

    // const baseAccount = anchor.web3.Keypair.generate();
    const [baseAccount, baseAccountBump] = await anchor.web3.PublicKey.findProgramAddress(
      [Buffer.from("base_account")],
      programId
    )
    // const createTx = await program.rpc.initialize(new BN(baseAccountBump), {
    //   accounts: {
    //     // baseAccount: baseAccount.publicKey,
    //     baseAccount: baseAccount,
    //     user: provider.wallet.publicKey,
    //     systemProgram: SystemProgram.programId,
    //   },
    //   // signers: [baseAccount],
    // });
    // console.log("Your transaction signature", createTx);

    // let account = await program.account.baseAccount.fetch(baseAccount.publicKey);
    let account = await program.account.baseAccount.fetch(baseAccount);
    console.log('Pointer 1: ', account.data.toString());

    const newPointer = "asdf";
    const setTx = await program.rpc.setPointer(newPointer, {
      accounts: {
        // baseAccount: baseAccount.publicKey,
        baseAccount: baseAccount,
      },
    });

    // account = await program.account.baseAccount.fetch(baseAccount.publicKey);
    account = await program.account.baseAccount.fetch(baseAccount);
    console.log('Pointer 1: ', account.data.toString());

    const storySeed = "qwerty";
    const [storyAccount, storyAccountBump] = await anchor.web3.PublicKey.findProgramAddress(
      [Buffer.from(storySeed)],
      programId
    )
    let pubTx = await program.rpc.publish(new BN(storyAccountBump), storySeed, "newPointerblahblah", {
      accounts: {
        // baseAccount: baseAccount.publicKey,
        storyAccount: storyAccount,
        user: provider.wallet.publicKey,
        systemProgram: SystemProgram.programId,
        baseAccount: baseAccount,
      }
    });

    let storyAccGet = await program.account.storyAccount.fetch(storyAccount);
    console.log('contrib pointer:', storyAccGet.pointer.toString());

    account = await program.account.baseAccount.fetch(baseAccount);
    console.log('Pointer 2: ', account.data.toString());

  });
// });
}

main();
