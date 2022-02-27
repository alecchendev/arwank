# Arwank
### Description

A collaborative storytelling platform on Arweave. Create stories, post to Arweave. Fork stories and add your own contribution. See who contributed what, and go to those previous versions.

### Links

Current deployment on Arweave:

[https://6uqwm4yb52afiiycvjrh3itn7iiddaqdobya7f6oqi6unjmudacq.arweave.net/9SFmcwHugFQjAqpifaJt-hAxggNwcA-XzoI9RqWUGAU/#/](https://6uqwm4yb52afiiycvjrh3itn7iiddaqdobya7f6oqi6unjmudacq.arweave.net/9SFmcwHugFQjAqpifaJt-hAxggNwcA-XzoI9RqWUGAU/#/)

### Bug fixes

- Clicking on section of post doesn't work - fix navigation

### Wanna pick up this project? Here are some places to get started:

- Your stories page
    - Move wallet login to global state
    - Create a new page where you can see you're stories
        - How to store/get stories for a specific account? 1) Add "latest-contributor" tag to stories when you post 2) fetch stories by "latest-contributor" tag using arweave graphql api
- Mint nfts with solana - have payment go to full history of contributors
    - Move all payment to solana - from what I know, there's a way to convert solana to ar automatically
    - Create contract using candy machine/metaplex something
- Let people take down stories from being shown in gallery
    - Once published stories are permanent on arweave, but don't have to be shown in the gallery
    - Let owner of post take down
    - How? idk honestly

### (OLD) To do list
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