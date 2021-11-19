# Arwank

A collaborative blogging platform using Arweave.


### To do list
- [x] Set up wallet import
- [x] Create story editor
- [x] Allow publishing to arweave
- [x] Implement gallery
- [x] Connect Wallet
- [x] When publish, change contract
- [x] Build contract to set pointer
- [x] Have gallery use pointer from contract
- [x] Implement story page
- [x] Allow editing off of others
- [ ] Store contributors for each story
    - [x] Change current contract to PDA
    - Change contract to enable new storage through PDAs
    - Change frontend to
        1. create/(get + add) to list of contributors
        2. publish that to arweave
        3. create an account for that transaction with pointer to that list
- [ ] Refactor - no blockchain
    - [ ] Reformat posts
        - contributors and their sections
        - title is agnostic
        - List of contributors if someone just wants to republish?
    - [ ] Reformat gallery - arql



- [ ] Tip contributors button as pre-nft functionality
- [ ] Include preview metadata in pointer
- [ ] Move wallet login to global state
- [ ] Style
- [ ] Don't hold entirety of story data in memory?
- [ ] Minting NFTs! -> compensate history of contributors
- [ ] Redesign architecture - validate txids