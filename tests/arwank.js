const anchor = require('@project-serum/anchor');

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

    const baseAccount = anchor.web3.Keypair.generate();
    const createTx = await program.rpc.initialize({
      accounts: {
        baseAccount: baseAccount.publicKey,
        user: provider.wallet.publicKey,
        systemProgram: SystemProgram.programId,
      },
      signers: [baseAccount],
    });
    console.log("Your transaction signature", createTx);

    let account = await program.account.baseAccount.fetch(baseAccount.publicKey);
    console.log('Pointer 1: ', account.data.toString());

    const newPointer = "asdf";
    const setTx = await program.rpc.setPointer(newPointer, {
      accounts: {
        baseAccount: baseAccount.publicKey,
      },
    });

    account = await program.account.baseAccount.fetch(baseAccount.publicKey);
    console.log('Pointer 1: ', account.data.toString());
  });
// });
}

main();
